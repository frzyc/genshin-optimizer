import {
  type DmgAbilityDim,
  abilityDims,
  isAbilityDim,
} from '@genshin-optimizer/zzz/formula'
import type { Sheet, Tag } from '@genshin-optimizer/zzz/formula'

function groupKey(tag: Tag) {
  return `${tag.sheet ?? ''}:${tag.name ?? ''}`
}

function abilityDimSortIndex(q: string | null | undefined): number {
  if (!q) return abilityDims.length
  if (isAbilityDim(q)) return abilityDims.indexOf(q)
  return abilityDims.length
}

/** Stable tag order: sheet → name → `abilityDims`. */
export function compareBundlableTags(a: Tag, b: Tag): number {
  const sheetA = a.sheet ?? ''
  const sheetB = b.sheet ?? ''
  if (sheetA !== sheetB) return sheetA.localeCompare(sheetB)
  const nameA = a.name ?? ''
  const nameB = b.name ?? ''
  if (nameA !== nameB) return nameA.localeCompare(nameB)
  const qOrd = abilityDimSortIndex(a.q) - abilityDimSortIndex(b.q)
  if (qOrd) return qOrd
  return (a.q ?? '').localeCompare(b.q ?? '')
}

export function sortBundlableTags(tags: Tag[]): Tag[] {
  return [...tags].sort(compareBundlableTags)
}

function resolveBundleDmgQ(byQ: Map<string, Tag>): DmgAbilityDim | undefined {
  if (byQ.has('standardDmg')) return 'standardDmg'
  if (byQ.has('sheerDmg')) return 'sheerDmg'
  return undefined
}

function isCompleteAbilityBundle(byQ: Map<string, Tag>): boolean {
  const dmgQ = resolveBundleDmgQ(byQ)
  return !!dmgQ && byQ.has('dazeBuildup') && byQ.has('anomBuildup')
}

export type BundledFieldPart =
  | { kind: 'single'; tag: Tag }
  | { kind: 'bundle'; byQ: Map<string, Tag>; dmgQ: DmgAbilityDim }

export function partitionBundlableTags(
  tags: Tag[],
  sheet?: Sheet
): BundledFieldPart[] {
  const withSheet = (tag: Tag): Tag =>
    sheet && !tag.sheet ? { ...tag, sheet } : tag
  const sortedTags = sortBundlableTags(tags.map(withSheet))

  const seenGroups = new Set<string>()
  const parts: BundledFieldPart[] = []

  for (const tag of sortedTags) {
    const { name, q } = tag
    if (!name || !isAbilityDim(q)) {
      parts.push({ kind: 'single', tag })
      continue
    }

    const key = groupKey(tag)
    if (seenGroups.has(key)) continue
    seenGroups.add(key)

    const group = sortedTags.filter(
      (t) => t.name === name && t.sheet === tag.sheet && isAbilityDim(t.q)
    )
    const byQ = new Map<string, Tag>()
    for (const t of group) {
      const rq = t.q
      if (isAbilityDim(rq)) byQ.set(rq, t)
    }

    const dmgQ = resolveBundleDmgQ(byQ)
    if (dmgQ && isCompleteAbilityBundle(byQ)) {
      parts.push({ kind: 'bundle', byQ, dmgQ })
    } else {
      for (const t of group) parts.push({ kind: 'single', tag: t })
    }
  }

  return parts
}
