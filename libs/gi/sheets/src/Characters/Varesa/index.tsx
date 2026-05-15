import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  min,
  naught,
  percent,
  prod,
  threshold,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Varesa'
const skillParam_gen = allStats.char.skillParam[key]
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
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  fp: {
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
  },
  skill: {
    rushDmg: skillParam_gen.skill[s++],
    fpRushDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    nsLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    kickDmg: skillParam_gen.burst[b++],
    fpKickDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    volcanoDmg: skillParam_gen.burst[b++],
    volcanoCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    impact_dmgInc: skillParam_gen.passive1[0][0],
    fpImpact_dmgInc: skillParam_gen.passive1[1][0],
    duration: 5,
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
    maxStacks: 2,
  },
  constellation1: {
    impact_dmgInc: skillParam_gen.constellation1[0],
    nsConsumptionDec: skillParam_gen.constellation1[1],
  },
  constellation2: {
    energyRestore: skillParam_gen.constellation2[0],
  },
  constellation4: {
    impact_dmgInc: skillParam_gen.constellation4[0],
    max_dmgInc: skillParam_gen.constellation4[1],
    burst_dmg_: skillParam_gen.constellation4[2],
    duration: 15,
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
  },
} as const

const [condA1RainbowPath, condA1Rainbow] = cond(key, 'a1Rainbow')
const a1Rainbow_impact_dmgInc = greaterEq(
  input.asc,
  1,
  equal(
    condA1Rainbow,
    'on',
    prod(
      // If > C1, give 180% of atk, otherwise 50%
      threshold(
        input.constellation,
        1,
        percent(dm.passive1.fpImpact_dmgInc),
        percent(dm.passive1.impact_dmgInc)
      ),
      input.total.atk
    )
  ),
  { path: 'plunging_impact_dmgInc' }
)
const a1Rainbow_fpImpact_dmgInc = infoMut(
  greaterEq(
    input.asc,
    1,
    equal(
      condA1Rainbow,
      'on',
      prod(percent(dm.passive1.fpImpact_dmgInc), input.total.atk)
    )
  ),
  { name: ct.ch('fpImpact_dmgInc') }
)

const [condA4NsBurstPath, condA4NsBurst] = cond(key, 'a4NsBurst')
const a4NsBurst_arr = range(1, dm.passive2.maxStacks)
const a4NsBurst = lookup(
  condA4NsBurst,
  objKeyMap(a4NsBurst_arr, (v) => constant(v)),
  naught
)
const a4NsBurst_atk_ = greaterEq(
  input.asc,
  4,
  prod(a4NsBurst, dm.passive2.atk_)
)

const [condC4DiligentPath, condC4Diligent] = cond(key, 'c4Diligent')
const c4Diligent_impact_dmgInc = greaterEq(
  input.constellation,
  4,
  equal(
    condC4Diligent,
    'on',
    min(
      prod(percent(dm.constellation4.impact_dmgInc), input.total.atk),
      dm.constellation4.max_dmgInc
    )
  ),
  { path: 'plunging_impact_dmgInc' }
)
const [condC4FpApexPath, condC4FpApex] = cond(key, 'c4FpApex')
const c4FpApex_burst_dmg_ = greaterEq(
  input.constellation,
  4,
  equal(condC4FpApex, 'on', dm.constellation4.burst_dmg_)
)
const c4FpApex_volcano_dmg_ = greaterEq(
  input.constellation,
  4,
  equal(condC4FpApex, 'on', dm.constellation4.burst_dmg_)
)

const c6_plunging_critRate_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.critRate_
)
const c6_plunging_critDMG_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.critDMG_
)
const c6_burst_critRate_ = { ...c6_plunging_critRate_ }
const c6_burst_critDMG_ = { ...c6_plunging_critDMG_ }

