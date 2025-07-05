import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'AstraYao'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackCapriccio: data_gen.skillParams['basic']['BasicAttackCapriccio'],
    BasicAttackInterlude: data_gen.skillParams['basic']['BasicAttackInterlude'],
    BasicAttackChorus: data_gen.skillParams['basic']['BasicAttackChorus'],
    BasicAttackFinale: data_gen.skillParams['basic']['BasicAttackFinale'],
  },
  dodge: {
    DodgeMiniWaltz: data_gen.skillParams['dodge']['DodgeMiniWaltz'],
    DashAttackLunarEclipseMelody:
      data_gen.skillParams['dodge']['DashAttackLunarEclipseMelody'],
    DodgeCounterUmbrellaWaltz:
      data_gen.skillParams['dodge']['DodgeCounterUmbrellaWaltz'],
  },
  special: {
    SpecialAttackWindchimesOaths:
      data_gen.skillParams['special']['SpecialAttackWindchimesOaths'],
    IdyllicCadenza: data_gen.skillParams['special']['IdyllicCadenza'],
    Chord: data_gen.skillParams['special']['Chord'],
  },
  chain: {
    ChainAttackTipsyConcerto:
      data_gen.skillParams['chain']['ChainAttackTipsyConcerto'],
    UltimateFantasianSonata:
      data_gen.skillParams['chain']['UltimateFantasianSonata'],
  },
  assist: {
    QuickAssistOneLuminousSky:
      data_gen.skillParams['assist']['QuickAssistOneLuminousSky'],
    EvasiveAssistTwoHearts:
      data_gen.skillParams['assist']['EvasiveAssistTwoHearts'],
    AssistFollowUpThreeLifetimesOfFate:
      data_gen.skillParams['assist']['AssistFollowUpThreeLifetimesOfFate'],
  },
  core: {
    atk_: data_gen.coreParams[0],
    max_atk: data_gen.coreParams[1][0],
    duration: data_gen.coreParams[2][0],
    extension: data_gen.coreParams[3][0],
  },
  ability: {
    tremolo_amount: data_gen.abilityParams[0],
    tone_clusters_amount: data_gen.abilityParams[1],
  },
  m1: {
    resRed_: data_gen.mindscapeParams[0][0],
    max_stacks: data_gen.mindscapeParams[0][1],
    duration: data_gen.mindscapeParams[0][2],
    decibels_gained: data_gen.mindscapeParams[0][3],
    song_stacks_gained: data_gen.mindscapeParams[0][4],
    stack_duration: data_gen.mindscapeParams[0][5],
    inv_duration: data_gen.mindscapeParams[0][6],
  },
  m2: {
    atk_: data_gen.mindscapeParams[1][0],
    max_increase: data_gen.mindscapeParams[1][1],
    tremolo_amount: data_gen.mindscapeParams[1][2],
    tone_clusters_amount: data_gen.mindscapeParams[1][3],
    cooldown: data_gen.mindscapeParams[1][4],
  },
  m4: {
    timeframe: data_gen.mindscapeParams[3][0],
    interval: data_gen.mindscapeParams[3][1],
    cooldown: data_gen.mindscapeParams[3][2],
    attack: data_gen.mindscapeParams[3][3],
    anomaly: data_gen.mindscapeParams[3][4],
    stun: data_gen.mindscapeParams[3][5],
  },
  m6: {
    tremolo_tone_clusters_mv_mult: data_gen.mindscapeParams[5][0],
    crit_: data_gen.mindscapeParams[5][1],
    capriccio_crit_: data_gen.mindscapeParams[5][2],
    cooldown: data_gen.mindscapeParams[5][3],
  },
} as const

export default dm
