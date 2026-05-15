import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Seed'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackChrysanthemumWheelDance:
      data_gen.skillParams['basic']['BasicAttackChrysanthemumWheelDance'],
    BasicAttackFallingPetalsSlaughter:
      data_gen.skillParams['basic']['BasicAttackFallingPetalsSlaughter'],
    BasicAttackFallingPetalsDownfall:
      data_gen.skillParams['basic']['BasicAttackFallingPetalsDownfall'],
    BasicAttackFallingPetalsDownfallFirstForm:
      data_gen.skillParams['basic'][
        'BasicAttackFallingPetalsDownfallFirstForm'
      ],
    BasicAttackFallingPetalsDownfallSecondForm:
      data_gen.skillParams['basic'][
        'BasicAttackFallingPetalsDownfallSecondForm'
      ],
  },
  dodge: {
    DodgeRunningOnPetals: data_gen.skillParams['dodge']['DodgeRunningOnPetals'],
    DashAttackMagneticWheelDance:
      data_gen.skillParams['dodge']['DashAttackMagneticWheelDance'],
    DodgeCounterBlossomBurst:
      data_gen.skillParams['dodge']['DodgeCounterBlossomBurst'],
  },
  special: {
    SpecialAttackWitheredInFrost:
      data_gen.skillParams['special']['SpecialAttackWitheredInFrost'],
    EXSpecialAttackRainingIronPetals:
      data_gen.skillParams['special']['EXSpecialAttackRainingIronPetals'],
    EXSpecialAttackRainingIronPetalsAway:
      data_gen.skillParams['special']['EXSpecialAttackRainingIronPetalsAway'],
  },
  chain: {
    ChainAttackTempestOfFrostyPetals:
      data_gen.skillParams['chain']['ChainAttackTempestOfFrostyPetals'],
    UltimateClockworkGardenBloom:
      data_gen.skillParams['chain']['UltimateClockworkGardenBloom'],
  },
  assist: {
    QuickAssistBarrageOfRainingFlowers:
      data_gen.skillParams['assist']['QuickAssistBarrageOfRainingFlowers'],
    DefensiveAssistSproutingBarrier:
      data_gen.skillParams['assist']['DefensiveAssistSproutingBarrier'],
    AssistFollowUpCrimsonCoreBurst:
      data_gen.skillParams['assist']['AssistFollowUpCrimsonCoreBurst'],
  },
  core: {
    onslaught_atk: data_gen.coreParams[0],
    onslaught_crit_dmg_: data_gen.coreParams[1],
    direct_strike_atk: data_gen.coreParams[2],
    direct_strike_crit_dmg_: data_gen.coreParams[3],
    dmg_: data_gen.coreParams[4],
    lingering_duration: data_gen.coreParams[5][0],
    duration: data_gen.coreParams[6][0],
    energy_consumed: data_gen.coreParams[7][0],
    steel_charge: data_gen.coreParams[8][0],
  },
  ability: {
    energy: data_gen.abilityParams[0],
    cooldown: data_gen.abilityParams[1],
    basic_ult_dmg_: data_gen.abilityParams[2],
    electric_resIgn_: data_gen.abilityParams[3],
  },
  m1: {
    steel_charge_threshold: data_gen.mindscapeParams[0][0],
    steel_charge_consumed: data_gen.mindscapeParams[0][1],
    steel_charge_required: data_gen.mindscapeParams[0][2],
    steel_charge_gained_entering: data_gen.mindscapeParams[0][3],
    steel_charge_gained_ult: data_gen.mindscapeParams[0][4],
    basic_crit_dmg_: data_gen.mindscapeParams[0][5],
  },
  m2: {
    besiege_defIgn_: data_gen.mindscapeParams[1][0],
    energy_consumed: data_gen.mindscapeParams[1][1],
    max_energy_consumed: data_gen.mindscapeParams[1][2],
    energy_consumed_step: data_gen.mindscapeParams[1][3],
    basic_dmg_: data_gen.mindscapeParams[1][4],
  },
  m4: {
    decibel_regen: data_gen.mindscapeParams[3][0],
    ult_dmg_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    crit_dmg_: data_gen.mindscapeParams[5][0],
    laser_beams: data_gen.mindscapeParams[5][1],
    dmg: data_gen.mindscapeParams[5][2],
    cooldown: data_gen.mindscapeParams[5][3],
  },
} as const

export default dm
