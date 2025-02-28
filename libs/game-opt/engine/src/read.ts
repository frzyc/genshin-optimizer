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
  Sheet extends string,
  Src extends string | null,
  Dst extends string | null
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

export type AnyTag<Sheet extends string = string> = Tag<
  Sheet,
  string | null,
  string | null
>
export type Member<T extends AnyTag> = NonNullable<T['sheet']>
export type Sheet<T extends AnyTag> = NonNullable<T['sheet']>
export type Src<T extends AnyTag> = NonNullable<T['src']>
export type Dst<T extends AnyTag> = NonNullable<T['dst']>

export type TagMapNodeEntry<Tag extends BaseTag> = TagMapEntry<
  AnyNode | ReRead,
  Tag
>
export type TagMapNodeEntries<Tag extends BaseTag> = TagMapEntries<
  AnyNode | ReRead,
  Tag
>

export class Read<Tag extends AnyTag = AnyTag> extends TypedRead<Tag> {
  override register<C extends keyof Tag & string>(cat: C, val: Tag[C]): void {
    if (val == null) return // null | undefined
    if (cat === 'name') usedNames.add(val)
    else if (cat === 'q') usedQ.add(val)
  }

  name(name: string): this {
    return super.with('name', name)
  }
  sheet(sheet: Sheet<Tag>): this {
    return super.with('sheet', sheet)
  }

  add(value: number | string | AnyNode): TagMapNodeEntry<Tag> {
    return super.toEntry(typeof value === 'object' ? value : constant(value))
  }
  addOnce(sheet: Sheet<Tag>, value: number | NumNode): TagMapNodeEntries<Tag> {
    if (this.tag.et !== 'teamBuff' || !sheet)
      throw new Error('Unsupported non-stacking entry')
    const q = `${uniqueId(sheet)}`
    // Use raw tags here instead of `own.*` to avoid cyclic dependency
    // Entries in TeamData need `member:` for priority
    return [
      // 1) ownBuff.stackIn.<q>.add(value)
      // Technically this type assertion is a little unsafe, but we should expect that callers
      // will not be overwriting the types for et, sheet, qt nor q
      this.withTag({ et: 'own', sheet, qt: 'stackIn', q } as Tag).add(value),
      // 2) In TeamData: ownBuff.stackTmp.<q>.add(cmpNE(own.stackIn.<q>, 0, /* priority */))
      // 3) In TeamData: ownBuff.stackOut.<q>.add(cmpEq(team.stackTmp.<q>.max, /* priority */, own.stackIn))
      // 4) teamBuff.<stat>.add(own.stackOut.<q>)
      this.add(reader.withTag({ et: 'own', sheet, qt: 'stackOut', q })), // How should we get this reader? it should be a specific game's Read
    ]
  }
  reread(r: this): TagMapNodeEntry<Tag> {
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
export function setReader<Tag extends AnyTag>(reader_: Read<Tag>) {
  reader = reader_
}
export const usedNames = new Set<string>()
export const usedQ = new Set('_')

export function tag<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(v: number | NumNode, tag: Tag<Sheet, Src, Dst>): TagOverride<NumNode>
export function tag<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(v: string | StrNode, tag: Tag<Sheet, Src, Dst>): TagOverride<StrNode>
export function tag<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(v: number | string | AnyNode, tag: Tag<Sheet, Src, Dst>): TagOverride<AnyNode>
export function tag<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(
  v: number | string | AnyNode,
  tag: Tag<Sheet, Src, Dst>
): TagOverride<AnyNode> {
  return typeof v == 'object' && v.op == 'tag'
    ? baseTag(v.x[0], { ...v.tag, ...tag }) // Fold nested tag nodes
    : baseTag(v, tag)
}
export function tagVal<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string
>(cat: keyof Tag<Sheet, Src, Dst>): TagValRead {
  return baseTagVal(cat as string) // idk why it thinks `cat` is number here
}
