"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("tone-core/dist/lib/Game");
var Thing_1 = require("../Thing");
var SpawnStrategy_1 = require("./SpawnStrategy");
var GeneratorStrategy_1 = require("./GeneratorStrategy");
var Helpers_1 = require("../../Helpers");
var Building = /** @class */ (function (_super) {
    __extends(Building, _super);
    function Building(game, playerId, buildingType, tilePosition) {
        var _this = _super.call(this, game, playerId, 100) || this;
        // for construction
        _this.structProgress = 0;
        _this.structNeeded = 0;
        _this.game.buildings[_this.uuid] = _this;
        _this.buildingType = buildingType;
        _this.tilePosition = tilePosition;
        if (buildingType === Game_1.BuildingType.SPAWN_POINT) {
            _this.spawnStrategy = new SpawnStrategy_1.SpawnStrategy(game, _this);
        }
        else if (buildingType === Game_1.BuildingType.BASE) {
            _this.structGeneratorStrategy = new GeneratorStrategy_1.GeneratorStrategy(game, _this);
            _this.structGeneratorStrategy.capacity = -1;
            _this.trainingDataGeneratorStrategy = new GeneratorStrategy_1.GeneratorStrategy(game, _this);
            _this.trainingDataGeneratorStrategy.setGeneratePeriod(-1);
            _this.primeDataGeneratorStrategy = new GeneratorStrategy_1.GeneratorStrategy(game, _this);
            _this.primeDataGeneratorStrategy.setGeneratePeriod(-1);
        }
        else {
            _this.structNeeded = Game_1.BuildingProperty[buildingType].struct;
        }
        return _this;
    }
    Building.prototype.isFunctional = function () {
        return this.structProgress >= this.structNeeded;
    };
    Building.prototype.frame = function (prevTicks, currTicks) {
        this.spawnStrategy && this.spawnStrategy.frame(prevTicks, currTicks);
    };
    Building.prototype.onResouceDelivered = function (type, amount) {
        if (type === Helpers_1.ResourceType.STRUCT &&
            this.structProgress < this.structNeeded) {
            this.structProgress += amount;
            if (this.isFunctional()) {
                // Done
            }
        }
        else if (type === Helpers_1.ResourceType.STRUCT && this.structGeneratorStrategy) {
            // deliver resouce which can generate or store that resource means storing this resource
            this.structGeneratorStrategy.amount += amount;
        }
        else if (type === Helpers_1.ResourceType.TRAINING_DATA &&
            this.trainingDataGeneratorStrategy) {
            this.trainingDataGeneratorStrategy.amount += amount;
        }
        else if (type === Helpers_1.ResourceType.PRIME_DATA &&
            this.primeDataGeneratorStrategy) {
            this.primeDataGeneratorStrategy.amount += amount;
        }
    };
    Building.prototype.tryGiveResource = function (type, amount) {
        if (!this.isFunctional()) {
            return 0;
        }
        if (type === Helpers_1.ResourceType.STRUCT &&
            this.structGeneratorStrategy &&
            this.structGeneratorStrategy.amount > 0) {
            // deliver resouce which can generate or store that resource means storing this resource
            this.structGeneratorStrategy.amount -= amount = Math.min(amount, this.structGeneratorStrategy.amount);
        }
        else if (type === Helpers_1.ResourceType.TRAINING_DATA &&
            this.trainingDataGeneratorStrategy) {
            // this.trainingDataGeneratorStrategy.amount += amount;
            amount = 0;
        }
        else if (type === Helpers_1.ResourceType.PRIME_DATA &&
            this.primeDataGeneratorStrategy) {
            // this.primeDataGeneratorStrategy.amount += amount
            amount = 0;
        }
        return amount;
    };
    return Building;
}(Thing_1.Thing));
exports.Building = Building;
