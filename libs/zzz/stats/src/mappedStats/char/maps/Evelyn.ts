import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Evelyn'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackRazorWire: data_gen.skillParams['basic']['BasicAttackRazorWire'],
    PassiveBind: data_gen.skillParams['basic']['PassiveBind'],
    BasicAttackGarroteFirstForm:
      data_gen.skillParams['basic']['BasicAttackGarroteFirstForm'],
    BasicAttackGarroteSecondForm:
      data_gen.skillParams['basic']['BasicAttackGarroteSecondForm'],
  },
  dodge: {
    DodgeArcStep: data_gen.skillParams['dodge']['DodgeArcStep'],
    DashAttackPiercingAmbush:
      data_gen.skillParams['dodge']['DashAttackPiercingAmbush'],
    DodgeCounterStranglingReversal:
      data_gen.skillParams['dodge']['DodgeCounterStranglingReversal'],
  },
  special: {
    SpecialAttackLockedPosition:
      data_gen.skillParams['special']['SpecialAttackLockedPosition'],
    SpecialAttackBindingSunderFirstForm:
      data_gen.skillParams['special']['SpecialAttackBindingSunderFirstForm'],
    EXSpecialAttackBindingSunderFinalForm:
      data_gen.skillParams['special']['EXSpecialAttackBindingSunderFinalForm'],
  },
  chain: {
    ChainAttackLunaluxSnare:
      data_gen.skillParams['chain']['ChainAttackLunaluxSnare'],
    UltimateLunaluxGarroteTimbre:
      data_gen.skillParams['chain']['UltimateLunaluxGarroteTimbre'],
    UltimateLunaluxGarroteShadow:
      data_gen.skillParams['chain']['UltimateLunaluxGarroteShadow'],
  },
  assist: {
    QuickAssistFierceBlade:
      data_gen.skillParams['assist']['QuickAssistFierceBlade'],
    DefensiveAssistSilentProtection:
      data_gen.skillParams['assist']['DefensiveAssistSilentProtection'],
    AssistFollowUpCourseDisruption:
      data_gen.skillParams['assist']['AssistFollowUpCourseDisruption'],
  },
  core: {
    crit_: data_gen.coreParams[0],
    duration: data_gen.coreParams[1][0],
  },
  ability: {
    chain_ult_dmg_: data_gen.abilityParams[0],
    crit_threshold: data_gen.abilityParams[1],
    dmg_mult_: data_gen.abilityParams[2],
  },
  m1: {
    decibels: data_gen.mindscapeParams[0][0],
    defIgn_: data_gen.mindscapeParams[0][1],
    duration: data_gen.mindscapeParams[0][2],
  },
  m2: {
    atk_: data_gen.mindscapeParams[1][0],
    cooldown: data_gen.mindscapeParams[1][1],
  },
  m4: {
    shield: data_gen.mindscapeParams[3][0],
    crit_dmg_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    duration: data_gen.mindscapeParams[5][0],
    dmg: data_gen.mindscapeParams[5][1],
    trigger_count: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
