import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpGE,
  cmpNE,
  max,
  min,
  prod,
  sum,
} from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customHeal,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Vodyanitsa'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    hornDmgInterval: skillParam_gen.skill[s++][0],
    hornDmg: skillParam_gen.skill[s++],
    songHealFlat: skillParam_gen.skill[s++],
    songHealMult: skillParam_gen.skill[s++],
    songHealInterval: skillParam_gen.skill[s++][0],
    hydrocryo_enemyRes_: skillParam_gen.skill[s++].map((v) => -v),
    resDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    songDmg_: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    anemo_enemyRes_: -skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    leadStackGain: skillParam_gen.passive2[0][0],
    chorusStackGain: skillParam_gen.passive2[1][0],
    hpThresh: skillParam_gen.passive2[2][0],
    stellarswirl_dmgInc: skillParam_gen.passive2[3][0],
    hydrocryo_dmgInc: skillParam_gen.passive2[4][0],
    maxStellarswirl_dmgInc: skillParam_gen.passive2[5][0],
    maxHydrocryo_dmgInc: skillParam_gen.passive2[6][0],
  },
  constellation1: {
    atk_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    hydrocryo_critDMG_: skillParam_gen.constellation2[0],
    stellarswirl_critDMG_: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
    durationInc: skillParam_gen.constellation2[3],
  },
  constellation4: {
    hpThresh: skillParam_gen.constellation4[0],
    heal_: skillParam_gen.constellation4[1],
    hp_: skillParam_gen.constellation4[2],
    duration: skillParam_gen.constellation4[3],
    maxStacks: skillParam_gen.constellation4[4],
  },
  constellation6: {
    stellarswirl_specialDmg_: skillParam_gen.constellation6[0],
    hydrocryo_dmg_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'skillHit' | 'skillSong' | 'a1Vortex' | 'a4LeadVocal' | 'a4Chorus' | 'c1Heal')
const { skillHit, skillSong, a1Vortex, a4LeadVocal, a4Chorus, c1Heal } =
  allBoolConditionals(info.key)
const { c2State } = allListConditionals(info.key, ['voice', 'vortex'])
const { c4State } = allListConditionals(info.key, [
  'below',
  'above1',
  'above2',
  'above3',
])

const skillHit_hydro_enemyRes_ = skillHit.ifOn(
  percent(talentSubscript(skill, dm.skill.hydrocryo_enemyRes_))
)
const skillHit_cryo_enemyRes_ = skillHit_hydro_enemyRes_

const skillSong_burst_mult_ = skillSong.ifOn(
  percent(talentSubscript(burst, dm.burst.songDmg_))
)

const a1Vortex_anemo_enemyRes_ = a1Vortex.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.anemo_enemyRes_))
)

function a4HydrocryoDmgInc() {
  return min(
    max(
      prod(
        sum(final.hp, -dm.passive2.hpThresh),
        1 / 1000,
        percent(dm.passive2.hydrocryo_dmgInc)
      ),
      0
    ),
    percent(dm.passive2.maxHydrocryo_dmgInc)
  )
}
function a4StellarswirlDmgInc() {
  return min(
    max(
      prod(
        sum(final.hp, -dm.passive2.hpThresh),
        1 / 1000,
        percent(dm.passive2.stellarswirl_dmgInc)
      ),
      0
    ),
    percent(dm.passive2.maxStellarswirl_dmgInc)
  )
}

const a4LeadVocal_hydro_dmgIncDisp = a4LeadVocal.ifOn(
  cmpGE(ascension, 4, a4HydrocryoDmgInc())
)
const a4LeadVocal_cryo_dmgIncDisp = a4LeadVocal_hydro_dmgIncDisp
const a4LeadVocal_stellarswirl_dmgIncDisp = a4LeadVocal.ifOn(
  cmpGE(ascension, 4, a4StellarswirlDmgInc())
)

