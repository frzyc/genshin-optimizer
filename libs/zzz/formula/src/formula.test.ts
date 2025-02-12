import type { DebugMeta } from '@genshin-optimizer/pando/engine'
import {
  compileTagMapValues,
  read,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type { ModificationKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
  type CharacterKey,
} from '@genshin-optimizer/zzz/consts'
import { fail } from 'assert'
import {
  charTagMapNodeEntries,
  discTagMapNodeEntries,
  formulas,
  wengineTagMapNodeEntries,
  withMember,
} from '.'
import { Calculator } from './calculator'
import { data, keys, values } from './data'
import {
  convert,
  enemy,
  enemyDebuff,
  enemyTag,
  own,
  ownBuff,
  ownTag,
  tagStr,
  type TagMapNodeEntries,
} from './data/util'

setDebugMode(true)
// This is generally unnecessary, but without it, some tags in `DebugCalculator` will be missing
Object.assign(values, compileTagMapValues(keys, data))

describe('character test', () => {
  it.each([
    [1, 0, 0, 95, 49, 603, 118, 94, 93],
    [10, 0, 0, 143.807, 109.1938, 1339.5834, 118, 94, 93],
    [10, 1, 0, 177.807, 143.1938, 1753.5834, 118, 94, 93],
    [20, 2, 0, 266.037, 244.0758, 2986.0094, 118, 94, 93],
    [60, 5, 0, 583.957, 612.6038, 7500.7134, 118, 94, 93],
    [60, 5, 3, 608.957, 612.6038, 7500.7134, 130, 94, 93],
    [60, 5, 6, 658.957, 612.6038, 7500.7134, 136, 94, 93],
  ])(
    'Calculate character base stats for lvl %i, promo %i, core %i',
    (lvl, promotion, core, atk, def, hp, impact, anomMas, anomProf) => {
      const charKey: CharacterKey = 'Anby'
      const data: TagMapNodeEntries = [
        ...withMember(
          'Anby',
          ...charTagMapNodeEntries({
            level: lvl,
            promotion,
            key: charKey,
            mindscape: 0,
            basic: 0,
            dodge: 0,
            special: 0,
            assist: 0,
            chain: 0,
            core,
          })
        ),
      ]
      const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

      const anby = convert(ownTag, { et: 'own', src: 'Anby' })
      expect(calc.compute(anby.final.atk).val).toBeCloseTo(atk)
      expect(calc.compute(anby.final.def).val).toBeCloseTo(def)
      expect(calc.compute(anby.final.hp).val).toBeCloseTo(hp)
      expect(calc.compute(anby.final.impact).val).toBeCloseTo(impact)
      expect(calc.compute(anby.final.anomMas).val).toBeCloseTo(anomMas)
      expect(calc.compute(anby.final.anomProf).val).toBeCloseTo(anomProf)
    }
  )
})

describe('wengine test', () => {
  it.each([
    [0, 0, 40, 0.2],
    [10, 0, 102.728, 0.2],
    [10, 1, 138.416, 0.26],
    [60, 5, 594.8, 0.5],
  ])(
    'Calculate wengine base stats for lvl %i, mod %i',
    (lvl, modification, atk, substat) => {
      const wengKey: WengineKey = 'SteamOven'
      const data: TagMapNodeEntries = [
        ...withMember(
          'Anby',
          ...charTagMapNodeEntries({
            level: 1,
            promotion: 0,
            key: 'Anby',
            mindscape: 0,
            basic: 0,
            dodge: 0,
            special: 0,
            assist: 0,
            chain: 0,
            core: 0,
          }),
          ...wengineTagMapNodeEntries(
            wengKey,
            lvl,
            modification as ModificationKey,
            1
          )
        ),
      ]
      const calc = new Calculator(keys, values, compileTagMapValues(keys, data))

      const wengine0 = convert(ownTag, {
        et: 'own',
        src: 'Anby',
        sheet: 'wengine',
      })
      expect(calc.compute(wengine0.base.atk).val).toBeCloseTo(atk)
      expect(calc.compute(wengine0.initial.enerRegen_).val).toBeCloseTo(substat)
    }
  )
})

describe('char+wengine test', () => {
  it('calculate base stats', () => {
    const data: TagMapNodeEntries = [
      ...withMember(
        'Anby',
        ...charTagMapNodeEntries({
          level: 1,
          promotion: 0,
          key: 'Anby',
          mindscape: 0,
          basic: 0,
          dodge: 0,
          special: 0,
          assist: 0,
          chain: 0,
          core: 0,
        }),
        ...wengineTagMapNodeEntries('SteamOven', 0, 0, 1)
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.atk).val).toBeCloseTo(135)
  })
  it('calculate base+initial+combat stats', () => {
    const data: TagMapNodeEntries = [
      ...withMember(
        'Anby',
        ...charTagMapNodeEntries({
          level: 60,
          promotion: 5,
          key: 'Anby',
          mindscape: 0,
          basic: 0,
          dodge: 0,
          special: 0,
          assist: 0,
          chain: 0,
          core: 6,
        }),
        ...wengineTagMapNodeEntries('VortexRevolver', 60, 5, 1),
        ownBuff.initial.atk.add(25),
        ownBuff.combat.atk.add(100),
        ownBuff.combat.atk_.add(0.08)
      ),
    ]
    const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.base.atk).val).toBeCloseTo(1134.797)
    expect(calc.compute(anby.final.atk).val).toBeCloseTo(1597.696912)
  })
  it.each([
    [false, 'avg', 4464.062, 14880.20606],
    [false, 'crit', 5261.586, 14880.20606],
    [false, 'nonCrit', 2071.49, 14880.20606],
    [true, 'avg', 6696.093, 22320.30908],
    [true, 'crit', 7892.378, 22320.30908],
    [true, 'nonCrit', 3107.236, 22320.30908],
  ])(
    'calculate standard+anomaly damage, stunned: %o, critMode: %s',
    (isStunned, critMode, expectedStandardDmg, expectedAnomalyDmg) => {
      const data: TagMapNodeEntries = [
        ...withMember(
          'Anby',
          ...charTagMapNodeEntries({
            level: 60,
            promotion: 5,
            key: 'Anby',
            mindscape: 0,
            basic: 0,
            dodge: 0,
            special: 0,
            assist: 0,
            chain: 0,
            core: 6,
          }),
          ...wengineTagMapNodeEntries('VortexRevolver', 60, 5, 1),

          ownBuff.initial.atk.add(25),
          ownBuff.combat.atk.add(100),
          ownBuff.combat.atk_.add(0.08),
          ownBuff.initial.crit_.add(0.7),
          ownBuff.initial.crit_dmg_.add(1.04),
          ownBuff.initial.dmg_.electric.add(0.4),
          ownBuff.initial.pen_.add(0.05),
          ownBuff.initial.pen.add(90),
          ownBuff.initial.resIgn_.add(0.02),
          ownBuff.initial.anomProf.add(338)
        ),
        own.common.critMode.add(critMode),
        enemy.common.def.add(635),
        enemy.common.res_.electric.add(0.1),
        enemy.common.isStunned.add(isStunned ? 1 : 0),
        enemyDebuff.common.resRed_.electric.add(0.15),
        enemyDebuff.common.dmgInc_.add(0.1),
        enemyDebuff.common.dmgRed_.add(0.15),
        enemyDebuff.common.stun_.add(1.5),
      ]
      const calc = new Calculator(keys, values, compileTagMapValues(keys, data))
      const anby = convert(ownTag, { et: 'own', src: 'Anby' })
      expect(calc.compute(anby.base.atk).val).toBeCloseTo(1134.797)
      expect(calc.compute(anby.final.atk).val).toBeCloseTo(1597.696912)

      // Debug printing
      function filterDebug(debug: DebugMeta) {
        for (let i = debug.deps.length - 1; i >= 0; i--) {
          const readSeq = debug.deps[i].toJSON().readSeq
          if (readSeq?.includes('{ wengine } : { wengine }')) {
            debug.deps.splice(i, 1)
            continue
          }
          debug.deps[i] = filterDebug(debug.deps[i])
        }
        return debug
      }
      const debug = calc
        .withTag({ src: 'Anby', dst: 'Anby' })
        .toDebug()
        .compute(read(formulas.Anby.standardDmgInst.tag, undefined))
      const filtered = filterDebug(debug.meta)
      console.log(JSON.stringify(filtered, undefined, 2))

      expect(
        calc
          .withTag({ src: 'Anby', dst: 'Anby' })
          .compute(read(formulas.Anby.standardDmgInst.tag, undefined)).val
      ).toBeCloseTo(expectedStandardDmg)

      const debug2 = calc
        .withTag({ src: 'Anby', dst: 'Anby' })
        .toDebug()
        .compute(read(formulas.Anby.anomalyDmgInst.tag, undefined))
      const filtered2 = filterDebug(debug2.meta)
      console.log(JSON.stringify(filtered2, undefined, 2))
      expect(
        calc
          .withTag({ src: 'Anby', dst: 'Anby' })
          .compute(read(formulas.Anby.anomalyDmgInst.tag, undefined)).val
      ).toBeCloseTo(expectedAnomalyDmg)
    }
  )
})

