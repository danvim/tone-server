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
var lib_1 = require("tone-core/dist/lib");
var _1 = require(".");
var Helpers_1 = require("../../Helpers");
var WorkerState;
(function (WorkerState) {
    WorkerState[WorkerState["IDLE"] = 0] = "IDLE";
    WorkerState[WorkerState["GRABBING"] = 1] = "GRABBING";
    WorkerState[WorkerState["DELIVERING"] = 2] = "DELIVERING";
})(WorkerState || (WorkerState = {}));
var Worker = /** @class */ (function (_super) {
    __extends(Worker, _super);
    function Worker(game, playerId, position, rotation) {
        var _this = _super.call(this, game, playerId, lib_1.EntityType.WORKER, position, rotation) || this;
        _this.job = null;
        _this.state = WorkerState.IDLE;
        _this.findJob();
        return _this;
    }
    Worker.prototype.frame = function (prevTicks, currTicks) {
        if (this.job !== null && this.state !== WorkerState.IDLE) {
            // have job
            var distanceToTarget = this.position.euclideanDistance(this.job.targetBuilding.tilePosition.toCartesian(lib_1.TILE_SIZE));
            if (distanceToTarget < 2) {
                // perform action to the target
                this.action();
                this.findJob();
            }
            else if (distanceToTarget < this.velocity.euclideanDistance(new lib_1.Cartesian(0, 0))) {
                // avoid overshooting to target position
                this.position = this.job.targetBuilding.tilePosition.toCartesian(lib_1.TILE_SIZE);
            }
            else {
                this.travelByVelocity(prevTicks, currTicks);
            }
        }
        else {
            // the worker have nothing to do, then find some job
            this.findJob();
        }
    };
    Worker.prototype.findJob = function () {
        switch (this.state) {
            case WorkerState.IDLE: {
                var targetBuilding = this.findGeneratorToGrab();
                if (targetBuilding === false) {
                    break;
                }
                this.job = { targetBuilding: targetBuilding };
                this.state = WorkerState.GRABBING;
                break;
            }
            // TODO: handle other states
            case WorkerState.DELIVERING: {
                var targetBuilding = this.findBuildingToDeliver();
                this.job = { targetBuilding: targetBuilding };
                this.state = WorkerState.DELIVERING;
            }
        }
    };
    /**
     * Find a generator or the base to collect resouces
     * currently just base on shortest distance to the worker
     */
    Worker.prototype.findGeneratorToGrab = function () {
        var _this = this;
        var generatorTypes = [
            lib_1.BuildingType.PRIME_DATA_GENERATOR,
            lib_1.BuildingType.STRUCT_GENERATOR,
            lib_1.BuildingType.TRAINING_DATA_GENERATOR,
            lib_1.BuildingType.SHIELD_GENERATOR,
            lib_1.BuildingType.BASE,
        ];
        var generators = Object.keys(this.game.buildings).filter(function (uuid) {
            var building = _this.game.buildings[uuid];
            return (building.playerId === _this.playerId &&
                generatorTypes.indexOf(building.buildingType) !== -1 &&
                building.isFunctional());
        });
        if (generators.length === 0) {
            return false;
        }
        return this.game.buildings[generators.sort(function (a, b) {
            return (_this.game.buildings[a].tilePosition
                .toCartesian(lib_1.TILE_SIZE)
                .euclideanDistance(_this.position) -
                _this.game.buildings[b].tilePosition
                    .toCartesian(lib_1.TILE_SIZE)
                    .euclideanDistance(_this.position));
        })[0]];
    };
    Worker.prototype.findBuildingToDeliver = function () {
        var _this = this;
        var buildingKeys = Object.keys(this.game.buildings).filter(function (uuid) {
            var building = _this.game.buildings[uuid];
            return (building.playerId === _this.playerId &&
                building.structProgress < building.structNeeded);
        });
        if (buildingKeys.length === 0) {
            return Object.values(this.game.buildings).filter(function (building) {
                return building.buildingType === lib_1.BuildingType.BASE &&
                    building.playerId === _this.playerId;
            })[0];
        }
        return this.game.buildings[buildingKeys[0]];
    };
    Worker.prototype.action = function () {
        if (this.job) {
            if (this.state === WorkerState.DELIVERING) {
                this.state = WorkerState.IDLE;
                this.job.targetBuilding.onResouceDelivered(Helpers_1.ResourceType.STRUCT, 1);
                this.findJob();
            }
            else if (this.state === WorkerState.GRABBING) {
                if (this.job.targetBuilding.tryGiveResource(Helpers_1.ResourceType.STRUCT, 1)) {
                    this.state = WorkerState.DELIVERING;
                    this.findJob();
                }
            }
        }
    };
    return Worker;
}(_1.Unit));
exports.Worker = Worker;
