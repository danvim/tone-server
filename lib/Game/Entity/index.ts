import { EntityInterface, EntityType } from 'tone-core/dist/lib/Game';
import { Cartesian, XyzEuler, PackageType } from 'tone-core/dist/lib';
import { Game } from '..';
import { Thing } from '../Thing';

export class Entity extends Thing implements EntityInterface {
  public set target(target: Thing | undefined) {
    this.mtarget = target;
    this.updateVelocity();
  }

  public get target(): Thing | undefined {
    return this.mtarget;
  }

  public get cartesianPos(): Cartesian {
    return this.position;
  }
  public type: EntityType;
  public position: Cartesian;
  public rotation: XyzEuler;
  public velocity: Cartesian;
  public speed: number;
  public arriveRange: number = 0;
  private mtarget?: Thing;
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
    this.game.emit(PackageType.SPAWN_ENTITY, {
      uid: this.uuid,
      position: this.position,
      entityType: this.type,
      playerId: this.playerId,
    });
  }

  public frame(prevTicks: number, currTicks: number) {
    // this.travelByVelocity(prevTick, currTick);
    this.moveToTarget(prevTicks, currTicks);
  }

  public travelByVelocity(prevTick: number, currTick: number) {
    this.position.add(this.velocity.scaled(currTick - prevTick));
  }

  public moveToTarget(prevTicks: number, currTicks: number, target?: Thing) {
    if (target) {
      this.target = target;
    }
    if (this.target) {
      const distanceToTarget = this.position.euclideanDistance(
        this.target.cartesianPos,
      );

      if (distanceToTarget <= this.arriveRange) {
        // perform arrive action
        this.arrive();
        this.velocity = new Cartesian(0, 0);
      } else {
        this.updateVelocity();
        if (distanceToTarget < this.velocity.norm() * (currTicks - prevTicks)) {
          // avoid overshooting to target position
          this.position = this.target.cartesianPos.clone();
          this.arrive();
          this.velocity = new Cartesian(0, 0);
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
    this.updateVelocity();
  }

  public updateVelocity() {
    if (this.target) {
      let [x, z] = this.position.asArray;
      const position = new Cartesian(x, z);
      [x, z] = this.target.cartesianPos.asArray;
      this.velocity = new Cartesian(x, z);
      this.velocity.add(position.scale(-1));
      const dist = this.velocity.euclideanDistance(new Cartesian(0, 0));
      if (dist === 0) {
        this.velocity = new Cartesian(0, 0);
      } else {
        this.velocity.scale(1 / dist);
        this.velocity.scale(this.speed);
      }
    }
  }

  /**
   * execute when this is at the target thing
   * to be overrided by children class
   */
  public arrive() {
    //
  }
}
