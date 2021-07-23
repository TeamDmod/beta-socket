/**
 * ©copyright 2021 dmod
 */

import webscoket from 'ws';

export default class discordSocket {
  _socket: webscoket.Server | null = null;
  ready = true; // NOTE: true for now must be false by defualt tho
}
