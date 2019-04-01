import { MapGen, Map } from './MapGen';
import { Player } from './Player';
import Conn = PeerJs.DataConnection;
import { Protocol, PackageType } from 'tone-core/dist/lib';
import { Building } from './Building';
import { Entity } from './Entity';
import { Unit } from './Unit';

export class Game {
  players: Array<Player>;
  protocol: Protocol;
  buildings: { [uuid: string]: Building };
  entities: { [uuid: string]: Entity };
  units: { [uuid: string]: Unit };

  // building: Array<Building>;
  map: Map;
  constructor(players: Array<Player>, protocol: Protocol) {
    this.players = players;
    this.protocol = protocol;
    this.map = MapGen();
    console.log('try update tiles');
    protocol.emit(PackageType.UPDATE_TILES, { tiles: this.map });
    this.buildings = {};
    this.entities = {};
    this.units = {};
  }
  mapConnToPlayer = (conn: Conn) => {
    return this.players.reduce((prev, player) => {
      if (conn.peer == player.conn.peer) prev = player;
      return prev;
    });
  };
  initProtocol = (protocol: Protocol) => {
    // protocol.on(PackageType.TRY_BUILD,);
  };
  frame = () => {
    this.moveAllEntitiesAndUnits();
  };
  moveAllEntitiesAndUnits = () => {
    const time = 1;
    for (let uuid in this.entities) {
      const entity = this.entities[uuid];
      entity.position.add(entity.velocity.scale(time));
      const [x, z] = entity.position.asArray;
      this.protocol.emit(PackageType.MOVE_ENTITY, { uuid, x, y: 5, z });
    }
  };
  test() {}
}
