import {
  BuildingInterface,
  BuildingType,
  TILE_SIZE,
  EntityType,
} from 'tone-core/dist/lib/Game';
import { Axial, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
import { Worker, WorkerState } from '../Unit/Worker';
import { ResourceType } from '../../Helpers';
import { WorkerJob, JobPriority, JobNature } from '../Unit/WorkerJob';
import { Soldier } from '../Unit/Soldier';

export class Barrack extends Building {
  public trainingDataStorage: number = 0;
  public storageJob?: WorkerJob;
  public soldierVariant: EntityType = EntityType.SOLDIER_0;
  public soldierQuota: number = 3;
  public soldiers: Soldier[] = [];
  public recruitmentJob?: WorkerJob;

  public trainingCount = 0; // number of soldiers now training
  public trainingTime = 3000; // total ticks required to train a soldier
  public trainStartTime = 0; // the start tick of current training soldier
  public nowTraining = false; // now barrack is training

  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.BARRACK, tilePosition);
  }

  public frame(prevTicks: number, currTicks: number) {
    if (this.nowTraining) {
      if (currTicks >= this.trainStartTime + this.trainingTime) {
        this.trainingCount--;
        this.soldiers.push(
          new Soldier(
            this.game,
            this.playerId,
            this.soldierVariant,
            this.cartesianPos,
            this,
          ),
        );
        this.nowTraining = false;
      }
    } else {
      if (this.trainingCount > 0) {
        this.trainStartTime = currTicks;
        this.nowTraining = true;
      }
    }
  }

  public doneConstruction() {
    this.storageJob = new WorkerJob(
      this.playerId,
      this,
      ResourceType.TRAINING_DATA,
      JobPriority.LOW,
      JobNature.STORAGE,
    );
  }

  public onDie() {
    if (this.storageJob) {
      this.storageJob.workers.forEach((worker: Worker) => {
        delete worker.job;
        if (worker.state === WorkerState.DELIVERING) {
          worker.target = this.game.bases[this.playerId];
        } else {
          worker.findJob();
        }
      });
      delete this.game.workerJobs[this.storageJob.id];
    }
  }

  public onResouceDelivered(
    type: ResourceType,
    amount: number,
    worker?: Worker,
  ): number {
    if (!this.isFunctional()) {
      return super.onResouceDelivered(type, amount, worker);
    } else {
      if (type === ResourceType.TRAINING_DATA) {
        this.trainingDataStorage += amount;
        return amount;
      } else if (type === ResourceType.WORKER) {
        if (this.soldiers.length + this.trainingCount < this.soldierQuota) {
          this.trainingCount++;
          return 1;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    }
  }

  public callForRecuitment() {
    this.recruitmentJob = new WorkerJob(
      this.playerId,
      this,
      ResourceType.WORKER,
      JobPriority.EXCLUSIVE,
      JobNature.RECRUITMENT,
    );
    return this.recruitmentJob;
  }
}
