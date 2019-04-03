import { UnitInterface, Cartesian, FightingStyle, XyzEuler } from 'tone-core/dist/lib';
import { Game } from '..';
import { Entity } from '../Entity';

export class Unit extends Entity implements UnitInterface {
  public fightingStyle: FightingStyle;
  constructor(
    game: Game,
    playerId: number,
    position: Cartesian,
    rotation: XyzEuler,
  ) {
    super(game, playerId, position, rotation);
    this.fightingStyle = FightingStyle.PASSIVE;
  }

  public frame = (prevTick: number, currTick: number) => {
    super.frame(prevTick, currTick);
  }
}
