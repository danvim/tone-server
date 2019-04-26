import { ThingInterface } from 'tone-core/dist/lib/Game';
import { Game } from '..';
import uuid from 'uuid/v4';
import { Cartesian } from 'tone-core/dist/lib';
import { Player } from '../Player';

export class Thing implements ThingInterface {
  public game: Game;
  public uuid: string;
  public hp: number;
  public playerId: number;
  constructor(game: Game, playerId: number, hp?: number) {
    this.game = game;
    this.playerId = playerId;
    this.hp = hp || 100;
    this.uuid = uuid();
  }

  public get cartesianPos(): Cartesian {
    return new Cartesian(0, 0);
  }

  public get player(): Player {
    return this.game.players[this.playerId];
  }

  public frame(prevTick: number, currTick: number) {
    //
  }
}
