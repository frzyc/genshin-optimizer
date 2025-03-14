import { cmpEq, cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, registerBuff, teamBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'PlanetaryRendezvous'
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
    'physical_dmg_',
    teamBuff.premod.dmg_.physical.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(own.char.ele, 'physical', subscript(superimpose, dm.ele_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'quantum_dmg_',
    teamBuff.premod.dmg_.quantum.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(own.char.ele, 'quantum', subscript(superimpose, dm.ele_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'lightning_dmg_',
    teamBuff.premod.dmg_.lightning.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(own.char.ele, 'lightning', subscript(superimpose, dm.ele_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'ice_dmg_',
    teamBuff.premod.dmg_.ice.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(own.char.ele, 'ice', subscript(superimpose, dm.ele_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'wind_dmg_',
    teamBuff.premod.dmg_.wind.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(own.char.ele, 'wind', subscript(superimpose, dm.ele_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'fire_dmg_',
    teamBuff.premod.dmg_.fire.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(own.char.ele, 'fire', subscript(superimpose, dm.ele_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'imaginary_dmg_',
    teamBuff.premod.dmg_.imaginary.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(own.char.ele, 'imaginary', subscript(superimpose, dm.ele_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
