import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allListConditionals, own } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'CarveTheMoonWeaveTheClouds'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { atk_crit_dmg_enerRegen_ } = allListConditionals(key, [
  'atk_',
  'crit_dmg_',
  'enerRegen_',
])

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen)

  // Conditional buffs
  // registerBuff(
  //   'atk_',
  //   teamBuff.premod.atk_.add(
  //     cmpGE(
  //       lcCount,
  //       1,
  //       atk_crit_dmg_enerRegen_.map({
  //         atk_: subscript(superimpose, dm.atk_),
  //         crit_dmg_: 0,
  //         enerRegen_: 0,
  //       })
  //     )
  //   ),
  //   cmpGE(lcCount, 1, 'unique', '')
  // ),
  // registerBuff(
  //   'crit_dmg_',
  //   teamBuff.premod.crit_dmg_.add(
  //     cmpGE(
  //       lcCount,
  //       1,
  //       atk_crit_dmg_enerRegen_.map({
  //         atk_: 0,
  //         crit_dmg_: subscript(superimpose, dm.crit_dmg_),
  //         enerRegen_: 0,
  //       })
  //     )
  //   ),
  //   cmpGE(lcCount, 1, 'unique', '')
  // ),
  // registerBuff(
  //   'enerRegen_',
  //   teamBuff.premod.enerRegen_.add(
  //     cmpGE(
  //       lcCount,
  //       1,
  //       atk_crit_dmg_enerRegen_.map({
  //         atk_: 0,
  //         crit_dmg_: 0,
  //         enerRegen_: subscript(superimpose, dm.enerRegen_),
  //       })
  //     )
  //   ),
  //   cmpGE(lcCount, 1, 'unique', '')
  // )
)
export default sheet
