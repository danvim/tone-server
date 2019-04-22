"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapGen_1 = require("./MapGen");
var lib_1 = require("tone-core/dist/lib");
var timers_1 = require("timers");
var Helpers_1 = require("../Helpers");
var Game = /** @class */ (function () {
    // game start
    function Game(players, protocol) {
        // states
        this.prevTicks = 0;
        this.players = players;
        this.protocol = protocol;
        this.map = MapGen_1.MapGen();
        global.console.log('try update tiles');
        protocol.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
        this.buildings = {};
        this.entities = {};
        this.units = {};
        timers_1.setInterval(this.frame.bind(this), 30);
    }
    Game.prototype.mapConnToPlayer = function (conn) {
        return this.players.reduce(function (prev, player) {
            if (conn.peer === player.conn.peer) {
                prev = player;
            }
            return prev;
        });
    };
    Game.prototype.initProtocol = function (protocol) {
        // protocol.on(PackageType.TRY_BUILD,);
    };
    Game.prototype.rejoin = function (player) {
        player.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
    };
    Game.prototype.frame = function () {
        var _this = this;
        var currTicks = Helpers_1.now('milli');
        var prevTicks = this.prevTicks;
        Object.keys(this.buildings).forEach(function (uuid) {
            var build = _this.buildings[uuid];
            build.frame(prevTicks, currTicks);
        });
        Object.keys(this.entities).forEach(function (uuid) {
            var entity = _this.entities[uuid];
            entity.frame(prevTicks, currTicks);
            var _a = entity.position.asArray, x = _a[0], z = _a[1];
            _this.protocol.emit(lib_1.PackageType.MOVE_ENTITY, { uuid: uuid, x: x, y: 5, z: z });
        });
        this.prevTicks = currTicks;
    };
    Game.prototype.test = function () {
        //
    };
    return Game;
}());
exports.Game = Game;
