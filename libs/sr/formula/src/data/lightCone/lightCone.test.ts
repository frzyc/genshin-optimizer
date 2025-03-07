import { prettify } from '@genshin-optimizer/common/util'
import {
  compileTagMapValues,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type { CharacterKey, LightConeKey } from '@genshin-optimizer/sr/consts'
import { data, keys, values } from '..'
import { Calculator } from '../../calculator'
import { conditionals, formulas } from '../../meta'
import {
  charTagMapNodeEntries,
  lightConeTagMapNodeEntries,
  teamData,
  withMember,
} from '../../util'
import type { TagMapNodeEntries } from '../util'
import {
  conditionalEntries,
  convert,
  enemy,
  own,
  ownBuff,
  ownTag,
  Read,
} from '../util'

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

  it.each([
    { atk_: 0.2, crit_dmg_: 0.5, enerRegen_: 0, index: 1 },
    { atk_: 0, crit_dmg_: 0.74, enerRegen_: 0, index: 2 },
    { atk_: 0, crit_dmg_: 0.5, enerRegen_: 0.12, index: 3 },
  ])('CarveTheMoonWeaveTheClouds', (testCase) => {
    setDebugMode(true)
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'CarveTheMoonWeaveTheClouds')
    data.push(
      cond(
        charKey,
        'CarveTheMoonWeaveTheClouds',
        conditionals.CarveTheMoonWeaveTheClouds.atk_crit_dmg_enerRegen_.name,
        testCase.index
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })

    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(testCase.atk_)
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(
      testCase.crit_dmg_
    )
    expect(calc.compute(char.final.enerRegen_).val).toBeCloseTo(
      testCase.enerRegen_
    )
  })

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

  it('DataBank', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'DataBank')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.dmg_.ult[0]).val).toBeCloseTo(0.56)
  })

  it('DayOneOfMyNewLife', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'DayOneOfMyNewLife')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.def_).val).toBeCloseTo(0.24)
  })

  it('Defense', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'Defense')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })

    expect(
      calc
        .withTag(formulas.Defense.healing.tag)
        .compute(new Read(formulas.Defense.healing.tag, undefined)).val
    ).toBeCloseTo((1474.704 + 952.56) * 0.3)
  })

  it('DestinysThreadsForewoven', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'DestinysThreadsForewoven', [
      ownBuff.premod.def.add(4000), // Adding def for maximum buff increase
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.eff_res_).val).toBeCloseTo(0.2)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.48)
  })

  it('DreamsMontage', () => {
    const charKey: CharacterKey = 'Lingsha'
    const data = testCharacterData(charKey, 'DreamsMontage')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.spd_).val).toBeCloseTo(0.12)
  })

  it.each([
    { basic: 0.2, skill: 0, ult: 0, index: 1 },
    { basic: 0, skill: 0.2, ult: 0, index: 2 },
    { basic: 0, skill: 0, ult: 0.2, index: 3 },
  ])('DreamvilleAdventure', (attack) => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'DreamvilleAdventure')
    data.push(
      cond(
        charKey,
        'DreamvilleAdventure',
        conditionals.DreamvilleAdventure.childishness.name,
        attack.index
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.dmg_.basic[0]).val).toBeCloseTo(attack.basic)
    expect(calc.compute(char.final.dmg_.skill[0]).val).toBeCloseTo(attack.skill)
    expect(calc.compute(char.final.dmg_.ult[0]).val).toBeCloseTo(attack.ult)
  })

  it('EarthlyEscapade', () => {
    const charKey: CharacterKey = 'RuanMei'
    const otherCharKey: CharacterKey = 'Seele'
    const data = testTeamData(charKey, otherCharKey, 'EarthlyEscapade')
    data.push(
      cond(
        charKey,
        'EarthlyEscapade',
        conditionals.EarthlyEscapade.mask.name,
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

    // Base + LC passive (no LC active)
    expect(calcRuanMei.compute(own.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.6)
    // Base + LC active effect not applied
    expect(calcRuanMei.compute(own.final.crit_).val).toBeCloseTo(0.05)
    // Base + LC active
    expect(calcSeele.compute(own.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.56)
    expect(calcSeele.compute(own.final.crit_).val).toBeCloseTo(0.05 + 0.14)
  })

  it('EchoesOfTheCoffin', () => {
    const charKey: CharacterKey = 'Lingsha'
    const data = testCharacterData(charKey, 'EchoesOfTheCoffin')
    data.push(
      cond(
        charKey,
        'EchoesOfTheCoffin',
        conditionals.EchoesOfTheCoffin.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.4)
    // Base + LC bonus
    expect(calc.compute(char.final.spd).val).toBeCloseTo(98 + 20)
  })

  it('EternalCalculus', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'EternalCalculus')
    data.push(
      cond(
        charKey,
        'EternalCalculus',
        conditionals.EternalCalculus.enemiesHit.name,
        5
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // LC passive + bonus
    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.12 + 5 * 0.08)
    expect(calc.compute(char.final.spd_).val).toBeCloseTo(0.16)
  })

  it('EyesOfThePrey', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'EyesOfThePrey')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.eff_).val).toBeCloseTo(0.4)
    expect(calc.compute(char.final.dmg_.dot[0]).val).toBeCloseTo(0.48)
  })

  it('Fermata', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'Fermata')
    data.push(
      cond(
        charKey,
        'Fermata',
        conditionals.Fermata.affectedWithShockOrWindShear.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.brEffect_).val).toBeCloseTo(0.32)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.32)
  })

  it('FinalVictor', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'FinalVictor')
    data.push(
      cond(charKey, 'FinalVictor', conditionals.FinalVictor.goodFortune.name, 4)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.2)
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 4 * 0.12)
  })

  // Fine Fruit should be here but no conditionals

  it('FlameOfBloodBlazeMyPath', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'FlameOfBloodBlazeMyPath')
    data.push(
      cond(
        charKey,
        'FlameOfBloodBlazeMyPath',
        conditionals.FlameOfBloodBlazeMyPath.ultUsed.name,
        1
      ),
      cond(
        charKey,
        'FlameOfBloodBlazeMyPath',
        conditionals.FlameOfBloodBlazeMyPath.skillUsed.name,
        1
      ),
      cond(
        charKey,
        'FlameOfBloodBlazeMyPath',
        conditionals.FlameOfBloodBlazeMyPath.hpConsumedMoreThan500.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.hp_).val).toBeCloseTo(0.3)
    expect(calc.compute(char.final.incHeal_).val).toBeCloseTo(0.4)
    expect(calc.compute(char.final.dmg_.skill[0]).val).toBeCloseTo(0.5 + 0.5)
    expect(calc.compute(char.final.dmg_.ult[0]).val).toBeCloseTo(0.5 + 0.5)
    expect(
      calc
        .withTag(formulas.FlameOfBloodBlazeMyPath.hp_loss.tag)
        .compute(
          new Read(formulas.FlameOfBloodBlazeMyPath.hp_loss.tag, undefined)
        ).val
    ).toBeCloseTo((814.968 + 1375.92) * 1.3 * 0.08)
  })

  it('FlamesAfar', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'FlamesAfar')
    data.push(
      cond(charKey, 'FlamesAfar', conditionals.FlamesAfar.hpConsumed.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.5)
    expect(
      calc
        .withTag(formulas.FlamesAfar.healing.tag)
        .compute(new Read(formulas.FlamesAfar.healing.tag, undefined)).val
    ).toBeCloseTo((814.968 + 1058.4) * 0.15)
  })

  it('FlowingNightglow', () => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'FlowingNightglow')
    data.push(
      cond(
        charKey,
        'FlowingNightglow',
        conditionals.FlowingNightglow.cantillation.name,
        5
      ),
      cond(
        charKey,
        'FlowingNightglow',
        conditionals.FlowingNightglow.cadenza.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.enerRegen_).val).toBeCloseTo(5 * 0.05)
    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.96)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.4)
  })

  it('ForTomorrowsJourney', () => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'ForTomorrowsJourney')
    data.push(
      cond(
        charKey,
        'ForTomorrowsJourney',
        conditionals.ForTomorrowsJourney.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.32)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.3)
  })

  it('GeniusesGreetings', () => {
    const charKey: CharacterKey = 'Aglaea'
    const data = testCharacterData(charKey, 'GeniusesGreetings')
    data.push(
      cond(
        charKey,
        'GeniusesGreetings',
        conditionals.GeniusesGreetings.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.32)
    expect(calc.compute(char.final.dmg_.basic[0]).val).toBeCloseTo(0.4)
    // TODO: check memosprite
  })

  it('GeniusesRepose', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'GeniusesRepose')
    data.push(
      cond(
        charKey,
        'GeniusesRepose',
        conditionals.GeniusesRepose.enemyDefeated.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.32)
    // Base + LC cond
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.48)
  })

  it('GoodNightAndSleepWell', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'GoodNightAndSleepWell')
    data.push(
      cond(
        charKey,
        'GoodNightAndSleepWell',
        conditionals.GoodNightAndSleepWell.debuffCount.name,
        3
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(3 * 0.24)
  })

  it('HeyOverHere', () => {
    const charKey: CharacterKey = 'Lingsha'
    const data = testCharacterData(charKey, 'HeyOverHere')
    data.push(
      cond(charKey, 'HeyOverHere', conditionals.HeyOverHere.skillUsed.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.hp_).val).toBeCloseTo(0.12)
    expect(calc.compute(char.final.heal_).val).toBeCloseTo(0.28)
  })

  it('IfTimeWereAFlower', () => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'IfTimeWereAFlower')
    data.push(
      cond(
        charKey,
        'IfTimeWereAFlower',
        conditionals.IfTimeWereAFlower.presage.name,
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
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.6 + 0.96)
  })

  it('IncessantRain', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'IncessantRain')
    data.push(
      cond(
        charKey,
        'IncessantRain',
        conditionals.IncessantRain.enemyDebuffsGE3.name,
        1
      ),
      cond(
        charKey,
        'IncessantRain',
        conditionals.IncessantRain.aetherCode.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.eff_).val).toBeCloseTo(0.4)
    // Base + LC cond
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.2)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.2)
  })

  it('IndeliblePromise', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'IndeliblePromise')
    data.push(
      cond(
        charKey,
        'IndeliblePromise',
        conditionals.IndeliblePromise.ultUsed.name,
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
    // Base + LC cond
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.3)
  })

  it('InherentlyUnjustDestiny', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'InherentlyUnjustDestiny')
    data.push(
      cond(
        charKey,
        'InherentlyUnjustDestiny',
        conditionals.InherentlyUnjustDestiny.shieldProvided.name,
        1
      ),
      cond(
        charKey,
        'InherentlyUnjustDestiny',
        conditionals.InherentlyUnjustDestiny.followUpHit.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.def_).val).toBeCloseTo(0.64)
    // Base + LC cond
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.64)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.16)
  })

  it('InTheNameOfTheWorld', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'InTheNameOfTheWorld')
    data.push(
      cond(
        charKey,
        'InTheNameOfTheWorld',
        conditionals.InTheNameOfTheWorld.enemyDebuffed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.4)
    expect(calc.compute(char.final.eff_.skill[0]).val).toBeCloseTo(0.3)
    expect(calc.compute(char.final.atk_.skill[0]).val).toBeCloseTo(0.4)
  })

  it('InTheNight', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'InTheNight')
    data.push(
      cond(charKey, 'InTheNight', conditionals.InTheNight.spdExceeded.name, 6)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.3)
    expect(calc.compute(char.final.dmg_.basic[0]).val).toBeCloseTo(6 * 0.1)
    expect(calc.compute(char.final.dmg_.skill[0]).val).toBeCloseTo(6 * 0.1)
    // Base + LC cond
    expect(calc.compute(char.final.crit_dmg_.ult[0]).val).toBeCloseTo(
      0.5 + 6 * 0.2
    )
  })

  it('IntoTheUnreachableVeil', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'IntoTheUnreachableVeil')
    data.push(
      cond(
        charKey,
        'IntoTheUnreachableVeil',
        conditionals.IntoTheUnreachableVeil.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.2)
    expect(calc.compute(char.final.dmg_.skill[0]).val).toBeCloseTo(1)
    expect(calc.compute(char.final.dmg_.ult[0]).val).toBeCloseTo(1)
  })

  it('IShallBeMyOwnSword', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'IShallBeMyOwnSword')
    data.push(
      cond(
        charKey,
        'IShallBeMyOwnSword',
        conditionals.IShallBeMyOwnSword.eclipse.name,
        3
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.32)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(3 * 0.24)
    expect(calc.compute(char.final.defIgn_).val).toBeCloseTo(0.2)
  })

  it('ItsShowtime', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'ItsShowtime', [
      ownBuff.premod.eff_.add(0.8),
    ])
    data.push(
      cond(charKey, 'ItsShowtime', conditionals.ItsShowtime.trick.name, 3)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(3 * 0.1)
    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.36)
  })

  it('IVentureForthToHunt', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'IVentureForthToHunt')
    data.push(
      cond(
        charKey,
        'IVentureForthToHunt',
        conditionals.IVentureForthToHunt.luminflux.name,
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
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.25)
    expect(calc.compute(char.final.defIgn_.ult[0]).val).toBeCloseTo(2 * 0.39)
  })

  // Landau's Choice should be here, but no passives or conds

  it('LongRoadLeadsHome', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'LongRoadLeadsHome')
    data.push(
      cond(
        charKey,
        'LongRoadLeadsHome',
        conditionals.LongRoadLeadsHome.charring.name,
        2
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.brEffect_).val).toBeCloseTo(1)
    expect(calc.compute(char.final.dmg_.break[0]).val).toBeCloseTo(2 * 0.3)
  })

  it('Loop', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'Loop')
    data.push(cond(charKey, 'Loop', conditionals.Loop.enemySlowed.name, 1))
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.48)
  })

  it('MakeTheWorldClamor', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'MakeTheWorldClamor')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.dmg_.ult[0]).val).toBeCloseTo(0.64)
  })

  it('Mediation', () => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'Mediation')
    data.push(
      cond(charKey, 'Mediation', conditionals.Mediation.enteringBattle.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC buff
    expect(calc.compute(char.final.spd).val).toBeCloseTo(104 + 20)
  })

  it('MemoriesOfThePast', () => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'MemoriesOfThePast')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.brEffect_).val).toBeCloseTo(0.56)
  })

  it('MemorysCurtainNeverFalls', () => {
    const charKey: CharacterKey = 'Aglaea'
    const data = testCharacterData(charKey, 'MemorysCurtainNeverFalls')
    data.push(
      cond(
        charKey,
        'MemorysCurtainNeverFalls',
        conditionals.MemorysCurtainNeverFalls.skillUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.spd_).val).toBeCloseTo(0.12)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.16)
  })

  // Meshing Cogs should be here but there are no conds

  it('MomentOfVictory', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'MomentOfVictory')
    data.push(
      cond(
        charKey,
        'MomentOfVictory',
        conditionals.MomentOfVictory.wearerAttacked.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.def_).val).toBeCloseTo(0.4 + 0.4)
    expect(calc.compute(char.final.eff_).val).toBeCloseTo(0.4)
  })

  // Multiplication should be here but there are no conds

  it('MutualDemise', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'MutualDemise')
    data.push(
      cond(
        charKey,
        'MutualDemise',
        conditionals.MutualDemise.hpLowerThan80.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC cond
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.24)
  })

  it('NightOfFright', () => {
    const charKey: CharacterKey = 'Lingsha'
    const otherCharKey: CharacterKey = 'Seele'
    const data = testTeamData(charKey, otherCharKey, 'NightOfFright')
    data.push(
      cond(
        charKey,
        'NightOfFright',
        conditionals.NightOfFright.healingProvided.name,
        5
      )
    )
    const calcLingsha = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const calcSeele = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: otherCharKey, dst: otherCharKey })

    expect(calcLingsha.compute(own.final.enerRegen_).val).toBeCloseTo(0.2)
    expect(calcSeele.compute(own.final.atk_).val).toBeCloseTo(5 * 0.04)
    expect(
      calcSeele
        .withTag({ src: charKey, dst: otherCharKey })
        .compute(new Read(formulas.NightOfFright.healing.tag, undefined)).val
    ).toBeCloseTo(931.392 * 0.14)
  })

  it('NightOnTheMilkyWay', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'NightOnTheMilkyWay')
    data.push(
      cond(
        charKey,
        'NightOnTheMilkyWay',
        conditionals.NightOnTheMilkyWay.enemiesOnField.name,
        5
      ),
      cond(
        charKey,
        'NightOnTheMilkyWay',
        conditionals.NightOnTheMilkyWay.enemyBroken.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(5 * 0.15)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.5)
  })

  it('NinjaRecordSoundHunt', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'NinjaRecordSoundHunt')
    data.push(
      cond(
        charKey,
        'NinjaRecordSoundHunt',
        conditionals.NinjaRecordSoundHunt.hpLost.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.hp_).val).toBeCloseTo(0.24)
    // Base + LC cond
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.36)
  })

  it('NinjutsuInscriptionDazzlingEvilbreaker', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(
      charKey,
      'NinjutsuInscriptionDazzlingEvilbreaker'
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.brEffect_).val).toBeCloseTo(1)
  })

  it('NowhereToRun', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'NowhereToRun')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.48)
    expect(
      calc.compute(new Read(formulas.NowhereToRun.healing.tag, undefined)).val
    ).toBeCloseTo((523.908 + 529.2) * 1.48 * 0.24)
  })

  it('OnlySilenceRemains', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'OnlySilenceRemains')
    data.push(
      cond(
        charKey,
        'OnlySilenceRemains',
        conditionals.OnlySilenceRemains.lessThan2Enemies.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.32)
    // Base + LC cond
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.24)
  })

  it('OnTheFallOfAnAeon', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'OnTheFallOfAnAeon')
    data.push(
      cond(
        charKey,
        'OnTheFallOfAnAeon',
        conditionals.OnTheFallOfAnAeon.wearerAttacked.name,
        4
      ),
      cond(
        charKey,
        'OnTheFallOfAnAeon',
        conditionals.NightOnTheMilkyWay.enemyBroken.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(4 * 0.16)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.24)
  })

  // Passkey should be here but there are no conds

  it('PastAndFuture', () => {
    const charKey: CharacterKey = 'RuanMei'
    const otherCharKey: CharacterKey = 'Seele'
    const data = testTeamData(charKey, otherCharKey, 'PastAndFuture')
    data.push(
      cond(
        charKey,
        'PastAndFuture',
        conditionals.PastAndFuture.skillUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: otherCharKey, dst: otherCharKey })
    const char = convert(ownTag, { et: 'own', src: otherCharKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.32)
  })

  it('PastSelfInMirror', () => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'PastSelfInMirror')
    data.push(
      cond(
        charKey,
        'PastSelfInMirror',
        conditionals.PastSelfInMirror.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.brEffect_).val).toBeCloseTo(1)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.4)
  })

  it('PatienceIsAllYouNeed', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'PatienceIsAllYouNeed')
    data.push(
      cond(
        charKey,
        'PatienceIsAllYouNeed',
        conditionals.PatienceIsAllYouNeed.attackCount.name,
        3
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.4)
    expect(calc.compute(char.final.spd_).val).toBeCloseTo(3 * 0.08)
  })

  it('PerfectTiming', () => {
    const charKey: CharacterKey = 'Lingsha'
    const data = testCharacterData(charKey, 'PerfectTiming', [
      // Max out LC passive
      ownBuff.premod.eff_res_.add(0.28),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // LC bonus + assumed
    expect(calc.compute(char.final.eff_res_).val).toBeCloseTo(0.32 + 0.28)
    expect(calc.compute(char.final.heal_).val).toBeCloseTo(0.27)
  })

  it('Pioneering', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'Pioneering')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })

    expect(
      calc.compute(new Read(formulas.Pioneering.healing.tag, undefined)).val
    ).toBeCloseTo((1474.704 + 952.56) * 0.2)
  })

  it('PlanetaryRendezvous', () => {
    const charKey: CharacterKey = 'RuanMei'
    const data = testCharacterData(charKey, 'PlanetaryRendezvous')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.dmg_.ice).val).toBeCloseTo(0.24)
    // Check that buff is not applied for other element damage
    expect(calc.compute(char.final.dmg_.physical).val).toBeCloseTo(0)
  })

  it('PoisedToBloom', () => {
    const charKey: CharacterKey = 'RuanMei'
    const otherCharKey: CharacterKey = 'Robin'
    const data = testTeamData(charKey, otherCharKey, 'PoisedToBloom')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.32)
    // Base + LC cond
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.32)
  })

  it('PostOpConversation', () => {
    const charKey: CharacterKey = 'Lingsha'
    const data = testCharacterData(charKey, 'PostOpConversation')
    data.push(
      cond(
        charKey,
        'PostOpConversation',
        conditionals.PostOpConversation.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.enerRegen_).val).toBeCloseTo(0.16)
    expect(calc.compute(char.final.heal_).val).toBeCloseTo(0.24)
  })

  // QuidProQuo should be here but there are no conditionals

  it('ReforgedRemembrance', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'ReforgedRemembrance')
    data.push(
      cond(
        charKey,
        'ReforgedRemembrance',
        conditionals.ReforgedRemembrance.prophet.name,
        4
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.eff_).val).toBeCloseTo(0.6)
    expect(calc.compute(char.final.atk_).val).toBeCloseTo(4 * 0.09)
    expect(calc.compute(char.final.defIgn_.dot[0]).val).toBeCloseTo(4 * 0.1)
  })

  it('Reminiscence', () => {
    const charKey: CharacterKey = 'Aglaea'
    const data = testCharacterData(charKey, 'Reminiscence')
    data.push(
      cond(
        charKey,
        'Reminiscence',
        conditionals.Reminiscence.commemoration.name,
        4
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(4 * 0.12)
    // TODO: check memosprite
  })

  it('ResolutionShinesAsPearlsOfSweat', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'ResolutionShinesAsPearlsOfSweat')
    data.push(
      cond(
        charKey,
        'ResolutionShinesAsPearlsOfSweat',
        conditionals.ResolutionShinesAsPearlsOfSweat.ensnared.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })

    expect(calc.compute(enemy.common.defRed_).val).toBeCloseTo(0.16)
  })

  it('ReturnToDarkness', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'ReturnToDarkness')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.24)
  })

  it('RiverFlowsInSpring', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'RiverFlowsInSpring')
    data.push(
      cond(
        charKey,
        'RiverFlowsInSpring',
        conditionals.RiverFlowsInSpring.notAttacked.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.spd_).val).toBeCloseTo(0.12)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.24)
  })

  it('Sagacity', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'Sagacity')
    data.push(cond(charKey, 'Sagacity', conditionals.Sagacity.ultUsed.name, 1))
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.48)
  })

  it('SailingTowardsASecondLife', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'SailingTowardsASecondLife', [
      ownBuff.premod.brEffect_.add(0.5),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Assumed + LC passive
    expect(calc.compute(char.final.brEffect_).val).toBeCloseTo(0.5 + 1)
    expect(calc.compute(char.final.defIgn_.break[0]).val).toBeCloseTo(0.32)
    expect(calc.compute(char.final.spd_).val).toBeCloseTo(0.2)
  })

  it('ScentAloneStaysTrue', () => {
    const charKey: CharacterKey = 'Lingsha'
    const data = testCharacterData(charKey, 'ScentAloneStaysTrue', [
      ownBuff.premod.brEffect_.add(0.5),
    ])
    data.push(
      cond(
        charKey,
        'ScentAloneStaysTrue',
        conditionals.ScentAloneStaysTrue.woefree.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Assumed + LC passive
    expect(calc.compute(char.final.brEffect_).val).toBeCloseTo(0.5 + 1)
    // LC cond + LC extra cond
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.18 + 0.16)
  })

  // Shadowburn should be here but no conditionals

  it('ShadowedByNight', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'ShadowedByNight')
    data.push(
      cond(
        charKey,
        'ShadowedByNight',
        conditionals.ShadowedByNight.enterBattleOrBreakDmg.name,
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
    expect(calc.compute(char.final.spd_).val).toBeCloseTo(0.12)
  })

  it('SharedFeeling', () => {
    const charKey: CharacterKey = 'Lingsha'
    const data = testCharacterData(charKey, 'SharedFeeling')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.heal_).val).toBeCloseTo(0.2)
  })

  it('ShatteredHome', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'ShatteredHome')
    data.push(
      cond(
        charKey,
        'ShatteredHome',
        conditionals.ShatteredHome.enemyHpGE50.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.4)
  })

  it('SheAlreadyShutHerEyes', () => {
    const charKey: CharacterKey = 'FuXuan'
    const otherCharKey: CharacterKey = 'Seele'
    const data = testTeamData(charKey, otherCharKey, 'SheAlreadyShutHerEyes')
    data.push(
      cond(
        charKey,
        'SheAlreadyShutHerEyes',
        conditionals.SheAlreadyShutHerEyes.wearerHpReduced.name,
        1
      )
    )
    const calcFuXuan = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const calcSeele = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: otherCharKey })

    expect(calcFuXuan.compute(own.final.hp_).val).toBeCloseTo(0.4)
    expect(calcFuXuan.compute(own.final.enerRegen_).val).toBeCloseTo(0.2)
    expect(calcFuXuan.compute(own.final.common_dmg_).val).toBeCloseTo(0.15)
    expect(
      calcFuXuan.compute(
        new Read(formulas.SheAlreadyShutHerEyes.maxHeal.tag, undefined)
      ).val
    ).toBeCloseTo((1474.704 + 1270.08) * 1.4 * 1)
    expect(
      calcSeele.compute(
        new Read(formulas.SheAlreadyShutHerEyes.maxHeal.tag, undefined)
      ).val
    ).toBeCloseTo(931.392 * 1)
  })

  it('SleepLikeTheDead', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'SleepLikeTheDead')
    data.push(
      cond(
        charKey,
        'SleepLikeTheDead',
        conditionals.SleepLikeTheDead.notCrit.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.5)
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.6)
  })

  it('SolitaryHealing', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'SolitaryHealing')
    data.push(
      cond(
        charKey,
        'SolitaryHealing',
        conditionals.SolitaryHealing.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.brEffect_).val).toBeCloseTo(0.4)
    expect(calc.compute(char.final.dmg_.dot[0]).val).toBeCloseTo(0.48)
  })

  it('SomethingIrreplaceable', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'SomethingIrreplaceable')
    data.push(
      cond(
        charKey,
        'SomethingIrreplaceable',
        conditionals.SomethingIrreplaceable.wearerHit.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.4)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.4)
    expect(
      calc.compute(
        new Read(formulas.SomethingIrreplaceable.healing.tag, undefined)
      ).val
    ).toBeCloseTo((523.908 + 582.12) * 1.4 * 0.12)
  })

  it('SubscribeForMore', () => {
    const charKey: CharacterKey = 'Seele'
    const data = testCharacterData(charKey, 'SubscribeForMore')
    data.push(
      cond(
        charKey,
        'SubscribeForMore',
        conditionals.SubscribeForMore.maxEnergy.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.dmg_.basic[0]).val).toBeCloseTo(0.48 + 0.48)
    expect(calc.compute(char.final.dmg_.skill[0]).val).toBeCloseTo(0.48 + 0.48)
  })

  it('SweatNowCryLess', () => {
    const charKey: CharacterKey = 'Aglaea'
    const data = testCharacterData(charKey, 'SweatNowCryLess')
    data.push(
      cond(
        charKey,
        'SweatNowCryLess',
        conditionals.SweatNowCryLess.memospriteOnField.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.2)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.36)
    // TODO: check memosprite
  })

  it('Swordplay', () => {
    const charKey: CharacterKey = 'Aglaea'
    const data = testCharacterData(charKey, 'Swordplay')
    data.push(
      cond(charKey, 'Swordplay', conditionals.Swordplay.sameTargetHit.name, 5)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(5 * 0.16)
  })

  it('TextureOfMemories', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'TextureOfMemories')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.eff_res_).val).toBeCloseTo(0.16)
    expect(
      calc.compute(new Read(formulas.TextureOfMemories.shield.tag, undefined))
        .val
    ).toBeCloseTo((1474.704 + 1058.4) * 0.32)
  })

  it('TheBirthOfTheSelf', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'TheBirthOfTheSelf')
    data.push(
      cond(
        charKey,
        'TheBirthOfTheSelf',
        conditionals.TheBirthOfTheSelf.enemyHpLE50.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.dmg_.followUp[0]).val).toBeCloseTo(
      0.48 + 0.48
    )
  })

  it('TheDayTheCosmosFell', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'TheDayTheCosmosFell')
    data.push(
      cond(
        charKey,
        'TheDayTheCosmosFell',
        conditionals.TheDayTheCosmosFell.twoEnemiesWeakness.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.24)
    // Base + LC cond
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.4)
  })

  it('TheMolesWelcomeYou', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'TheMolesWelcomeYou')
    data.push(
      cond(
        charKey,
        'TheMolesWelcomeYou',
        conditionals.TheMolesWelcomeYou.mischievous.name,
        3
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(3 * 0.24)
  })

  it('TheSeriousnessOfBreakfast', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'TheSeriousnessOfBreakfast')
    data.push(
      cond(
        charKey,
        'TheSeriousnessOfBreakfast',
        conditionals.TheSeriousnessOfBreakfast.enemiesDefeated.name,
        3
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.24)
    expect(calc.compute(char.final.atk_).val).toBeCloseTo(3 * 0.08)
  })

  it('TheUnreachableSide', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'TheUnreachableSide')
    data.push(
      cond(
        charKey,
        'TheUnreachableSide',
        conditionals.TheUnreachableSide.attackedOrConsumedHp.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.3)
    expect(calc.compute(char.final.hp_).val).toBeCloseTo(0.3)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.4)
  })

  it('ThisIsMe', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'ThisIsMe')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.def_).val).toBeCloseTo(0.32)
    expect(calc.compute(char.final.dmg_.ult[0]).val).toBeCloseTo(
      (606.375 + 529.2) * 1.32 * 1.2
    )
  })

  it('ThoseManySprings', () => {
    const charKey: CharacterKey = 'BlackSwan'
    const data = testCharacterData(charKey, 'ThoseManySprings')
    data.push(
      cond(
        charKey,
        'ThoseManySprings',
        conditionals.ThoseManySprings.unarmored.name,
        1
      ),
      cond(
        charKey,
        'ThoseManySprings',
        conditionals.ThoseManySprings.cornered.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.eff_).val).toBeCloseTo(1)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.18 + 0.22)
  })

  it('TimeWaitsForNoOne', () => {
    const charKey: CharacterKey = 'Lingsha'
    const data = testCharacterData(charKey, 'TimeWaitsForNoOne')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.hp_).val).toBeCloseTo(0.3)
    expect(calc.compute(char.final.heal_).val).toBeCloseTo(0.2)
  })

  it('TimeWovenIntoGold', () => {
    const charKey: CharacterKey = 'Aglaea'
    const data = testCharacterData(charKey, 'TimeWovenIntoGold')
    data.push(
      cond(
        charKey,
        'TimeWovenIntoGold',
        conditionals.TimeWovenIntoGold.brocade.name,
        6
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    // Base + LC passive
    expect(calc.compute(char.final.spd).val).toBeCloseTo(102 + 20)
    // Base + LC cond
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 6 * 0.15)
    expect(calc.compute(char.final.dmg_.basic[0]).val).toBeCloseTo(6 * 0.15)
    // TODO: check memosprite
  })

  it('TodayIsAnotherPeacefulDay', () => {
    const charKey: CharacterKey = 'Qingque'
    const data = testCharacterData(charKey, 'TodayIsAnotherPeacefulDay')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(140 * 0.004)
  })

  it('TrendOfTheUniversalMarket', () => {
    const charKey: CharacterKey = 'FuXuan'
    const data = testCharacterData(charKey, 'TrendOfTheUniversalMarket')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.def_).val).toBeCloseTo(0.32)
  })

  it('UnderTheBlueSky', () => {
    const charKey: CharacterKey = 'Firefly'
    const data = testCharacterData(charKey, 'UnderTheBlueSky')
    data.push(
      cond(
        charKey,
        'UnderTheBlueSky',
        conditionals.UnderTheBlueSky.enemyDefeated.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: charKey, dst: charKey })
    const char = convert(ownTag, { et: 'own', src: charKey })

    expect(calc.compute(char.final.atk_).val).toBeCloseTo(0.32)
    // Base + LC cond
    expect(calc.compute(char.final.crit_).val).toBeCloseTo(0.05 + 0.24)
  })
})
