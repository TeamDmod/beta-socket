/**
 * ©copyright 2021 dmod
 */

import webscoket from 'ws';
import discordSocket from '../discord/connector';
import { OperationCodes } from './constents';
import CredentialsManager from './credentialsManager';

interface PayloadMain {
  op: number;
  t?: string | null;
  d?: any;
}

const toJson = (content: PayloadMain) => JSON.stringify({ d: null, t: null, ...content });
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
    this.discordSocket.connect();

    this._socket.on('connection', (socket, request) => {
      if (!this.discordSocket.ready) {
        try {
          socket.close(1000, 'Client not ready');
        } catch (_) {}
        return;
      }
      const credentials = new CredentialsManager();

      socket.send(toJson({ op: OperationCodes.REQUEST_AUTH }));
      socket.on('message', this.messageHandler.bind(this, credentials, socket));

      // If the connection takes to long
      setTimeout(() => {
        if (!credentials.auth) socket.close(1000);
      }, 20 * 1000 /** 60000 */);

      console.log('Socket resived connection');
    });

    this.discordSocket.on('GUILD_PRIVILEGE_UPDATE', (...args) => console.log(args));
    this._socket.on('listening', () => console.log('Socket connected'));
  }

  messageHandler(credentials: CredentialsManager, socket: webscoket, data: webscoket.Data) {
    const payload = fromStringToPayload(data as string);

    switch (payload.op) {
      case OperationCodes.AUTHENTICATION: {
        const has = Object.prototype.hasOwnProperty;
        if (!payload.d || !(payload.d && has.call(payload.d, 'token') && has.call(payload.d, 'uid'))) {
          socket.close(1000, 'Missing authentication data');
          return;
        }

        const { token, uid } = payload.d;

        if (token === null && uid === null) {
          credentials.type = 1;
          credentials.auth = true;
          socket.send(
            toJson({
              op: OperationCodes.AUTHENTICATION_PASS,
              t: null,
              d: {
                missed_notifications: [],
              },
            })
          );
        } else if (token && uid) {
          // TODO: check the database if this is a valid token
          // credentials.type = 2;
          // credentials.auth = true;
          socket.close(1000, 'Invalid formating of authentication');
        } else {
          socket.close(1000, 'Invalid formating of authentication');
        }
        break;
      }

      default:
        break;
    }
  }
}
