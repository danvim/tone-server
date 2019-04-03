/// <reference types="peerjs" />
import Peer = PeerJs.Peer;
import { Protocol } from 'tone-core/dist/lib';
export default class Robot {
    static getInstance(): Robot;
    private static instance;
    private readonly peer;
    private readonly protocol;
    private constructor();
    getPeer(): Peer;
    getProtocol(): Protocol;
}
