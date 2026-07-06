import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import { allSubstatKeys } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { DynStat } from '@genshin-optimizer/gi/solver'
import { getRollsRemaining } from '@genshin-optimizer/gi/util'
import { substatWeights } from './consts'
import { deduplicate } from './deduplicate'
import {
  makeSubstatNode,
  reshapedRollCountMuVar,
  subMuVar,
} from './expandSubstat'
import type { Objective } from './markov-tree/markov.types'
import { crawlSubstats } from './substatProbs'
import { toStats } from './upOpt'
import type { SubstatLevelNode } from './upOpt.types'

/**
 * Memoized variants of `elixirDefinition()`. For a fixed (mainStatKey, affixes) pair the
 * substat crawl produces the same node list regardless of setKey/slotKey/build - only the
 * `base` stats differ. Two competing strategies, both drop-in replacements:
 *
 * - `elixirDefinitionMemoFull`: cache the entire node list per (mainStatKey, affixes, lines)
 *   and stamp the query's `base` onto shallow clones. Fastest retrieval, largest cache.
 * - `elixirDefinitionMemoSimplified`: like MemoFull, but templates are stored
 *   post-`deduplicate(obj, ...)`: zero-derivative substats are stripped and combos that
 *   differ only in irrelevant substats are merged. Fewer & smaller nodes per entry, so the
 *   cache shrinks and every downstream stage (evaluation, expansion) does less work.
 *   Assumes all calls sharing a cache use the same objective.
 * - `elixirDefinitionMemoWeights`: cache the crawl probabilities (keyed by substat
 *   *weights*, which many stats share), the reshaped roll-count distributions (keyed by
 *   affix positions), and the value-scaled mu/cov (keyed by the concrete substat combo,
 *   bounded at C(10,4)*C(4,2)*2 = 2520 entries, ~1.5MB). Nodes are rebuilt per query by
 *   filling in the actual substat keys. Small cache, retrieval does a bit more work.
 */

type Build = Record<ArtifactSlotKey, ICachedArtifact | undefined>
type WeightedNode = { p: number; n: SubstatLevelNode }
export type ElixirDefineQuery = {
  setKey: ArtifactSetKey | ''
  slotKey: ArtifactSlotKey
  mainStatKey: MainStatKey
  affixes: SubstatKey[]
  prob_4line: number
}

const rarity = 5 as const
const mintotal = 2 // Elixir guarantees at least 2 total rolls on the 2 chosen affixes.

// Hoisted subMuVar lookup: avoids the `${key}_${rarity}` string built per subMuVar call.
const smvTable = Object.fromEntries(
  allSubstatKeys.map((k) => [k, subMuVar(k, rarity)])
) as Record<SubstatKey, { mu: number; sig2: number }>

function sortedAffixes(affixes: SubstatKey[]) {
  return [...affixes].sort((a, b) => a.localeCompare(b))
}

function affixPool(mainStatKey: MainStatKey, affixes: SubstatKey[]) {
  return allSubstatKeys.filter((s) => !affixes.includes(s) && s !== mainStatKey)
}

/**
 * Main stats that cannot appear as substats (elemental/physical dmg, heal_) all leave the
 * same substat pool, so their templates are identical; collapse them to one '' bucket.
 */
function mainStatCacheKey(mainStatKey: MainStatKey) {
  return (allSubstatKeys as readonly string[]).includes(mainStatKey)
    ? mainStatKey
    : ''
}

// ---------------------------------------------------------------------------
// Method A: full node-list cache
// ---------------------------------------------------------------------------

/**
 * `${mainStatKey};${affixes.join('+')};${3|4}` -> node list with empty `base`.
 * Non-substat main stats share the '' bucket (see `mainStatCacheKey`).
 */
export type ElixirNodeCache = Map<string, WeightedNode[]>
export const defaultElixirNodeCache: ElixirNodeCache = new Map()

