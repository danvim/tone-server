import {
  BuildingInterface,
  BuildingType,
  TILE_SIZE,
  ResourceType,
} from 'tone-core/dist/lib/Game';
import { Axial, XyzEuler, PackageType } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
import { Worker } from '../Unit/Worker';

export class TrainingDataGenerator extends Building {
  public static dataGenPeriod = 3000;
  public periodStrategy?: PeriodStrategy;
  public amount: number = 0;
  public capacity: number = 1;
  public currTicks: number = 0;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.TRAINING_DATA_GENERATOR, tilePosition);
    this.period = TrainingDataGenerator.dataGenPeriod;
  }

  public frame(prevTicks: number, currTicks: number) {
    this.currTicks = currTicks;
    if (this.periodStrategy) {
      this.periodStrategy.frame(prevTicks, currTicks);
    }
  }

  public generate = () => {
    if (this.amount < this.capacity) {
      this.amount++;
      this.emitStorage();
    }
  }

  public tryGiveResource(type: ResourceType, amount: number, worker: Worker) {
    if (amount <= 0) {
      return 0;
    }
    if (type === ResourceType.TRAINING_DATA) {
      const a = Math.min(amount, this.amount);
      if (a > 0) {
        delete this.waitingWorkers[worker.uuid];
        this.emitStorage();
      } else {
        this.waitingWorkers[worker.uuid] = true;
      }
      this.amount -= a;
      return a;
    }
    return 0;
  }

  public doneConstruction() {
    this.periodStrategy = new PeriodStrategy(
      TrainingDataGenerator.dataGenPeriod,
      this.generate,
    );
  }

  public emitStorage() {
    this.player.emit(PackageType.UPDATE_RESOURCE_STORAGE, {
      uid: this.uuid,
      struct: 0,
      trainingData: this.amount,
      primeData: 0,
    });
  }
}
