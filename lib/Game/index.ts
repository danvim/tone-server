import { MapGen, Map } from './MapGen';
import { Player } from '../Player';
import { Protocol, PackageType } from 'tone-core/dist/lib';

export class Game {
  players: Array<Player>;
  protocol: Protocol;
  map: Map;
  constructor(players: Array<Player>, protocol: Protocol) {
    this.players = players;
    this.protocol = protocol;
    this.map = MapGen();
    protocol.emit(PackageType.UPDATE_TILES, { tiles: this.map });
  }
  test() {}
}
