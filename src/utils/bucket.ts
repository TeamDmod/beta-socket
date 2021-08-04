/**
 * ©copyright 2021 dmod
 */

import EventEmitter from 'events';

export default class Bucket extends EventEmitter {
  limitCounter = 0;
  burstCounter = 0;
  maxSize: number;
  waitTime: number;
  burstTime: number;
  burst: number;

  public on!: (event: 'limitHit', listener: () => void) => this;
  constructor(maxSize: number, waitTime: number, burst: number, burstTime: number) {
    super();

    this.maxSize = maxSize;
    this.waitTime = waitTime;
    this.burst = burst;
    this.burstTime = burstTime;
  }

  // https://www.freecodecamp.org/news/how-to-secure-your-websocket-connections-d0be0996c556/
  add() {
    if (this.limitCounter >= this.maxSize) {
      if (this.burstCounter >= this.burst) {
        this.emit('limitHit');
        return;
      }
      ++this.burstCounter;
      setTimeout(() => {
        // this.verify(callingMethod, ...args);
        setTimeout(() => --this.burstCounter, this.burstTime);
      }, this.waitTime);
      return;
    }
    this.limitCounter++;
  }
}
