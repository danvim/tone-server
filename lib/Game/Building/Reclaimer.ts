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

export class Reclaimer extends Building implements BuildingInterface {
  public amount: number = 0;
  public capacity: number = 1;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.RECLAIMATOR, tilePosition);
    this.game.claimTile(playerId, tilePosition, 3);
  }

  public onDie() {
    super.onDie();
    this.game.evaluateTerritory();
  }
}
