import { prettify } from '@genshin-optimizer/common/util'
import {
  compileTagMapValues,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type {
  RelicMainStatKey,
  RelicSetKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import { data, keys, values } from '..'
import { conditionals } from '../..'
import { Calculator } from '../../calculator'
import {
  charTagMapNodeEntries,
  relicTagMapNodeEntries,
  teamData,
  withMember,
} from '../../util'
import type { Read } from '../util'
import {
  conditionalEntries,
  convert,
  enemy,
  own,
  ownBuff,
  ownTag,
  type TagMapNodeEntries,
} from '../util'

setDebugMode(true)
Object.assign(values, compileTagMapValues(keys, data))

function testCharacterData(
  setKey: RelicSetKey,
  relicStats: Partial<Record<RelicMainStatKey | RelicSubStatKey, number>> = {},
  otherCharData: TagMapNodeEntries = [],
) {
  const data: TagMapNodeEntries = [
    ...teamData(['Seele']),
    ...withMember(
      'Seele',
      ...charTagMapNodeEntries(
        {
          level: 80,
          ascension: 6,
          key: 'Seele',
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
        1,
      ),
      ...relicTagMapNodeEntries(relicStats, { [setKey]: 4 }),
      ...otherCharData,
    ),
    own.common.critMode.add('avg'),
    enemy.common.res.quantum.add(0.1),
    enemy.common.isBroken.add(0),
  ]
  return data
}

function testTeamData(
  setKey: RelicSetKey,
  relicStats: Partial<Record<RelicMainStatKey | RelicSubStatKey, number>> = {},
  otherCharData: TagMapNodeEntries = [],
) {
  const data: TagMapNodeEntries = [
    ...teamData(['Seele', 'SilverWolf']),
    ...withMember(
      'Seele',
      ...charTagMapNodeEntries(
        {
          level: 80,
          ascension: 6,
          key: 'Seele',
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
        1,
      ),
      ...relicTagMapNodeEntries(relicStats, { [setKey]: 4 }),
      ...otherCharData,
    ),
    ...withMember(
      'SilverWolf',
      ...charTagMapNodeEntries(
        {
          level: 80,
          ascension: 6,
          key: 'SilverWolf',
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
        2,
      ),
      ...otherCharData,
    ),
    own.common.critMode.add('avg'),
    enemy.common.res.quantum.add(0.1),
    enemy.common.isBroken.add(0),
  ]
  return data
}

function cond(setKey: RelicSetKey, name: string, value: number) {
  return conditionalEntries(setKey, 'Seele', null)(name, value)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printDebug(calc: Calculator, read: Read) {
  console.log(prettify(calc.toDebug().compute(read)))
}

describe('Relic sheets test', () => {
  it('BandOfSizzlingThunder', () => {
    const data = testCharacterData('BandOfSizzlingThunder')
    data.push(
      cond(
        'BandOfSizzlingThunder',
        conditionals.BandOfSizzlingThunder.skillUsed.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.dmg_.lightning).val).toBeCloseTo(0.1)
    expect(calc.compute(seele.final.atk_).val).toBeCloseTo(0.2)
  })

  it('BelobogOfTheArchitects', () => {
    const data = testCharacterData('BelobogOfTheArchitects', undefined, [
      ownBuff.premod.eff_.add(0.5),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.def_).val).toBeCloseTo(0.3)
  })

  it('BrokenKeel', () => {
    const data = testCharacterData('BrokenKeel', undefined, [
      // Add 0.2 to check if the 2 set bonus is applied
      ownBuff.premod.eff_res_.add(0.2),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.eff_res_).val).toBeCloseTo(0.3)
    expect(calc.compute(seele.final.crit_dmg_).val).toBeCloseTo(0.6)
  })

  it('CelestialDifferentiator', () => {
    const data = testCharacterData('CelestialDifferentiator', undefined, [
      // Add 0.54 to check if the 2 set bonus is applied
      ownBuff.premod.crit_dmg_.add(0.54),
    ])
    data.push(
      cond(
        'CelestialDifferentiator',
        conditionals.CelestialDifferentiator.firstAttack.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.crit_dmg_).val).toBeCloseTo(1.2)
    expect(calc.compute(seele.final.crit_).val).toBeCloseTo(0.65)
  })

  it('ChampionOfStreetwiseBoxing', () => {
    const data = testCharacterData('ChampionOfStreetwiseBoxing')
    data.push(
      cond(
        'ChampionOfStreetwiseBoxing',
        conditionals.ChampionOfStreetwiseBoxing.hits.name,
        5,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.dmg_.physical).val).toBeCloseTo(0.1)
    expect(calc.compute(seele.final.atk_).val).toBeCloseTo(0.25)
  })

  it('DuranDynastyOfRunningWolves', () => {
    const data = testCharacterData('DuranDynastyOfRunningWolves')
    data.push(
      cond(
        'DuranDynastyOfRunningWolves',
        conditionals.DuranDynastyOfRunningWolves.merit.name,
        5,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.dmg_.followUp[0]).val).toBeCloseTo(0.25)
    expect(calc.compute(seele.final.crit_dmg_).val).toBeCloseTo(0.75)
  })

  it('EagleOfTwilightLine', () => {
    const data = testCharacterData('EagleOfTwilightLine')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.dmg_.wind).val).toBeCloseTo(0.1)
  })

  it('FiresmithOfLavaForging', () => {
    const data = testCharacterData('FiresmithOfLavaForging')
    data.push(
      cond(
        'FiresmithOfLavaForging',
        conditionals.FiresmithOfLavaForging.ultUsed.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.dmg_.fire).val).toBeCloseTo(0.22)
    expect(calc.compute(seele.final.dmg_.skill[0]).val).toBeCloseTo(0.12)
  })

  it('FirmamentFrontlineGlamoth', () => {
    const data = testCharacterData('FirmamentFrontlineGlamoth', undefined, [
      ownBuff.premod.spd.add(45),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.common_dmg_).val).toBeCloseTo(0.18)
  })

  it('FleetOfTheAgeless', () => {
    const data = testCharacterData('FleetOfTheAgeless', undefined, [
      ownBuff.premod.spd.add(5),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.hp_).val).toBeCloseTo(0.12)
    expect(calc.compute(seele.final.atk_).val).toBeCloseTo(0.08)
  })

  it('ForgeOfTheKalpagniLantern', () => {
    const data = testCharacterData('ForgeOfTheKalpagniLantern')
    data.push(
      cond(
        'ForgeOfTheKalpagniLantern',
        conditionals.ForgeOfTheKalpagniLantern.enemyHit.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.spd_.fire).val).toBeCloseTo(0.06)
    expect(calc.compute(seele.final.brEffect_).val).toBeCloseTo(0.4)
  })

  it('GeniusOfBrilliantStars', () => {
    const data = testCharacterData('GeniusOfBrilliantStars')
    data.push(
      cond(
        'GeniusOfBrilliantStars',
        conditionals.GeniusOfBrilliantStars.hasQuantumWeakness.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.dmg_.quantum).val).toBeCloseTo(0.1)
    expect(calc.compute(seele.final.defIgn_).val).toBeCloseTo(0.2)
  })

  it('HunterOfGlacialForest', () => {
    const data = testCharacterData('HunterOfGlacialForest')
    data.push(
      cond(
        'HunterOfGlacialForest',
        conditionals.HunterOfGlacialForest.ultUsed.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.dmg_.ice).val).toBeCloseTo(0.1)
    expect(calc.compute(seele.final.crit_dmg_).val).toBeCloseTo(0.75)
  })

  it('InertSalsotto', () => {
    const data = testCharacterData('InertSalsotto', undefined, [
      ownBuff.premod.crit_.add(0.37),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.crit_).val).toBeCloseTo(0.5)
    expect(calc.compute(seele.final.dmg_.ult[0]).val).toBeCloseTo(0.15)
    expect(calc.compute(seele.final.dmg_.followUp[0]).val).toBeCloseTo(0.15)
  })

  it('IronCavalryAgainstTheScourge', () => {
    const data = testCharacterData('IronCavalryAgainstTheScourge', undefined, [
      ownBuff.premod.brEffect_.add(2.34),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    // Assumed bonus + 2 set
    expect(calc.compute(seele.final.brEffect_).val).toBeCloseTo(2.34 + 0.16)
    // First + second part of 4 set bonus
    expect(calc.compute(seele.final.defIgn_.break[0]).val).toBeCloseTo(
      0.1 + 0.15,
    )
  })

  it('IzumoGenseiAndTakamaDivineRealm', () => {
    const data = testCharacterData('IzumoGenseiAndTakamaDivineRealm')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.atk_).val).toBeCloseTo(0.12)
    // Base + 2 set bonus
    expect(calc.compute(seele.final.crit_).val).toBeCloseTo(0.05 + 0.12)
  })

  it('KnightOfPurityPalace', () => {
    const data = testCharacterData('KnightOfPurityPalace')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.def_).val).toBeCloseTo(0.15)
  })

  it('LongevousDisciple', () => {
    const data = testCharacterData('LongevousDisciple')
    data.push(
      cond('LongevousDisciple', conditionals.LongevousDisciple.stacks.name, 2),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.hp_).val).toBeCloseTo(0.12)
    // Base + 4 set bonus
    expect(calc.compute(seele.final.crit_).val).toBeCloseTo(0.05 + 0.16)
  })

  it('MessengerTraversingHackerspace', () => {
    const data = testCharacterData('MessengerTraversingHackerspace')
    data.push(
      cond(
        'MessengerTraversingHackerspace',
        conditionals.MessengerTraversingHackerspace.ultUsed.name,
        2,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    // 2 set + 4 set bonus
    expect(calc.compute(seele.final.spd_).val).toBeCloseTo(0.06 + 0.12)
  })

  it('MusketeerOfWildWheat', () => {
    const data = testCharacterData('MusketeerOfWildWheat')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.atk_).val).toBeCloseTo(0.12)
    expect(calc.compute(seele.final.spd_).val).toBeCloseTo(0.06)
    expect(calc.compute(seele.final.dmg_.basic[0]).val).toBeCloseTo(0.1)
  })

  it('PanCosmicCommercialEnterprise', () => {
    const data = testCharacterData('PanCosmicCommercialEnterprise', undefined, [
      ownBuff.premod.eff_.add(0.5),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    // (Assumed + 2 set bonus) * scaling
    expect(calc.compute(seele.final.atk_).val).toBeCloseTo((0.5 + 0.1) * 0.25)
    // Assumed + 2 set bonus
    expect(calc.compute(seele.final.eff_).val).toBeCloseTo(0.5 + 0.1)
  })

  it('PasserbyOfWanderingCloud', () => {
    const data = testCharacterData('PasserbyOfWanderingCloud')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.heal_).val).toBeCloseTo(0.1)
  })

  it('PenaconyLandOfTheDreams', () => {
    const data = testTeamData('PenaconyLandOfTheDreams')
    const calcSeele = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const calcSilverWolf = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'SilverWolf', dst: 'SilverWolf' })

    expect(calcSeele.compute(own.final.enerRegen_).val).toBeCloseTo(0.05)
    // Buff applies to other characters with same path
    expect(calcSeele.compute(own.final.common_dmg_).val).toBeCloseTo(0)
    expect(calcSilverWolf.compute(own.final.common_dmg_).val).toBeCloseTo(0.1)
  })

  it('PioneerDiverOfDeadWaters', () => {
    const data = testCharacterData('PioneerDiverOfDeadWaters')
    data.push(
      cond(
        'PioneerDiverOfDeadWaters',
        conditionals.PioneerDiverOfDeadWaters.affectedByDebuff.name,
        1,
      ),
      cond(
        'PioneerDiverOfDeadWaters',
        conditionals.PioneerDiverOfDeadWaters.debuffCount.name,
        3,
      ),
      cond(
        'PioneerDiverOfDeadWaters',
        conditionals.PioneerDiverOfDeadWaters.wearerDebuff.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.common_dmg_).val).toBeCloseTo(0.12)
    // Base + 4 set bonus
    expect(calc.compute(seele.final.crit_).val).toBeCloseTo(0.05 + 2 * 0.04)
    // Base + 4 set bonus
    expect(calc.compute(seele.final.crit_dmg_).val).toBeCloseTo(0.5 + 2 * 0.12)
  })

  it('PrisonerInDeepConfinement', () => {
    const data = testCharacterData('PrisonerInDeepConfinement')
    data.push(
      cond(
        'PrisonerInDeepConfinement',
        conditionals.PrisonerInDeepConfinement.dotCount.name,
        3,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.atk_).val).toBeCloseTo(0.12)
    expect(calc.compute(seele.final.defIgn_).val).toBeCloseTo(3 * 0.06)
  })

  it('RutilantArena', () => {
    const data = testCharacterData('RutilantArena', undefined, [
      ownBuff.premod.crit_.add(0.57),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    // Base + assumed + 2 set bonus
    expect(calc.compute(seele.final.crit_).val).toBeCloseTo(0.05 + 0.57 + 0.08)
    expect(calc.compute(seele.final.dmg_.basic[0]).val).toBeCloseTo(0.2)
    expect(calc.compute(seele.final.dmg_.skill[0]).val).toBeCloseTo(0.2)
  })

  it('SigoniaTheUnclaimedDesolation', () => {
    const data = testCharacterData('SigoniaTheUnclaimedDesolation')
    data.push(
      cond(
        'SigoniaTheUnclaimedDesolation',
        conditionals.SigoniaTheUnclaimedDesolation.enemiesDefeated.name,
        10,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    // Base + 2 set bonus
    expect(calc.compute(seele.final.crit_).val).toBeCloseTo(0.05 + 0.04)
    // Base + 2 set bonus
    expect(calc.compute(seele.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.4)
  })

  it('SpaceSealingStation', () => {
    const data = testCharacterData('SpaceSealingStation', undefined, [
      ownBuff.premod.spd.add(5),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.atk_).val).toBeCloseTo(0.12 + 0.12)
  })

  it('SprightlyVonwacq', () => {
    const data = testCharacterData('SprightlyVonwacq')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.enerRegen_).val).toBeCloseTo(0.05)
  })

  it('TaliaKingdomOfBanditry', () => {
    const data = testCharacterData('TaliaKingdomOfBanditry', undefined, [
      ownBuff.premod.spd.add(30),
    ])
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.brEffect_).val).toBeCloseTo(0.16 + 0.2)
  })

  it('TheAshblazingGrandDuke', () => {
    const data = testCharacterData('TheAshblazingGrandDuke')
    data.push(
      cond(
        'TheAshblazingGrandDuke',
        conditionals.TheAshblazingGrandDuke.followUpDmgDealt.name,
        8,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.dmg_.followUp[0]).val).toBeCloseTo(0.2)
    expect(calc.compute(seele.final.atk_).val).toBeCloseTo(8 * 0.06)
  })

  it('TheWindSoaringValorous', () => {
    const data = testCharacterData('TheWindSoaringValorous')
    data.push(
      cond(
        'TheWindSoaringValorous',
        conditionals.TheWindSoaringValorous.followUpUsed.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.atk_).val).toBeCloseTo(0.12)
    // Base + 4 set bonus
    expect(calc.compute(seele.final.crit_).val).toBeCloseTo(0.05 + 0.06)
    expect(calc.compute(seele.final.dmg_.ult[0]).val).toBeCloseTo(0.36)
  })

  it('ThiefOfShootingMeteor', () => {
    const data = testCharacterData('ThiefOfShootingMeteor')
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    // 2 set + 4 set bonus
    expect(calc.compute(seele.final.brEffect_).val).toBeCloseTo(0.16 + 0.16)
  })

  it('WastelanderOfBanditryDesert', () => {
    const data = testCharacterData('WastelanderOfBanditryDesert')
    data.push(
      cond(
        'WastelanderOfBanditryDesert',
        conditionals.WastelanderOfBanditryDesert.attackingDebuffed.name,
        1,
      ),
      cond(
        'WastelanderOfBanditryDesert',
        conditionals.WastelanderOfBanditryDesert.enemyImprisoned.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.dmg_.imaginary).val).toBeCloseTo(0.1)
    // Base + 4 set bonus
    expect(calc.compute(seele.final.crit_).val).toBeCloseTo(0.05 + 0.1)
    // Base + 4 set bonus
    expect(calc.compute(seele.final.crit_dmg_).val).toBeCloseTo(0.5 + 0.2)
  })

  it('WatchmakerMasterOfDreamMachinations', () => {
    const data = testCharacterData('WatchmakerMasterOfDreamMachinations')
    data.push(
      cond(
        'WatchmakerMasterOfDreamMachinations',
        conditionals.WatchmakerMasterOfDreamMachinations.useUltimateOnAlly.name,
        1,
      ),
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data),
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    // 2 set + 4 set bonus
    expect(calc.compute(seele.final.brEffect_).val).toBeCloseTo(0.16 + 0.3)
  })
})
