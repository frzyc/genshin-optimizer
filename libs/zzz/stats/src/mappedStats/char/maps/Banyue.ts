import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Banyue'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackToweringPeaks:
      data_gen.skillParams['basic']['BasicAttackToweringPeaks'],
    BasicAttackMajesticSummit:
      data_gen.skillParams['basic']['BasicAttackMajesticSummit'],
    BasicAttackImmolate: data_gen.skillParams['basic']['BasicAttackImmolate'],
    BasicAttackInflame: data_gen.skillParams['basic']['BasicAttackInflame'],
    BasicAttackTopplingMountain:
      data_gen.skillParams['basic']['BasicAttackTopplingMountain'],
    BasicAttackCrushingPeaks:
      data_gen.skillParams['basic']['BasicAttackCrushingPeaks'],
  },
  dodge: {
    DodgeImmovableMountain:
      data_gen.skillParams['dodge']['DodgeImmovableMountain'],
    DodgeOvercomePeaks: data_gen.skillParams['dodge']['DodgeOvercomePeaks'],
    DodgeBattleCry: data_gen.skillParams['dodge']['DodgeBattleCry'],
    DashAttackScatteringSands:
      data_gen.skillParams['dodge']['DashAttackScatteringSands'],
    DodgeCounterStoneburst:
      data_gen.skillParams['dodge']['DodgeCounterStoneburst'],
  },
  special: {
    EXSpecialAttackMountainTremor:
      data_gen.skillParams['special']['EXSpecialAttackMountainTremor'],
    EXSpecialAttackEarthShaker:
      data_gen.skillParams['special']['EXSpecialAttackEarthShaker'],
    EXSpecialAttackLionsRoar:
      data_gen.skillParams['special']['EXSpecialAttackLionsRoar'],
    EXSpecialAttackOnesPath:
      data_gen.skillParams['special']['EXSpecialAttackOnesPath'],
    EXSpecialAttackLionsRoarWrath:
      data_gen.skillParams['special']['EXSpecialAttackLionsRoarWrath'],
    EXSpecialAttackMountainTremorWrath:
      data_gen.skillParams['special']['EXSpecialAttackMountainTremorWrath'],
    Cancel: data_gen.skillParams['special']['Cancel'],
  },
  chain: {
    ChainAttackBlazingWrath:
      data_gen.skillParams['chain']['ChainAttackBlazingWrath'],
    UltimateTheWorldTrembles:
      data_gen.skillParams['chain']['UltimateTheWorldTrembles'],
  },
  assist: {
    QuickAssistBatholith:
      data_gen.skillParams['assist']['QuickAssistBatholith'],
    DefensiveAssistIronBastion:
      data_gen.skillParams['assist']['DefensiveAssistIronBastion'],
    AssistFollowUpLoftyAscent:
      data_gen.skillParams['assist']['AssistFollowUpLoftyAscent'],
    AssistFollowUpPierceHeavens:
      data_gen.skillParams['assist']['AssistFollowUpPierceHeavens'],
  },
} as const

export default dm
