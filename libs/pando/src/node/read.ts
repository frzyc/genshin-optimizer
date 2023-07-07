import type { Tag, TagMapEntry } from '../tag'
import type { Read } from './type'

type Accu = Read['ex'] | 'unique'

export class TypedRead<T extends Tag, Subclass> implements Read {
  op = 'read' as const
  x = []
  br = []
  tag: T
  ex: Read['ex']

  constructor(tag: T, accu: Accu) {
    this.tag = tag
    this.ex = accu === 'unique' ? undefined : accu
  }

  // Subclass interfaces

  /** Callback for when a tag `<cat>:<val>` is generated */
  register<C extends keyof T>(_cat: C, _val: T[C]) {}
  /** A constructor that creates an instance of `Subclass` */
  ctor(_tag: T, _accu: Accu): Subclass {
    throw new Error('Must be implemented by subclass')
  }

  with<C extends keyof T>(cat: C, val: T[C]): Subclass {
    this.register(cat, val)
    return this.ctor({ ...this.tag, [cat]: val }, this.accu)
  }
  withTag(tag: T): Subclass {
    for (const [c, v] of Object.entries(tag)) this.register(c, v as T[typeof c])
    return this.ctor({ ...this.tag, ...tag }, this.accu)
  }
  withAll<C extends keyof T, V>(
    cat: C,
    transform: (r: Subclass, k: T[C] & string) => V
  ): Record<T[C] & string, V> {
    return new Proxy(this, {
      get(t, p: T[C] & string) {
        return transform(t.with(cat, p), p)
      },
    }) as any
  }
  toEntry<V>(value: V): TagMapEntry<V, T> {
    return {
      tag: this.tag,
      value,
    }
  }

  // Accumulator
  get accu(): Accu {
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
    return this.ctor(this.tag, 'unique')
  }
}
