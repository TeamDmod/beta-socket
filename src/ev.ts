/**
 * ©copyright 2021 dmod
 */
export interface clientEvents {
  AUTH: [];
  GUILD_PRIVILEGE_UPDATE: [
    guild_id: string,
    data: {
      id: string;
      tag: string;
      permissions: bigint;
    }
  ];
  GUILD_ROLE_PERMISSIONS: [
    guild_id: string,
    data: {
      id: string,
      permissions: string
    }
  ]
}
