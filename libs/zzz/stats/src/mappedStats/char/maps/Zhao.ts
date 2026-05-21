import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Zhao'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackGlacialJudgment:
      data_gen.skillParams['basic']['BasicAttackGlacialJudgment'],
    BasicAttackFinalVerdict:
      data_gen.skillParams['basic']['BasicAttackFinalVerdict'],
  },
  dodge: {
    DodgeBunnyHop: data_gen.skillParams['dodge']['DodgeBunnyHop'],
    DashAttackBouncingDash:
      data_gen.skillParams['dodge']['DashAttackBouncingDash'],
    DodgeCounterSwiftBlink:
      data_gen.skillParams['dodge']['DodgeCounterSwiftBlink'],
  },
  special: {
    SpecialAttackShatterfrostSurge:
      data_gen.skillParams['special']['SpecialAttackShatterfrostSurge'],
    EXSpecialAttackFrostflowTundra:
      data_gen.skillParams['special']['EXSpecialAttackFrostflowTundra'],
  },
  chain: {
    ChainAttackTemporaryAlliance:
      data_gen.skillParams['chain']['ChainAttackTemporaryAlliance'],
    UltimateBunnyBarrage: data_gen.skillParams['chain']['UltimateBunnyBarrage'],
  },
  assist: {
    EntrySkillBurstOfFrost:
      data_gen.skillParams['assist']['EntrySkillBurstOfFrost'],
    QuickAssistPatchTheGaps:
      data_gen.skillParams['assist']['QuickAssistPatchTheGaps'],
    DefensiveAssistFrostveilSuppression:
      data_gen.skillParams['assist']['DefensiveAssistFrostveilSuppression'],
    AssistFollowUpFrostlightReflection:
      data_gen.skillParams['assist']['AssistFollowUpFrostlightReflection'],
  },
  core: {
    crit_step: data_gen.coreParams[0],
    hpStep: data_gen.coreParams[1][0],
    initialFrostbitePointGain: data_gen.coreParams[2][0],
    investigationCooldown: data_gen.coreParams[3][0],
    maxFrostbitePoints: data_gen.coreParams[4][0],
    frostbitePointGain: data_gen.coreParams[5][0],
    frostbiteGainCooldown: data_gen.coreParams[6][0],
    hp_: data_gen.coreParams[7][0],
    veilDuration: data_gen.coreParams[8][0],
    atk: data_gen.coreParams[9],
    duration: data_gen.coreParams[10][0],
  },
  ability: {
    dmg_: data_gen.abilityParams[0],
    hpThreshold: data_gen.abilityParams[1],
    hpStep: data_gen.abilityParams[2],
    dmg_step: data_gen.abilityParams[3],
    maxDmg_: data_gen.abilityParams[4],
    maxHp: data_gen.abilityParams[5],
  },
  m1: {
    resIgn_: data_gen.mindscapeParams[0][0],
    duration: data_gen.mindscapeParams[0][1],
  },
  m2: {
    atk_: data_gen.mindscapeParams[1][0],
    team_atk_: data_gen.mindscapeParams[1][1],
    duration: data_gen.mindscapeParams[1][2],
  },
  m4: {
    decibels: data_gen.mindscapeParams[3][0],
    ultChainBasicCrit_dmg_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    critIncrease_: data_gen.mindscapeParams[5][0],
    finalVerdictChargeIncrease_: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm
