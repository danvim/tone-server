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

export class StructGenerator extends Building {
  public static structGenPeriod = 3000;
  public periodStrategy?: PeriodStrategy;
  public amount: number = 0;
  public capacity: number = 1;
  public currTicks: number = 0;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.STRUCT_GENERATOR, tilePosition);
    this.period = StructGenerator.structGenPeriod;
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
    if (type === ResourceType.STRUCT) {
      const a = Math.min(amount, this.amount);
      if (a > 0) {
        this.emitStorage();
        delete this.waitingWorkers[worker.uuid];
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
      StructGenerator.structGenPeriod,
      this.generate,
    );
  }

  public emitStorage() {
    this.player.emit(PackageType.UPDATE_RESOURCE_STORAGE, {
      uid: this.uuid,
      struct: this.amount,
      trainingData: 0,
      primeData: 0,
    });
  }
}
