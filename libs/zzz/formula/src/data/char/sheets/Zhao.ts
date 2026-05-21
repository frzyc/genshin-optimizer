import type { NumNode } from '@genshin-optimizer/pando/engine'
import {
  cmpGE,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  customHeal,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomMerge,
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Zhao'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { etherVeilWellspring, inEtherVeil, offField, recoversHp } =
  allBoolConditionals(key)
const { chargeTime } = allNumConditionals(key, true, 0, 5)

const abilityCheck = (a: NumNode | number, b?: NumNode | number) =>
  cmpGE(
    sum(
      team.common.count.withSpecialty('attack'),
      team.common.count.withSpecialty('anomaly'),
      team.common.count.withSpecialty('support')
    ),
    1,
    a,
    b
  )

const basic_flat_dmg = ownBuff.combat.flat_dmg.addWithDmgType(
  'basic',
  prod(
    chargeTime,
    sum(percent(0.12), prod(char.basic, percent(0.01))),
    own.final.hp,
    cmpGE(char.mindscape, 6, percent(dm.m6.finalVerdictChargeIncrease_), 1)
  )
)
const chain_flat_dmg = ownBuff.combat.flat_dmg.addWithDmgType(
  'chain',
  prod(
    chargeTime,
    sum(percent(0.12), prod(char.basic, percent(0.01))),
    own.final.hp,
    cmpGE(char.mindscape, 6, percent(dm.m6.finalVerdictChargeIncrease_), 1)
  )
)
const assistFollowUp_flat_dmg = ownBuff.combat.flat_dmg.addWithDmgType(
  'assistFollowUp',
  prod(
    chargeTime,
    sum(percent(0.12), prod(char.basic, percent(0.01))),
    own.final.hp,
    cmpGE(char.mindscape, 6, percent(dm.m6.finalVerdictChargeIncrease_), 1)
  )
)
const m4_ult_crit_dmg_ = ownBuff.combat.crit_dmg_.addWithDmgType(
  'ult',
  cmpGE(char.mindscape, 4, percent(dm.m4.ultChainBasicCrit_dmg_))
)
const m4_chain_crit_dmg_ = ownBuff.combat.crit_dmg_.addWithDmgType(
  'chain',
  cmpGE(char.mindscape, 4, percent(dm.m4.ultChainBasicCrit_dmg_))
)
const m4_basic_crit_dmg_ = ownBuff.combat.crit_dmg_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 4, percent(dm.m4.ultChainBasicCrit_dmg_))
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
        BasicAttackGlacialJudgment: {
          '4': dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackGlacialJudgment[4],
              dm.basic.BasicAttackGlacialJudgment[5],
            ],
            'BasicAttackGlacialJudgment_4',
            {
              ...baseTag,
              damageType1: 'basic',
              skillType1: 'basicSkill',
            },
            'atk',
            'basic'
          ),
          '5': [],
        },
      },
      chain: {
        UltimateBunnyBarrage: {
          '0': dmgDazeAndAnomMerge(
            [
              dm.chain.UltimateBunnyBarrage[0],
              dm.chain.UltimateBunnyBarrage[1],
            ],
            'UltimateBunnyBarrage_0',
            { ...baseTag, damageType1: 'ult', skillType1: 'chainSkill' },
            'atk',
            'chain'
          ),
          '1': [],
        },
      },
    },
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackGlacialJudgment',
      0,
      { damageType1: 'basic', skillType1: 'basicSkill', attribute: 'physical' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFinalVerdict',
      0,
      {
        ...baseTag,
        damageType1: 'basic',
        skillType1: 'basicSkill',
      },
      'atk',
      undefined,
      ...basic_flat_dmg,
      ...m4_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'ChainAttackTemporaryAlliance',
      0,
      { ...baseTag, damageType1: 'chain', skillType1: 'chainSkill' },
      'atk',
      undefined,
      ...chain_flat_dmg,
      ...m4_chain_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateBunnyBarrage',
      0,
      { ...baseTag, damageType1: 'ult', skillType1: 'chainSkill' },
      'atk',
      undefined,
      ...m4_ult_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'AssistFollowUpFrostlightReflection',
      0,
      { ...baseTag, damageType1: 'assistFollowUp', skillType1: 'assistSkill' },
      'atk',
      undefined,
      ...assistFollowUp_flat_dmg
    )
  ),

  customHeal(
    'special_heal',
    prod(own.final.hp, sum(percent(0.01), prod(char.special, percent(0.0006)))),
    { team: true }
  ),
  customHeal(
    'exSpecial_heal',
    prod(own.final.hp, sum(percent(0.01), prod(char.special, percent(0.0006)))),
    { team: true }
  ),

  // Buffs
  registerBuff('basic_flat_dmg', basic_flat_dmg, undefined, undefined, false),
  registerBuff('chain_flat_dmg', chain_flat_dmg, undefined, undefined, false),
  registerBuff(
    'assistFollowUp_flat_dmg',
    assistFollowUp_flat_dmg,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'core_crit_',
    ownBuff.combat.crit_.add(
      percent(
        prod(
          own.initial.hp,
          subscript(char.core, dm.core.crit_step),
          percent(1 / dm.core.hpStep),
          cmpGE(char.mindscape, 6, percent(dm.m6.critIncrease_), 1)
        )
      )
    )
  ),
  registerBuff(
    'core_hp_',
    teamBuff.combat.hp_.add(etherVeilWellspring.ifOn(percent(dm.core.hp_))),
    undefined,
    true
  ),
  registerBuff(
    'core_atk',
    teamBuff.combat.atk.add(
      etherVeilWellspring.ifOn(subscript(char.core, dm.core.atk))
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      inEtherVeil.ifOn(
        abilityCheck(
          min(
            percent(dm.ability.maxDmg_),
            sum(
              percent(dm.ability.dmg_),
              max(
                0,
                prod(
                  sum(own.initial.hp, -dm.ability.hpThreshold),
                  percent(1 / dm.ability.hpStep),
                  percent(dm.ability.dmg_step)
                )
              )
            )
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_resIgn_',
    teamBuff.combat.resIgn_.add(
      cmpGE(char.mindscape, 1, offField.ifOn(percent(dm.m1.resIgn_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_atk_',
    ownBuff.combat.atk_.add(
      cmpGE(char.mindscape, 2, recoversHp.ifOn(percent(dm.m2.atk_)))
    )
  ),
  registerBuff(
    'm2_team_atk_',
    notOwnBuff.combat.atk_.add(
      cmpGE(char.mindscape, 2, recoversHp.ifOn(percent(dm.m2.team_atk_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm4_ult_crit_dmg_',
    m4_ult_crit_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm4_chain_crit_dmg_',
    m4_chain_crit_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm4_basic_crit_dmg_',
    m4_basic_crit_dmg_,
    undefined,
    undefined,
    false
  )
)
export default sheet
