import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import {
  dynRead,
  frac,
  min,
  optimize,
  precompute,
  prod,
  sum,
  threshold,
} from '@genshin-optimizer/gi/wr'
import type { ArtifactBuildData, ArtifactsBySlot, DynStat } from '../../common'
import { pruneAll } from '../../common'
import { pruneDominance } from './diffBound'

/**
 * Integration test on a real artifact dump (~1150 artifacts): how many
 * artifacts per slot survive the *current* pruning (pruneAll = range pruning +
 * coordinate-wise `pruneOrder`), versus after the pairwise swap-dominance
 * prune, under realistic damage formulas. Also statistically verifies
 * soundness: every removed artifact is beaten by its recorded dominator on
 * randomly sampled fills of the other slots.
 */

const jsonPath = fileURLToPath(
  new URL(
    '../../../../db/src/Database/Van_2025-07-16_19-59-13.json',
    import.meta.url
  )
)

/** 5* lvl 20 main stat values (main stats assumed at max level, as the
 * optimizer's mainStatAssumptionLevel does) */
const MAIN_STAT: Record<string, number> = {
  hp: 4780,
  atk: 311,
  hp_: 0.466,
  atk_: 0.466,
  def_: 0.583,
  eleMas: 186.5,
  enerRech_: 0.518,
  critRate_: 0.311,
  critDMG_: 0.622,
  heal_: 0.359,
  physical_dmg_: 0.583,
  pyro_dmg_: 0.466,
  hydro_dmg_: 0.466,
  electro_dmg_: 0.466,
  cryo_dmg_: 0.466,
  anemo_dmg_: 0.466,
  geo_dmg_: 0.466,
  dendro_dmg_: 0.466,
}

type GoodArtifact = {
  setKey: string
  rarity: number
  level: number
  slotKey: ArtifactSlotKey
  mainStatKey: string
  substats: { key: string; value: number }[]
  id: string
}

function loadArts(charBase: DynStat): ArtifactsBySlot {
  const good = JSON.parse(readFileSync(jsonPath, 'utf8')) as {
    artifacts: GoodArtifact[]
  }
  const values = objKeyMap(allArtifactSlotKeys, () => [] as ArtifactBuildData[])
  const keys = new Set<string>(Object.keys(charBase))
  for (const art of good.artifacts) {
    if (art.rarity !== 5) continue
    const v: DynStat = {
      [art.setKey]: 1,
      [art.mainStatKey]: MAIN_STAT[art.mainStatKey],
    }
    for (const { key, value } of art.substats) {
      if (!key) continue
      v[key] = (v[key] ?? 0) + (key.endsWith('_') ? value / 100 : value)
    }
    values[art.slotKey].push({ id: art.id, set: art.setKey as any, values: v })
    Object.keys(v).forEach((k) => keys.add(k))
  }
  return { base: objKeyMap([...keys], (k) => charBase[k] ?? 0), values }
}

// production dyn reads accumulate (`accu: 'add'`); plain customRead would
// constant-fold missing keys to NaN inside pruneAll's reaffine pass
const r = (k: string) => dynRead(k)
const crcd = () => sum(1, prod(min(r('critRate_'), 1), r('critDMG_')))

type Scenario = {
  name: string
  nodes: OptNode[] // nodes[0] = opt target, rest = constraints
  mins: number[]
  base: DynStat
}

/** Raiden-style burst DPS: Emblem 4pc converts ER to burst DMG, ER >= 180% */
function emblemBurst(): Scenario {
  const atk = sum(r('atk'), prod(880, r('atk_')))
  const er = sum(r('enerRech_'), threshold(r('EmblemOfSeveredFate'), 2, 0.2, 0))
  const emblem4 = threshold(
    r('EmblemOfSeveredFate'),
    4,
    min(prod(0.25, sum(er, -1)), 0.75),
    0
  )
  const dmg_ = sum(1, r('electro_dmg_'), emblem4)
  return {
    name: 'emblem burst (ER >= 1.8 constraint)',
    nodes: [prod(atk, dmg_, crcd()), er],
    mins: [-Infinity, 1.8],
    base: {
      atk: 880,
      atk_: 0,
      enerRech_: 1.32,
      electro_dmg_: 0,
      critRate_: 0.05,
      critDMG_: 0.5,
    },
  }
}

