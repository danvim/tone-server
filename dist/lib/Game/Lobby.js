"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = require("./Player");
var lib_1 = require("tone-core/dist/lib");
var _1 = require(".");
var Lobby = /** @class */ (function () {
    // protocol: Protocol;
    function Lobby(protocol) {
        this.started = false;
        this.players = [];
        this.protocol = protocol;
        this.initProtocol(protocol);
    }
    Lobby.prototype.initProtocol = function (protocol) {
        var _this = this;
        protocol.on(lib_1.PackageType.TRY_JOIN_LOBBY, function (obj, conn) {
            _this.join(Object(obj).username, conn);
        });
        protocol.on(lib_1.PackageType.TRY_START_GAME, this.tryStart.bind(this));
        this.protocol = protocol;
    };
    Lobby.prototype.isUsernameExist = function (username) {
        return (this.players.filter(function (player) { return player.username === username; }).length > 0);
    };
    Lobby.prototype.isConnExist = function (conn) {
        return (this.players.filter(function (player) { return player.conn && player.conn.peer === conn.peer; }).length > 0);
    };
    Lobby.prototype.playerUpdateConn = function (username, conn) {
        var id = -1;
        this.players.forEach(function (player) {
            if (player.username === username) {
                player.conn = conn;
                id = player.id;
            }
        });
        return id;
    };
    Lobby.prototype.playerUpdateUsername = function (username, conn) {
        var connId = conn.peer;
        var id = -1;
        this.players.forEach(function (player) {
            if (player.conn && player.conn.peer === connId) {
                player.username = username;
                id = player.id;
            }
        });
        return id;
    };
    Lobby.prototype.join = function (username, conn) {
        global.console.log(username + ' ' + conn.peer + ' attemp to join');
        if (this.isUsernameExist(username)) {
            var playerId_1 = this.playerUpdateConn(username, conn);
            if (playerId_1 === -1) {
                return;
            }
            var player = this.players.find(function (player) { return player.id === playerId_1; });
            this.protocol.emit(lib_1.PackageType.UPDATE_LOBBY, {
                username: username,
                playerId: playerId_1,
                connId: conn.peer,
            });
            if (this.started && this.game && player) {
                this.game.rejoin(player);
            }
        }
        else if (this.isConnExist(conn)) {
            var playerId = this.playerUpdateUsername(username, conn);
            if (playerId === -1) {
                return;
            }
            this.protocol.emit(lib_1.PackageType.UPDATE_LOBBY, {
                username: username,
                playerId: playerId,
                connId: conn.peer,
            });
        }
        else {
            if (this.started) {
                // reject
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
    };
    // logic: first ascending sort, then increment until see a gap or reach last of list(id of player length)
    Lobby.prototype.genPlayerId = function () {
        this.players.sort(function (a, b) { return a.id - b.id; });
        return this.players.reduce(function (prev, player) { return (player.id === prev ? prev + 1 : prev); }, 0);
    };
    Lobby.prototype.tryStart = function () {
        if (!this.started) {
            global.console.log('gamestart', this.players.map(function (player) { return ({
                username: player.username,
                id: player.id,
            }); }));
            this.started = true;
            this.protocol.emit(lib_1.PackageType.START_GAME, {});
            this.game = new _1.Game(this.players, this.protocol);
        }
    };
    return Lobby;
}());
exports.Lobby = Lobby;
