import {
  BuildingInterface,
  BuildingType,
  TILE_SIZE,
} from 'tone-core/dist/lib/Game';
import { Axial, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
import { Worker } from '../Unit/Worker';
import { ResourceType } from '../../Helpers';

export class StructGenerator extends Building {
  public static structGenPeriod = 3000;
  public periodStrategy?: PeriodStrategy;
  public amount: number = 0;
  public capacity: number = 1;
  public currTicks: number = 0;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.STRUCT_GENERATOR, tilePosition);
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
    }
  }

  public tryGiveResource(type: ResourceType, amount: number, worker: Worker) {
    if (type === ResourceType.STRUCT) {
      const a = Math.min(amount, this.amount);
      this.amount -= a;
      delete this.waitingWorkers[worker.uuid];
      return a;
    }
    this.waitingWorkers[worker.uuid] = true;
    return 0;
  }

  public doneConstruction() {
    this.periodStrategy = new PeriodStrategy(
      StructGenerator.structGenPeriod,
      this.generate,
    );
  }
}
