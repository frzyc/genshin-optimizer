import { damageType } from '@genshin-optimizer/sr-consts'
import { Source, entryTypes, members, moves, srcs } from './listing'
import {
  AnyNode,
  Read as BaseRead,
  NumNode,
  ReRead,
  StrNode,
  TagOverride,
  constant,
  reread,
  tag as baseTag,
  tagVal as baseTagVal,
  TagValRead,
} from '@genshin-optimizer/pando'

export const fixedTags = {
  member: members,
  dst: members,
  et: entryTypes,
  src: srcs,

  dt: damageType,
  move: moves,
}
export type Tag = {
  [key in keyof typeof fixedTags]?: (typeof fixedTags)[key][number] | null
} & { name?: string | null; qt?: string | null; q?: string | null }

type AllTag = {
  [key in keyof Tag]-?: Exclude<Tag[key], null>
}

export class Read implements BaseRead {
  op = 'read' as const
  x = []
  br = []
  tag: Tag
  ex: BaseRead['ex']

  constructor(tag: Tag, accu: Read['accu']) {
    this.tag = tag
    this.ex = accu
  }

  get accu(): BaseRead['ex'] {
    return this.ex
  }
  name(name: string): Read {
    return usedNames.add(name), this.with('name', name)
  }
  with<C extends keyof Tag>(cat: C, val: AllTag[C], accu?: Read['accu']): Read {
    return new Read({ ...this.tag, [cat]: val }, accu ?? this.accu)
  }
  withTag(tag: Omit<Tag, 'name' | 'q'>, accu?: Read['accu']): Read {
    return new Read({ ...this.tag, ...tag }, accu ?? this.accu)
  }
  _withAll<C extends keyof Tag, T>(
    cat: C,
    transform: (r: Read, k: AllTag[C]) => T
  ): Record<AllTag[C], T> {
    return new Proxy(this, {
      get(t, p: AllTag[C]) {
        return transform(t.with(cat, p), p)
      },
    }) as any
  }
  add(value: number | string | AnyNode): { tag: Tag; value: AnyNode } {
    return {
      tag: this.tag,
      value: typeof value === 'object' ? value : constant(value),
    }
  }
  reread(r: Read): { tag: Tag; value: ReRead } {
    return { tag: this.tag, value: reread(r.tag) }
  }

  src(src: Source): Read {
    return this.with('src', src)
  }

  // Accumulator
  get prod() {
    return new Read(this.tag, 'prod')
  }
  get sum() {
    return new Read(this.tag, 'sum')
  }
  get max() {
    return new Read(this.tag, 'max')
  }
  get min() {
    return new Read(this.tag, 'min')
  }

  // Optional Modifiers

  // Damage Type
  get physical() {
    return this.with('dt', 'Physical')
  }
  get quantum(): Read {
    return this.with('dt', 'Quantum')
  }
  get thunder(): Read {
    return this.with('dt', 'Thunder')
  }
  get ice(): Read {
    return this.with('dt', 'Ice')
  }
  get wind(): Read {
    return this.with('dt', 'Wind')
  }
  get fire(): Read {
    return this.with('dt', 'Fire')
  }
  get imaginary(): Read {
    return this.with('dt', 'Imaginary')
  }

  // Move
  get basicDmg(): Read {
    return this.with('move', 'basic')
  }
  get skillDmg(): Read {
    return this.with('move', 'skill')
  }
  get ultDmg(): Read {
    return this.with('move', 'ult')
  }
}
export function tag(v: number | NumNode, tag: Tag): TagOverride<NumNode>
export function tag(v: string | StrNode, tag: Tag): TagOverride<StrNode>
export function tag(
  v: number | string | AnyNode,
  tag: Tag
): TagOverride<AnyNode>
export function tag(
  v: number | string | AnyNode,
  tag: Tag
): TagOverride<AnyNode> {
  return baseTag(v, tag)
}
export function tagVal(cat: keyof Tag): TagValRead {
  return baseTagVal(cat)
}

export const reader = new Read({}, undefined)
export const usedNames = new Set<string>()