const a4Chorus_hydro_dmgIncDisp = a4Chorus.ifOn(
  cmpGE(ascension, 4, a4HydrocryoDmgInc())
)
const a4Chorus_cryo_dmgIncDisp = a4Chorus_hydro_dmgIncDisp
const a4Chorus_stellarswirl_dmgIncDisp = a4Chorus.ifOn(
  cmpGE(ascension, 4, a4StellarswirlDmgInc())
)

// WR activeCharBuff(target.charKey) / inactiveCharBuff — dest on-field vs off-field
const a4LeadVocal_hydro_dmgInc = prod(
  a4LeadVocal_hydro_dmgIncDisp,
  destIsActive
)
const a4LeadVocal_cryo_dmgInc = prod(a4LeadVocal_cryo_dmgIncDisp, destIsActive)
const a4LeadVocal_stellarswirl_dmgInc = prod(
  a4LeadVocal_stellarswirl_dmgIncDisp,
  destIsActive
)
const a4Chorus_hydro_dmgInc = cmpNE(
  destIsActive,
  0,
  0,
  a4Chorus_hydro_dmgIncDisp
)
const a4Chorus_cryo_dmgInc = cmpNE(destIsActive, 0, 0, a4Chorus_cryo_dmgIncDisp)
const a4Chorus_stellarswirl_dmgInc = cmpNE(
  destIsActive,
  0,
  0,
  a4Chorus_stellarswirl_dmgIncDisp
)

const c1Heal_atk = c1Heal.ifOn(
  cmpGE(constellation, 1, prod(final.hp, percent(dm.constellation1.atk_)))
)

// WR activeCharBuff + C6 conditionOR extends to whole party
const c2DestGate = cmpGE(sum(destIsActive, cmpGE(constellation, 6, 1)), 1, 1)
const c2State_hydro_critDMG_ = prod(
  c2DestGate,
  cmpGE(
    constellation,
    2,
    percent(
      c2State.map({
        voice: dm.constellation2.hydrocryo_critDMG_,
        vortex: 0,
      })
    )
  )
)
const c2State_cryo_critDMG_ = c2State_hydro_critDMG_
const c2State_stellarswirl_critDMG_ = prod(
  c2DestGate,
  cmpGE(
    constellation,
    2,
    percent(
      c2State.map({
        voice: 0,
        vortex: dm.constellation2.stellarswirl_critDMG_,
      })
    )
  )
)

const c4State_healBonus = cmpGE(
  constellation,
  4,
  percent(
    c4State.map({
      below: dm.constellation4.heal_,
      above1: 0,
      above2: 0,
      above3: 0,
    })
  )
)
const c4State_hp_ = cmpGE(
  constellation,
  4,
  percent(
    c4State.map({
      below: 0,
      above1: dm.constellation4.hp_,
      above2: dm.constellation4.hp_ * 2,
      above3: dm.constellation4.hp_ * 3,
    })
  )
)

const c6Song_stellarswirl_specialDMG_ = cmpGE(
  constellation,
  6,
  skillSong.ifOn(percent(dm.constellation6.stellarswirl_specialDmg_))
)
const c6Song_hydro_dmg_ = cmpGE(
  constellation,
  6,
  skillSong.ifOn(percent(dm.constellation6.hydrocryo_dmg_))
)
const c6Song_cryo_dmg_ = c6Song_hydro_dmg_

