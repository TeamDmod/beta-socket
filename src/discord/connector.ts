/**
 * ©copyright 2021 dmod
 */

import { EventEmitter } from 'events';
import websocket from 'ws';
import { TOKEN } from '../configs';
import type { clientEvents } from '../ev';
import { DiscordPayload, discordUser } from '../typings';
import Api from '../utils/api';
import Collection from '../utils/collection';
import Guild from './guild';
import GuildMember from './member';

export default class discordSocket extends EventEmitter {
  public on!: <K extends keyof clientEvents>(event: K, listener: (...args: clientEvents[K]) => void) => this;

  guilds = new Collection<string, Guild>();
  // unavailableGuilds = new Map<string, any>();
  _socket: websocket | null = null;
  heartbeatInterval: NodeJS.Timeout | null = null;
  lastHeartbeatAcked = true;
  api = new Api(TOKEN);
  me: null | discordUser = null;
  ready = false;

  async connect() {
    const ws = (this._socket = new websocket(await this.api.getGateway()));

    ws.onmessage = this.handleMessage.bind(this);
    ws.onclose = this.handlerClose.bind(this);
    ws.onerror = this.handlerError.bind(this);
  }

  async handleMessage(event: websocket.MessageEvent) {
    const payload: DiscordPayload = JSON.parse(event.data as string);

    switch (payload.op) {
      case 10:
        this.identify();
        this.setHeartbeatTimer(payload.d.heartbeat_interval);
        break;

      case 9:
        this.identify();
        break;

      case 11:
        this.lastHeartbeatAcked = true;
        break;

      case 0:
        break;

      case 7:
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

    console.log('error:', error);
  }

  handlerClose({ reason }: websocket.CloseEvent) {
    if (reason.includes('Authentication failed.')) this.emit('AUTH');

    this.setHeartbeatTimer(-1);
    // If we still have a connection object, clean up its listeners
    if (this._socket) this._cleanupConnection();

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

  sendPayload(data: DiscordPayload) {
    if (this._socket && this._socket.readyState !== 1) return;
    this._socket!.send(JSON.stringify(data));
  }

  identify() {
    this.sendPayload({
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
    });
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

        guild.roles.delete(ev.d.role.id);
        guild.roles.set(ev.d.role.id, ev.d.role);
        break;
      }

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
        status: data?.status || 'online',
        afk: !!data?.afk,
      },
    });
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
