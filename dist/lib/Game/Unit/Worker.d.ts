import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Unit } from '.';
import { Building } from '../Building';
import { ResourceType } from '../../Helpers';
import { WorkerJob } from './WorkerJob';
export declare enum WorkerState {
    IDLE = 0,
    GRABBING = 1,
    DELIVERING = 2
}
export declare class Worker extends Unit {
    state: WorkerState;
    readonly name: string;
    job: WorkerJob | undefined;
    private mstate;
    constructor(game: Game, playerId: number, position: Cartesian, rotation: XyzEuler);
    frame(prevTicks: number, currTicks: number): void;
    searchJob(): WorkerJob;
    findJob(job?: WorkerJob): void;
    /**
     * Find a generator or base to collect resource
     * for delevering to the target building
     *
     * if the target building is base,
     * dont give base for collection
     *
     * @param target delevery target building
     * @param resourceType
     */
    searchGeneratorToGrab(target: Building, resourceType: ResourceType): Building | false;
    /**
     * Find a generator or the base to collect resouces
     * currently just base on shortest distance to the worker
     */
    findGeneratorToGrab(resourceType: ResourceType): boolean;
    arrive(): void;
    /**
     *
     * @param amount delivered amount
     */
    deliver(targetBuilding: Building): void;
    mayChangeJob(): boolean;
    /**
     *
     * @param amount grabbed amount
     */
    grab(amount: number): void;
    onDie(): void;
}
