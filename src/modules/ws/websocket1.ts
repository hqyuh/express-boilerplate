/* eslint-disable max-len */
/* eslint-disable no-console */
import type http from 'http';

import type { TNullable } from '@/common/interfaces/entity-type';
import { WebSocket, Server as WebSocketServer } from 'ws';

class WebSocketManager {
  private static instance: TNullable<WebSocketManager> = null;

  private connections: Record<string, Set<WebSocket>> = {};

  private globalConnections: Set<WebSocket> = new Set();

  public static getInstance(): WebSocketManager {
    return (WebSocketManager.instance ??= new WebSocketManager());
  }

  public initializeWebSocket(server: http.Server): WebSocketServer {
    const wsServer = new WebSocketServer({ server });

    wsServer.on('connection', (ws: WebSocket, request: http.IncomingMessage) => {
      const urlParams = new URLSearchParams(request.url?.slice(1) ?? '');
      const user = urlParams.get('user');
      const group = urlParams.get('group');

      this.handleConnection(ws, user, group);
    });

    return wsServer;
  }

  private handleConnection(ws: WebSocket, user: TNullable<string>, group: TNullable<string>): void {
    const connectionType = group ? 'group' : 'global';
    const groupInfo = group ? ` ${group}` : '';
    console.log(`User ${user} joined ${connectionType}${groupInfo}`);

    if (group) {
      this.addConnection(ws, group);
    } else {
      this.globalConnections.add(ws);
    }

    ws.on('message', (data) => this.handleMessage(ws, data, user, group));
    ws.on('close', () => this.handleClose(ws, user, group));
    ws.on('error', (error) => this.handleError(ws, error, user, group));
  }

  private addConnection(ws: WebSocket, group: string): void {
    this.connections[group] ??= new Set();
    this.connections[group].add(ws);
  }

  private handleMessage(_ws: WebSocket, data: unknown, user: TNullable<string>, group: TNullable<string>): void {
    const message = this.extractMessage(data);

    if (message === null) {
      return;
    }

    const clients = group ? this.connections[group] : this.globalConnections;
    const logPrefix = group ? `Group ${group}` : 'Globally';
    this.broadcast(message, user, clients, logPrefix);
  }

  private extractMessage(data: unknown): TNullable<string> {
    if (typeof data === 'string') {
      return data;
    }

    if (data instanceof Buffer) {
      return data.toString('utf8');
    }

    return null;
  }

  private handleClose(ws: WebSocket, user: TNullable<string>, group: TNullable<string>): void {
    const connectionType = group ? `Group ${group}` : 'Globally';
    console.log(`User ${user} left ${connectionType}`);

    if (group) {
      const groupSet = this.connections[group];

      groupSet.delete(ws);

      if (groupSet.size === 0) {
        delete this.connections[group];
      }
    } else {
      this.globalConnections.delete(ws);
    }
  }

  private handleError(ws: WebSocket, error: Error, user: TNullable<string>, group: TNullable<string>): void {
    const groupInfo = group ? `Group ${group}` : 'Global';
    console.error(`WebSocket error for user ${user} in ${groupInfo}:`, error);
    this.handleClose(ws, user, group);
  }

  private broadcast(message: string, user: TNullable<string>, clients: Set<WebSocket>, logPrefix: string): void {
    console.log(`${logPrefix} has ${clients.size} members`);

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        console.log(`User ${user} says ${logPrefix.toLowerCase()}: ${message}`);
        client.send(`User ${user} says ${logPrefix.toLowerCase()}: ${message}`);
      }
    }
  }
}

export const websocketManager = WebSocketManager.getInstance();