/** Fischl-style off-field skill DPS with Golden Troupe, unconstrained */
function goldenTroupeSkill(): Scenario {
  const atk = sum(r('atk'), prod(850, r('atk_')))
  const dmg_ = sum(
    1,
    r('electro_dmg_'),
    threshold(r('GoldenTroupe'), 2, 0.2, 0),
    threshold(r('GoldenTroupe'), 4, 0.45, 0)
  )
  return {
    name: 'golden troupe skill (no constraint)',
    nodes: [prod(atk, dmg_, crcd())],
    mins: [-Infinity],
    base: {
      atk: 850,
      atk_: 0,
      electro_dmg_: 0,
      critRate_: 0.05,
      critDMG_: 0.5,
    },
  }
}

/** HuTao-style vape: HP->ATK conversion (capped), Crimson Witch, EM amp */
function crimsonVape(): Scenario {
  const hpTotal = sum(r('hp'), prod(15552, r('hp_')))
  const atk = sum(
    r('atk'),
    prod(715, r('atk_')),
    min(prod(0.0596, hpTotal), 2860)
  )
  const dmg_ = sum(
    1,
    r('pyro_dmg_'),
    threshold(r('CrimsonWitchOfFlames'), 2, 0.15, 0),
    threshold(r('CrimsonWitchOfFlames'), 4, 0.225, 0)
  )
  const amp = prod(1.5, sum(1, prod(2.78, frac(r('eleMas'), 1400))))
  return {
    name: 'crimson witch vape (HP conversion, EM amp)',
    nodes: [prod(atk, dmg_, crcd(), amp)],
    mins: [-Infinity],
    base: {
      hp: 15552,
      hp_: 0,
      atk: 715,
      atk_: 0,
      eleMas: 0,
      pyro_dmg_: 0,
      critRate_: 0.05,
      critDMG_: 0.884,
    },
  }
}

const slotCounts = (arts: ArtifactsBySlot) =>
  objKeyMap(allArtifactSlotKeys, (slot) => arts.values[slot].length)
const totalCount = (arts: ArtifactsBySlot) =>
  allArtifactSlotKeys.reduce((t, s) => t + arts.values[s].length, 0)

/** Deterministic LCG so failures are reproducible */
function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

