import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Unit } from '.';
import { Building } from '../Building';
export declare enum WorkerState {
    IDLE = 0,
    GRABBING = 1,
    DELIVERING = 2
}
export declare class Worker extends Unit {
    private mstate;
    constructor(game: Game, playerId: number, position: Cartesian, rotation: XyzEuler);
    state: WorkerState;
    frame(prevTicks: number, currTicks: number): void;
    findJob(): void;
    /**
     * Find a generator or the base to collect resouces
     * currently just base on shortest distance to the worker
     */
    findGeneratorToGrab(): Building | false;
    findBuildingToDeliver(): Building;
    arrive(): void;
}
