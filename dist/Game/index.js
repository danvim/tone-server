"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapGen_1 = require("./MapGen");
var lib_1 = require("tone-core/dist/lib");
var Game = /** @class */ (function () {
    function Game(players, protocol) {
        var _this = this;
        this.mapConnToPlayer = function (conn) {
            return _this.players.reduce(function (prev, player) {
                if (conn.peer == player.conn.peer)
                    prev = player;
                return prev;
            });
        };
        this.initProtocol = function (protocol) {
            // protocol.on(PackageType.TRY_BUILD,);
        };
        this.frame = function () {
            _this.moveAllEntitiesAndUnits();
        };
        this.moveAllEntitiesAndUnits = function () {
            var time = 1;
            for (var uuid in _this.entities) {
                var entity = _this.entities[uuid];
                entity.position.add(entity.velocity.scale(time));
                var _a = entity.position.asArray, x = _a[0], z = _a[1];
                _this.protocol.emit(lib_1.PackageType.MOVE_ENTITY, { uuid: uuid, x: x, y: 5, z: z });
            }
        };
        this.players = players;
        this.protocol = protocol;
        this.map = MapGen_1.MapGen();
        console.log('try update tiles');
        protocol.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
        this.buildings = {};
        this.entities = {};
        this.units = {};
    }
    Game.prototype.test = function () { };
    return Game;
}());
exports.Game = Game;
