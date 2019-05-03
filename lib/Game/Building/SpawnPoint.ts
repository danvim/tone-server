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

export class SpawnPoint extends Building {
  public periodStrategy: PeriodStrategy;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.SPAWN_POINT, tilePosition);
    this.periodStrategy = new PeriodStrategy(2000, this.spawn);
  }

  public frame(prevTicks: number, currTicks: number) {
    this.periodStrategy.frame(prevTicks, currTicks);
  }

  public spawn = () => {
    const worker = new Worker(
      this.game,
      this.playerId,
      this.cartesianPos,
      new XyzEuler(1, 0, 0),
    );
  }
}
