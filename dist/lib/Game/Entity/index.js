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
        _this.yaw = 0;
        _this.game.entities[_this.uuid] = _this;
        _this.type = type;
        _this.position = position;
        _this.rotation = rotation;
        _this.velocity = new lib_1.Cartesian(0, 0);
        _this.speed = 30 / 500;
        _this.game.emit(lib_1.PackageType.SPAWN_ENTITY, {
            uid: _this.uuid,
            position: { x: _this.position.x, y: 0, z: _this.position.y },
            entityType: _this.type,
            playerId: _this.playerId,
        });
        _this.sentPosition = _this.position;
        return _this;
    }
    Object.defineProperty(Entity.prototype, "target", {
        get: function () {
            return this.mtarget;
        },
        set: function (target) {
            this.mtarget = target;
            this.updateVelocity();
        },
        enumerable: true,
        configurable: true
    });
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
            if (distanceToTarget <= this.arriveRange) {
                // perform arrive action
                this.arrive(prevTicks, currTicks);
                this.velocity = new lib_1.Cartesian(0, 0);
            }
            else {
                this.updateVelocity();
                if (distanceToTarget < this.velocity.norm() * (currTicks - prevTicks)) {
                    // avoid overshooting to target position
                    if (global.test) {
                        this.position = this.target.cartesianPos.clone();
                    }
                    this.arrive(prevTicks, currTicks);
                    this.velocity = new lib_1.Cartesian(0, 0);
                }
                else {
                    this.travelByVelocity(prevTicks, currTicks);
                }
            }
        }
        else {
            this.yaw += Math.random() - 0.5;
            this.travelByVelocity(prevTicks, currTicks);
        }
    };
    Entity.prototype.setTarget = function (target) {
        this.target = target;
        this.updateVelocity();
    };
    Entity.prototype.updateVelocity = function () {
        if (this.target) {
            var _a = this.position.asArray, x = _a[0], z = _a[1];
            var position = new lib_1.Cartesian(x, z);
            var _b = this.target.cartesianPos.asArray, x2 = _b[0], z2 = _b[1];
            this.velocity = new lib_1.Cartesian(x2, z2);
            this.velocity.add(position.scale(-1));
            var dist = this.velocity.euclideanDistance(new lib_1.Cartesian(0, 0));
            if (dist === 0) {
                this.velocity = new lib_1.Cartesian(0, 0);
            }
            else {
                this.velocity.scale(1 / dist);
                this.velocity.scale(this.speed);
                this.yaw = Math.atan2(z2 - z, x2 - x) + Math.PI;
            }
        }
    };
    /**
     * execute when this is at the target thing
     * to be overrided by children class
     */
    Entity.prototype.arrive = function (prevTicks, currTicks) {
        //
    };
    return Entity;
}(Thing_1.Thing));
exports.Entity = Entity;
