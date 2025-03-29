import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type CharacterKey } from '@genshin-optimizer/gi/consts'
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
  subscript,
  target,
  threshold,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Iansan'
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
      skillParam_gen.auto[++a], // 3
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    swiftDmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    nsLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    highAtkConversion: skillParam_gen.burst[b++][0],
    lowAtkConversionPerNs: skillParam_gen.burst[b++][0],
    maxAtk: skillParam_gen.burst[b++],
    nonCombatDuration: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atk_: skillParam_gen.passive1[0][0],
    extraNs: skillParam_gen.passive1[1][0],
    duration: skillParam_gen.passive1[2][0],
    addlNs: skillParam_gen.passive1[3][0],
    cd: skillParam_gen.passive1[4][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    heal: skillParam_gen.passive2[1][0],
    cd: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    nsConsumed: skillParam_gen.constellation1[0],
    energyRegen: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    duration: 15,
  },
  constellation4: {
    addlNs: skillParam_gen.constellation4[0],
    overflowRefund: skillParam_gen.constellation4[1],
  },
  constellation6: {
    durationInc: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    dmg_: skillParam_gen.constellation6[2],
  },
} as const

const [condBurstNsPath, condBurstNs] = cond(key, 'burstNs')
const burstNsArr = range(1, 42)
const burstNs = lookup(
  condBurstNs,
  objKeyMap(burstNsArr, (ns) => constant(ns)),
  naught
)
const burstNs_atk = min(
  threshold(
    burstNs,
    42,
    prod(percent(dm.burst.highAtkConversion), input.premod.atk),
    prod(percent(dm.burst.lowAtkConversionPerNs), burstNs, input.premod.atk)
  ),
  subscript(input.total.burst, dm.burst.maxAtk)
)

const [condA1PrecisePath, condA1Precise] = cond(key, 'a1Precise')
const a1Precise_atk_ = greaterEq(
  input.asc,
  1,
  equal(condA1Precise, 'on', dm.passive1.atk_)
)

const c2OffFieldPrecise_atk_disp = greaterEq(
  input.constellation,
  2,
  greaterEq(input.asc, 1, equal(condA1Precise, 'on', dm.constellation2.atk_), {
    path: 'atk_',
    isTeamBuff: true,
  })
)
const c2OffFieldPrecise_atk_ = equal(
  input.activeCharKey,
  target.charKey,
  c2OffFieldPrecise_atk_disp
)

const [condC6ExtremePath, condC6Extreme] = cond(key, 'c6Extreme')
const c6Extreme_dmg_disp = greaterEq(
  input.constellation,
  6,
  equal(condC6Extreme, 'on', dm.constellation6.dmg_),
  { path: 'all_dmg_', isTeamBuff: true }
)
const c6Extreme_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  c6Extreme_dmg_disp
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
    swiftDmg: dmgNode('atk', dm.charged.swiftDmg, 'charged', {
      hit: { ele: constant('electro') },
    }),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    burstNs_atk,
  },
  passive2: {
    heal: customHealNode(prod(percent(dm.passive2.heal), input.total.atk)),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    atk_: a1Precise_atk_,
  },
  teamBuff: {
    premod: {
      atk_: c2OffFieldPrecise_atk_,
      all_dmg_: c6Extreme_dmg_,
    },
    total: {
      atk: burstNs_atk,
    },
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
          name: ct.chg(`auto.skillParams.${i + 1}`),
        }),
      })),
    },
    {
      text: ct.chg('auto.fields.charged'),
    },
    {
      text: ct.chg('auto.fields.nightsoul'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.dmg, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.swiftDmg, {
            name: ct.chg('auto.skillParams.4'),
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
          node: infoMut(dmgFormulas.skill.skillDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.1'),
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
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          text: stg('duration'),
          value: dm.burst.duration,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.5'),
          value: dm.burst.nonCombatDuration,
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
    ct.condTem('burst', {
      path: condBurstNsPath,
      value: condBurstNs,
      teamBuff: true,
      name: st('nightsoul.current'),
      states: objKeyMap(burstNsArr, (ns) => ({
        name:
          ns === 42
            ? st('greaterEqPoints', { count: ns })
            : st('points', { count: ns }),
        fields: [
          {
            node: burstNs_atk,
          },
        ],
      })),
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1PrecisePath,
      value: condA1Precise,
      teamBuff: true,
      name: ct.ch('a1Cond'),
      states: {
        on: {
          fields: [
            {
              node: a1Precise_atk_,
            },
          ],
        },
      },
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.fieldsTem('passive2', {
      fields: [
        {
          node: infoMut(dmgFormulas.passive2.heal, { name: stg('healing') }),
        },
        {
          text: stg('cd'),
          value: dm.passive2.cd,
          unit: 's',
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condA1PrecisePath,
      value: condA1Precise,
      name: ct.ch('a1Cond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: c2OffFieldPrecise_atk_disp,
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
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      path: condC6ExtremePath,
      value: condC6Extreme,
      name: ct.ch('c6Cond'),
      states: {
        on: {
          fields: [
            {
              node: c6Extreme_dmg_disp,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
