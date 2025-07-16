import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  own,
  ownBuff,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'Metanukimorphosis'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { physical_exSpecial_ult, aftershock } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'physical_exSpecial_ult_anomMas',
    ownBuff.combat.anomMas.add(
      cmpSpecialtyAndEquipped(
        key,
        physical_exSpecial_ult.ifOn(subscript(phase, dm.anomMas))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'aftershock_team_anomProf',
    teamBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(
        key,
        aftershock.ifOn(subscript(phase, dm.anomProf))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
