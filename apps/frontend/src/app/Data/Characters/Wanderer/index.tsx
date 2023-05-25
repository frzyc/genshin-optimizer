import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import {
  compareEq,
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  one,
  percent,
  prod,
  subscript,
  sum,
} from '../../../Formula/utils'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'

const key: CharacterKey = 'Wanderer'
const elementKey: ElementKey = 'anemo'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
    ],
  },
  throwaway: a++,
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
    dmg: skillParam_gen.skill[s++],
    normal_mult: skillParam_gen.skill[s++],
    charged_mult: skillParam_gen.skill[s++],
    skyDwellerPoints: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    pyro_atk_: skillParam_gen.passive1[p1++][0],
    hydro_point: skillParam_gen.passive1[p1++][0],
    cryo_critRate_: skillParam_gen.passive1[p1++][0],
    electro_energy: skillParam_gen.passive1[p1++][0],
    electro_cd: 0.2,
  },
  passive2: {
    chance_: skillParam_gen.passive2[p2++][0],
    chanceInc_: skillParam_gen.passive2[p2++][0],
    dmg: skillParam_gen.passive2[p2++][0],
    arrowAmt: 4,
    cd: 0.1,
  },
  constellation1: {
    atkSPD_: skillParam_gen.constellation1[0],
    dmg: skillParam_gen.constellation1[1],
  },
  constellation2: {
    burst_dmg_perPoint: skillParam_gen.constellation2[0],
    max_burst_dmg_: skillParam_gen.constellation2[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    pointRestore: skillParam_gen.constellation6[1],
    threshold: skillParam_gen.constellation6[2],
    cd: 0.2,
    maxRestoreTimes: 5,
  },
} as const

const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const afterSkill_normal_mult_ = compareEq(
  condAfterSkill,
  'on',
  subscript(input.total.skillIndex, datamine.skill.normal_mult),
  one,
  { name: st('dmgMult.normal'), unit: '%' }
)
const afterSkill_charged_mult_ = compareEq(
  condAfterSkill,
  'on',
  subscript(input.total.skillIndex, datamine.skill.charged_mult),
  one,
  { name: st('dmgMult.charged'), unit: '%' }
)

const [condSkillPyroContactPath, condSkillPyroContact] = cond(
  key,
  'skillPyroContact'
)
const skillPyro_atk_ = greaterEq(
  input.asc,
  1,
  equal(
    condAfterSkill,
    'on',
    equal(condSkillPyroContact, 'pyro', datamine.passive1.pyro_atk_)
  )
)
const [condSkillCryoContactPath, condSkillCryoContact] = cond(
  key,
  'skillCryoContact'
)
const skillCryo_critRate_ = greaterEq(
  input.asc,
  1,
  equal(
    condAfterSkill,
    'on',
    equal(condSkillCryoContact, 'cryo', datamine.passive1.cryo_critRate_)
  )
)

const c1AfterSkill_atkSPD_ = greaterEq(
  input.constellation,
  1,
  equal(condAfterSkill, 'on', datamine.constellation1.atkSPD_)
)
const c1BonusScaling_ = greaterEq(
  input.constellation,
  1,
  equal(condAfterSkill, 'on', datamine.constellation1.dmg, {
    name: ct.ch('c1BonusKey'),
    unit: '%',
  })
)

