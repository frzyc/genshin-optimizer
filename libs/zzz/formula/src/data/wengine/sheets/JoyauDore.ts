import { cmpEq, cmpGE, prod, subscript } from '@genshin-optimizer/pando-engine'
import type { WengineKey } from '@genshin-optimizer/zzz-consts'
import { mappedStats } from '@genshin-optimizer/zzz-stats'
import {
  allNumConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'JoyauDore'
const dm = mappedStats.wengine[key]
const { phase } = own.wengine

const { windExSpecialUsed } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // Passive buffs
  registerBuff(
    'passive_anomProf',
    ownBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(key, subscript(phase, dm.anomProf))
    ),
    showSpecialtyAndEquipped(key)
  ),
  // Conditional buffs
  registerBuff(
    'cond_vortex_buff_',
    ownBuff.combat.buff_.addWithDmgType(
      'vortex',
      cmpSpecialtyAndEquipped(
        key,
        cmpEq(
          own.char.attribute,
          'wind',
          prod(
            windExSpecialUsed,
            percent(subscript(phase, dm.vortex_windswept_dmg_))
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_windswept_buff_',
    ownBuff.combat.buff_.wind.addWithDmgType(
      'anomaly',
      cmpSpecialtyAndEquipped(
        key,
        cmpEq(
          own.char.attribute,
          'wind',
          prod(
            windExSpecialUsed,
            percent(subscript(phase, dm.vortex_windswept_dmg_))
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'cond_anomProf',
    teamBuff.combat.anomProf.add(
      cmpSpecialtyAndEquipped(
        key,
        cmpEq(
          own.char.attribute,
          'wind',
          cmpGE(
            windExSpecialUsed,
            dm.stackThreshold,
            subscript(phase, dm.teamAnomProf)
          )
        )
      )
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
