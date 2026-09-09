/**
 * Artifact batch teamC WR ↔ Pando: 0/2/4pc on Noelle dummy.
 *
 *   yarn nx test gi-pando-parity
 */
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { enemy, own } from '@genshin-optimizer/gi/formula'
import { input } from '@genshin-optimizer/gi/wr'
import {
  artSetPieces,
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type PandoConditionalSpec,
  type ParityFixture,
  readPandoArtSet,
  readPandoFinal,
  readWrArtSet,
  readWrFinal,
} from './harness'
import { relDiff } from './relDiff'

const NOELLE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Noelle',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusGreatsword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Noelle',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const KEYS = [
  'SilkenMoonsSerenade',
  'SongOfDaysPast',
  'TenacityOfTheMillelith',
  'TinyMiracle',
  'VermillionHereafter',
  'ViridescentVenerer',
] as const satisfies readonly ArtifactSetKey[]

function fixture(
  set: ArtifactSetKey,
  n: 0 | 2 | 4,
  extra: Partial<ParityFixture> = {}
): ParityFixture {
  const member = NOELLE.members[0]
  if (!member) throw new Error('missing member')
  return {
    ...NOELLE,
    ...extra,
    members: [{ ...member, arts: artSetPieces(set, n) }],
  }
}

function cond(
  sheet: ArtifactSetKey,
  name: string,
  value: number
): PandoConditionalSpec {
  return { sheet, src: '0', dst: null, name, value }
}

function assertClose(wrVal: number, pandoVal: number, label: string): void {
  expect(Number.isFinite(wrVal), `WR ${label}`).toBe(true)
  expect(Number.isFinite(pandoVal), `Pando ${label}`).toBe(true)
  expect(
    relDiff(wrVal, pandoVal),
    `${label} wr=${wrVal} pando=${pandoVal}`
  ).toBeLessThan(1e-4)
}

describe.each(KEYS)('%s 0/2/4pc', (set) => {
  test.each([0, 2, 4] as const)('%spc counts + finals', (n) => {
    const f = fixture(set, n)
    const wr = buildWrSolo(f)
    const pando = buildPando(f)
    expect(readWrArtSet(wr, set), `WR count n=${n}`).toBe(n)
    expect(readPandoArtSet(pando, set), `Pando count n=${n}`).toBe(n)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
  })
})

describe('SilkenMoonsSerenade 2pc ER', () => {
  test('2pc enerRech_ vs 0pc', () => {
    const zero = fixture('SilkenMoonsSerenade', 0)
    const two = fixture('SilkenMoonsSerenade', 2)
    const wr0 = buildWrSolo(zero)
    const wr2 = buildWrSolo(two)
    const p0 = buildPando(zero)
    const p2 = buildPando(two)
    expect(
      readWrFinal(wr2, 'enerRech_') - readWrFinal(wr0, 'enerRech_')
    ).toBeCloseTo(0.2, 4)
    expect(
      readPandoFinal(p2, 'enerRech_') - readPandoFinal(p0, 'enerRech_')
    ).toBeCloseTo(0.2, 4)
    assertFinals(wr2, p2)
  })
})

describe('SongOfDaysPast 2pc heal_', () => {
  test('2pc heal_ vs 0pc', () => {
    const zero = fixture('SongOfDaysPast', 0)
    const two = fixture('SongOfDaysPast', 2)
    const wr0 = buildWrSolo(zero)
    const wr2 = buildWrSolo(two)
    const p0 = buildPando(zero)
    const p2 = buildPando(two)
    const wrHeal0 = wr0.get(input.total.heal_).value as number
    const wrHeal2 = wr2.get(input.total.heal_).value as number
    const pHeal0 = p0.compute(own.final.heal_).val as number
    const pHeal2 = p2.compute(own.final.heal_).val as number
    expect(wrHeal2 - wrHeal0).toBeCloseTo(0.15, 4)
    expect(pHeal2 - pHeal0).toBeCloseTo(0.15, 4)
    assertClose(wrHeal2, pHeal2, 'heal_ 2pc')
    assertFinals(wr2, p2)
  })
})

