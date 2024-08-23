import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  lessThan,
  percent,
  prod,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'YaeMiko'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = 0,
  s = 0,
  b = 0,
  p2 = 0
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
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg1: skillParam_gen.skill[s++],
    dmg2: skillParam_gen.skill[s++],
    dmg3: skillParam_gen.skill[s++],
    dmg4: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    tenkoDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    eleMas_dmg_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    enerRest: skillParam_gen.constellation1[0],
  },
  constellation2: {
    unknown1: skillParam_gen.constellation2[0], //what is this?
    aoeInc: skillParam_gen.constellation2[1],
    unknown2: skillParam_gen.constellation2[2], //what is this?
  },
  constellation4: {
    ele_dmg_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    defIgn_: skillParam_gen.constellation6[0],
  },
} as const

const [condC4Path, condC4] = cond(key, 'c4')
const nodeC4 = greaterEq(
  input.constellation,
  4,
  equal('hit', condC4, dm.constellation4.ele_dmg_)
)

const nodeC6 = greaterEq(input.constellation, 6, dm.constellation6.defIgn_)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    dmg1: lessThan(
      input.constellation,
      2,
      dmgNode('atk', dm.skill.dmg1, 'skill')
    ),
    dmg2: dmgNode('atk', dm.skill.dmg2, 'skill', {
      premod: { enemyDefIgn_: nodeC6 },
    }),
    dmg3: dmgNode('atk', dm.skill.dmg3, 'skill', {
      premod: { enemyDefIgn_: nodeC6 },
    }),
    dmg4: greaterEq(
      input.constellation,
      2,
      dmgNode('atk', dm.skill.dmg4, 'skill', {
        premod: { enemyDefIgn_: nodeC6 },
      })
    ),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    tenkoDmg: dmgNode('atk', dm.burst.tenkoDmg, 'burst'),
  },
  passive2: {
    nodeAsc4: greaterEq(
      input.asc,
      4,
      prod(input.total.eleMas, percent(dm.passive2.eleMas_dmg_, { fixed: 2 }))
    ),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: nodeC3,
    burstBoost: nodeC5,
  },
  total: {
    skill_dmg_: dmgFormulas.passive2.nodeAsc4,
  },
  teamBuff: {
    premod: {
      electro_dmg_: nodeC4,
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
          value: dm.charged.stamina,
        },
      ],
    },
    {
      text: ct.chg(`auto.fields.plunging`),
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
          node: infoMut(dmgFormulas.skill.dmg1, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.dmg2, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.dmg3, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.dmg4, {
            name: ct.chg(`skill.skillParams.3`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.duration,
          unit: 's',
        },

        {
          text: ct.chg('skill.skillParams.5'),
          value: dm.skill.cd,
        },
        {
          text: st('charges'),
          value: 3,
        },
      ],
    },
    ct.headerTem('constellation2', {
      fields: [
        {
          text: st('aoeInc'),
          value: dm.constellation2.aoeInc * 100,
          unit: '%',
        },
      ],
    }),
    ct.condTem('constellation4', {
      value: condC4,
      path: condC4Path,
      teamBuff: true,
      name: ct.ch('c4'),
      states: {
        hit: {
          fields: [
            {
              node: nodeC4,
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
    ct.headerTem('constellation6', {
      fields: [
        {
          text: ct.ch('c6'),
          value: dm.constellation6.defIgn_ * 100,
          unit: '%',
        },
      ],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.dmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.tenkoDmg, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
          value: dm.burst.cd,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.3'),
          value: dm.burst.enerCost,
        },
      ],
    },
    ct.headerTem('constellation1', {
      fields: [
        {
          text: st('enerRegenPerHit'),
          value: dm.constellation1.enerRest,
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    { fields: [{ node: dmgFormulas.passive2.nodeAsc4 }] },
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: nodeC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
