"use strict";
// import { Game } from '../lib/Game';
// import { Player } from '../lib/Game/Player';
// import { Building } from '../lib/Game/Building';
// import { BuildingType, Axial, EntityType } from 'tone-core/dist/lib';
// import { Entity } from '../lib/Game/Entity';
// import { Worker } from '../lib/Game/Unit/Worker';
// import { Unit } from '../lib/Game/Unit';
// const player1 = new Player();
// const player2 = new Player();
// player1.id = 1;
// player2.id = 2;
// player1.username = 'Player1';
// player2.username = 'Player2';
// const game: Game = new Game([player1, player2]);
// game.terminate();
// describe('game initialize', () => {
//   it('constructed', () => {
//     expect(game).toBeTruthy();
//   });
//   it('reassigned playerIds', () => {
//     expect(player1.id).toBe(0);
//     expect(player2.id).toBe(1);
//   });
//   describe('assigned initial clusters(spawn point)', () => {
//     const spawnPointKeys = Object.keys(game.buildings).filter((key: string) => {
//       const building = game.buildings[key];
//       return building.buildingType === BuildingType.SPAWN_POINT;
//     });
//     const spawnpoint0: Building = game.buildings[spawnPointKeys[0]];
//     it('key mataches building.uuid', () => {
//       expect(spawnpoint0.uuid).toBe(spawnPointKeys[0]);
//     });
//     it('player id assigned', () => {
//       expect(spawnpoint0.playerId).toBe(0);
//     });
//   });
//   const initLength = Object.keys(game.units).length;
//   it('initially no units', () => {
//     expect(initLength).toBe(0);
//   });
//   const structGen = new Building(
//     game,
//     0,
//     BuildingType.STRUCT_GENERATOR,
//     new Axial(1, 2),
//   );
//   describe('after 2000ms', () => {
//     game.frame(0, 2000);
//     const units = Object.values(game.units).filter((entity: Unit) => {
//       return entity.playerId === 0;
//     });
//     it('one entity with player id 0', () => {
//       expect(units.length).toBe(1);
//     });
//     it('the newly spawned worker would want to grab from the base', () => {
//       if (units.length !== 1) {
//         expect(units.length).toBe(1);
//       } else {
//         const worker = units[0] as Worker;
//         expect(worker.target && worker.target.uuid).toBe(game.bases[0].uuid);
//       }
//     });
//   });
// });
