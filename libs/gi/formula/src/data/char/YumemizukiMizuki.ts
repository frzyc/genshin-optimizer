import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, max, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { isActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customHeal,
  customParam,
  enemyDebuff,
  hexereiTally,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'YumemizukiMizuki'
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
    contDmg: skillParam_gen.skill[s++],
    swirl_dmg_: skillParam_gen.skill[s++].map((v) => v / 100),
    cd: skillParam_gen.skill[s++][0],
    skillDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    stellarswirl_dmg_: skillParam_gen.skill[s++].map((v) => v / 100),
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    shockwaveDmg: skillParam_gen.burst[b++],
    hpRegenMult: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    hpRegenFlat: skillParam_gen.burst[b++],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  lockedPassive: {
    skillContDmgInc: skillParam_gen.lockedPassive![0][0],
    cd: skillParam_gen.lockedPassive![1][0],
    eleMas: skillParam_gen.lockedPassive![2][0],
    ssDmg: skillParam_gen.lockedPassive![3][0],
  },
  constellation1: {
    swirl_dmgInc: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
    dmg: skillParam_gen.constellation1[3],
    ssDmg: skillParam_gen.constellation1[4],
    stellarswirl_dmgInc: skillParam_gen.constellation1[5],
  },
  constellation2: {
    phec_dmg_: skillParam_gen.constellation2[0],
    eleRes_: -skillParam_gen.constellation2[1],
  },
  constellation4: {
    energyRestore: skillParam_gen.constellation4[0],
    heal: skillParam_gen.constellation4[1],
  },
  constellation6: {
    swirl_critRate_: skillParam_gen.constellation6[0],
    swirl_critDMG_: 1,
    eleMasThresh: skillParam_gen.constellation6[1],
    critRate_: skillParam_gen.constellation6[2],
    critDMG_: skillParam_gen.constellation6[3],
    maxCritRate_: skillParam_gen.constellation6[4],
    maxCritDMG_: skillParam_gen.constellation6[5],
    stellarswirl_critRate_: skillParam_gen.constellation6[6],
    stellarswirl_critDMG_: skillParam_gen.constellation6[7],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  premod,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'lockRevelation' | 'skillDream' | 'a4Phec' | 'c1Awaiting')
const { lockRevelation, skillDream, a4Phec, c1Awaiting } = allBoolConditionals(
  info.key
)
// WR cond(key, 'lockStellarRadiance') states ss
const { lockStellarRadiance } = allListConditionals(info.key, ['ss'])

const hexereiOn = lockRevelation.ifOn(1)
const radianceSs = lockStellarRadiance.map({ ss: 1 })
const mizukiActive = isActive.ifOn(1)

const skillDream_swirl_dmg_ = skillDream.ifOn(
  prod(
    mizukiActive,
    percent(talentSubscript(skill, dm.skill.swirl_dmg_)),
    final.eleMas
  )
)
const skillDream_stellarswirl_dmg_ = skillDream.ifOn(
  prod(
    mizukiActive,
    percent(talentSubscript(skill, dm.skill.stellarswirl_dmg_)),
    final.eleMas
  )
)

const a4Phec_eleMas = a4Phec.ifOn(cmpGE(ascension, 4, dm.passive2.eleMas))

// WR teamBuff.total.eleMas from premod.eleMas (activeCharKey === key).
const lockDream_eleMas = lockRevelation.ifOn(
  skillDream.ifOn(
    prod(mizukiActive, percent(dm.lockedPassive.eleMas), premod.eleMas)
  )
)

const c1Awaiting_swirl_dmgInc = c1Awaiting.ifOn(
  cmpGE(
    constellation,
    1,
    prod(percent(dm.constellation1.swirl_dmgInc), final.eleMas)
  )
)
const c1Awaiting_stellarswirl_dmgInc = c1Awaiting.ifOn(
  cmpGE(
    constellation,
    1,
    prod(percent(dm.constellation1.stellarswirl_dmgInc), final.eleMas)
  )
)

const c2Dream_dmg_ = skillDream.ifOn(
  cmpGE(
    constellation,
    2,
    prod(mizukiActive, percent(dm.constellation2.phec_dmg_), final.eleMas)
  )
)
const c2Dream_res_ = skillDream.ifOn(
  lockRevelation.ifOn(
    cmpGE(
      constellation,
      2,
      prod(mizukiActive, percent(dm.constellation2.eleRes_))
    )
  )
)

const c6Dream_swirlCritRate_ = skillDream.ifOn(
  cmpGE(
    constellation,
    6,
    prod(mizukiActive, percent(dm.constellation6.swirl_critRate_))
  )
)
const c6Dream_swirlCritDMG_ = skillDream.ifOn(
  cmpGE(
    constellation,
    6,
    prod(mizukiActive, percent(dm.constellation6.swirl_critDMG_))
  )
)
const c6Dream_stellarswirl_critRate_ = skillDream.ifOn(
  cmpGE(
    constellation,
    6,
    prod(mizukiActive, percent(dm.constellation6.stellarswirl_critRate_))
  )
)
const c6Dream_stellarswirl_critDMG_ = skillDream.ifOn(
  cmpGE(
    constellation,
    6,
    prod(mizukiActive, percent(dm.constellation6.stellarswirl_critDMG_))
  )
)
// WR total.critRate_ / critDMG_ from premod.eleMas (TODO verify premod vs total).
const c6_critRate_ = cmpGE(
  constellation,
  6,
  lockRevelation.ifOn(
    max(
      0,
      min(
        percent(dm.constellation6.maxCritRate_),
        prod(
          percent(dm.constellation6.critRate_),
          sum(premod.eleMas, -dm.constellation6.eleMasThresh)
        )
      )
    )
  )
)
const c6_critDMG_ = cmpGE(
  constellation,
  6,
  lockRevelation.ifOn(
    max(
      0,
      min(
        percent(dm.constellation6.maxCritDMG_),
        prod(
          percent(dm.constellation6.critDMG_),
          sum(premod.eleMas, -dm.constellation6.eleMasThresh)
        )
      )
    )
  )
)

const skillContDmgInc = prod(
  percent(dm.lockedPassive.skillContDmgInc),
  final.eleMas
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.isHexerei via charTemplates(key, lockRevelation)
  hexereiTally(hexereiOn),
  // C3 Aisa Utamakura Pilgrimage (skill); C5 Anraku Secret Spring Therapy (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.eleMas.add(a4Phec_eleMas),
  // WR data.total.critRate_ / critDMG_
  ownBuff.final.critRate_.add(c6_critRate_),
  ownBuff.final.critDMG_.add(c6_critDMG_),

  // WR teamBuff; equal(activeCharKey, key) → isActive
  teamBuff.premod.dmg_.swirl.add(skillDream_swirl_dmg_),
  teamBuff.premod.dmg_.stellarswirl.add(skillDream_stellarswirl_dmg_),
  teamBuff.final.eleMas.add(lockDream_eleMas),
  // WR teamBuff.premod.swirl_dmgInc; no flat dmgInc tag (Qiqi stellarconduct).
  teamBuff.formula.base.swirl.add(c1Awaiting_swirl_dmgInc),
  teamBuff.formula.base.stellarswirl.add(c1Awaiting_stellarswirl_dmgInc),
  ...absorbableEle.map((ele) => teamBuff.premod.dmg_[ele].add(c2Dream_dmg_)),
  // WR teamBuff.premod.<ele>_enemyRes_ (attacker tag); Pando enemy preRes.
  ...[...absorbableEle, 'anemo' as const].map((ele) =>
    enemyDebuff.common.preRes[ele].add(c2Dream_res_)
  ),
  teamBuff.premod.critRate_.swirl.add(c6Dream_swirlCritRate_),
  teamBuff.premod.critDMG_.swirl.add(c6Dream_swirlCritDMG_),
  teamBuff.premod.critRate_.stellarswirl.add(c6Dream_stellarswirl_critRate_),
  teamBuff.premod.critDMG_.stellarswirl.add(c6Dream_stellarswirl_critDMG_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('skill_contDmg', info, 'atk', dm.skill.contDmg, 'skill'),
  // WR dmgNode overlay premod.skill_dmgInc on this listing only (Nahida extras).
  dmg(
    'skill_contDmg_hexerei',
    info,
    'atk',
    dm.skill.contDmg,
    'skill',
    { cond: cmpGE(hexereiOn, 1, 'infer', '') },
    ownBuff.formula.base.skill.add(skillContDmgInc)
  ),
  // WR stellarDmgNode (stellarswirl / anemo); talent-style listing until trans pipeline exists.
  customDmg(
    'skill_contSsDmg',
    info.ele,
    'elemental',
    prod(percent(dm.lockedPassive.ssDmg), final.eleMas),
    {
      cond: cmpGE(hexereiOn, 1, cmpGE(radianceSs, 1, 'infer', ''), ''),
    }
  ),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg('burst_shockwave', info, 'atk', dm.burst.shockwaveDmg, 'burst'),
  customHeal(
    'burst_snackHeal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.hpRegenMult)), final.eleMas),
      talentSubscript(burst, dm.burst.hpRegenFlat)
    )
  ),
  customDmg(
    'c1',
    info.ele,
    'elemental',
    prod(percent(dm.constellation1.dmg), final.eleMas),
    {
      cond: cmpGE(
        constellation,
        1,
        cmpGE(hexereiOn, 1, cmpGE(radianceSs, 1, '', 'infer'), ''),
        ''
      ),
    }
  ),
  customDmg(
    'c1_ssDmg',
    info.ele,
    'elemental',
    prod(percent(dm.constellation1.ssDmg), final.eleMas),
    {
      cond: cmpGE(
        constellation,
        1,
        cmpGE(hexereiOn, 1, cmpGE(radianceSs, 1, 'infer', ''), ''),
        ''
      ),
    }
  ),
  customHeal('c4_heal', prod(percent(dm.constellation4.heal), final.eleMas), {
    cond: cmpGE(constellation, 4, cmpGE(hexereiOn, 1, 'infer', ''), ''),
  }),

  customParam('skill_swirl_dmg_', skillDream_swirl_dmg_),
  customParam('skill_stellarswirl_dmg_', skillDream_stellarswirl_dmg_),
  customParam('lockDream_eleMas', lockDream_eleMas, {
    cond: cmpGE(hexereiOn, 1, 'infer', ''),
  }),
  customParam('c1Awaiting_swirl_dmgInc', c1Awaiting_swirl_dmgInc, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam(
    'c1Awaiting_stellarswirl_dmgInc',
    c1Awaiting_stellarswirl_dmgInc,
    { cond: cmpGE(constellation, 1, 'infer', '') }
  ),
  customParam('c2_phec_dmg_', c2Dream_dmg_, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c6_critRate_', c6_critRate_, {
    cond: cmpGE(constellation, 6, cmpGE(hexereiOn, 1, 'infer', ''), ''),
  }),
  customParam('c6_critDMG_', c6_critDMG_, {
    cond: cmpGE(constellation, 6, cmpGE(hexereiOn, 1, 'infer', ''), ''),
  }),
  customParam('charged_stamina', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
