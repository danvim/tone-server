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
  TryBuildMessage,
} from 'tone-core/dist/lib';
import { Building } from './Building';
import { Entity } from './Entity';
import { Unit } from './Unit';
import { setInterval } from 'timers';

import { now } from '../Helpers';
import uuid = require('uuid');
import { SpawnPoint } from './Building/SpawnPoint';
import { Base } from './Building/Base';
import { buildingFactory } from './Building/BuildingFactory';
import { Message } from 'protobufjs';
import { Reclaimer } from './Building/Reclaimer';
// import { protocol } from '../Connection';

export class Game {
  public players: Player[];
  public protocol: Protocol;
  public buildings: { [uuid: string]: Building };
  public entities: { [uuid: string]: Entity };
  public units: { [uuid: string]: Unit };
  public bases: { [playerId: number]: Base };
  public map: TileMap;
  public frameTimer?: NodeJS.Timeout;
  public playerClaimTile: {
    [playerId: number]: {
      [axialString: string]: boolean;
    };
  } = {};

  // states
  public prevTicks = 0;

  // game start
  constructor(players: Player[], protocol: Protocol) {
    this.players = [];
    this.protocol = protocol;
    this.map = MapGen();
    // global.console.log('try update tiles');
    this.emit(PackageType.UPDATE_TILES, { tiles: this.map });
    this.buildings = {};
    this.entities = {};
    this.units = {};
    this.bases = {};

    this.reassignPlayerId(players);
    this.initClusterTiles();
    this.initBase();
    this.evaluateTerritory();

    this.frameTimer = setInterval(
      () => this.frame(this.prevTicks, now('ms')),
      100,
    );
  }

  // connection functions

  public emit(packageType: PackageType, object: object) {
    if (this.protocol) {
      this.protocol.emit(packageType, object);
    }
  }

  public mapConnToPlayer(conn: Conn) {
    return this.players.find(
      (player: Player) => !!player.conn && conn.peer === player.conn.peer,
    );
  }

  public initProtocol(protocol: Protocol) {
    protocol.on(PackageType.TRY_BUILD, this.build);
  }

  public rejoin(player: Player) {
    player.emit(PackageType.UPDATE_TILES, { tiles: this.map });
  }

  // game logic functions

  public terminate() {
    if (this.frameTimer) {
      clearInterval(this.frameTimer);
    }
  }

  /**
   * Make the id of players start from 0 without holes
   */
  public reassignPlayerId(players: Player[]) {
    players.forEach((player: Player, k: number) => {
      this.players[player.id] = player;
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
        const cluster = new SpawnPoint(
          this,
          playerId,
          Axial.fromString(axialString),
        );
      }
    });
  }

  public initBase() {
    const locations = [
      new Axial(0, 0),
      new Axial(10, 0),
      new Axial(10, 10),
      new Axial(0, 10),
    ];
    this.players.forEach((player: Player, k: number) => {
      const base0 = new Base(this, player.id, locations[k]);
      this.bases[player.id] = base0;
    });
  }

  public evaluateTerritory() {
    this.playerClaimTile = {};
    this.players.forEach((player: Player, k: number) => {
      this.playerClaimTile[player.id] = {};
      this.claimTile(
        player.id,
        this.bases[player.id].tilePosition,
        this.bases[player.id].territoryRadius,
      );
    });
    Object.values(this.buildings).forEach((building: Building) => {
      if (building.buildingType === BuildingType.RECLAIMATOR) {
        this.claimTile(
          building.player.id,
          building.tilePosition,
          (building as Reclaimer).territoryRadius,
        );
      }
    });
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

  public myUnits(playerId: number): { [uuid: string]: Unit } {
    const units: { [uuid: string]: Unit } = {};
    for (const key in this.units) {
      if (this.units[key].playerId === playerId) {
        units[key] = this.units[key];
      }
    }
    return units;
  }

  public opponentUnits(playerId: number): { [uuid: string]: Unit } {
    const units: { [uuid: string]: Unit } = {};
    for (const key in this.units) {
      if (this.units[key].playerId !== playerId) {
        units[key] = this.units[key];
      }
    }
    return units;
  }

  public build = (object: Message<TryBuildMessage>, conn: Conn) => {
    const player = this.mapConnToPlayer(conn);
    if (player) {
      const { buildingType, axialCoords } = Object(object);
      const canBuild = axialCoords.reduce((flag: boolean, axial: Axial) => {
        return (
          flag &&
          this.playerClaimTile[player.id][axial.asString] &&
          Object.values(this.myBuildings(player.id)).findIndex(
            (building: Building) =>
              building.tilePosition.asString === axial.asString,
          ) === -1
        );
      }, true);
      if (!canBuild) {
        return false;
      }
      let axialCoord;
      if (axialCoords.length > 1) {
        axialCoord = axialCoords.reduce(
          (carry: Axial, axial: Axial) => carry.add(axial),
          axialCoords[0].clone(),
        );
      } else if (axialCoords.length > 0) {
        axialCoord = axialCoords[0];
      }
      buildingFactory(this, player.id, buildingType, axialCoord);
      return true;
    }
    return false;
  }

  public claimTile(playerId: number, axialLocation: Axial, radius: number) {
    axialLocation.range(radius).forEach((axial: Axial) => {
      this.playerClaimTile[playerId][axial.asString] = true;
    });
    // for (let i = -radius; i <= radius; i++) {
    //   for (let j = -radius; j <= radius; j++) {
    //     if (Math.abs(i) + Math.abs(j) <= radius) {
    //       let [q, r] = axialLocation.asArray;
    //       q += i;
    //       r += j;
    //       this.playerClaimTile[playerId][new Axial(q, r).asString] = true;
    //     }
    //   }
    // }
  }

  public isTileClaimedBy(playerId: number, axialLocation: Axial) {
    return this.playerClaimTile[playerId][axialLocation.asString] || false;
  }

  public frame(prevTicks: number, currTicks: number) {
    // if (currTicks <= prevTicks) {
    //   return; // ignore invalid ticks
    // }
    Object.keys(this.buildings).forEach((key: string) => {
      const building = this.buildings[key];
      building.frame(prevTicks, currTicks);
    });

    Object.keys(this.entities).forEach((key: string) => {
      const entity = this.entities[key];
      entity.frame(prevTicks, currTicks);
      const [x, z] = entity.position.asArray;
      const [vx, vz] = entity.velocity.asArray;
      this.emit(PackageType.MOVE_ENTITY, {
        uid: entity.uuid,
        location: { x, y: 5, z },
        yaw: 0,
        pitch: 0,
        velocity: { x: vx, y: 0, z: vz },
      });
    });

    this.prevTicks = currTicks;
  }

  public test() {
    //
  }
}
