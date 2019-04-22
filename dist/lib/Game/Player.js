"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("tone-core/dist/lib");
var Player = /** @class */ (function () {
    function Player(conn) {
        this.id = -1;
        this.username = '';
        this.humanPlayer = true;
        if (conn) {
            this.conn = conn;
        }
    }
    Player.prototype.emit = function (event, object) {
        if (this.conn) {
            this.conn.send(lib_1.Protocol.encode(event, object));
        }
    };
    return Player;
}());
exports.Player = Player;
