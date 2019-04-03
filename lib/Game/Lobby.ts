import { Player } from './Player';
import { Protocol, PackageType } from 'tone-core/dist/lib';
import Conn = PeerJs.DataConnection;
import { Game } from '.';
import DataConnection = PeerJs.DataConnection;
export class Lobby {
  public players: Player[];
  public started: boolean = false;
  public protocol: Protocol;
  public game: Game | undefined;
  // protocol: Protocol;
  constructor(protocol: Protocol) {
    this.players = [];
    this.protocol = protocol;
    this.initProtocol(protocol);
  }

  public initProtocol(protocol: Protocol) {
    protocol.on(PackageType.TRY_JOIN_LOBBY, (obj: any, conn: DataConnection) => {
      this.join(Object(obj).username, conn);
    });
    protocol.on(PackageType.TRY_START_GAME, this.tryStart.bind(this));
    this.protocol = protocol;
  }

  public isUsernameExist(username: string) {
    return (
      this.players.filter((player: Player) => player.username === username).length > 0
    );
  }

  public isConnExist(conn: Conn) {
    return (
      this.players.filter((player: Player) => player.conn.peer === conn.peer).length > 0
    );
  }

  public playerUpdateConn(username: string, conn: Conn) {
    let id = -1;
    this.players.forEach((player) => {
      if (player.username === username) {
        player.conn = conn;
        id = player.id;
      }
    });
    return id;
  }

  public playerUpdateUsername(username: string, conn: Conn) {
    const connId = conn.peer;
    let id = -1;
    this.players.forEach((player) => {
      if (player.conn.peer === connId) {
        player.username = username;
        id = player.id;
      }
    });
    return id;
  }

  public join(username: string, conn: Conn) {
    global.console.log(username + ' ' + conn.peer + ' attemp to join');
    if (this.isUsernameExist(username)) {
      const playerId = this.playerUpdateConn(username, conn);
      if (playerId === -1) {
        return;
      }
      const player = this.players.find((player) => player.id === playerId);
      this.protocol.emit(PackageType.UPDATE_LOBBY, {
        username,
        playerId,
        connId: conn.peer,
      });
      if (this.started && this.game && player) {
        this.game.rejoin(player);
      }
    } else if (this.isConnExist(conn)) {
      const playerId = this.playerUpdateUsername(username, conn);
      if (playerId === -1) {
        return;
      }
      this.protocol.emit(PackageType.UPDATE_LOBBY, {
        username,
        playerId,
        connId: conn.peer,
      });
    } else {
      if (this.started) {
        // reject
        return;
      } else {
        const player = new Player(conn);
        player.username = username;
        player.id = this.genPlayerId();
        this.players.push(player);
        this.protocol.emit(PackageType.UPDATE_LOBBY, {
          username,
          playerId: player.id,
          connId: conn.peer,
        });
      }
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
        'gamestart',
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