describe.each([
  emblemBurst(),
  goldenTroupeSkill(),
  crimsonVape(),
])('pruneDominance on real data: $name', ({ nodes: rawNodes, mins, base }) => {
  const numTop = 1
  const raw = loadArts(base)

  // Baseline: what the solver does today at the root of the search
  // (calculateFilter: pruneAll incl. coordinate-wise pruneOrder, then fold)
  const pruned = pruneAll(
    rawNodes,
    mins,
    raw,
    numTop,
    {},
    {
      pruneNodeRange: true,
    }
  )
  const nodes = optimize(pruned.nodes, {}, (_) => false)
  const baseline = pruned.arts

  const t0 = performance.now()
  const { arts: dominated, dominators } = pruneDominance(
    nodes,
    baseline,
    numTop
  )
  const elapsed = performance.now() - t0

  test('shrinks the per-slot lists beyond pruneAll/pruneOrder', () => {
    console.log(
      `[${rawNodes.length} node(s)] raw:`,
      slotCounts(raw),
      '\n  pruneAll (current):',
      slotCounts(baseline),
      '\n  +pruneDominance:   ',
      slotCounts(dominated),
      `\n  (${totalCount(raw)} -> ${totalCount(baseline)} -> ${totalCount(
        dominated
      )} artifacts, dominance pass took ${elapsed.toFixed(0)}ms)`
    )
    allArtifactSlotKeys.forEach((slot) =>
      expect(dominated.values[slot].length).toBeLessThanOrEqual(
        baseline.values[slot].length
      )
    )
    expect(totalCount(dominated)).toBeLessThan(totalCount(baseline))
  })

  test('candidate cap keeps nearly all pruning power', () => {
    const t1 = performance.now()
    const capped = pruneDominance(nodes, baseline, numTop, 32)
    const cappedElapsed = performance.now() - t1
    console.log(
      `  cap=32: ${totalCount(capped.arts)} kept (uncapped ${totalCount(
        dominated
      )}), ${cappedElapsed.toFixed(0)}ms (uncapped ${elapsed.toFixed(0)}ms)`
    )
    // Fewer candidates tested => fewer (or equal) removals, never more
    expect(totalCount(capped.arts)).toBeGreaterThanOrEqual(
      totalCount(dominated)
    )
    // ... but the best-first ordering should retain most removals
    const removedUncapped = totalCount(baseline) - totalCount(dominated)
    const removedCapped = totalCount(baseline) - totalCount(capped.arts)
    expect(removedCapped).toBeGreaterThanOrEqual(0.8 * removedUncapped)
  })

  test('iterating to a fixpoint tightens the box and cuts deeper', () => {
    // Removing artifacts shrinks the stat ranges, which tightens both
    // pruneAll and the interval factors in the telescoped mul bound, which
    // unlocks further removals. This mimics interleaving the passes inside
    // the pruneAll micropass loop.
    let cur = { nodes, arts: dominated }
    const t0 = performance.now()
    for (let round = 0; round < 10; round++) {
      const before = totalCount(cur.arts)
      const p = pruneAll(
        cur.nodes,
        mins,
        cur.arts,
        numTop,
        {},
        {
          pruneArtRange: true,
          pruneOrder: true,
          pruneNodeRange: true,
        }
      )
      const newNodes = optimize(p.nodes, {}, (_) => false)
      cur = {
        nodes: newNodes,
        arts: pruneDominance(newNodes, p.arts, numTop).arts,
      }
      if (totalCount(cur.arts) === before) break
    }
    const elapsed = performance.now() - t0
    console.log(
      '  fixpoint:          ',
      slotCounts(cur.arts),
      `\n  (${totalCount(dominated)} -> ${totalCount(
        cur.arts
      )} artifacts, +${elapsed.toFixed(0)}ms)`
    )
    expect(totalCount(cur.arts)).toBeLessThanOrEqual(totalCount(dominated))
  })

  test('every removal is sound on sampled builds', () => {
    const compute = precompute(nodes, baseline.base, (f) => f.path[1], 5)
    const rng = makeRng(0xc0ffee)
    const violations: string[] = []
    for (const slot of allArtifactSlotKeys) {
      const list = baseline.values[slot]
      const byId = new Map(list.map((a) => [a.id, a]))
      const others = allArtifactSlotKeys
        .filter((s) => s !== slot)
        .map((s) => baseline.values[s])
      const removed = list.filter((a) => dominators.has(a.id)).slice(0, 40)
      for (const m of removed) {
        const n = byId.get(dominators.get(m.id)![0])!
        for (let trial = 0; trial < 100; trial++) {
          const rest = others.map(
            (arts) => arts[Math.floor(rng() * arts.length)]
          )
          const fm = compute([m, ...rest] as any)
          const fn = compute([n, ...rest] as any)
          nodes.forEach((_, i) => {
            if (fn[i] < fm[i] - 1e-9 * Math.max(1, Math.abs(fm[i])))
              violations.push(
                `${slot} ${m.id} -> ${n.id}, node ${i}: ${fn[i]} < ${fm[i]}`
              )
          })
        }
      }
    }
    expect(violations).toEqual([])
  })
})
