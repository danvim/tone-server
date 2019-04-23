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
var Entity_1 = require("../Entity");
var lib_1 = require("tone-core/dist/lib");
var SpawnStrategy = /** @class */ (function (_super) {
    __extends(SpawnStrategy, _super);
    function SpawnStrategy(game, building) {
        var _this = _super.call(this, game, building) || this;
        _this.period = -1;
        _this.prevSpawnTicks = 0;
        _this.period = 2000;
        return _this;
    }
    SpawnStrategy.prototype.setSpawnPeriod = function (period) {
        this.period = period;
    };
    SpawnStrategy.prototype.frame = function (prevTicks, currTicks) {
        if (this.period !== -1 && currTicks - this.prevSpawnTicks >= this.period) {
            this.prevSpawnTicks = currTicks;
            var worker = new Entity_1.Entity(this.game, this.building.playerId, lib_1.EntityType.WORKER, this.building.tilePosition.toCartesian(lib_1.TILE_SIZE), new lib_1.XyzEuler(1, 0, 0));
        }
    };
    return SpawnStrategy;
}(BuildingStrategy_1.BuildingStrategy));
exports.SpawnStrategy = SpawnStrategy;
