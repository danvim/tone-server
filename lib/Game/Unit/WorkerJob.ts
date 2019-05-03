import { Building } from '../Building';
import { ResourceType } from '../../Helpers';
import { Player } from '../Player';
import { Game } from '..';
import uuid from 'uuid/v4';
import { BuildingType } from 'tone-core/dist/lib';
import { Worker } from './Worker';
import { Barrack } from '../Building/Barrack';

export enum JobPriority {
  LOW,
  MEDIUM,
  HIGH,
  EXCLUSIVE,
}

export enum JobNature {
  CONSTRUCTION,
  STORAGE,
  RECRUITMENT,
}

export class WorkerJob {
  public id: string;
  public workers: Worker[] = [];
  public target: Building;
  public progressOnTheWay: number = 0;
  public playerId: number;
  public priority: JobPriority;
  public resourceType: ResourceType;
  public jobNature: JobNature;
  constructor(
    playerId: number,
    target: Building,
    resourceType: ResourceType,
    priority: JobPriority,
    jobNature: JobNature,
  ) {
    this.id = uuid();
    this.target = target;
    this.resourceType = resourceType;
    this.playerId = playerId;
    this.priority = priority;
    this.jobNature = jobNature;
    this.game.workerJobs[this.id] = this;
  }

  public get progressNeed(): number {
    if (
      this.resourceType === ResourceType.STRUCT &&
      this.target.structProgress < this.target.structNeeded
    ) {
      return (
        this.target.structNeeded -
        this.progressOnTheWay -
        this.target.structProgress
      );
    } else if (this.jobNature === JobNature.STORAGE) {
      return 9999;
    } else {
      delete this.game.workerJobs[this.id];
      return 0;
    }
  }

  public get needWorker(): boolean {
    if (this.jobNature === JobNature.STORAGE) {
      return true;
    }
    if (this.jobNature === JobNature.RECRUITMENT) {
      const barrack = this.target as Barrack;
      return (
        barrack.soldierQuota -
          barrack.trainingCount -
          barrack.soldiers.length -
          this.progressOnTheWay >
        0
      );
    }
    if (this.target.isFunctional()) {
      return false;
    }
    return this.progressNeed > 0;
  }

  public get game(): Game {
    return this.target.game;
  }

  public get player(): Player {
    return this.game.players[this.playerId];
  }

  public get name(): string {
    return `[${JobPriority[this.priority]}] ${this.target.name} ${
      JobNature[this.jobNature]
    }`;
  }

  public addWorker(worker: Worker) {
    this.workers.push(worker);
  }

  public removeWorker(rworker: Worker) {
    this.workers = this.workers.filter(
      (worker: Worker) => worker.uuid !== rworker.uuid,
    );
    if (this.jobNature === JobNature.STORAGE) {
      return;
    }
    if (this.workers.length === 0) {
      delete this.game.workerJobs[this.id];
    }
  }

  public strictlyPriorThan(job: WorkerJob) {
    return this.priority > job.priority;
  }
}
