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
        _this.game.entities[_this.uuid] = _this;
        _this.type = type;
        _this.position = position;
        _this.rotation = rotation;
        _this.velocity = new lib_1.Cartesian(0, 0);
        _this.speed = 30 / 500;
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
        this.position = this.position.add(this.velocity.scale(currTick - prevTick));
    };
    Entity.prototype.moveToTarget = function (prevTicks, currTicks, target) {
        console.log('move to target');
        if (target) {
            this.target = target;
        }
        if (this.target) {
            var distanceToTarget = this.position.euclideanDistance(this.target.cartesianPos);
            if (distanceToTarget < 2) {
                // perform arrive action
                this.arrive();
                this.velocity = new lib_1.Cartesian(0, 0);
            }
            else {
                this.updateVelocity();
                if (distanceToTarget <
                    this.velocity.euclideanDistance(new lib_1.Cartesian(0, 0))) {
                    // avoid overshooting to target position
                    this.position = this.target.cartesianPos;
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
        if (this.target) {
            this.velocity = this.target.cartesianPos.add(this.position.scale(-1));
            this.velocity = this.velocity.scale(1 / this.velocity.euclideanDistance(new lib_1.Cartesian(0, 0)));
            // console.trace('Here I am!');
            this.velocity = this.velocity.scale(this.speed);
        }
        else {
            this.velocity = new lib_1.Cartesian(0, 0);
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
