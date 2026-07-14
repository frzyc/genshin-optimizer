import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import {
  dynRead,
  min,
  precompute,
  prod,
  sum,
  threshold,
} from '@genshin-optimizer/gi/wr'
import type {
  ArtifactBuildData,
  ArtifactsBySlot,
  DynMinMax,
  DynStat,
  FutureArtifactProfile,
  PartialBuildsSetup,
} from '../common'
import { pruneDominance } from './BNBSplitWorker/diffBound'
import { PartialBuildTracker } from './PartialBuildTracker'
import { tightenPartialBuilds } from './tightenPartials'

/**
 * Integration test of the candidate -> tighten pipeline on a real artifact
 * dump (~1150 artifacts): how much does tightening shrink the candidate
 * frontier, how long does it take, and do the witnesses hold up?
 *
 * The pool is pre-shrunk with `pruneDominance` (which keeps the top-1 build
 * and does not re-key stats, so the original-space profiles stay valid), the
 * top-1 threshold is brute-forced, and the tracker is fed the whole pruned
 * pool as one region — a stand-in for what the solver's compute workers
 * would stream.
 */

const jsonPath = fileURLToPath(
  new URL(
    '../../../db/src/Database/Van_2025-07-16_19-59-13.json',
    import.meta.url
  )
)

/** 5* lvl 20 main stat values (same as diffBound.realdata.test.ts) */
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
  electro_dmg_: 0.466,
}
/** Max 5* substat roll values. */
const SUB_ROLL: DynStat = {
  hp: 298.75,
  atk: 19.45,
  def: 23.15,
  hp_: 0.0583,
  atk_: 0.0583,
  def_: 0.0729,
  eleMas: 23.31,
  enerRech_: 0.0648,
  critRate_: 0.0389,
  critDMG_: 0.0777,
}
const SUB_POOL: DynMinMax = Object.fromEntries(
  Object.entries(SUB_ROLL).map(([k, r]) => [k, { min: 0, max: 6 * r }])
)

type GoodArtifact = {
  setKey: string
  rarity: number
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
      [art.mainStatKey]: MAIN_STAT[art.mainStatKey] ?? 0,
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

/** Fischl-style off-field skill DPS with Golden Troupe, unconstrained. */
const r = (k: string) => dynRead(k)
const atk = sum(r('atk'), prod(850, r('atk_')))
const dmg_ = sum(
  1,
  r('electro_dmg_'),
  threshold(r('GoldenTroupe'), 2, 0.2, 0),
  threshold(r('GoldenTroupe'), 4, 0.45, 0)
)
const crcd = sum(1, prod(min(r('critRate_'), 1), r('critDMG_')))
const nodes = [prod(atk, dmg_, crcd)]
const mins = [-Infinity]
const base: DynStat = {
  atk: 850,
  atk_: 0,
  electro_dmg_: 0,
  critRate_: 0.05,
  critDMG_: 0.5,
}

const flowerProfiles: FutureArtifactProfile[] = [
  { fixed: { hp: 4780, GoldenTroupe: 1 } },
  { fixed: { hp: 4780 } }, // any off-set flower
].map(({ fixed }) => ({
  fixed,
  substats: SUB_POOL,
  maxSubstats: 4,
  rollBudget: { rollSize: SUB_ROLL, totalRolls: 9 },
}))

describe('tightenPartialBuilds on real data: golden troupe skill', () => {
  test('shrinks the candidate frontier; witnesses hold up', () => {
    const raw = loadArts(base)
    const arts = pruneDominance(nodes, raw, 1).arts

    // brute-force top-1 threshold over the pruned pool
    const compute = precompute(nodes, arts.base, (f) => f.path[1], 5)
    let threshold = -Infinity
    const permute = (i: number, buffer: ArtifactBuildData[]) => {
      if (i < 0) {
        const v = compute(buffer as any)[0]
        if (v > threshold) threshold = v
        return
      }
      for (const art of arts.values[allArtifactSlotKeys[i]]) {
        buffer[i] = art
        permute(i - 1, buffer)
      }
    }
    permute(allArtifactSlotKeys.length - 1, Array(5))

    const setup: PartialBuildsSetup = {
      profiles: { flower: flowerProfiles },
      nodes,
      mins,
      arts,
    }
    const t0 = performance.now()
    const tracker = new PartialBuildTracker(setup)
    tracker.threshold = threshold
    tracker.processFilter(arts.values)
    const candidates = tracker.candidates().flower!
    const t1 = performance.now()
    const tight = tightenPartialBuilds(setup, { flower: candidates }, threshold)
      .flower!
    const t2 = performance.now()

    const others = allArtifactSlotKeys.filter((s) => s !== 'flower')
    console.log(
      `pool ${others.map((s) => arts.values[s].length).join('x')}`,
      `-> ${candidates.length} candidates (${Math.round(t1 - t0)}ms)`,
      `-> ${tight.length} tight partials (${Math.round(t2 - t1)}ms),`,
      `${tight.filter((m) => m.witness!.margin > 0).length} strictly witnessed`
    )
    console.log(
      '  relative margins:',
      tight
        .map((m) => (m.witness!.margin / m.witness!.value).toExponential(1))
        .join(' ')
    )

    expect(tight.length).toBeLessThan(candidates.length)
    expect(t2 - t1).toBeLessThan(60_000)
    for (const m of tight) expect(m.witness).toBeDefined()

    // Witness spot check: strictly witnessed members must beat every
    // candidate at their witness artifact.
    const byId = new Map(
      others.flatMap((s) => arts.values[s].map((a) => [a.id, a] as const))
    )
    const evalAt = (x: ArtifactBuildData, ids: string[]) =>
      compute([x, ...ids.map((id) => byId.get(id)!)] as any)[0]
    const strict = tight.filter((m) => m.witness!.margin > 0).slice(0, 12)
    expect(strict.length).toBeGreaterThan(0)
    for (const m of strict) {
      const { artifact, value } = m.witness!
      const x: ArtifactBuildData = { id: 'w', values: artifact }
      expect(evalAt(x, m.artifactIds)).toBeCloseTo(value, 9)
      for (const ids of candidates) {
        const v = evalAt(x, ids)
        expect(value).toBeGreaterThanOrEqual(v - 1e-9 * v)
      }
    }
  })
})
