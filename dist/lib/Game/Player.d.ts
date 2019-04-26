/// <reference types="peerjs" />
import DataConnection = PeerJs.DataConnection;
import { PackageType } from 'tone-core/dist/lib';
export declare class Player {
    id: number;
    username: string;
    humanPlayer: boolean;
    conn: DataConnection;
    constructor(conn: DataConnection);
    emit(event: PackageType, object: any): void;
}
