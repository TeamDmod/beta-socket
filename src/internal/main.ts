/**
 * ©copyright 2021 dmod
 */

import webscoket from 'ws';
import discordSocket from '../discord/connector';
import { OperationCodes } from './constents';
import Permissions from '../discord/permissions';
import CredentialsManager from './credentialsManager';
import EventsManager from './EventsManager';
import { createServer } from 'https';
import fs from 'fs';
import path from 'path';
import tokenModule from '../tokenModule';
import Bucket from '../utils/bucket';

type commands = 'CONNECT_GUILD' | 'DESCONNECT_GUILD';
interface PayloadMain {
  op: number;
  t?: string | null;
  cmd?: commands;
  d?: any;
}

const toJson = (content: PayloadMain) => JSON.stringify({ d: null, t: null, ...content });
const fromStringToPayload = (content: string) => JSON.parse(content) as PayloadMain;
const has = Object.prototype.hasOwnProperty;

export default class connection {
  _socket: webscoket.Server | null = null;
  discordSocket = new discordSocket();

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.createServer();
    } else {
      this._socket = new webscoket.Server({ port: 7102, maxPayload: 1000 });
    }
    this._init();
  }

  get origin() {
    return process.env.NODE_ENV === 'production' ? 'https://dmod.gg' : 'http://localhost:3000';
  }

  private async _init() {
    if (!this._socket) return;
    this.discordSocket.connect();
    const eventManager = new EventsManager(this.discordSocket);

    this._socket.on('connection', (socket, request) => {
      if (request.headers.origin !== this.origin) {
        socket.close(1000, 'CORS');
        return;
      }
      if (!this.discordSocket.ready) {
        try {
          socket.close(1000, 'Client not ready');
        } catch {}
        return;
      }
      const credentials = new CredentialsManager();
      const bucket = new Bucket(50, 5000, 5, 10000);

      socket.send(toJson({ op: OperationCodes.REQUEST_AUTH }));
      socket.on('message', this.messageHandler.bind(this, credentials, socket, eventManager, bucket));
      socket.on('close', () => {
        eventManager.decrementMaxListeners();
        if (credentials.guildID && credentials.fn) eventManager.removeListener(credentials.guildID, credentials.fn as (...args: any[]) => void);
      });

      // If the connection takes to long
      setTimeout(() => {
        if (!credentials.auth) socket.close(1000);
      }, 20 * 1000 /** 60000 */);

      console.log('Socket resived connection');
    });

    this._socket.on('listening', () => console.log('Socket connected'));
  }

  async messageHandler(credentials: CredentialsManager, socket: webscoket, eventManager: EventsManager, bucket: Bucket, data: webscoket.Data) {
    if (bucket.add()) {
      socket.close(1000, 'Rate Limited');
      eventManager.decrementMaxListeners();
      if (credentials.guildID && credentials.fn) eventManager.removeListener(credentials.guildID, credentials.fn as (...args: any[]) => void);
      return;
    }

    const payload = fromStringToPayload(data as string);

    switch (payload.op) {
      case OperationCodes.AUTHENTICATION: {
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
          const uds = await tokenModule.findOne({ for: uid, tokenHash: token });
          if (!uds) return socket.close(1000, 'Invalid token');
          credentials.type = 2;
          credentials.userID = uid;
          credentials.auth = true;

          // TODO: featch/save notification
          socket.send(
            toJson({
              op: OperationCodes.AUTHENTICATION_PASS,
              t: null,
              d: {
                missed_notifications: [],
              },
            })
          );
        } else {
          socket.close(1000, 'Invalid formating of authentication');
        }
        break;
      }

      case OperationCodes.COMMAND: {
        if (payload.cmd === 'CONNECT_GUILD') {
          if (credentials.guildAuth) {
            return;
          }
          if (!payload.d || !(payload.d && has.call(payload.d, 'token') && has.call(payload.d, 'gid'))) {
            socket.close(1000, 'Missing authentication data');
            return;
          }

          const { token, gid } = payload.d as { token: string; gid: string };

          if (!token || !gid) {
            socket.close(1000, 'Invalid formating of authentication');
            return;
          }

          const guild = this.discordSocket.guilds.get(gid);
          if (!guild) {
            socket.close(1000, 'Guild not found');
            return;
          }

          const tokenInfo = await tokenModule.findOne({ tokenHash: token, for: gid });

          if (!tokenInfo) {
            socket.close(1000, 'Invalid token');
            return;
          }

          if (tokenInfo.use > 6 || tokenInfo.type !== 'gatewayGuild') {
            await tokenInfo.deleteOne();
            socket.close(1000, 'Invalid token');
            return;
          }

          await tokenInfo.updateOne({ $inc: { use: 1 } });

          credentials.setGuildInfo(gid, token);
          eventManager.register('GUILD_PRIVILEGE_UPDATE', (id, d) => {
            // console.log('EVENT "GUILD_PRIVILEGE_UPDATE", ', d);
            // Ignore any other user
            if (d.id !== credentials.userID) return {};

            return {
              data: { guild_id: id, ...d },
              event: 'GUILD_PRIVILEGE_UPDATE',
            };
          });
          eventManager.register('GUILD_ROLE_PERMISSIONS', (id, d) => {
            // console.log('EVENT "GUILD_ROLE_PERMISSIONS", ', d);
            const guild = this.discordSocket.guilds.get(id);
            if (!guild) return {};
            const member = guild.members.get(credentials.userID as string);
            if (!member) return {};
            if (!member.roles.has(d.id)) return {};

            // Build out new user permissions
            const permissions = new Permissions(guild, member);

            return {
              data: {
                guild_id: guild.id,
                id: credentials.userID,
                tag: `${member.user.username}#${member.user.discriminator}`,
                permissions: permissions.permissions.toString(),
              },
              event: 'GUILD_PRIVILEGE_UPDATE',
            };
          });

          eventManager.register('GUILD_MEMBER_COUNT_CHANGE', (id, d) => ({ data: { guild_id: id, ...d }, event: 'GUILD_MEMBER_COUNT_CHANGE' }));

          credentials.fn = ({ data, event }: any) => {
            if (!data || !event) return;
            socket.send(
              toJson({
                op: OperationCodes.EVENT,
                t: event,
                d: data,
              })
            );
          };

          eventManager.incrementMaxListeners();
          eventManager.on(credentials.guildID ?? '', credentials.fn as (...args: any[]) => void);

          socket.send(
            toJson({
              op: OperationCodes.COMMAND_RESPONCE,
              d: {
                for: 'CONNECT_GUILD',
                data: {
                  guild: guild.toGatewayGuild(),
                  user: credentials.userID ? guild.members.get(credentials.userID)?.toUserGateway() ?? null : null,
                },
              },
            })
          );
        } else if (payload.cmd === 'DESCONNECT_GUILD') {
          if (!credentials.guildAuth) {
            return;
          }

          if (!payload.d || !(payload.d && has.call(payload.d, 'gid'))) {
            socket.close(1000, 'Missing authentication data');
            return;
          }

          const { gid } = payload.d;
          eventManager.removeListener(gid, credentials.fn as (...args: any[]) => void);
          credentials.setGuildInfo(null, null);

          socket.send(
            toJson({
              op: OperationCodes.COMMAND_RESPONCE,
              d: {
                for: 'DESCONNECT_GUILD',
                data: {
                  success: true,
                },
              },
            })
          );
        }
        break;
      }

      default:
        socket.close(1000, 'Unknown data');
        break;
    }
  }

  createServer() {
    const server = createServer({
      cert: fs.readFileSync(path.join(process.cwd(), '/server.crt')),
      key: fs.readFileSync(path.join(process.cwd(), '/server.key')),
    });
    this._socket = new webscoket.Server({ server, maxPayload: 1000 });

    const port = process.env.PORT || 7102;
    server.listen(port);
  }
}
