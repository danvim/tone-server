import {
  BuildingInterface,
  BuildingType,
  TILE_SIZE,
} from 'tone-core/dist/lib/Game';
import { Axial, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
import { Worker, WorkerState } from '../Unit/Worker';
import { ResourceType } from '../../Helpers';
import { WorkerJob, JobPriority } from '../Unit/WorkerJob';

export class Barrack extends Building {
  public trainingDataStorage: number = 0;
  public storageJob?: WorkerJob;

  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.BARRACK, tilePosition);
  }

  public frame(prevTicks: number, currTicks: number) {
    //
  }

  public doneConstruction() {
    this.storageJob = new WorkerJob(
      this.playerId,
      this,
      ResourceType.TRAINING_DATA,
      JobPriority.LOW,
      true,
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

  public onResouceDelivered(type: ResourceType, amount: number): number {
    if (!this.isFunctional()) {
      return super.onResouceDelivered(type, amount);
    } else {
      if (type === ResourceType.TRAINING_DATA) {
        this.trainingDataStorage += amount;
        return amount;
      } else {
        return 0;
      }
    }
  }
}
