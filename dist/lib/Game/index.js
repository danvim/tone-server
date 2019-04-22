"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapGen_1 = require("./MapGen");
var lib_1 = require("tone-core/dist/lib");
var Building_1 = require("./Building");
var timers_1 = require("timers");
var Helpers_1 = require("../Helpers");
var uuid = require("uuid");
// import { protocol } from '../Connection';
var Game = /** @class */ (function () {
    // game start
    function Game(players, protocol) {
        var _this = this;
        // states
        this.prevTicks = 0;
        this.players = players;
        this.protocol = protocol;
        this.map = MapGen_1.MapGen();
        // global.console.log('try update tiles');
        this.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
        this.buildings = {};
        this.entities = {};
        this.units = {};
        this.reassignPlayerId();
        this.initClusterTiles();
        this.frameTimer = timers_1.setInterval(function () { return _this.frame(_this.prevTicks, Helpers_1.now('ms')); }, 30);
    }
    // connection functions
    Game.prototype.emit = function (packageType, object) {
        if (this.protocol) {
            this.protocol.emit(packageType, object);
        }
    };
    Game.prototype.mapConnToPlayer = function (conn) {
        return this.players.reduce(function (prev, player) {
            if (player.conn && conn.peer === player.conn.peer) {
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
    // game logic functions
    Game.prototype.terminate = function () {
        clearInterval(this.frameTimer);
    };
    /**
     * Make the id of players start from 0 without holes
     */
    Game.prototype.reassignPlayerId = function () {
        var _this = this;
        this.players.forEach(function (player, k) {
            player.id = k;
            _this.emit(lib_1.PackageType.UPDATE_LOBBY, {
                playerId: k,
                username: player.username,
                connId: player.conn && player.conn.peer,
            });
        });
    };
    /**
     * assign clusters to players
     */
    Game.prototype.initClusterTiles = function () {
        var _this = this;
        var initedClusterCount = 0;
        Object.keys(this.map).forEach(function (axialString) {
            var tileInfo = _this.map[axialString];
            if (tileInfo.type === lib_1.TileType.INFORMATION_CLUSTER) {
                var playerId = initedClusterCount++;
                var _a = axialString.split(',').map(Number), q = _a[0], r = _a[1];
                var cluster = new Building_1.Building(_this, playerId, lib_1.BuildingType.SPAWN_POINT, new lib_1.Axial(q, r));
                _this.buildings[cluster.uuid] = cluster;
            }
        });
    };
    Game.prototype.frame = function (prevTicks, currTicks) {
        var _this = this;
        Object.keys(this.buildings).forEach(function (key) {
            var building = _this.buildings[key];
            building.frame(prevTicks, currTicks);
        });
        Object.keys(this.entities).forEach(function (key) {
            var entity = _this.entities[key];
            entity.frame(prevTicks, currTicks);
            var _a = entity.position.asArray, x = _a[0], z = _a[1];
            _this.emit(lib_1.PackageType.MOVE_ENTITY, { uuid: uuid, x: x, y: 5, z: z });
        });
        this.prevTicks = currTicks;
    };
    Game.prototype.test = function () {
        //
    };
    return Game;
}());
exports.Game = Game;
