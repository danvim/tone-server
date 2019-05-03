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
var TrainingDataGenerator = /** @class */ (function (_super) {
    __extends(TrainingDataGenerator, _super);
    function TrainingDataGenerator(game, playerId, tilePosition) {
        var _this = _super.call(this, game, playerId, Game_1.BuildingType.TRAINING_DATA_GENERATOR, tilePosition) || this;
        _this.amount = 0;
        _this.capacity = 1;
        _this.generate = function () {
            if (_this.amount < _this.capacity) {
                _this.amount++;
            }
        };
        return _this;
    }
    TrainingDataGenerator.prototype.frame = function (prevTicks, currTicks) {
        if (this.periodStrategy) {
            this.periodStrategy.frame(prevTicks, currTicks);
        }
    };
    TrainingDataGenerator.prototype.tryGiveResource = function (type, amount) {
        if (type === Helpers_1.ResourceType.TRAINING_DATA) {
            var a = Math.min(amount, this.amount);
            this.amount -= a;
            return a;
        }
        return 0;
    };
    TrainingDataGenerator.prototype.doneConstruction = function () {
        this.periodStrategy = new PeroidStrategy_1.PeriodStrategy(1000, this.generate);
    };
    return TrainingDataGenerator;
}(_1.Building));
exports.TrainingDataGenerator = TrainingDataGenerator;