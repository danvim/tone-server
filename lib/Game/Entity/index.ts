import { EntityInterface } from 'tone-core/dist/lib/Game';
import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';

export class Entity extends Thing implements EntityInterface {
  public position: Cartesian;
  public rotation: XyzEuler;
  public velocity: Cartesian;
  constructor(
    game: Game,
    playerId: number,
    position: Cartesian,
    rotation: XyzEuler,
  ) {
    super(game, playerId, 100);
    this.position = position;
    this.rotation = rotation;
    this.velocity = new Cartesian(0, 0);
  }

  public frame(prevTick: number, currTick: number) {
    this.position = this.position.add(this.velocity.scale(currTick - prevTick));
  }
}
