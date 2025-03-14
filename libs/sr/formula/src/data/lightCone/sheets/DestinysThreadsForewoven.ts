import { cmpGE, min, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { floor } from '../../../util'
import { own, ownBuff, registerBuffFormula } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'DestinysThreadsForewoven'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  registerBuffFormula(
    'common_dmg_',
    ownBuff.premod.common_dmg_.add(
      cmpGE(
        lcCount,
        1,
        min(
          subscript(superimpose, dm.max_common_dmg_),
          prod(
            floor(prod(own.final.def, 1 / dm.step)),
            subscript(superimpose, dm.common_dmg_),
          ),
        ),
      ),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
)
export default sheet
