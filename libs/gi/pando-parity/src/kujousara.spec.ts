/**
 * Kujou Sara WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List conds (`allListConditionals`): Pando fixture `value` is the 1-based index
 * into the list (0 = unset). WR uses the state string. Examples:
 *   `['TenguJuuraiAmbush']` → Pando `value: 1` ↔ WR `'TenguJuuraiAmbush'`
 *   `['c6']` → Pando `value: 1` ↔ WR `'c6'`
 *
 * Crowfeather ATK is dest-gated via `destIsActive` (WR activeCharKey).
 * Solo computeUIData does not apply WR teamBuff.total.atk; Pando teamBuff does.
 * Ambush on: assertFinals skips `atk`; Pando `atk` delta is checked instead.
 *
 *   nx test gi-pando-parity -- kujousara.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  DEFAULT_FINALS,
  type ParityFixture,
  pandoListingNames,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'KujouSara',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusWarbow',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'KujouSara',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const AMBUSH_LIST_INDEX = 1

describe('KujouSara WR ↔ Pando finals', () => {
  test.each([false, true])('aligned finals (ambush=%s)', (ambush) => {
    const fixture: ParityFixture = ambush
      ? {
          ...FIXTURE,
          wrConditionals: {
            KujouSara: { TenguJuuraiAmbush: 'TenguJuuraiAmbush' },
          },
          pandoConditionals: [
            {
              sheet: 'KujouSara',
              src: '0',
              dst: null,
              name: 'TenguJuuraiAmbush',
              value: AMBUSH_LIST_INDEX,
            },
          ],
        }
      : FIXTURE

    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.total.atk is hidden in solo UIData; Pando applies it.
    assertFinals(
      wr,
      pando,
      ambush ? DEFAULT_FINALS.filter((s) => s !== 'atk') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of [
      'charged_aimed',
      'charged_aimedCharged',
      'skill',
      'burst_titanbreaker',
      'burst_stormcluster',
      'c2',
      'a4_energyRegen',
    ]) {
      expect(names, name).toContain(name)
    }

    if (ambush) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
