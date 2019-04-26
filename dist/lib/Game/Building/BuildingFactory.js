"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("tone-core/dist/lib");
var Base_1 = require("./Base");
var SpawnPoint_1 = require("./SpawnPoint");
function buildingFactory(game, playerId, buildingType, tilePosition) {
    switch (buildingType) {
        case lib_1.BuildingType.BASE:
            return new Base_1.Base(game, playerId, tilePosition);
        case lib_1.BuildingType.SPAWN_POINT:
            return new SpawnPoint_1.SpawnPoint(game, playerId, tilePosition);
    }
}
exports.buildingFactory = buildingFactory;
