import { prettify } from '@genshin-optimizer/common/util'
import {
  compileTagMapValues,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type {
  DiscMainStatKey,
  DiscSetKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import { data, keys, values } from '..'
import {
  charTagMapNodeEntries,
  conditionals,
  discTagMapNodeEntries,
  teamData,
  withMember,
} from '../..'
import { Calculator } from '../../calculator'
import type { Read } from '../util'
import {
  conditionalEntries,
  convert,
  enemy,
  enemyDebuff,
  own,
  ownBuff,
  ownTag,
  type TagMapNodeEntries,
} from '../util'

setDebugMode(true)
// This is generally unnecessary, but without it, some tags in `DebugCalculator` will be missing
Object.assign(values, compileTagMapValues(keys, data))

function testCharacterData(
  setKey: DiscSetKey,
  discStats: Partial<Record<DiscMainStatKey | DiscSubStatKey, number>> = {},
  otherCharData: TagMapNodeEntries = []
) {
  const data: TagMapNodeEntries = [
    ...teamData(['Anby']),
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
      ...discTagMapNodeEntries(discStats, {
        [setKey]: 4,
      }),
      ...otherCharData
    ),
    own.common.critMode.add('avg'),
    enemy.common.def.add(953),
    enemy.common.res_.electric.add(0.1),
    enemy.common.isStunned.add(0),
    enemyDebuff.common.resRed_.electric.add(0.15),
    enemyDebuff.common.dmgInc_.add(0.1),
    enemyDebuff.common.dmgRed_.add(0.15),
    enemyDebuff.common.stun_.add(1.5),
  ]
  return data
}
function cond(setKey: DiscSetKey, name: string, value: number) {
  return conditionalEntries(setKey, 'Anby', null)(name, value)
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printDebug(calc: Calculator, read: Read) {
  console.log(prettify(calc.toDebug().compute(read)))
}
describe('Disc sheets test', () => {
  it('AstralVoice 4p', () => {
    const data = testCharacterData('AstralVoice')
    data.push(cond('AstralVoice', conditionals.AstralVoice.astral.name, 3))
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    // printDebug(calc, anby.final.dmg_)
    expect(calc.compute(anby.final.dmg_).val).toBeCloseTo(0.24)
  })
  it('BranchBladeSong 4p', () => {
    const data = testCharacterData('BranchBladeSong', undefined, [
      ownBuff.initial.anomMas.add(25),
    ])
    data.push(
      cond(
        'BranchBladeSong',
        conditionals.BranchBladeSong.apply_or_trigger.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.anomMas).val).toBeCloseTo(119) // should be greater than 115
    expect(calc.compute(anby.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.16 + 0.3) //.16 from 2p, 3p from anommas
    // printDebug(calc, anby.final.crit_)
    expect(calc.compute(anby.final.crit_).val).toBeCloseTo(0.05 + 0.12) //.12 from cond
  })
  it('ChaosJazz 4p', () => {
    const data = testCharacterData('ChaosJazz')
    data.push(cond('ChaosJazz', conditionals.ChaosJazz.while_off_field.name, 1))
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.initial.anomProf).val).toBeCloseTo(93 + 30) // 2p passive
    expect(calc.compute(anby.final.dmg_.fire).val).toBeCloseTo(0.15)
    expect(calc.compute(anby.final.dmg_.electric).val).toBeCloseTo(0.15)
    expect(calc.compute(anby.final.dmg_.special[0]).val).toBeCloseTo(0.2)
    expect(calc.compute(anby.final.dmg_.assist[0]).val).toBeCloseTo(0.2)
  })
  it('ChaoticMetal 4p', () => {
    const data = testCharacterData('ChaoticMetal')
    data.push(
      cond('ChaoticMetal', conditionals.ChaoticMetal.trigger_corruption.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.dmg_.ether).val).toBeCloseTo(0.1) // 2p passive
    expect(calc.compute(anby.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.2 * 2)
  })
  it('FangedMetal 4p', () => {
    const data = testCharacterData('FangedMetal')
    data.push(
      cond('FangedMetal', conditionals.FangedMetal.inflict_assault.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    printDebug(calc, anby.final.dmg_.physical)
    expect(calc.compute(anby.final.dmg_.physical).val).toBeCloseTo(0.1) // 2p passive

    expect(calc.compute(anby.final.dmg_).val).toBeCloseTo(0.35)
  })
})
