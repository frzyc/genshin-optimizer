import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customDmg,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  splitScaleDmg,
  talentSubscript,
} from './util'

const key: CharacterKey = 'Illuga'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3 (1)
      skillParam_gen.auto[++a], // 3 (2)
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    pressDmgEleMas: skillParam_gen.skill[s++],
    pressDmgDef: skillParam_gen.skill[s++],
    holdDmgEleMas: skillParam_gen.skill[s++],
    holdDmgDef: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmgEleMas: skillParam_gen.burst[b++],
    skillDmgDef: skillParam_gen.burst[b++],
    geo_dmgInc: skillParam_gen.burst[b++],
    lunarcrystallize_dmgInc: skillParam_gen.burst[b++],
    stacksGainedBurst: skillParam_gen.burst[b++][0],
    stacksGainedConstruct: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    critRate_: skillParam_gen.passive1[0][0],
    critDMG_: skillParam_gen.passive1[1][0],
    critRate_again: skillParam_gen.passive1[2][0],
    critDMG_again: skillParam_gen.passive1[3][0],
    gleamEleMas: skillParam_gen.passive1[4][0],
    duration: skillParam_gen.passive1[5][0],
  },
  passive2: {
    geo_dmgInc: [
      -1,
      skillParam_gen.passive2[0][0],
      skillParam_gen.passive2[1][0],
      skillParam_gen.passive2[2][0],
      skillParam_gen.passive2[2][0],
    ],
    lunarcrystallize_dmgInc: [
      -1,
      skillParam_gen.passive2[3][0],
      skillParam_gen.passive2[4][0],
      skillParam_gen.passive2[5][0],
      skillParam_gen.passive2[5][0],
    ],
  },
  passive: {
    movementSpd_: skillParam_gen.passive![0][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmgEleMas: skillParam_gen.constellation2[0],
    dmgDef: skillParam_gen.constellation2[1],
  },
  constellation4: {
    def: skillParam_gen.constellation4[0],
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    critRate_again: skillParam_gen.constellation6[2],
    critDMG_again: skillParam_gen.constellation6[3],
    gleamEleMas: skillParam_gen.constellation6[4],
    duration: skillParam_gen.constellation6[5],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'burstSong' | 'a1AfterSkillBurst' | 'c4BurstActive')
const { burstSong, a1AfterSkillBurst, c4BurstActive } = allBoolConditionals(
  info.key
)

const hydroGeoCount = sum(team.common.count.geo, team.common.count.hydro)

// WR teamBuff.premod.geo_dmgInc → formula.base.geo. dest = active (includes self).
const burstSong_geo_dmgIncDisp = burstSong.ifOn(
  prod(percent(talentSubscript(burst, dm.burst.geo_dmgInc)), final.eleMas)
)
const burstSong_geo_dmgInc = prod(burstSong_geo_dmgIncDisp, destIsActive)
// WR teamBuff.premod.lunarcrystallize_directDmgInc; no flat dmgInc tag.
const burstSong_lunarcrystallize_dmgIncDisp = burstSong.ifOn(
  prod(
    percent(talentSubscript(burst, dm.burst.lunarcrystallize_dmgInc)),
    final.eleMas
  )
)
const burstSong_lunarcrystallize_dmgInc = prod(
  burstSong_lunarcrystallize_dmgIncDisp,
  destIsActive
)

// WR unequal(target.charKey, key) — teammates only, not dest-gated.
const a1AfterSkillBurst_geo_critRate_disp = a1AfterSkillBurst.ifOn(
  cmpGE(
    ascension,
    1,
    cmpGE(
      constellation,
      6,
      percent(dm.constellation6.critRate_),
      percent(dm.passive1.critRate_)
    )
  )
)
const a1AfterSkillBurst_geo_critDMG_disp = a1AfterSkillBurst.ifOn(
  cmpGE(
    ascension,
    1,
    cmpGE(
      constellation,
      6,
      percent(dm.constellation6.critDMG_),
      percent(dm.passive1.critDMG_)
    )
  )
)
const a1AfterSkillBurstGleam_eleMasDisp = a1AfterSkillBurst.ifOn(
  cmpGE(
    ascension,
    1,
    cmpGE(
      team.common.moonsign,
      2,
      cmpGE(
        constellation,
        6,
        dm.constellation6.gleamEleMas,
        dm.passive1.gleamEleMas
      )
    )
  )
)

// WR A4: subscript(tally.geo + tally.hydro, [-1, 1, 2, 3+]). Same dest gate as burst song.
const a4Song_geo_dmgIncDisp = burstSong.ifOn(
  cmpGE(
    ascension,
    4,
    cmpGE(
      hydroGeoCount,
      1,
      prod(
        percent(subscript(hydroGeoCount, [...dm.passive2.geo_dmgInc])),
        final.eleMas
      )
    )
  )
)
const a4Song_geo_dmgInc = prod(a4Song_geo_dmgIncDisp, destIsActive)
const a4Song_lunarcrystallize_dmgIncDisp = burstSong.ifOn(
  cmpGE(
    ascension,
    4,
    cmpGE(
      hydroGeoCount,
      1,
      prod(
        percent(
          subscript(hydroGeoCount, [...dm.passive2.lunarcrystallize_dmgInc])
        ),
        final.eleMas
      )
    )
  )
)
const a4Song_lunarcrystallize_dmgInc = prod(
  a4Song_lunarcrystallize_dmgIncDisp,
  destIsActive
)

const c4BurstActive_defDisp = c4BurstActive.ifOn(
  cmpGE(constellation, 4, dm.constellation4.def)
)
const c4BurstActive_def = prod(c4BurstActive_defDisp, destIsActive)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Earthshaking Maw (burst); C5 Hurricane Steed (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  teamBuff.formula.base.geo.add(burstSong_geo_dmgInc),
  teamBuff.formula.base.lunarcrystallize.add(burstSong_lunarcrystallize_dmgInc),
  notOwnBuff.premod.critRate_.geo.add(a1AfterSkillBurst_geo_critRate_disp),
  notOwnBuff.premod.critDMG_.geo.add(a1AfterSkillBurst_geo_critDMG_disp),
  notOwnBuff.premod.eleMas.add(a1AfterSkillBurstGleam_eleMasDisp),
  teamBuff.formula.base.geo.add(a4Song_geo_dmgInc),
  teamBuff.formula.base.lunarcrystallize.add(a4Song_lunarcrystallize_dmgInc),
  teamBuff.premod.def.add(c4BurstActive_def),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  splitScaleDmg(
    'skill_press',
    info,
    ['eleMas', 'def'],
    [dm.skill.pressDmgEleMas, dm.skill.pressDmgDef],
    'skill'
  ),
  splitScaleDmg(
    'skill_hold',
    info,
    ['eleMas', 'def'],
    [dm.skill.holdDmgEleMas, dm.skill.holdDmgDef],
    'skill'
  ),
  splitScaleDmg(
    'burst',
    info,
    ['eleMas', 'def'],
    [dm.burst.skillDmgEleMas, dm.burst.skillDmgDef],
    'burst'
  ),
  customParam('burstSong_geo_dmgInc', burstSong_geo_dmgIncDisp),
  customParam(
    'burstSong_lunarcrystallize_dmgInc',
    burstSong_lunarcrystallize_dmgIncDisp
  ),
  customParam('a4Song_geo_dmgInc', a4Song_geo_dmgIncDisp, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam(
    'a4Song_lunarcrystallize_dmgInc',
    a4Song_lunarcrystallize_dmgIncDisp,
    { cond: cmpGE(ascension, 4, 'infer', '') }
  ),
  customDmg(
    'c2',
    info.ele,
    'burst',
    sum(
      prod(percent(dm.constellation2.dmgEleMas), final.eleMas),
      prod(percent(dm.constellation2.dmgDef), final.def)
    ),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
