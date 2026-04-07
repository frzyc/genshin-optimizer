import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'NangongYu'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackShootingStarStep1: data_gen.skillParams['basic']['BasicAttackShootingStarStep1'],
    BasicAttackShootingStarStep2: data_gen.skillParams['basic']['BasicAttackShootingStarStep2'],
    BasicAttackShootingStarStep3: data_gen.skillParams['basic']['BasicAttackShootingStarStep3'],
    BasicAttackAdorableExplosive1: data_gen.skillParams['basic']['BasicAttackAdorableExplosive1'],
    BasicAttackAdorableExplosive2: data_gen.skillParams['basic']['BasicAttackAdorableExplosive2'],
    BasicAttackAdorableExplosive3: data_gen.skillParams['basic']['BasicAttackAdorableExplosive3'],
    AssistFollowUp: data_gen.skillParams['basic']['AssistFollowUp'],
  },
  dodge: {
    DodgeSlide: data_gen.skillParams['dodge']['DodgeSlide'],
    DashAttackSpinningMeteor: data_gen.skillParams['dodge']['DashAttackSpinningMeteor'],
    DodgeCounterAsteroidWaltz: data_gen.skillParams['dodge']['DodgeCounterAsteroidWaltz'],
  },
  special: {
    SpecialAttackWeightOfLove: data_gen.skillParams['special']['SpecialAttackWeightOfLove'],
    EXSpecialAttackUnbearableWeightOfLove: data_gen.skillParams['special']['EXSpecialAttackUnbearableWeightOfLove'],
  },
  chain: {
    ChainAttackCometGravity: data_gen.skillParams['chain']['ChainAttackCometGravity'],
    UltimateMeteorShower: data_gen.skillParams['chain']['UltimateMeteorShower'],
  },
  assist: {
    QuickAssistEmergencySave: data_gen.skillParams['assist']['QuickAssistEmergencySave'],
    DefensiveAssistPerfectedChoreographyLight: data_gen.skillParams['assist']['DefensiveAssistPerfectedChoreographyLight'],
    DefensiveAssistPerfectedChoreographyHeavy: data_gen.skillParams['assist']['DefensiveAssistPerfectedChoreographyHeavy'],
    DefensiveAssistPerfectedChoreographyChain: data_gen.skillParams['assist']['DefensiveAssistPerfectedChoreographyChain'],
    AssistFollowUpImprovised: data_gen.skillParams['assist']['AssistFollowUpImprovised'],
  },
  core: {
    anomProf: data_gen.coreParams[0],
    atk: data_gen.coreParams[1],
  },
  ability: {
    anomMas_threshold: data_gen.abilityParams[0],
    anomMas_impact: data_gen.abilityParams[1],
    chain_resPen: data_gen.abilityParams[2],
    chain_anomBuildup: data_gen.abilityParams[3],
    dazeInc: data_gen.abilityParams[4],
    m2_vibrato_dmg: data_gen.abilityParams[5],
    m2_stun_dmg_mult: data_gen.abilityParams[6],
    ult_atk: data_gen.abilityParams[7],
  },
  m1: {
    resRed: data_gen.mindscapeParams[0][0],
    duration: data_gen.mindscapeParams[0][1],
  },
  m2: {
    vibrato_dmg: data_gen.mindscapeParams[1][0],
    stun_dmg_mult: data_gen.mindscapeParams[1][1],
  },
  m4: {
    anomProf: data_gen.mindscapeParams[3][0],
    charge_anomBuildup: data_gen.mindscapeParams[3][1],
  },
  m6: {
    dazeInc: data_gen.mindscapeParams[5][0],
  },
} as const

export default dm
