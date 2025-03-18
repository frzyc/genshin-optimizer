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

const key: WengineKey = 'DrillRigRedAxis'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { exSpecialOrChainUsed } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'basic_eletric_dmg_',
    ownBuff.combat.dmg_.electric.addWithDmgType(
      'basic',
      cmpSpecialtyAndEquipped(
        key,
        exSpecialOrChainUsed.ifOn(
          subscript(modification, dm.basic_dash_electric_dmg_)
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'dash_eletric_dmg_',
    ownBuff.combat.dmg_.electric.addWithDmgType(
      'dash',
      cmpSpecialtyAndEquipped(
        key,
        exSpecialOrChainUsed.ifOn(
          subscript(modification, dm.basic_dash_electric_dmg_)
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