function getNodeTemplates(
  mainStatKey: MainStatKey,
  affixes: SubstatKey[], // sorted
  lines: 3 | 4,
  cache: ElixirNodeCache
): WeightedNode[] {
  const cacheKey = `${mainStatCacheKey(mainStatKey)};${affixes.join('+')};${lines}`
  const hit = cache.get(cacheKey)
  if (hit) return hit

  const rollsLeft = getRollsRemaining(0, rarity) - (4 - lines)
  const templates = crawlSubstats(affixes, affixPool(mainStatKey, affixes)).map(
    ({ p, subs }) => ({
      p,
      n: makeSubstatNode({
        base: {},
        rarity,
        subkeys: subs.map((key) => ({ key, baseRolls: 1 })),
        rollsLeft,
        reshape: { affixes: [...affixes], mintotal },
      }),
    })
  )
  cache.set(cacheKey, templates)
  return templates
}

/**
 * Clone a cached template with the query's `base` stats. `deduplicate()` reassigns node
 * fields in place, so the node & subDistr wrappers must be fresh per retrieval; the inner
 * mu/cov/subkeys arrays are never mutated downstream and can be shared with the cache.
 */
function rebase(n: SubstatLevelNode, base: DynStat): SubstatLevelNode {
  return { ...n, base, subDistr: { ...n.subDistr, base } }
}

/** Drop-in replacement for `elixirDefinition()` backed by the full node-list cache. */
export function elixirDefinitionMemoFull(
  info: ElixirDefineQuery,
  currentBuild: Build,
  cache: ElixirNodeCache = defaultElixirNodeCache
): WeightedNode[] {
  const base = toStats(currentBuild, { ...info, rarity })
  const affixes = sortedAffixes(info.affixes)
  // Both crawls enumerate combos in the same order, so the lists are parallel.
  const t4 = getNodeTemplates(info.mainStatKey, affixes, 4, cache)
  const t3 = getNodeTemplates(info.mainStatKey, affixes, 3, cache)
  return t4.flatMap(({ p, n }, i) => [
    { p: p * info.prob_4line, n: rebase(n, base) },
    { p: t3[i].p * (1 - info.prob_4line), n: rebase(t3[i].n, base) },
  ])
}

// ---------------------------------------------------------------------------
// Method A': objective-simplified node-list cache
// ---------------------------------------------------------------------------

/**
 * `${mainStatKey};${affixes.join('+')};${3|4}` -> deduplicated node list with empty
 * `base`. Non-substat main stats share the '' bucket (see `mainStatCacheKey`).
 * Entries are simplified against a specific objective, so all calls sharing a
 * cache MUST use the same objective; clear (or replace) the cache when it changes.
 */
export type ElixirSimplifiedCache = Map<string, WeightedNode[]>
export const defaultElixirSimplifiedCache: ElixirSimplifiedCache = new Map()

function getSimplifiedTemplates(
  mainStatKey: MainStatKey,
  affixes: SubstatKey[], // sorted
  lines: 3 | 4,
  obj: Objective,
  cache: ElixirSimplifiedCache
): WeightedNode[] {
  const cacheKey = `${mainStatCacheKey(mainStatKey)};${affixes.join('+')};${lines}`
  const hit = cache.get(cacheKey)
  if (hit) return hit

  const rollsLeft = getRollsRemaining(0, rarity) - (4 - lines)
  // Build fresh raw nodes: deduplicate() mutates them in place, so they must not be
  // shared with the plain full-node cache.
  const raw = crawlSubstats(affixes, affixPool(mainStatKey, affixes)).map(
    ({ p, subs }) => ({
      p,
      n: makeSubstatNode({
        base: {},
        rarity,
        subkeys: subs.map((key) => ({ key, baseRolls: 1 })),
        rollsLeft,
        reshape: { affixes: [...affixes], mintotal },
      }),
    })
  )
  const templates = deduplicate(obj, raw) as WeightedNode[]
  cache.set(cacheKey, templates)
  return templates
}

/**
 * Like `elixirDefinitionMemoFull`, but returns the objective-simplified & merged node
 * list, i.e. what `deduplicate(obj, elixirDefinition(info, build))` would produce (up to
 * float rounding in the merged probabilities). All calls sharing a cache must use the
 * same objective.
 */
