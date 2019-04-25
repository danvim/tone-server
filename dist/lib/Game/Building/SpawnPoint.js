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
var PeroidStrategy_1 = require("./PeroidStrategy");
var Worker_1 = require("../Unit/Worker");
var SpawnPoint = /** @class */ (function (_super) {
    __extends(SpawnPoint, _super);
    function SpawnPoint(game, playerId, tilePosition) {
        var _this = _super.call(this, game, playerId, Game_1.BuildingType.SPAWN_POINT, tilePosition) || this;
        _this.spawn = function () {
            var worker = new Worker_1.Worker(_this.game, _this.playerId, _this.cartesianPos, new lib_1.XyzEuler(1, 0, 0));
            console.log(worker.position);
        };
        _this.periodStrategy = new PeroidStrategy_1.PeriodStrategy(2000, _this.spawn);
        return _this;
    }
    SpawnPoint.prototype.frame = function (prevTicks, currTicks) {
        this.periodStrategy.frame(prevTicks, currTicks);
    };
    return SpawnPoint;
}(_1.Building));
exports.SpawnPoint = SpawnPoint;
