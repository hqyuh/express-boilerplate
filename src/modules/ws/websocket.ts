import { randomUUID } from 'node:crypto';
import type http from 'node:http';
import { type RawData, type WebSocket, Server as WebSocketServer } from 'ws';
import type { TNullable } from '@/common/interfaces/entity-type';

class WebSocketManager {
  private static instance: TNullable<WebSocketManager> = null;

  private connections: Record<string, WebSocket> = {};

  private users: Record<string, { username: TNullable<string>; state: Record<string, unknown> }> = {};

  public static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }

    return WebSocketManager.instance;
  }

  public initializeWebSocket(server: http.Server): WebSocketServer {
    const wsServer = new WebSocketServer({ server });

    wsServer.on('connection', (ws: WebSocket, request: Request) => {
      const uuid = randomUUID();
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

export const websocketManager = WebSocketManager.getInstance();
