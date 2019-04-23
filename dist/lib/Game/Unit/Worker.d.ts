import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Unit } from '.';
import { Building } from '../Building';
declare enum WorkerState {
    IDLE = 0,
    GRABBING = 1,
    DELIVERING = 2
}
export declare class Worker extends Unit {
    state: WorkerState;
    constructor(game: Game, playerId: number, position: Cartesian, rotation: XyzEuler);
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
export {};
