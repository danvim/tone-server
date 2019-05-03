import { Building } from '../Building';
import { ResourceType } from '../../Helpers';
import { Player } from '../Player';
import { Game } from '..';
import { Worker } from './Worker';
export declare enum JobPriority {
    SUSPENDED = 0,
    PAUSED = 1,
    LOW = 2,
    MEDIUM = 3,
    HIGH = 4,
    EXCLUSIVE = 5
}
export declare enum JobNature {
    CONSTRUCTION = 0,
    STORAGE = 1,
    RECRUITMENT = 2
}
export declare class WorkerJob {
    id: string;
    workers: Worker[];
    target: Building;
    progressOnTheWay: number;
    playerId: number;
    priority: JobPriority;
    resourceType: ResourceType;
    jobNature: JobNature;
    constructor(playerId: number, target: Building, resourceType: ResourceType, priority: JobPriority, jobNature: JobNature);
    readonly progressNeed: number;
    readonly needWorker: boolean;
    readonly game: Game;
    readonly player: Player;
    readonly name: string;
    addWorker(worker: Worker): void;
    removeWorker(rworker: Worker): void;
    strictlyPriorThan(job: WorkerJob): boolean;
    freeAllWorkers(): void;
    removeJob(): void;
}
