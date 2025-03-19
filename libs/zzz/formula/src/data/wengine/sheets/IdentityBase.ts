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

const key: WengineKey = 'IdentityBase'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { equipperAttacked } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'def_',
    ownBuff.combat.def_.add(
      cmpSpecialtyAndEquipped(
        key,
        equipperAttacked.ifOn(subscript(modification, dm.def_))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
