import {
  cmpEq,
  cmpGE,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  customBreakDmg,
  enemy,
  enemyDebuff,
  notOwnBuff,
  own,
  ownBuff,
  register,
  registerBuff,
  registerBuffFormula,
  teamBuff,
} from '../../util'
import { dmg, entriesForChar, getBaseTag } from '../util'

const key: CharacterKey = 'RuanMei'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { skillOvertone, ultZone, e4Broken } = allBoolConditionals(key)

const e6TechniqueAddMult = cmpGE(char.eidolon, 6, dm.e6.breakDmgMult_inc)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...dmg('basicDmg', baseTag, 'atk', dm.basic.dmg, 'basic'),
  ...customBreakDmg(
    'zoneBreakDmg',
    { ...baseTag, damageType1: 'break' },
    subscript(char.ult, dm.ult.breakDmg)
  ),
  ...customBreakDmg(
    'talentBreakDmg',
    { ...baseTag, damageType1: 'break' },
    sum(subscript(char.talent, dm.talent.breakDmg), e6TechniqueAddMult)
  ),

  // Buffs
  registerBuff(
    'skillOvertone_dmg_',
    teamBuff.premod.common_dmg_.add(
      skillOvertone.ifOn(subscript(char.skill, dm.skill.dmg_))
    )
  ),
  // TODO: Break efficiency
  registerBuff(
    'skillOvertone_weakness_',
    teamBuff.premod.weakness_.add(skillOvertone.ifOn(dm.skill.weakness_))
  ),
  registerBuff(
    'ultZone_resPen_',
    teamBuff.premod.resPen_.add(
      ultZone.ifOn(subscript(char.ult, dm.ult.resPen_))
    )
  ),
  // TODO: ultimate actionDelay_ of 20%*BrEff_ + 10%
  registerBuff(
    'talent_spd_',
    notOwnBuff.premod.spd_.add(subscript(char.talent, dm.talent.spd_))
  ),
  registerBuff(
    'ba1_break_',
    teamBuff.premod.brEffect_.add(cmpEq(char.bonusAbility1, 1, dm.b1.break_))
  ),
  registerBuffFormula(
    'ba3_dmg_',
    teamBuff.premod.common_dmg_.add(
      cmpEq(
        char.bonusAbility3,
        1,
        skillOvertone.ifOn(
          min(
            max(
              // (brEff_ - breakThreshold) / perBreak * dmgPer
              prod(
                sum(own.final.brEffect_, -dm.b3.breakThreshold),
                1 / dm.b3.perBreak,
                dm.b3.dmg_per
              ),
              0
            ),
            dm.b3.max_dmg_
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'e1_defIgn_',
    enemyDebuff.common.defIgn_.add(cmpGE(char.eidolon, 1, dm.e1.defIgn_))
  ),
  registerBuff(
    'e2_atk_',
    teamBuff.premod.atk_.add(
      cmpGE(char.eidolon, 2, cmpEq(enemy.common.isBroken, 1, dm.e2.atk_))
    )
  ),
  registerBuff(
    'e4_break_',
    ownBuff.premod.brEffect_.add(
      cmpGE(char.eidolon, 4, e4Broken.ifOn(dm.e4.break_))
    )
  )
)
export default sheet
