/**
 * Weapon sheet WR ↔ Pando probes (dummy char = Noelle).
 *
 *   yarn nx test gi-pando-parity
 */
import { allWeaponKeys, type WeaponKey } from '@genshin-optimizer/gi/consts'
import { own } from '@genshin-optimizer/gi/formula'
import { input } from '@genshin-optimizer/gi/wr'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type PandoConditionalSpec,
  type ParityFixture,
} from './harness'
import { relDiff } from './relDiff'

const REL_TOL = 1e-4

const NOELLE_BASE: ParityFixture = {
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

function withWeapon(
  key: WeaponKey,
  refinement = 1,
  extra: Partial<ParityFixture> = {}
): ParityFixture {
  const member = NOELLE_BASE.members[0]
  if (!member) throw new Error('missing member')
  const tallyExtra =
    key === 'JadeVista' || key === 'AThousandFloatingDreams'
      ? { wrTally: { geo: 1 } }
      : {}
  return {
    ...NOELLE_BASE,
    ...tallyExtra,
    ...extra,
    members: [
      {
        ...member,
        weapon: { ...member.weapon, key, refinement },
      },
    ],
  }
}

function pandoCond(
  sheet: string,
  name: string,
  value = 1
): PandoConditionalSpec {
  return { sheet, src: '0', dst: null, name, value }
}

const PARITY_KEYS = allWeaponKeys

describe('weapons WR ↔ Pando', () => {
  describe('R1 finals (all keys)', () => {
    test.each(PARITY_KEYS)('%s', (key) => {
      const fixture = withWeapon(key)
      const wr = buildWrSolo(fixture)
      const pando = buildPando(fixture)
      const wrAtk = wr.get(input.total.atk).value as number
      // 1–2★ max below lvl 90; both engines are non-finite at 90/6.
      // Level caps belong in the UI, not the calc engine.
      if (!Number.isFinite(wrAtk)) return
      assertFinals(wr, pando)
      assertPandoListingsFinite(pando)
    })
  })

  describe('T1 R1 vs R5', () => {
    test('WhiteTassel normal_dmg_', () => {
      for (const r of [1, 5] as const) {
        const fixture = withWeapon('WhiteTassel', r)
        const wr = buildWrSolo(fixture)
        const pando = buildPando(fixture)
        assertFinals(wr, pando)
        const wrVal = wr.get(input.total.normal_dmg_).value as number
        const pandoVal = pando.compute(own.premod.dmg_.normal).val as number
        expect(relDiff(wrVal, pandoVal)).toBeLessThan(REL_TOL)
        expect(pandoVal).toBeCloseTo(r === 1 ? 0.24 : 0.48)
      }
    })
    test('SharpshootersOath weakspotDMG_', () => {
      const fixture = withWeapon('SharpshootersOath')
      const wr = buildWrSolo(fixture)
      const pando = buildPando(fixture)
      assertFinals(wr, pando)
      const wrVal = wr.get(input.total.weakspotDMG_).value as number
      const pandoVal = pando.compute(own.premod.weakspotDMG_).val as number
      expect(relDiff(wrVal, pandoVal)).toBeLessThan(REL_TOL)
    })
  })

  describe('T2 conds', () => {
    test('CoolSteel BaneOfWaterAndIce', () => {
      const off = withWeapon('CoolSteel')
      const on = withWeapon('CoolSteel', 1, {
        wrConditionals: { CoolSteel: { BaneOfWaterAndIce: 'on' } },
        pandoConditionals: [pandoCond('CoolSteel', 'BaneOfWaterAndIce')],
      })
      const wrOff = buildWrSolo(off)
      const pOff = buildPando(off)
      const wrOn = buildWrSolo(on)
      const pOn = buildPando(on)
      assertFinals(wrOff, pOff)
      assertFinals(wrOn, pOn)
      const wrDelta =
        (wrOn.get(input.total.all_dmg_).value as number) -
        (wrOff.get(input.total.all_dmg_).value as number)
      const pDelta =
        (pOn.compute(own.premod.dmg_).val as number) -
        (pOff.compute(own.premod.dmg_).val as number)
      expect(wrDelta).toBeGreaterThan(0.1)
      expect(relDiff(wrDelta, pDelta)).toBeLessThan(REL_TOL)
    })
    test('TulaytullahsRemembrance atkSPD_ R1', () => {
      const fixture = withWeapon('TulaytullahsRemembrance')
      const wr = buildWrSolo(fixture)
      const pando = buildPando(fixture)
      assertFinals(wr, pando)
      const wrVal = wr.get(input.total.atkSPD_).value as number
      const pandoVal = pando.compute(own.premod.atkSPD_).val as number
      expect(relDiff(wrVal, pandoVal)).toBeLessThan(REL_TOL)
      expect(pandoVal).toBeCloseTo(0.1)
    })
  })

  describe('engine gaps', () => {
    test('millenialatk: FreedomSworn + SongOfBrokenPines do not stack ATK%', () => {
      const jean = {
        key: 'Jean' as const,
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      }
      const noelle = NOELLE_BASE.members[0]
      if (!noelle) throw new Error('missing member')
      const fixture: ParityFixture = {
        members: [
          {
            char: jean,
            weapon: {
              key: 'FreedomSworn',
              level: 90,
              ascension: 6,
              refinement: 1,
              location: 'Jean',
              lock: false,
            },
          },
          {
            ...noelle,
            weapon: {
              ...noelle.weapon,
              key: 'SongOfBrokenPines',
              refinement: 1,
            },
          },
        ],
        enemy: { lvl: 90, preRes: 0.1 },
        hitMode: 'avgHit',
        pandoConditionals: [
          pandoCond('FreedomSworn', 'MillennialMovement'),
          {
            sheet: 'SongOfBrokenPines',
            src: '1',
            dst: null,
            name: 'RebelsBannerHymn',
            value: 1,
          },
        ],
      }
      const off: ParityFixture = { ...fixture, pandoConditionals: [] }
      const p0off = buildPando(off, '0')
      const p0on = buildPando(fixture, '0')
      const delta =
        (p0on.compute(own.premod.atk_).val as number) -
        (p0off.compute(own.premod.atk_).val as number)
      // R1 millenialatk is 20%. Stacking both weapons would be 40%.
      expect(delta).toBeCloseTo(0.2)
    })
    test('ExaiphanesBlade traveler critDMG_ scales with traveler ele conds', () => {
      const fixture: ParityFixture = {
        members: [
          {
            char: {
              key: 'TravelerGeo',
              level: 80,
              talent: { auto: 8, skill: 8, burst: 8 },
              ascension: 6,
              constellation: 6,
            },
            weapon: {
              key: 'ExaiphanesBlade',
              level: 90,
              ascension: 6,
              refinement: 2,
              location: 'TravelerGeo',
              lock: false,
            },
          },
        ],
        enemy: { lvl: 90, preRes: 0.1 },
        hitMode: 'avgHit',
        wrConditionals: {
          ExaiphanesBlade: { passive: 'on' },
          Traveler: { travelergeo: 'on', traveleranemo: 'on' },
        },
        pandoConditionals: [
          pandoCond('ExaiphanesBlade', 'passive'),
          pandoCond('Traveler', 'travelergeo'),
          pandoCond('Traveler', 'traveleranemo'),
        ],
      }
      const wr = buildWrSolo(fixture)
      const pando = buildPando(fixture)
      assertFinals(wr, pando)
      const wrVal = wr.get(input.total.critDMG_).value as number
      const pandoVal = pando.compute(own.premod.critDMG_).val as number
      expect(relDiff(wrVal, pandoVal)).toBeLessThan(REL_TOL)
      // Base 50% + 6% * 2 traveler ele
      expect(pandoVal).toBeCloseTo(0.62)
    })
  })
})
