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
} as const

export default dm
