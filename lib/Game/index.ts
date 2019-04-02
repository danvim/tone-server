import { MapGen, Map } from './MapGen';
import { Player } from './Player';
import Conn = PeerJs.DataConnection;
import { Protocol, PackageType } from 'tone-core/dist/lib';
import { Building } from './Building';
import { Entity } from './Entity';
import { Unit } from './Unit';

export class Game {
  public players: Player[];
  public protocol: Protocol;
  public buildings: { [uuid: string]: Building };
  public entities: { [uuid: string]: Entity };
  public units: { [uuid: string]: Unit };

  // building: Array<Building>;
  public map: Map;
  constructor(players: Player[], protocol: Protocol) {
    this.players = players;
    this.protocol = protocol;
    this.map = MapGen();
    global.console.log('try update tiles');
    protocol.emit(PackageType.UPDATE_TILES, { tiles: this.map });
    this.buildings = {};
    this.entities = {};
    this.units = {};
  }
  public mapConnToPlayer(conn: Conn) {
    return this.players.reduce((prev, player) => {
      if (conn.peer === player.conn.peer) {
        prev = player;
      }
      return prev;
    });
  }
  public initProtocol(protocol: Protocol) {
    // protocol.on(PackageType.TRY_BUILD,);
  }
  public rejoin(player: Player) {
    player.emit(PackageType.UPDATE_TILES, { tiles: this.map });
  }
  public frame() {
    this.moveAllEntitiesAndUnits();
  }
  public moveAllEntitiesAndUnits() {
    const time = 1;
    Object.keys(this.entities).forEach((uuid: string) => {
      const entity = this.entities[uuid];
      entity.position.add(entity.velocity.scale(time));
      const [x, z] = entity.position.asArray;
      this.protocol.emit(PackageType.MOVE_ENTITY, { uuid, x, y: 5, z });
    });
  }
  public test() {
    //
  }
}
