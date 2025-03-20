import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, registerBuff, teamBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'ReverbMarkII'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { exSpecialOrChainUsed } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'anomMas',
    teamBuff.combat.anomMas.add(
      cmpSpecialtyAndEquipped(
        key,
        exSpecialOrChainUsed.ifOn(subscript(phase, dm.anomMas_anomProf))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'anomProf',
    teamBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(
        key,
        exSpecialOrChainUsed.ifOn(subscript(phase, dm.anomMas_anomProf))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
