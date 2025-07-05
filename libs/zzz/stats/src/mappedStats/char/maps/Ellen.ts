import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Ellen'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSawTeethTrimming:
      data_gen.skillParams['basic']['BasicAttackSawTeethTrimming'],
    BasicAttackFlashFreezeTrimming:
      data_gen.skillParams['basic']['BasicAttackFlashFreezeTrimming'],
    BasicAttackGlacialBladeWave:
      data_gen.skillParams['basic']['BasicAttackGlacialBladeWave'],
    BasicAttackIcyBlade: data_gen.skillParams['basic']['BasicAttackIcyBlade'],
  },
  dodge: {
    DodgeVortex: data_gen.skillParams['dodge']['DodgeVortex'],
    DashRoamingHunt: data_gen.skillParams['dodge']['DashRoamingHunt'],
    DashAttackArcticAmbush:
      data_gen.skillParams['dodge']['DashAttackArcticAmbush'],
    FlashFreeze: data_gen.skillParams['dodge']['FlashFreeze'],
    DashAttackMonstrousWave:
      data_gen.skillParams['dodge']['DashAttackMonstrousWave'],
    DashAttackColdSnap: data_gen.skillParams['dodge']['DashAttackColdSnap'],
    DodgeCounterReefRock: data_gen.skillParams['dodge']['DodgeCounterReefRock'],
  },
  special: {
    SpecialAttackDrift: data_gen.skillParams['special']['SpecialAttackDrift'],
    EXSpecialAttackTailSwipe:
      data_gen.skillParams['special']['EXSpecialAttackTailSwipe'],
    EXSpecialAttackSharknami:
      data_gen.skillParams['special']['EXSpecialAttackSharknami'],
  },
  chain: {
    ChainAttackAvalanche: data_gen.skillParams['chain']['ChainAttackAvalanche'],
    UltimateEndlessWinter:
      data_gen.skillParams['chain']['UltimateEndlessWinter'],
  },
  assist: {
    QuickAssistSharkSentinel:
      data_gen.skillParams['assist']['QuickAssistSharkSentinel'],
    DefensiveAssistWavefrontImpact:
      data_gen.skillParams['assist']['DefensiveAssistWavefrontImpact'],
    AssistFollowUpSharkCruiser:
      data_gen.skillParams['assist']['AssistFollowUpSharkCruiser'],
  },
  core: {
    crit_dmg_: data_gen.coreParams[0],
  },
  ability: {
    ice_dmg_: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
    stacks: data_gen.abilityParams[2],
  },
  m1: {
    swift_charges: data_gen.mindscapeParams[0][0],
    charged_charges: data_gen.mindscapeParams[0][1],
    crit_: data_gen.mindscapeParams[0][2],
    duration: data_gen.mindscapeParams[0][3],
    stacks: data_gen.mindscapeParams[0][4],
  },
  m2: {
    crit_dmg_: data_gen.mindscapeParams[1][0],
    max_crit_dmg_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    charges: data_gen.mindscapeParams[3][0],
    energy: data_gen.mindscapeParams[3][1],
    cooldown: data_gen.mindscapeParams[3][2],
  },
  m6: {
    pen_: data_gen.mindscapeParams[5][0],
    duration: data_gen.mindscapeParams[5][1],
    feast_begins_gain: data_gen.mindscapeParams[5][2],
    max_stacks: data_gen.mindscapeParams[5][3],
    stack_threshold: data_gen.mindscapeParams[5][4],
    mv_mult_: data_gen.mindscapeParams[5][5],
  },
} as const

export default dm
