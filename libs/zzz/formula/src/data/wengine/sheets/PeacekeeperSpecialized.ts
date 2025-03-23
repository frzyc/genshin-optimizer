import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'PeacekeeperSpecialized'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { shielded } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_exSpecial_anomBuildup_',
    ownBuff.combat.anomBuildup_.addWithDmgType(
      'exSpecial',
      cmpSpecialtyAndEquipped(
        key,
        subscript(phase, dm.passive_exSpecial_assist_anomBuildup_)
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'passive_assist_anomBuildup_',
    ownBuff.combat.anomBuildup_.addWithDmgType(
      'assistFollowUp',
      cmpSpecialtyAndEquipped(
        key,
        subscript(phase, dm.passive_exSpecial_assist_anomBuildup_)
      )
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'enerRegen',
    ownBuff.combat.enerRegen.add(
      cmpSpecialtyAndEquipped(
        key,
        shielded.ifOn(subscript(phase, dm.enerRegen))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
