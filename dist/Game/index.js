"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapGen_1 = require("./MapGen");
var lib_1 = require("tone-core/dist/lib");
var Game = /** @class */ (function () {
    function Game(players, protocol) {
        this.players = players;
        this.protocol = protocol;
        this.map = MapGen_1.MapGen();
        protocol.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
    }
    Game.prototype.test = function () { };
    return Game;
}());
exports.Game = Game;
