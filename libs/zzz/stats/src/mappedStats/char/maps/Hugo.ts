import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Hugo'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackDarkAbyssQuartet:
      data_gen.skillParams['basic']['BasicAttackDarkAbyssQuartet'],
    BasicAttackDarkAbyssConcerto:
      data_gen.skillParams['basic']['BasicAttackDarkAbyssConcerto'],
  },
  dodge: {
    DodgePhantasm: data_gen.skillParams['dodge']['DodgePhantasm'],
    DashAttackPhantasmShatter:
      data_gen.skillParams['dodge']['DashAttackPhantasmShatter'],
    DodgeCounterPhantasmSlash:
      data_gen.skillParams['dodge']['DodgeCounterPhantasmSlash'],
  },
  special: {
    SpecialAttackSoulHunterJudgment:
      data_gen.skillParams['special']['SpecialAttackSoulHunterJudgment'],
    EXSpecialAttackSoulHunterPunishment:
      data_gen.skillParams['special']['EXSpecialAttackSoulHunterPunishment'],
  },
  chain: {
    ChainAttackTrickOfFate:
      data_gen.skillParams['chain']['ChainAttackTrickOfFate'],
    UltimateBlaspheme: data_gen.skillParams['chain']['UltimateBlaspheme'],
  },
  assist: {
    QuickAssistElegy: data_gen.skillParams['assist']['QuickAssistElegy'],
    DefensiveAssistTheEndHasNotCome:
      data_gen.skillParams['assist']['DefensiveAssistTheEndHasNotCome'],
    AssistFollowUpAceReversal:
      data_gen.skillParams['assist']['AssistFollowUpAceReversal'],
  },
  core: {
    dark_abyss_reverb_duration: data_gen.coreParams[0][0],
    crit_: data_gen.coreParams[1][0],
    crit_dmg_: data_gen.coreParams[2][0],
    stun_chars1: data_gen.coreParams[3][0],
    stun_chars2: data_gen.coreParams[4][0],
    atk1: data_gen.coreParams[5],
    atk2: data_gen.coreParams[6],
    mv_mult_1: data_gen.coreParams[7],
    stun_window1: data_gen.coreParams[8][0],
    mv_mult_2: data_gen.coreParams[9],
    stun_window2: data_gen.coreParams[10][0],
    stun_window3: data_gen.coreParams[11][0],
    mv_mult_3: data_gen.coreParams[12],
    max_mv_mult_: data_gen.coreParams[13][0],
    daze_: data_gen.coreParams[14][0],
    max_daze_: data_gen.coreParams[15][0],
    dazeInc_: data_gen.coreParams[16][0],
  },
  ability: {
    chain_dmg_: data_gen.abilityParams[0],
    chain_dmg_normal_enemies: data_gen.abilityParams[1],
    totalize_dmg_: data_gen.abilityParams[2],
    energy: data_gen.abilityParams[3],
    cooldown: data_gen.abilityParams[4],
  },
  m1: {
    crit_: data_gen.mindscapeParams[0][0],
    crit_dmg_: data_gen.mindscapeParams[0][1],
  },
  m2: {
    defIgn_: data_gen.mindscapeParams[1][0],
  },
  m4: {
    ice_resIgn_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    duration: data_gen.mindscapeParams[5][0],
    totalize_dmg_: data_gen.mindscapeParams[5][1],
    mv_mult_: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
