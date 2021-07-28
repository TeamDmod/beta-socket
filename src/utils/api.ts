/**
 * ©copyright 2021 dmod
 */

import fetch from 'node-fetch';

class API {
  readonly API_ENDPOINT = 'https://discord.com/api/v9';
  readonly authHead = { headers: { authentication: `Bot ${this.token}` } };
  constructor(private token: string) {}

  async getGateway(): Promise<string> {
    const res = await fetch(`${this.API_ENDPOINT}/gateway`);
    const json = await res.json();
    // TODO: update to gatway v9
    // updaing permissions; https://discord.com/developers/docs/topics/permissions
    return json.url + '?v=6&encoding=json';
  }
}

export default API;
