import { Game } from '../lib/Game';
import { Player } from '../lib/Game/Player';
import { Building } from '../lib/Game/Building';
import { BuildingType, Axial, Protocol, PackageType } from 'tone-core/dist/lib';
import { StubConn } from 'tone-core/dist/test';
import { Worker } from '../lib/Game/Unit/Worker';
import { Unit } from '../lib/Game/Unit';
import { MapGen } from '../lib/Game/MapGen';

const conn1c = new StubConn();
const conn1s = new StubConn();
conn1c.connect(conn1s);

const conn2c = new StubConn();
const conn2s = new StubConn();
conn2c.connect(conn2s);

const protocol1c = new Protocol();
const protocol1s = new Protocol();
const protocol = new Protocol();
protocol1c.add(conn1c);
protocol1s.add(conn1s);
protocol1s.add(conn2s);
protocol.add(conn1s);

const player1 = new Player(conn1s);
const player2 = new Player(conn2s);
player1.id = 0;
player2.id = 1;
player1.username = 'Player1';
player2.username = 'Player2';

describe('client side tests on initialization', () => {
  it('well connected', () => {
    expect(protocol1s.conns[0]).toBe(conn1s);
    expect(protocol1s.conns[0].peerConnection).toBe(protocol1c.conns[0]);
    expect(protocol1s.conns[0]).toBe(protocol1c.conns[0].peerConnection);
  });
  let tileRecievedFlag = 0;
  protocol1c.on(PackageType.UPDATE_TILES, () => (tileRecievedFlag = 1));
  it('received map', () => {
    expect(tileRecievedFlag).toBe(1);
  });
  const buildObjects = [];
  protocol1c.on(PackageType.BUILD, (data) => buildObjects.push(Object(data)));
  it('received 2 players\' spawnpoint and base', () => {
    expect(buildObjects.length).toBe(4);
  });
});

const game: Game = new Game([player2, player1], protocol1s);
game.terminate();

describe('game initialize', () => {
  it('constructed', () => {
    expect(game).toBeTruthy();
  });
  it('reassigned playerIds', () => {
    expect(game.players[0].id).toBe(0);
    expect(game.players[1].id).toBe(1);
  });
  describe('assigned initial clusters(spawn point)', () => {
    const spawnPointKeys = Object.keys(game.buildings).filter((key: string) => {
      const building = game.buildings[key];
      return building.buildingType === BuildingType.SPAWN_POINT;
    });
    const spawnpoint0: Building = game.buildings[spawnPointKeys[0]];
    it('key mataches building.uuid', () => {
      expect(spawnpoint0.uuid).toBe(spawnPointKeys[0]);
    });
    it('player id assigned', () => {
      expect(spawnpoint0.playerId).toBe(0);
    });
  });
  const initLength = Object.keys(game.units).length;
  it('initially no units', () => {
    expect(initLength).toBe(0);
  });
  describe('after 2000ms', () => {
    let units: Unit[];
    let entityCount = 0;
    protocol1c.on(PackageType.SPAWN_ENTITY, () => {
      entityCount++;
    });
    it('one entity with player id 0', () => {
      game.frame(0, 2000);
      units = Object.values(game.units).filter((entity: Unit) => {
        return entity.playerId === 0;
      });
      expect(units.length).toBe(1);
    });
    it('the newly spawned worker would not want to grab from the base since there is not working struct gen', () => {
      const worker = units[0] as Worker;
      expect(worker.job).toBeFalsy();
      const structGen = new Building(
        game,
        0,
        BuildingType.STRUCT_GENERATOR,
        new Axial(1, 2),
      );
      game.frame(2000, 2000);
    });

    it('the newly spawned worker would want to grab from the base', () => {
      if (units.length !== 1) {
        expect(units.length).toBe(1);
      } else {
        const worker = units[0] as Worker;
        console.log(worker.job && worker.job.target.name);
        expect(worker.target && worker.target.uuid).toBe(game.bases[0].uuid);
      }
    });
    it('client recieve two spawn entity events', () => {
      expect(entityCount).toBe(2);
    });
  });
});
// it('dummie', () => {
//   expect(1).toBe(1);
// });
// window.protocol.emit(9,{axialCoords:[{q: 1, r:1}], buildingType: 2})
