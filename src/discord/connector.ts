/**
 * ©copyright 2021 dmod
 */

import { EventEmitter } from 'events';
import websocket from 'ws';
import { TOKEN } from '../configs';
import type { clientEvents } from '../ev';
import { OperationCodes } from '../internal/constents';
import { DiscordPayload, discordUser } from '../typings';
import Api from '../utils/api';
import Collection from '../utils/collection';
import { Opcodes } from './constents';
import Guild from './guild';
import GuildMember from './member';

export default class discordSocket extends EventEmitter {
  public on!: <K extends keyof clientEvents>(event: K, listener: (...args: clientEvents[K]) => void) => this;

  guilds = new Collection<string, Guild>();
  reconnectTrys = 0;
  #isNextresume = false;
  sequence: number = -1;
  sessionID?: null | number;
  // unavailableGuilds = new Map<string, any>();
  _socket: websocket | null = null;
  heartbeatInterval: NodeJS.Timeout | null = null;
  lastHeartbeatAcked = true;
  api = new Api(TOKEN);
  me: null | discordUser = null;
  ready = false;
  /**
   * https://github.com/discordjs/discord.js
   * Gateway ratelimiting used form discord.js
   * @license Apache License 2.0 - 2021 Amish Shah
   */
  ratelimit!: {
    queue: string[];
    total: number;
    remaining: number;
    time: number;
    timer: NodeJS.Timer | null;
  };

  constructor() {
    super();

    Object.defineProperty(this, 'ratelimit', {
      value: {
        queue: [],
        total: 120,
        remaining: 120,
        time: 60e3,
        timer: null,
      },
    });
  }

  async connect() {
    this.reconnectTrys += 1;
    const ws = (this._socket = new websocket(await this.api.getGateway()));

    ws.onmessage = this.handleMessage.bind(this);
    ws.onclose = this.handlerClose.bind(this);
    ws.onerror = this.handlerError.bind(this);
  }

  async handleMessage(event: websocket.MessageEvent) {
    const payload: DiscordPayload = JSON.parse(event.data as string);

    if ((payload.s as number) > this.sequence) this.sequence = payload.s as number;

    switch (payload.op) {
      case Opcodes.HELLO:
        console.log('Identifying/Resuming...');

        if (this.#isNextresume) {
          this.resume();
        } else {
          this.#isNextresume = true;
          this.identify();
        }
        this.setHeartbeatTimer(payload.d.heartbeat_interval);
        break;

      case Opcodes.INVALID_SESSION:
        console.log('Invalid session :sweting:');

        this.sequence = -1;
        this.sessionID = null;
        break;

      case Opcodes.HEARTBEAT_ACK:
        this.lastHeartbeatAcked = true;
        break;

      case Opcodes.DISPATCH:
        break;

      case Opcodes.RECONNECT:
        this.destroy({ code: 4000 });
        break;

      default:
        console.log(payload);
        break;
    }

    if (payload.t) await this.handelT(payload);
  }

  handlerError(event: websocket.ErrorEvent) {
    const error = event?.error ?? event;
    if (!error) return;

    if (this.reconnectTrys < 20) {
      setTimeout(() => this.connect(), 2000);
    }

    console.log('error:', error);
  }

  handlerClose({ reason }: websocket.CloseEvent) {
    if (reason.includes('Authentication failed.')) this.emit('AUTH');

    this.setHeartbeatTimer(-1);
    // If we still have a connection object, clean up its listeners
    if (this._socket) this._cleanupConnection();

    if (this.reconnectTrys < 20) {
      setTimeout(() => this.connect(), 2000);
    }

    console.log('reason:', reason);
  }

