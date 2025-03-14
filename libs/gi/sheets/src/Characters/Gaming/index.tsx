import type { CharacterKey } from '@genshin-optimizer/gi/consts'
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
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Gaming'
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
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    cyclicDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    cloudstriderDmg: skillParam_gen.skill[s++],
    hpCost: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    smashDmg: skillParam_gen.burst[b++],
    heal: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    heal: skillParam_gen.passive1[1][0],
  },
  passive2: {
    threshold: skillParam_gen.passive2[0][0],
    heal_: skillParam_gen.passive2[1][0],
    cloudstrider_dmg_: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    heal: skillParam_gen.constellation1[0],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
  },
  constellation6: {
    skill_critRate_: skillParam_gen.constellation6[0],
    skill_critDMG_: skillParam_gen.constellation6[1],
  },
} as const

const skillHpCost = prod(percent(dm.skill.hpCost), input.total.hp)

const [condA4HpStatePath, condA4HpState] = cond(key, 'a4HpState')
const a4HpState_heal_ = greaterEq(
  input.asc,
  4,
  equal(condA4HpState, 'below', dm.passive2.heal_),
)
const a4HpState_cloudstrider_dmg_ = greaterEq(
  input.asc,
  4,
  equal(condA4HpState, 'above', dm.passive2.cloudstrider_dmg_),
)

const [condC2OverhealPath, condC2Overheal] = cond(key, 'c2Overheal')
const c2Overheal_atk_ = greaterEq(
  input.constellation,
  2,
  equal(condC2Overheal, 'on', dm.constellation2.atk_),
)

const c6_cloudstrider_critRate_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.skill_critRate_,
)
const c6_cloudstrider_critDMG_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.skill_critDMG_,
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')]),
    ),
  },
  charged: {
    cyclicDmg: dmgNode('atk', dm.charged.cyclicDmg, 'charged'),
    finalDmg: dmgNode('atk', dm.charged.finalDmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    cloudstriderDmg: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.cloudstriderDmg, {
          unit: '%',
        }),
        input.total.atk,
      ),
      'plunging_impact',
      {
        hit: { ele: constant('pyro') },
        premod: {
          plunging_dmg_: a4HpState_cloudstrider_dmg_,
          plunging_critRate_: c6_cloudstrider_critRate_,
          plunging_critDMG_: c6_cloudstrider_critDMG_,
        },
      },
    ),
  },
  burst: {
    smashDmg: dmgNode('atk', dm.burst.smashDmg, 'burst'),
    heal: healNode('hp', percent(dm.burst.heal), 0),
  },
  passive1: {
    heal: greaterEq(input.asc, 1, healNode('hp', percent(dm.passive1.heal), 0)),
  },
  constellation1: {
    heal: greaterEq(
      input.constellation,
      1,
      healNode('hp', percent(dm.constellation1.heal), 0),
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    heal_: a4HpState_heal_,
    atk_: c2Overheal_atk_,
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
          node: infoMut(dmgFormulas.charged.cyclicDmg, {
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.finalDmg, {
            name: ct.chg(`auto.skillParams.5`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.6'),
          value: dm.charged.stam,
          unit: '/s',
        },
        {
          text: ct.chg('auto.skillParams.7'),
          value: dm.charged.duration,
          unit: 's',
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
          node: infoMut(dmgFormulas.skill.cloudstriderDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(skillHpCost, { name: ct.chg('skill.skillParams.1') }),
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.headerTem('constellation6', {
      fields: [
        {
          node: infoMut(c6_cloudstrider_critRate_, {
            name: ct.ch('cloudstrider_critRate_'),
            unit: '%',
          }),
        },
        {
          node: infoMut(c6_cloudstrider_critDMG_, {
            name: ct.ch('cloudstrider_critDMG_'),
            unit: '%',
          }),
        },
      ],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.smashDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.heal, {
            name: ct.chg('burst.skillParams.1'),
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
    ct.fieldsTem('passive1', {
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.heal, { name: stg('healing') }),
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      value: condA4HpState,
      path: condA4HpStatePath,
      name: st('percentCurrentHP'),
      states: {
        below: {
          name: st('lessPercentHP', { percent: dm.passive2.threshold * 100 }),
          fields: [
            {
              node: a4HpState_heal_,
            },
          ],
        },
        above: {
          name: st('greaterEqPercentHP', {
            percent: dm.passive2.threshold * 100,
          }),
          fields: [
            {
              node: infoMut(a4HpState_cloudstrider_dmg_, {
                name: ct.ch('cloudstrider_dmg_'),
                unit: '%',
              }),
            },
          ],
        },
      },
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.heal, {
            name: stg('healing'),
          }),
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2OverhealPath,
      value: condC2Overheal,
      name: st('afterOverflow'),
      states: {
        on: {
          fields: [
            {
              node: c2Overheal_atk_,
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
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
