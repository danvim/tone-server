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
} from 'tone-core/dist/lib';
import { Worker, WorkerState } from '../lib/Game/Unit/Worker';
import { StubConn } from 'tone-core/dist/test';
import { Message } from 'protobufjs';
import { buildingFactory } from '../lib/Game/Building/BuildingFactory';
import { ResourceType } from '../lib/Helpers';
import { TrainingDataGenerator } from '../lib/Game/Building/TrainingDataGenerator';
import { Barrack } from '../lib/Game/Building/Barrack';
import { WorkerJob } from '../lib/Game/Unit/WorkerJob';
import { Unit } from '../lib/Game/Unit';
import { JobNature, JobPriority } from 'tone-core/dist/lib/Game/Job';

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

const trainingDataGen: TrainingDataGenerator = buildingFactory(
  game,
  0,
  BuildingType.TRAINING_DATA_GENERATOR,
  new Axial(0, 2),
) as TrainingDataGenerator;
const barrack: Barrack = buildingFactory(
  game,
  0,
  BuildingType.BARRACK,
  new Axial(0, 3),
) as Barrack;
let worker: Worker;

describe('barrack accept training data', () => {
  it('spawn training data', () => {
    trainingDataGen.onResouceDelivered(
      ResourceType.STRUCT,
      BuildingProperty[BuildingType.TRAINING_DATA_GENERATOR].struct,
    );
    barrack.onResouceDelivered(
      ResourceType.STRUCT,
      BuildingProperty[BuildingType.BARRACK].struct,
    );
    game.frame(0, 1000);
    expect(trainingDataGen.amount).toBe(1);
  });
  it('worker want to grab trainning data', () => {
    const j = Object.values(game.workerJobs).find(
      (job: WorkerJob) =>
        job.target.uuid === barrack.uuid && job.jobNature === JobNature.STORAGE,
    );
    if (j) {
      j.priority = JobPriority.HIGH;
    }
    worker = new Worker(
      game,
      0,
      new Axial(0, 2).toCartesian(TILE_SIZE),
      new XyzEuler(1, 0, 0),
    );
    game.frame(1000, 1000);
    if (worker.job && j) {
      expect(worker.job.id).toBe(j.id);
    } else {
      expect(worker.job).toBeTruthy();
      expect(j).toBeTruthy();
    }
  });
  it('job is barrack', () => {
    expect(worker.job && worker.job.target.name).toBe(barrack.name);
  });
  it('target is training data gen', () => {
    expect(worker.target && worker.target.name).toBe(trainingDataGen.name);
  });
  it('worker get training data from generator', () => {
    game.frame(2000, 22000);
    expect(worker.position).toStrictEqual(trainingDataGen.cartesianPos);
  });
  it('worker put training data to barrack', () => {
    game.frame(22000, 44000);
    expect(worker.position).toStrictEqual(barrack.cartesianPos);
  });
  it('training data storage', () => {
    expect(barrack.trainingDataStorage).toBe(1);
  });
});

describe('recuitment', () => {
  // let workers: Worker[];
  let j: WorkerJob;
  it('recuitment start', () => {
    j = barrack.callForRecuitment();
    // workers = Object.values(game.myUnits(0)).filter(
    //   (unit: Unit) => unit.type === EntityType.WORKER,
    // ) as Worker[];
    // console.log(workers.map((worker: Worker) => worker.name));

    // game.frame(44000, 44000);
    game.frame(44000, 66000);
    // workers = Object.values(game.myUnits(0)).filter(
    //   (unit: Unit) => unit.type === EntityType.WORKER,
    // ) as Worker[];
    // console.log(
    //   workers.map((worker: Worker) => ({
    //     name: worker.name,
    //     job: worker.job && worker.job.name,
    //   })),
    // );
    // console.log(j.workers.map((w: Worker) => w.name));
    expect(j.workers.length).toBeGreaterThan(0);
    worker = j.workers[0];
    // global.console.log(worker.name, j.workers.length);
  });
  it('recruitment job worker\'s job is get recuited', () => {
    expect(worker.job && worker.job.id).toBe(j.id);
  });
  it('worker\'s target is barrack', () => {
    expect(worker.target && worker.target.uuid).toBe(barrack.uuid);
  });
  it('worker arrive barrack', () => {
    game.frame(66000, 88000);
    expect(worker.position.asString).toBe(barrack.cartesianPos.asString);
  });
  it('worker die', () => {
    expect(worker.hp).toBe(0);
  });
  it('barrack in training state', () => {
    expect(barrack.trainingCount).toBeGreaterThan(0);
  });
  it('after die no key', () => {
    expect(game.units[worker.uuid]).toBeFalsy();
  });
});

describe('barrack train the unit', () => {
  it('no soldiers', () => {
    expect(
      Object.values(game.myUnits(0)).filter(
        (unit: Unit) => unit.type === EntityType.SOLDIER_0,
      ).length,
    ).toBe(0);
  });
  it('barrack become training state after frame', () => {
    game.frame(88000, 88000);
    expect(barrack.nowTraining).toBe(true);
  });
  it('after 3000 1 soldiers', () => {
    game.frame(88000, 91000);
    expect(
      Object.values(game.myUnits(0)).filter(
        (unit: Unit) => unit.type === EntityType.SOLDIER_0,
      ).length,
    ).toBe(1);
  });
});

describe('barrack die', () => {
  it('all soldier become workers', () => {
    const expNumber =
      Object.keys(game.myUnits(0)).length + barrack.trainingCount;
    barrack.hp = 0;
    expect(Object.keys(game.myUnits(0)).length).toBe(expNumber);
  });
});

// it('dummie', () => {
//   expect(1).toBe(1);
// });
