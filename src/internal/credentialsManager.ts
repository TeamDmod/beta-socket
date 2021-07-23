/**
 * ©copyright 2021 dmod
 */

export default class CredentialsManager {
  #auth = false;
  #guild_id: null | string = null;

  get auth() {
    return this.#auth;
  }

  set auth(stat: boolean) {
    if (typeof stat !== 'boolean') return;
    this.#auth = stat;
  }
}
