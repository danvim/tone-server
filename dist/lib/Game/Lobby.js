"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = require("./Player");
var lib_1 = require("tone-core/dist/lib");
var _1 = require(".");
var Robot_1 = __importDefault(require("../Robot"));
var Lobby = /** @class */ (function () {
    function Lobby() {
        this.players = [];
        this.started = false;
        this.protocol = Robot_1.default.getInstance().getProtocol();
        this.initProtocol();
    }
    Lobby.prototype.initProtocol = function () {
        var _this = this;
        this.protocol.on(lib_1.PackageType.TRY_JOIN_LOBBY, function (obj, conn) {
            _this.join(Object(obj).username, conn);
        });
        this.protocol.on(lib_1.PackageType.TRY_START_GAME, this.tryStart.bind(this));
    };
    Lobby.prototype.isUsernameExist = function (username) {
        return (this.players.filter(function (player) { return player.username === username; })
            .length > 0);
    };
    Lobby.prototype.isConnExist = function (conn) {
        return (this.players.filter(function (player) { return player.conn && player.conn.peer === conn.peer; }).length > 0);
    };
    /**
     * Checks if a given username is among the existing players. If so, updates the stored connection to the new incoming
     * connection. If the player exists, return its player id.
     * @param {string} username User input username
     * @param {DataChannelEventHandler} conn Incoming data connection
     */
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
        global.console.log(username + " " + conn.peer + " attempts to join");
        var joiningPlayer;
        if (this.isUsernameExist(username)) {
            // The username was in game/lobby before. Assuming player is rejoining with a different connection.
            var playerId_1 = this.playerUpdateConn(username, conn);
            if (playerId_1 === -1) {
                return;
            }
            joiningPlayer = this.players.find(function (p) { return p.id === playerId_1; });
            if (this.started && this.game && joiningPlayer) {
                this.game.rejoin(joiningPlayer);
            }
        }
        else if (this.isConnExist(conn)) {
            // The connection was in game/lobby before. Assuming player is rejoining with a different username.
            var playerId_2 = this.playerUpdateUsername(username, conn);
            if (playerId_2 === -1) {
                return;
            }
            joiningPlayer = this.players.find(function (p) { return p.id === playerId_2; });
        }
        else {
            // Player is new to the game/lobby.
            if (!this.started) {
                joiningPlayer = new Player_1.Player(conn);
                joiningPlayer.username = username;
                joiningPlayer.id = this.genPlayerId();
                this.players.push(joiningPlayer);
            }
            else {
                // TODO Perhaps emit an error here for the client.
                return;
            }
        }
        if (joiningPlayer !== undefined) {
            // Send other player info to joining player.
            this.players.forEach(function (player) {
                if (joiningPlayer && player !== joiningPlayer) {
                    joiningPlayer.emit(lib_1.PackageType.UPDATE_LOBBY, {
                        username: player.username,
                        playerId: player.id,
                        connId: player.conn.peer,
                    });
                }
            });
            // Send joining player info to all players.
            this.protocol.emit(lib_1.PackageType.UPDATE_LOBBY, {
                username: joiningPlayer.username,
                playerId: joiningPlayer.id,
                connId: conn.peer,
            });
        }
    };
    // logic: first ascending sort, then increment until see a gap or reach last of list(id of player length)
    Lobby.prototype.genPlayerId = function () {
        this.players.sort(function (a, b) { return a.id - b.id; });
        return this.players.reduce(function (prev, player) { return (player.id === prev ? prev + 1 : prev); }, 0);
    };
    Lobby.prototype.tryStart = function () {
        if (!this.started) {
            global.console.log('game start', this.players.map(function (player) { return ({
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
