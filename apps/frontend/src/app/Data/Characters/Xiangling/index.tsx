import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
} from '../../../Formula/utils'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Xiangling'
const elementKey: ElementKey = 'pyro'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4x4
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg1: skillParam_gen.burst[b++],
    dmg2: skillParam_gen.burst[b++],
    dmg3: skillParam_gen.burst[b++],
    dmgNado: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    atk_bonus: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    pyroRes: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    duration1: skillParam_gen.constellation2[0],
    duration2: skillParam_gen.constellation2[1],
    dmg: skillParam_gen.constellation2[2],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[0],
  },
  constellation6: {
    pyroDmg: skillParam_gen.constellation6[0],
  },
} as const

// A4
const [condAfterChiliPath, condAfterChili] = cond(key, 'afterChili')
const afterChili = greaterEq(
  input.asc,
  4,
  equal('afterChili', condAfterChili, percent(dm.passive2.atk_bonus))
)

// C1
const [condAfterGuobaHitPath, condAfterGuobaHit] = cond(key, 'afterGuobaHit')
const afterGuobaHit = greaterEq(
  input.constellation,
  1,
  equal('afterGuobaHit', condAfterGuobaHit, percent(-dm.constellation1.pyroRes))
)

// C6
const [condDuringPyronadoPath, condDuringPyronado] = cond(key, 'afterPyronado')
const duringPyronado = greaterEq(
  input.constellation,
  6,
  equal(
    'duringPyronado',
    condDuringPyronado,
    percent(dm.constellation6.pyroDmg)
  )
)
const antiC6 = prod(duringPyronado, -1)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg1: dmgNode('atk', dm.charged.dmg1, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    press: dmgNode('atk', dm.skill.press, 'skill'),
  },
  burst: {
    dmg1: dmgNode('atk', dm.burst.dmg1, 'burst', {
      premod: { pyro_dmg_: antiC6 },
    }),
    dmg2: dmgNode('atk', dm.burst.dmg2, 'burst', {
      premod: { pyro_dmg_: antiC6 },
    }),
    dmg3: dmgNode('atk', dm.burst.dmg3, 'burst'),
    dmgNado: dmgNode('atk', dm.burst.dmgNado, 'burst', {
      premod: { pyro_dmg_: antiC6 },
    }),
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      customDmgNode(
        prod(input.total.atk, percent(dm.constellation2.dmg)),
        'elemental',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'liyue',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC5,
      burstBoost: nodeC3,
    },
    teamBuff: {
      premod: {
        atk_: afterChili,
        pyro_dmg_: duringPyronado,
        pyro_enemyRes_: afterGuobaHit,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: 'F',
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
            multi: i === 2 ? 2 : i === 3 ? 4 : undefined,
          }),
        })),
      },
      {
        text: ct.chg('auto.fields.charged'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.dmg1, {
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.6'),
            value: dm.charged.stamina,
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
            node: infoMut(dmgFormulas.skill.press, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('constellation1', {
        value: condAfterGuobaHit,
        path: condAfterGuobaHitPath,
        name: ct.ch('afterGuobaHit'),
        teamBuff: true,
        states: {
          afterGuobaHit: {
            fields: [
              {
                node: afterGuobaHit,
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
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.dmg1, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.dmg2, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.dmg3, {
              name: ct.chg(`burst.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.dmgNado, {
              name: ct.chg(`burst.skillParams.3`),
            }),
          },
          {
            text: stg('duration'),
            value: (data) =>
              data.get(input.constellation).value >= 4
                ? `${dm.burst.duration}s + ${
                    dm.burst.duration * dm.constellation4.durationInc
                  }s = ${
                    dm.burst.duration * (1 + dm.constellation4.durationInc)
                  }`
                : dm.burst.duration,
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
      ct.headerTem('constellation4', {
        fields: [
          {
            text: st('durationInc'),
            value: dm.burst.duration * dm.constellation4.durationInc,
            unit: 's',
          },
        ],
      }),
      ct.condTem('constellation6', {
        value: condDuringPyronado,
        path: condDuringPyronadoPath,
        name: ct.ch('duringPyronado'),
        teamBuff: true,
        states: {
          duringPyronado: {
            fields: [
              {
                text: ct.ch('c6Exception'),
                canShow: (data) =>
                  data.get(input.constellation).value >= 6 &&
                  data.get(condDuringPyronado).value === 'duringPyronado',
              },
              {
                node: duringPyronado,
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
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.condTem('passive2', {
        value: condAfterChili,
        path: condAfterChiliPath,
        name: ct.ch('afterChili'),
        teamBuff: true,
        states: {
          afterChili: {
            fields: [
              {
                node: afterChili,
              },
              {
                text: stg('duration'),
                value: dm.passive2.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      ct.fieldsTem('constellation2', {
        fields: [
          {
            value: dm.constellation2.dmg,
            node: infoMut(dmgFormulas.constellation2.dmg, {
              name: ct.ch('explosionDMG'),
            }),
          },
        ],
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
