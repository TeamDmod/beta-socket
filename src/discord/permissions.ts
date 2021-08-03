/**
 * ©copyright 2021 dmod
 */

import Guild from './guild';
import GuildMember from './member';

/**
 * Discord Member permissions manager
 */
export default class Permissions {
  member: GuildMember;
  guild: Guild;
  constructor(guild: Guild, member: GuildMember) {
    this.member = member;
    this.guild = guild;
  }

  toJson(): typeof discord_permission_flags {
    const obj: any = {};
    for (const key of Object.keys(discord_permission_flags)) {
      //@ts-expect-error
      obj[key] = (((discord_permission_flags[key] as unknown) as number) & this.permissions) === discord_permission_flags[key];
    }
    return obj;
  }

  /**
   * https://discord.com/developers/docs/topics/permissions
   */
  get permissions(): bigint {
    if (this.guild.ownerID === this.member.id) return ALL;

    const role_everyone = this.guild.roles.find(role => role.name === '@everyone');
    let permissions = BigInt(role_everyone!.permissions);

    const getRole = (id: string) => this.guild.roles.find(role => role.id === id);

    for (const id of this.member.roles.keys()) {
      const role = getRole(id);
      permissions |= BigInt(role!.permissions);
    }

    if ((permissions & discord_permission_flags.ADMINISTRATOR) === discord_permission_flags.ADMINISTRATOR) return ALL;

    return permissions;
  }
}

/**
 * https://discord.com/developers/docs/topics/permissions
 */
export const discord_permission_flags = {
  CREATE_INSTANT_INVITE: 1n << 0n,
  KICK_MEMBERS: 1n << 1n,
  BAN_MEMBERS: 1n << 2n,
  ADMINISTRATOR: 1n << 3n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_GUILD: 1n << 5n,
  ADD_REACTIONS: 1n << 6n,
  VIEW_AUDIT_LOG: 1n << 7n,
  PRIORITY_SPEAKER: 1n << 8n,
  STREAM: 1n << 9n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  SEND_TTS_MESSAGES: 1n << 12n,
  MANAGE_MESSAGES: 1n << 13n,
  EMBED_LINKS: 1n << 14n,
  ATTACH_FILES: 1n << 15n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  MENTION_EVERYONE: 1n << 17n,
  USE_EXTERNAL_EMOJIS: 1n << 18n,
  VIEW_GUILD_INSIGHTS: 1n << 19n,
  CONNECT: 1n << 20n,
  SPEAK: 1n << 21n,
  MUTE_MEMBERS: 1n << 22n,
  DEAFEN_MEMBERS: 1n << 23n,
  MOVE_MEMBERS: 1n << 24n,
  USE_VAD: 1n << 25n,
  CHANGE_NICKNAME: 1n << 26n,
  MANAGE_NICKNAMES: 1n << 27n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_WEBHOOKS: 1n << 29n,
  MANAGE_EMOJIS_AND_STICKERS: 1n << 30n,
  USE_SLASH_COMMANDS: 1n << 31n,
  REQUEST_TO_SPEAK: 1n << 32n,
  MANAGE_THREADS: 1n << 34n,
  USE_PUBLIC_THREADS: 1n << 35n,
  USE_PRIVATE_THREADS: 1n << 36n,
  USE_EXTERNAL_STICKERS: 1n << 37n,
};

export const ALL = Object.values(discord_permission_flags).reduce((all, p) => all | p, 0n);
