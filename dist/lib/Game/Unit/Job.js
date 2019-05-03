"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WorkerJob = /** @class */ (function () {
    function WorkerJob(target, resourceType) {
        this.workers = [];
        this.target = target;
        this.resourceType = resourceType;
    }
    Object.defineProperty(WorkerJob.prototype, "player", {
        get: function () {
            return this.
            ;
        },
        enumerable: true,
        configurable: true
    });
    WorkerJob.prototype.addWorker = function (worker) {
        this.workers.push(worker);
    };
    return WorkerJob;
}());
exports.WorkerJob = WorkerJob;