export function elixirDefinitionMemoSimplified(
  info: ElixirDefineQuery,
  currentBuild: Build,
  obj: Objective,
  cache: ElixirSimplifiedCache = defaultElixirSimplifiedCache
): WeightedNode[] {
  const base = toStats(currentBuild, { ...info, rarity })
  const affixes = sortedAffixes(info.affixes)
  // deduplicate() sorts 4-line (rollsLeft 5) nodes ahead of 3-line, so concatenating the
  // two template blocks reproduces its output ordering.
  const t4 = getSimplifiedTemplates(info.mainStatKey, affixes, 4, obj, cache)
  const t3 = getSimplifiedTemplates(info.mainStatKey, affixes, 3, obj, cache)
  return [
    ...t4.map(({ p, n }) => ({ p: p * info.prob_4line, n: rebase(n, base) })),
    ...t3.map(({ p, n }) => ({
      p: p * (1 - info.prob_4line),
      n: rebase(n, base),
    })),
  ]
}

// ---------------------------------------------------------------------------
// Method B: weight-space probability + roll-distribution cache
// ---------------------------------------------------------------------------

export type ElixirWeightCache = {
  /**
   * `${mainWeight};${affixWeights.join('+')}` -> (combo weight pattern -> probability).
   * Substat weights determine the crawl probabilities, so all (mainStatKey, affixes)
   * pairs with the same weight signature share one table.
   */
  probs: Map<string, Map<string, number>>
  /**
   * `${rollsLeft};${ix0},${ix1}` -> roll-count mu/cov with the guaranteed affixes at
   * positions ix0 < ix1 of the sorted subkeys, base rolls included. Read-only.
   */
  rollDistrs: Map<string, { mu: number[]; cov: number[][] }>
  /**
   * `${subs.join('+')};${rollsLeft};${ix0},${ix1}` -> value-scaled mu/cov for that
   * concrete substat combination. Arrays are shared read-only by all retrieved nodes;
   * `deduplicate()` reassigns node fields with fresh filtered arrays, so this is safe.
   */
  scaled: Map<string, { mu: number[]; cov: number[][] }>
}
export function createElixirWeightCache(): ElixirWeightCache {
  return { probs: new Map(), rollDistrs: new Map(), scaled: new Map() }
}
export const defaultElixirWeightCache = createElixirWeightCache()

function weightPattern(subs: readonly SubstatKey[]) {
  return subs
    .map((k) => substatWeights[k])
    .sort((a, b) => a - b)
    .join('+')
}

function getWeightProbs(
  mainStatKey: MainStatKey,
  affixes: SubstatKey[],
  cache: ElixirWeightCache
): Map<string, number> {
  const mainW = substatWeights[mainStatKey as SubstatKey] ?? 0
  const cacheKey = `${mainW};${weightPattern(affixes)}`
  const hit = cache.probs.get(cacheKey)
  if (hit) return hit

  const table = new Map<string, number>()
  crawlSubstats(affixes, affixPool(mainStatKey, affixes), false).forEach(
    ({ p, subs }) => table.set(weightPattern(subs), p)
  )
  cache.probs.set(cacheKey, table)
  return table
}

function getRollDistr(
  rollsLeft: number,
  reshapeIxs: number[],
  cache: ElixirWeightCache
) {
  const cacheKey = `${rollsLeft};${reshapeIxs.join(',')}`
  const hit = cache.rollDistrs.get(cacheKey)
  if (hit) return hit

  const { mu, cov } = reshapedRollCountMuVar(rollsLeft, reshapeIxs, {
    n: reshapeIxs.length,
    min: mintotal,
  })
  // Elixir subkeys all start with 1 base roll.
  const entry = { mu: mu.map((v) => v + 1), cov }
  cache.rollDistrs.set(cacheKey, entry)
  return entry
}

