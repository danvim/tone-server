"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapGen_1 = require("./MapGen");
var lib_1 = require("tone-core/dist/lib");
var timers_1 = require("timers");
var Helpers_1 = require("../Helpers");
var SpawnPoint_1 = require("./Building/SpawnPoint");
var Base_1 = require("./Building/Base");
var BuildingFactory_1 = require("./Building/BuildingFactory");
// import { protocol } from '../Connection';
var Game = /** @class */ (function () {
    // game start
    function Game(players, protocol) {
        var _this = this;
        this.playerClaimTile = {};
        this.workerJobs = {};
        // states
        this.prevTicks = 0;
        this.build = function (object, conn) {
            var player = _this.mapConnToPlayer(conn);
            if (player) {
                var _a = Object(object), buildingType = _a.buildingType, axialCoords = _a.axialCoords;
                var canBuild = axialCoords.reduce(function (flag, axial) {
                    return (flag &&
                        _this.playerClaimTile[player.id][axial.asString] &&
                        Object.values(_this.myBuildings(player.id)).findIndex(function (building) {
                            return building.tilePosition.asString === axial.asString;
                        }) === -1);
                }, true);
                if (!canBuild) {
                    return false;
                }
                var axialCoord = void 0;
                if (axialCoords.length > 1) {
                    axialCoord = axialCoords.reduce(function (carry, axial) { return carry.add(axial); }, axialCoords[0].clone());
                }
                else if (axialCoords.length > 0) {
                    axialCoord = axialCoords[0];
                }
                BuildingFactory_1.buildingFactory(_this, player.id, buildingType, axialCoord);
                return true;
            }
            return false;
        };
        this.players = [];
        this.protocol = protocol;
        this.map = MapGen_1.MapGen();
        // global.console.log('try update tiles');
        this.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
        this.buildings = {};
        this.entities = {};
        this.units = {};
        this.bases = {};
        this.reassignPlayerId(players);
        this.initClusterTiles();
        this.initBase();
        this.evaluateTerritory();
        this.frameTimer = timers_1.setInterval(function () { return _this.frame(_this.prevTicks, Helpers_1.now('ms')); }, 100);
    }
    // connection functions
    Game.prototype.emit = function (packageType, object) {
        if (this.protocol) {
            this.protocol.emit(packageType, object);
        }
    };
    Game.prototype.mapConnToPlayer = function (conn) {
        return this.players.find(function (player) { return !!player.conn && conn.peer === player.conn.peer; });
    };
    Game.prototype.initProtocol = function (protocol) {
        protocol.on(lib_1.PackageType.TRY_BUILD, this.build);
    };
    Game.prototype.rejoin = function (player) {
        player.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
    };
    // game logic functions
    Game.prototype.terminate = function () {
        if (this.frameTimer) {
            clearInterval(this.frameTimer);
        }
    };
    /**
     * Make the id of players start from 0 without holes
     */
    Game.prototype.reassignPlayerId = function (players) {
        var _this = this;
        players.forEach(function (player, k) {
            _this.players[player.id] = player;
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
                var cluster = new SpawnPoint_1.SpawnPoint(_this, playerId, lib_1.Axial.fromString(axialString));
            }
        });
    };
    Game.prototype.initBase = function () {
        var _this = this;
        var locations = [
            new lib_1.Axial(0, 0),
            new lib_1.Axial(10, 0),
            new lib_1.Axial(10, 10),
            new lib_1.Axial(0, 10),
        ];
        this.players.forEach(function (player, k) {
            var base0 = new Base_1.Base(_this, player.id, locations[k]);
            _this.bases[player.id] = base0;
        });
    };
    Game.prototype.evaluateTerritory = function () {
        var _this = this;
        this.playerClaimTile = {};
        this.players.forEach(function (player, k) {
            _this.playerClaimTile[player.id] = {};
            _this.claimTile(player.id, _this.bases[player.id].tilePosition, _this.bases[player.id].territoryRadius);
        });
        Object.values(this.buildings).forEach(function (building) {
            if (building.buildingType === lib_1.BuildingType.RECLAIMATOR) {
                _this.claimTile(building.player.id, building.tilePosition, building.territoryRadius);
            }
        });
    };
    Game.prototype.myBuildings = function (playerId) {
        var buildings = {};
        for (var key in this.buildings) {
            if (this.buildings[key].playerId === playerId) {
                buildings[key] = this.buildings[key];
            }
        }
        return buildings;
    };
    Game.prototype.opponentBuildings = function (playerId) {
        var buildings = {};
        for (var key in this.buildings) {
            if (this.buildings[key].playerId !== playerId) {
                buildings[key] = this.buildings[key];
            }
        }
        return buildings;
    };
    Game.prototype.myEntities = function (playerId) {
        var entities = {};
        for (var key in this.entities) {
            if (this.entities[key].playerId === playerId) {
                entities[key] = this.entities[key];
            }
        }
        return entities;
    };
    Game.prototype.opponentEntities = function (playerId) {
        var entities = {};
        for (var key in this.entities) {
            if (this.entities[key].playerId !== playerId) {
                entities[key] = this.entities[key];
            }
        }
        return entities;
    };
    Game.prototype.myUnits = function (playerId) {
        var units = {};
        for (var key in this.units) {
            if (this.units[key].playerId === playerId) {
                units[key] = this.units[key];
            }
        }
        return units;
    };
    Game.prototype.opponentUnits = function (playerId) {
        var units = {};
        for (var key in this.units) {
            if (this.units[key].playerId !== playerId) {
                units[key] = this.units[key];
            }
        }
        return units;
    };
    Game.prototype.claimTile = function (playerId, axialLocation, radius) {
        var _this = this;
        axialLocation.range(radius).forEach(function (axial) {
            _this.playerClaimTile[playerId][axial.asString] = true;
        });
    };
    Game.prototype.isTileClaimedBy = function (playerId, axialLocation) {
        return this.playerClaimTile[playerId][axialLocation.asString] || false;
    };
    Game.prototype.frame = function (prevTicks, currTicks) {
        var _this = this;
        // if (currTicks <= prevTicks) {
        //   return; // ignore invalid ticks
        // }
        Object.keys(this.buildings).forEach(function (key) {
            var building = _this.buildings[key];
            building.frame(prevTicks, currTicks);
        });
        Object.keys(this.entities).forEach(function (key) {
            var entity = _this.entities[key];
            entity.frame(prevTicks, currTicks);
            var _a = entity.position.asArray, x = _a[0], z = _a[1];
            var _b = entity.velocity.asArray, vx = _b[0], vz = _b[1];
            _this.emit(lib_1.PackageType.MOVE_ENTITY, {
                uid: entity.uuid,
                location: { x: x, y: 5, z: z },
                yaw: 0,
                pitch: 0,
                velocity: { x: vx, y: 0, z: vz },
            });
        });
        this.prevTicks = currTicks;
    };
    Game.prototype.test = function () {
        //
    };
    return Game;
}());
exports.Game = Game;
