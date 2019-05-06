"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../lib/Game");
var Player_1 = require("../lib/Game/Player");
var lib_1 = require("tone-core/dist/lib");
var Worker_1 = require("../lib/Game/Unit/Worker");
var test_1 = require("tone-core/dist/test");
var BuildingFactory_1 = require("../lib/Game/Building/BuildingFactory");
var Helpers_1 = require("../lib/Helpers");
var Job_1 = require("tone-core/dist/lib/Game/Job");
var conn1c = new test_1.StubConn();
var conn1s = new test_1.StubConn();
conn1c.connect(conn1s);
var conn2c = new test_1.StubConn();
var conn2s = new test_1.StubConn();
conn2c.connect(conn2s);
var protocol1c = new lib_1.Protocol();
var protocol1s = new lib_1.Protocol();
var protocol = new lib_1.Protocol();
protocol1c.add(conn1c);
protocol1s.add(conn1s);
protocol1s.add(conn2s);
protocol.add(conn1s);
var player1 = new Player_1.Player(conn1s);
var player2 = new Player_1.Player(conn2s);
player1.id = 0;
player2.id = 1;
player1.username = 'Player1';
player2.username = 'Player2';
var game = new Game_1.Game([player1, player2], protocol1s, true);
game.terminate();
var trainingDataGen = BuildingFactory_1.buildingFactory(game, 0, lib_1.BuildingType.TRAINING_DATA_GENERATOR, new lib_1.Axial(0, 2));
var barrack = BuildingFactory_1.buildingFactory(game, 0, lib_1.BuildingType.BARRACK, new lib_1.Axial(0, 3));
var worker;
global.test = true;
describe('barrack accept training data', function () {
    it('spawn training data', function () {
        trainingDataGen.onResouceDelivered(Helpers_1.ResourceType.STRUCT, lib_1.BuildingProperty[lib_1.BuildingType.TRAINING_DATA_GENERATOR].struct);
        barrack.onResouceDelivered(Helpers_1.ResourceType.STRUCT, lib_1.BuildingProperty[lib_1.BuildingType.BARRACK].struct);
        game.frame(0, 0);
        game.frame(0, 1000);
        expect(trainingDataGen.amount).toBe(1);
    });
    it('worker want to grab trainning data', function () {
        var j = Object.values(game.workerJobs).find(function (job) {
            return job.target.uuid === barrack.uuid && job.jobNature === Job_1.JobNature.STORAGE;
        });
        if (j) {
            j.priority = Job_1.JobPriority.HIGH;
        }
        worker = new Worker_1.Worker(game, 0, new lib_1.Axial(0, 2).toCartesian(lib_1.TILE_SIZE), new lib_1.XyzEuler(1, 0, 0));
        game.frame(1000, 1000);
        if (worker.job && j) {
            expect(worker.job.name).toBe(j.name);
        }
        else {
            expect(worker.job).toBeTruthy();
            expect(j).toBeTruthy();
        }
    });
    it('job is barrack', function () {
        expect(worker.job && worker.job.target.name).toBe(barrack.name);
    });
    it('target is training data gen', function () {
        expect(worker.target && worker.target.name).toBe(trainingDataGen.name);
    });
    it('worker get training data from generator', function () {
        game.frame(2000, 22000);
        expect(worker.position).toStrictEqual(trainingDataGen.cartesianPos);
    });
    it('worker put training data to barrack', function () {
        game.frame(22000, 44000);
        expect(worker.position).toStrictEqual(barrack.cartesianPos);
    });
    it('training data storage', function () {
        expect(barrack.trainingDataStorage).toBe(1);
    });
});
describe('recuitment', function () {
    // let workers: Worker[];
    var j;
    it('recuitment start', function () {
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
    it('recruitment job worker\'s job is get recuited', function () {
        expect(worker.job && worker.job.id).toBe(j.id);
    });
    it('worker\'s target is barrack', function () {
        expect(worker.target && worker.target.uuid).toBe(barrack.uuid);
    });
    it('worker arrive barrack', function () {
        game.frame(66000, 88000);
        expect(worker.position.asString).toBe(barrack.cartesianPos.asString);
    });
    it('worker die', function () {
        expect(worker.hp).toBe(0);
    });
    it('barrack in training state', function () {
        expect(barrack.trainingCount).toBeGreaterThan(0);
    });
    it('after die no key', function () {
        expect(game.units[worker.uuid]).toBeFalsy();
    });
});
describe('barrack train the unit', function () {
    it('no soldiers', function () {
        expect(Object.values(game.myUnits(0)).filter(function (unit) { return unit.type === lib_1.EntityType.SOLDIER_0; }).length).toBe(0);
    });
    it('barrack become training state after frame', function () {
        game.frame(88000, 88000);
        expect(barrack.nowTraining).toBe(true);
    });
    it('after 3000 1 soldiers', function () {
        game.frame(88000, 91000);
        expect(Object.values(game.myUnits(0)).filter(function (unit) { return unit.type === lib_1.EntityType.SOLDIER_0; }).length).toBe(1);
    });
});
describe('barrack die', function () {
    it('all soldier become workers', function () {
        var expNumber = Object.keys(game.myUnits(0)).length + barrack.trainingCount;
        barrack.hp = 0;
        expect(Object.keys(game.myUnits(0)).length).toBe(expNumber);
    });
});
// it('dummie', () => {
//   expect(1).toBe(1);
// });
