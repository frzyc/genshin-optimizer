import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Manato'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackBlazingWindSlash:
      data_gen.skillParams['basic']['BasicAttackBlazingWindSlash'],
    BasicAttackBlazingWindMistySlash:
      data_gen.skillParams['basic']['BasicAttackBlazingWindMistySlash'],
  },
  dodge: {
    DodgeRadiantBlade: data_gen.skillParams['dodge']['DodgeRadiantBlade'],
    DashAttackRadiantBladeZanshin:
      data_gen.skillParams['dodge']['DashAttackRadiantBladeZanshin'],
    DodgeCounterRadiantBladeBattleSweep:
      data_gen.skillParams['dodge']['DodgeCounterRadiantBladeBattleSweep'],
  },
  special: {
    SpecialAttackReturnToAshes:
      data_gen.skillParams['special']['SpecialAttackReturnToAshes'],
    SpecialAttackReturnToAshesSacrifice:
      data_gen.skillParams['special']['SpecialAttackReturnToAshesSacrifice'],
    EXSpecialAttackReturnToAshesFall:
      data_gen.skillParams['special']['EXSpecialAttackReturnToAshesFall'],
  },
  chain: {
    ChainAttackBlazingEruption:
      data_gen.skillParams['chain']['ChainAttackBlazingEruption'],
    UltimateMusouAratama: data_gen.skillParams['chain']['UltimateMusouAratama'],
  },
  assist: {
    QuickAssistLoneShadowRegroup:
      data_gen.skillParams['assist']['QuickAssistLoneShadowRegroup'],
    DefensiveAssistLoneShadowMountainStand:
      data_gen.skillParams['assist']['DefensiveAssistLoneShadowMountainStand'],
    AssistFollowUpLoneShadowBreakingFang:
      data_gen.skillParams['assist']['AssistFollowUpLoneShadowBreakingFang'],
  },
  core: {
    hpPoint: data_gen.coreParams[0][0],
    sheerForce: data_gen.coreParams[1][0],
    blazingHeart: data_gen.coreParams[2][0],
    blazingHeartThreshold: data_gen.coreParams[3][0],
    blazingHeartConsumed: data_gen.coreParams[4][0],
    crit_dmg_: data_gen.coreParams[5],
    adrenalineRegen_: data_gen.coreParams[6][0],
    crit_: data_gen.coreParams[7][0],
    fire_dmg_: data_gen.coreParams[8],
  },
  ability: {
    ult_remnantFlame: data_gen.abilityParams[0],
    chain_remnantFlame: data_gen.abilityParams[1],
    duration: data_gen.abilityParams[2],
    stacks: data_gen.abilityParams[3],
    hpThreshold: data_gen.abilityParams[4],
    healing: data_gen.abilityParams[5],
  },
  m1: {
    hpConsumed: data_gen.mindscapeParams[0][0],
    assist_basic_fire_dmg_: data_gen.mindscapeParams[0][1],
    max_dmg_: data_gen.mindscapeParams[0][2],
  },
  m2: {
    fire_resIgn_: data_gen.mindscapeParams[1][0],
  },
  m4: {
    hp_: data_gen.mindscapeParams[3][0],
    minHp: data_gen.mindscapeParams[3][1],
  },
  m6: {
    blazingHeartGained: data_gen.mindscapeParams[5][0],
    remnantFlameGained: data_gen.mindscapeParams[5][1],
    cooldown: data_gen.mindscapeParams[5][2],
    fire_dmg_: data_gen.mindscapeParams[5][3],
    duration: data_gen.mindscapeParams[5][4],
    stacks: data_gen.mindscapeParams[5][5],
  },
} as const

export default dm
