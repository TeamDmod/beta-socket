/**
 * ©copyright 2021 dmod
 */

import { discordRole, discordUser } from '../typings';
import Collection from '../utils/collection';
import discordSocket from './connector';
import Guild from './guild';
import Permissions from './permissions';

export default class GuildMember {
  connector!: discordSocket;
  id!: string;
  user!: discordUser;
  roles!: Collection<string, discordRole>;
  premiumSince!: string;
  pending!: boolean;
  nickname!: string | null;
  mute!: boolean;
  joinedAt!: string;
  isPending!: boolean;
  hoistedRole!: string;
  deaf!: boolean;
  avatar!: string | null;
  guild: Guild;
  _permissions: Permissions;

  constructor(connector: discordSocket, data: any, guild: Guild) {
    Object.defineProperty(this, 'connector', { value: connector });
    this.guild = guild;
    this.roles = new Collection();
    this._permissions = new Permissions(this.guild, this);
    this._patch(data);
  }

  _patch(data: any) {
    this.id = data.user.id;
    this.user = data.user;
    if ('roles' in data) {
      for (const id of data.roles) {
        const role = this.guild.roles.get(id);
        role && this.roles.set(id, role);
      }
    }
    this.premiumSince = data.premium_since;
    this.pending = data.pending;
    this.nickname = data.nick;
    this.mute = data.mute;
    this.joinedAt = data.joined_at;
    this.isPending = data.is_pending;
    this.hoistedRole = data.hoisted_role;
    this.deaf = data.deaf;
    this.avatar = data.avatar;
  }

  get permissions() {
    return this._permissions.permissions;
  }

  get permissionsJson() {
    return this._permissions.toJson();
  }

  toUserGateway() {
    return {
      id: this.id,
      tag: `${this.user.username}#${this.user.discriminator}`,
      permissions: this.permissions.toString(),
    };
  }
}
