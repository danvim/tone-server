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
var Thing_1 = require("../Thing");
var WorkerStrategy_1 = require("./WorkerStrategy");
var Entity = /** @class */ (function (_super) {
    __extends(Entity, _super);
    // public unitStrategy?: UnitStrategy;
    function Entity(game, playerId, type, position, rotation) {
        var _this = _super.call(this, game, playerId, 100) || this;
        _this.type = type;
        _this.setType(type);
        _this.position = position;
        _this.rotation = rotation;
        _this.velocity = new lib_1.Cartesian(0, 0);
        return _this;
    }
    Entity.prototype.setType = function (type) {
        this.type = type;
        if (type === Game_1.EntityType.WORKER) {
            this.workerStrategy = new WorkerStrategy_1.WorkerStrategy(this.game, this);
        }
    };
    Entity.prototype.frame = function (prevTick, currTick) {
        this.position = this.position.add(this.velocity.scale(currTick - prevTick));
        if (this.type === Game_1.EntityType.WORKER && this.workerStrategy) {
            this.workerStrategy.frame(prevTick, currTick);
        }
    };
    return Entity;
}(Thing_1.Thing));
exports.Entity = Entity;
