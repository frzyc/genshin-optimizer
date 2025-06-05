import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Trigger'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackColdBoreShot:
      data_gen.skillParams['basic']['BasicAttackColdBoreShot'],
    BasicAttackSilencedShot:
      data_gen.skillParams['basic']['BasicAttackSilencedShot'],
    BasicAttackHarmonizingShot:
      data_gen.skillParams['basic']['BasicAttackHarmonizingShot'],
    BasicAttackHarmonizingShotTartarus:
      data_gen.skillParams['basic']['BasicAttackHarmonizingShotTartarus'],
  },
  dodge: {
    DodgePhantomConcealment:
      data_gen.skillParams['dodge']['DodgePhantomConcealment'],
    DashAttackVengefulSpecter:
      data_gen.skillParams['dodge']['DashAttackVengefulSpecter'],
    DodgeCounterCondemnedSoul:
      data_gen.skillParams['dodge']['DodgeCounterCondemnedSoul'],
  },
  special: {
    SpecialAttackSpectralFlash:
      data_gen.skillParams['special']['SpecialAttackSpectralFlash'],
    EXSpecialAttackFlashBurial:
      data_gen.skillParams['special']['EXSpecialAttackFlashBurial'],
  },
  chain: {
    ChainAttackStygianGuide:
      data_gen.skillParams['chain']['ChainAttackStygianGuide'],
    UltimateUnderworldRequiem:
      data_gen.skillParams['chain']['UltimateUnderworldRequiem'],
  },
  assist: {
    QuickAssistColdBoreCoverFire:
      data_gen.skillParams['assist']['QuickAssistColdBoreCoverFire'],
    DefensiveAssistDelayingDemise:
      data_gen.skillParams['assist']['DefensiveAssistDelayingDemise'],
    AssistFollowUpPiercingThunder:
      data_gen.skillParams['assist']['AssistFollowUpPiercingThunder'],
  },
  core: {
    stun_: data_gen.coreParams[0],
    duration: data_gen.coreParams[1],
  },
  ability: {
    crit_threshold_: data_gen.abilityParams[0],
    crit_step_: data_gen.abilityParams[1],
    aftershock_dazeInc_: data_gen.abilityParams[2],
    max_dazeInc_: data_gen.abilityParams[3],
  },
  m1: {
    stun_: data_gen.mindscapeParams[0][0],
    cooldown: data_gen.mindscapeParams[0][1],
    purge_gained_: data_gen.mindscapeParams[0][2],
    max_purge: data_gen.mindscapeParams[0][3],
  },
  m2: {
    aftershock_huntersGaze: data_gen.mindscapeParams[1][0],
    finishing_move_huntersGaze: data_gen.mindscapeParams[1][1],
    crit_dmg_: data_gen.mindscapeParams[1][2],
    stacks: data_gen.mindscapeParams[1][3],
    duration: data_gen.mindscapeParams[1][4],
  },
  m4: {
    dmg: data_gen.mindscapeParams[3][0],
    daze: data_gen.mindscapeParams[3][1],
  },
  m6: {
    battle_start_rounds: data_gen.mindscapeParams[5][0],
    purge_consumed: data_gen.mindscapeParams[5][1],
    round_gain: data_gen.mindscapeParams[5][2],
    max_rounds: data_gen.mindscapeParams[5][3],
    consumed_rounds: data_gen.mindscapeParams[5][4],
    round_electric_dmg: data_gen.mindscapeParams[5][5],
    round_dmg_: data_gen.mindscapeParams[5][6],
    cooldown: data_gen.mindscapeParams[5][7],
  },
} as const

export default dm
