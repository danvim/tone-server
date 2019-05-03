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

export class TrainingDataGenerator extends Building {
  public periodStrategy?: PeriodStrategy;
  public amount: number = 0;
  public capacity: number = 1;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.TRAINING_DATA_GENERATOR, tilePosition);
  }

  public frame(prevTicks: number, currTicks: number) {
    if (this.periodStrategy) {
      this.periodStrategy.frame(prevTicks, currTicks);
    }
  }

  public generate = () => {
    if (this.amount < this.capacity) {
      this.amount++;
    }
  }

  public tryGiveResource(type: ResourceType, amount: number) {
    if (type === ResourceType.TRAINING_DATA) {
      const a = Math.min(amount, this.amount);
      this.amount -= a;
      return a;
    }
    return 0;
  }

  public doneConstruction() {
    this.periodStrategy = new PeriodStrategy(1000, this.generate);
  }
}
