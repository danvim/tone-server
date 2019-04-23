import {
  BuildingInterface,
  BuildingType,
  BuildingProperty,
} from 'tone-core/dist/lib/Game';
import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
import { SpawnStrategy } from './SpawnStrategy';
import { GeneratorStrategy } from './GeneratorStrategy';
import { ResourceType } from '../../Helpers';

export class Building extends Thing implements BuildingInterface {
  public buildingType: BuildingType;
  public tilePosition: Axial;
  public spawnStrategy?: SpawnStrategy;
  public structGeneratorStrategy?: GeneratorStrategy;
  public trainingDataGeneratorStrategy?: GeneratorStrategy;
  public primeDataGeneratorStrategy?: GeneratorStrategy;

  // for construction
  public structProgress: number = 0;
  public structNeeded: number = 0;

  constructor(
    game: Game,
    playerId: number,
    buildingType: BuildingType,
    tilePosition: Axial,
  ) {
    super(game, playerId, 100);
    this.game.buildings[this.uuid] = this;
    this.buildingType = buildingType;
    this.tilePosition = tilePosition;

    if (buildingType === BuildingType.SPAWN_POINT) {
      this.spawnStrategy = new SpawnStrategy(game, this);
    } else if (buildingType === BuildingType.BASE) {
      this.structGeneratorStrategy = new GeneratorStrategy(game, this);
      this.structGeneratorStrategy.capacity = -1;
      this.trainingDataGeneratorStrategy = new GeneratorStrategy(game, this);
      this.trainingDataGeneratorStrategy.setGeneratePeriod(-1);
      this.primeDataGeneratorStrategy = new GeneratorStrategy(game, this);
      this.primeDataGeneratorStrategy.setGeneratePeriod(-1);
    } else {
      this.structNeeded = BuildingProperty[buildingType].struct;
    }
  }

  public isFunctional() {
    return this.structProgress >= this.structNeeded;
  }

  public frame(prevTicks: number, currTicks: number) {
    this.spawnStrategy && this.spawnStrategy.frame(prevTicks, currTicks);
  }

  public onResouceDelivered(type: ResourceType, amount: number) {
    if (
      type === ResourceType.STRUCT &&
      this.structProgress < this.structNeeded
    ) {
      this.structProgress += amount;
      if (this.isFunctional()) {
        // Done
      }
    } else if (type === ResourceType.STRUCT && this.structGeneratorStrategy) {
      // deliver resouce which can generate or store that resource means storing this resource
      this.structGeneratorStrategy.amount += amount;
    } else if (
      type === ResourceType.TRAINING_DATA &&
      this.trainingDataGeneratorStrategy
    ) {
      this.trainingDataGeneratorStrategy.amount += amount;
    } else if (
      type === ResourceType.PRIME_DATA &&
      this.primeDataGeneratorStrategy
    ) {
      this.primeDataGeneratorStrategy.amount += amount;
    }
  }

  public tryGiveResource(type: ResourceType, amount: number) {
    if (!this.isFunctional()) {
      return 0;
    }
    if (
      type === ResourceType.STRUCT &&
      this.structGeneratorStrategy &&
      this.structGeneratorStrategy.amount > 0
    ) {
      // deliver resouce which can generate or store that resource means storing this resource
      this.structGeneratorStrategy.amount -= amount = Math.min(
        amount,
        this.structGeneratorStrategy.amount,
      );
    } else if (
      type === ResourceType.TRAINING_DATA &&
      this.trainingDataGeneratorStrategy
    ) {
      // this.trainingDataGeneratorStrategy.amount += amount;
      amount = 0;
    } else if (
      type === ResourceType.PRIME_DATA &&
      this.primeDataGeneratorStrategy
    ) {
      // this.primeDataGeneratorStrategy.amount += amount
      amount = 0;
    }
    return amount;
  }
}