describe('TenacityOfTheMillelith', () => {
  test('2pc hp_ ; 4pc skill ATK addOnce', () => {
    const zero = fixture('TenacityOfTheMillelith', 0)
    const two = fixture('TenacityOfTheMillelith', 2)
    const fourOff = fixture('TenacityOfTheMillelith', 4)
    const fourOn = fixture('TenacityOfTheMillelith', 4, {
      wrConditionals: { TenacityOfTheMillelith: { skill: 'cast' } },
      pandoConditionals: [cond('TenacityOfTheMillelith', 'skill', 1)],
    })
    const wr0 = buildWrSolo(zero)
    const wr2 = buildWrSolo(two)
    const wr4off = buildWrSolo(fourOff)
    const p0 = buildPando(zero)
    const p2 = buildPando(two)
    const p4off = buildPando(fourOff)
    const p4on = buildPando(fourOn)

    expect(readWrFinal(wr2, 'hp') / readWrFinal(wr0, 'hp')).toBeCloseTo(1.2, 3)
    expect(readPandoFinal(p2, 'hp') / readPandoFinal(p0, 'hp')).toBeCloseTo(
      1.2,
      3
    )
    assertFinals(wr2, p2)
    assertFinals(wr4off, p4off)
    expect(readWrFinal(wr4off, 'atk')).toBeCloseTo(readWrFinal(wr2, 'atk'), 2)
    expect(readPandoFinal(p4off, 'atk')).toBeCloseTo(
      readPandoFinal(p2, 'atk'),
      2
    )
    // WR teamBuff/nonStack is not visible in computeUIData; Pando addOnce is.
    expect(
      readPandoFinal(p4on, 'atk') / readPandoFinal(p4off, 'atk')
    ).toBeCloseTo(1.2, 3)
  })
})

describe('VermillionHereafter', () => {
  test('2pc atk_ ; 4pc afterBurst + stacks', () => {
    const two = fixture('VermillionHereafter', 2)
    const fourOff = fixture('VermillionHereafter', 4)
    const fourOn = fixture('VermillionHereafter', 4, {
      wrConditionals: {
        VermillionHereafter: { afterBurst: 'on', stacks: '4' },
      },
      pandoConditionals: [
        cond('VermillionHereafter', 'afterBurst', 1),
        cond('VermillionHereafter', 'stacks', 4),
      ],
    })
    const wr2 = buildWrSolo(two)
    const wr4off = buildWrSolo(fourOff)
    const wr4on = buildWrSolo(fourOn)
    const p2 = buildPando(two)
    const p4off = buildPando(fourOff)
    const p4on = buildPando(fourOn)

    assertFinals(wr2, p2)
    assertFinals(wr4off, p4off)
    expect(readWrFinal(wr4off, 'atk')).toBeCloseTo(readWrFinal(wr2, 'atk'), 2)
    expect(readPandoFinal(p4off, 'atk')).toBeCloseTo(
      readPandoFinal(p2, 'atk'),
      2
    )
    expect(readWrFinal(wr4on, 'atk')).toBeGreaterThan(
      readWrFinal(wr4off, 'atk')
    )
    expect(readPandoFinal(p4on, 'atk')).toBeGreaterThan(
      readPandoFinal(p4off, 'atk')
    )
    assertFinals(wr4on, p4on)
  })
})

describe('ViridescentVenerer', () => {
  test('2pc anemo_dmg_ ; 4pc swirl dmg_ + swirlpyro shred', () => {
    const two = fixture('ViridescentVenerer', 2)
    const fourOff = fixture('ViridescentVenerer', 4)
    const fourOn = fixture('ViridescentVenerer', 4, {
      wrConditionals: { ViridescentVenerer: { swirlpyro: 'pyro' } },
      pandoConditionals: [cond('ViridescentVenerer', 'swirlpyro', 1)],
    })
    const wr2 = buildWrSolo(two)
    const wr4off = buildWrSolo(fourOff)
    const wr4on = buildWrSolo(fourOn)
    const p2 = buildPando(two)
    const p4off = buildPando(fourOff)
    const p4on = buildPando(fourOn)

    assertFinals(wr2, p2)
    assertFinals(wr4on, p4on)

    assertClose(
      wr2.get(input.total.anemo_dmg_).value as number,
      p2.compute(own.final.dmg_.anemo).val as number,
      'anemo_dmg_ 2pc'
    )
    expect(wr2.get(input.total.anemo_dmg_).value as number).toBeCloseTo(0.15, 4)
    expect(p2.compute(own.final.dmg_.anemo).val as number).toBeCloseTo(0.15, 4)

    assertClose(
      wr4off.get(input.total.swirl_dmg_).value as number,
      p4off.compute(own.final.dmg_.swirl).val as number,
      'swirl_dmg_ 4pc'
    )
    expect(wr4off.get(input.total.swirl_dmg_).value as number).toBeCloseTo(
      0.6,
      4
    )
    assertClose(
      wr4off.get(input.total.stellarswirl_dmg_).value as number,
      p4off.compute(own.final.dmg_.stellarswirl).val as number,
      'stellarswirl_dmg_ 4pc'
    )
    expect(
      wr4off.get(input.total.stellarswirl_dmg_).value as number
    ).toBeCloseTo(0.2, 4)

    // WR nonStack enemy shred is not visible in computeUIData; Pando preRes is.
    const pResOff = p4off.compute(enemy.common.preRes.pyro).val as number
    const pResOn = p4on.compute(enemy.common.preRes.pyro).val as number
    const pHydroOn = p4on.compute(enemy.common.preRes.hydro).val as number
    expect(pResOn).toBeCloseTo(pResOff - 0.4, 4)
    expect(pHydroOn).toBeCloseTo(
      p4off.compute(enemy.common.preRes.hydro).val,
      4
    )
  })
})
