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
var Job_1 = require("tone-core/dist/lib/Game/Job");
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
            if (this.job.jobNature === Job_1.JobNature.RECRUITMENT) {
                _super.prototype.frame.call(this, prevTicks, currTicks);
            }
            else {
                this.findGeneratorToGrab(this.job.resourceType);
            }
        }
        else {
            _super.prototype.frame.call(this, prevTicks, currTicks);
        }
    };
    Worker.prototype.searchJob = function () {
        var _this = this;
        // this.game.test();
        var myBuildings = Object.values(this.game.myBuildings(this.playerId));
        var haveStruGen = !!myBuildings.find(function (b) { return b.buildingType === lib_1.BuildingType.STRUCT_GENERATOR; });
        var haveDataGen = !!myBuildings.find(function (b) { return b.buildingType === lib_1.BuildingType.TRAINING_DATA_GENERATOR; });
        var jobs = Object.values(this.game.workerJobs).filter(function (j) {
            return (j.playerId === _this.playerId &&
                j.needWorker &&
                j.priority !== Job_1.JobPriority.SUSPENDED &&
                j.priority !== Job_1.JobPriority.PAUSED &&
                (j.jobNature !== Job_1.JobNature.STORAGE ||
                    ((j.resourceType === Helpers_1.ResourceType.STRUCT && haveStruGen) ||
                        (j.resourceType === Helpers_1.ResourceType.TRAINING_DATA && haveDataGen))));
        });
        var job;
        job = jobs.reduce(function (prev, curr) {
            if (prev.priority === Job_1.JobPriority.EXCLUSIVE) {
                return prev;
            }
            if (curr.priority === Job_1.JobPriority.EXCLUSIVE) {
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
        // console.log(generators.map((g: Building) => g.name));
        var weightingFun = function (source) {
            return source.cartesianPos.euclideanDistance(_this.position) +
                source.cartesianPos.euclideanDistance(target.cartesianPos) || Infinity;
        };
        var sortedGenerators = generators.sort(function (a, b) {
            return weightingFun(a) - weightingFun(b);
        });
        // console.log(
        //   sortedGenerators.map((g: Building) => ({
        //     name: g.name,
        //     weight: weightingFun(g),
        //   })),
        // );
        return sortedGenerators[0];
    };
    /**
     * Find a generator or the base to collect resouces
     * currently just base on shortest distance to the worker
     */
    Worker.prototype.findGeneratorToGrab = function (resourceType) {
        if (this.job) {
            if (this.job.jobNature === Job_1.JobNature.RECRUITMENT) {
                this.target = this.job.target;
                this.job.progressOnTheWay += 1;
            }
            else {
                var target = this.searchGeneratorToGrab(this.job.target, resourceType);
                if (target) {
                    this.target = target;
                    this.job.progressOnTheWay += 1;
                    this.state = WorkerState.GRABBING;
                    return true;
                }
            }
        }
        return false;
    };
    Worker.prototype.arrive = function () {
        var targetBuilding = this.target;
        if (this.job) {
            if (this.job.jobNature === Job_1.JobNature.RECRUITMENT) {
                this.deliver(targetBuilding);
            }
        }
        if (this.state === WorkerState.DELIVERING) {
            this.deliver(targetBuilding);
        }
        else if (this.state === WorkerState.GRABBING) {
            if (this.job) {
                if (targetBuilding.tryGiveResource(this.job.resourceType, 1)) {
                    this.grab(1);
                }
            }
            else {
                this.findJob();
            }
        }
    };
    /**
     *
     * @param amount delivered amount
     */
    Worker.prototype.deliver = function (targetBuilding) {
        this.state = WorkerState.IDLE;
        if (this.job) {
            targetBuilding.onResouceDelivered(this.job.resourceType, 1, this);
            this.job.progressOnTheWay -= 1;
            if (this.job.jobNature === Job_1.JobNature.RECRUITMENT) {
                this.job.removeWorker(this);
                delete this.job;
                this.hp = 0;
                return;
            }
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
    Worker.prototype.onDie = function () {
        if (this.job) {
            this.job.progressOnTheWay--;
            this.job.removeWorker(this);
        }
        _super.prototype.onDie.call(this);
    };
    return Worker;
}(_1.Unit));
exports.Worker = Worker;
