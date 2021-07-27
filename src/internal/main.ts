/**
 * ©copyright 2021 dmod
 */

import webscoket from 'ws';
import discordSocket from '../discord/connector';
import CredentialsManager from './credentialsManager';

interface PayloadMain {
  op: number;
  ev?: string;
  d?: any;
}

const toJson = (content: PayloadMain) => JSON.stringify(content);
const fromStringToPayload = (content: string) => JSON.parse(content) as PayloadMain;

export default class connection {
  _socket: webscoket.Server | null = null;
  discordSocket = new discordSocket();

  constructor() {
    this._socket = new webscoket.Server({ port: 7102 });
    this._init();
  }

  private async _init() {
    if (!this._socket) return;
    await this.discordSocket.connect();

    this._socket.on('connection', (socket, request) => {
      if (!this.discordSocket.ready) {
        try {
          socket.close(1000, 'Client not ready');
        } catch (_) {}
        return;
      }
      const credentials = new CredentialsManager();

      socket.send(toJson({ op: 0 }));
      socket.on('message', this.messageHandler.bind(this, credentials));

      // If the connection takes to long
      setTimeout(() => {
        if (!credentials.auth) socket.close(1000);
      }, 20 * 1000 /** 60000 */);

      console.log('Socket resived connection');
    });

    this._socket.on('listening', () => console.log('Socket connected'));
  }

  messageHandler(credentials: CredentialsManager, data: webscoket.Data) {
    const payload = fromStringToPayload(data as string);

    console.log(payload, credentials);
  }
}
