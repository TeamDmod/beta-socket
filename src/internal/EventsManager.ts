/**
 * ©copyright 2021 dmod
 */

import { EventEmitter } from 'events';
import discordSocket from '../discord/connector';
import { clientEvents } from '../ev';

type ERE = { data: any; event: keyof clientEvents };

export default class EventsManager extends EventEmitter {
  discord!: discordSocket;
  constructor(discord: discordSocket) {
    super();
    Object.defineProperty(this, 'discord', { value: discord });
  }
  #events: { eventName: string; fn: Function }[] = [];

  register<K extends keyof clientEvents>(event: K, fn: (...args0: clientEvents[K]) => ERE) {
    if (this.#events.find(e => e.eventName === event)) return;

    const fuc = (...args0: any[]) => {
      const data = fn(...(args0 as any));

      this.emit(args0[0] as string, data);
    };

    this.#events.push({
      eventName: event,
      fn: fuc,
    });

    this.discord.on(event, fuc);
  }

  clear() {
    for (const event of this.#events) {
      this.removeListener(event.eventName, event.fn as (...args: any[]) => void);
    }
  }
}
