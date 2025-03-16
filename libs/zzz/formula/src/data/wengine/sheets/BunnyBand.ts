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

const key: WengineKey = 'BunnyBand'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { wearerShielded } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  registerBuff(
    'passive_hp_',
    ownBuff.combat.hp_.add(
      cmpSpecialtyAndEquipped(key, subscript(modification, dm.hp_))
    ),
    showSpecialtyAndEquipped(key)
  ),

  // Conditional buffs
  registerBuff(
    'atk_',
    ownBuff.combat.atk_.add(
      cmpSpecialtyAndEquipped(
        key,
        wearerShielded.ifOn(subscript(modification, dm.atk_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
