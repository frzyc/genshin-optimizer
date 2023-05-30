import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'

const key: CharacterKey = 'Cyno'
const elementKey: ElementKey = 'electro'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let s = 0,
  b = 5,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3x2
      // skillParam_gen.auto[3], // 3x2
      skillParam_gen.auto[4], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[5],
    stamina: skillParam_gen.auto[6][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[7],
    low: skillParam_gen.auto[8],
    high: skillParam_gen.auto[9],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    riteDmg: skillParam_gen.skill[s++],
    durationBonus: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    cdRite: skillParam_gen.skill[s++][0],
  },
  burst: {
    normal: {
      hitArr: [
        skillParam_gen.burst[0], // 1
        skillParam_gen.burst[1], // 2
        skillParam_gen.burst[2], // 3
        skillParam_gen.burst[3], // 4x2
        // skillParam_gen.burst[4], // 4x2
        skillParam_gen.burst[b++], // 5
      ],
    },
    charged: {
      dmg: skillParam_gen.burst[b++],
      stamina: skillParam_gen.burst[b++][0],
    },
    plunging: {
      dmg: skillParam_gen.burst[b++],
      low: skillParam_gen.burst[b++],
      high: skillParam_gen.burst[b++],
    },
    eleMas: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    skill_dmg_: skillParam_gen.passive1[p1++][0],
    boltDmg: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    burst_normal_dmgInc_: skillParam_gen.passive2[p2++][0],
    bolt_dmgInc_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    normal_atkSpd_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    electro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    maxStacks: skillParam_gen.constellation2[2],
    cd: skillParam_gen.constellation2[3],
  },
  constellation4: {
    energyRestore: skillParam_gen.constellation4[0],
    charges: skillParam_gen.constellation4[1],
  },
} as const

const [condAfterBurstPath, condAfterBurst] = cond(key, 'afterBurst')
const afterBurst_eleMas = equal(condAfterBurst, 'on', dm.burst.eleMas)

const [condA1JudicationPath, condA1Judication] = cond(key, 'a1Judication')
const a1Judication_skill_dmg_ = greaterEq(
  input.asc,
  1,
  equal(condA1Judication, 'on', dm.passive1.skill_dmg_)
)

// TODO: Check if this is total or premod
// If it is total, this fits with Shenhe, where dmgInc is allowed to inherit from total
// If it is premod, this breaks Shenhe's "precedent"
const a4_burstNormal_dmgInc = greaterEq(
  input.asc,
  4,
  prod(percent(dm.passive2.burst_normal_dmgInc_), input.total.eleMas)
)
const a4_bolt_dmgInc = greaterEq(
  input.asc,
  4,
  prod(percent(dm.passive2.bolt_dmgInc_), input.total.eleMas)
)

const c1_atkSPD_ = greaterEq(
  input.constellation,
  1,
  greaterEq(input.asc, 1, dm.constellation1.normal_atkSpd_)
)

