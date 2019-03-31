"use strict";
// import Peer = PeerJs.Peer;
// import { port } from "./ServerConfigs";
// const P = require("peerjs-nodejs");
// export default class Robot {
//   private peer: Peer;
//   private static instance: Robot;
//   // private connections: Array<PeerJs.DataConnection>;
//   private constructor() {
//     // this.connections = [];
//     this.peer = <Peer>new P("server", {
//       host: "localhost",
//       port: port,
//       path: "/peer"
//     });
//     this.peer.on("connection", conn => {
//       console.log(`Robot connected with ${conn.peer}!`);
//       // console.log(conn);
//       // this.connections.push(conn);
//       // @ts-ignore
//       global.conn = conn;
//       conn.serialization = "none";
//       conn.on("data", data => {
//         // console.log(data);
//         conn.send(data);
//         this.broadcast(data);
//       });
//     });
//   }
//   public static getInstance() {
//     if (!Robot.instance) {
//       Robot.instance = new Robot();
//     }
//     return Robot.instance;
//   }
//   public getPeer() {
//     return this.peer;
//   }
//   public broadcast(data: any) {
//     // console.log(data);
//     // console.log(this.peer.connections);
//     // Object.values(this.peer.connections).forEach((conns: any) => {
//     //   // console.log(conns);
//     //   conns.forEach((conn: any) => {
//     //     conn.send(data);
//     //   });
//     // });
//   }
// }