const [condC2PointsPath, condC2Points] = cond(key, 'c2Points')
const c2PointsArr = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
const c2AfterSkill_burst_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(
    condAfterSkill,
    'on',
    lookup(
      condC2Points,
      Object.fromEntries(
        c2PointsArr.map((points) => [
          points,
          prod(points, datamine.constellation2.burst_dmg_perPoint),
        ])
      ),
      naught
    )
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    datamine.normal.hitArr.map((arr, i) => [
      i,
      dmgNode('atk', arr, 'normal', undefined, afterSkill_normal_mult_),
    ])
  ),
  charged: {
    dmg: dmgNode(
      'atk',
      datamine.charged.dmg,
      'charged',
      undefined,
      afterSkill_charged_mult_
    ),
  },
  plunging: Object.fromEntries(
    Object.entries(datamine.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', datamine.skill.dmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', datamine.burst.dmg, 'burst'),
  },
  passive2: {
    dmg: greaterEq(
      input.asc,
      4,
      customDmgNode(
        prod(
          sum(percent(datamine.passive2.dmg), c1BonusScaling_),
          input.total.atk
        ),
        'elemental',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
  constellation6: Object.fromEntries(
    datamine.normal.hitArr.map((arr, i) => [
      i,
      greaterEq(
        input.constellation,
        6,
        equal(
          condAfterSkill,
          'on',
          customDmgNode(
            prod(
              subscript(input.total.autoIndex, arr, { unit: '%' }),
              constant(datamine.constellation6.dmg, {
                name: ct.ch('c6Key'),
                unit: '%',
              }),
              input.total.atk,
              afterSkill_normal_mult_
            ),
            'normal',
            {
              hit: {
                ele: constant(elementKey),
              },
            }
          )
        )
      ),
    ])
  ),
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'sumeru',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
      atk_: skillPyro_atk_,
      critRate_: skillCryo_critRate_,
      atkSPD_: c1AfterSkill_atkSPD_,
      burst_dmg_: c2AfterSkill_burst_dmg_,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.rarity,
  elementKey,
  weaponTypeKey: data_gen.weaponType,
  gender: 'M',
  constellationName: ct.chg('constellationName'),
  title: ct.chg('title'),
  talent: {
    auto: ct.talentTem('auto', [
      {
        text: ct.chg('auto.fields.normal'),
      },
      {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], {
            name: ct.chg(`auto.skillParams.${i}`),
            multi: i === 2 ? 2 : undefined,
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
            value: datamine.charged.stamina,
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
      ct.headerTem('constellation6', {
        canShow: equal(condAfterSkill, 'on', 1),
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.constellation6[i], {
            name: ct.chg(`auto.skillParams.${i}`),
            multi: i === 2 ? 2 : undefined,
          }),
        })),
      }),
    ]),

    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg('skill.skillParams.0'),
            }),
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: datamine.skill.skyDwellerPoints,
          },
          {
            text: stg('cd'),
            value: datamine.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('skill', {
        path: condAfterSkillPath,
        value: condAfterSkill,
        name: ct.ch('windfavoredState'),
        states: {
          on: {
            fields: [
              {
                node: afterSkill_normal_mult_,
              },
              {
                node: afterSkill_charged_mult_,
              },
            ],
          },
        },
      }),
      ct.condTem('passive1', {
        canShow: equal(condAfterSkill, 'on', 1),
        states: {
          pyro: {
            path: condSkillPyroContactPath,
            value: condSkillPyroContact,
            name: ct.ch('p1.pyroCondName'),
            fields: [
              {
                node: skillPyro_atk_,
              },
            ],
          },
          cryo: {
            path: condSkillCryoContactPath,
            value: condSkillCryoContact,
            name: ct.ch('p1.cryoCondName'),
            fields: [
              {
                node: skillCryo_critRate_,
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation1', {
        canShow: equal(condAfterSkill, 'on', 1),
        fields: [
          {
            node: c1AfterSkill_atkSPD_,
          },
        ],
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.dmg, {
              name: ct.chg('burst.skillParams.0'),
              multi: 5,
            }),
          },
          {
            text: stg('cd'),
            value: datamine.burst.cd,
            unit: 's',
          },
          {
            text: stg('energyCost'),
            value: datamine.burst.enerCost,
          },
        ],
      },
      ct.condTem('constellation2', {
        path: condC2PointsPath,
        value: condC2Points,
        canShow: equal(condAfterSkill, 'on', 1),
        name: ct.ch('c2CondName'),
        states: Object.fromEntries(
          c2PointsArr.map((points) => [
            points,
            {
              name: points.toString(),
              fields: [
                {
                  node: c2AfterSkill_burst_dmg_,
                },
              ],
            },
          ])
        ),
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive2.dmg, { name: ct.ch('p2Dmg') }),
          },
        ],
      }),
      ct.headerTem('constellation1', {
        canShow: greaterEq(input.asc, 4, 1),
        fields: [
          {
            node: c1BonusScaling_,
          },
        ],
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)
