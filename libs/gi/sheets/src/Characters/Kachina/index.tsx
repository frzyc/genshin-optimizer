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
  naught,
  percent,
  prod,
  subscript,
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
} from '../dataUtil'

const key: CharacterKey = 'Kachina'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2.1
      skillParam_gen.auto[++a], // 2.2
      skillParam_gen.auto[++a], // 3
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
    rideDmg: skillParam_gen.skill[s++],
    independentDmg: skillParam_gen.skill[s++],
    pointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    geo_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    dmgInc: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    pointsRegen: skillParam_gen.constellation2[0],
  },
  constellation4: {
    def_: skillParam_gen.constellation4,
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
  },
} as const

const [condA1NightsoulBurstPath, condA1NightsoulBurst] = cond(
  key,
  'a1NightsoulBurst',
)
const a1NightsoulBurst_geo_dmg_ = greaterEq(
  input.asc,
  1,
  equal(condA1NightsoulBurst, 'on', dm.passive1.geo_dmg_),
)

const a4_skill_dmgInc = greaterEq(
  input.asc,
  4,
  prod(percent(dm.passive2.dmgInc), input.total.def),
)

const c4OpponentsArr = range(1, 4)
const [condC4OpponentsPath, condC4Opponents] = cond(key, 'c4Opponents')
const c4Opponents = lookup(
  condC4Opponents,
  objKeyMap(c4OpponentsArr, (opp) => constant(opp)),
  naught,
)
const c4Opponents_def_ = subscript(c4Opponents, [0, ...dm.constellation4.def_])

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')]),
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    rideDmg: dmgNode('def', dm.skill.rideDmg, 'skill'),
    independentDmg: dmgNode('def', dm.skill.independentDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('def', dm.burst.skillDmg, 'burst'),
  },
  passive2: {
    a4_skill_dmgInc,
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.def),
        'elemental',
        { hit: { ele: constant('geo') } },
      ),
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    skill_dmgInc: a4_skill_dmgInc,
    geo_dmg_: a1NightsoulBurst_geo_dmg_,
  },
  teamBuff: {
    premod: {
      def_: c4Opponents_def_,
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
          name: ct.chg(`auto.skillParams.${i > 1 ? i - 1 : i}`),
          textSuffix: i >= 1 && i <= 2 ? `(${i})` : undefined,
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
          node: infoMut(dmgFormulas.skill.rideDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.independentDmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.pointLimit,
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.headerTem('passive2', {
      fields: [
        {
          node: a4_skill_dmgInc,
        },
      ],
    }),
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
          text: ct.chg('burst.skillParams.1'),
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
    ct.condTem('constellation4', {
      path: condC4OpponentsPath,
      value: condC4Opponents,
      teamBuff: true,
      name: st('numOpponentsField'),
      states: objKeyMap(c4OpponentsArr, (opp) => ({
        name: st('opponents', { count: opp }),
        fields: [
          {
            node: c4Opponents_def_,
          },
        ],
      })),
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      value: condA1NightsoulBurst,
      path: condA1NightsoulBurstPath,
      name: st('nightsoul.partyBurst'),
      states: {
        on: {
          fields: [
            {
              node: a1NightsoulBurst_geo_dmg_,
            },
          ],
        },
      },
    }),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.dmg, { name: st('dmg') }),
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
