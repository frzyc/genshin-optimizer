import { cmpEq, cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allListConditionals, own, registerBuff, teamBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'DreamvilleAdventure'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { childishness } = allListConditionals(key, ['basic', 'skill', 'ult'])

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'basic_dmg_',
    teamBuff.premod.dmg_.addWithDmgType(
      'basic',
      cmpGE(
        lcCount,
        1,
        cmpEq(
          childishness.value,
          1,
          subscript(superimpose, dm.basic_skill_ult_dmg_),
        ),
      ),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
  registerBuff(
    'skill_dmg_',
    teamBuff.premod.dmg_.addWithDmgType(
      'skill',
      cmpGE(
        lcCount,
        1,
        cmpEq(
          childishness.value,
          2,
          subscript(superimpose, dm.basic_skill_ult_dmg_),
        ),
      ),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
  registerBuff(
    'ult_dmg_',
    teamBuff.premod.dmg_.addWithDmgType(
      'ult',
      cmpGE(
        lcCount,
        1,
        cmpEq(
          childishness.value,
          3,
          subscript(superimpose, dm.basic_skill_ult_dmg_),
        ),
      ),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
)
export default sheet
