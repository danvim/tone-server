import { Player } from './Player';
import { Protocol, PackageType } from 'tone-core/dist/lib';
import Conn = PeerJs.DataConnection;
import { Game } from './Game';
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
  initProtocol(protocol: Protocol) {
    protocol.on(PackageType.TRY_JOIN_LOBBY, (obj, conn) =>
      this.join(obj.username, conn)
    );
    protocol.on(PackageType.TRY_START_GAME, this.tryStart);
    this.protocol = protocol;
  }
  isUsernameExist(username: string) {
    return (
      this.players.filter(player => player.username === username).length > 0
    );
  }
  playerUpdateConn(username: string, conn: Conn) {
    let id = -1;
    this.players.forEach(player => {
      if (player.username == username) {
        player.conn = conn;
        id = player.id;
      }
    });
    return id;
  }
  join(username: string, conn: Conn) {
    console.log(username + ' attemp to join');
    console.log(this.players);
    if (this.isUsernameExist(username)) {
      const playerId = this.playerUpdateConn(username, conn);
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
    console.log(this.players);
  }
  //logic: first ascending sort, then increment until see a gap or reach last of list(id of player length)
  genPlayerId() {
    this.players.sort((a, b) => a.id - b.id);
    return this.players.reduce(
      (prev, player) => (player.id === prev ? prev + 1 : prev),
      0
    );
  }
  tryStart = () => {
    if (!this.started) {
      console.log(this.players);
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
