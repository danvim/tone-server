import { Game } from '..';
import { Building } from '.';

export abstract class BuildingStrategy {
  public game: Game;
  public building: Building;
  constructor(game: Game, building: Building) {
    this.game = game;
    this.building = building;
  }
  public abstract frame(prevTicks: number, currTicks: number): void;
}
