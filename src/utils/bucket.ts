/**
 * ©copyright 2021 dmod
 */

export default class Bucket {
  limitCounter = 0;
  burstCounter = 0;
  maxSize: number;
  waitTime: number;
  burstTime: number;
  burst: number;

  constructor(maxSize: number, waitTime: number, burst: number, burstTime: number) {
    this.maxSize = maxSize;
    this.waitTime = waitTime;
    this.burst = burst;
    this.burstTime = burstTime;
  }

  // https://www.freecodecamp.org/news/how-to-secure-your-websocket-connections-d0be0996c556/
  add(): boolean {
    if (this.limitCounter >= this.maxSize) {
      if (this.burstCounter >= this.burst) {
        return true;
      }
      ++this.burstCounter;
      setTimeout(() => {
        // this.verify(callingMethod, ...args);
        setTimeout(() => --this.burstCounter, this.burstTime);
      }, this.waitTime);
      return false;
    }
    this.limitCounter++;
    return false;
  }
}