/** Rebuild a substat node from the cached distributions, filling in actual keys. */
function buildElixirNode(
  base: DynStat,
  subs: SubstatKey[], // sorted, length 4
  affixes: SubstatKey[], // sorted
  rollsLeft: number,
  cache: ElixirWeightCache
): SubstatLevelNode {
  const reshapeIxs = affixes.map((a) => subs.indexOf(a))
  const scaledKey = `${subs.join('+')};${rollsLeft};${reshapeIxs.join(',')}`
  let scaled = cache.scaled.get(scaledKey)
  if (!scaled) {
    const { mu: muRoll, cov: covRoll } = getRollDistr(
      rollsLeft,
      reshapeIxs,
      cache
    )
    // Scale roll counts by each substat's per-roll value distribution (as makeSubstatNode).
    const smv = subs.map((key) => smvTable[key])
    scaled = {
      mu: muRoll.map((v, i) => v * smv[i].mu),
      cov: covRoll.map((row, i) =>
        row.map(
          (val, j) =>
            val * smv[i].mu * smv[j].mu +
            (i === j ? smv[i].sig2 * muRoll[i] : 0)
        )
      ),
    }
    cache.scaled.set(scaledKey, scaled)
  }
  return {
    type: 'substat',
    base,
    rarity,
    subkeys: subs.map((key) => ({ key, baseRolls: 1 })),
    rollsLeft,
    reshape: { affixes: [...affixes], mintotal },
    subDistr: { base, subs: [...subs], mu: scaled.mu, cov: scaled.cov },
  }
}

/** Drop-in replacement for `elixirDefinition()` backed by the weight-space cache. */
export function elixirDefinitionMemoWeights(
  info: ElixirDefineQuery,
  currentBuild: Build,
  cache: ElixirWeightCache = defaultElixirWeightCache
): WeightedNode[] {
  const base = toStats(currentBuild, { ...info, rarity })
  const affixes = sortedAffixes(info.affixes)
  const probs = getWeightProbs(info.mainStatKey, affixes, cache)
  const pool = affixPool(info.mainStatKey, affixes)
  const rollsLeft = getRollsRemaining(0, rarity)

  const out: WeightedNode[] = []
  // Same combo enumeration order as crawlSubstats (i < j lexicographic).
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const p = probs.get(weightPattern([pool[i], pool[j]])) ?? 0
      if (p <= 0) continue
      const subs = [...affixes, pool[i], pool[j]].sort((a, b) =>
        a.localeCompare(b)
      )
      out.push({
        p: p * info.prob_4line,
        n: buildElixirNode(base, subs, affixes, rollsLeft, cache),
      })
      out.push({
        p: p * (1 - info.prob_4line),
        n: buildElixirNode(base, subs, affixes, rollsLeft - 1, cache),
      })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Cache measurement helpers
// ---------------------------------------------------------------------------

/**
 * Rough in-memory footprint estimate (bytes) of a cached structure. Counts 8 bytes per
 * number, 2 bytes per string char, and small fixed overheads per object/array/Map entry.
 * Shared references are counted once.
 */
export function roughSizeOf(x: unknown, seen = new Set<object>()): number {
  if (x === null || x === undefined) return 4
  if (typeof x === 'number') return 8
  if (typeof x === 'boolean') return 4
  if (typeof x === 'string') return 16 + 2 * x.length
  if (typeof x !== 'object') return 8

  const obj = x as object
  if (seen.has(obj)) return 0
  seen.add(obj)
  let size = 16
  if (obj instanceof Map) {
    for (const [k, v] of obj)
      size += 16 + roughSizeOf(k, seen) + roughSizeOf(v, seen)
  } else if (Array.isArray(obj)) {
    for (const v of obj) size += 8 + roughSizeOf(v, seen)
  } else {
    for (const [k, v] of Object.entries(obj))
      size += 16 + roughSizeOf(k, seen) + roughSizeOf(v, seen)
  }
  return size
}

export function clearElixirMemoCaches() {
  defaultElixirNodeCache.clear()
  defaultElixirSimplifiedCache.clear()
  defaultElixirWeightCache.probs.clear()
  defaultElixirWeightCache.rollDistrs.clear()
  defaultElixirWeightCache.scaled.clear()
}
