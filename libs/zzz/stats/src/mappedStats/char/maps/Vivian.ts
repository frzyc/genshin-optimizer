import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Vivian'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackFeatheredStrike:
      data_gen.skillParams['basic']['BasicAttackFeatheredStrike'],
    BasicAttackNoblewomanWaltz:
      data_gen.skillParams['basic']['BasicAttackNoblewomanWaltz'],
    BasicAttackFlutteringFrockSuspension:
      data_gen.skillParams['basic']['BasicAttackFlutteringFrockSuspension'],
    BasicAttackFeatherbloom:
      data_gen.skillParams['basic']['BasicAttackFeatherbloom'],
  },
  dodge: {
    DodgeLightstream: data_gen.skillParams['dodge']['DodgeLightstream'],
    DashAttackSilverThornedMelody:
      data_gen.skillParams['dodge']['DashAttackSilverThornedMelody'],
    DodgeCounterWingbladeReverb:
      data_gen.skillParams['dodge']['DodgeCounterWingbladeReverb'],
    DodgeDaintySteps: data_gen.skillParams['dodge']['DodgeDaintySteps'],
  },
  special: {
    SpecialAttackSongOfSilverWings:
      data_gen.skillParams['special']['SpecialAttackSongOfSilverWings'],
    EXSpecialAttackVioletRequiem:
      data_gen.skillParams['special']['EXSpecialAttackVioletRequiem'],
  },
  chain: {
    ChainAttackChorusOfCelestialWings:
      data_gen.skillParams['chain']['ChainAttackChorusOfCelestialWings'],
    UltimateSoaringBirdsSong:
      data_gen.skillParams['chain']['UltimateSoaringBirdsSong'],
  },
  assist: {
    QuickAssistFrostwingGuard:
      data_gen.skillParams['assist']['QuickAssistFrostwingGuard'],
    DefensiveAssistSilverUmbrellaFormation:
      data_gen.skillParams['assist']['DefensiveAssistSilverUmbrellaFormation'],
    AssistFollowUpFeatherbladeExecution:
      data_gen.skillParams['assist']['AssistFollowUpFeatherbladeExecution'],
  },
} as const

export default dm
