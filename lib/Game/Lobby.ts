import { Player } from './Player';
import { Protocol, PackageType } from 'tone-core/dist/lib';
import { Game } from '.';
import DataConnection = PeerJs.DataConnection;
import Robot from '../Robot';

export class Lobby {
  public players: Player[] = [];
  public started: boolean = false;
  public protocol: Protocol = Robot.getInstance().getProtocol();
  public game: Game | undefined;

  constructor() {
    this.initProtocol();
  }

  public initProtocol() {
    this.protocol.on(
      PackageType.TRY_JOIN_LOBBY,
      (obj: any, conn: DataConnection) => {
        this.join(Object(obj).username, conn);
      },
    );
    this.protocol.on(PackageType.TRY_START_GAME, this.tryStart.bind(this));
  }

  public isUsernameExist(username: string) {
    return (
      this.players.filter((player: Player) => player.username === username)
        .length > 0
    );
  }

  public isConnExist(conn: DataConnection) {
    return (
      this.players.filter(
        (player) => player.conn && player.conn.peer === conn.peer,
      ).length > 0
    );
  }

  /**
   * Checks if a given username is among the existing players. If so, updates the stored connection to the new incoming
   * connection. If the player exists, return its player id.
   * @param {string} username User input username
   * @param {DataChannelEventHandler} conn Incoming data connection
   */
  public playerUpdateConn(username: string, conn: DataConnection) {
    let id = -1;
    this.players.forEach((player: Player) => {
      if (player.username === username) {
        player.conn = conn;
        id = player.id;
      }
    });
    return id;
  }

  public playerUpdateUsername(username: string, conn: DataConnection) {
    const connId = conn.peer;
    let id = -1;
    this.players.forEach((player) => {
      if (player.conn && player.conn.peer === connId) {
        player.username = username;
        id = player.id;
      }
    });
    return id;
  }

  public join(username: string, conn: DataConnection) {
    global.console.log(`${username} ${conn.peer} attempts to join`);
    let joiningPlayer: Player | undefined;
    if (this.isUsernameExist(username)) {
      // The username was in game/lobby before. Assuming player is rejoining with a different connection.
      const playerId = this.playerUpdateConn(username, conn);
      if (playerId === -1) {
        return;
      }
      joiningPlayer = this.players.find((p: Player) => p.id === playerId);
      if (this.started && this.game && joiningPlayer) {
        this.game.rejoin(joiningPlayer);
      }
    } else if (this.isConnExist(conn)) {
      // The connection was in game/lobby before. Assuming player is rejoining with a different username.
      const playerId = this.playerUpdateUsername(username, conn);
      if (playerId === -1) {
        return;
      }
      joiningPlayer = this.players.find((p: Player) => p.id === playerId);
    } else {
      // Player is new to the game/lobby.
      if (!this.started) {
        joiningPlayer = new Player(conn);
        joiningPlayer.username = username;
        joiningPlayer.id = this.genPlayerId();
        this.players.push(joiningPlayer);
      } else {
        // TODO Perhaps emit an error here for the client.
        return;
      }
    }

    // console.log(joiningPlayer);
    if (joiningPlayer !== undefined) {
      // Send other player info to joining player.
      this.players.forEach((player: Player) => {
        if (joiningPlayer && player !== joiningPlayer) {
          joiningPlayer.emit(PackageType.UPDATE_LOBBY, {
            username: player.username,
            playerId: player.id,
            connId: player.conn.peer,
          });
        }
      });

      // Send joining player info to all players.
      this.protocol.emit(PackageType.UPDATE_LOBBY, {
        username: joiningPlayer.username,
        playerId: joiningPlayer.id,
        connId: conn.peer,
      });
    }
  }

  // logic: first ascending sort, then increment until see a gap or reach last of list(id of player length)
  public genPlayerId() {
    this.players.sort((a, b) => a.id - b.id);
    return this.players.reduce(
      (prev, player) => (player.id === prev ? prev + 1 : prev),
      0,
    );
  }

  public tryStart() {
    if (!this.started) {
      global.console.log(
        'game start',
        this.players.map((player) => ({
          username: player.username,
          id: player.id,
        })),
      );
      this.started = true;
      this.protocol.emit(PackageType.START_GAME, {});
      this.game = new Game(this.players, this.protocol);
    }
  }
}
