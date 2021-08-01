export default class Collection<K, V> extends Map<K, V> {
  public find(fn: (value: V, key: K, collection: this) => boolean): V | undefined {
    for (const [key, item] of this) {
      if (fn(item, key, this)) return item;
    }
    return undefined;
  }

  public map<T>(fn: (value: V) => T): T[] {
    const arr = [];
    for (const item of this.values()) {
      arr.push(fn(item));
    }
    return arr;
  }

  public toArray(): V[] {
    const arr: V[] = [];
    for (const item of this.values()) {
      arr.push(item);
    }
    return arr;
  }
}
