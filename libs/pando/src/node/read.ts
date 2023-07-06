import { TagMapEntry } from '../tag'
import type { Tag } from '../tag/type'
import type { Read } from './type'

type Accu = Read['ex']
type UsedTags<T extends Tag> = { [k in keyof T]?: Set<NonNullable<T[k]>> }

export class TypedRead<T extends Tag, Subclass> implements Read {
  op = 'read' as const
  x = []
  br = []
  tag: T
  ex: Accu

  // Excluded from `JSON.stringify`
  ctor: (tag: T, accu: Accu, tracker: UsedTags<T>) => Subclass
  tracker!: UsedTags<T>

  constructor(
    ctor: (tag: T, accu: Accu, tracker: UsedTags<T>) => Subclass,
    tag: T,
    accu: Accu,
    tracker: UsedTags<T>
  ) {
    this.tag = tag
    this.ex = accu

    // Excluded from `JSON.stringify`
    this.ctor = ctor
    Object.defineProperty(this, 'tracker', {
      get() {
        return tracker
      },
    })
  }

  get accu(): Read['ex'] {
    return this.ex
  }

  with<C extends keyof T>(cat: C, val: T[C], accu?: Accu): Subclass {
    this.register(cat, val)
    return this.ctor(
      { ...this.tag, [cat]: val },
      accu ?? this.accu,
      this.tracker
    )
  }
  withTag(tag: T, accu?: Accu): Subclass {
    for (const [c, v] of Object.entries(tag)) this.register(c, v as T[typeof c])
    return this.ctor({ ...this.tag, ...tag }, accu ?? this.accu, this.tracker)
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

  register<C extends keyof T>(cat: C, val: T[C]) {
    if (val !== null && val !== undefined) this.tracker![cat]?.add(val)
  }
  usedTags<C extends keyof T>(cat: C) {
    return this.tracker[cat] ?? new Set()
  }
  toEntry<V>(value: V): TagMapEntry<V, T> {
    return {
      tag: this.tag,
      value,
    }
  }

  // Accumulator
  get prod() {
    return this.ctor(this.tag, 'prod', this.tracker)
  }
  get sum() {
    return this.ctor(this.tag, 'sum', this.tracker)
  }
  get max() {
    return this.ctor(this.tag, 'max', this.tracker)
  }
  get min() {
    return this.ctor(this.tag, 'min', this.tracker)
  }
  get noAccu() {
    return this.ctor(this.tag, undefined, this.tracker)
  }
}
