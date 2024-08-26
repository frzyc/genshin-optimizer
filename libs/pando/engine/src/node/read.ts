import type { Tag, TagMapEntry } from '../tag'
import type { Read } from './type'

export class TypedRead<T extends Tag> implements Read {
  op = 'read' as const
  x: never[] = []
  br: never[] = []
  tag: T
  ex: Read['ex']

  constructor(tag: T, ex: Read['ex']) {
    this.tag = tag
    this.ex = ex
  }

  // Subclass interfaces

  /** Callback for when a tag `<cat>:<val>` is generated */
  register<C extends keyof T>(_cat: C, _val: T[C]) {}
  /** Return an instance with given `tag` and `ex` */
  ctor(tag: T, ex: Read['ex']): this {
    return new (this.constructor as any)(tag, ex)
  }

  with<C extends keyof T>(cat: C, val: T[C]): this {
    this.register(cat, val)
    return this.ctor({ ...this.tag, [cat]: val }, this.ex)
  }
  withTag(tag: T): this {
    for (const [c, v] of Object.entries(tag)) this.register(c, v as T[typeof c])
    return this.ctor({ ...this.tag, ...tag }, this.ex)
  }
  withAll<C extends keyof T>(
    cat: C,
    keys: (T[C] & string)[]
  ): Record<T[C] & string, this>
  withAll<C extends keyof T, V>(
    cat: C,
    keys: (T[C] & string)[],
    transform: (r: this, k: T[C] & string) => V
  ): Record<T[C] & string, V>
  withAll<C extends keyof T, V, Base>(
    cat: C,
    keys: (T[C] & string)[],
    transform: (r: this, k: T[C] & string) => V,
    base: Base
  ): { [k in (T[C] & string) | keyof Base]: k extends keyof Base ? Base[k] : V }
  withAll<C extends keyof T, V>(
    cat: C,
    keys: (T[C] & string)[],
    transform: (r: this, k: T[C] & string) => V | this = (x) => x,
    base: object = {}
  ): Record<T[C] & string, V | this> {
    return new Proxy(base as Record<T[C] & string, V | this>, {
      ownKeys: (_) => keys,
      get: (old, p: T[C] & string) =>
        old[p] ?? (old[p] = transform(this.with(cat, p), p)),
      getOwnPropertyDescriptor: (old, p: T[C] & string) => ({
        enumerable: true,
        configurable: true,
        get: () => old[p] ?? (old[p] = transform(this.with(cat, p), p)),
      }),
    })
  }
  toEntry<V>(value: V): TagMapEntry<V, T> {
    return { tag: this.tag, value }
  }

  // Accumulator
  get accu() {
    return this.ex ?? 'unique'
  }
  get prod() {
    return this.ctor(this.tag, 'prod')
  }
  get sum() {
    return this.ctor(this.tag, 'sum')
  }
  get max() {
    return this.ctor(this.tag, 'max')
  }
  get min() {
    return this.ctor(this.tag, 'min')
  }
  get unique() {
    return this.ctor(this.tag, undefined)
  }
}
