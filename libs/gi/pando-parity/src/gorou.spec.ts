/**
 * Gorou WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List conds (`allListConditionals`): Pando fixture `value` is the 1-based index
 * into the list (0 = unset). WR uses the state string. Examples:
 *   `['inField']` → Pando `value: 1` ↔ WR `'inField'`
 *   `['afterBurst']` → Pando `value: 1` ↔ WR `'afterBurst'`
 *   `['afterSkillBurst']` → Pando `value: 1` ↔ WR `'afterSkillBurst'`
 *
 * Skill banner (inField) is dest-gated via `destIsActive` (WR activeCharKey).
 * A1 afterBurst is whole-team `teamBuff.premod.def_` (not dest-gated).
 * Solo computeUIData does not apply WR teamBuff; Pando teamBuff does apply.
 * afterBurst on: assertFinals skips `def`; Pando `def_` delta is checked instead.
 *
 *   nx test gi-pando-parity -- gorou.spec.ts
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
        key: 'Gorou',
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
        location: 'Gorou',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const AFTER_BURST_LIST_INDEX = 1

describe('Gorou WR ↔ Pando finals', () => {
  test.each([false, true])('aligned finals (afterBurst=%s)', (afterBurst) => {
    const fixture: ParityFixture = afterBurst
      ? {
          ...FIXTURE,
          wrConditionals: { Gorou: { afterBurst: 'afterBurst' } },
          pandoConditionals: [
            {
              sheet: 'Gorou',
              src: '0',
              dst: null,
              name: 'afterBurst',
              value: AFTER_BURST_LIST_INDEX,
            },
          ],
        }
      : FIXTURE

    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.def_ is hidden in solo UIData; Pando applies it.
    assertFinals(
      wr,
      pando,
      afterBurst ? DEFAULT_FINALS.filter((s) => s !== 'def') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of [
      'charged_aimed',
      'charged_aimedCharged',
      'skill',
      'burst',
      'crystalCollapse',
      'c4_heal',
    ]) {
      expect(names, name).toContain(name)
    }

    if (afterBurst) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.def_).val as number).toBeCloseTo(
        (off.compute(own.final.def_).val as number) + 0.25
      )
    }
  })
})
