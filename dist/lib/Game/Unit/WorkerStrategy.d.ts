import { Entity } from '.';
import { Game } from '..';
import { Building } from '../Building';
interface WorkerJob {
    targetBuilding: Building;
}
declare enum WorkerState {
    IDLE = 0,
    GRABBING = 1,
    DELIVERING = 2
}
export declare class WorkerStrategy {
    game: Game;
    entity: Entity;
    job: WorkerJob | null;
    state: WorkerState;
    constructor(game: Game, entity: Entity);
    frame(prevTicks: number, currTicks: number): void;
    findJob(): void;
    /**
     * Find a generator or the base to collect resouces
     * currently just base on shortest distance to the worker
     */
    findGeneratorToGrab(): Building | false;
    findBuildingToDeliver(): Building;
    action(): void;
}
export {};
