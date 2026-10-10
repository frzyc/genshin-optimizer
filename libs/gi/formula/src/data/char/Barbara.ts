import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Barbara'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    // Encoding {{N}} matches gen indices, not skillParams UI rows:
    // continuous regen {{0}}+{{1}}, HP regen per hit {{2}}+{{3}}, droplet {{4}}, dur {{5}}, cd {{6}}
    cregen_hp_: skillParam_gen.skill[s++],
    cregen_hp: skillParam_gen.skill[s++],
    regen_hp_: skillParam_gen.skill[s++],
    regen_hp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    hp_: skillParam_gen.burst[b++],
    hp: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stam: -skillParam_gen.passive1[0][0],
  },
  passive2: {
    ext: skillParam_gen.passive2[0][0],
    maxExt: skillParam_gen.passive2[0][1],
  },
  constellation2: {
    cdDec: 0.15,
    hydro_dmg_: 0.15,
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill: skillTalent, burst, ascension, constellation },
} = own
// WR cond(key, 'skill' | 'c2')
const { skill, c2 } = allBoolConditionals(info.key)

// Pando has no staminaDec_ tag (only staminaChargedDec_). Display-only listing.
const a1_staminaDec_ = skill.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.stam))
)
const c2_hydro_dmg_ = c2.ifOn(
  cmpGE(
    constellation,
    2,
    cmpNE(destIsActive, 0, percent(dm.constellation2.hydro_dmg_))
  )
)
const c2_skill_cdDec_ = cmpGE(
  constellation,
  2,
  percent(dm.constellation2.cdDec)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Shining Miracle♪ (burst); C5 Let the Show Begin♪ (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.dmg_.hydro.add(c2_hydro_dmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  customHeal(
    'skill_regen',
    sum(
      prod(percent(talentSubscript(skillTalent, dm.skill.regen_hp_)), final.hp),
      talentSubscript(skillTalent, dm.skill.regen_hp)
    )
  ),
  customHeal(
    'skill_cregen',
    sum(
      prod(
        percent(talentSubscript(skillTalent, dm.skill.cregen_hp_)),
        final.hp
      ),
      talentSubscript(skillTalent, dm.skill.cregen_hp)
    )
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  customHeal(
    'burst_regen',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.hp_)), final.hp),
      talentSubscript(burst, dm.burst.hp)
    )
  ),

  // Kit param rows (skillParams + encoding / in-game labels)
  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('a1_staminaDec_', a1_staminaDec_, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('c2_skill_cdDec_', c2_skill_cdDec_, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  })
)
