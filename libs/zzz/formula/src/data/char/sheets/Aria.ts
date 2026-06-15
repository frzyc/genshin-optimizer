import {
  cmpGE,
  constant,
  max,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import { isStunned } from '../../common/enemy'
import {
  allBoolConditionals,
  attributes,
  damageTypes,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Aria'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { abloom, momentOfDelusion, etherVeil } = allBoolConditionals(key)

const abloomFormula = (scaling: number[]) =>
  abloom.ifOn(
    prod(
      percent(subscript(char.core, scaling)),
      percent(1 / dm.core.anomMas_step),
      own.initial.anomMas,
      sum(percent(1), isStunned.ifOn(percent(dm.core.abloomMult)))
    )
  )
const m2_defIgn_ = cmpGE(
  char.mindscape,
  2,
  sum(percent(dm.m2.defIgn_), momentOfDelusion.ifOn(percent(dm.m2.addDefIgn_)))
)
const m6_basic_ether_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 6, momentOfDelusion.ifOn(percent(dm.m6.ether_dmg_)))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPerfectPitch',
      4,
      { ...baseTag, damageType1: 'basic', skillType: 'basicSkill' },
      'atk',
      undefined,
      ...m6_basic_ether_dmg_
    )
  ),

  // Buffs
  registerBuff(
    'ult_atk',
    teamBuff.combat.atk.add(etherVeil.ifOn(constant(50))),
    undefined,
    true
  ),
  registerBuff(
    'core_anomProf',
    ownBuff.combat.anomProf.add(percent(subscript(char.core, dm.core.anomProf)))
  ),
  ...attributes.map((attr) =>
    registerBuff(
      `core_${attr}_anom_mv_mult_`,
      teamBuff.dmg.anom_mv_mult_[attr].addWithDmgType(
        'abloom',
        abloomFormula(dm.core[`${attr}_abloom`])
      ),
      undefined,
      true
    )
  ),
  registerBuff(
    'm1_basic_ether_anomBuildupResIgn_',
    ownBuff.combat.anomBuildupResIgn_.ether.addWithDmgType(
      'basic',
      cmpGE(char.mindscape, 1, percent(dm.m1.anomaly_resIgn_))
    )
  ),
  registerBuff(
    'm1_special_ether_anomBuildupResIgn_',
    ownBuff.combat.anomBuildupResIgn_.ether.addWithDmgType(
      'special',
      cmpGE(char.mindscape, 1, percent(dm.m1.anomaly_resIgn_))
    )
  ),
  registerBuff(
    'm1_exSpecial_ether_anomBuildupResIgn_',
    ownBuff.combat.anomBuildupResIgn_.ether.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 1, percent(dm.m1.anomaly_resIgn_))
    )
  ),
  registerBuff(
    'm1_abloom_anom_crit_',
    teamBuff.combat.anom_crit_.addWithDmgType(
      'abloom',
      cmpGE(
        char.mindscape,
        1,
        sum(
          percent(dm.m1.anomaly_crit_),
          prod(
            max(0, sum(own.initial.anomMas, prod(-1, dm.m1.anomMasThreshold))),
            percent(dm.m1.crit_step)
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_abloom_anom_crit_dmg_',
    teamBuff.combat.anom_crit_dmg_.addWithDmgType(
      'abloom',
      cmpGE(char.mindscape, 1, percent(dm.m1.anomaly_crit_dmg_))
    ),
    undefined,
    true
  ),
  // Buff doesn't affect Anomaly and Disorder damage, removed some others
  // because they're not in the kit
  ...damageTypes
    .filter(
      (dmgType) =>
        ![
          'anomaly',
          'disorder',
          'entrySkill',
          'evasiveAssist',
          'sheer',
        ].includes(dmgType)
    )
    .map((dmgType) =>
      registerBuff(
        `m2_${dmgType}_defIgn_`,
        ownBuff.combat.defIgn_.addWithDmgType(dmgType, m2_defIgn_)
      )
    ),
  // Include regular entry for UI
  registerBuff(
    'm2_defIgn_',
    ownBuff.combat.defIgn_.add(m2_defIgn_),
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm6_basic_ether_dmg_',
    m6_basic_ether_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm6_ult_ether_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      cmpGE(char.mindscape, 6, momentOfDelusion.ifOn(percent(dm.m6.ether_dmg_)))
    )
  )
)
export default sheet
