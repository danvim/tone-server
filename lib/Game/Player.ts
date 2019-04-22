import DataConnection = PeerJs.DataConnection;
import { PackageType, Protocol } from 'tone-core/dist/lib';

export class Player {
  public id: number = -1;
  public username: string = '';
  public humanPlayer: boolean = true;
  public conn?: DataConnection;
  constructor(conn?: DataConnection) {
    if (conn) {
      this.conn = conn;
    }
  }

  public emit(event: PackageType, object: any) {
    if (this.conn) {
      this.conn.send(Protocol.encode(event, object));
    }
  }
}