describe('disc2p test', () => {
  it('calculate initial stats', () => {
    const data: TagMapNodeEntries = [
      ...withMember(
        'Anby',
        ...charTagMapNodeEntries({
          level: 1,
          promotion: 0,
          key: 'Anby',
          mindscape: 0,
          basic: 0,
          dodge: 0,
          special: 0,
          assist: 0,
          chain: 0,
          core: 0,
        }),
        ...discTagMapNodeEntries({ atk: 100 }, { BranchBladeSong: 2 })
      ),
    ]
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    console.log(
      JSON.stringify(calc.toDebug().compute(anby.final.atk), undefined, 2)
    )
    expect(calc.compute(anby.final.atk).val).toBeCloseTo(195)
    expect(calc.compute(anby.final.crit_dmg_).val).toBeCloseTo(0.66)
  })
})

describe('sheet', () => {
  test('buff entries', () => {
    const sheets = new Set([
      ...allCharacterKeys,
      ...allWengineKeys,
      ...allDiscSetKeys,
    ])
    for (const { tag } of data) {
      if (tag.et && tag.qt && tag.q) {
        switch (tag.et) {
          case 'notOwnBuff':
          case 'teamBuff': {
            const { sheet } = (ownTag as any)[tag.qt][tag.q]
            // Buff entries are for agg queries inside a sheet
            if (sheet === 'agg' && sheets.has(tag.sheet as any)) continue
            fail(`Ill-form entry (${tagStr(tag)}) for sheet ${sheet}`)
          }
          // eslint-disable-next-line no-fallthrough
          case 'enemyDeBuff': {
            const { sheet } = (enemyTag as any)[tag.qt][tag.q]
            if (sheet === 'agg' && sheets.has(tag.sheet as any)) continue
            if (sheet === tag.sheet) continue
            fail(`Ill-form entry (${tagStr(tag)}) for sheet ${sheet}`)
          }
          // eslint-disable-next-line no-fallthrough
          case 'own': {
            const desc = (ownTag as any)[tag.qt]?.[tag.q]
            if (!desc) continue
            const { sheet } = desc
            if (!sheet) continue
            if (sheet === 'iso' || sheet === 'agg' || sheet === tag.sheet)
              continue
            fail(`Illform entry (${tagStr(tag)}) for sheet ${sheet}`)
          }
          // eslint-disable-next-line no-fallthrough
          case 'enemy': {
            const desc = (enemyTag as any)[tag.qt]?.[tag.q]
            if (!desc) continue
            const { sheet } = desc
            if (!sheet) continue
            if (sheet === 'agg' || sheet === tag.sheet) continue
            fail(`Illform entry (${tagStr(tag)}) for sheet ${sheet}`)
          }
        }
      }
    }
  })
})
