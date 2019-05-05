import { UnitInterface } from 'tone-core/dist/lib/Game/Unit';
import {
  Cartesian,
  XyzEuler,
  EntityType,
  TILE_SIZE,
  BuildingType,
  PackageType,
  AnimType,
  FightingStyle,
} from 'tone-core/dist/lib';
import { Game } from '..';
import { Unit } from '.';
import { Entity } from '../Entity';
import { Building } from '../Building';
import { ResourceType } from '../../Helpers';
import { Thing } from '../Thing';
import { WorkerJob, JobPriority } from './WorkerJob';
import { Barrack } from '../Building/Barrack';
import { Bullet } from '../Entity/Bullet';

export enum SoldierState {
  IDLE,
  REFILLING,
  ATTACKING,
  TRAVELLING,
}

export class Soldier extends Unit {
  public barrack: Barrack;
  public attackTarget?: Thing;
  public defenseTarget?: Thing;
  public trainingDataHolding = 0;
  public trainingDataCapacity = 1;
  public trainingDataPerAttack = 0.1; // each attack will consume this much of training data
  public attackRange = 3; // eucledian dist
  public grabRange = 0; // eucledian dist
  public defenseRadius = 5;
  public attackPeriod = 1000;
  public lastAttack = 0;

  public set arriveRange(range: number) {
    this.grabRange = range;
  }
  public get arriveRange() {
    switch (this.soldierState) {
      case SoldierState.ATTACKING:
        return this.attackRange;
      default:
        return this.grabRange;
    }
  }
  public get soldierState() {
    if (!this.target) {
      return SoldierState.IDLE;
    } else if (this.target === this.attackTarget) {
      return SoldierState.ATTACKING;
    } else if (this.target === this.barrack) {
      return SoldierState.REFILLING; // the sequence is important since soldiers can attack their own barrack
    } else {
      return SoldierState.TRAVELLING;
    }
  }
  constructor(
    game: Game,
    playerId: number,
    type: EntityType,
    position: Cartesian,
    barrack: Barrack,
  ) {
    super(game, playerId, type, position, new XyzEuler(0, 0, 0));
    this.fightingStyle = FightingStyle.AGGRESSIVE;
    this.barrack = barrack;
  }

  public setFightingStyle(fightingStyle: FightingStyle, defenseTarget?: Thing) {
    if (fightingStyle === FightingStyle.PASSIVE) {
      if (defenseTarget) {
        this.defenseTarget = defenseTarget;
      } else {
        this.defenseTarget = this;
      }
    }
    this.fightingStyle = fightingStyle;
  }

  public frame(prevTicks: number, currTicks: number) {
    if (this.trainingDataHolding < this.trainingDataPerAttack) {
      this.target = this.barrack;
      super.frame(prevTicks, currTicks);
    } else if (this.target !== this.barrack) {
      switch (this.fightingStyle) {
        case FightingStyle.AGGRESSIVE:
          this.aggressiveBehavior(prevTicks, currTicks);
          break;
        case FightingStyle.EVASIVE:
          super.frame(prevTicks, currTicks);
          break;
        case FightingStyle.PASSIVE:
          this.passiveBehavior(prevTicks, currTicks);
          break;
      }
    } else {
      super.frame(prevTicks, currTicks);
    }
  }

  public aggressiveBehavior(prevTicks: number, currTicks: number) {
    if (!this.attackTarget || this.attackTarget.hp <= 0) {
      this.attackTarget = this.searchAttackTarget();
    }
    if (this.trainingDataHolding >= this.trainingDataPerAttack) {
      this.target = this.attackTarget;
    } else {
      this.target = this.barrack;
    }
    super.frame(prevTicks, currTicks);
  }

  public passiveBehavior(prevTicks: number, currTicks: number) {
    if (this.defenseTarget) {
      if (
        this.position.euclideanDistance(this.defenseTarget.cartesianPos) >
        this.defenseRadius
      ) {
        this.target = this.defenseTarget;
      } else {
        if (
          !this.attackTarget ||
          this.attackTarget.hp <= 0 ||
          this.attackTarget.cartesianPos.euclideanDistance(this.position) >
            this.defenseRadius
        ) {
          const target = this.searchAttackTarget();
          if (
            target.cartesianPos.euclideanDistance(this.position) <=
            this.defenseRadius
          ) {
            this.attackTarget = target;
          }
        }
        if (this.trainingDataHolding >= this.trainingDataPerAttack) {
          this.target = this.attackTarget;
        } else {
          this.target = this.barrack;
        }
      }
    } else {
      this.defenseTarget = this;
    }
    super.frame(prevTicks, currTicks);
  }

  public searchAttackTarget() {
    const opponentThings: Thing[] = [
      ...Object.values(this.game.opponentBuildings(this.playerId)),
      ...Object.values(this.game.opponentUnits(this.playerId)),
    ];
    return opponentThings.reduce((prev: Thing, curr: Thing) => {
      if (prev.hp <= 0) {
        return curr;
      }
      if (curr.hp <= 0) {
        return prev;
      }
      if (
        this.position.euclideanDistance(prev.cartesianPos) >
        this.position.euclideanDistance(curr.cartesianPos)
      ) {
        return curr;
      }
      return prev;
    }, opponentThings[0]);
  }

  public arrive(prevTicks: number, currTicks: number) {
    if (this.target === this.barrack) {
      const amount = this.barrack.tryGiveResource(
        ResourceType.TRAINING_DATA,
        this.trainingDataCapacity - this.trainingDataHolding,
      );
      if (amount) {
        this.trainingDataHolding += amount;
        if (this.trainingDataHolding === this.trainingDataCapacity) {
          this.target = undefined;
          // delete this.target;
        }
      }
    } else if (this.target === this.attackTarget) {
      this.attack(prevTicks, currTicks);
    }
  }

  public attack(prevTicks: number, currTicks: number) {
    if (
      this.trainingDataHolding >= this.trainingDataPerAttack &&
      this.attackTarget
    ) {
      if (this.lastAttack + this.attackPeriod <= currTicks) {
        this.lastAttack = currTicks;
        this.trainingDataHolding -= this.trainingDataPerAttack;
        const bullect = new Bullet(
          this.game,
          this.playerId,
          this.position,
          this.attackTarget,
          20,
        );
      }
    }
  }
}
