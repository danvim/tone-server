import { Building } from '../Building';
import { Player } from '../Player';
import { Game } from '..';
import uuid from 'uuid/v4';
import { BuildingType, PackageType, ResourceType } from 'tone-core/dist/lib';
import { Worker, WorkerState } from './Worker';
import { Barrack } from '../Building/Barrack';
import { JobPriority, JobNature, JobQuota } from 'tone-core/dist/lib/Game/Job';

export class WorkerJob {
  public id: string;
  public workers: Worker[] = [];
  public target: Building;
  public progressOnTheWay: number = 0;
  public playerId: number;
  public priority: JobPriority;
  public resourceType: ResourceType;
  public jobNature: JobNature;
  public dirty = false;
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
    // if (this.workers.length >= JobQuota[this.jobNature]) {
    //   console.log(this.workers.length, JobQuota, this.jobNature);
    //   return false;
    // } else {
    //   console.log(this.workers.length, JobQuota, this.jobNature);
    // }
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
    this.dirty = true;
  }

  public removeWorker(rworker: Worker) {
    this.workers = this.workers.filter(
      (worker: Worker) => worker.uuid !== rworker.uuid,
    );
    if (this.jobNature === JobNature.STORAGE) {
      this.dirty = true;
      return;
    }
    if (this.workers.length === 0 && this.needWorker === false) {
      if (this.progressOnTheWay > 0) {
        this.progressOnTheWay = 0;
      } else {
        this.removeJob();
      }
    }
    this.dirty = true;
  }

  public strictlyPriorThan(job: WorkerJob) {
    return this.priority > job.priority;
  }

  public freeAllWorkers() {
    this.workers.forEach((worker: Worker) => {
      delete worker.job;
      if (worker.state === WorkerState.DELIVERING) {
        worker.target = this.game.bases[this.playerId];
      } else {
        worker.findJob();
      }
    });
    this.dirty = true;
  }

  public removeJob() {
    this.freeAllWorkers();
    delete this.game.workerJobs[this.id];
    this.priority = JobPriority.SUSPENDED;
    this.sendUpdateJob();
  }

  public sendUpdateJob() {
    this.player.emit(PackageType.UPDATE_JOB, {
      jobId: this.id,
      buildingId: this.target.uuid,
      workerIds: this.workers.map((w: Worker) => w.uuid),
      priority: this.priority,
      nature: this.jobNature,
      resourceType: this.resourceType,
    });
    this.dirty = false;
  }
}
