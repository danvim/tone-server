/// <reference types="peerjs" />
import Peer = PeerJs.Peer;
export default class Robot {
    private peer;
    private static instance;
    private protocol;
    private constructor();
    static getInstance(): Robot;
    getPeer(): Peer;
}
