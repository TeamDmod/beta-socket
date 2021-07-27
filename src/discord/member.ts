/**
 * ©copyright 2021 dmod
 */

import discordSocket from './connector';

export default class GuildMember {
  connector!: discordSocket;
  id!: string;
  user: unknown;
  roles!: string[];
  premiumSince!: string;
  pending!: boolean;
  nickname!: string | null;
  mute!: boolean;
  joinedAt!: string;
  isPending!: boolean;
  hoistedRole!: string;
  deaf!: boolean;
  avatar!: string | null;

  constructor(connector: discordSocket, data: any) {
    Object.defineProperty(this, 'connector', { value: connector });
    this._patch(data);
  }

  _patch(data: any) {
    this.id = data.user.id;
    this.user = data.user;
    this.roles = data.roles;
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
}
