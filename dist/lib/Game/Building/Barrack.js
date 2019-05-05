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
var lib_1 = require("tone-core/dist/lib");
var _1 = require(".");
var Worker_1 = require("../Unit/Worker");
var Helpers_1 = require("../../Helpers");
var WorkerJob_1 = require("../Unit/WorkerJob");
var Soldier_1 = require("../Unit/Soldier");
var Job_1 = require("tone-core/dist/lib/Game/Job");
var Barrack = /** @class */ (function (_super) {
    __extends(Barrack, _super);
    function Barrack(game, playerId, tilePosition) {
        var _this = _super.call(this, game, playerId, Game_1.BuildingType.BARRACK, tilePosition) || this;
        _this.trainingDataStorage = 0;
        _this.soldierVariant = Game_1.EntityType.SOLDIER_0;
        _this.soldierQuota = 3;
        _this.soldiers = [];
        _this.trainingCount = 0; // number of soldiers now training
        _this.trainingTime = 3000; // total ticks required to train a soldier
        _this.trainStartTime = 0; // the start tick of current training soldier
        _this.nowTraining = false; // now barrack is training
        _this.mFightingStyle = Game_1.FightingStyle.AGGRESSIVE;
        return _this;
    }
    Object.defineProperty(Barrack.prototype, "fightingStyle", {
        get: function () {
            return this.mFightingStyle;
        },
        set: function (fs) {
            this.mFightingStyle = fs;
            this.soldiers.forEach(function (s) {
                s.fightingStyle = fs;
            });
        },
        enumerable: true,
        configurable: true
    });
    Barrack.prototype.frame = function (prevTicks, currTicks) {
        if (this.nowTraining) {
            if (currTicks >= this.trainStartTime + this.trainingTime) {
                this.trainingCount--;
                var newSoldier = new Soldier_1.Soldier(this.game, this.playerId, this.soldierVariant, this.cartesianPos, this);
                newSoldier.fightingStyle = this.fightingStyle;
                this.soldiers.push(newSoldier);
                this.nowTraining = false;
            }
        }
        else {
            if (this.trainingCount > 0) {
                this.trainStartTime = currTicks;
                this.nowTraining = true;
            }
        }
    };
    Barrack.prototype.doneConstruction = function () {
        this.storageJob = new WorkerJob_1.WorkerJob(this.playerId, this, Helpers_1.ResourceType.TRAINING_DATA, Job_1.JobPriority.LOW, Job_1.JobNature.STORAGE);
    };
    Barrack.prototype.onDie = function () {
        var _this = this;
        if (this.storageJob) {
            this.storageJob.removeJob();
        }
        if (this.recruitmentJob) {
            this.recruitmentJob.removeJob();
        }
        this.soldiers.forEach(function (s) {
            var w = new Worker_1.Worker(_this.game, _this.playerId, s.position, s.rotation);
            w.hp = s.hp;
            s.hp = 0;
        });
        for (var i = 0; i < this.trainingCount; i++) {
            var w = new Worker_1.Worker(this.game, this.playerId, this.cartesianPos, new lib_1.XyzEuler(0, 0, 0));
        }
        _super.prototype.onDie.call(this);
    };
    Barrack.prototype.onResouceDelivered = function (type, amount, worker) {
        if (!this.isFunctional()) {
            return _super.prototype.onResouceDelivered.call(this, type, amount, worker);
        }
        else {
            if (type === Helpers_1.ResourceType.TRAINING_DATA) {
                this.trainingDataStorage += amount;
                return amount;
            }
            else if (type === Helpers_1.ResourceType.WORKER) {
                if (this.soldiers.length + this.trainingCount < this.soldierQuota) {
                    this.trainingCount++;
                    return 1;
                }
                else {
                    return 0;
                }
            }
            else {
                return 0;
            }
        }
    };
    Barrack.prototype.tryGiveResource = function (resourceType, amount) {
        if (this.isFunctional()) {
            if (resourceType === Helpers_1.ResourceType.TRAINING_DATA) {
                var a = Math.min(amount, this.trainingDataStorage);
                this.trainingDataStorage -= a;
                return a;
            }
        }
        return 0;
    };
    Barrack.prototype.callForRecuitment = function () {
        this.recruitmentJob = new WorkerJob_1.WorkerJob(this.playerId, this, Helpers_1.ResourceType.WORKER, Job_1.JobPriority.EXCLUSIVE, Job_1.JobNature.RECRUITMENT);
        return this.recruitmentJob;
    };
    return Barrack;
}(_1.Building));
exports.Barrack = Barrack;
