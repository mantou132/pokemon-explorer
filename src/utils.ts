import { history, QueryString } from '@mantou/gem';
import { throttle } from 'duoyun-ui/lib/utils';

export const changeQuery = throttle(function changeQuery(key: string, value?: string | string[]) {
  const p = history.getParams();
  const query = new QueryString(p.query);
  if (!value) {
    query.delete(key);
  } else if (Array.isArray(value)) {
    query.setAny(key, value);
  } else {
    query.set(key, value);
  }
  history.replace({ ...p, query });
});

// 使用 HTMLElement 可以序列化 value
export class Linked<T> {
  #fragment = document.createDocumentFragment();
  #map = new Map<string, Text & { value?: T }>();

  #create(id: string, v?: T) {
    if (this.#map.has(id)) throw new Error(`Existed id: ${id}`);
    const node = new Text(id) as Text & { value?: T };
    node.value = v;
    this.#map.set(id, node);
    return node;
  }

  *[Symbol.iterator]() {
    let node = this.first();
    while (node) {
      yield node;
      node = node.nextSibling as (Text & { value?: T }) | null;
    }
  }

  append(id: string, v?: T) {
    this.#fragment.append(this.#create(id, v));
  }
  prepend(id: string, v?: T) {
    this.#fragment.prepend(this.#create(id, v));
  }
  first() {
    return this.#fragment.firstChild as (Text & { value?: T }) | null;
  }
  last() {
    return this.#fragment.lastChild as (Text & { value?: T }) | null;
  }
  previous(id: string) {
    return this.get(id)?.previousSibling as (Text & { value?: T }) | null;
  }
  next(id: string) {
    return this.get(id)?.nextSibling as (Text & { value?: T }) | null;
  }
  get(id: string) {
    return this.#map.get(id);
  }
  toString() {
    return [...this.#fragment.childNodes].map((e) => e.nodeValue).join('-');
  }
  // node.remove
  // node.after
  // node.before
}
