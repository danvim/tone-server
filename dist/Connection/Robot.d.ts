/// <reference types="peerjs" />
import Peer = PeerJs.Peer;
import { Protocol } from 'tone-core/dist/lib';
export declare const protocol: Protocol;
export default class Robot {
    static getInstance(): Robot;
    private static instance;
    private peer;
    private protocol;
    private constructor();
    getPeer(): Peer;
}
