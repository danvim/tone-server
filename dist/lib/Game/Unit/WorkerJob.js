"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Helpers_1 = require("../../Helpers");
var v4_1 = __importDefault(require("uuid/v4"));
var JobPriority;
(function (JobPriority) {
    JobPriority[JobPriority["LOW"] = 0] = "LOW";
    JobPriority[JobPriority["MEDIUM"] = 1] = "MEDIUM";
    JobPriority[JobPriority["HIGH"] = 2] = "HIGH";
    JobPriority[JobPriority["EXCLUSIVE"] = 3] = "EXCLUSIVE";
})(JobPriority = exports.JobPriority || (exports.JobPriority = {}));
var WorkerJob = /** @class */ (function () {
    function WorkerJob(playerId, target, resourceType, priority, isStorageJob) {
        this.workers = [];
        this.progressOnTheWay = 0;
        this.isStorageJob = false;
        this.id = v4_1.default();
        this.target = target;
        this.resourceType = resourceType;
        this.playerId = playerId;
        this.priority = priority;
        this.isStorageJob = isStorageJob;
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
            else if (this.isStorageJob) {
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
            if (this.isStorageJob) {
                return true;
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
    WorkerJob.prototype.addWorker = function (worker) {
        this.workers.push(worker);
    };
    WorkerJob.prototype.removeWorker = function (rworker) {
        this.workers = this.workers.filter(function (worker) { return worker.uuid !== rworker.uuid; });
        if (this.isStorageJob) {
            return;
        }
        if (this.workers.length === 0) {
            delete this.game.workerJobs[this.id];
        }
    };
    WorkerJob.prototype.strictlyPriorThan = function (job) {
        return this.priority > job.priority;
    };
    return WorkerJob;
}());
exports.WorkerJob = WorkerJob;
