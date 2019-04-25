import { Game } from '../lib/Game';
import { Player } from '../lib/Game/Player';
import { Building } from '../lib/Game/Building';
import { BuildingType, Axial, Cartesian, TILE_SIZE } from 'tone-core/dist/lib';
import { Worker, WorkerState } from '../lib/Game/Unit/Worker';

const player1 = new Player();
const player2 = new Player();
player1.id = 0;
player2.id = 1;
player1.username = 'Player1';
player2.username = 'Player2';
const game: Game = new Game([player1, player2]);
game.terminate();
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
// const totalDist =
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
  });
});
