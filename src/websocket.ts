/* eslint-disable no-console */

import { v4 as uuidv4 } from 'uuid';
import { Server as WebSocketServer, type RawData, type WebSocket } from 'ws';

class WebSocketManager {
  private connections: Record<string, WebSocket> = {};

  private users: Record<string, { username: string | null; state: Record<string, unknown> }> = {};

  public initializeWebSocket() {
    const wsServer = new WebSocketServer({ port: 8080 });

    wsServer.on('connection', (ws: WebSocket, request: Request) => {
      const uuid = uuidv4();
      const urlParams = new URLSearchParams(request.url.slice(1));
      const username = urlParams.get('username');

      this.connections[uuid] = ws;
      this.users[uuid] = { username, state: {} };

      ws.on('message', (message) => this.handleMessage(message, uuid));
      ws.on('close', () => this.handleClose(uuid));
    });

    return wsServer;
  }

  private handleMessage(bytes: RawData, uuid: string): void {
    const message = JSON.parse(
      // eslint-disable-next-line max-len
      bytes instanceof Buffer ? bytes.toString('utf8') : Buffer.from(bytes as ArrayBuffer).toString('utf8')
    );
    const user = this.users[uuid];

    user.state = message;

    for (const tUUID of Object.keys(this.connections)) {
      const connection = this.connections[tUUID];
      const result = JSON.stringify(this.users);
      connection.send(result);
    }

    console.log(`${user.username} updated state: ${JSON.stringify(user.state)}`);
  }

  private handleClose(uuid: string): void {
    delete this.connections[uuid];
    delete this.users[uuid];

    for (const tUUID of Object.keys(this.connections)) {
      const connection = this.connections[tUUID];
      const message = JSON.stringify(this.users);
      connection.send(message);
    }
  }
}

export function initializeWebSocket() {
  const manager = new WebSocketManager();

  return manager.initializeWebSocket();
}
