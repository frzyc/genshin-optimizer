import { type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  percent,
  prod,
  subscript,
  sum,
  tally,
  target,
  threshold,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
  splitScaleDmgNode,
} from '../dataUtil'

const key: CharacterKey = 'Illuga'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

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

const [condBurstSongPath, condBurstSong] = cond(key, 'burstSong')
const burstSong_geo_dmgIncDisp = equal(
  condBurstSong,
  'on',
  prod(
    subscript(input.total.burstIndex, dm.burst.geo_dmgInc, { unit: '%' }),
    input.total.eleMas
  ),
  { path: 'geo_dmgInc', isTeamBuff: true }
)
const burstSong_geo_dmgInc = equal(
  input.activeCharKey,
  target.charKey,
  burstSong_geo_dmgIncDisp
)
const burstSong_lunarcrystallize_dmgIncDisp = equal(
  condBurstSong,
  'on',
  prod(
    subscript(input.total.burstIndex, dm.burst.lunarcrystallize_dmgInc, {
      unit: '%',
    }),
    input.total.eleMas
  ),
  { path: 'lunarcrystallize_dmgInc', isTeamBuff: true }
)
const burstSong_lunarcrystallize_dmgInc = equal(
  input.activeCharKey,
  target.charKey,
  burstSong_lunarcrystallize_dmgIncDisp
)

const [condA1AfterSkillBurstPath, condA1AfterSkillBurst] = cond(
  key,
  'a1AfterSkillBurst'
)
const a1AfterSkillBurst_geo_critRate_ = greaterEq(
  input.asc,
  1,
  equal(
    condA1AfterSkillBurst,
    'on',
    threshold(
      input.constellation,
      6,
      dm.constellation6.critRate_,
      dm.passive1.critRate_
    )
  )
)
const a1AfterSkillBurst_geo_critDMG_ = greaterEq(
  input.asc,
  1,
  equal(
    condA1AfterSkillBurst,
    'on',
    threshold(
      input.constellation,
      6,
      dm.constellation6.critDMG_,
      dm.passive1.critDMG_
    )
  )
)
const a1AfterSkillBurstGleam_eleMas = greaterEq(
  input.asc,
  1,
  greaterEq(
    tally.moonsign,
    2,
    equal(
      condA1AfterSkillBurst,
      'on',
      threshold(
        input.constellation,
        6,
        dm.constellation6.gleamEleMas,
        dm.passive1.gleamEleMas
      )
    )
  )
)

const hydroGeoCount = sum(tally.geo, tally.hydro)
const a4Song_geo_dmgIncDisp = greaterEq(
  input.asc,
  4,
  equal(
    condBurstSong,
    'on',
    greaterEq(
      hydroGeoCount,
      1,
      prod(
        subscript(hydroGeoCount, [...dm.passive2.geo_dmgInc], { unit: '%' }),
        input.total.eleMas
      )
    )
  ),
  { path: 'geo_dmgInc', isTeamBuff: true }
)
const a4Song_geo_dmgInc = equal(
  input.activeCharKey,
  target.charKey,
  a4Song_geo_dmgIncDisp
)
const a4Song_lunarcrystallize_dmgIncDisp = greaterEq(
  input.asc,
  4,
  equal(
    condBurstSong,
    'on',
    greaterEq(
      hydroGeoCount,
      1,
      prod(
        subscript(hydroGeoCount, [...dm.passive2.lunarcrystallize_dmgInc], {
          unit: '%',
        }),
        input.total.eleMas
      )
    )
  ),
  { path: 'lunarcrystallize_dmgInc', isTeamBuff: true }
)
const a4Song_lunarcrystallize_dmgInc = equal(
  input.activeCharKey,
  target.charKey,
  a4Song_lunarcrystallize_dmgIncDisp
)

