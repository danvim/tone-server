import { ThingInterface } from 'tone-core/dist/lib/Game';
import { Game } from '..';
import uuid from 'uuid/v4';
import { Cartesian, PackageType } from 'tone-core/dist/lib';
import { Player } from '../Player';

export class Thing implements ThingInterface {
  public game: Game;
  public uuid: string;
  public playerId: number;
  private mhp: number;
  constructor(game: Game, playerId: number, hp?: number) {
    this.game = game;
    this.playerId = playerId;
    this.mhp = hp || 100;
    this.uuid = uuid();
  }

  public get cartesianPos(): Cartesian {
    return new Cartesian(0, 0);
  }

  public get player(): Player {
    return this.game.players[this.playerId];
  }

  public get hp(): number {
    return this.mhp;
  }

  public set hp(hp: number) {
    this.mhp = Math.max(0, hp);
    this.game.emit(PackageType.UPDATE_HEALTH, {
      uid: this.uuid,
      up: Math.max(0, hp),
    });
    if (this.mhp <= 0) {
      this.onDie();
    }
  }

  public get name(): string {
    return 'Thing ' + this.uuid.substr(0, 6);
  }

  public frame(prevTick: number, currTick: number) {
    //
  }

  public onDie() {
    delete this.game.buildings[this.uuid];
  }
}
