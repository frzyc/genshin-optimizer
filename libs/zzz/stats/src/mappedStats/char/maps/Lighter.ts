import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Lighter'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackLFormThunderingFist:
      data_gen.skillParams['basic']['BasicAttackLFormThunderingFist'],
  },
  dodge: {
    DodgeShadowedSlide: data_gen.skillParams['dodge']['DodgeShadowedSlide'],
    DashAttackChargingSlam:
      data_gen.skillParams['dodge']['DashAttackChargingSlam'],
    DodgeCounterBlazingFlash:
      data_gen.skillParams['dodge']['DodgeCounterBlazingFlash'],
  },
  special: {
    SpecialAttackVFormSunriseUppercut:
      data_gen.skillParams['special']['SpecialAttackVFormSunriseUppercut'],
    EXSpecialAttackVFormSunriseUppercutFullDistance:
      data_gen.skillParams['special'][
        'EXSpecialAttackVFormSunriseUppercutFullDistance'
      ],
  },
  chain: {
    ChainAttackVFormScorchingSun:
      data_gen.skillParams['chain']['ChainAttackVFormScorchingSun'],
    UltimateWFormCrownedInferno:
      data_gen.skillParams['chain']['UltimateWFormCrownedInferno'],
  },
  assist: {
    QuickAssistBlazingFlashGuard:
      data_gen.skillParams['assist']['QuickAssistBlazingFlashGuard'],
    DefensiveAssistSwiftBreak:
      data_gen.skillParams['assist']['DefensiveAssistSwiftBreak'],
    AssistFollowUpChargingSlamStab:
      data_gen.skillParams['assist']['AssistFollowUpChargingSlamStab'],
  },
  core: {
    morale_accu: data_gen.coreParams[0][0],
    additional_morale: data_gen.coreParams[1][0],
    max_morale: data_gen.coreParams[2][0],
    morale_threshold: data_gen.coreParams[3][0],
    morale_threshold_2: data_gen.coreParams[4][0],
    morale_consumed: data_gen.coreParams[5][0],
    impact_: data_gen.coreParams[6],
    max_impact_: data_gen.coreParams[7],
    impact_duration: data_gen.coreParams[8][0],
    ice_fire_resRed_: data_gen.coreParams[9][0],
    resRed_duration: data_gen.coreParams[10][0],
    stunned_duration: data_gen.coreParams[11][0],
  },
  ability: {
    stacks: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
    ice_fire_dmg_: data_gen.abilityParams[2],
    impact_threshold: data_gen.abilityParams[3],
    impact_step: data_gen.abilityParams[4],
    extra_ice_fire_dmg_: data_gen.abilityParams[5],
    max_ice_fire_dmg_: data_gen.abilityParams[6],
  },
  m1: {
    stun_duration: data_gen.mindscapeParams[0][0],
    ice_fire_resRed_: data_gen.mindscapeParams[0][1],
    final_hit_dmg_: data_gen.mindscapeParams[0][2],
  },
  m2: {
    stun_: data_gen.mindscapeParams[1][0],
    ability_buff_inc_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    enerRegen_: data_gen.mindscapeParams[3][0],
    energy: data_gen.mindscapeParams[3][1],
    cooldown: data_gen.mindscapeParams[3][2],
  },
  m6: {
    morale_eff_: data_gen.mindscapeParams[5][0],
    dmg: data_gen.mindscapeParams[5][1],
    cooldown: data_gen.mindscapeParams[5][2],
    impact_threshold: data_gen.mindscapeParams[5][3],
    dmg_mult_inc_: data_gen.mindscapeParams[5][4],
    max_dmg_mult_inc_: data_gen.mindscapeParams[5][5],
  },
} as const

export default dm
