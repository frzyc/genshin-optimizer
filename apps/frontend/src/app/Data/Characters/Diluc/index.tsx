import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  infoMut,
  lookup,
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = 'Diluc'
const elementKey: ElementKey = 'pyro'
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0,
  c2i = 0,
  c6i = 0
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
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    firstHit: skillParam_gen.skill[s++],
    secondHit: skillParam_gen.skill[s++],
    thridHit: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    slashDmg: skillParam_gen.burst[b++],
    dotDmg: skillParam_gen.burst[b++],
    explosionDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stamReduction: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    durationInc: skillParam_gen.passive2[p2++][0],
    pyroInc: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    dmgInc: skillParam_gen.constellation1[0],
    hpThresh_: 0.5,
  },
  constellation2: {
    atkInc: skillParam_gen.constellation2[c2i++],
    atkSpdInc: skillParam_gen.constellation2[c2i++],
    duration: skillParam_gen.constellation2[c2i++],
    maxStack: skillParam_gen.constellation2[c2i++],
    cd: skillParam_gen.constellation2[c2i++],
  },
  constellation4: {
    dmgInc: skillParam_gen.constellation4[0],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[c6i++],
    dmgInc: skillParam_gen.constellation6[c6i++],
    atkSpdInc: skillParam_gen.constellation6[c6i++],
  },
} as const

const [condBurstPath, condBurst] = cond(key, 'Burst')
const [condC1Path, condC1] = cond(key, 'DilucC1')
const [condC2Path, condC2] = cond(key, 'DilucC2')
const [condC6Path, condC6] = cond(key, 'DilucC6')

const nodeBurstInfusion = equalStr(condBurst, 'on', 'pyro')
const nodeA4Bonus = greaterEq(
  input.asc,
  4,
  equal(condBurst, 'on', dm.passive2.pyroInc)
)

const nodeC1Bonus = equal(
  condC1,
  'on',
  greaterEq(input.constellation, 1, dm.constellation1.dmgInc)
)
const nodeC2AtkBonus = greaterEq(
  input.constellation,
  2,
  lookup(
    condC2,
    Object.fromEntries(
      range(1, dm.constellation2.maxStack).map((i) => [
        i,
        constant(dm.constellation2.atkInc * i),
      ])
    ),
    0,
    KeyMap.info('atk_')
  )
)
const nodeC2SpdBonus = greaterEq(
  input.constellation,
  2,
  lookup(
    condC2,
    Object.fromEntries(
      range(1, dm.constellation2.maxStack).map((i) => [
        i,
        constant(dm.constellation2.atkSpdInc * i),
      ])
    ),
    0,
    KeyMap.info('atkSPD_')
  )
)
const nodeC6DmgBonus = equal(
  condC6,
  'on',
  greaterEq(input.constellation, 6, dm.constellation6.dmgInc)
)
const nodeC6SpdBonus = equal(
  condC6,
  'on',
  greaterEq(input.constellation, 6, dm.constellation6.atkSpdInc),
  KeyMap.info('atkSPD_')
)

const skillAdditional: Data = {
  premod: { skill_dmg_: constant(dm.constellation4.dmgInc) },
  hit: { ele: constant('pyro') },
}

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    spinningDmg: dmgNode('atk', dm.charged.spinningDmg, 'charged'),
    finalDmg: dmgNode('atk', dm.charged.finalDmg, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([name, arr]) => [
      name,
      dmgNode('atk', arr, 'plunging'),
    ])
  ),
  skill: {
    firstHit: dmgNode('atk', dm.skill.firstHit, 'skill'),
    secondHit: dmgNode('atk', dm.skill.secondHit, 'skill'),
    thirdHit: dmgNode('atk', dm.skill.thridHit, 'skill'),
  },
  burst: {
    slashDmg: dmgNode('atk', dm.burst.slashDmg, 'burst'),
    dotDmg: dmgNode('atk', dm.burst.dotDmg, 'burst'),
    explosionDmg: dmgNode('atk', dm.burst.explosionDmg, 'burst'),
  },
  constellation4: {
    secondHitBoost: greaterEq(
      input.constellation,
      4,
      dmgNode('atk', dm.skill.secondHit, 'skill', skillAdditional)
    ),
    thirdHitBoost: greaterEq(
      input.constellation,
      4,
      dmgNode('atk', dm.skill.thridHit, 'skill', skillAdditional)
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'mondstadt',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC3,
      burstBoost: nodeC5,
      pyro_dmg_: nodeA4Bonus,
      atk_: nodeC2AtkBonus,
      atkSPD_: sum(nodeC6SpdBonus, nodeC2SpdBonus),
      all_dmg_: nodeC1Bonus,
      normal_dmg_: nodeC6DmgBonus,
    },
    infusion: {
      // CAUTION: Technically, this infusion is overridable,
      // but it should also be higher prio than `team` because
      // it refreshes faster than auras. So we put it here instead.
      nonOverridableSelf: nodeBurstInfusion,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: 'M',
  constellationName: ct.chg('constellationName'),
  title: ct.chg('title'),
  talent: {
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
            node: infoMut(dmgFormulas.charged.spinningDmg, {
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
            value: (data) =>
              data.get(input.asc).value >= 1
                ? `${dm.charged.stamina}/s - ${
                    dm.passive1.stamReduction * 100
                  }%`
                : `${dm.charged.stamina}/s`,
          },
          {
            text: ct.chg('auto.skillParams.7'),
            value: (data) =>
              data.get(input.asc).value >= 1
                ? `${dm.charged.duration}s + ${dm.passive1.duration}`
                : dm.charged.duration,
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
            node: infoMut(dmgFormulas.skill.firstHit, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.secondHit, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.thirdHit, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.constellation4.secondHitBoost, {
              name: ct.ch('skillB.0'),
            }),
          },
          {
            node: infoMut(dmgFormulas.constellation4.thirdHitBoost, {
              name: ct.ch('skillB.1'),
            }),
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.skill.cd,
          },
        ],
      },
      ct.condTem('constellation6', {
        value: condC6,
        path: condC6Path,
        name: st('afterUse.skill'),
        states: {
          on: {
            fields: [
              {
                node: nodeC6DmgBonus,
              },
              {
                node: nodeC6SpdBonus,
              },
            ],
          },
        },
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.slashDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.dotDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.explosionDmg, {
              name: ct.chg(`burst.skillParams.2`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.5'),
            value: dm.burst.cost,
          },
        ],
      },
      ct.condTem('burst', {
        name: st('afterUse.burst'),
        value: condBurst,
        path: condBurstPath,
        states: {
          on: {
            fields: [
              {
                text: st('infusion.pyro'),
                variant: 'pyro',
              },
              {
                node: nodeA4Bonus,
              },
              {
                text: stg('duration'),
                value: (data) =>
                  data.get(input.asc).value >= 4
                    ? `${dm.burst.duration} + ${dm.passive2.durationInc}`
                    : dm.burst.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.condTem('constellation1', {
        value: condC1,
        path: condC1Path,
        name: st('enemyGreaterPercentHP', {
          percent: dm.constellation1.hpThresh_ * 100,
        }),
        canShow: greaterEq(input.constellation, 1, 1),
        states: {
          on: {
            fields: [
              {
                node: nodeC1Bonus,
              },
            ],
          },
        },
      }),
    ]),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        value: condC2,
        path: condC2Path,
        name: st('takeDmg'),
        states: Object.fromEntries(
          range(1, dm.constellation2.maxStack).map((i) => [
            i,
            {
              name: st('stack', { count: i }),
              fields: [
                {
                  node: nodeC2AtkBonus,
                },
                {
                  node: nodeC2SpdBonus,
                },
              ],
            },
          ])
        ),
      }),
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)
