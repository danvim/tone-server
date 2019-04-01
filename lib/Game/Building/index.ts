import { BuildingInterface, BuildingType } from 'tone-core/dist/lib/Game';
import { Axial } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';

export class Building extends Thing implements BuildingInterface {
  public buildingType: BuildingType;
  public tilePosition: Axial;
  constructor(
    game: Game,
    playerId: number,
    buildingType: BuildingType,
    tilePosition: Axial,
  ) {
    super(game, playerId, 100);
    this.buildingType = buildingType;
    this.tilePosition = tilePosition;
  }
}
