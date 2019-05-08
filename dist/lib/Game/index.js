"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapGen_1 = require("./MapGen");
var lib_1 = require("tone-core/dist/lib");
var timers_1 = require("timers");
var Helpers_1 = require("../Helpers");
var SpawnPoint_1 = require("./Building/SpawnPoint");
var Base_1 = require("./Building/Base");
var BuildingFactory_1 = require("./Building/BuildingFactory");
var StructGenerator_1 = require("./Building/StructGenerator");
var TrainingDataGenerator_1 = require("./Building/TrainingDataGenerator");
// import { protocol } from '../Connection';
var Game = /** @class */ (function () {
    // game start
    function Game(players, protocol, unitTest) {
        var _this = this;
        this.playerClaimTile = {};
        this.workerJobs = {};
        // states
        this.prevTicks = 0;
        this.build = function (object, conn) {
            var player = _this.mapConnToPlayer(conn);
            if (player) {
                var _a = Object(object), buildingType = _a.buildingType, axialCoords = _a.axialCoords;
                var canBuild = axialCoords.reduce(function (flag, ax) {
                    var axial = new lib_1.Axial(ax.q, ax.r);
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
                var a = new lib_1.Axial(axialCoord.q, axialCoord.r);
                BuildingFactory_1.buildingFactory(_this, player.id, buildingType, a);
                return true;
            }
            return false;
        };
        this.setJob = function (object, conn) {
            var _a = Object(object), jobId = _a.jobId, priority = _a.priority;
            var job = _this.workerJobs[jobId];
            var player = _this.mapConnToPlayer(conn);
            if (job && player) {
                if (job.playerId === player.id) {
                    job.priority = priority;
                    job.sendUpdateJob();
                }
            }
        };
        this.setFightingStyle = function (object, conn) {
            var _a = Object(object), barrackUid = _a.barrackUid, fightingStyle = _a.fightingStyle, targetUid = _a.targetUid;
            var player = _this.mapConnToPlayer(conn);
            if (_this.buildings[barrackUid] && player) {
                var building = _this.buildings[barrackUid];
                if (player.id === building.playerId &&
                    building.buildingType === lib_1.BuildingType.BARRACK) {
                    var barrack = building;
                    if (targetUid in _this.buildings) {
                        barrack.setFightingStyle(fightingStyle, _this.buildings[targetUid]);
                    }
                    else if (targetUid in _this.entities) {
                        barrack.setFightingStyle(fightingStyle, _this.entities[targetUid]);
                    }
                    else {
                        barrack.fightingStyle = fightingStyle;
                    }
                }
            }
        };
        var size = 20;
        this.players = [];
        this.protocol = protocol;
        this.map = MapGen_1.MapGen(size);
        console.log('map gen done');
        this.buildings = {};
        this.entities = {};
        this.units = {};
        this.bases = {};
        if (unitTest) {
            SpawnPoint_1.SpawnPoint.spawnPeriod = 2000;
            Base_1.Base.structGenPeriod = 2000;
            StructGenerator_1.StructGenerator.structGenPeriod = 1000;
            TrainingDataGenerator_1.TrainingDataGenerator.dataGenPeriod = 1000;
        }
        this.reassignPlayerId(players);
        this.initBase(size);
        console.log('init base');
        this.initClusterTiles(unitTest ? 0 : 10);
        console.log('init cluster');
        this.evaluateTerritory();
        this.initProtocol(protocol);
        if (!unitTest) {
            this.frameTimer = timers_1.setInterval(function () { return _this.frame(_this.prevTicks, Helpers_1.now('ms')); }, 60);
        }
        this.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
        console.log('emit');
    }
    // connection functions
    Game.prototype.emit = function (packageType, object) {
        if (this.protocol) {
            Object.values(this.players).forEach(function (player) {
                player.emit(packageType, object);
            });
        }
    };
    Game.prototype.mapConnToPlayer = function (conn) {
        return this.players.find(function (player) { return !!player.conn && conn.peer === player.conn.peer; });
    };
    Game.prototype.initProtocol = function (protocol) {
        protocol.on(lib_1.PackageType.TRY_BUILD, this.build);
        protocol.on(lib_1.PackageType.TRY_SET_JOB, this.setJob);
        protocol.on(lib_1.PackageType.TRY_SET_FIGHTING_STYLE, this.setFightingStyle);
    };
    Game.prototype.rejoin = function (player) {
        player.emit(lib_1.PackageType.UPDATE_TILES, { tiles: this.map });
        Object.values(this.buildings).forEach(function (building) {
            player.emit(lib_1.PackageType.BUILD, {
                playerId: building.playerId,
                uid: building.uuid,
                buildingType: building.buildingType,
                axialCoords: [building.tilePosition],
                progress: building.structProgress,
            });
            if (player.id === building.playerId) {
                switch (building.buildingType) {
                    case lib_1.BuildingType.BASE:
                        building.emitStorage();
                        break;
                    case lib_1.BuildingType.BARRACK:
                        building.emitStorage();
                        break;
                    case lib_1.BuildingType.STRUCT_GENERATOR:
                        building.emitStorage();
                        break;
                    case lib_1.BuildingType.TRAINING_DATA_GENERATOR:
                        building.emitStorage();
                        break;
                }
            }
        });
        Object.values(this.entities).forEach(function (entity) {
            player.emit(lib_1.PackageType.SPAWN_ENTITY, {
                uid: entity.uuid,
                position: { x: entity.position.x, y: 0, z: entity.position.y },
                entityType: entity.type,
                playerId: entity.playerId,
            });
        });
        Object.values(this.workerJobs).forEach(function (job) {
            if (job.playerId === player.id) {
                job.sendUpdateJob();
            }
        });
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
    Game.prototype.initBase = function (size) {
        var _this = this;
        var locations = [
            new lib_1.Axial(0, 0),
            new lib_1.Axial(size - 1, size - 1),
            new lib_1.Axial(size - 1, 0),
            new lib_1.Axial(0, size - 1),
        ];
        this.players.forEach(function (player, k) {
            var base0 = new Base_1.Base(_this, player.id, locations[k]);
            _this.bases[player.id] = base0;
        });
    };
    /**
     * assign clusters to players and spawn inital workers
     */
    Game.prototype.initClusterTiles = function (initialWorkerCount) {
        var _this = this;
        if (initialWorkerCount === void 0) { initialWorkerCount = 0; }
        var clusters = [];
        Object.keys(this.map).forEach(function (axialString) {
            var tileInfo = _this.map[axialString];
            if (tileInfo.type === lib_1.TileType.INFORMATION_CLUSTER) {
                clusters.push(lib_1.Axial.fromString(axialString));
            }
        });
        this.players.forEach(function (player, index) {
            var sp = new SpawnPoint_1.SpawnPoint(_this, player.id, clusters[index]);
            for (var i = 0; i < initialWorkerCount; i++) {
                sp.spawn();
            }
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
        Object.keys(this.entities)
            // to let worker holding higher priority job execute first
            .sort(function (a, b) {
            if (_this.entities[a].type === lib_1.EntityType.WORKER &&
                _this.entities[b].type === lib_1.EntityType.WORKER) {
                var aw = _this.entities[a];
                var bw = _this.entities[b];
                if (aw.job && bw.job) {
                    if (aw.job.priority < bw.job.priority) {
                        return 1;
                    }
                    else if (aw.job.priority > bw.job.priority) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                }
                else {
                    return 0;
                }
            }
            else {
                return 0;
            }
        })
            // freame each workers
            .forEach(function (key) {
            var entity = _this.entities[key];
            entity.frame(prevTicks, currTicks);
            if (entity.sentPosition.euclideanDistance(entity.position) > 0) {
                var _a = entity.position.asArray, x = _a[0], z = _a[1];
                var _b = entity.velocity.asArray, vx = _b[0], vz = _b[1];
                _this.emit(lib_1.PackageType.MOVE_ENTITY, {
                    uid: entity.uuid,
                    location: { x: x, y: 0, z: z },
                    yaw: entity.yaw,
                    pitch: 0,
                    velocity: { x: vx, y: 0, z: vz },
                });
                entity.sentPosition = entity.position.clone();
            }
        });
        Object.keys(this.workerJobs).forEach(function (key) {
            var job = _this.workerJobs[key];
            if (job.dirty) {
                job.sendUpdateJob();
            }
        });
        // const w = Object.values(this.myUnits(0))[0] as Worker;
        // const j = w.job;
        // console.log(w.name, j && j.name, w.position);
        // const b = Object.values(this.myBuildings(0));
        // console.log(
        //   b
        //     .filter(
        //       (bb: Building) => bb.buildingType === BuildingType.STRUCT_GENERATOR,
        //     )
        //     .map((bb: Building) => ({
        //       name: bb.name,
        //       next: bb.nextReadyTime,
        //       per: bb.period,
        //     })),
        // );
        this.prevTicks = currTicks;
    };
    Game.prototype.test = function () {
        //
    };
    return Game;
}());
exports.Game = Game;
