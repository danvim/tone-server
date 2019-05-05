import { Cartesian, EntityType, FightingStyle } from 'tone-core/dist/lib';
import { Game } from '..';
import { Unit } from '.';
import { Thing } from '../Thing';
import { Barrack } from '../Building/Barrack';
export declare enum SoldierState {
    IDLE = 0,
    REFILLING = 1,
    ATTACKING = 2,
    TRAVELLING = 3
}
export declare class Soldier extends Unit {
    barrack: Barrack;
    attackTarget?: Thing;
    defenseTarget?: Thing;
    trainingDataHolding: number;
    trainingDataCapacity: number;
    trainingDataPerAttack: number;
    attackRange: number;
    grabRange: number;
    defenseRadius: number;
    attackPeriod: number;
    lastAttack: number;
    arriveRange: number;
    readonly soldierState: SoldierState;
    constructor(game: Game, playerId: number, type: EntityType, position: Cartesian, barrack: Barrack);
    setFightingStyle(fightingStyle: FightingStyle, defenseTarget?: Thing): void;
    frame(prevTicks: number, currTicks: number): void;
    aggressiveBehavior(prevTicks: number, currTicks: number): void;
    passiveBehavior(prevTicks: number, currTicks: number): void;
    searchAttackTarget(): Thing;
    arrive(prevTicks: number, currTicks: number): void;
    attack(prevTicks: number, currTicks: number): void;
}