  setHeartbeatTimer(time: number) {
    if (time === -1) {
      if (this.heartbeatInterval) this.heartbeatInterval = null;
      return;
    }

    if (this.heartbeatInterval) this.heartbeatInterval = null;
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), time);
  }

  sendHeartbeat() {
    if (!this.lastHeartbeatAcked) {
      this.destroy({ code: 4009 });
      return;
    }

    this.lastHeartbeatAcked = false;
    this.sendPayload({ op: 1, d: null });
  }

  sendPayload(data: DiscordPayload, important = false) {
    this.ratelimit.queue[important ? 'unshift' : 'push'](JSON.stringify(data));
    this.process();
  }

  _send(payload: string) {
    if (this._socket && this._socket.readyState !== 1) return;
    this._socket!.send(payload);
  }

  resume() {
    this.sendPayload(
      {
        op: Opcodes.RESUME,
        d: {
          token: TOKEN,
          session_id: this.sessionID,
          seq: this.sequence,
        },
      },
      true
    );
  }

  identify() {
    this.sendPayload(
      {
        op: 2,
        d: {
          token: TOKEN,
          intents: (1 << 0) | (1 << 1),
          properties: {
            $os: process.platform,
            $browser: 'dmod-ws',
            $device: 'dmod-ws',
          },
        },
      },
      true
    );
  }

  destroy({ code = 1000 } = {}) {
    this.setHeartbeatTimer(-1);
    if (this._socket) {
      if (this._socket.readyState === 1) {
        this._socket.close(code);
      } else {
        this._cleanupConnection();
      }

      try {
        this._socket.close(code);
      } catch {}
    }
  }

  private _cleanupConnection() {
    this._socket!.onopen = this._socket!.onclose = this._socket!.onerror = this._socket!.onmessage = () => {};
  }

  private async handelT(ev: DiscordPayload) {
    switch (ev.t) {
      case 'READY': {
        this.sessionID = ev.s;
        this.me = ev.d.user;
        this.ready = true;
        this.setPresence();

        for (const guild of ev.d.guilds) this.guilds.set(guild.id, new Guild(this, guild));
        console.log('discord client ready');
        break;
      }

      case 'GUILD_CREATE': {
        const guild = this.guilds.get(ev.d.id);
        if (guild) {
          if (!guild.available && !ev.d.unavailable) guild._patch(ev.d);
        } else {
          const guild = new Guild(this, ev.d);
          this.guilds.set(ev.d.id, guild);
        }
        break;
      }

      case 'GUILD_MEMBERS_CHUNK': {
        const guild = this.guilds.get(ev.d.guild_id);
        if (!guild) return;

        for (const member of ev.d.members) guild.members.set(member.user.id, new GuildMember(this, member, guild));

        this.lastHeartbeatAcked = true;
        break;
      }

      case 'GUILD_MEMBER_UPDATE': {
        const guild = this.guilds.get(ev.d.guild_id);
        if (!guild) return;
        const member = guild.members.get(ev.d.user.id);
        if (!member) return;

        const newMember = new GuildMember(this, ev.d, guild);

        if (newMember.permissions !== member.permissions) {
          /**
           * Emited when member permissions are updated
           * Never emited for a server owner, as they have top permissions level forever :eyes:
           * @emit "GUILD_PRIVILEGE_UPDATE"
           */
          this.emit('GUILD_PRIVILEGE_UPDATE', guild.id, {
            id: member.id,
            tag: `${member.user.username}#${member.user.discriminator}`,
            permissions: newMember.permissions.toString(),
          });
        }

        member._patch(ev.d);
        break;
      }

      case 'GUILD_ROLE_CREATE': {
        const guild = this.guilds.get(ev.d.guild_id);
        if (!guild) return;

        guild.roles.set(ev.d.role.id, ev.d.role);
        break;
      }

      case 'GUILD_ROLE_DELETE': {
        const guild = this.guilds.get(ev.d.guild_id);
        if (!guild) return;

        guild.roles.delete(ev.d.role_id);
        break;
      }

      case 'GUILD_ROLE_UPDATE': {
        const guild = this.guilds.get(ev.d.guild_id);
        if (!guild) return;
        const role = guild.roles.get(ev.d.role.id);
        if (!role) return;

        guild.roles.delete(ev.d.role.id);
        guild.roles.set(ev.d.role.id, ev.d.role);

        if (role.permissions !== ev.d.role.permissions) {
          /**
           * Emited when role permissions are changed
           * @emit "GUILD_ROLE_PERMISSIONS"
           */
          this.emit('GUILD_ROLE_PERMISSIONS', guild.id, {
            id: role.id,
            permissions: ev.d.role.permissions.toString(),
          });
        }
        break;
      }

      // TODO: Add a limiter as to how many update counts can be sent.
      case 'GUILD_MEMBER_ADD': {
        const guild = this.guilds.get(ev.d.guild_id);
        if (!guild) return;
        guild.memberCount++;
        guild.members.set(ev.d.user.d, new GuildMember(this, ev.d, guild));

        this.emit('GUILD_MEMBER_COUNT_CHANGE', guild.id, { member_count: guild.memberCount });
        break;
      }
      case 'GUILD_MEMBER_REMOVE': {
        const guild = this.guilds.get(ev.d.guild_id);
        if (!guild) return;
        guild.memberCount--;
        guild.members.delete(ev.d.user.d);

        this.emit('GUILD_MEMBER_COUNT_CHANGE', guild.id, { member_count: guild.memberCount });
        break;
      }

      case 'APPLICATION_COMMAND_CREATE':
      case 'APPLICATION_COMMAND_DELETE':
      case 'APPLICATION_COMMAND_UPDATE':
      case 'GUILD_APPLICATION_COMMAND_COUNTS_UPDATE':
      case 'APPLICATION_COMMAND_PERMISSIONS_UPDATE':
        break;

      default:
        console.log('Unhandled:\n', ev);
        break;
    }
  }

  setPresence(data?: presenceData) {
    this.sendPayload({
      op: 3,
      d: {
        since: data?.since || Date.now(),
        activities: data?.activities ?? [
          {
            name: 'Over All',
            type: 3,
          },
        ],
        status: data?.status || this.reconnectTrys >= 15 ? 'dnd' : 'online',
        afk: !!data?.afk,
      },
    });
  }

  process() {
    if (this.ratelimit.remaining === 0) return;
    if (this.ratelimit.queue.length === 0) return;
    if (this.ratelimit.remaining === this.ratelimit.total) {
      this.ratelimit.timer = setTimeout(() => {
        this.ratelimit.remaining = this.ratelimit.total;
        this.process();
      }, this.ratelimit.time);
    }
    while (this.ratelimit.remaining > 0) {
      const item = this.ratelimit.queue.shift();
      if (!item) return;
      this._send(item);
      this.ratelimit.remaining--;
    }
  }

  incrementMaxListeners() {
    const maxListeners = this.getMaxListeners();
    if (maxListeners !== 0) {
      this.setMaxListeners(maxListeners + 1);
    }
  }

  decrementMaxListeners() {
    const maxListeners = this.getMaxListeners();
    if (maxListeners !== 0) {
      this.setMaxListeners(maxListeners - 1);
    }
  }
}

interface presenceData {
  since?: number;
  activities?: {
    name: string;
    type: 0 | 1 | 2 | 3 | 4 | 5;
    url?: string | null;
  }[];
  status?: 'dnd' | 'online' | 'idle';
  afk?: boolean;
}
