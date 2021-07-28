/**
 * ©copyright 2021 dmod
 */

enum EntryType {
  /** wating for an entery */
  NONE = 0,
  /** Low level connection user; still connect user without login or token put, provide minimal data */
  LOW = 1,
  /** Fully connected user; with login and token passed */
  FULL = 2,
}

export default class CredentialsManager {
  /** The entery level user is at*/
  #entryType = EntryType.NONE;
  /** Whethor the connection auth was successfal */
  #auth = false;
  /**
   * The guild this connection is geting events from
   * if any yet, one guild connection per connection
   */
  #guild_id: null | string = null;
  /** The guild connected to right now's auth hash token */
  #guild_auth: null | string = null;

  get auth() {
    return this.#auth;
  }

  set auth(stat: boolean) {
    if (typeof stat !== 'boolean') return;
    this.#auth = stat;
  }

  /** The entery level user is at*/
  get type() {
    return this.#entryType;
  }
  /** The entery level user is at*/
  set type(type: EntryType) {
    this.#entryType = type;
  }
}
