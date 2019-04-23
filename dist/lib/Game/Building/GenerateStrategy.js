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
var BuildingStrategy_1 = require("./BuildingStrategy");
var GeneratorStrategy = /** @class */ (function (_super) {
    __extends(GeneratorStrategy, _super);
    function GeneratorStrategy(game, building) {
        var _this = _super.call(this, game, building) || this;
        _this.struct = 0;
        _this.trainingData = 0;
        _this.primeData = 0;
        _this.structCapacity = 0;
        _this.trainingDataCapacity = 0;
        _this.primeDataCapacity = 0;
        _this.period = -1;
        _this.prevGenerateTicks = 0;
        _this.period = 2000;
        return _this;
    }
    GeneratorStrategy.prototype.setGeneratePeriod = function (period) {
        this.period = period;
    };
    GeneratorStrategy.prototype.frame = function (prevTicks, currTicks) {
        if (this.period !== -1 &&
            currTicks - this.prevGenerateTicks >= this.period) {
            this.prevGenerateTicks = currTicks;
            this.generate();
        }
    };
    GeneratorStrategy.prototype.generate = function () { };
    return GeneratorStrategy;
}(BuildingStrategy_1.BuildingStrategy));
exports.GeneratorStrategy = GeneratorStrategy;
