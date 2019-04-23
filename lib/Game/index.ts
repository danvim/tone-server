import { MapGen } from './MapGen';
import { Player } from './Player';
import Conn = PeerJs.DataConnection;
import {
  Protocol,
  PackageType,
  TileType,
  BuildingType,
  Axial,
  TileMap,
} from 'tone-core/dist/lib';
import { Building } from './Building';
import { Entity } from './Entity';
import { Unit } from './Unit';
import { setInterval } from 'timers';

import { now } from '../Helpers';
import uuid = require('uuid');
// import { protocol } from '../Connection';

export class Game {
  public players: Player[];
  public protocol?: Protocol;
  public buildings: { [uuid: string]: Building };
  public entities: { [uuid: string]: Entity };
  public units: { [uuid: string]: Unit };
  public baseBuildings: { [playerId: number]: Building };
  public map: TileMap;
  public frameTimer: NodeJS.Timeout;

  // states
  public prevTicks = 0;

  // game start
  constructor(players: Player[], protocol?: Protocol) {
    this.players = players;
    this.protocol = protocol;
    this.map = MapGen();
    // global.console.log('try update tiles');
    this.emit(PackageType.UPDATE_TILES, { tiles: this.map });
    this.buildings = {};
    this.entities = {};
    this.units = {};
    this.baseBuildings = {};

    this.reassignPlayerId();
    this.initClusterTiles();
    this.initBase();

    this.frameTimer = setInterval(
      () => this.frame(this.prevTicks, now('ms')),
      30,
    );
  }

  // connection functions

  public emit(packageType: PackageType, object: object) {
    if (this.protocol) {
      this.protocol.emit(packageType, object);
    }
  }

  public mapConnToPlayer(conn: Conn) {
    return this.players.reduce((prev, player) => {
      if (player.conn && conn.peer === player.conn.peer) {
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

  // game logic functions

  public terminate() {
    clearInterval(this.frameTimer);
  }

  /**
   * Make the id of players start from 0 without holes
   */
  public reassignPlayerId() {
    this.players.forEach((player: Player, k: number) => {
      player.id = k;
      this.emit(PackageType.UPDATE_LOBBY, {
        playerId: k,
        username: player.username,
        connId: player.conn && player.conn.peer,
      });
    });
  }

  /**
   * assign clusters to players
   */
  public initClusterTiles() {
    let initedClusterCount = 0;
    Object.keys(this.map).forEach((axialString: string) => {
      const tileInfo = this.map[axialString];
      if (tileInfo.type === TileType.INFORMATION_CLUSTER) {
        const playerId = initedClusterCount++;
        const [q, r] = axialString.split(',').map(Number);
        const cluster = new Building(
          this,
          playerId,
          BuildingType.SPAWN_POINT,
          new Axial(q, r),
        );
      }
    });
  }

  public initBase() {
    const base0 = new Building(this, 0, BuildingType.BASE, new Axial(0, 0));
    this.baseBuildings[0] = base0;
  }

  public myBuildings(playerId: number): { [uuid: string]: Building } {
    const buildings: { [uuid: string]: Building } = {};
    for (const key in this.buildings) {
      if (this.buildings[key].playerId === playerId) {
        buildings[key] = this.buildings[key];
      }
    }
    return buildings;
  }

  public opponentBuildings(playerId: number): { [uuid: string]: Building } {
    const buildings: { [uuid: string]: Building } = {};
    for (const key in this.buildings) {
      if (this.buildings[key].playerId !== playerId) {
        buildings[key] = this.buildings[key];
      }
    }
    return buildings;
  }

  public myEntities(playerId: number): { [uuid: string]: Entity } {
    const entities: { [uuid: string]: Entity } = {};
    for (const key in this.entities) {
      if (this.entities[key].playerId === playerId) {
        entities[key] = this.entities[key];
      }
    }
    return entities;
  }

  public opponentEntities(playerId: number): { [uuid: string]: Entity } {
    const entities: { [uuid: string]: Entity } = {};
    for (const key in this.entities) {
      if (this.entities[key].playerId !== playerId) {
        entities[key] = this.entities[key];
      }
    }
    return entities;
  }

  public frame(prevTicks: number, currTicks: number) {
    Object.keys(this.buildings).forEach((key: string) => {
      const building = this.buildings[key];
      building.frame(prevTicks, currTicks);
    });

    Object.keys(this.entities).forEach((key: string) => {
      const entity = this.entities[key];
      entity.frame(prevTicks, currTicks);
      const [x, z] = entity.position.asArray;
      this.emit(PackageType.MOVE_ENTITY, { uuid, x, y: 5, z });
    });

    this.prevTicks = currTicks;
  }

  public test() {
    //
  }
}
