"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../lib/Game");
var Player_1 = require("../lib/Game/Player");
var lib_1 = require("tone-core/dist/lib");
var Worker_1 = require("../lib/Game/Unit/Worker");
var test_1 = require("tone-core/dist/test");
var BuildingFactory_1 = require("../lib/Game/Building/BuildingFactory");
var Helpers_1 = require("../lib/Helpers");
var WorkerJob_1 = require("../lib/Game/Unit/WorkerJob");
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
var game = new Game_1.Game([player1, player2], protocol1s);
game.terminate();
var trainingDataGen = BuildingFactory_1.buildingFactory(game, 0, lib_1.BuildingType.TRAINING_DATA_GENERATOR, new lib_1.Axial(0, 2));
var barrack = BuildingFactory_1.buildingFactory(game, 0, lib_1.BuildingType.BARRACK, new lib_1.Axial(0, 3));
var worker;
describe('barrack accept training data', function () {
    it('spawn training data', function () {
        trainingDataGen.onResouceDelivered(Helpers_1.ResourceType.STRUCT, lib_1.BuildingProperty[lib_1.BuildingType.TRAINING_DATA_GENERATOR].struct);
        barrack.onResouceDelivered(Helpers_1.ResourceType.STRUCT, lib_1.BuildingProperty[lib_1.BuildingType.BARRACK].struct);
        game.frame(0, 1000);
        expect(trainingDataGen.amount).toBe(1);
    });
    it('worker want to grab trainning data', function () {
        var j = Object.values(game.workerJobs).find(function (job) {
            return job.target.uuid === barrack.uuid && job.jobNature === WorkerJob_1.JobNature.STORAGE;
        });
        if (j) {
            j.priority = WorkerJob_1.JobPriority.EXCLUSIVE;
        }
        worker = new Worker_1.Worker(game, 0, new lib_1.Axial(0, 2).toCartesian(lib_1.TILE_SIZE), new lib_1.XyzEuler(1, 0, 0));
        game.frame(1000, 1000);
        if (worker.job && j) {
            expect(worker.job.id).toBe(j.id);
        }
        else {
            expect(worker.job).toBeTruthy();
            expect(j).toBeTruthy();
        }
    });
    it('job is barrack', function () {
        if (worker.job) {
            console.log(worker.job.target.name, worker.job.resourceType);
        }
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
        expect(worker.position).toStrictEqual(barrack.cartesianPos);
    });
    it('training data storage', function () {
        expect(barrack.trainingDataStorage).toBe(1);
    });
});
// it('dummie', () => {
//   expect(1).toBe(1);
// });
