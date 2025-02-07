export type Tag = Record<string | symbol, number | string | boolean>

class Query {
  parent: Query
  tag: Tag

  constructor(parent: Query, tag: Tag = {}) {
    this.parent = parent
    this.tag = tag
  }

  all_used(): (keyof Tag)[] {
    return Object.keys(this.tag)
  }
  used(key: string | symbol): boolean {
    return key in this.tag
  }

  get(key: string | symbol): number | string | boolean {
    // Note, this will fail if the root query doesn't contain `key`.
    // Make sure to add the default value at the root for every key
    if (!(key in this.tag)) this.tag[key] = this.parent.get(key)
    return this.tag[key]
  }
  set(key: string | symbol, val: number | string | boolean) {
    if (key in this.tag) throw Error('Cannot override existing values')
    this.tag[key] = val
  }

  child(tag?: Tag): Query {
    return new Query(this, tag)
  }
}

export function rootQuery(): Query {
  return new Query(undefined as any) // secret root query initializer
}
export type { Query }
