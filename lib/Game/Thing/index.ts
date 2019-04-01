import { ThingInterface } from 'tone-core/dist/lib/Game';
import { Game } from '..';
const uuid = require('uuid/v4');

export class Thing implements ThingInterface {
  game: Game;
  uuid: string;
  hp: number;
  playerId: number;
  constructor(game: Game, playerId: number, hp?: number) {
    this.game = game;
    this.playerId = playerId;
    this.hp = hp || 100;
    this.uuid = uuid();
  }

  public frame(prevTick: number, currTick: number) {}
}
