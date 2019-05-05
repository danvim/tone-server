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
import { MAX_UNIT_CNT } from '../../Helpers';

export class SpawnPoint extends Building {
  public static spawnPeriod = 30000;
  public periodStrategy: PeriodStrategy;
  constructor(game: Game, playerId: number, tilePosition: Axial) {
    super(game, playerId, BuildingType.SPAWN_POINT, tilePosition);
    this.periodStrategy = new PeriodStrategy(
      SpawnPoint.spawnPeriod,
      this.spawn,
    );
  }

  public frame(prevTicks: number, currTicks: number) {
    this.periodStrategy.frame(prevTicks, currTicks);
  }

  public spawn = () => {
    if (Object.values(this.game.myUnits(this.playerId)).length < MAX_UNIT_CNT) {
      const worker = new Worker(
        this.game,
        this.playerId,
        this.cartesianPos,
        new XyzEuler(1, 0, 0),
      );
    }
  }
}
