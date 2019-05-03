"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("tone-core/dist/lib");
var Base_1 = require("./Base");
var SpawnPoint_1 = require("./SpawnPoint");
var StructGenerator_1 = require("./StructGenerator");
var _1 = require(".");
var Reclaimer_1 = require("./Reclaimer");
var TrainingDataGenerator_1 = require("./TrainingDataGenerator");
var Barrack_1 = require("./Barrack");
function buildingFactory(game, playerId, buildingType, tilePosition) {
    switch (buildingType) {
        case lib_1.BuildingType.BASE:
            return new Base_1.Base(game, playerId, tilePosition);
        case lib_1.BuildingType.SPAWN_POINT:
            return new SpawnPoint_1.SpawnPoint(game, playerId, tilePosition);
        case lib_1.BuildingType.STRUCT_GENERATOR:
            return new StructGenerator_1.StructGenerator(game, playerId, tilePosition);
        case lib_1.BuildingType.RECLAIMATOR:
            return new Reclaimer_1.Reclaimer(game, playerId, tilePosition);
        case lib_1.BuildingType.TRAINING_DATA_GENERATOR:
            return new TrainingDataGenerator_1.TrainingDataGenerator(game, playerId, tilePosition);
        case lib_1.BuildingType.BARRACK:
            return new Barrack_1.Barrack(game, playerId, tilePosition);
        default:
            return new _1.Building(game, playerId, buildingType, tilePosition);
    }
}
exports.buildingFactory = buildingFactory;
