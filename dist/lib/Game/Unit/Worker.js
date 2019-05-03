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
var WorkerJob_1 = require("./WorkerJob");
var WorkerState;
(function (WorkerState) {
    WorkerState[WorkerState["IDLE"] = 0] = "IDLE";
    WorkerState[WorkerState["GRABBING"] = 1] = "GRABBING";
    WorkerState[WorkerState["DELIVERING"] = 2] = "DELIVERING";
})(WorkerState = exports.WorkerState || (exports.WorkerState = {}));
var Worker = /** @class */ (function (_super) {
    __extends(Worker, _super);
    function Worker(game, playerId, position, rotation) {
        var _this = _super.call(this, game, playerId, lib_1.EntityType.WORKER, position, rotation) || this;
        _this.mstate = WorkerState.IDLE;
        return _this;
    }
    Object.defineProperty(Worker.prototype, "state", {
        get: function () {
            return this.mstate;
        },
        set: function (newState) {
            switch (newState) {
                case WorkerState.DELIVERING:
                    this.player.emit(lib_1.PackageType.SET_ANIMATION, {
                        uid: this.uuid,
                        animType: lib_1.AnimType.CARRYING,
                    });
                    break;
                case WorkerState.GRABBING:
                case WorkerState.IDLE:
                    this.player.emit(lib_1.PackageType.SET_ANIMATION, {
                        uid: this.uuid,
                        animType: lib_1.AnimType.DEFAULT,
                    });
            }
            this.mstate = newState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "name", {
        get: function () {
            return 'Worker ' + this.uuid.substr(0, 6);
        },
        enumerable: true,
        configurable: true
    });
    Worker.prototype.frame = function (prevTicks, currTicks) {
        if (!this.job) {
            this.findJob();
        }
        else if (!this.target) {
            if (this.state === WorkerState.IDLE ||
                this.state === WorkerState.GRABBING) {
                this.findGeneratorToGrab(this.job.resourceType);
            }
            else {
                this.target = this.game.bases[this.playerId];
            }
        }
        else if (this.state === WorkerState.IDLE) {
            this.findGeneratorToGrab(this.job.resourceType);
        }
        else {
            _super.prototype.frame.call(this, prevTicks, currTicks);
        }
    };
    Worker.prototype.searchJob = function () {
        var _this = this;
        // this.game.test();
        var jobs = Object.values(this.game.workerJobs).filter(function (j) {
            return j.playerId === _this.playerId && j.needWorker;
        });
        var job;
        job = jobs.reduce(function (prev, curr) {
            if (prev.priority === WorkerJob_1.JobPriority.EXCLUSIVE) {
                return prev;
            }
            if (curr.priority === WorkerJob_1.JobPriority.EXCLUSIVE) {
                return curr;
            }
            if (prev.priority > curr.priority) {
                return prev;
            }
            if (prev.priority < curr.priority) {
                return curr;
            }
            var prevTotalDist = prev.target.cartesianPos.euclideanDistance(_this.position);
            var currTotalDist = curr.target.cartesianPos.euclideanDistance(_this.position);
            if (prevTotalDist > currTotalDist) {
                return curr;
            }
            return prev;
        }, jobs[0]);
        return job;
    };
    Worker.prototype.findJob = function (job) {
        job = job || this.searchJob();
        if (job) {
            this.job = job;
            job.addWorker(this);
            this.findGeneratorToGrab(this.job.resourceType);
        }
    };
    /**
     * Find a generator or base to collect resource
     * for delevering to the target building
     *
     * if the target building is base,
     * dont give base for collection
     *
     * @param target delevery target building
     * @param resourceType
     */
    Worker.prototype.searchGeneratorToGrab = function (target, resourceType) {
        var _this = this;
        var generatorTypes = [lib_1.BuildingType.BASE];
        if (resourceType === Helpers_1.ResourceType.STRUCT) {
            generatorTypes.push(lib_1.BuildingType.STRUCT_GENERATOR);
        }
        else if (resourceType === Helpers_1.ResourceType.TRAINING_DATA) {
            generatorTypes.push(lib_1.BuildingType.TRAINING_DATA_GENERATOR);
        }
        else if (resourceType === Helpers_1.ResourceType.PRIME_DATA) {
            generatorTypes.push(lib_1.BuildingType.PRIME_DATA_GENERATOR);
        }
        var generators = Object.values(this.game.buildings).filter(function (building) {
            return (building.playerId === _this.playerId &&
                generatorTypes.indexOf(building.buildingType) !== -1 &&
                building.isFunctional() &&
                building.uuid !== target.uuid);
        });
        if (generators.length === 0) {
            return false;
        }
        var weightingFun = function (source) {
            return source.cartesianPos.euclideanDistance(_this.position) +
                source.cartesianPos.euclideanDistance(target.cartesianPos) || Infinity;
        };
        var sortedGenerators = generators.sort(function (a, b) {
            return weightingFun(a) - weightingFun(a);
        });
        return sortedGenerators[0];
    };
    /**
     * Find a generator or the base to collect resouces
     * currently just base on shortest distance to the worker
     */
    Worker.prototype.findGeneratorToGrab = function (resourceType) {
        if (this.job) {
            var target = this.searchGeneratorToGrab(this.job.target, resourceType);
            if (target) {
                this.target = target;
                this.job.progressOnTheWay += 1;
                this.state = WorkerState.GRABBING;
                return true;
            }
        }
        return false;
    };
    Worker.prototype.arrive = function () {
        var targetBuilding = this.target;
        if (this.state === WorkerState.DELIVERING) {
            this.deliver(targetBuilding);
        }
        else if (this.state === WorkerState.GRABBING) {
            if (targetBuilding.tryGiveResource(Helpers_1.ResourceType.STRUCT, 1)) {
                this.grab(1);
            }
        }
    };
    /**
     *
     * @param amount delivered amount
     */
    Worker.prototype.deliver = function (targetBuilding) {
        this.state = WorkerState.IDLE;
        targetBuilding.onResouceDelivered(Helpers_1.ResourceType.STRUCT, 1);
        if (this.job) {
            this.job.progressOnTheWay -= 1;
            if (!this.job.needWorker) {
                this.job.removeWorker(this);
                delete this.job;
                this.findJob();
            }
            else {
                if (!this.mayChangeJob()) {
                    this.findGeneratorToGrab(this.job.resourceType);
                }
            }
        }
        else {
            this.findJob();
        }
    };
    Worker.prototype.mayChangeJob = function () {
        var newJob = this.searchJob();
        if (this.job && newJob) {
            if (newJob.strictlyPriorThan(this.job)) {
                this.job.removeWorker(this);
                this.findJob(newJob);
                return true;
            }
        }
        return false;
    };
    /**
     *
     * @param amount grabbed amount
     */
    Worker.prototype.grab = function (amount) {
        this.state = WorkerState.DELIVERING;
        if (this.job) {
            this.target = this.job.target;
        }
        else {
            this.findJob();
        }
    };
    return Worker;
}(_1.Unit));
exports.Worker = Worker;
