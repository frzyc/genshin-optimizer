import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  active,
  compareEq,
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  lunarDmg,
  min,
  naught,
  percent,
  prod,
  subscript,
  sum,
  tally,
  target,
  threshold,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Linnea'
const skillParam_gen = allStats.char.skillParam[key]
const ele = allStats.char.data[key].ele!
const ct = charTemplates(key)

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
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pummelerDmg: skillParam_gen.skill[s++], // x2
    hammerDmg: skillParam_gen.skill[s++],
    crushDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    initialHealFlat: skillParam_gen.burst[b++],
    initialHealMult: skillParam_gen.burst[b++],
    continuousHealFlat: skillParam_gen.burst[b++],
    continuousHealMult: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    geo_enemyRes_: skillParam_gen.passive1[0][0],
    gleamGeo_enemyRes_: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
  },
  passive3: {
    base_lunarcrystallize_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunarcrystallize_dmg_: skillParam_gen.passive3![1][0],
  },
  passive: {
    dmg: skillParam_gen.passive![0][0],
  },
  constellation1: {
    stacks: skillParam_gen.constellation1[0],
    maxStacks: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
    lunarcrystallize_dmgInc: skillParam_gen.constellation1[3],
    lumiMaxStacksConsume: skillParam_gen.constellation1[4],
    lumi_dmgInc: skillParam_gen.constellation1[5],
  },
  constellation2: {
    hydroGeo_critDMG_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    lumi_critDMG_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    duration: skillParam_gen.constellation4[0],
    self_def_: skillParam_gen.constellation4[1],
    team_def_: skillParam_gen.constellation4[2],
  },
  constellation6: {
    lunarcrystallize_specialDmg_: skillParam_gen.constellation6[0],
    stacksConsumed: skillParam_gen.constellation6[1],
    lunarcrystallize_dmgInc: skillParam_gen.constellation6[2],
  },
} as const

const a0_lunarcrystallize_baseDmg_ = min(
  prod(
    percent(dm.passive3.base_lunarcrystallize_dmg_),
    input.total.def,
    1 / 100
  ),
  percent(dm.passive3.maxBase_lunarcrystallize_dmg_)
)

const [condA1LumiPath, condA1Lumi] = cond(key, 'a1Lumi')
const a1Lumi_geo_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(
    condA1Lumi,
    'on',
    threshold(
      tally.moonsign,
      2,
      -dm.passive1.gleamGeo_enemyRes_,
      -dm.passive1.geo_enemyRes_
    )
  )
)

const a4_eleMas = greaterEq(
  input.asc,
  4,
  prod(percent(dm.passive2.eleMas), input.premod.def)
)
const a4Active_teammate_eleMasDisp = equal(active.isMoonsign, 1, {
  ...a4_eleMas,
})
const a4Active_teammate_eleMas = equal(
  input.activeCharKey,
  target.charKey,
  a4Active_teammate_eleMasDisp
)
const a4Active_self_eleMas = unequal(active.isMoonsign, 1, {
  ...a4_eleMas,
})

const [condC1TeamStacksPath, condC1TeamStacks] = cond(key, 'c1TeamStacks')
const c1TeamStacks_lunarcrystallize_dmgInc = greaterEq(
  input.constellation,
  1,
  equal(
    condC1TeamStacks,
    'on',
    prod(
      threshold(
        input.constellation,
        6,
        percent(
          dm.constellation6.stacksConsumed *
            dm.constellation6.lunarcrystallize_dmgInc *
            dm.constellation1.lunarcrystallize_dmgInc
        ),
        percent(dm.constellation1.lunarcrystallize_dmgInc)
      ),
      input.total.def
    )
  )
)

const c1LumiStacksArr = range(1, dm.constellation1.lumiMaxStacksConsume)
const c1LumiStacksArrForC6 = range(
  1,
  dm.constellation1.lumiMaxStacksConsume * 2
)
const [condC1LumiStacksPath, condC1LumiStacks] = cond(key, 'c1LumiStacks')
const c1LumiStacks = lookup(
  condC1LumiStacks,
  objKeyMap(c1LumiStacksArrForC6, (s) =>
    s > dm.constellation1.lumiMaxStacksConsume
      ? greaterEq(input.constellation, 6, s)
      : constant(s)
  ),
  naught
)
const c1LumiStacks_lunarcrystallize_dmgInc = greaterEq(
  input.constellation,
  1,
  prod(
    c1LumiStacks,
    threshold(
      input.constellation,
      6,
      percent(
        dm.constellation6.lunarcrystallize_dmgInc *
          dm.constellation1.lumi_dmgInc
      ),
      percent(dm.constellation1.lumi_dmgInc)
    ),
    input.total.def
  )
)

