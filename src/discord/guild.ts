/**
 * ©copyright 2021 dmod
 */

import { discordRole } from '../typings';
import Collection from '../utils/collection';
import discordSocket from './connector';
import GuildMember from './member';

export default class Guild {
  connector!: discordSocket;
  id!: string;
  name!: string;
  ownerID!: string;
  description!: string | null;
  verificationLevel!: number;
  memberCount!: number;
  premiumTier!: number;
  mfaLevel!: number;
  vanityUrlCode!: string | null;
  region!: string;
  banner!: string | null;
  nsfw?: boolean;
  available!: boolean;
  roles: Collection<string, discordRole>;
  members: Collection<string, GuildMember>;

  constructor(connector: discordSocket, data: any) {
    Object.defineProperty(this, 'connector', { value: connector });

    this.members = new Collection();
    this.roles = new Collection();

    if (data.unavailable) {
      this.available = false;
    } else {
      this._patch(data);
      // if (!data.channels) this.available = false;
    }
  }

  _patch(data: any) {
    this.available = !data.unavailable;
    this.id = data.id;
    this.verificationLevel = data.verification_level;
    this.name = data.name;
    this.ownerID = data.owner_id;
    this.description = data.description;
    this.memberCount = data.member_count ?? this.memberCount;
    this.premiumTier = data.premium_tier;
    this.vanityUrlCode = data.vanity_url_code;
    this.banner = data.banner;
    this.mfaLevel = data.mfa_level;
    if ('nsfw' in data) this.nsfw = data.nsfw;
    this.region = data.region;
    if ('roles' in data) {
      for (const role of data.roles) this.roles.set(role.id, role);
    }

    if (data.members) {
      for (const member of data.members) this.members.set(member.user.id, new GuildMember(this.connector, member, this));

      if (this.members.size < this.memberCount) {
        const nonce = Date.now().toString() + Math.random().toString(36);

        this.connector.sendPayload({
          op: 8,
          d: {
            guild_id: this.id,
            query: '',
            nonce,
            limit: 0,
          },
        });
      }
    }
  }

  toGatewayGuild() {
    return {
      id: this.id,
      verification_level: this.verificationLevel,
      name: this.name,
      owner_id: this.ownerID,
      description: this.description,
      member_count: this.memberCount,
      premium_tier: this.premiumTier,
      vanity_url_code: this.vanityUrlCode,
      banner: this.banner,
      mfa_level: this.mfaLevel,
      nfsw: this.nsfw,
      roles: this.roles.toArray(),
    };
  }

  get vanityUrl(): string | null {
    if (!this.vanityUrlCode) return null;
    return `https://discord.com/invite/${this.vanityUrlCode}`;
  }
}
