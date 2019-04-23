import { EntityInterface, EntityType } from 'tone-core/dist/lib/Game';
import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';
import { WorkerStrategy } from './WorkerStrategy';

export class Entity extends Thing implements EntityInterface {
  public type: EntityType;
  public position: Cartesian;
  public rotation: XyzEuler;
  public velocity: Cartesian;
  public workerStrategy?: WorkerStrategy;
  public speed: number;
  // public unitStrategy?: UnitStrategy;
  constructor(
    game: Game,
    playerId: number,
    type: EntityType,
    position: Cartesian,
    rotation: XyzEuler,
  ) {
    super(game, playerId, 100);
    this.game.entities[this.uuid] = this;
    this.type = type;
    this.setType(type);
    this.position = position;
    this.rotation = rotation;
    this.velocity = new Cartesian(0, 0);
    this.speed = 30 / 500;
  }

  public setType(type: EntityType) {
    this.type = type;
    if (type === EntityType.WORKER) {
      this.workerStrategy = new WorkerStrategy(this.game, this);
    }
  }

  public frame(prevTick: number, currTick: number) {
    if (this.type === EntityType.WORKER && this.workerStrategy) {
      this.workerStrategy.frame(prevTick, currTick);
    } else {
      // default action: just move by the velocity
      this.travelByVelocity(prevTick, currTick);
    }
  }

  public travelByVelocity(prevTick: number, currTick: number) {
    this.position = this.position.add(this.velocity.scale(currTick - prevTick));
  }
}
