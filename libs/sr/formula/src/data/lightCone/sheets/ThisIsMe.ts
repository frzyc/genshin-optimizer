import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, registerBuffFormula } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'ThisIsMe'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { addUltDmgBuff } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  registerBuffFormula(
    'additive_ult_dmg',
    own.formula.base.addWithDmgType(
      'ult',
      cmpGE(
        lcCount,
        1,
        addUltDmgBuff.ifOn(
          prod(own.final.def, subscript(superimpose, dm.ult_dmg_scaling))
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