const [condC2MoondriftPath, condC2Moondrift] = cond(key, 'c2Moondrift')
const c2Moondrift_hydroGeo_critDMG_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2Moondrift,
    'on',
    greaterEq(
      sum(equal(target.charEle, 'hydro', 1), equal(target.charEle, 'geo', 1)),
      1,
      dm.constellation2.hydroGeo_critDMG_
    )
  )
)
const c2Lumi_critDMG_ = greaterEq(
  input.constellation,
  2,
  equal(condC2Moondrift, 'on', dm.constellation2.lumi_critDMG_)
)

const [condC4MoondriftPath, condC4Moondrift] = cond(key, 'c4Moondrift')
const c4Moondrift_active_def_disp = greaterEq(
  input.constellation,
  4,
  equal(condC4Moondrift, 'on', dm.constellation4.team_def_)
)
const c4Moondrift_active_def_ = equal(
  input.activeCharKey,
  target.charKey,
  c4Moondrift_active_def_disp
)
const c4Moondrift_self_def_ = greaterEq(
  input.constellation,
  4,
  dm.constellation4.self_def_
)

const c6Gleam_lunarcrystallize_specialDmg_ = greaterEq(
  input.constellation,
  6,
  greaterEq(tally.moonsign, 2, dm.constellation6.lunarcrystallize_specialDmg_)
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    fullyAimed: dmgNode('atk', dm.charged.fullyAimed, 'charged', {
      hit: { ele: constant(ele) },
    }),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    pummelerDmg: dmgNode('def', dm.skill.pummelerDmg, 'skill'),
    hammerDmg: lunarDmg(
      subscript(input.total.skillIndex, dm.skill.hammerDmg, { unit: '%' }),
      'def',
      'lunarcrystallize'
    ),
    crushDmg: lunarDmg(
      subscript(input.total.skillIndex, dm.skill.crushDmg, { unit: '%' }),
      'def',
      'lunarcrystallize',
      {
        premod: {
          // These C1 values do not stack
          lunarcrystallize_dmgInc: infoMut(
            sum(
              c1LumiStacks_lunarcrystallize_dmgInc,
              prod(-1, c1TeamStacks_lunarcrystallize_dmgInc)
            ),
            { pivot: true }
          ),
          critDMG_: c2Lumi_critDMG_,
        },
      }
    ),
  },
  burst: {
    initialHeal: healNodeTalent(
      'def',
      dm.burst.initialHealMult,
      dm.burst.initialHealFlat,
      'burst'
    ),
    continuousHeal: healNodeTalent(
      'def',
      dm.burst.continuousHealMult,
      dm.burst.continuousHealFlat,
      'burst'
    ),
  },
  passive2: {
    a4_eleMas: compareEq(
      active.isMoonsign,
      1,
      a4Active_teammate_eleMasDisp,
      unequal(active.isMoonsign, 1, a4Active_self_eleMas)
    ),
  },
  passive3: {
    a0_lunarcrystallize_baseDmg_,
  },
  passive: {
    fullyAimed: dmgNode(
      'atk',
      dm.charged.fullyAimed,
      'charged',
      {
        hit: { ele: constant(ele) },
      },
      percent(dm.passive.dmg)
    ),
  },
}
const skillBoostC3 = greaterEq(input.constellation, 3, 3)
const burstBoostC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstBoostC5,
    skillBoost: skillBoostC3,
    eleMas: a4Active_self_eleMas,
    def_: c4Moondrift_self_def_,
  },
  teamBuff: {
    premod: {
      lunarcrystallize_baseDmg_: a0_lunarcrystallize_baseDmg_,
      geo_enemyRes_: a1Lumi_geo_enemyRes_,
      eleMas: a4Active_teammate_eleMas,
      // TODO: adjust this, either here or in reaction.ts
      lunarcrystallize_dmgInc: c1TeamStacks_lunarcrystallize_dmgInc,
      critDMG_: c2Moondrift_hydroGeo_critDMG_,
      def_: c4Moondrift_active_def_,
      lunarcrystallize_specialDmg_: c6Gleam_lunarcrystallize_specialDmg_,
    },
  },
  isMoonsign: constant(1),
})

