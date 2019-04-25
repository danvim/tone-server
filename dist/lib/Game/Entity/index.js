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
var lib_1 = require("tone-core/dist/lib");
var Thing_1 = require("../Thing");
var Entity = /** @class */ (function (_super) {
    __extends(Entity, _super);
    // public unitStrategy?: UnitStrategy;
    function Entity(game, playerId, type, position, rotation) {
        var _this = _super.call(this, game, playerId, 100) || this;
        _this.arriveRange = 0;
        _this.game.entities[_this.uuid] = _this;
        _this.type = type;
        _this.position = position;
        _this.rotation = rotation;
        _this.velocity = new lib_1.Cartesian(0, 0);
        _this.speed = 30 / 500;
        _this.game.emit(lib_1.PackageType.SPAWN_ENTITY, {
            uid: _this.uuid,
            position: _this.position,
            entityType: _this.type,
            playerId: _this.playerId,
        });
        return _this;
    }
    Object.defineProperty(Entity.prototype, "cartesianPos", {
        get: function () {
            return this.position;
        },
        enumerable: true,
        configurable: true
    });
    Entity.prototype.frame = function (prevTicks, currTicks) {
        // this.travelByVelocity(prevTick, currTick);
        this.moveToTarget(prevTicks, currTicks);
    };
    Entity.prototype.travelByVelocity = function (prevTick, currTick) {
        this.position.add(this.velocity.scaled(currTick - prevTick));
    };
    Entity.prototype.moveToTarget = function (prevTicks, currTicks, target) {
        if (target) {
            this.target = target;
        }
        if (this.target) {
            var distanceToTarget = this.position.euclideanDistance(this.target.cartesianPos);
            if (distanceToTarget < this.arriveRange) {
                // perform arrive action
                this.arrive();
                this.velocity = new lib_1.Cartesian(0, 0);
            }
            else {
                this.updateVelocity();
                if (distanceToTarget < this.velocity.norm() * (currTicks - prevTicks)) {
                    // avoid overshooting to target position
                    this.position = this.target.cartesianPos.clone();
                    this.arrive();
                    this.velocity = new lib_1.Cartesian(0, 0);
                }
                else {
                    this.travelByVelocity(prevTicks, currTicks);
                }
            }
        }
        else {
            this.travelByVelocity(prevTicks, currTicks);
        }
    };
    Entity.prototype.setTarget = function (target) {
        this.target = target;
        this.updateVelocity();
    };
    Entity.prototype.updateVelocity = function () {
        var _a;
        if (this.target) {
            var _b = this.position.asArray, x = _b[0], z = _b[1];
            var position = new lib_1.Cartesian(x, z);
            _a = this.target.cartesianPos.asArray, x = _a[0], z = _a[1];
            this.velocity = new lib_1.Cartesian(x, z);
            this.velocity.add(position.scale(-1));
            var dist = this.velocity.euclideanDistance(new lib_1.Cartesian(0, 0));
            if (dist === 0) {
                this.velocity = new lib_1.Cartesian(0, 0);
            }
            else {
                this.velocity.scale(1 / dist);
                this.velocity.scale(this.speed);
            }
        }
    };
    /**
     * execute when this is at the target thing
     * to be overrided by children class
     */
    Entity.prototype.arrive = function () {
        //
    };
    return Entity;
}(Thing_1.Thing));
exports.Entity = Entity;