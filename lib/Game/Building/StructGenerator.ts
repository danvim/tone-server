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

export class StructGenerator extends Building implements BuildingInterface {
  public periodStrategy: PeriodStrategy;
  public amount: number = 0;
  public capacity: number = 1;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.STRUCT_GENERATOR, tilePosition);
    this.periodStrategy = new PeriodStrategy(100, this.generate);
  }

  public frame(prevTicks: number, currTicks: number) {
    this.periodStrategy.frame(prevTicks, currTicks);
  }

  public generate = () => {
    if (this.amount < this.capacity) {
      this.amount++;
    }
  }

  public tryGiveResource(type: ResourceType, amount: number) {
    if (type === ResourceType.STRUCT) {
      const a = Math.min(amount, this.amount);
      this.amount -= a;
      return a;
    }
    return 0;
  }
}
