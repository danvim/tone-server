"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("tone-core/dist/lib");
var WorkerState;
(function (WorkerState) {
    WorkerState[WorkerState["IDLE"] = 0] = "IDLE";
    WorkerState[WorkerState["GRABBING"] = 1] = "GRABBING";
    WorkerState[WorkerState["DELIVERING"] = 2] = "DELIVERING";
})(WorkerState || (WorkerState = {}));
var WorkerStrategy = /** @class */ (function () {
    function WorkerStrategy(game, entity) {
        this.game = game;
        this.entity = entity;
        this.job = null;
        this.state = WorkerState.IDLE;
    }
    WorkerStrategy.prototype.frame = function (prevTicks, currTicks) {
        if (this.job !== null && this.state !== WorkerState.IDLE) {
            // have job
            var distanceToTarget = this.entity.position.euclideanDistance(this.job.targetBuilding.tilePosition.toCartesian(lib_1.TILE_SIZE));
            if (distanceToTarget < 2) {
                // perform action to the target
                if (this.state === WorkerState.DELIVERING) {
                    this.state = WorkerState.IDLE;
                }
                else if (this.state === WorkerState.GRABBING) {
                    this.state = WorkerState.DELIVERING;
                }
                this.findJob();
            }
            else if (distanceToTarget <
                this.entity.velocity.euclideanDistance(new lib_1.Cartesian(0, 0))) {
                // avoid overshooting to target position
                this.entity.position = this.job.targetBuilding.tilePosition.toCartesian(lib_1.TILE_SIZE);
            }
            else {
                this.entity.travelByVelocity(prevTicks, currTicks);
            }
        }
        else {
            // the worker have nothing to do, then find some job
            this.findJob();
        }
    };
    WorkerStrategy.prototype.findJob = function () {
        switch (this.state) {
            case WorkerState.IDLE:
                this.job = { targetBuilding: this.findGeneratorToGrab() };
                this.state = WorkerState.GRABBING;
                break;
            // TODO: handle other states
        }
    };
    WorkerStrategy.prototype.findGeneratorToGrab = function () {
        var _this = this;
        var generatorTypes = [
            lib_1.BuildingType.PRIME_DATA_GENERATOR,
            lib_1.BuildingType.STRUCT_GENERATOR,
            lib_1.BuildingType.TRAINING_DATA_GENERATOR,
            lib_1.BuildingType.SHIELD_GENERATOR,
        ];
        var generators = Object.keys(this.game.buildings).filter(function (uuid) {
            var building = _this.game.buildings[uuid];
            return (building.playerId === _this.entity.playerId &&
                generatorTypes.indexOf(building.buildingType) !== -1);
        });
        return this.game.buildings[generators.sort(function (a, b) {
            return (_this.game.buildings[a].tilePosition
                .toCartesian(lib_1.TILE_SIZE)
                .euclideanDistance(_this.entity.position) -
                _this.game.buildings[b].tilePosition
                    .toCartesian(lib_1.TILE_SIZE)
                    .euclideanDistance(_this.entity.position));
        })[0]];
    };
    return WorkerStrategy;
}());
exports.WorkerStrategy = WorkerStrategy;
