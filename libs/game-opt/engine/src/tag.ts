import type { Tag as BaseTag, NumNode } from '@genshin-optimizer/pando/engine'
import { cmpEq, cmpNE, subscript } from '@genshin-optimizer/pando/engine'
import type { IBaseConditionalData } from './IConditionalData'
import type { Read, Sheet, Src, Tag } from './read'
import { reader } from './read'

export type Desc<Tag extends BaseTag, Sheet extends string> = {
  sheet: Sheet | undefined
  accu: Read<Tag>['accu']
}

export const createConvert =
  <Read_ extends Read<Tag>>() =>
  <
    V extends Record<
      string,
      Record<string, Desc<Read_['tag'], Sheet<Read['tag']>>>
    >
  >(
    v: V,
    tag: Omit<Read_['tag'], 'qt' | 'q'>
  ): {
    [j in 'withTag' | keyof V]: j extends 'withTag'
      ? (_: Read_['tag']) => Read_
      : Record<keyof V[j], Read_>
  } => {
    const r = (reader as Read_).withTag(tag as Read_['tag'])
    return r.withAll(
      'qt',
      Object.keys(v),
      (r, qt) =>
        r.withAll('q', Object.keys(v[qt]), (r, q) => {
          if (!v[qt][q]) console.error(`Invalid { qt:${qt} q:${q} }`)
          const { sheet, accu } = v[qt][q]
          // `tag.sheet` overrides `Desc`
          if (sheet && !tag['sheet']) r = r.sheet(sheet)
          return r[accu]
        }),
      { withTag: (tag: Read_['tag']) => r.withTag(tag) }
    ) as any
  }

// Custom tags
export const allStatics = <Tag_ extends Tag>(sheet: Sheet<Tag>) =>
  (reader as Read<Tag_>)
    .withTag({ et: 'own', sheet, qt: 'misc' } as Tag_)
    .withAll('q', [])
export const createAllBoolConditionals =
  <Tag_ extends Tag>(nullTag: Tag_) =>
  (sheet: Sheet<Tag>, ignored?: CondIgnored) =>
    allConditionals(nullTag, sheet, ignored, { type: 'bool' }, (r) => ({
      ifOn: (node: NumNode | number, off?: NumNode | number) =>
        cmpNE(r, 0, node, off),
      ifOff: (node: NumNode | number) => cmpEq(r, 0, node),
    }))
export const createAllListConditionals =
  <T extends string, Tag_ extends Tag>(nullTag: Tag_) =>
  (sheet: Sheet<Tag>, list: T[], ignored?: CondIgnored) =>
    allConditionals(nullTag, sheet, ignored, { type: 'list', list }, (r) => ({
      map: (table: Record<T, number>, def = 0) =>
        subscript(r, [def, ...list.map((v) => table[v] ?? def)]),
      value: r,
    }))
export const createAllNumConditionals =
  <Tag_ extends Tag>(nullTag: Tag_) =>
  (
    sheet: Sheet<Tag>,
    int_only = true,
    min?: number,
    max?: number,
    ignored?: CondIgnored
  ) =>
    allConditionals(
      nullTag,
      sheet,
      ignored,
      { type: 'num', int_only, min, max },
      (r) => r
    )

export const createConditionalEntries =
  <Read_ extends Read<Tag_>, Tag_ extends Tag>(own: {
    withTag: (_: Tag_) => Read_
  }) =>
  (sheet: Sheet<Tag_>, src: Src<Tag_>, dst: Tag_['dst']) => {
    const tag = { sheet, qt: 'cond', src, dst } as Tag_
    const base = own.withTag(tag).withAll('q', [])
    return (name: keyof typeof base, val: string | number) =>
      base[name].add(val)
  }

const condMeta = Symbol.for('condMeta')
type CondIgnored = 'both' | 'src' | 'dst' | 'none'
function allConditionals<T, Tag_ extends Tag>(
  nullTag: Tag_,
  sheet: Sheet<Tag_>,
  shared: CondIgnored = 'none',
  meta: IBaseConditionalData,
  transform: (r: Read<Tag_>, q: string) => T
): Record<string, T> {
  // Keep the base tag "full" here so that `cond` returns consistent tags
  const baseTag: Omit<Tag_, 'preset' | 'src' | 'dst' | 'q'> = {
    et: 'own' as const,
    sheet,
    qt: 'cond' as const,
    [condMeta]: meta, // Add metadata directly to tag
    // Remove irrelevant tags
    ...nullTag,
  } as unknown as Tag_
  let base = reader.max.withTag(baseTag) as Read<Tag_>
  if (shared === 'both')
    base = base.withTag({ src: null, dst: null } as any as Tag_)
  else if (shared !== 'none')
    base = base.with(shared, null as Tag_['src' | 'dst'])
  return base.withAll('q', [], transform)
}