const [condC4BurstActivePath, condC4BurstActive] = cond(key, 'c4BurstActive')
const c4BurstActive_defDisp = greaterEq(
  input.constellation,
  4,
  equal(condC4BurstActive, 'on', dm.constellation4.def)
)
const c4BurstActive_def = equal(
  input.activeCharKey,
  target.charKey,
  c4BurstActive_defDisp
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    pressDmg: splitScaleDmgNode(
      ['eleMas', 'def'],
      [dm.skill.pressDmgEleMas, dm.skill.pressDmgDef],
      'skill'
    ),
    holdDmg: splitScaleDmgNode(
      ['eleMas', 'def'],
      [dm.skill.holdDmgEleMas, dm.skill.holdDmgDef],
      'skill'
    ),
  },
  burst: {
    skillDmg: splitScaleDmgNode(
      ['eleMas', 'def'],
      [dm.burst.skillDmgEleMas, dm.burst.skillDmgDef],
      'burst'
    ),
    burstSong_geo_dmgIncDisp,
    burstSong_lunarcrystallize_dmgIncDisp,
  },
  passive2: {
    a4Song_geo_dmgIncDisp,
    a4Song_lunarcrystallize_dmgIncDisp,
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      customDmgNode(
        sum(
          prod(percent(dm.constellation2.dmgEleMas), input.total.eleMas),
          prod(percent(dm.constellation2.dmgDef), input.total.def)
        ),
        'burst'
      )
    ),
  },
}
const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  dmgFormulas,
  {
    premod: {
      burstBoost: burstC3,
      skillBoost: skillC5,
    },
    teamBuff: {
      premod: {
        geo_dmgInc: burstSong_geo_dmgInc,
        lunarcrystallize_dmgInc: burstSong_lunarcrystallize_dmgInc,
        geo_critRate_: a1AfterSkillBurst_geo_critRate_,
        geo_critDMG_: a1AfterSkillBurst_geo_critDMG_,
        eleMas: a1AfterSkillBurstGleam_eleMas,
        def: c4BurstActive_def,
      },
    },
    isMoonsign: constant(1),
  },
  {
    teamBuff: {
      premod: {
        geo_dmgInc: a4Song_geo_dmgInc,
        lunarcrystallize_dmgInc: a4Song_lunarcrystallize_dmgInc,
      },
    },
  }
)

const sheet: TalentSheet = {
  auto: ct.talentTem('auto', [
    {
      text: ct.chg('auto.fields.normal'),
    },
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i >= 3 ? i - 1 : i}`),
          textSuffix: i === 2 || i === 3 ? `(${i - 1})` : undefined,
        }),
      })),
    },
    {
      text: ct.chg('auto.fields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.dmg, {
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.5'),
          value: dm.charged.stam,
        },
      ],
    },
    {
      text: ct.chg('auto.fields.plunging'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.plunging.dmg, {
            name: stg('plunging.dmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.low, {
            name: stg('plunging.low'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.high, {
            name: stg('plunging.high'),
          }),
        },
      ],
    },
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.pressDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.holdDmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          text: stg('cd'),
          value: dm.burst.cd,
          unit: 's',
        },
        {
          text: stg('energyCost'),
          value: dm.burst.enerCost,
        },
      ],
    },
    ct.condTem('burst', {
      path: condBurstSongPath,
      value: condBurstSong,
      teamBuff: true,
      name: ct.ch('burstCond'),
      states: {
        on: {
          fields: [
            {
              node: burstSong_geo_dmgIncDisp,
            },
            {
              node: burstSong_lunarcrystallize_dmgIncDisp,
            },
          ],
        },
      },
    }),
    ct.headerTem('passive2', {
      teamBuff: true,
      fields: [
        {
          node: a4Song_geo_dmgIncDisp,
        },
        {
          node: a4Song_lunarcrystallize_dmgIncDisp,
        },
      ],
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1AfterSkillBurstPath,
      value: condA1AfterSkillBurst,
      teamBuff: true,
      name: st('afterUse.skillOrBurst'),
      states: {
        on: {
          fields: [
            {
              node: a1AfterSkillBurst_geo_critRate_,
            },
            {
              node: a1AfterSkillBurst_geo_critDMG_,
            },
            {
              node: a1AfterSkillBurstGleam_eleMas,
            },
            {
              text: stg('duration'),
              value: dm.passive1.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.dmg, { name: st('dmg') }),
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      path: condC4BurstActivePath,
      value: condC4BurstActive,
      teamBuff: true,
      name: ct.ch('c4Cond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c4BurstActive_defDisp, {
                path: 'def',
                isTeamBuff: true,
              }),
            },
          ],
        },
      },
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          text: ct.ch('c6Text'),
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
