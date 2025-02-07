/* eslint-disable no-console */
import { WebSocket, Server as WebSocketServer } from 'ws';

const connections: Record<string, WebSocket[]> = {};

export function initializeWebSocket() {
  const wsServer = new WebSocketServer({ port: 8080 });

  wsServer.on('connection', (ws: WebSocket, request: Request) => {
    const urlParams = new URLSearchParams(request.url.slice(1));
    const user = urlParams.get('user');
    const group = urlParams.get('group');

    if (!group) {
      ws.close(1008, 'Group not specified');

      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!connections[group]) {
      connections[group] = [];
    }

    connections[group].push(ws);
    console.log(`User ${user} joined group ${group}`);

    ws.on('message', (data) => {
      console.log('received: %s', data);

      let message = '';

      if (Buffer.isBuffer(data)) {
        message = data.toString('utf8');
        // ws.send(`received: ${message}`);
      }

      // Broadcast the message to all members of the group
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (connections[group]) {
        console.log(`Group ${group} has ${connections[group].length} members`);

        for (const client of connections[group]) {
          console.log(`Checking readyState: ${client.readyState}`);

          if (client.readyState === WebSocket.OPEN) {
            console.log(`User ${user} says: ${message}`);
            client.send(`User ${user} says: ${message}`);
          }
        }
      }
    });

    ws.on('close', () => {
      console.log(`User ${user} left group ${group}`);
      connections[group] = connections[group].filter((client) => client !== ws);

      if (connections[group].length === 0) {
        delete connections[group];
      }
    });
  });

  return wsServer;
}
