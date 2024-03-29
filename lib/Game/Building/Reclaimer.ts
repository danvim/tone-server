import {
  BuildingInterface,
  BuildingType,
  TILE_SIZE,
  ResourceType,
  TERRITORY_RADIUS,
} from 'tone-core/dist/lib/Game';
import { Axial, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Building } from '.';
import { PeriodStrategy } from './PeroidStrategy';
import { Worker } from '../Unit/Worker';

export class Reclaimer extends Building {
  public amount: number = 0;
  public capacity: number = 1;
  public territoryRadius: number = TERRITORY_RADIUS[BuildingType.RECLAIMATOR];
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.RECLAIMATOR, tilePosition);
    this.game.claimTile(playerId, tilePosition, this.territoryRadius);
  }

  public onDie() {
    super.onDie();
    this.game.evaluateTerritory();
  }
}
