/**
 * ©copyright 2021 dmod
 */

export interface DiscordPayload {
  op: number;
  d?: any;
  s?: number;
  t?: EventTypes;
}

export interface discordUser {
  username: string;
  public_flags: number;
  id: string;
  discriminator: string;
  avatar: string | null;
}

export interface discordRole {
  id: string;
  position: number;
  name: string;
  managed: boolean;
  mentionable: boolean;
  permissions: number;
  permissions_new: string;
  hoist: boolean;
  color: number;
  tags?: {
    bot_id?: string;
    premium_subscriber?: number | null;
  };
}

export type EventTypes =
  | 'READY'
  | 'RESUMED'
  | 'APPLICATION_COMMAND_CREATE'
  | 'APPLICATION_COMMAND_UPDATE'
  | 'APPLICATION_COMMAND_DELETE'
  | 'THREAD_CREATE'
  | 'THREAD_UPDATE'
  | 'THREAD_DELETE'
  | 'THREAD_LIST_SYNC'
  | 'THREAD_MEMBER_UPDATE'
  | 'THREAD_MEMBERS_UPDATE'
  | 'GUILD_CREATE'
  | 'GUILD_DELETE'
  | 'GUILD_UPDATE'
  | 'INVITE_CREATE'
  | 'INVITE_DELETE'
  | 'GUILD_MEMBER_ADD'
  | 'GUILD_MEMBER_REMOVE'
  | 'GUILD_MEMBER_UPDATE'
  | 'GUILD_MEMBERS_CHUNK'
  | 'GUILD_ROLE_CREATE'
  | 'GUILD_ROLE_DELETE'
  | 'GUILD_ROLE_UPDATE'
  | 'GUILD_BAN_ADD'
  | 'GUILD_BAN_REMOVE'
  | 'GUILD_EMOJIS_UPDATE'
  | 'GUILD_INTEGRATIONS_UPDATE'
  | 'INTAGRATION_CREATE'
  | 'INTAGRATION_DELETE'
  | 'INTAGRATION_UPDATE'
  | 'INTERACTION_CREATE'
  | 'STAGE_INSTANCE_CREATE'
  | 'STAGE_INSTANCE_DELETE'
  | 'CHANNEL_CREATE'
  | 'CHANNEL_DELETE'
  | 'CHANNEL_UPDATE'
  | 'CHANNEL_PINS_UPDATE'
  | 'MESSAGE_CREATE'
  | 'MESSAGE_DELETE'
  | 'MESSAGE_UPDATE'
  | 'MESSAGE_DELETE_BULK'
  | 'MESSAGE_REACTION_ADD'
  | 'MESSAGE_REACTION_REMOVE'
  | 'MESSAGE_REACTION_REMOVE_ALL'
  | 'MESSAGE_REACTION_REMOVE_EMOJI'
  | 'USER_UPDATE'
  | 'PRESENCE_UPDATE'
  | 'TYPING_START'
  | 'VOICE_STATE_UPDATE'
  | 'VOICE_SERVER_UPDATE'
  | 'WEBHOOKS_UPDATE'
  | 'GUILD_APPLICATION_COMMAND_COUNTS_UPDATE'
  | 'APPLICATION_COMMAND_PERMISSIONS_UPDATE';
