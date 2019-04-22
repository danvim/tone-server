import { Game } from '../lib/Game';
import { Player } from '../lib/Game/Player';
import { Building } from '../lib/Game/Building';
import { BuildingType } from 'tone-core/dist/lib';

const player1 = new Player();
const player2 = new Player();
player1.id = 1;
player2.id = 2;
player1.username = 'Player1';
player2.username = 'Player2';
let game: Game;
describe('game initialize', () => {
  game = new Game([player1, player2]);
  game.terminate();
  it('constructed', () => {
    expect(game).toBeTruthy();
  });
  it('reassigned playerIds', () => {
    expect(player1.id).toBe(0);
    expect(player2.id).toBe(1);
  });
  describe('assigned initial clusters(spawn point)', () => {
    const spawnPointKeys = Object.keys(game.buildings).filter((key: string) => {
      const building = game.buildings[key];
      return building.buildingType === BuildingType.SPAWN_POINT;
    });
    const spawnpoint0: Building = game.buildings[spawnPointKeys[0]];
    it('key mataches building.uuid', () => {
      expect(spawnpoint0.uuid).toBe(spawnPointKeys[0]);
    });
    it('player id assigned', () => {
      expect(spawnpoint0.playerId).toBe(0);
    });
  });
});
