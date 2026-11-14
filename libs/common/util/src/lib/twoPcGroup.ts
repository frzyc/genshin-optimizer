/** Plain passive granted by a 2-piece. Absent stats mean the row is one set. */
export type TwoPcStats = Readonly<Record<string, number>>

export type TwoPcGroup<K extends string> = {
  id: string
  sets: K[]
  stats?: TwoPcStats
}

/**
 * Bucket sets that grant the same passive. A null or empty stat map stays
 * its own row, labeled by the set.
 */
export function groupTwoPc<K extends string>(
  entries: readonly { set: K; stats?: TwoPcStats | null }[]
): TwoPcGroup<K>[] {
  const groups: TwoPcGroup<K>[] = []
  const byId = new Map<string, TwoPcGroup<K>>()
  for (const entry of entries) {
    const stats = entry.stats
    if (!stats || Object.keys(stats).length === 0) {
      groups.push({ id: `set:${entry.set}`, sets: [entry.set] })
      continue
    }
    const id = Object.keys(stats)
      .sort()
      .map((key) => `${key}=${stats[key]}`)
      .join('&')
    const existing = byId.get(id)
    if (existing) existing.sets.push(entry.set)
    else {
      const group: TwoPcGroup<K> = {
        id,
        sets: [entry.set],
        stats: { ...stats },
      }
      byId.set(id, group)
      groups.push(group)
    }
  }
  return groups
}

/** Empty allowlist means every set in `universe` is allowed. */
export function twoPcSelected<K extends string>(
  allowlist: readonly K[],
  universe: readonly K[]
): ReadonlySet<K> {
  return new Set(allowlist.length ? allowlist : universe)
}

/**
 * First click on a group while the allowlist is empty restricts to that
 * bonus. A later click adds or removes the whole group. Selecting every set
 * in `universe` collapses back to the empty allowlist.
 */
export function toggleTwoPcGroup<K extends string>(
  allowlist: readonly K[],
  members: readonly K[],
  universe: readonly K[],
  emptyMeansAll = true
): K[] {
  if (emptyMeansAll && allowlist.length === 0)
    return collapseIfUniverse([...members], universe)
  const selected = new Set(allowlist)
  const allOn =
    members.length > 0 && members.every((member) => selected.has(member))
  const next = allOn
    ? allowlist.filter((key) => !members.includes(key))
    : [...allowlist, ...members.filter((member) => !selected.has(member))]
  return emptyMeansAll ? collapseIfUniverse(next, universe) : [...next]
}

/**
 * Unchecking a member while everything is allowed materializes the universe
 * without that set, so one set can be left out of a shared bonus.
 */
export function toggleTwoPcMember<K extends string>(
  allowlist: readonly K[],
  member: K,
  universe: readonly K[],
  emptyMeansAll = true
): K[] {
  if (!emptyMeansAll) {
    return allowlist.includes(member)
      ? allowlist.filter((key) => key !== member)
      : [...allowlist, member]
  }
  const base = allowlist.length === 0 ? [...universe] : [...allowlist]
  const next = base.includes(member)
    ? base.filter((key) => key !== member)
    : [...base, member]
  return collapseIfUniverse(next, universe)
}

function collapseIfUniverse<K extends string>(
  next: readonly K[],
  universe: readonly K[]
): K[] {
  if (next.length !== universe.length) return [...next]
  const have = new Set(next)
  return universe.every((key) => have.has(key)) ? [] : [...next]
}
