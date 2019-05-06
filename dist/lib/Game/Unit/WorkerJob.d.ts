import { Building } from '../Building';
import { Player } from '../Player';
import { Game } from '..';
import { ResourceType } from 'tone-core/dist/lib';
import { Worker } from './Worker';
import { JobPriority, JobNature } from 'tone-core/dist/lib/Game/Job';
export declare class WorkerJob {
    id: string;
    workers: Worker[];
    target: Building;
    progressOnTheWay: number;
    playerId: number;
    priority: JobPriority;
    resourceType: ResourceType;
    jobNature: JobNature;
    dirty: boolean;
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
    sendUpdateJob(): void;
}
