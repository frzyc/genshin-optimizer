import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Soldier11'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackWarmupSparks:
      data_gen.skillParams['basic']['BasicAttackWarmupSparks'],
    BasicAttackFireSuppression:
      data_gen.skillParams['basic']['BasicAttackFireSuppression'],
  },
  dodge: {
    DodgeTemperedFire: data_gen.skillParams['dodge']['DodgeTemperedFire'],
    DashAttackBlazingFire:
      data_gen.skillParams['dodge']['DashAttackBlazingFire'],
    DashAttackFireSuppression:
      data_gen.skillParams['dodge']['DashAttackFireSuppression'],
    DodgeCounterBackdraft:
      data_gen.skillParams['dodge']['DodgeCounterBackdraft'],
  },
  special: {
    SpecialAttackRagingFire:
      data_gen.skillParams['special']['SpecialAttackRagingFire'],
    EXSpecialAttackFerventFire:
      data_gen.skillParams['special']['EXSpecialAttackFerventFire'],
  },
  chain: {
    ChainAttackUpliftingFlame:
      data_gen.skillParams['chain']['ChainAttackUpliftingFlame'],
    UltimateBellowingFlame:
      data_gen.skillParams['chain']['UltimateBellowingFlame'],
  },
  assist: {
    QuickAssistCoveringFire:
      data_gen.skillParams['assist']['QuickAssistCoveringFire'],
    DefensiveAssistHoldTheLine:
      data_gen.skillParams['assist']['DefensiveAssistHoldTheLine'],
    AssistFollowUpReignition:
      data_gen.skillParams['assist']['AssistFollowUpReignition'],
  },
  core: {
    common_dmg_: data_gen.coreParams[0],
  },
  ability: {
    fire_dmg_: data_gen.abilityParams[1],
    fire_dmg_additional: data_gen.abilityParams[2],
  },
  m1: {
    energy_threshold: data_gen.mindscapeParams[0][1],
    energy: data_gen.mindscapeParams[0][2],
    cooldown: data_gen.mindscapeParams[0][3],
  },
  m2: {
    common_dmg_: data_gen.mindscapeParams[1][0],
    stacks: data_gen.mindscapeParams[1][1],
    duration: data_gen.mindscapeParams[1][2],
  },
  m4: {
    dmg_red_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    stacks: data_gen.mindscapeParams[5][1],
    max_stacks: data_gen.mindscapeParams[5][2],
    stacks_consumed: data_gen.mindscapeParams[5][3],
    fire_resIgn_: data_gen.mindscapeParams[5][4],
  },
} as const

export default dm
