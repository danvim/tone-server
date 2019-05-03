import { UnitInterface } from 'tone-core/dist/lib/Game/Unit';
import {
  Cartesian,
  FightingStyle,
  XyzEuler,
  EntityType,
} from 'tone-core/dist/lib';
import { Game } from '..';
import { Entity } from '../Entity';

export class Unit extends Entity implements UnitInterface {
  public fightingStyle: FightingStyle;
  constructor(
    game: Game,
    playerId: number,
    type: EntityType,
    position: Cartesian,
    rotation: XyzEuler,
  ) {
    super(game, playerId, type, position, rotation);
    this.game.units[this.uuid] = this;
    this.fightingStyle = FightingStyle.PASSIVE;
  }

  public onDie() {
    delete this.game.units[this.uuid];
    super.onDie();
  }
}