const c2NormHitStacksArr = range(1, dm.constellation2.maxStacks)
const [condC2NormHitStacksPath, condC2NormHitStacks] = cond(
  key,
  'c2NormHitStacks'
)
const c2_electro_dmg_ = greaterEq(
  input.constellation,
  2,
  lookup(
    condC2NormHitStacks,
    Object.fromEntries(
      c2NormHitStacksArr.map((stack) => [
        stack,
        prod(percent(dm.constellation2.electro_dmg_), stack),
      ])
    ),
    naught
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    riteDmg: dmgNode('atk', dm.skill.riteDmg, 'skill'),
  },
  burst: {
    ...Object.fromEntries(
      dm.burst.normal.hitArr.map((arr, i) => [
        `normal_${i}`,
        customDmgNode(
          prod(
            subscript(input.total.burstIndex, arr, { unit: '%' }),
            input.total.atk
          ),
          'normal',
          {
            hit: { ele: constant(elementKey) },
            premod: { normal_dmgInc: a4_burstNormal_dmgInc },
          }
        ),
      ])
    ),
    charged: customDmgNode(
      prod(
        subscript(input.total.burstIndex, dm.burst.charged.dmg, { unit: '%' }),
        input.total.atk
      ),
      'charged',
      { hit: { ele: constant(elementKey) } }
    ),
    ...Object.fromEntries(
      Object.entries(dm.burst.plunging).map(([key, value]) => [
        `plunging_${key}`,
        customDmgNode(
          prod(
            subscript(input.total.burstIndex, value, { unit: '%' }),
            input.total.atk
          ),
          'plunging',
          { hit: { ele: constant(elementKey) } }
        ),
      ])
    ),
  },
  passive1: {
    boltDmg: greaterEq(
      input.asc,
      1,
      customDmgNode(prod(dm.passive1.boltDmg, input.total.atk), 'skill', {
        hit: { ele: constant(elementKey) },
        premod: { skill_dmgInc: a4_bolt_dmgInc },
      })
    ),
  },
  passive2: {
    burstNormalDmgInc: a4_burstNormal_dmgInc,
    boltDmgInc: a4_bolt_dmgInc,
  },
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
      burstBoost: burstC3,
      skillBoost: skillC5,
      eleMas: afterBurst_eleMas,
      skill_dmg_: a1Judication_skill_dmg_,
      atkSPD_: c1_atkSPD_,
      electro_dmg_: c2_electro_dmg_,
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
        fields: dm.normal.hitArr.map((_, i) => ({
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
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.5'),
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
            node: infoMut(dmgFormulas.skill.skillDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.riteDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.durationBonus,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
            fixed: 1,
          },
          {
            text: ct.chg('skill.skillParams.4'),
            value: dm.skill.cdRite,
            unit: 's',
          },
        ],
      },
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          ...dm.burst.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.burst[`normal_${i}`], {
              name: ct.chg(`burst.skillParams.${i}`),
              multi: i === 3 ? 2 : undefined,
            }),
          })),
          {
            node: infoMut(dmgFormulas.burst.charged, {
              name: ct.chg(`burst.skillParams.5`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.6'),
            value: dm.burst.charged.stamina,
          },
          ...Object.entries(dm.burst.plunging).map(([key]) => ({
            node: infoMut(dmgFormulas.burst[`plunging_${key}`], {
              name: stg(`plunging.${key}`),
            }),
          })),
          {
            text: stg('duration'),
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
      ct.condTem('burst', {
        path: condAfterBurstPath,
        value: condAfterBurst,
        name: st('afterUse.burst'),
        states: {
          on: {
            fields: [
              {
                node: afterBurst_eleMas,
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation1', {
        canShow: greaterEq(input.asc, 1, 1),
        fields: [
          {
            node: c1_atkSPD_,
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      ct.fieldsTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.boltDmg, {
              name: ct.ch('p1Dmg'),
            }),
          },
        ],
      }),
      ct.condTem('passive1', {
        path: condA1JudicationPath,
        value: condA1Judication,
        name: ct.ch('judication'),
        states: {
          on: {
            fields: [
              {
                node: a1Judication_skill_dmg_,
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
            node: infoMut(dmgFormulas.passive2.burstNormalDmgInc, {
              name: ct.ch('burstNormalDmgInc'),
            }),
          },
          {
            node: infoMut(dmgFormulas.passive2.boltDmgInc, {
              name: ct.ch('boltDmgInc'),
            }),
          },
        ],
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        path: condC2NormHitStacksPath,
        value: condC2NormHitStacks,
        name: st('hitOp.normal'),
        states: Object.fromEntries(
          c2NormHitStacksArr.map((stack) => [
            stack,
            {
              name: st('stack', { count: stack }),
              fields: [{ node: c2_electro_dmg_ }],
            },
          ])
        ),
      }),
    ]),
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
