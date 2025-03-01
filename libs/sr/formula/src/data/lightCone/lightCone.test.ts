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
  lightConekey: LightConeKey,
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
      ...lightConeTagMapNodeEntries(lightConekey, 80, 6, 5),
      ...otherCharData
    ),
    own.common.critMode.add('avg'),
    enemy.common.res.add(0.1),
    enemy.common.isBroken.add(0),
  ]
  return data
}

function testTeamData(
  charKey: CharacterKey,
  otherCharKey: CharacterKey,
  lightConeKey: LightConeKey,
  otherCharData: TagMapNodeEntries = []
) {
  const data: TagMapNodeEntries = [
    ...teamData([charKey, otherCharKey]),
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
      ...lightConeTagMapNodeEntries(lightConeKey, 80, 6, 5),
      ...otherCharData
    ),
    ...withMember(
      otherCharKey,
      ...charTagMapNodeEntries(
        {
          level: 80,
          ascension: 6,
          key: otherCharKey,
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
        2
      ),
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
  value: number | string
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

  it('ASecretVow', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'ASecretVow')
    data.push(
      cond(charKey, 'ASecretVow', conditionals.ASecretVow.enemyHpGEOwn.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // LC passive + cond
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.4 + 0.4)
  })

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

  it('BoundlessChoreo', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'BoundlessChoreo')
    data.push(
      cond(
        charKey,
        'BoundlessChoreo',
        conditionals.BoundlessChoreo.enemySlowedOrRedDef.name,
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
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.16)
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.48)
  })

  it('BrighterThanTheSun', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'BrighterThanTheSun')
    data.push(
      cond(
        charKey,
        'BrighterThanTheSun',
        conditionals.BrighterThanTheSun.basicsUsed.name,
        2
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC bonus
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.3)
    expect(calc.compute(char.final.atk_).val).toBeCloseTo(2 * 0.3)
    expect(calc.compute(char.final.enerRegen_).val).toBeCloseTo(2 * 0.1)
  })

  it('ButTheBattleIsntOver', () => {
    const charKey: CharacterKey = 'RuanMei'
    const otherCharKey: CharacterKey = 'Seele'
    const data = testTeamData(charKey, otherCharKey, 'ButTheBattleIsntOver')
    data.push(
      cond(
        charKey,
        'ButTheBattleIsntOver',
        conditionals.ButTheBattleIsntOver.skillUsed.name,
        1
      )
    )
    const calcRuanMei = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const calcSeele = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: otherCharKey, dst: otherCharKey })

    expect(calcRuanMei.compute(own.final.enerRegen_).val).toBeCloseTo(0.18)
    // Check if buff is not applied to wearer
    expect(calcRuanMei.compute(own.final.common_dmg_).val).toBeCloseTo(0)
    expect(calcSeele.compute(own.final.common_dmg_).val).toBeCloseTo(0.5)
  })

  // TODO: Uncomment when ready
  // it.each([
  //   { atk_: 0.2, crit_dmg_: 0.5, enerRegen_: 0, name: 'atk_' },
  //   { atk_: 0, crit_dmg_: 0.74, enerRegen_: 0, name: 'crit_dmg_' },
  //   { atk_: 0, crit_dmg_: 0.5, enerRegen_: 0.12, name: 'enerRegen_' },
  // ])('CarveTheMoonWeaveTheClouds', (testCase) => {
  //   const charKey: CharacterKey = 'RuanMei'
  //   const data = testCharacterData(charKey, 'CarveTheMoonWeaveTheClouds')
  //   data.push(
  //     cond(
  //       charKey,
  //       'CarveTheMoonWeaveTheClouds',
  //       conditionals.CarveTheMoonWeaveTheClouds.atk_crit_dmg_enerRegen_.name,
  //       testCase.name
  //     )
  //   )
  //   const calc = new Calculator(
  //     keys,
  //     values,
  //     compileTagMapValues(keys, data)
  //   ).withTag({ src: charKey, dst: charKey })

  //   const char = convert(ownTag, { et: 'own', src: charKey })

  //   expect(calc.compute(char.final.atk_).val).toBeCloseTo(testCase.atk_)
  //   expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(
  //     testCase.crit_dmg_
  //   )
  //   expect(calc.compute(char.final.enerRegen_).val).toBeCloseTo(
  //     testCase.enerRegen_
  //   )
  // })

  it('Chorus', () => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'Chorus')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.12)
  })

  it('CollapsingSky', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'CollapsingSky')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.dmg_.basic[0]).val).toBeCloseTo(0.4)
    expect(calc.compute(char.final.dmg_.skill[0]).val).toBeCloseTo(0.4)
  })

  it('ConcertForTwo', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'ConcertForTwo')
    data.push(
      cond(
        charKey,
        'ConcertForTwo',
        conditionals.ConcertForTwo.shieldCount.name,
        8
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.def_).val).toBeCloseTo(0.32)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(8 * 0.08)
  })

  it('Cornucopia', () => {
    const charKey: CharacterKey = 'Lingsha'
    const data = testCharacterData(charKey, 'Cornucopia')
    data.push(
      cond(
        charKey,
        'Cornucopia',
        conditionals.Cornucopia.skillOrUltUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.heal_).val).toBeCloseTo(0.24)
  })

  it('CruisingInTheStellarSea', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'CruisingInTheStellarSea')
    data.push(
      cond(
        charKey,
        'CruisingInTheStellarSea',
        conditionals.CruisingInTheStellarSea.enemyHpLEHalf.name,
        1
      ),
      cond(
        charKey,
        'CruisingInTheStellarSea',
        conditionals.CruisingInTheStellarSea.enemyDefeated.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive + cond
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.16 + 0.16)
    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.4)
  })

  it('DanceAtSunset', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'DanceAtSunset')
    data.push(
      cond(
        charKey,
        'DanceAtSunset',
        conditionals.DanceAtSunset.ultsUsed.name,
        2
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.6)
    expect(calc.compute(char.final.dmg_.followUp[0]).val).toBeCloseTo(2 * 0.6)
  })

  // Dance! Dance! Dance! should be here, but no buffs apart from Action Advance

  it('DartingArrow', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'DartingArrow')
    data.push(
      cond(
        charKey,
        'DartingArrow',
        conditionals.DartingArrow.enemyDefeated.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.48)
  })
})