export default register(
  info.key,
  entriesForChar(info, data_gen),
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.hp_.add(c4State_hp_),
  teamBuff.final.atk.add(c1Heal_atk),
  // WR teamBuff.premod.*_dmgInc → formula.base.*
  teamBuff.formula.base.hydro.add(
    sum(a4LeadVocal_hydro_dmgInc, a4Chorus_hydro_dmgInc)
  ),
  teamBuff.formula.base.cryo.add(
    sum(a4LeadVocal_cryo_dmgInc, a4Chorus_cryo_dmgInc)
  ),
  teamBuff.formula.base.stellarswirl.add(
    sum(a4LeadVocal_stellarswirl_dmgInc, a4Chorus_stellarswirl_dmgInc)
  ),
  teamBuff.premod.critDMG_.hydro.add(c2State_hydro_critDMG_),
  teamBuff.premod.critDMG_.cryo.add(c2State_cryo_critDMG_),
  teamBuff.premod.critDMG_.stellarswirl.add(c2State_stellarswirl_critDMG_),
  teamBuff.premod.dmg_.stellarswirl.add(c6Song_stellarswirl_specialDMG_),
  teamBuff.premod.dmg_.hydro.add(c6Song_hydro_dmg_),
  teamBuff.premod.dmg_.cryo.add(c6Song_cryo_dmg_),
  enemyDebuff.common.preRes.hydro.add(skillHit_hydro_enemyRes_),
  enemyDebuff.common.preRes.cryo.add(skillHit_cryo_enemyRes_),
  enemyDebuff.common.preRes.anemo.add(a1Vortex_anemo_enemyRes_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'hp', dm.skill.skillDmg, 'skill'),
  dmg('skill_hornDmg', info, 'hp', dm.skill.hornDmg, 'skill'),
  customHeal(
    'skill_songHeal',
    sum(
      prod(percent(talentSubscript(skill, dm.skill.songHealMult)), final.hp),
      talentSubscript(skill, dm.skill.songHealFlat)
    ),
    {},
    ownBuff.premod.heal_.add(c4State_healBonus)
  ),
  dmg('burst', info, 'hp', dm.burst.skillDmg, 'burst', {
    baseMulti: sum(1, skillSong_burst_mult_),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_hornDmgInterval', dm.skill.hornDmgInterval),
  customParam('skill_songHealInterval', dm.skill.songHealInterval),
  customParam('skill_resDuration', dm.skill.resDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('a1Vortex_duration', dm.passive1.duration, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('skillHit_hydro_enemyRes_', skillHit_hydro_enemyRes_),
  customParam('skillHit_cryo_enemyRes_', skillHit_cryo_enemyRes_),
  customParam('a1Vortex_anemo_enemyRes_', a1Vortex_anemo_enemyRes_, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('skillSong_burst_mult_', skillSong_burst_mult_),
  customParam('a4LeadVocal_hydro_dmgInc', a4LeadVocal_hydro_dmgIncDisp, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a4LeadVocal_cryo_dmgInc', a4LeadVocal_cryo_dmgIncDisp, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam(
    'a4LeadVocal_stellarswirl_dmgInc',
    a4LeadVocal_stellarswirl_dmgIncDisp,
    { cond: cmpGE(ascension, 4, 'infer', '') }
  ),
  customParam('a4Chorus_hydro_dmgInc', a4Chorus_hydro_dmgIncDisp, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a4Chorus_cryo_dmgInc', a4Chorus_cryo_dmgIncDisp, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam(
    'a4Chorus_stellarswirl_dmgInc',
    a4Chorus_stellarswirl_dmgIncDisp,
    {
      cond: cmpGE(ascension, 4, 'infer', ''),
    }
  ),
  customParam('c1Heal_atk', c1Heal_atk, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c2State_hydro_critDMG_', c2State_hydro_critDMG_, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c2State_cryo_critDMG_', c2State_cryo_critDMG_, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c2State_stellarswirl_critDMG_', c2State_stellarswirl_critDMG_, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c4State_heal_', c4State_healBonus, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('c4State_hp_', c4State_hp_, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('c6Song_hydro_dmg_', c6Song_hydro_dmg_, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),
  customParam('c6Song_cryo_dmg_', c6Song_cryo_dmg_, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),
  customParam(
    'c6Song_stellarswirl_specialDMG_',
    c6Song_stellarswirl_specialDMG_,
    {
      cond: cmpGE(constellation, 6, 'infer', ''),
    }
  )
)
