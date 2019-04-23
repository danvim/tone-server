"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("../lib/Game");
var Player_1 = require("../lib/Game/Player");
var lib_1 = require("tone-core/dist/lib");
var player1 = new Player_1.Player();
var player2 = new Player_1.Player();
player1.id = 1;
player2.id = 2;
player1.username = 'Player1';
player2.username = 'Player2';
var game = new Game_1.Game([player1, player2]);
game.terminate();
describe('game initialize', function () {
    it('constructed', function () {
        expect(game).toBeTruthy();
    });
    it('reassigned playerIds', function () {
        expect(player1.id).toBe(0);
        expect(player2.id).toBe(1);
    });
    describe('assigned initial clusters(spawn point)', function () {
        var spawnPointKeys = Object.keys(game.buildings).filter(function (key) {
            var building = game.buildings[key];
            return building.buildingType === lib_1.BuildingType.SPAWN_POINT;
        });
        var spawnpoint0 = game.buildings[spawnPointKeys[0]];
        it('key mataches building.uuid', function () {
            expect(spawnpoint0.uuid).toBe(spawnPointKeys[0]);
        });
        it('player id assigned', function () {
            expect(spawnpoint0.playerId).toBe(0);
        });
    });
    it('initially no entities', function () {
        console.log('0', game.entities);
        expect(Object.keys(game.entities).length).toBe(0);
    });
    describe('after 2000ms', function () {
        game.frame(0, 2000);
        it('one entity with player id 0', function () {
            console.log('2000', game.entities);
            expect(Object.values(game.entities).filter(function (entity) {
                return entity.playerId === 0;
            }).length).toBe(1);
        });
    });
});
