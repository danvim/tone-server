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
var _1 = require(".");
var PeroidStrategy_1 = require("./PeroidStrategy");
var Helpers_1 = require("../../Helpers");
var WorkerJob_1 = require("../Unit/WorkerJob");
var Base = /** @class */ (function (_super) {
    __extends(Base, _super);
    function Base(game, playerId, tilePosition) {
        var _this = _super.call(this, game, playerId, Game_1.BuildingType.BASE, tilePosition) || this;
        _this.structStorage = 0;
        _this.trainingDataStorage = 0;
        _this.primeDataStorage = 0;
        _this.territoryRadius = 8;
        _this.generateStruct = function () {
            _this.structStorage++;
        };
        _this.periodStrategy = new PeroidStrategy_1.PeriodStrategy(2000, _this.generateStruct);
        var s = new WorkerJob_1.WorkerJob(playerId, _this, Helpers_1.ResourceType.STRUCT, WorkerJob_1.JobPriority.LOW, WorkerJob_1.JobNature.STORAGE);
        var t = new WorkerJob_1.WorkerJob(playerId, _this, Helpers_1.ResourceType.TRAINING_DATA, WorkerJob_1.JobPriority.LOW, WorkerJob_1.JobNature.STORAGE);
        var p = new WorkerJob_1.WorkerJob(playerId, _this, Helpers_1.ResourceType.PRIME_DATA, WorkerJob_1.JobPriority.LOW, WorkerJob_1.JobNature.STORAGE);
        return _this;
    }
    Base.prototype.frame = function (prevTicks, currTicks) {
        this.periodStrategy.frame(prevTicks, currTicks);
    };
    Base.prototype.onResouceDelivered = function (type, amount) {
        switch (type) {
            case Helpers_1.ResourceType.STRUCT:
                this.structStorage += amount;
                break;
            case Helpers_1.ResourceType.TRAINING_DATA:
                this.trainingDataStorage += amount;
                break;
            case Helpers_1.ResourceType.PRIME_DATA:
                this.primeDataStorage += amount;
                break;
            default:
                // unknown resource type
                return 0;
        }
        return amount;
    };
    Base.prototype.tryGiveResource = function (type, amount) {
        switch (type) {
            case Helpers_1.ResourceType.STRUCT:
                amount = Math.min(this.structStorage, amount);
                this.structStorage -= amount;
                return amount;
            case Helpers_1.ResourceType.TRAINING_DATA:
                amount = Math.min(this.trainingDataStorage, amount);
                this.trainingDataStorage -= amount;
                return amount;
            case Helpers_1.ResourceType.PRIME_DATA:
                amount = Math.min(this.primeDataStorage, amount);
                this.primeDataStorage -= amount;
                return amount;
            default:
                return 0;
        }
    };
    return Base;
}(_1.Building));
exports.Base = Base;
