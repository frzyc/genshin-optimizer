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
  tag as baseTag,
  tagVal as baseTagVal,
  cmpEq,
  cmpNE,
  constant,
  prod,
  reread,
  TypedRead,
} from '@genshin-optimizer/pando/engine'
import type { IBaseConditionalData } from './IConditionalData'
import type { Preset } from './listing'

export interface Tag<
  Sheet extends string = string,
  Src extends string | null = string | null,
  Dst extends string | null = string | null,
  Et extends string = string,
> extends BaseTag {
  preset?: Preset
  src?: Src | null
  dst?: Dst | null
  et?: Et
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

  /** Extra fields on stackIn / stackTmp / stackOut tags */
  stackChannelExtras(): Partial<Tag_> {
    return {}
  }

  add(value: number | string | AnyNode): TagMapNodeEntry<Tag_> {
    return super.toEntry(typeof value === 'object' ? value : constant(value))
  }
  addOnce(
    sheet: Sheet<Tag_>,
    value: number | NumNode,
    destMul?: number | NumNode
  ): TagMapNodeEntries<Tag_> {
    if (
      (this.tag.et !== 'teamBuff' &&
        this.tag.et !== 'notOwnBuff' &&
        this.tag.et !== 'enemy' &&
        this.tag.et !== 'enemyDeBuff') ||
      !sheet
    )
      throw new Error('Unsupported non-stacking entry')
    // Stable per (group, dest). Same WR nonStackBuff group + same dest share a
    // channel so TeamData `stackTmp.max` picks one member. Different dests
    // (Tenacity atk_ vs shield_, Hakushin per-ele) stay independent.
    const q = `${uniqueId(`${sheet}\0${destChannel(this.tag)}`)}`
    const stackOut = reader.withTag(stackReadTag(sheet, 'stackOut', q))
    const applied =
      destMul == null
        ? stackOut
        : prod(
            stackOut,
            typeof destMul === 'object' ? destMul : constant(destMul)
          )
    // Use raw tags here instead of `own.*` to avoid cyclic dependency
    // Entries in TeamData need `member:` for priority
    return [
      // 1) ownBuff.stackIn.<q>.add(value)
      // Technically this type assertion is a little unsafe, but we should expect that callers
      // will not be overwriting the types for et, sheet, qt nor q
      this.withTag(stackReadTag(sheet, 'stackIn', q)).add(value),
      // 2) In TeamData: ownBuff.stackTmp.<q>.add(cmpNE(own.stackIn.<q>, 0, /* priority */))
      // 3) In TeamData: ownBuff.stackOut.<q>.add(cmpEq(team.stackTmp.<q>.max, /* priority */, own.stackIn))
      // 4) teamBuff.<stat>.add(own.stackOut.<q> [* destMul])
      this.add(applied),
    ]
  }
  reread(r: this): TagMapNodeEntry<Tag_> {
    return super.toEntry(reread(r.tag))
  }
}

const channelIds = new Map<string, number>()
function uniqueId(channel: string): number {
  const existing = channelIds.get(channel)
  if (existing !== undefined) return existing
  const id = channelIds.size
  channelIds.set(channel, id)
  return id
}

function destChannel(tag: Tag): string {
  return [
    tag.qt ?? '',
    tag.q ?? '',
    tag['ele'] ?? '',
    tag['move'] ?? '',
    tag['trans'] ?? '',
  ].join('\0')
}

export type StackQt = 'stackIn' | 'stackTmp' | 'stackOut'

function stackExtrasFromReader(): Partial<Tag> {
  return (reader as Read).stackChannelExtras()
}

/** Tag for a `stackIn` / `stackTmp` / `stackOut` read or write. */
export function stackReadTag<Tag_ extends Tag>(
  sheet: Sheet<Tag_> | undefined,
  qt: StackQt,
  q?: string
): Tag_ {
  return {
    et: 'own',
    ...(sheet ? { sheet } : {}),
    qt,
    ...(q !== undefined ? { q } : {}),
    ...stackExtrasFromReader(),
  } as unknown as Tag_
}

export function nonStackingTeamDataEntries(
  members: readonly string[]
): TagMapNodeEntries<Tag> {
  const r = reader as Read<Tag>
  const extra = stackExtrasFromReader()
  const pinStack = Object.keys(extra).length > 0
  return members.flatMap((src, i) => {
    const stacks = pinStack
      ? null
      : (r.withAll('qt', []) as { stackIn: Read<Tag>; stackTmp: Read<Tag> })
    const stackIn = pinStack
      ? r.withTag({ qt: 'stackIn', ...extra } as Tag)
      : stacks!.stackIn
    const stackTmp = pinStack
      ? r.withTag({ qt: 'stackTmp', ...extra } as Tag)
      : stacks!.stackTmp
    const ownMember = r.withTag(
      pinStack
        ? ({ src, et: 'own', ...extra } as Tag)
        : ({ src, et: 'own' } as Tag)
    )
    return [
      ownMember.with('qt', 'stackTmp').add(cmpNE(stackIn, 0, i + 1)),
      ownMember
        .with('qt', 'stackOut')
        .add(
          cmpEq(
            stackTmp.max.withTag(
              pinStack
                ? ({ et: 'team', ...extra } as Tag)
                : ({ et: 'team' } as Tag)
            ),
            i + 1,
            stackIn
          )
        ),
    ]
  })
}

/**
 * One non-stack token for a WR group that writes several dest stats.
 * Callers `add(prod(out, destRate))` so every dest comes from the same winner.
 */
export function stackToken<Tag_ extends Tag>(
  sheet: Sheet<Tag_>,
  value: number | NumNode
): { entries: TagMapNodeEntries<Tag_>; out: Read<Tag_> } {
  const q = `${uniqueId(`${sheet}\0token`)}`
  const out = reader.withTag(stackReadTag(sheet, 'stackOut', q)) as Read<Tag_>
  return {
    entries: [
      reader.withTag(stackReadTag(sheet, 'stackIn', q)).add(value),
    ] as TagMapNodeEntries<Tag_>,
    out,
  }
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
