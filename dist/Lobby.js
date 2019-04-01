"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = require("./Player");
var lib_1 = require("tone-core/dist/lib");
var Game_1 = require("./Game");
var Lobby = /** @class */ (function () {
    // protocol: Protocol;
    function Lobby(protocol) {
        var _this = this;
        this.started = false;
        this.tryStart = function () {
            if (!_this.started) {
                console.log(_this.players);
                console.log('gamestart', _this.players.map(function (player) { return ({
                    username: player.username,
                    id: player.id,
                }); }));
                _this.started = true;
                _this.protocol.emit(lib_1.PackageType.START_GAME, {});
                _this.game = new Game_1.Game(_this.players, _this.protocol);
            }
        };
        this.players = [];
        this.protocol = protocol;
        this.initProtocol(protocol);
    }
    Lobby.prototype.initProtocol = function (protocol) {
        var _this = this;
        protocol.on(lib_1.PackageType.TRY_JOIN_LOBBY, function (obj, conn) {
            return _this.join(obj.username, conn);
        });
        protocol.on(lib_1.PackageType.TRY_START_GAME, this.tryStart);
        this.protocol = protocol;
    };
    Lobby.prototype.isUsernameExist = function (username) {
        return (this.players.filter(function (player) { return player.username === username; }).length > 0);
    };
    Lobby.prototype.playerUpdateConn = function (username, conn) {
        var id = -1;
        this.players.forEach(function (player) {
            if (player.username == username) {
                player.conn = conn;
                id = player.id;
            }
        });
        return id;
    };
    Lobby.prototype.join = function (username, conn) {
        console.log(username + ' attemp to join');
        console.log(this.players);
        if (this.isUsernameExist(username)) {
            var playerId = this.playerUpdateConn(username, conn);
            playerId !== -1 &&
                this.protocol.emit(lib_1.PackageType.UPDATE_LOBBY, {
                    username: username,
                    playerId: playerId,
                    connId: conn.peer,
                });
        }
        else {
            if (this.started) {
                //reject
                return;
            }
            else {
                var player = new Player_1.Player(conn);
                player.username = username;
                player.id = this.genPlayerId();
                this.players.push(player);
                this.protocol.emit(lib_1.PackageType.UPDATE_LOBBY, {
                    username: username,
                    playerId: player.id,
                    connId: conn.peer,
                });
            }
        }
        console.log(this.players);
    };
    //logic: first ascending sort, then increment until see a gap or reach last of list(id of player length)
    Lobby.prototype.genPlayerId = function () {
        this.players.sort(function (a, b) { return a.id - b.id; });
        return this.players.reduce(function (prev, player) { return (player.id === prev ? prev + 1 : prev); }, 0);
    };
    return Lobby;
}());
exports.Lobby = Lobby;
