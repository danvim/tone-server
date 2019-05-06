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
var _1 = require(".");
var Helpers_1 = require("../../Helpers");
var Bullet_1 = require("../Entity/Bullet");
var SoldierState;
(function (SoldierState) {
    SoldierState[SoldierState["IDLE"] = 0] = "IDLE";
    SoldierState[SoldierState["REFILLING"] = 1] = "REFILLING";
    SoldierState[SoldierState["ATTACKING"] = 2] = "ATTACKING";
    SoldierState[SoldierState["TRAVELLING"] = 3] = "TRAVELLING";
})(SoldierState = exports.SoldierState || (exports.SoldierState = {}));
var Soldier = /** @class */ (function (_super) {
    __extends(Soldier, _super);
    function Soldier(game, playerId, type, position, barrack) {
        var _this = _super.call(this, game, playerId, type, position, new lib_1.XyzEuler(0, 0, 0)) || this;
        _this.trainingDataHolding = 0;
        _this.trainingDataCapacity = 1;
        _this.trainingDataPerAttack = 0.1; // each attack will consume this much of training data
        _this.attackRange = 3 * lib_1.TILE_SIZE; // eucledian dist
        _this.grabRange = 0; // eucledian dist
        _this.defenseRadius = 5 * lib_1.TILE_SIZE;
        _this.attackPeriod = 1000;
        _this.lastAttack = 0;
        _this.fightingStyle = lib_1.FightingStyle.AGGRESSIVE;
        _this.barrack = barrack;
        return _this;
    }
    Object.defineProperty(Soldier.prototype, "arriveRange", {
        get: function () {
            switch (this.soldierState) {
                case SoldierState.ATTACKING:
                    return this.attackRange;
                default:
                    return this.grabRange;
            }
        },
        set: function (range) {
            this.grabRange = range;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Soldier.prototype, "soldierState", {
        get: function () {
            if (!this.target) {
                return SoldierState.IDLE;
            }
            else if (this.target === this.attackTarget) {
                return SoldierState.ATTACKING;
            }
            else if (this.target === this.barrack) {
                return SoldierState.REFILLING; // the sequence is important since soldiers can attack their own barrack
            }
            else {
                return SoldierState.TRAVELLING;
            }
        },
        enumerable: true,
        configurable: true
    });
    Soldier.prototype.setFightingStyle = function (fightingStyle, target) {
        if (fightingStyle === lib_1.FightingStyle.PASSIVE) {
            if (target) {
                this.defenseTarget = target;
            }
            else {
                this.defenseTarget = this;
            }
        }
        else if (fightingStyle === lib_1.FightingStyle.AGGRESSIVE) {
            if (this.target === this.attackTarget) {
                this.target = target;
            }
            this.attackTarget = target;
        }
        else if (fightingStyle === lib_1.FightingStyle.EVASIVE) {
            this.target = target;
        }
        this.fightingStyle = fightingStyle;
    };
    Soldier.prototype.frame = function (prevTicks, currTicks) {
        if (this.trainingDataHolding < this.trainingDataPerAttack) {
            this.target = this.barrack;
            _super.prototype.frame.call(this, prevTicks, currTicks);
        }
        else if (this.target !== this.barrack) {
            switch (this.fightingStyle) {
                case lib_1.FightingStyle.AGGRESSIVE:
                    this.aggressiveBehavior(prevTicks, currTicks);
                    break;
                case lib_1.FightingStyle.EVASIVE:
                    _super.prototype.frame.call(this, prevTicks, currTicks);
                    break;
                case lib_1.FightingStyle.PASSIVE:
                    this.passiveBehavior(prevTicks, currTicks);
                    break;
            }
        }
        else {
            _super.prototype.frame.call(this, prevTicks, currTicks);
        }
    };
    Soldier.prototype.aggressiveBehavior = function (prevTicks, currTicks) {
        if (!this.attackTarget || this.attackTarget.hp <= 0) {
            this.attackTarget = this.searchAttackTarget();
        }
        if (this.trainingDataHolding >= this.trainingDataPerAttack) {
            this.target = this.attackTarget;
            if (!this.target) {
                this.velocity = new lib_1.Cartesian(0, 0);
            }
        }
        else {
            this.target = this.barrack;
        }
        _super.prototype.frame.call(this, prevTicks, currTicks);
    };
    Soldier.prototype.passiveBehavior = function (prevTicks, currTicks) {
        if (this.defenseTarget) {
            if (this.position.euclideanDistance(this.defenseTarget.cartesianPos) >
                this.defenseRadius) {
                this.target = this.defenseTarget;
            }
            else {
                if (!this.attackTarget ||
                    this.attackTarget.hp <= 0 ||
                    this.attackTarget.cartesianPos.euclideanDistance(this.position) >
                        this.defenseRadius) {
                    var target = this.searchAttackTarget();
                    if (target.cartesianPos.euclideanDistance(this.position) <=
                        this.defenseRadius) {
                        this.attackTarget = target;
                    }
                }
                if (this.trainingDataHolding >= this.trainingDataPerAttack) {
                    this.target = this.attackTarget;
                }
                else {
                    this.target = this.barrack;
                }
            }
        }
        else {
            this.defenseTarget = this;
        }
        _super.prototype.frame.call(this, prevTicks, currTicks);
    };
    /**
     * give the closest enemy
     */
    Soldier.prototype.searchAttackTarget = function () {
        var _this = this;
        var opponentThings = Object.values(this.game.opponentBuildings(this.playerId)).concat(Object.values(this.game.opponentUnits(this.playerId)));
        return opponentThings.reduce(function (prev, curr) {
            if (prev.hp <= 0) {
                return curr;
            }
            if (curr.hp <= 0) {
                return prev;
            }
            if (_this.position.euclideanDistance(prev.cartesianPos) >
                _this.position.euclideanDistance(curr.cartesianPos)) {
                return curr;
            }
            return prev;
        }, opponentThings[0]);
    };
    Soldier.prototype.arrive = function (prevTicks, currTicks) {
        if (this.target === this.barrack) {
            var amount = this.barrack.tryGiveResource(Helpers_1.ResourceType.TRAINING_DATA, this.trainingDataCapacity - this.trainingDataHolding);
            if (amount) {
                this.trainingDataHolding += amount;
                if (this.trainingDataHolding === this.trainingDataCapacity) {
                    this.target = undefined;
                    // delete this.target;
                }
            }
        }
        else if (this.target === this.attackTarget) {
            this.attack(prevTicks, currTicks);
        }
    };
    Soldier.prototype.attack = function (prevTicks, currTicks) {
        if (this.trainingDataHolding >= this.trainingDataPerAttack &&
            this.attackTarget) {
            if (this.lastAttack + this.attackPeriod <= currTicks) {
                this.lastAttack = currTicks;
                this.trainingDataHolding -= this.trainingDataPerAttack;
                var bullect = new Bullet_1.Bullet(this.game, this.playerId, this.position, this.attackTarget, 20);
            }
        }
    };
    return Soldier;
}(_1.Unit));
exports.Soldier = Soldier;
