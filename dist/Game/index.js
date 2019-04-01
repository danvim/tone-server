"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapGen_1 = require("./MapGen");
var lib_1 = require("tone-core/dist/lib");
var Game = /** @class */ (function () {
    function Game(players, protocol) {
        this.players = players;
        this.protocol = protocol;
        this.map = MapGen_1.MapGen();
        global.console.log('try update tiles');
        protocol.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
        this.buildings = {};
        this.entities = {};
        this.units = {};
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
    Game.prototype.frame = function () {
        this.moveAllEntitiesAndUnits();
    };
    Game.prototype.moveAllEntitiesAndUnits = function () {
        var _this = this;
        var time = 1;
        Object.keys(this.entities).forEach(function (uuid) {
            var entity = _this.entities[uuid];
            entity.position.add(entity.velocity.scale(time));
            var _a = entity.position.asArray, x = _a[0], z = _a[1];
            _this.protocol.emit(lib_1.PackageType.MOVE_ENTITY, { uuid: uuid, x: x, y: 5, z: z });
        });
    };
    Game.prototype.test = function () {
        //
    };
    return Game;
}());
exports.Game = Game;
