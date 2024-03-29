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
  BuildingProperty,
  XyzEuler,
  EntityType,
  ResourceType,
} from 'tone-core/dist/lib';
import { Worker, WorkerState } from '../lib/Game/Unit/Worker';
import { StubConn } from 'tone-core/dist/test';
import { Message } from 'protobufjs';
import { buildingFactory } from '../lib/Game/Building/BuildingFactory';
import { TrainingDataGenerator } from '../lib/Game/Building/TrainingDataGenerator';
import { Barrack } from '../lib/Game/Building/Barrack';
import { WorkerJob } from '../lib/Game/Unit/WorkerJob';
import { Unit } from '../lib/Game/Unit';
import { Soldier, SoldierState } from '../lib/Game/Unit/Soldier';
import { Entity } from '../lib/Game/Entity';
import { Bullet } from '../lib/Game/Entity/Bullet';

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
const game: Game = new Game([player1, player2], protocol1s, true);
game.terminate();

const barrack = new Barrack(game, 0, new Axial(0, 2));
barrack.onResouceDelivered(
  ResourceType.STRUCT,
  BuildingProperty[BuildingType.BARRACK].struct,
);
const soldier = new Soldier(
  game,
  0,
  EntityType.SOLDIER_0,
  barrack.cartesianPos,
  barrack,
);

describe('soilder find enemy', () => {
  it('soldier want to grab training data', () => {
    game.frame(0, 0);
    expect(soldier.soldierState).toBe(SoldierState.REFILLING);
  });

  it('soldier got training data', () => {
    barrack.trainingDataStorage = 1;
    game.frame(0, 0);
    expect(soldier.trainingDataHolding).toBe(1);
  });

  it('a full soldier have no target immediately', () => {
    expect(soldier.target).toBeFalsy();
  });

  it('opponent things do exist', () => {
    expect(Object.values(game.opponentBuildings(0)).length).toBeGreaterThan(0);
  });

  it('soldier find an enemy', () => {
    game.frame(0, 0);
    if (soldier.attackTarget) {
      expect(soldier.attackTarget.playerId).not.toBe(0);
    } else {
      expect(soldier.attackTarget).toBeTruthy();
    }
  });

  it('soldier would stop around the enemy', () => {
    game.frame(0, 30000);
    if (soldier.attackTarget) {
      expect(
        soldier.position.euclideanDistance(soldier.attackTarget.cartesianPos),
      ).toBeLessThanOrEqual(soldier.attackRange);
    } else {
      expect(soldier.attackTarget).toBeTruthy();
    }
  });

  let bullet: Bullet;
  it('spawn a bullet', () => {
    bullet = Object.values(game.myEntities(0)).find(
      (e: Entity) => e.type === EntityType.BULLET_0,
    ) as Bullet;
    expect(bullet).toBeTruthy();
  });

  it('bullet make damage', () => {
    const prevHp = (bullet.target && bullet.target.hp) || 0;
    game.frame(30000, 60000);
    const afterHp = (bullet.target && bullet.target.hp) || 0;
    expect(afterHp).toBeLessThan(prevHp);
  });

  it('bullet consume training data', () => {
    expect(soldier.trainingDataHolding).toBeLessThan(
      soldier.trainingDataCapacity,
    );
  });

  it('after consume all training data, go back get training data', () => {
    let i = 60000;
    while (soldier.trainingDataHolding >= soldier.trainingDataPerAttack) {
      game.frame(i, (i += 30000));
    }
    game.frame(i, i + 30000);
    expect(soldier.target && soldier.target.name).toBe(barrack.name);
  });
});
