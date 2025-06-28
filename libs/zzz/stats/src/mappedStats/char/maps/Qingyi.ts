import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Qingyi'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackPenultimate:
      data_gen.skillParams['basic']['BasicAttackPenultimate'],
    BasicAttackEnchantedBlossoms:
      data_gen.skillParams['basic']['BasicAttackEnchantedBlossoms'],
    FlashConnect: data_gen.skillParams['basic']['FlashConnect'],
    BasicAttackEnchantedMoonlitBlossoms:
      data_gen.skillParams['basic']['BasicAttackEnchantedMoonlitBlossoms'],
  },
  dodge: {
    DodgeSwanSong: data_gen.skillParams['dodge']['DodgeSwanSong'],
    DashAttackBreach: data_gen.skillParams['dodge']['DashAttackBreach'],
    DodgeCounterLingeringSentiments:
      data_gen.skillParams['dodge']['DodgeCounterLingeringSentiments'],
  },
  special: {
    SpecialAttackSunlitGlory:
      data_gen.skillParams['special']['SpecialAttackSunlitGlory'],
    EXSpecialAttackMoonlitBegonia:
      data_gen.skillParams['special']['EXSpecialAttackMoonlitBegonia'],
  },
  chain: {
    ChainAttackTranquilSerenade:
      data_gen.skillParams['chain']['ChainAttackTranquilSerenade'],
    UltimateEightSoundsOfGanzhou:
      data_gen.skillParams['chain']['UltimateEightSoundsOfGanzhou'],
  },
  assist: {
    QuickAssistWindThroughThePines:
      data_gen.skillParams['assist']['QuickAssistWindThroughThePines'],
    DefensiveAssistGracefulEmbellishment:
      data_gen.skillParams['assist']['DefensiveAssistGracefulEmbellishment'],
    AssistFollowUpSongOfTheClearRiver:
      data_gen.skillParams['assist']['AssistFollowUpSongOfTheClearRiver'],
  },
  core: {
    stacks_gained: data_gen.coreParams[0][0],
    max_stacks: data_gen.coreParams[1][0],
    stun_: data_gen.coreParams[2],
  },
  ability: {
    basic_daze_: data_gen.abilityParams[0],
    impact_threshold: data_gen.abilityParams[1],
    atk: data_gen.abilityParams[2],
    max_atk: data_gen.abilityParams[3],
  },
  m1: {
    accu_rate_: data_gen.mindscapeParams[0][0],
    defRed_: data_gen.mindscapeParams[0][1],
    crit_: data_gen.mindscapeParams[0][2],
    duration: data_gen.mindscapeParams[0][3],
  },
  m2: {
    stun_mult_: data_gen.mindscapeParams[1][0],
    dazeInc_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    shield: data_gen.mindscapeParams[3][0],
    energy: data_gen.mindscapeParams[3][1],
    cooldown: data_gen.mindscapeParams[3][2],
  },
  m6: {
    crit_dmg_: data_gen.mindscapeParams[5][0],
    resRed_: data_gen.mindscapeParams[5][1],
    duration: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
