import { Player } from './Player';
import { Protocol, PackageType } from 'tone-core/dist/lib';
import Conn = PeerJs.DataConnection;
import { Game } from '.';
export class Lobby {
  players: Array<Player>;
  started: boolean = false;
  protocol: Protocol;
  game: Game | undefined;
  // protocol: Protocol;
  constructor(protocol: Protocol) {
    this.players = [];
    this.protocol = protocol;
    this.initProtocol(protocol);
  }
  initProtocol = (protocol: Protocol) => {
    protocol.on(PackageType.TRY_JOIN_LOBBY, (obj, conn) => {
      this.join(Object(obj).username, conn);
    });
    protocol.on(PackageType.TRY_START_GAME, this.tryStart);
    this.protocol = protocol;
  };
  isUsernameExist = (username: string) => {
    return (
      this.players.filter(player => player.username === username).length > 0
    );
  };
  isConnExist = (conn: Conn) => {
    return (
      this.players.filter(player => player.conn.peer === conn.peer).length > 0
    );
  };
  playerUpdateConn = (username: string, conn: Conn) => {
    let id = -1;
    this.players.forEach(player => {
      if (player.username == username) {
        player.conn = conn;
        id = player.id;
      }
    });
    return id;
  };
  playerUpdateUsername = (username: string, conn: Conn) => {
    let connId = conn.peer;
    let id = -1;
    this.players.forEach(player => {
      if (player.conn.peer == connId) {
        player.username = username;
        id = player.id;
      }
    });
    return id;
  };
  join = (username: string, conn: Conn) => {
    console.log(username + ' ' + conn.peer + ' attemp to join');
    if (this.isUsernameExist(username)) {
      const playerId = this.playerUpdateConn(username, conn);
      playerId !== -1 &&
        this.protocol.emit(PackageType.UPDATE_LOBBY, {
          username,
          playerId,
          connId: conn.peer,
        });
    } else if (this.isConnExist(conn)) {
      const playerId = this.playerUpdateUsername(username, conn);
      playerId !== -1 &&
        this.protocol.emit(PackageType.UPDATE_LOBBY, {
          username,
          playerId,
          connId: conn.peer,
        });
    } else {
      if (this.started) {
        //reject
        return;
      } else {
        let player = new Player(conn);
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
  };
  //logic: first ascending sort, then increment until see a gap or reach last of list(id of player length)
  genPlayerId = () => {
    this.players.sort((a, b) => a.id - b.id);
    return this.players.reduce(
      (prev, player) => (player.id === prev ? prev + 1 : prev),
      0
    );
  };
  tryStart = () => {
    if (!this.started) {
      console.log(
        'gamestart',
        this.players.map(player => ({
          username: player.username,
          id: player.id,
        }))
      );
      this.started = true;
      this.protocol.emit(PackageType.START_GAME, {});
      this.game = new Game(this.players, this.protocol);
    }
  };
}
