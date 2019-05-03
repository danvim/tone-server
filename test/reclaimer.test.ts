import { Game } from '../lib/Game';
import { Player } from '../lib/Game/Player';
import { Building } from '../lib/Game/Building';
import {
  BuildingType,
  Axial,
  Cartesian,
  TILE_SIZE,
  Protocol,
  PackageType,
  AnimType,
  TryBuildMessage,
} from 'tone-core/dist/lib';
import { Worker, WorkerState } from '../lib/Game/Unit/Worker';
import { StubConn } from 'tone-core/dist/test';
import { Message } from 'protobufjs';
import { buildingFactory } from '../lib/Game/Building/BuildingFactory';
import { ResourceType } from '../lib/Helpers';

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
const game: Game = new Game([player1, player2], protocol1s);
game.terminate();

describe('original claim and not claimed', () => {
  it('origin', () => {
    expect(game.isTileClaimedBy(player1.id, new Axial(2, 0))).toBe(true);
  });
  it('spread enclosed', () => {
    expect(game.isTileClaimedBy(player1.id, new Axial(3, 3))).toBe(true);
  });
  it('not reached', () => {
    expect(game.isTileClaimedBy(player1.id, new Axial(10, 0))).toBe(false);
  });
});

describe('build criteria', () => {
  it('cannot build on non territory', () => {
    const msg = TryBuildMessage.create({
      axialCoords: [new Axial(10, 0)],
      buildingType: BuildingType.STRUCT_GENERATOR,
    });
    expect(game.build(msg, conn1s)).toBe(false);
  });
  it('cannot build on tile that already build building', () => {
    const msg = TryBuildMessage.create({
      axialCoords: [new Axial(0, 0)],
      buildingType: BuildingType.STRUCT_GENERATOR,
    });
    expect(game.build(msg, conn1s)).toBe(false);
  });
  it('can build normally', () => {
    const msg = TryBuildMessage.create({
      axialCoords: [new Axial(2, 0)],
      buildingType: BuildingType.STRUCT_GENERATOR,
    });
    expect(game.build(msg, conn1s)).toBe(true);
  });
});

let reclaimer: Building;
describe('claimer claim the new tile', () => {
  it('built', () => {
    reclaimer = buildingFactory(
      game,
      0,
      BuildingType.RECLAIMATOR,
      new Axial(8, 0),
    );
    reclaimer.onResouceDelivered(ResourceType.STRUCT, 5);
    expect(reclaimer.isFunctional()).toBe(true);
  });
  it('claimed', () => {
    expect(game.isTileClaimedBy(player1.id, new Axial(10, 0))).toBe(true);
  });
});

describe('claimer destroyed lose territory', () => {
  it('reclaimer die', () => {
    reclaimer.hp = 0;
    expect(reclaimer.isFunctional()).toBe(false);
    expect(game.buildings[reclaimer.uuid]).toBeFalsy();
  });
  it('remain territoy', () => {
    expect(game.isTileClaimedBy(player1.id, new Axial(0, 0))).toBe(true);
    expect(game.isTileClaimedBy(player1.id, new Axial(3, 3))).toBe(true);
  });
  it('lose territory', () => {
    expect(game.isTileClaimedBy(player1.id, new Axial(10, 0))).toBe(false);
  });
});
// it('dummie', () => {
//   expect(1).toBe(1);
// });
