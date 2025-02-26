import { prettify } from '@genshin-optimizer/common/util'
import {
  compileTagMapValues,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type { CharacterKey, LightConeKey } from '@genshin-optimizer/sr/consts'
import { data, keys, values } from '..'
import { Calculator } from '../../calculator'
import { conditionals } from '../../meta'
import {
  charTagMapNodeEntries,
  lightConeTagMapNodeEntries,
  teamData,
  withMember,
} from '../../util'
import type { Read, TagMapNodeEntries } from '../util'
import { conditionalEntries, convert, enemy, own, ownTag } from '../util'

setDebugMode(true)
Object.assign(values, compileTagMapValues(keys, data))

function testCharacterData(
  charKey: CharacterKey,
  setKey: LightConeKey,
  otherCharData: TagMapNodeEntries = []
) {
  const data: TagMapNodeEntries = [
    ...teamData([charKey]),
    ...withMember(
      charKey,
      ...charTagMapNodeEntries(
        {
          level: 80,
          ascension: 6,
          key: charKey,
          eidolon: 0,
          basic: 0,
          skill: 0,
          ult: 0,
          talent: 0,
          servantSkill: 0,
          servantTalent: 0,
          bonusAbilities: {},
          statBoosts: {},
        },
        1
      ),
      ...lightConeTagMapNodeEntries(setKey, 80, 6, 5),
      ...otherCharData
    ),
    own.common.critMode.add('avg'),
    enemy.common.res.add(0.1),
    enemy.common.isBroken.add(0),
  ]
  return data
}

function cond(
  charKey: CharacterKey,
  setKey: LightConeKey,
  name: string,
  value: number
) {
  return conditionalEntries(setKey, charKey, null)(name, value)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printDebug(calc: Calculator, read: Read) {
  console.log(prettify(calc.toDebug().compute(read)))
}

describe('Light Cone sheets test', () => {
  it('Adversarial', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'Adversarial')
    data.push(
      cond(
        charKey,
        'Adversarial',
        conditionals.Adversarial.enemyDefeated.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.spd_).val).toBeCloseTo(0.18)
  })

  it('AfterTheCharmonyFall', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'AfterTheCharmonyFall')
    data.push(
      cond(
        charKey,
        'AfterTheCharmonyFall',
        conditionals.AfterTheCharmonyFall.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.brEffect_).val).toBeCloseTo(0.56)
    expect(calc.compute(char.final.spd_).val).toBeCloseTo(0.16)
  })

  it('AGroundedAscent', () => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'AGroundedAscent')
    data.push(
      cond(
        charKey,
        'AGroundedAscent',
        conditionals.AGroundedAscent.ultOrSkillUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.24)
  })

  it('AlongThePassingShore', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'AlongThePassingShore')
    data.push(
      cond(
        charKey,
        'AlongThePassingShore',
        conditionals.AlongThePassingShore.enemyHit.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC bonus
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.6)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.4)
    expect(calc.compute(char.final.dmg_.ult[0]).val).toBeCloseTo(0.4)
  })

  it('Amber', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'Amber')
    data.push(cond(charKey, 'Amber', conditionals.Amber.hpLowerThan50.name, 1))
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // LC passive + cond
    expect(calc.compute(char.final.def_).val).toBeCloseTo(0.32 + 0.32)
  })

  it('AnInstantBeforeAGaze', () => {
    const charKey: CharacterKey = 'TheHerta'
    const data = testCharacterData(charKey, 'AnInstantBeforeAGaze')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC bonus
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.6)
    // Check for cap of 180
    expect(calc.compute(char.final.dmg_.ult[0]).val).toBeCloseTo(180 * 0.006)
  })

  it('Arrows', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'Arrows')
    data.push(
      cond(charKey, 'Arrows', conditionals.Arrows.startOfBattle.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC bonus
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.24)
  })

  // TODO: ASecretVow

  it('BaptismOfPureThought', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'BaptismOfPureThought')
    data.push(
      cond(
        charKey,
        'BaptismOfPureThought',
        conditionals.BaptismOfPureThought.debuffCount.name,
        3
      ),
      cond(
        charKey,
        'BaptismOfPureThought',
        conditionals.BaptismOfPureThought.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive + LC bonus
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(
      0.5 + 0.32 + 3 * 0.12
    )
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.6)
    expect(calc.compute(char.final.defIgn_.followUp[0]).val).toBeCloseTo(0.4)
  })

  it('BeforeDawn', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'BeforeDawn')
    data.push(
      cond(
        charKey,
        'BeforeDawn',
        conditionals.BeforeDawn.followUpTriggered.name,
        3
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC bonus
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.6)
    expect(calc.compute(char.final.dmg_.skill[0]).val).toBeCloseTo(0.3)
    expect(calc.compute(char.final.dmg_.ult[0]).val).toBeCloseTo(0.3)
    expect(calc.compute(char.final.dmg_.followUp[0]).val).toBeCloseTo(0.8)
  })

  it('BeforeTheTutorialMissionStarts', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'BeforeTheTutorialMissionStarts')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.eff_).val).toBeCloseTo(0.4)
  })
})
