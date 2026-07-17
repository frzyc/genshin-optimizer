import { cartesian } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import {
  dynRead,
  frac,
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
  SolverPartialBuild,
} from '../common'
import { dedupeProfiles, tightenPartialBuilds } from './tightenPartials'

/**
 * Exhaustive validation of `tightenPartialBuilds`: candidates are the *full*
 * cartesian product of the other four slots, so (unlike the solver flow,
 * where pruning may drop candidates) the coverage guarantee and witness
 * claims must hold against everything.
 *
 * The fixture is crafted so that 4pc HeartOfDepth is impossible with current
 * artifacts when the flower is left out of consideration — exactly 3 HoD
 * pieces exist (plume/sands/goblet) and all flowers are OceanHuedClam — but a
 * future HoD flower enables it. The 3-HoD partial must therefore survive
 * tightening, witnessed by a HoD drop.
 */

const hp = sum(dynRead('hp'), prod(13471, dynRead('hp_')))
const crcd = sum(1, prod(dynRead('critRate_'), dynRead('critDMG_')))
const dmg_ = sum(
  1,
  dynRead('hydroDmg_'),
  threshold(dynRead('HeartOfDepth'), 2, 0.2, 0),
  threshold(dynRead('HeartOfDepth'), 4, 0.35, 0)
)
const er = dynRead('enerRech_')
const em = prod(2.78, frac(dynRead('eleMas'), 1400))
const target = prod(hp, dmg_, crcd, em)

const art = (
  id: string,
  set: ArtifactSetKey,
  values: Record<string, number>
): ArtifactBuildData => ({ id, set, values: { ...values, [set]: 1 } })
const exampleArts: ArtifactsBySlot = {
  base: {
    hp: 13471,
    hp_: 0.496,
    enerRech_: 1,
    hydroDmg_: 0.288,
    critDMG_: 0.5,
    critRate_: 0.05,
  },
  values: {
    flower: [
      art('f1', 'OceanHuedClam', {
        hp: 4780,
        eleMas: 44,
        hp_: 0.058,
        enerRech_: 0.227,
      }),
      art('f2', 'OceanHuedClam', { hp: 4780, eleMas: 43, hp_: 0.06 }),
      art('f3', 'OceanHuedClam', {
        hp: 4780,
        critDMG_: 0.15,
        critRate_: 0.031,
      }),
    ],
    plume: [
      art('p1', 'OceanHuedClam', { hp: 4780, hp_: 0.163, eleMas: 37 }),
      art('p2', 'OceanHuedClam', {
        hp: 4780,
        hp_: 0.1,
        critRate_: 0.1,
        enerRech_: 0.12,
      }),
      art('p3', 'HeartOfDepth', {
        hp: 4780,
        critDMG_: 0.12,
        eleMas: 40,
        enerRech_: 0.065,
      }),
    ],
    sands: [
      art('s1', 'OceanHuedClam', {
        enerRech_: 0.518,
        hp: 568,
        eleMas: 56,
        hp_: 0.105,
      }),
      art('s2', 'OceanHuedClam', { hp_: 0.466, hp: 538, critRate_: 0.08 }),
      art('s3', 'HeartOfDepth', {
        hp_: 0.466,
        eleMas: 40,
        enerRech_: 0.155,
      }),
    ],
    goblet: [
      art('g1', 'OceanHuedClam', { hydroDmg_: 0.466, hp: 478, eleMas: 35 }),
      art('g2', 'OceanHuedClam', {
        hydroDmg_: 0.466,
        hp_: 0.1,
        critDMG_: 0.1,
      }),
      art('g3', 'HeartOfDepth', {
        hydroDmg_: 0.466,
        critDMG_: 0.124,
        eleMas: 79,
        hp_: 0.099,
      }),
    ],
    circlet: [
      art('c1', 'OceanHuedClam', {
        critRate_: 0.311,
        hp_: 0.198,
        eleMas: 19,
      }),
      art('c2', 'OceanHuedClam', {
        hp_: 0.466,
        critRate_: 0.06,
        enerRech_: 0.15,
      }),
      art('c3', 'OceanHuedClam', {
        critRate_: 0.311,
        hp: 299,
        critDMG_: 0.155,
        eleMas: 56,
      }),
    ],
  },
}

/** Max 5* substat roll values; a flower substat pool (no flat hp main dup). */
const SUB_ROLL: DynStat = {
  hp_: 0.0583,
  eleMas: 23.31,
  enerRech_: 0.0648,
  critRate_: 0.0389,
  critDMG_: 0.0777,
}
const SUB_POOL: DynMinMax = Object.fromEntries(
  Object.entries(SUB_ROLL).map(([k, r]) => [k, { min: 0, max: 6 * r }])
)
const TOTAL_ROLLS = 9

const flowerProfiles: FutureArtifactProfile[] = (
  ['HeartOfDepth', 'OceanHuedClam'] as const
).map((set) => ({
  fixed: { hp: 4780, [set]: 1 },
  substats: SUB_POOL,
  maxSubstats: 4,
  rollBudget: { rollSize: SUB_ROLL, totalRolls: TOTAL_ROLLS },
}))

