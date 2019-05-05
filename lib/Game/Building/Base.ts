import { BuildingInterface, BuildingType } from 'tone-core/dist/lib/Game';
import { Axial, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
import { ResourceType } from '../../Helpers';
import { WorkerJob } from '../Unit/WorkerJob';
import { JobPriority, JobNature } from 'tone-core/dist/lib/Game/Job';
export class Base extends Building implements BuildingInterface {
  public static structGenPeriod = 5000;
  public periodStrategy: PeriodStrategy;
  public structStorage = 0;
  public trainingDataStorage = 0;
  public primeDataStorage = 0;
  public territoryRadius: number = 8;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.BASE, tilePosition);
    this.periodStrategy = new PeriodStrategy(
      Base.structGenPeriod,
      this.generateStruct,
    );
    const s = new WorkerJob(
      playerId,
      this,
      ResourceType.STRUCT,
      JobPriority.LOW,
      JobNature.STORAGE,
    );
    const t = new WorkerJob(
      playerId,
      this,
      ResourceType.TRAINING_DATA,
      JobPriority.LOW,
      JobNature.STORAGE,
    );
    const p = new WorkerJob(
      playerId,
      this,
      ResourceType.PRIME_DATA,
      JobPriority.LOW,
      JobNature.STORAGE,
    );
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
