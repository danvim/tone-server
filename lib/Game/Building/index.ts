import {
  BuildingInterface,
  BuildingType,
  BuildingProperty,
} from 'tone-core/dist/lib/Game';
import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
import { ResourceType } from '../../Helpers';

export class Building extends Thing implements BuildingInterface {
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
    super(game, playerId, 100);
    this.game.buildings[this.uuid] = this;
    this.buildingType = buildingType;
    this.tilePosition = tilePosition;
    this.structNeeded = BuildingProperty[buildingType].struct;
  }

  public isFunctional() {
    return this.structProgress >= this.structNeeded;
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
  public onResouceDelivered(type: ResourceType, amount: number): number {
    if (
      type === ResourceType.STRUCT &&
      this.structProgress < this.structNeeded
    ) {
      this.structProgress += amount;
      if (this.isFunctional()) {
        // Done
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
}
