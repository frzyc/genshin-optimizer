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

const key: WengineKey = 'MagneticStormBravo'
const dm = mappedStats.wengine[key]
const { modification } = own.wengine

const { anomalyBuildupIncreased } = allBoolConditionals(key)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Conditional buffs
  registerBuff(
    'anomProf',
    ownBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(
        key,
        anomalyBuildupIncreased.ifOn(subscript(modification, dm.anomProf))
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
