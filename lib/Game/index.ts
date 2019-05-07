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
  TrySetJobMessage,
  TrySetFightingStyleMessage,
  EntityType,
  TILE_SIZE,
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
import { WorkerJob } from './Unit/WorkerJob';
import { Worker } from './Unit/Worker';
import { StructGenerator } from './Building/StructGenerator';
import { TrainingDataGenerator } from './Building/TrainingDataGenerator';
import { Barrack } from './Building/Barrack';
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
  public workerJobs: { [workerJobId: string]: WorkerJob } = {};

  // states
  public prevTicks = 0;

  // game start
  constructor(players: Player[], protocol: Protocol, unitTest?: boolean) {
    const size = 20;
    this.players = [];
    this.protocol = protocol;
    this.map = MapGen(size);
    console.log('map gen done');
    this.buildings = {};
    this.entities = {};
    this.units = {};
    this.bases = {};

    if (unitTest) {
      SpawnPoint.spawnPeriod = 2000;
      Base.structGenPeriod = 2000;
      StructGenerator.structGenPeriod = 1000;
      TrainingDataGenerator.dataGenPeriod = 1000;
    }

    this.reassignPlayerId(players);
    this.initBase(size);
    console.log('init base');
    this.initClusterTiles(unitTest ? 0 : 10);
    console.log('init cluster');
    this.evaluateTerritory();
    this.initProtocol(protocol);

    if (!unitTest) {
      this.frameTimer = setInterval(
        () => this.frame(this.prevTicks, now('ms')),
        60,
      );
    }
    this.emit(PackageType.UPDATE_TILES, { tiles: this.map });
    console.log('emit');
  }

  // connection functions

  public emit(packageType: PackageType, object: object) {
    if (this.protocol) {
      Object.values(this.players).forEach((player: Player) => {
        player.emit(packageType, object);
      });
    }
  }

  public mapConnToPlayer(conn: Conn) {
    return this.players.find(
      (player: Player) => !!player.conn && conn.peer === player.conn.peer,
    );
  }

  public initProtocol(protocol: Protocol) {
    protocol.on(PackageType.TRY_BUILD, this.build);
    protocol.on(PackageType.TRY_SET_JOB, this.setJob);
    protocol.on(PackageType.TRY_SET_FIGHTING_STYLE, this.setFightingStyle);
  }

  public rejoin(player: Player) {
    player.emit(PackageType.UPDATE_TILES, { tiles: this.map });
    Object.values(this.buildings).forEach((building: Building) => {
      player.emit(PackageType.BUILD, {
        playerId: building.playerId,
        uid: building.uuid,
        buildingType: building.buildingType,
        axialCoords: [building.tilePosition],
        progress: building.structProgress,
      });
      if (player.id === building.playerId) {
        switch (building.buildingType) {
          case BuildingType.BASE:
            (building as Base).emitStorage();
            break;

          case BuildingType.BARRACK:
            (building as Barrack).emitStorage();
            break;

          case BuildingType.STRUCT_GENERATOR:
            (building as StructGenerator).emitStorage();
            break;

          case BuildingType.TRAINING_DATA_GENERATOR:
            (building as TrainingDataGenerator).emitStorage();
            break;
        }
      }
    });

    Object.values(this.entities).forEach((entity: Entity) => {
      player.emit(PackageType.SPAWN_ENTITY, {
        uid: entity.uuid,
        position: { x: entity.position.x, y: 0, z: entity.position.y },
        entityType: entity.type,
        playerId: entity.playerId,
      });
    });

    Object.values(this.workerJobs).forEach((job: WorkerJob) => {
      if (job.playerId === player.id) {
        job.sendUpdateJob();
      }
    });
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

  public initBase(size: number) {
    const locations = [
      new Axial(0, 0),
      new Axial(size - 1, size - 1),
      new Axial(size - 1, 0),
      new Axial(0, size - 1),
    ];
    this.players.forEach((player: Player, k: number) => {
      const base0 = new Base(this, player.id, locations[k]);
      this.bases[player.id] = base0;
    });
  }

  /**
   * assign clusters to players and spawn inital workers
   */
  public initClusterTiles(initialWorkerCount: number = 0) {
    const clusters: Axial[] = [];
    Object.keys(this.map).forEach((axialString: string) => {
      const tileInfo = this.map[axialString];
      if (tileInfo.type === TileType.INFORMATION_CLUSTER) {
        clusters.push(Axial.fromString(axialString));
      }
    });
    this.players.forEach((player: Player, index: number) => {
      const sp = new SpawnPoint(this, player.id, clusters[index]);
      for (let i = 0; i < initialWorkerCount; i++) {
        sp.spawn();
      }
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
      const canBuild = axialCoords.reduce((flag: boolean, ax: any) => {
        const axial = new Axial(ax.q, ax.r);
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
      const a = new Axial(axialCoord.q, axialCoord.r);
      buildingFactory(this, player.id, buildingType, a);
      return true;
    }
    return false;
  }

  public setJob = (object: Message<TrySetJobMessage>, conn: Conn) => {
    const { jobId, priority } = Object(object);
    const job = this.workerJobs[jobId];
    const player = this.mapConnToPlayer(conn);
    if (job && player) {
      if (job.playerId === player.id) {
        job.priority = priority;
        job.sendUpdateJob();
      }
    }
  }

  public setFightingStyle = (
    object: Message<TrySetFightingStyleMessage>,
    conn: Conn,
  ) => {
    const { barrackUid, fightingStyle, targetUid } = Object(object);
    const player = this.mapConnToPlayer(conn);
    if (this.buildings[barrackUid] && player) {
      const building = this.buildings[barrackUid];
      if (
        player.id === building.playerId &&
        building.buildingType === BuildingType.BARRACK
      ) {
        const barrack = building as Barrack;
        if (targetUid in this.buildings) {
          barrack.setFightingStyle(fightingStyle, this.buildings[targetUid]);
        } else if (targetUid in this.entities) {
          barrack.setFightingStyle(fightingStyle, this.entities[targetUid]);
        } else {
          barrack.fightingStyle = fightingStyle;
        }
      }
    }
  }

  public claimTile(playerId: number, axialLocation: Axial, radius: number) {
    axialLocation.range(radius).forEach((axial: Axial) => {
      this.playerClaimTile[playerId][axial.asString] = true;
    });
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

    Object.keys(this.entities)
      // to let worker holding higher priority job execute first
      .sort((a: string, b: string) => {
        if (
          this.entities[a].type === EntityType.WORKER &&
          this.entities[b].type === EntityType.WORKER
        ) {
          const aw = this.entities[a] as Worker;
          const bw = this.entities[b] as Worker;
          if (aw.job && bw.job) {
            if (aw.job.priority < bw.job.priority) {
              return 1;
            } else if (aw.job.priority > bw.job.priority) {
              return -1;
            } else {
              return 0;
            }
          } else {
            return 0;
          }
        } else {
          return 0;
        }
      })
      // freame each workers
      .forEach((key: string) => {
        const entity = this.entities[key];
        entity.frame(prevTicks, currTicks);
        if (entity.sentPosition.euclideanDistance(entity.position) > 0) {
          const [x, z] = entity.position.asArray;
          const [vx, vz] = entity.velocity.asArray;
          this.emit(PackageType.MOVE_ENTITY, {
            uid: entity.uuid,
            location: { x, y: 5, z },
            yaw: entity.yaw,
            pitch: 0,
            velocity: { x: vx, y: 0, z: vz },
          });
          entity.sentPosition = entity.position.clone();
        }
      });

    Object.keys(this.workerJobs).forEach((key: string) => {
      const job = this.workerJobs[key];
      if (job.dirty) {
        job.sendUpdateJob();
      }
    });

    // const w = Object.values(this.myUnits(0))[0] as Worker;
    // const j = w.job;
    // console.log(w.name, j && j.name, w.position);

    // const b = Object.values(this.myBuildings(0));
    // console.log(
    //   b
    //     .filter(
    //       (bb: Building) => bb.buildingType === BuildingType.STRUCT_GENERATOR,
    //     )
    //     .map((bb: Building) => ({
    //       name: bb.name,
    //       next: bb.nextReadyTime,
    //       per: bb.period,
    //     })),
    // );

    this.prevTicks = currTicks;
  }

  public test() {
    //
  }
}