const sheet: TalentSheet = {
  auto: ct.talentTem('auto', [
    {
      text: ct.chg('auto.fields.normal'),
    },
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i}`),
        }),
      })),
    },
    {
      text: ct.chg('auto.fields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.aimed, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.fullyAimed, {
            name: ct.chg(`auto.skillParams.4`),
          }),
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
          node: infoMut(dmgFormulas.skill.pummelerDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.hammerDmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.crushDmg, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.3'),
          value: dm.skill.duration,
          unit: 's',
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
          node: infoMut(dmgFormulas.burst.initialHeal, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.continuousHeal, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
          value: dm.burst.duration,
          unit: 's',
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
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      value: condA1Lumi,
      path: condA1LumiPath,
      name: ct.ch('a1Cond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: a1Lumi_geo_enemyRes_,
            },
          ],
        },
      },
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.headerTem('passive2', {
      teamBuff: true,
      fields: [
        {
          node: infoMut(
            a4Active_teammate_eleMasDisp,
            a4Active_teammate_eleMas.info!
          ),
        },
        {
          node: a4Active_self_eleMas,
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    ct.headerTem('passive3', {
      teamBuff: true,
      fields: [
        {
          node: a0_lunarcrystallize_baseDmg_,
        },
      ],
    }),
  ]),
  passive: ct.talentTem('passive', [
    ct.fieldsTem('passive', {
      fields: [
        {
          node: infoMut(dmgFormulas.passive.fullyAimed, {
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      value: condC1TeamStacks,
      path: condC1TeamStacksPath,
      name: ct.ch('c1TeamCond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: c1TeamStacks_lunarcrystallize_dmgInc,
            },
            {
              text: st('triggerQuota'),
              value: dm.constellation1.maxStacks,
            },
            {
              text: stg('duration'),
              value: dm.constellation1.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.condTem('constellation1', {
      value: condC1LumiStacks,
      path: condC1LumiStacksPath,
      name: ct.ch('c1LumiCond'),
      states: (data) =>
        objKeyMap(
          data.get(input.constellation).value >= 6
            ? c1LumiStacksArrForC6
            : c1LumiStacksArr,
          (stack) => ({
            name: st('stack', { count: stack }),
            fields: [
              {
                node: infoMut(c1LumiStacks_lunarcrystallize_dmgInc, {
                  name: ct.ch('lumiDmgInc'),
                }),
              },
              {
                text: st('triggerQuota'),
                value: dm.constellation1.maxStacks,
              },
              {
                text: stg('duration'),
                value: dm.constellation1.duration,
                unit: 's',
              },
            ],
          })
        ),
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      value: condC2Moondrift,
      path: condC2MoondriftPath,
      teamBuff: true,
      name: st('elementalReaction.moondriftTrigger'),
      states: {
        on: {
          fields: [
            {
              node: c2Moondrift_hydroGeo_critDMG_,
            },
            {
              node: infoMut(c2Lumi_critDMG_, {
                name: ct.ch('lumiCritDmg_'),
                unit: '%',
                icon: (
                  <StatIcon
                    statKey="critDMG_"
                    iconProps={{
                      fontSize: 'inherit',
                    }}
                  />
                ),
              }),
            },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillBoostC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      value: condC4Moondrift,
      path: condC4MoondriftPath,
      teamBuff: true,
      name: st('elementalReaction.moondriftTrigger'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(
                c4Moondrift_active_def_disp,
                c4Moondrift_active_def_.info!
              ),
            },
            {
              node: c4Moondrift_self_def_,
            },
            {
              text: stg('duration'),
              value: dm.constellation4.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstBoostC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          text: ct.ch('c6Text'),
        },
        {
          node: c6Gleam_lunarcrystallize_specialDmg_,
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