const OTHERS = allArtifactSlotKeys.filter((s) => s !== 'flower')
const combosR = cartesian(...OTHERS.map((s) => exampleArts.values[s]))
const fullCandidates = combosR.map((combo) => combo.map((a) => a.id))

function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

/** A random legal artifact from `profile`: exactly 4 substats, one mandatory
 * roll each, whole-roll extras within the budget, realistic roll quality. */
function sampleLegal(
  profile: FutureArtifactProfile,
  rng: () => number
): ArtifactBuildData {
  const values: DynStat = { ...profile.fixed }
  const keys = Object.keys(profile.substats)
  const picked: string[] = []
  while (picked.length < Math.min(4, keys.length)) {
    const k = keys[Math.floor(rng() * keys.length)]
    if (!picked.includes(k)) picked.push(k)
  }
  let extra = TOTAL_ROLLS - picked.length
  for (const k of picked) {
    const rolls = 1 + Math.floor(Math.min(5, extra) * rng())
    extra -= rolls - 1
    values[k] = rolls * SUB_ROLL[k] * (0.7 + 0.3 * rng())
  }
  return { id: 'x', values }
}

function setup(nodes: OptNode[], mins: number[]): PartialBuildsSetup {
  return {
    profiles: { flower: flowerProfiles },
    nodes,
    mins,
    arts: exampleArts,
  }
}

/** Best feasible current build value: the top-1 threshold θ. */
function bruteThreshold(nodes: OptNode[], mins: number[]): number {
  const compute = precompute(nodes, exampleArts.base, (f) => f.path[1], 5)
  let best = -Infinity
  for (const build of cartesian(
    ...allArtifactSlotKeys.map((s) => exampleArts.values[s])
  )) {
    const out = compute(build as any)
    if (nodes.every((_, j) => j === 0 || out[j] >= mins[j]) && out[0] > best)
      best = out[0]
  }
  return best
}

function run(nodes: OptNode[], mins: number[], threshold: number) {
  return tightenPartialBuilds(
    setup(nodes, mins),
    { flower: fullCandidates },
    threshold
  ).flower!
}

/** value/feasibility of x + combo under `nodes`/`mins`. */
function evaluator(nodes: OptNode[], mins: number[]) {
  const compute = precompute(nodes, exampleArts.base, (f) => f.path[1], 5)
  return (x: ArtifactBuildData, combo: ArtifactBuildData[]) => {
    const out = compute([x, ...combo] as any)
    const feasible = nodes.every((_, j) => j === 0 || out[j] >= mins[j])
    return { value: out[0], feasible }
  }
}

const memberCombos = (p: SolverPartialBuild) => {
  const byId = new Map(
    OTHERS.flatMap((s) => exampleArts.values[s].map((a) => [a.id, a] as const))
  )
  return p.artifactIds.map((id) => byId.get(id)!)
}

/**
 * Witness proof check: rebuild the witness artifact, then (a) the reported
 * value is the member's exact value there, (b) legality: substats within the
 * pool ranges, at most `maxSubstats` of them, within the roll budget, and
 * (c) for `margin > 0`, the member beats every feasible combo of the full
 * product at the witness.
 */
function checkWitnesses(
  members: SolverPartialBuild[],
  nodes: OptNode[],
  mins: number[]
) {
  const evalAt = evaluator(nodes, mins)
  for (const m of members) {
    expect(m.witness).toBeDefined()
    const { artifact, value, margin } = m.witness!
    const x: ArtifactBuildData = { id: 'w', values: artifact }

    // legality against some profile
    const legal = flowerProfiles.some((profile) => {
      const subs = Object.entries(artifact).filter(
        ([k, v]) => !(k in profile.fixed) && v !== 0
      )
      if (Object.entries(profile.fixed).some(([k, v]) => artifact[k] !== v))
        return false
      if (subs.some(([k]) => !(k in profile.substats))) return false
      if (subs.length > (profile.maxSubstats ?? 4)) return false
      if (
        subs.some(
          ([k, v]) =>
            v < profile.substats[k].min - 1e-9 ||
            v > profile.substats[k].max + 1e-9
        )
      )
        return false
      // budget: the 4 - subs.length junk substats eat a mandatory roll each
      const rolls = subs.reduce((a, [k, v]) => a + v / SUB_ROLL[k], 0)
      if (rolls + (4 - subs.length) > TOTAL_ROLLS + 1e-9) return false
      // budgeted substats must be whole numbers of rolls
      return subs.every(([k, v]) => {
        const r = v / SUB_ROLL[k]
        return Math.abs(r - Math.round(r)) < 1e-6
      })
    })
    expect(legal).toBe(true)

    const own = evalAt(x, memberCombos(m))
    expect(own.feasible).toBe(true)
    expect(own.value).toBeCloseTo(value, 9)

    if (margin > 0) {
      // strict proof: best choice among the *entire* product at the witness
      for (const combo of combosR) {
        const r = evalAt(x, combo)
        if (r.feasible)
          expect(value).toBeGreaterThanOrEqual(r.value - 1e-9 * value)
      }
    }
  }
}