const nonFpPlungingAddl = {
  premod: {
    plunging_impact_dmgInc: a1Rainbow_impact_dmgInc,
  },
}
const fpPlungingAddl = {
  premod: {
    plunging_impact_dmgInc: a1Rainbow_fpImpact_dmgInc,
  },
}

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
    ...Object.fromEntries(
      dm.fp.normal.hitArr.map((arr, i) => [
        `fp${i}`,
        dmgNode('atk', arr, 'normal'),
      ])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
    fpDmg: dmgNode('atk', dm.fp.charged.dmg, 'charged'),
  },
  plunging: {
    ...plungingDmgNodes('atk', dm.plunging, nonFpPlungingAddl),
    ...objKeyValMap(
      Object.entries(plungingDmgNodes('atk', dm.fp.plunging, fpPlungingAddl)),
      ([k, v]) => [`fp${k}`, v]
    ),
  },
  skill: {
    rushDmg: dmgNode('atk', dm.skill.rushDmg, 'skill'),
    fpRushDmg: dmgNode('atk', dm.skill.fpRushDmg, 'skill'),
  },
  burst: {
    kickDmg: dmgNode('atk', dm.burst.kickDmg, 'burst'),
    fpKickDmg: dmgNode('atk', dm.burst.fpKickDmg, 'burst'),
    volcanoDmg: dmgNode(
      'atk',
      dm.burst.volcanoDmg,
      'plunging_impact',
      {
        premod: {
          plunging_impact_dmgInc: greaterEq(
            input.constellation,
            1,
            a1Rainbow_fpImpact_dmgInc
          ),
          plunging_dmg_: c4FpApex_volcano_dmg_,
        },
      },
      undefined,
      'burst'
    ),
  },
  passive1: {
    a1Rainbow_impact_dmgInc,
    a1Rainbow_fpImpact_dmgInc,
  },
  constellation4: {
    c4Diligent_impact_dmgInc,
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const autoC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    autoBoost: autoC5,
    burstBoost: burstC3,
    atk_: a4NsBurst_atk_,
    plunging_impact_dmgInc: c4Diligent_impact_dmgInc,
    burst_dmg_: c4FpApex_burst_dmg_,
    burst_critRate_: c6_burst_critRate_,
    burst_critDMG_: c6_burst_critDMG_,
    plunging_critRate_: c6_plunging_critRate_,
    plunging_critDMG_: c6_plunging_critDMG_,
  },
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
          node: infoMut(dmgFormulas.charged.dmg, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.4'),
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
    {
      text: ct.chg('auto.fields.fieryPassion'),
    },
    {
      text: ct.chg('auto.fields.fpNormal'),
    },
    {
      fields: dm.fp.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[`fp${i}`], {
          name: ct.chg(`auto.skillParams.${i + 7}`),
        }),
      })),
    },
    {
      text: ct.chg('auto.fields.fpCharged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.fpDmg, {
            name: ct.chg(`auto.skillParams.10`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.11'),
          value: dm.fp.charged.stam,
        },
      ],
    },
    {
      text: ct.chg('auto.fields.fpPlunging'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.plunging.fpdmg, {
            name: ct.chg('auto.skillParams.12'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.fplow, {
            name: ct.ch('fpLow'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.fphigh, {
            name: ct.ch('fpHigh'),
          }),
        },
      ],
    },
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.rushDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.fpRushDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.duration,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.3'),
          value: dm.skill.nsLimit,
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
          node: infoMut(dmgFormulas.burst.kickDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.fpKickDmg, {
            name: ct.chg('burst.skillParams.1'),
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
        {
          node: infoMut(dmgFormulas.burst.volcanoDmg, {
            name: ct.chg('burst.skillParams.4'),
          }),
        },
        {
          text: ct.chg('burst.skillParams.5'),
          value: dm.burst.volcanoCost,
        },
      ],
    },
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1RainbowPath,
      value: condA1Rainbow,
      name: ct.ch('a1RainbowCond'),
      states: {
        on: {
          fields: [
            {
              node: a1Rainbow_impact_dmgInc,
            },
            {
              node: a1Rainbow_fpImpact_dmgInc,
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
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4NsBurstPath,
      value: condA4NsBurst,
      name: st('nightsoul.partyBurst'),
      states: objKeyMap(a4NsBurst_arr, (stacks) => ({
        name: st('stack', { count: stacks }),
        fields: [
          {
            node: a4NsBurst_atk_,
          },
          {
            text: stg('duration'),
            value: dm.passive2.duration,
            unit: 's',
          },
        ],
      })),
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          text: ct.ch('c1Text'),
        },
        {
          text: ct.ch('c1Effect'),
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      path: condC4DiligentPath,
      value: condC4Diligent,
      name: ct.ch('c4DiligentCond'),
      states: {
        on: {
          fields: [
            {
              node: c4Diligent_impact_dmgInc,
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
    ct.condTem('constellation4', {
      path: condC4FpApexPath,
      value: condC4FpApex,
      name: ct.ch('c4FpApexCond'),
      states: {
        on: {
          fields: [
            {
              node: c4FpApex_burst_dmg_,
            },
            {
              node: infoMut(c4FpApex_volcano_dmg_, {
                name: ct.ch('volcanoDmg_'),
                unit: '%',
              }),
            },
          ],
        },
      },
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: autoC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    {
      fields: [
        {
          node: c6_plunging_critRate_,
        },
        { node: c6_plunging_critDMG_ },
        { node: c6_burst_critRate_ },
        { node: c6_burst_critDMG_ },
      ],
    },
  ]),
}
export default new CharacterSheet(sheet, data)
