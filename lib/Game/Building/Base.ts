import { BuildingInterface, BuildingType } from 'tone-core/dist/lib/Game';
import { Axial, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
import { ResourceType } from '../../Helpers';
export class Base extends Building implements BuildingInterface {
  public periodStrategy: PeriodStrategy;
  public structStorage = 0;
  public trainingDataStorage = 0;
  public primeDataStorage = 0;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.BASE, tilePosition);
    this.periodStrategy = new PeriodStrategy(2000, this.generateStruct);
  }

  public frame(prevTicks: number, currTicks: number) {
    this.periodStrategy.frame(prevTicks, currTicks);
  }

  public generateStruct = () => {
    this.structStorage++;
  }

  public onResouceDelivered(type: ResourceType, amount: number) {
    switch (type) {
      case ResourceType.STRUCT:
        this.structStorage += amount;
        break;
      case ResourceType.TRAINING_DATA:
        this.trainingDataStorage += amount;
        break;
      case ResourceType.PRIME_DATA:
        this.primeDataStorage += amount;
        break;
      default:
        // unknown resource type
        return 0;
    }
    return amount;
  }

  public tryGiveResource(type: ResourceType, amount: number) {
    switch (type) {
      case ResourceType.STRUCT:
        amount = Math.min(this.structStorage, amount);
        this.structStorage -= amount;
        return amount;
      case ResourceType.TRAINING_DATA:
        amount = Math.min(this.trainingDataStorage, amount);
        this.trainingDataStorage -= amount;
        return amount;
      case ResourceType.PRIME_DATA:
        amount = Math.min(this.primeDataStorage, amount);
        this.primeDataStorage -= amount;
        return amount;
      default:
        return 0;
    }
  }
}
