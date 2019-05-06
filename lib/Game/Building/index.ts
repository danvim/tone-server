import {
  BuildingInterface,
  BuildingType,
  BuildingProperty,
  TILE_SIZE,
} from 'tone-core/dist/lib/Game';
import { Axial, Cartesian, PackageType } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
import { ResourceType, SNAKE2Normal } from '../../Helpers';
import { Base } from './Base';
import { SpawnPoint } from './SpawnPoint';
import { WorkerJob } from '../Unit/WorkerJob';
import { Worker } from '../Unit/Worker';
import { JobPriority, JobNature } from 'tone-core/dist/lib/Game/Job';
// // export {} from './';

export class Building extends Thing implements BuildingInterface {
  public get cartesianPos(): Cartesian {
    return this.tilePosition.toCartesian(TILE_SIZE);
  }

  public get name(): string {
    return (
      SNAKE2Normal(BuildingType[this.buildingType]) +
      ' ' +
      this.uuid.substr(0, 6)
    );
  }

  public buildingType: BuildingType;
  public tilePosition: Axial;

  // for construction
  public structProgress: number = 0;
  public structNeeded: number = 0;

  constructor(
    game: Game,
    playerId: number,
    buildingType: BuildingType,
    tilePosition: Axial,
  ) {
    super(game, playerId, 1000);
    this.game.buildings[this.uuid] = this;
    this.buildingType = buildingType;
    this.tilePosition = tilePosition;
    this.structNeeded = BuildingProperty[buildingType].struct;
    if (this.structNeeded > 0) {
      const j = new WorkerJob(
        playerId,
        this,
        ResourceType.STRUCT,
        JobPriority.MEDIUM,
        JobNature.CONSTRUCTION,
      );
    }
    this.game.emit(PackageType.BUILD, {
      playerId,
      uid: this.uuid,
      buildingType,
      axialCoords: [tilePosition],
      progress: this.structProgress,
    });
  }

  public isFunctional() {
    return this.structProgress >= this.structNeeded && this.hp > 0;
  }

  public frame(prevTicks: number, currTicks: number) {
    //
  }

  /**
   * By default only on construction building can get struct resource
   * @param type resource type
   * @param amount amount of resource trying to get
   * @return amount that this building really get
   */
  public onResouceDelivered(
    type: ResourceType,
    amount: number,
    worker?: Worker,
  ): number {
    if (
      type === ResourceType.STRUCT &&
      this.structProgress < this.structNeeded
    ) {
      this.structProgress += amount;

      this.game.emit(PackageType.BUILD, {
        playerId: this.playerId,
        uid: this.uuid,
        buildingType: this.buildingType,
        axialCoords: [this.tilePosition],
        progress: this.structProgress,
      });
      if (this.isFunctional()) {
        this.doneConstruction();
      }
      return amount;
    }
    return 0;
  }

  /**
   * By defaul building cannot give resource
   * @param type resource type
   * @param amount request amount
   * @return real amount given out
   */
  public tryGiveResource(type: ResourceType, amount: number) {
    return 0;
  }

  /**
   * Call when done construction
   */
  public doneConstruction() {
    // To be overriden
  }
}
