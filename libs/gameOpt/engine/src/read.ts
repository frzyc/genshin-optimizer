import type { IBaseConditionalData } from '@genshin-optimizer/gameOpt/formula'
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
import type { EntryType, Preset } from './listing'

export interface Tag<
  Src extends string | null | null,
  Dst extends string | null | null,
  Sheet extends string
> extends BaseTag {
  preset?: Preset
  src?: Src
  dst?: Dst
  et?: EntryType
  sheet?: Sheet
  name?: string | null
  qt?: string | null
  q?: string | null
  [condMeta: symbol]: IBaseConditionalData | undefined
}

export type TagMapNodeEntry<
  Tag_ extends Tag<Src, Dst, Sheet>,
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
> = TagMapEntry<AnyNode | ReRead, Tag_>
export type TagMapNodeEntries<
  Tag_ extends Tag<Src, Dst, Sheet>,
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
> = TagMapEntries<AnyNode | ReRead, Tag_>

export class Read<
  Tag_ extends Tag<Src, Dst, Sheet>,
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
> extends TypedRead<Tag_> {
  override register<C extends keyof Tag_ & string>(cat: C, val: Tag_[C]): void {
    if (val == null) return // null | undefined
    if (cat === 'name') usedNames.add(val)
    else if (cat === 'q') usedQ.add(val)
  }

  name(name: string): this {
    return super.with('name', name)
  }
  sheet(sheet: Sheet): this {
    return super.with('sheet', sheet)
  }

  add(
    value: number | string | AnyNode
  ): TagMapNodeEntry<Tag_, Src, Dst, Sheet> {
    return super.toEntry(typeof value === 'object' ? value : constant(value))
  }
  addOnce(
    sheet: Sheet,
    value: number | NumNode
  ): TagMapNodeEntries<Tag_, Src, Dst, Sheet> {
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
  reread(r: this): TagMapNodeEntry<Tag_, Src, Dst, Sheet> {
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
export function setReader<
  Tag_ extends Tag<Src, Dst, Sheet>,
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(reader_: Read<Tag_, Src, Dst, Sheet>) {
  reader = reader_
}
export const usedNames = new Set<string>()
export const usedQ = new Set('_')

export function tag<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(v: number | NumNode, tag: Tag<Src, Dst, Sheet>): TagOverride<NumNode>
export function tag<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(v: string | StrNode, tag: Tag<Src, Dst, Sheet>): TagOverride<StrNode>
export function tag<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(v: number | string | AnyNode, tag: Tag<Src, Dst, Sheet>): TagOverride<AnyNode>
export function tag<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(
  v: number | string | AnyNode,
  tag: Tag<Src, Dst, Sheet>
): TagOverride<AnyNode> {
  return typeof v == 'object' && v.op == 'tag'
    ? baseTag(v.x[0], { ...v.tag, ...tag }) // Fold nested tag nodes
    : baseTag(v, tag)
}
export function tagVal<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(cat: keyof Tag<Src, Dst, Sheet>): TagValRead {
  return baseTagVal(cat as string) // idk why it thinks `cat` is number here
}
