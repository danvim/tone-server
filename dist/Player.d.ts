/// <reference types="peerjs" />
import Conn = PeerJs.DataConnection;
import { PackageType } from 'tone-core/dist/lib';
export declare class Player {
    id: number;
    username: string;
    humanPlayer: boolean;
    conn: Conn;
    constructor(conn: Conn);
    emit(event: PackageType, object: any): void;
}
