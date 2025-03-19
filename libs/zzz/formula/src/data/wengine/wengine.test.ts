import { prettify } from '@genshin-optimizer/common/util'
import {
  compileTagMapValues,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type {
  CharacterKey,
  SpecialityKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import { data, keys, values } from '..'
import {
  charTagMapNodeEntries,
  conditionals,
  teamData,
  wengineTagMapNodeEntries,
  withMember,
} from '../..'
import { Calculator } from '../../calculator'
import type { Read } from '../util'
import {
  type TagMapNodeEntries,
  conditionalEntries,
  convert,
  enemy,
  enemyDebuff,
  own,
  ownTag,
} from '../util'

setDebugMode(true)
// This is generally unnecessary, but without it, some tags in `DebugCalculator` will be missing
Object.assign(values, compileTagMapValues(keys, data))
const specialityMap: Record<SpecialityKey, CharacterKey> = {
  attack: 'Billy',
  stun: 'Anby',
  anomaly: 'Piper',
  support: 'Nicole',
  defense: 'Ben',
}

function testCharacterData(wengineKey: WengineKey) {
  const type = getWengineStat(wengineKey).type
  const characterKey = specialityMap[type]
  const data: TagMapNodeEntries = [
    ...teamData([characterKey]),
    ...withMember(
      characterKey,
      ...charTagMapNodeEntries({
        level: 60,
        promotion: 5,
        key: characterKey,
        mindscape: 0,
        basic: 0,
        dodge: 0,
        special: 0,
        assist: 0,
        chain: 0,
        core: 0,
      }),
      ...wengineTagMapNodeEntries(wengineKey, 60, 5, 5)
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
  return { data, characterKey }
}

function cond(
  characterKey: CharacterKey,
  wKey: WengineKey,
  name: string,
  value: number
) {
  return conditionalEntries(wKey, characterKey, null)(name, value)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printDebug(calc: Calculator, read: Read) {
  console.log(prettify(calc.toDebug().compute(read)))
}

describe('Disc sheets test', () => {
  it('BashfulDemon', () => {
    const { data, characterKey } = testCharacterData('BashfulDemon')
    data.push(
      cond(
        characterKey,
        'BashfulDemon',
        conditionals.BashfulDemon.launch_ex_attack.name,
        4
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.final.dmg_.ice).val).toBeCloseTo(0.24) // passive
    expect(calc.compute(char.combat.atk_).val).toBeCloseTo(4 * 0.032) // cond
  })

  // BigCyliner should be here but no conds

  it('BlazingLaurel', () => {
    const { data, characterKey } = testCharacterData('BlazingLaurel')
    data.push(
      cond(
        characterKey,
        'BlazingLaurel',
        conditionals.BlazingLaurel.quickOrPerfectAssistUsed.name,
        1
      ),
      cond(
        characterKey,
        'BlazingLaurel',
        conditionals.BlazingLaurel.wilt.name,
        30
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    // expect(calc.compute(char.final.impact_).val).toBeCloseTo(0.4)
    // Base + W-engine cond
    expect(calc.compute(char.final.crit_dmg_.ice).val).toBeCloseTo(
      0.5 + 30 * 0.024
    )
    expect(calc.compute(char.final.crit_dmg_.fire).val).toBeCloseTo(
      0.5 + 30 * 0.024
    )
  })

  it('BoxCutter', () => {
    const { data, characterKey } = testCharacterData('BoxCutter')
    data.push(
      cond(
        characterKey,
        'BoxCutter',
        conditionals.BoxCutter.launchedAftershock.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.final.dmg_.physical).val).toBeCloseTo(0.24)
  })

  it('BunnyBand', () => {
    const { data, characterKey } = testCharacterData('BunnyBand')
    data.push(
      cond(
        characterKey,
        'BunnyBand',
        conditionals.BunnyBand.wearerShielded.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.hp_).val).toBeCloseTo(0.128)
    expect(calc.compute(char.combat.atk_).val).toBeCloseTo(0.16)
  })

  it('CannonRotor', () => {
    const { data, characterKey } = testCharacterData('CannonRotor')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.atk_).val).toBeCloseTo(0.12)
  })

  it('DeepSeaVisitor', () => {
    const { data, characterKey } = testCharacterData('DeepSeaVisitor')
    data.push(
      cond(
        characterKey,
        'DeepSeaVisitor',
        conditionals.DeepSeaVisitor.basicHit.name,
        1
      ),
      cond(
        characterKey,
        'DeepSeaVisitor',
        conditionals.DeepSeaVisitor.iceDashAtkHit.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.final.dmg_.ice).val).toBeCloseTo(0.5)
    expect(calc.compute(char.combat.crit_).val).toBeCloseTo(0.2 + 0.2)
  })

  it('DemaraBatteryMarkII', () => {
    const { data, characterKey } = testCharacterData('DemaraBatteryMarkII')
    data.push(
      cond(
        characterKey,
        'DemaraBatteryMarkII',
        conditionals.DemaraBatteryMarkII.dodgeCounterOrAssistHit.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.final.dmg_.electric).val).toBeCloseTo(0.24)
    expect(calc.compute(char.combat.enerRegen_).val).toBeCloseTo(0.275)
  })

  it('DrillRigRedAxis', () => {
    const { data, characterKey } = testCharacterData('DrillRigRedAxis')
    data.push(
      cond(
        characterKey,
        'DrillRigRedAxis',
        conditionals.DrillRigRedAxis.exSpecialOrChainUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.final.dmg_.electric.basic[0]).val).toBeCloseTo(0.8)
    expect(calc.compute(char.final.dmg_.electric.dash[0]).val).toBeCloseTo(0.8)
  })

  it('ElectroLipGloss', () => {
    const { data, characterKey } = testCharacterData('ElectroLipGloss')
    data.push(
      cond(
        characterKey,
        'ElectroLipGloss',
        conditionals.ElectroLipGloss.anomalyOnEnemy.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.atk_).val).toBeCloseTo(0.16)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.25)
  })

  it('ElegantVanity', () => {
    const { data, characterKey } = testCharacterData('ElegantVanity')
    data.push(
      cond(
        characterKey,
        'ElegantVanity',
        conditionals.ElegantVanity.consumed25Energy.name,
        2
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(2 * 0.16)
  })

  it('FlamemakerShaker', () => {
    const { data, characterKey } = testCharacterData('FlamemakerShaker')
    data.push(
      cond(
        characterKey,
        'FlamemakerShaker',
        conditionals.FlamemakerShaker.offField.name,
        1
      ),
      cond(
        characterKey,
        'FlamemakerShaker',
        conditionals.FlamemakerShaker.exSpecialAssistHits.name,
        10
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.enerRegen).val).toBeCloseTo(1.2)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(10 * 0.07 * 2)
    expect(calc.compute(char.combat.anomProf).val).toBeCloseTo(100)
  })

  it('FusionCompiler', () => {
    const { data, characterKey } = testCharacterData('FusionCompiler')
    data.push(
      cond(
        characterKey,
        'FusionCompiler',
        conditionals.FusionCompiler.specialUsed.name,
        3
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.atk_).val).toBeCloseTo(0.24)
    expect(calc.compute(char.combat.anomProf).val).toBeCloseTo(3 * 50)
  })

  it('GildedBlossom', () => {
    const { data, characterKey } = testCharacterData('GildedBlossom')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.atk_).val).toBeCloseTo(0.096)
    expect(calc.compute(char.final.dmg_.exSpecial[0]).val).toBeCloseTo(0.24)
  })

  it('HailstormShrine', () => {
    const { data, characterKey } = testCharacterData('HailstormShrine')
    data.push(
      cond(
        characterKey,
        'HailstormShrine',
        conditionals.HailstormShrine.exSpecialOrAnomaly.name,
        2
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    // Base + passive
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.8)
    expect(calc.compute(char.final.dmg_.ice).val).toBeCloseTo(2 * 0.32)
  })

  it('HeartstringNocturne', () => {
    const { data, characterKey } = testCharacterData('HeartstringNocturne')
    data.push(
      cond(
        characterKey,
        'HeartstringNocturne',
        conditionals.HeartstringNocturne.heartstring.name,
        2
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    // Base + passive
    expect(calc.compute(char.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.8)
    expect(calc.compute(char.final.resIgn_.fire.chain[0]).val).toBeCloseTo(
      2 * 0.2
    )
    expect(calc.compute(char.final.resIgn_.fire.ult[0]).val).toBeCloseTo(
      2 * 0.2
    )
  })

  it('HellfireGears', () => {
    const { data, characterKey } = testCharacterData('HellfireGears')
    data.push(
      cond(
        characterKey,
        'HellfireGears',
        conditionals.HellfireGears.offField.name,
        1
      ),
      cond(
        characterKey,
        'HellfireGears',
        conditionals.HellfireGears.exSpecialUsed.name,
        2
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.enerRegen).val).toBeCloseTo(1.2)
    expect(calc.compute(char.combat.impact_).val).toBeCloseTo(2 * 0.2)
  })

  it('Housekeeper', () => {
    const { data, characterKey } = testCharacterData('Housekeeper')
    data.push(
      cond(
        characterKey,
        'Housekeeper',
        conditionals.Housekeeper.offField.name,
        1
      ),
      cond(
        characterKey,
        'Housekeeper',
        conditionals.Housekeeper.exSpecialHits.name,
        15
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.enerRegen).val).toBeCloseTo(0.72)
    expect(calc.compute(char.combat.dmg_.physical).val).toBeCloseTo(15 * 0.048)
  })

  it('IceJadeTeapot', () => {
    const { data, characterKey } = testCharacterData('IceJadeTeapot')
    data.push(
      cond(
        characterKey,
        'IceJadeTeapot',
        conditionals.IceJadeTeapot.teariffic.name,
        30
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.impact_).val).toBeCloseTo(30 * 0.014)
    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.32)
  })

  it('IdentityBase', () => {
    const { data, characterKey } = testCharacterData('IdentityBase')
    data.push(
      cond(
        characterKey,
        'IdentityBase',
        conditionals.IdentityBase.equipperAttacked.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.def_).val).toBeCloseTo(0.32)
  })

  // IdentityInflection should be here but no conds

  it('KaboomTheCannon', () => {
    const { data, characterKey } = testCharacterData('KaboomTheCannon')
    data.push(
      cond(
        characterKey,
        'KaboomTheCannon',
        conditionals.KaboomTheCannon.allyHitsEnemy.name,
        4
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.atk_).val).toBeCloseTo(4 * 0.04)
  })

  it('LunarDecrescent', () => {
    const { data, characterKey } = testCharacterData('LunarDecrescent')
    data.push(
      cond(
        characterKey,
        'LunarDecrescent',
        conditionals.LunarDecrescent.chainOrUltUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.final.common_dmg_).val).toBeCloseTo(0.25)
  })

  // LunarNoviluna should be here but no conds

  it('LunarPleniluna', () => {
    const { data, characterKey } = testCharacterData('LunarPleniluna')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.final.dmg_.basic[0]).val).toBeCloseTo(0.2)
    expect(calc.compute(char.final.dmg_.dash[0]).val).toBeCloseTo(0.2)
    expect(calc.compute(char.final.dmg_.dodgeCounter[0]).val).toBeCloseTo(0.2)
  })

  it('MagneticStormAlpha', () => {
    const { data, characterKey } = testCharacterData('MagneticStormAlpha')
    data.push(
      cond(
        characterKey,
        'MagneticStormAlpha',
        conditionals.MagneticStormAlpha.anomalyBuildupIncreased.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.anomMas).val).toBeCloseTo(40)
  })

  it('MagneticStormBravo', () => {
    const { data, characterKey } = testCharacterData('MagneticStormBravo')
    data.push(
      cond(
        characterKey,
        'MagneticStormBravo',
        conditionals.MagneticStormBravo.anomalyBuildupIncreased.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })

    expect(calc.compute(char.combat.anomProf).val).toBeCloseTo(40)
  })

  // MagneticStormCharlie should be here but no conds
})
