import type {
  AnyNode,
  Tag as BaseTag,
  NumNode,
  ReRead,
  StrNode,
  TagMapEntries,
  TagMapEntry,
  TagOverride,
  TagValRead,
} from '@genshin-optimizer/pando/engine'
import {
  TypedRead,
  tag as baseTag,
  tagVal as baseTagVal,
  constant,
  reread,
} from '@genshin-optimizer/pando/engine'
import type { IBaseConditionalData } from './IConditionalData'
import type { EntryType, Preset } from './listing'

export interface Tag<
  Sheet extends string = string,
  Src extends string | null = string | null,
  Dst extends string | null = string | null,
> extends BaseTag {
  preset?: Preset
  src?: Src | null
  dst?: Dst | null
  et?: EntryType
  sheet?: Sheet
  name?: string | null
  qt?: string | null
  q?: string | null
  [condMeta: symbol]: IBaseConditionalData | undefined
}
export type Member<T extends Tag> = NonNullable<T['member']>
export type Sheet<T extends Tag> = NonNullable<T['sheet']>
export type Src<T extends Tag> = NonNullable<T['src']>
export type Dst<T extends Tag> = NonNullable<T['dst']>

export type TagMapNodeEntry<Tag_ extends Tag> = TagMapEntry<
  AnyNode | ReRead,
  Tag_
>
export type TagMapNodeEntries<Tag_ extends Tag> = TagMapEntries<
  AnyNode | ReRead,
  Tag_
>

export class Read<Tag_ extends Tag = Tag> extends TypedRead<Tag_> {
  override register<C extends keyof Tag_ & string>(cat: C, val: Tag_[C]): void {
    if (val == null) return // null | undefined
    if (cat === 'name') usedNames.add(val)
    else if (cat === 'q') usedQ.add(val)
  }

  name(name: string): this {
    return super.with('name', name)
  }
  sheet(sheet: Sheet<Tag_>): this {
    return super.with('sheet', sheet)
  }

  add(value: number | string | AnyNode): TagMapNodeEntry<Tag_> {
    return super.toEntry(typeof value === 'object' ? value : constant(value))
  }
  addOnce(
    sheet: Sheet<Tag_>,
    value: number | NumNode
  ): TagMapNodeEntries<Tag_> {
    if (this.tag.et !== 'teamBuff' || !sheet)
      throw new Error('Unsupported non-stacking entry')
    const q = `${uniqueId(sheet)}`
    // Use raw tags here instead of `own.*` to avoid cyclic dependency
    // Entries in TeamData need `member:` for priority
    return [
      // 1) ownBuff.stackIn.<q>.add(value)
      // Technically this type assertion is a little unsafe, but we should expect that callers
      // will not be overwriting the types for et, sheet, qt nor q
      this.withTag({ et: 'own', sheet, qt: 'stackIn', q } as Tag_).add(value),
      // 2) In TeamData: ownBuff.stackTmp.<q>.add(cmpNE(own.stackIn.<q>, 0, /* priority */))
      // 3) In TeamData: ownBuff.stackOut.<q>.add(cmpEq(team.stackTmp.<q>.max, /* priority */, own.stackIn))
      // 4) teamBuff.<stat>.add(own.stackOut.<q>)
      this.add(reader.withTag({ et: 'own', sheet, qt: 'stackOut', q })), // How should we get this reader? it should be a specific game's Read
    ]
  }
  reread(r: this): TagMapNodeEntry<Tag_> {
    return super.toEntry(reread(r.tag))
  }
}

const counters: Record<string, number> = {}
function uniqueId(namespace: string): number {
  if (!counters[namespace]) counters[namespace] = 0
  const result = counters[namespace]!
  counters[namespace] += 1
  return result
}

export let reader = new Read({}, undefined)
export function setReader<Tag_ extends Tag>(reader_: Read<Tag_>) {
  reader = reader_
}
export const usedNames = new Set<string>()
export const usedQ = new Set('_')

export function tag<Tag_ extends Tag>(
  v: number | NumNode,
  tag: Tag_
): TagOverride<NumNode>
export function tag<Tag_ extends Tag>(
  v: string | StrNode,
  tag: Tag_
): TagOverride<StrNode>
export function tag<Tag_ extends Tag>(
  v: number | string | AnyNode,
  tag: Tag_
): TagOverride<AnyNode>
export function tag<Tag_ extends Tag>(
  v: number | string | AnyNode,
  tag: Tag_
): TagOverride<AnyNode> {
  return typeof v === 'object' && v.op === 'tag'
    ? baseTag(v.x[0], { ...v.tag, ...tag }) // Fold nested tag nodes
    : baseTag(v, tag)
}
export function tagVal<Tag_ extends Tag>(cat: string & keyof Tag_): TagValRead {
  return baseTagVal(cat)
}
