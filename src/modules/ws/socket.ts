import type http from 'node:http';
import { Server, type Socket } from 'socket.io';
import type { TNullable } from '@/common/interfaces/entity-type';

class SocketIOManager {
  private static instance: TNullable<SocketIOManager> = null;

  private io: TNullable<Server> = null;

  private groups: Map<string, Set<Socket>> = new Map();

  public static getInstance(): SocketIOManager {
    if (!SocketIOManager.instance) {
      SocketIOManager.instance = new SocketIOManager();
    }

    return SocketIOManager.instance;
  }

  public initializeSocketIO(server: http.Server): void {
    this.io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    this.io.on('connection', (socket: Socket) => {
      const username = socket.handshake.query.username as string;
      const group = socket.handshake.query.group as string;

      if (!username) {
        console.warn('User connected without a username.');
        socket.disconnect();

        return;
      }

      socket.emit('chat-welcome', `Welcome to the chat, ${username}!`);

      console.log(`User ${username} connected.`);

      if (group) {
        this.joinGroup(socket, group, username);
      } else {
        socket.on('message', (msg: string) => this.handleMessage(socket, msg, username));
      }

      socket.on('disconnect', () => this.handleDisconnect(username, group, socket));
      socket.on('error', (error) => this.handleError(socket, error, username));
    });

    this.io.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }

  private joinGroup(socket: Socket, group: string, username: string): void {
    if (!this.groups.has(group)) {
      this.groups.set(group, new Set<Socket>());
    }

    const groupSet = this.groups.get(group)!;

    groupSet.add(socket);

    socket.join(group);

    socket.on('message', (msg: string) => this.handleGroupMessage(socket, msg, username, group));

    console.log(`User ${username} joined group ${group}.`);
  }

  private handleMessage(_socket: Socket, msg: string, username: string): void {
    console.log(`User ${username}: ${msg}`);
    this.io?.emit('message', { username, message: msg });
  }

  private handleGroupMessage(socket: Socket, msg: string, username: string, group: string): void {
    console.log(`User ${username} in group ${group}: ${msg}`);
    socket.to(group).emit('group-message', { username, message: msg, group });
  }

  private handleDisconnect(username: string, group: string | undefined, socket: Socket): void {
    console.log(`${username} disconnected`);

    if (group) {
      const groupSet = this.groups.get(group);

      if (groupSet) {
        groupSet.delete(socket);

        if (groupSet.size === 0) {
          this.groups.delete(group);
        }
      }
    }
  }

  private handleError(socket: Socket, error: Error, username: string): void {
    console.error(`Socket.IO error for ${username}:`, error);
    socket.disconnect(true);
  }
}

export const socketIOManager = SocketIOManager.getInstance();
