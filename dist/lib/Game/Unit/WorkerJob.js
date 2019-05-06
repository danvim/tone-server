"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Helpers_1 = require("../../Helpers");
var v4_1 = __importDefault(require("uuid/v4"));
var lib_1 = require("tone-core/dist/lib");
var Worker_1 = require("./Worker");
var Job_1 = require("tone-core/dist/lib/Game/Job");
var WorkerJob = /** @class */ (function () {
    function WorkerJob(playerId, target, resourceType, priority, jobNature) {
        this.workers = [];
        this.progressOnTheWay = 0;
        this.dirty = false;
        this.id = v4_1.default();
        this.target = target;
        this.resourceType = resourceType;
        this.playerId = playerId;
        this.priority = priority;
        this.jobNature = jobNature;
        this.game.workerJobs[this.id] = this;
    }
    Object.defineProperty(WorkerJob.prototype, "progressNeed", {
        get: function () {
            if (this.resourceType === Helpers_1.ResourceType.STRUCT &&
                this.target.structProgress < this.target.structNeeded) {
                return (this.target.structNeeded -
                    this.progressOnTheWay -
                    this.target.structProgress);
            }
            else if (this.jobNature === Job_1.JobNature.STORAGE) {
                return 9999;
            }
            else {
                delete this.game.workerJobs[this.id];
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorkerJob.prototype, "needWorker", {
        get: function () {
            if (this.jobNature === Job_1.JobNature.STORAGE) {
                return true;
            }
            if (this.jobNature === Job_1.JobNature.RECRUITMENT) {
                var barrack = this.target;
                return (barrack.soldierQuota -
                    barrack.trainingCount -
                    barrack.soldiers.length -
                    this.progressOnTheWay >
                    0);
            }
            if (this.target.isFunctional()) {
                return false;
            }
            return this.progressNeed > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorkerJob.prototype, "game", {
        get: function () {
            return this.target.game;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorkerJob.prototype, "player", {
        get: function () {
            return this.game.players[this.playerId];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorkerJob.prototype, "name", {
        get: function () {
            return "[" + Job_1.JobPriority[this.priority] + "] " + this.target.name + " " + Job_1.JobNature[this.jobNature];
        },
        enumerable: true,
        configurable: true
    });
    WorkerJob.prototype.addWorker = function (worker) {
        this.workers.push(worker);
        this.dirty = true;
    };
    WorkerJob.prototype.removeWorker = function (rworker) {
        this.workers = this.workers.filter(function (worker) { return worker.uuid !== rworker.uuid; });
        if (this.jobNature === Job_1.JobNature.STORAGE) {
            this.dirty = true;
            return;
        }
        if (this.workers.length === 0) {
            this.removeJob();
        }
        this.dirty = true;
    };
    WorkerJob.prototype.strictlyPriorThan = function (job) {
        return this.priority > job.priority;
    };
    WorkerJob.prototype.freeAllWorkers = function () {
        var _this = this;
        this.workers.forEach(function (worker) {
            delete worker.job;
            if (worker.state === Worker_1.WorkerState.DELIVERING) {
                worker.target = _this.game.bases[_this.playerId];
            }
            else {
                worker.findJob();
            }
        });
        this.dirty = true;
    };
    WorkerJob.prototype.removeJob = function () {
        this.freeAllWorkers();
        delete this.game.workerJobs[this.id];
        this.priority = Job_1.JobPriority.SUSPENDED;
        this.sendUpdateJob();
    };
    WorkerJob.prototype.sendUpdateJob = function () {
        this.player.emit(lib_1.PackageType.UPDATE_JOB, {
            jobId: this.id,
            buildingId: this.target.uuid,
            workerIds: this.workers.map(function (w) { return w.uuid; }),
            priority: this.priority,
            nature: this.jobNature,
        });
        this.dirty = false;
    };
    return WorkerJob;
}());
exports.WorkerJob = WorkerJob;
