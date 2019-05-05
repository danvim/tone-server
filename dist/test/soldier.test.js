"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../lib/Game");
var Player_1 = require("../lib/Game/Player");
var lib_1 = require("tone-core/dist/lib");
var test_1 = require("tone-core/dist/test");
var Helpers_1 = require("../lib/Helpers");
var Barrack_1 = require("../lib/Game/Building/Barrack");
var Soldier_1 = require("../lib/Game/Unit/Soldier");
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
var barrack = new Barrack_1.Barrack(game, 0, new lib_1.Axial(0, 2));
barrack.onResouceDelivered(Helpers_1.ResourceType.STRUCT, lib_1.BuildingProperty[lib_1.BuildingType.BARRACK].struct);
var soldier = new Soldier_1.Soldier(game, 0, lib_1.EntityType.SOLDIER_0, barrack.cartesianPos, barrack);
describe('soilder find enemy', function () {
    it('soldier want to grab training data', function () {
        game.frame(0, 0);
        expect(soldier.soldierState).toBe(Soldier_1.SoldierState.REFILLING);
    });
    it('soldier got training data', function () {
        barrack.trainingDataStorage = 1;
        game.frame(0, 0);
        expect(soldier.trainingDataHolding).toBe(1);
    });
    it('a full soldier have no target immediately', function () {
        expect(soldier.target).toBeFalsy();
    });
    it('opponent things do exist', function () {
        expect(Object.values(game.opponentBuildings(0)).length).toBeGreaterThan(0);
    });
    it('soldier find an enemy', function () {
        game.frame(0, 0);
        if (soldier.attackTarget) {
            expect(soldier.attackTarget.playerId).not.toBe(0);
        }
        else {
            expect(soldier.attackTarget).toBeTruthy();
        }
    });
    it('soldier would stop around the enemy', function () {
        game.frame(0, 30000);
        if (soldier.attackTarget) {
            expect(soldier.position.euclideanDistance(soldier.attackTarget.cartesianPos)).toBeLessThanOrEqual(soldier.attackRange);
        }
        else {
            expect(soldier.attackTarget).toBeTruthy();
        }
    });
    var bullet;
    it('spawn a bullet', function () {
        bullet = Object.values(game.myEntities(0)).find(function (e) { return e.type === lib_1.EntityType.BULLET_0; });
        expect(bullet).toBeTruthy();
    });
    it('bullet make damage', function () {
        var prevHp = (bullet.target && bullet.target.hp) || 0;
        game.frame(30000, 60000);
        var afterHp = (bullet.target && bullet.target.hp) || 0;
        expect(afterHp).toBeLessThan(prevHp);
    });
    it('bullet consume training data', function () {
        expect(soldier.trainingDataHolding).toBeLessThan(soldier.trainingDataCapacity);
    });
    it('after consume all training data, go back get training data', function () {
        var i = 60000;
        while (soldier.trainingDataHolding >= soldier.trainingDataPerAttack) {
            game.frame(i, (i += 30000));
        }
        game.frame(i, i + 30000);
        expect(soldier.target && soldier.target.name).toBe(barrack.name);
    });
});
