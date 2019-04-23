import { EntityInterface, EntityType } from 'tone-core/dist/lib/Game';
import { Cartesian, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';

export class Entity extends Thing implements EntityInterface {
  public type: EntityType;
  public position: Cartesian;
  public rotation: XyzEuler;
  public velocity: Cartesian;
  public speed: number;
  public target?: Thing;
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
    this.position = position;
    this.rotation = rotation;
    this.velocity = new Cartesian(0, 0);
    this.speed = 30 / 500;
  }

  public get cartesianPos(): Cartesian {
    return this.position;
  }

  public frame(prevTicks: number, currTicks: number) {
    // this.travelByVelocity(prevTick, currTick);
    this.moveToTarget(prevTicks, currTicks);
  }

  public travelByVelocity(prevTick: number, currTick: number) {
    this.position = this.position.add(this.velocity.scale(currTick - prevTick));
  }

  public moveToTarget(prevTicks: number, currTicks: number, target?: Thing) {
    if (target) {
      this.target = target;
    }
    if (this.target) {
      const distanceToTarget = this.position.euclideanDistance(
        this.target.cartesianPos,
      );

      if (distanceToTarget < 2) {
        // perform arrive action
        this.arrive();
        this.velocity = new Cartesian(0, 0);
      } else {
        // update the velocity
        this.velocity = this.target.cartesianPos.add(this.position.scale(-1));
        this.velocity = this.velocity.scale(
          1 / this.velocity.euclideanDistance(new Cartesian(0, 0)),
        );
        this.velocity = this.velocity.scale(this.speed);

        if (
          distanceToTarget <
          this.velocity.euclideanDistance(new Cartesian(0, 0))
        ) {
          // avoid overshooting to target position
          this.position = this.target.cartesianPos;
        } else {
          this.travelByVelocity(prevTicks, currTicks);
        }
      }
    } else {
      this.travelByVelocity(prevTicks, currTicks);
    }
  }

  public setTarget(target: Thing) {
    this.target = target;
  }

  /**
   * execute when this is at the target thing
   * to be overrided by children class
   */
  public arrive() {
    //
  }
}