/** Coverage: `max(θ, best over P)` answers a top-1 re-solve for legal x. */
function checkGuarantee(
  members: SolverPartialBuild[],
  nodes: OptNode[],
  mins: number[],
  threshold: number,
  seed = 3,
  count = 40
) {
  const evalAt = evaluator(nodes, mins)
  const rng = makeRng(seed)
  const pCombos = members.map(memberCombos)
  for (let i = 0; i < count; i++) {
    const profile = flowerProfiles[i % flowerProfiles.length]
    const x = sampleLegal(profile, rng)
    let bestP = threshold
    for (const c of pCombos) {
      const r = evalAt(x, c)
      if (r.feasible && r.value > bestP) bestP = r.value
    }
    for (const c of combosR) {
      const r = evalAt(x, c)
      if (r.feasible)
        expect(bestP).toBeGreaterThanOrEqual(r.value - 1e-9 * Math.abs(r.value))
    }
  }
}

describe('tightenPartialBuilds (exhaustive candidates)', () => {
  test('linear target: a single partial build survives, strictly witnessed', () => {
    const threshold = bruteThreshold([hp], [-Infinity])
    const members = run([hp], [-Infinity], threshold)
    expect(members.length).toBe(1)
    expect(members[0].witness!.margin).toBeGreaterThan(0)
    checkWitnesses(members, [hp], [-Infinity])
    checkGuarantee(members, [hp], [-Infinity], threshold)
  })

  test('composite target: tight, witnessed, and the 4pc partial appears', () => {
    const nodes = [target]
    const mins = [-Infinity]
    const threshold = bruteThreshold(nodes, mins)
    const members = run(nodes, mins, threshold)

    expect(members.length).toBeLessThan(combosR.length)
    checkWitnesses(members, nodes, mins)
    checkGuarantee(members, nodes, mins, threshold)

    // The 3-HoD partial only matters with a future HoD flower (4pc); its
    // survival, witnessed by a HoD artifact, is the point of the feature.
    const hod = members.find((m) =>
      ['p3', 's3', 'g3'].every((id) => m.artifactIds.includes(id))
    )
    expect(hod).toBeDefined()
    expect(hod!.witness!.artifact['HeartOfDepth']).toBe(1)
    expect(hod!.witness!.margin).toBeGreaterThan(0)
  })

  test('with an ER constraint', () => {
    const nodes = [target, er]
    const mins = [-Infinity, 1.35]
    const threshold = bruteThreshold(nodes, mins)
    const members = run(nodes, mins, threshold)
    expect(members.length).toBeLessThan(combosR.length)
    checkWitnesses(members, nodes, mins)
    checkGuarantee(members, nodes, mins, threshold)
  })

  test('profiles differing only in unread keys are deduped, same result', () => {
    const nodes = [target]
    const mins = [-Infinity]
    // Adventurer is read by no formula: same space as the OceanHuedClam
    // profile (both have HeartOfDepth: 0), so it must collapse into it.
    const extra: FutureArtifactProfile = {
      ...flowerProfiles[1],
      fixed: { hp: 4780, Adventurer: 1 },
    }
    const readKeys = [
      'hp',
      'hp_',
      'eleMas',
      'enerRech_',
      'critRate_',
      'critDMG_',
      'hydroDmg_',
      'HeartOfDepth',
    ]
    expect(dedupeProfiles([...flowerProfiles, extra], readKeys).length).toBe(2)
    expect(dedupeProfiles(flowerProfiles, readKeys).length).toBe(2)

    const threshold = bruteThreshold(nodes, mins)
    const base = run(nodes, mins, threshold)
    const withDup = tightenPartialBuilds(
      {
        ...setup(nodes, mins),
        profiles: { flower: [...flowerProfiles, extra] },
      },
      { flower: fullCandidates },
      threshold
    ).flower!
    expect(withDup).toEqual(base)
  })

  test('reported margins are consistent with the returned set', () => {
    const nodes = [target]
    const mins = [-Infinity]
    const threshold = bruteThreshold(nodes, mins)
    const members = run(nodes, mins, threshold)
    const evalAt = evaluator(nodes, mins)
    for (const m of members) {
      const { artifact, value, margin } = m.witness!
      if (margin <= 0) continue
      const x: ArtifactBuildData = { id: 'w', values: artifact }
      // margin was measured against the live set during the winnow, a
      // superset of the survivors: re-measuring against the final set can
      // only widen it
      let bestAlt = -Infinity
      for (const other of members) {
        if (other === m) continue
        const r = evalAt(x, memberCombos(other))
        if (r.feasible && r.value > bestAlt) bestAlt = r.value
      }
      const recomputed = value - (bestAlt === -Infinity ? threshold : bestAlt)
      expect(recomputed).toBeGreaterThanOrEqual(margin - 1e-9 * value)
    }
  })
})
