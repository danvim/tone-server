import { Cartesian, EntityType } from 'tone-core/dist/lib';
import { Game } from '..';
import { Unit } from '.';
import { Barrack } from '../Building/Barrack';
export declare enum WorkerState {
    IDLE = 0,
    GRABBING = 1,
    DELIVERING = 2
}
export declare class Soldier extends Unit {
    barrack: Barrack;
    constructor(game: Game, playerId: number, type: EntityType, position: Cartesian, barrack: Barrack);
}
