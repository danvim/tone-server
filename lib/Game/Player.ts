import Conn = PeerJs.DataConnection;
import { PackageType, Protocol } from 'tone-core/dist/lib';

export class Player {
  public id: number = -1;
  public username: string = '';
  public humanPlayer: boolean = true;
  public conn: Conn;
  constructor(conn: Conn) {
    this.conn = conn;
  }
  public emit(event: PackageType, object: any) {
    this.conn.send(Protocol.encode(event, object));
  }
}
