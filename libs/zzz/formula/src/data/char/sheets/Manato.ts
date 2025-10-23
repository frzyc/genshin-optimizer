import {
  cmpGE,
  constant,
  prod,
  subscript,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
} from '../../util'
import {
  dmgDazeAndAnomMerge,
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Manato'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { consumingHp_consecutiveStrikes, moltenEdge } = allBoolConditionals(key)
const { hpTallied } = allNumConditionals(
  key,
  true,
  0,
  dm.m1.max_dmg_ / dm.m1.assist_basic_fire_dmg_
)
const { assistFollowUpHitsEnemy } = allNumConditionals(
  key,
  true,
  0,
  dm.m6.stacks
)

const core_basic_crit_dmg_ = ownBuff.combat.crit_dmg_.addWithDmgType(
  'basic',
  consumingHp_consecutiveStrikes.ifOn(
    percent(subscript(char.core, dm.core.crit_dmg_))
  )
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    {
      basic: {
        BasicAttackBlazingWindSlash: {
          '1': dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackBlazingWindSlash[1],
              dm.basic.BasicAttackBlazingWindSlash[2],
            ],
            'BasicAttackBlazingWindSlash_1',
            { damageType1: 'basic' },
            'atk',
            'basic'
          ),
          '2': dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackBlazingWindSlash[3],
              dm.basic.BasicAttackBlazingWindSlash[4],
            ],
            'BasicAttackBlazingWindSlash_2',
            { damageType1: 'basic' },
            'atk',
            'basic'
          ),
          '3': dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackBlazingWindSlash[0],
              dm.basic.BasicAttackBlazingWindSlash[5],
            ],
            'BasicAttackBlazingWindSlash_3',
            { ...baseTag, damageType1: 'basic' },
            'sheerForce',
            'basic'
          ),
          '4': dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackBlazingWindSlash[1],
              dm.basic.BasicAttackBlazingWindSlash[6],
            ],
            'BasicAttackBlazingWindSlash_4',
            { ...baseTag, damageType1: 'basic' },
            'sheerForce',
            'basic'
          ),
          '5': dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackBlazingWindSlash[3],
              dm.basic.BasicAttackBlazingWindSlash[7],
            ],
            'BasicAttackBlazingWindSlash_5',
            { ...baseTag, damageType1: 'basic' },
            'sheerForce',
            'basic'
          ),
          '6': [],
          '7': [],
        },
      },
    },
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackBlazingWindSlash',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackBlazingWindMistySlash',
      0,
      { ...baseTag, damageType1: 'basic' },
      'sheerForce',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackBlazingWindMistySlash',
      1,
      { ...baseTag, damageType1: 'basic' },
      'sheerForce',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackBlazingWindMistySlash',
      2,
      { ...baseTag, damageType1: 'basic' },
      'sheerForce',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackBlazingWindMistySlash',
      3,
      { ...baseTag, damageType1: 'basic' },
      'sheerForce',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackRadiantBladeZanshin',
      0,
      { damageType1: 'dash' },
      'atk'
    )
  ),

  // Buffs
  registerBuff(
    'core_hpSheerForce',
    ownBuff.initial.sheerForce.add(
      prod(own.final.hp, constant(dm.core.sheerForce))
    )
  ),
  registerBuff(
    'core_basic_crit_dmg_',
    core_basic_crit_dmg_,
    undefined,
    false,
    false
  ),
  registerBuff(
    'core_assistFollowUp_crit_dmg_',
    ownBuff.combat.crit_dmg_.addWithDmgType(
      'assistFollowUp',
      consumingHp_consecutiveStrikes.ifOn(
        percent(subscript(char.core, dm.core.crit_dmg_))
      )
    )
  ),
  registerBuff(
    'core_crit_',
    ownBuff.combat.crit_.add(moltenEdge.ifOn(percent(dm.core.crit_)))
  ),
  registerBuff(
    'core_fire_dmg_',
    ownBuff.combat.dmg_.fire.add(
      moltenEdge.ifOn(percent(subscript(char.core, dm.core.fire_dmg_)))
    )
  ),
  registerBuff(
    'm1_assistFollowUp_fire_dmg_',
    ownBuff.combat.dmg_.fire.addWithDmgType(
      'assistFollowUp',
      cmpGE(
        char.mindscape,
        1,
        prod(hpTallied, percent(dm.m1.assist_basic_fire_dmg_))
      )
    )
  ),
  registerBuff(
    'm1_basic_fire_dmg_',
    ownBuff.combat.dmg_.fire.addWithDmgType(
      'basic',
      cmpGE(
        char.mindscape,
        1,
        prod(hpTallied, percent(dm.m1.assist_basic_fire_dmg_))
      )
    )
  ),
  registerBuff(
    'm2_fire_resIgn_',
    ownBuff.combat.resIgn_.fire.add(
      cmpGE(char.mindscape, 2, moltenEdge.ifOn(percent(dm.m2.fire_resIgn_)))
    )
  ),
  registerBuff(
    'm4_hp_',
    ownBuff.combat.hp_.add(cmpGE(char.mindscape, 4, percent(dm.m4.hp_)))
  ),
  registerBuff(
    'm6_fire_dmg_',
    ownBuff.combat.dmg_.fire.add(
      cmpGE(
        char.mindscape,
        6,
        prod(assistFollowUpHitsEnemy, percent(dm.m6.fire_dmg_))
      )
    )
  )
)
export default sheet
