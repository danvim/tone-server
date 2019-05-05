import { Building } from '../Building';
import { ResourceType } from '../../Helpers';
import { Player } from '../Player';
import { Game } from '..';
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
