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
} from 'tone-core/dist/lib';
import { Worker, WorkerState } from '../lib/Game/Unit/Worker';
import { StubConn } from 'tone-core/dist/test';
import { Message } from 'protobufjs';

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

let animationObject = {};
protocol1c.on(PackageType.SET_ANIMATION, (object) => {
  const obj = Object(object);
  animationObject = {
    uid: obj.uid,
    animType: obj.animType,
  };
});

const player1 = new Player(conn1s);
const player2 = new Player(conn2s);
player1.id = 0;
player2.id = 1;
player1.username = 'Player1';
player2.username = 'Player2';
const game: Game = new Game([player1, player2], protocol1s);
game.terminate();

let entityTest: any = [];

protocol1c.on(PackageType.MOVE_ENTITY, (object) => {
  entityTest = [
    Object(object),
    game.entities[Object(object).uid].position.clone(),
  ];
});

game.frame(2000, 2000); // spawn a new work
const worker = Object.values(game.myUnits(0))[0] as Worker;
const spawnPoint = Object.values(game.myBuildings(0)).filter(
  (building: Building) => building.buildingType === BuildingType.SPAWN_POINT,
)[0];
const base = game.bases[0];
const strucGen = new Building(
  game,
  0,
  BuildingType.STRUCT_GENERATOR,
  new Axial(1, 0),
);
const oldDist = worker.position.euclideanDistance(base.cartesianPos);

describe('grab struct from base and deliver to construction site', () => {
  describe('init, 2000', () => {
    it('base location', () => {
      expect(base.cartesianPos).toStrictEqual(
        new Axial(0, 0).toCartesian(TILE_SIZE),
      );
    });
    it('worker location', () => {
      expect(worker.position).toStrictEqual(
        spawnPoint.tilePosition.toCartesian(TILE_SIZE),
      );
    });
    it('worker target is base', () => {
      expect(worker.target && worker.target.uuid).toBe(base.uuid);
    });
    it('the velocity', () => {
      expect(worker.velocity).toStrictEqual(new Cartesian(worker.speed, 0));
    });
    it('update entity protocol', () => {
      console.log(entityTest);
      expect(entityTest[0].location.x).toBe(entityTest[1].x);
      expect(entityTest[0].location.z).toBe(entityTest[1].y);
    });
  });
  describe('2100', () => {
    it('the velocity', () => {
      game.frame(2000, 2100);
      expect(worker.velocity).toStrictEqual(new Cartesian(worker.speed, 0));
    });
    it('worker state is GRABBING', () => {
      expect(worker.state).toBe(WorkerState.GRABBING);
    });
    it('move closer', () => {
      const newDist = worker.position.euclideanDistance(base.cartesianPos);
      expect(newDist).toBeLessThan(oldDist);
    });
  });
  const timeNeeded = oldDist / worker.speed;
  const t = 2000 + Math.ceil(timeNeeded);
  describe('just arrive ' + timeNeeded, () => {
    it('same location as base', () => {
      game.frame(2100, t);
      const newDist = worker.position.euclideanDistance(base.cartesianPos);
      expect(newDist).toBe(0);
    });
    it('worker state is DELIVERING', () => {
      expect(worker.state).toBe(WorkerState.DELIVERING);
    });
    it('worker target is the struct gen', () => {
      expect(worker.target && worker.target.uuid).toBe(strucGen.uuid);
    });
    it('recieved animationObject to be carrying', () => {
      expect(animationObject).toStrictEqual({
        uid: worker.uuid,
        animType: AnimType.CARRYING,
      });
    });
  });
  describe('put struct', () => {
    it('worker gone to struct gen', () => {
      if (worker.target) {
        let t2 =
          t +
          worker.position.euclideanDistance(worker.target.cartesianPos) /
            worker.speed;
        t2 = Math.ceil(t2);
        game.frame(t, t2);
        expect(worker.position).toStrictEqual(strucGen.cartesianPos);
      } else {
        expect(worker.target).toBeTruthy();
      }
    });
    it('struct gen gain progress', () => {
      expect(strucGen.structProgress).toBe(1);
    });
    it('worker want to get struct from base', () => {
      if (worker.target) {
        expect(worker.target.uuid).toBe(base.uuid);
      } else {
        expect(worker.target).toBeTruthy();
      }
    });
    it('recieved animationObject to be default', () => {
      expect(animationObject).toStrictEqual({
        uid: worker.uuid,
        animType: AnimType.DEFAULT,
      });
    });
  });
});
