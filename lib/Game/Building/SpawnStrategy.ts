import { BuildingStrategy } from './BuildingStrategy';
import { Game } from '..';
import { Building } from '.';
import { Entity } from '../Entity';
import { TILE_SIZE, XyzEuler, EntityType } from 'tone-core/dist/lib';

export class SpawnStrategy extends BuildingStrategy {
  private period: number = -1;
  private prevSpawnTicks = 0;
  constructor(game: Game, building: Building) {
    super(game, building);
    this.period = 2000;
  }
  public setSpawnPeriod(period: number) {
    this.period = period;
  }
  public frame(prevTicks: number, currTicks: number) {
    if (this.period !== -1 && currTicks - this.prevSpawnTicks >= this.period) {
      this.prevSpawnTicks = currTicks;
      const worker = new Entity(
        this.game,
        this.building.playerId,
        EntityType.WORKER,
        this.building.tilePosition.toCartesian(TILE_SIZE),
        new XyzEuler(1, 0, 0),
      );
    }
  }
}
