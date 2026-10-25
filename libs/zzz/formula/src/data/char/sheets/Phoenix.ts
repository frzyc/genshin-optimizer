import {
  cmpGE,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import { entriesForChar, getBaseTag, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Phoenix'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { basicAbloom, ultAbloom, sear, m4Abloom } = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  // Buffs
  registerBuff(
    'basic_abloom_anom_mv_mult_',
    teamBuff.dmg.anom_mv_mult_.addWithDmgType(
      'abloom',
      basicAbloom.ifOn(
        sum(percent(2.25), prod(percent(0.2), sum(char.basic, -1)))
      )
    )
  ),
  registerBuff(
    'basic_abloom_anom_crit_dmg_',
    teamBuff.combat.anom_crit_dmg_.addWithDmgType(
      'abloom',
      basicAbloom.ifOn(percent(0.4))
    )
  ),
  registerBuff(
    'ult_abloom_anom_mv_mult_',
    teamBuff.dmg.anom_mv_mult_.addWithDmgType(
      'abloom',
      ultAbloom.ifOn(sum(percent(3), prod(percent(0.27), sum(char.chain, -1))))
    )
  ),
  registerBuff(
    'ult_abloom_anom_crit_dmg_',
    teamBuff.combat.anom_crit_dmg_.addWithDmgType(
      'abloom',
      ultAbloom.ifOn(percent(0.4))
    )
  ),
  registerBuff(
    'core_anomProf',
    ownBuff.combat.anomProf.add(subscript(char.core, dm.core.anomProf))
  ),
  registerBuff(
    'core_anom_crit_',
    teamBuff.combat.anom_crit_.add(
      sear.ifOn(
        min(
          percent(1),
          sum(
            percent(dm.core.anom_crit_),
            prod(
              max(0, sum(own.initial.anomMas, -dm.core.anomMasteryThreshold)),
              percent(dm.core.anom_crit_step)
            )
          )
        )
      )
    )
  ),
  registerBuff(
    'core_anom_crit_dmg_',
    teamBuff.combat.anom_crit_dmg_.add(
      sear.ifOn(percent(subscript(char.core, dm.core.anom_crit_dmg_)))
    )
  ),
  customDmg(
    'core_dmg',
    { ...baseTag, damageType1: 'exSpecial' },
    sear.ifOn(prod(own.final.atk, percent(subscript(char.core, dm.core.dmg))))
  ),
  registerBuff(
    'ability_anom_crit_dmg_',
    teamBuff.combat.anom_crit_dmg_.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('anomaly'),
          team.common.count.withFaction('KrampusComplianceAuthority')
        ),
        3,
        sear.ifOn(percent(dm.ability.anomaly_crit_dmg_))
      )
    )
  ),
  registerBuff(
    'm1_anom_crit_dmg_',
    teamBuff.combat.anom_crit_dmg_.add(
      cmpGE(char.mindscape, 1, sear.ifOn(prod(dm.m1.anom_crit_dmg_)))
    )
  ),
  registerBuff(
    'm2_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 2, sear.ifOn(percent(dm.m2.common_dmg_)))
    )
  ),
  registerBuff(
    'm4_abloom_anom_mv_mult_',
    teamBuff.dmg.anom_mv_mult_.addWithDmgType(
      'abloom',
      cmpGE(char.mindscape, 4, m4Abloom.ifOn(percent(dm.m4.anom_mv_mult_)))
    )
  ),
  registerBuff(
    'm6_resIgn_',
    ownBuff.combat.resIgn_.add(cmpGE(char.mindscape, 6, percent(dm.m6.resIgn_)))
  ),
  registerBuff(
    'm6_abloom_defIgn_',
    teamBuff.combat.defIgn_.addWithDmgType(
      'abloom',
      cmpGE(char.mindscape, 6, percent(dm.m6.abloom_defIgn_))
    )
  )
)
export default sheet
