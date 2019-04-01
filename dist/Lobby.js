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
        this.initProtocol = function (protocol) {
            protocol.on(lib_1.PackageType.TRY_JOIN_LOBBY, function (obj, conn) {
                return _this.join(obj.username, conn);
            });
            protocol.on(lib_1.PackageType.TRY_START_GAME, _this.tryStart);
            _this.protocol = protocol;
        };
        this.isUsernameExist = function (username) {
            return (_this.players.filter(function (player) { return player.username === username; }).length > 0);
        };
        this.isConnExist = function (conn) {
            return (_this.players.filter(function (player) { return player.conn.peer === conn.peer; }).length > 0);
        };
        this.playerUpdateConn = function (username, conn) {
            var id = -1;
            _this.players.forEach(function (player) {
                if (player.username == username) {
                    player.conn = conn;
                    id = player.id;
                }
            });
            return id;
        };
        this.playerUpdateUsername = function (username, conn) {
            var connId = conn.peer;
            var id = -1;
            _this.players.forEach(function (player) {
                if (player.conn.peer == connId) {
                    player.username = username;
                    id = player.id;
                }
            });
            return id;
        };
        this.join = function (username, conn) {
            console.log(username + ' ' + conn.peer + ' attemp to join');
            if (_this.isUsernameExist(username)) {
                var playerId = _this.playerUpdateConn(username, conn);
                playerId !== -1 &&
                    _this.protocol.emit(lib_1.PackageType.UPDATE_LOBBY, {
                        username: username,
                        playerId: playerId,
                        connId: conn.peer,
                    });
            }
            else if (_this.isConnExist(conn)) {
                var playerId = _this.playerUpdateUsername(username, conn);
                playerId !== -1 &&
                    _this.protocol.emit(lib_1.PackageType.UPDATE_LOBBY, {
                        username: username,
                        playerId: playerId,
                        connId: conn.peer,
                    });
            }
            else {
                if (_this.started) {
                    //reject
                    return;
                }
                else {
                    var player = new Player_1.Player(conn);
                    player.username = username;
                    player.id = _this.genPlayerId();
                    _this.players.push(player);
                    _this.protocol.emit(lib_1.PackageType.UPDATE_LOBBY, {
                        username: username,
                        playerId: player.id,
                        connId: conn.peer,
                    });
                }
            }
        };
        //logic: first ascending sort, then increment until see a gap or reach last of list(id of player length)
        this.genPlayerId = function () {
            _this.players.sort(function (a, b) { return a.id - b.id; });
            return _this.players.reduce(function (prev, player) { return (player.id === prev ? prev + 1 : prev); }, 0);
        };
        this.tryStart = function () {
            if (!_this.started) {
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
    return Lobby;
}());
exports.Lobby = Lobby;
