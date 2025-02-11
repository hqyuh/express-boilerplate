/* eslint-disable no-console */
import { WebSocket, Server as WebSocketServer } from 'ws';

class WebSocketManager {
  private connections: Record<string, WebSocket[]> = {};

  private globalConnections: WebSocket[] = [];

  public initializeWebSocket() {
    const wsServer = new WebSocketServer({ port: 8080 });

    wsServer.on('connection', (ws: WebSocket, request: Request) => {
      const urlParams = new URLSearchParams(request.url.slice(1));
      const user = urlParams.get('user');
      const group = urlParams.get('group');

      this.handleConnection(ws, user, group);
    });

    return wsServer;
  }

  private handleConnection(ws: WebSocket, user: string | null, group: string | null) {
    const connectionType = group ? 'group' : 'global';
    const groupInfo = group ? ` ${group}` : '';
    console.log(`User ${user} joined ${connectionType}${groupInfo}`);

    if (group) {
      this.addConnection(ws, group);
    } else {
      this.globalConnections.push(ws);
    }

    ws.on('message', (data) => this.handleMessage(ws, data, user, group));
    ws.on('close', () => this.handleClose(ws, user, group));
  }

  private addConnection(ws: WebSocket, group: string) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.connections[group]) {
      this.connections[group] = [];
    }

    this.connections[group].push(ws);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleMessage(ws: WebSocket, data: any, user: string | null, group: string | null) {
    let message = '';

    if (Buffer.isBuffer(data)) {
      message = data.toString('utf8');
    }

    if (group) {
      this.broadcast(message, user, this.connections[group], `Group ${group}`);
    } else {
      this.broadcast(message, user, this.globalConnections, 'Globally');
    }
  }

  private handleClose(ws: WebSocket, user: string | null, group: string | null) {
    const connectionType = group ? `Group ${group}` : 'Globally';
    console.log(`User ${user} left ${connectionType}`);

    if (group) {
      this.connections[group] = this.connections[group].filter((client) => client !== ws);

      if (this.connections[group].length === 0) {
        delete this.connections[group];
      }
    } else {
      this.globalConnections = this.globalConnections.filter((client) => client !== ws);
    }
  }

  private broadcast(message: string, user: string | null, clients: WebSocket[], logPrefix: string) {
    console.log(`${logPrefix} has ${clients.length} members`);

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        console.log(`User ${user} says ${logPrefix.toLowerCase()}: ${message}`);
        client.send(`User ${user} says ${logPrefix.toLowerCase()}: ${message}`);
      }
    }
  }
}

export function initializeWebSocket() {
  const manager = new WebSocketManager();

  return manager.initializeWebSocket();
}
