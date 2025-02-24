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
  it('AstralVoice', () => {
    const data = testCharacterData('AstralVoice')
    data.push(cond('AstralVoice', conditionals.AstralVoice.astral.name, 3))
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    // printDebug(calc, anby.final.dmg_)
    expect(calc.compute(anby.initial.atk_).val).toBeCloseTo(0.1) // 2p passive
    expect(calc.compute(anby.final.common_dmg_).val).toBeCloseTo(0.24)
  })
  it('BranchBladeSong', () => {
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
  it('ChaosJazz', () => {
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
    expect(calc.compute(anby.final.dmg_.assistSkill).val).toBeCloseTo(0.2)
  })
  it('ChaoticMetal', () => {
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
  it('FangedMetal', () => {
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
    // printDebug(calc, anby.final.dmg_.physical)
    expect(calc.compute(anby.final.dmg_.physical).val).toBeCloseTo(0.1) // 2p passive
    expect(calc.compute(anby.final.common_dmg_).val).toBeCloseTo(0.35)
  })
  it('FreedomBlues', () => {
    const data = testCharacterData('FreedomBlues')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.initial.anomProf).val).toBeCloseTo(93 + 30) // 2p passive
  })
  it('HormonePunk', () => {
    const data = testCharacterData('HormonePunk')
    data.push(
      cond('HormonePunk', conditionals.HormonePunk.entering_combat.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.initial.atk_).val).toBeCloseTo(0.1) // 2p passive
    expect(calc.compute(anby.combat.atk_).val).toBeCloseTo(0.25) //4p passive
  })
  it('InfernoMetal', () => {
    const data = testCharacterData('InfernoMetal')
    data.push(
      cond(
        'InfernoMetal',
        conditionals.InfernoMetal.hitting_burning_enemy.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.dmg_.fire).val).toBeCloseTo(0.1) // 2p passive
    expect(calc.compute(anby.final.crit_).val).toBeCloseTo(0.05 + 0.28)
  })
  it('InfernoMetal', () => {
    const data = testCharacterData('InfernoMetal')
    data.push(
      cond(
        'InfernoMetal',
        conditionals.InfernoMetal.hitting_burning_enemy.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.dmg_.fire).val).toBeCloseTo(0.1) // 2p passive
    expect(calc.compute(anby.final.crit_).val).toBeCloseTo(0.05 + 0.28)
  })
  it('PolarMetal no cond', () => {
    const data = testCharacterData('PolarMetal')

    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.dmg_.ice).val).toBeCloseTo(0.1) // 2p passive
    expect(calc.compute(anby.final.dmg_.basic[0]).val).toBeCloseTo(0.2)
    expect(calc.compute(anby.final.dmg_.basic[0]).val).toBeCloseTo(0.2)
  })
  it('PolarMetal with cond', () => {
    const data = testCharacterData('PolarMetal')
    data.push(
      cond('PolarMetal', conditionals.PolarMetal.freeze_shatter.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.dmg_.ice).val).toBeCloseTo(0.1) // 2p passive
    expect(calc.compute(anby.final.dmg_.basic[0]).val).toBeCloseTo(0.2 * 2)
    expect(calc.compute(anby.final.dmg_.basic[0]).val).toBeCloseTo(0.2 * 2)
  })
  it('ProtoPunk', () => {
    const data = testCharacterData('ProtoPunk')
    data.push(
      cond(
        'ProtoPunk',
        conditionals.ProtoPunk.def_assist_or_evasive_assist.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.shield_).val).toBeCloseTo(0.15) // 2p passive
    expect(calc.compute(anby.final.common_dmg_).val).toBeCloseTo(0.15)
  })
  it('PufferElectro', () => {
    const data = testCharacterData('PufferElectro')
    data.push(
      cond('PufferElectro', conditionals.PufferElectro.launching_ult.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.pen_).val).toBeCloseTo(0.08) // 2p passive
    expect(calc.compute(anby.final.dmg_.ult[0]).val).toBeCloseTo(0.2) // 4p passive
    expect(calc.compute(anby.combat.atk_).val).toBeCloseTo(0.15) // 4p cond
  })
  it('ShockstarDisco', () => {
    const data = testCharacterData('ShockstarDisco')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    expect(calc.compute(enemyDebuff.common.stun_.basic[0]).val).toBeCloseTo(
      1.5 + 0.2
    ) // 4p passive
    expect(calc.compute(enemyDebuff.common.stun_.dash[0]).val).toBeCloseTo(
      1.5 + 0.2
    ) // 4p passive
    expect(
      calc.compute(enemyDebuff.common.stun_.dodgeCounter[0]).val
    ).toBeCloseTo(1.5 + 0.2) // 4p passive
  })
  it('SoulRock', () => {
    const data = testCharacterData('SoulRock')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.initial.def_).val).toBeCloseTo(0.16) //2p passive
  })
  it('SwingJazz', () => {
    const data = testCharacterData('SwingJazz', undefined, [
      ownBuff.initial.anomMas.add(25),
    ])
    data.push(cond('SwingJazz', conditionals.SwingJazz.chain_or_ult.name, 1))
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.initial.enerRegen_).val).toBeCloseTo(0.2) // 2p
    expect(calc.compute(anby.combat.atk_).val).toBeCloseTo(0.15)
  })
  it('ThunderMetal', () => {
    const data = testCharacterData('ThunderMetal')
    data.push(
      cond('ThunderMetal', conditionals.ThunderMetal.enemy_shocked.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.dmg_.electric).val).toBeCloseTo(0.1) // 2p passive
    expect(calc.compute(anby.combat.atk_).val).toBeCloseTo(0.28) // 4p cond
  })
  it('WoodpeckerElectro', () => {
    const data = testCharacterData('WoodpeckerElectro')
    data.push(
      cond(
        'WoodpeckerElectro',
        conditionals.WoodpeckerElectro.crit_basic_dodge_ex.name,
        3
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    expect(calc.compute(anby.final.crit_).val).toBeCloseTo(0.05 + 0.08) // 2p passive
    expect(calc.compute(anby.combat.atk_).val).toBeCloseTo(0.09 * 3) // 4p cond
  })
})
