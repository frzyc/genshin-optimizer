import { cmpEq, cmpGE, subscript, sum } from '@genshin-optimizer/pando/engine'
import { allPathKeys, type LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, registerBuff, target, team, teamBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'PoisedToBloom'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'crit_dmg_',
    teamBuff.premod.crit_dmg_.add(
      cmpGE(
        lcCount,
        1,
        cmpGE(
          sum(
            ...allPathKeys.map((path) =>
              cmpEq(target.char.path, path, team.common.count.withPath(path))
            )
          ),
          2,
          subscript(superimpose, dm.crit_dmg_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
