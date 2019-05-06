import { UnitInterface } from 'tone-core/dist/lib/Game/Unit';
import {
  Cartesian,
  XyzEuler,
  EntityType,
  TILE_SIZE,
  BuildingType,
  PackageType,
  AnimType,
  FightingStyle,
  ResourceType,
} from 'tone-core/dist/lib';
import { Game } from '..';
import { Entity } from '../Entity';
import { Building } from '../Building';
import { Thing } from '../Thing';
import { Barrack } from '../Building/Barrack';

export class Bullet extends Entity {
  public damage: number;
  constructor(
    game: Game,
    playerId: number,
    position: Cartesian,
    target: Thing,
    damage: number,
  ) {
    const dir = target.cartesianPos.scaled(-1).added(position);
    const [x, y, z] = dir.asArray;
    // const rotation = new XyzEuler(Math.atan2(z,y), Math.atan2(z,x), )
    super(game, playerId, EntityType.BULLET_0, position, new XyzEuler(0, 0, 0));
    this.target = target;
    this.damage = damage;
    this.speed = TILE_SIZE / 100;
  }

  public arrive() {
    if (this.target) {
      this.target.hp -= this.damage;
    }
    this.hp = 0;
    super.onDie();
  }
}
