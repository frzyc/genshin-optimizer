import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import {
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
  splitScaleDmgNode,
} from '../dataUtil'
import type { ICharacterSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Dehya'
const elementKey: ElementKey = 'pyro'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponTypeKey)

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
    spin: skillParam_gen.auto[a++],
    final: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    indomitableDmg: skillParam_gen.skill[s++],
    rangingDmg: skillParam_gen.skill[s++],
    fieldDmgAtk: skillParam_gen.skill[s++],
    fieldDmgHp: skillParam_gen.skill[s++],
    mitigation: skillParam_gen.skill[s++],
    redmaneMax: skillParam_gen.skill[s++][0],
    fieldDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    fistDmgAtk: skillParam_gen.burst[b++],
    fistDmgHp: skillParam_gen.burst[b++],
    driveDmgAtk: skillParam_gen.burst[b++],
    driveDmgHp: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    hpThreshold: skillParam_gen.passive2[0][0],
    initialHeal: skillParam_gen.passive2[1][0],
    dotHeal: skillParam_gen.passive2[2][0],
    dotInterval: skillParam_gen.passive2[3][0],
    duration: skillParam_gen.passive2[4][0],
    cd: skillParam_gen.passive2[5][0],
  },
  c1: {
    hp_: skillParam_gen.constellation1[0],
    skill_dmgInc: skillParam_gen.constellation1[1],
    burst_dmgInc: skillParam_gen.constellation1[2],
  },
  c2: {
    fieldDurationIncrease: skillParam_gen.constellation2[0],
    field_dmg_: skillParam_gen.constellation2[1],
  },
  c4: {
    energyRestore: skillParam_gen.constellation4[0],
    heal: skillParam_gen.constellation4[1],
    cd: skillParam_gen.constellation4[2],
  },
  c6: {
    burst_critRate_: skillParam_gen.constellation6[0],
    burst_critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
    maxDuration: skillParam_gen.constellation6[3],
    maxBurst_critDMG_: skillParam_gen.constellation6[4],
  },
} as const

const c1_hp_ = greaterEq(input.constellation, 1, dm.c1.hp_)
const c1_skill_dmgInc = greaterEq(
  input.constellation,
  1,
  prod(percent(dm.c1.skill_dmgInc), input.total.hp)
)
const c1_burst_dmgInc = greaterEq(
  input.constellation,
  1,
  prod(percent(dm.c1.burst_dmgInc), input.total.hp)
)

const [condC2InFieldPath, condC2InField] = cond(key, 'c2InField')
const c2InField_field_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(condC2InField, 'on', dm.c2.field_dmg_)
)

const c6_burst_critRate_ = greaterEq(
  input.constellation,
  6,
  dm.c6.burst_critRate_
)
const c6CritStacksArr = range(1, 4)
const [condC6CritStacksPath, condC6CritStacks] = cond(key, 'c6CritStacks')
const c6CritStacks_burst_critDMG_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condC6CritStacks,
    objectKeyMap(c6CritStacksArr, (stack) =>
      prod(stack, percent(dm.c6.burst_critDMG_))
    ),
    naught
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    spin: dmgNode('atk', dm.charged.spin, 'charged'),
    final: dmgNode('atk', dm.charged.final, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    indomitableDmg: dmgNode('atk', dm.skill.indomitableDmg, 'skill'),
    rangingDmg: dmgNode('atk', dm.skill.rangingDmg, 'skill'),
    fieldDmg: splitScaleDmgNode(
      ['atk', 'hp'],
      [dm.skill.fieldDmgAtk, dm.skill.fieldDmgHp],
      'skill',
      { premod: { skill_dmg_: c2InField_field_dmg_ } }
    ),
    redmaneMax: prod(percent(dm.skill.redmaneMax), input.total.hp),
  },
  burst: {
    fistDmg: splitScaleDmgNode(
      ['atk', 'hp'],
      [dm.burst.fistDmgAtk, dm.burst.fistDmgHp],
      'burst'
    ),
    driveDmg: splitScaleDmgNode(
      ['atk', 'hp'],
      [dm.burst.driveDmgAtk, dm.burst.driveDmgHp],
      'burst'
    ),
  },
  passive2: {
    initialHeal: greaterEq(
      input.asc,
      4,
      customHealNode(prod(percent(dm.passive2.initialHeal), input.total.hp))
    ),
    dotHeal: greaterEq(
      input.asc,
      4,
      customHealNode(prod(percent(dm.passive2.dotHeal), input.total.hp))
    ),
  },
  constellation1: {
    c1_skill_dmgInc,
    c1_burst_dmgInc,
  },
  constellation4: {
    heal: greaterEq(
      input.constellation,
      4,
      customHealNode(prod(percent(dm.c4.heal), input.total.hp))
    ),
  },
} as const

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
      hp_: c1_hp_,
      skill_dmgInc: c1_skill_dmgInc,
      burst_dmgInc: c1_burst_dmgInc,
      burst_critRate_: c6_burst_critRate_,
      burst_critDMG_: c6CritStacks_burst_critDMG_,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
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
          }),
        })),
      },
      {
        text: ct.chg('auto.fields.charged'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.spin, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.final, {
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.6'),
            value: `${dm.charged.stamina}/s`,
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
            node: infoMut(dmgFormulas.skill.indomitableDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.rangingDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.fieldDmg, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            node: subscript(input.total.skillIndex, dm.skill.mitigation, {
              name: ct.chg('skill.skillParams.3'),
              unit: '%',
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.redmaneMax, {
              name: ct.chg('skill.skillParams.4'),
            }),
          },
          {
            text: ct.chg('skill.skillParams.5'),
            value: dm.skill.fieldDuration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.headerTem('constellation1', {
        fields: [
          {
            node: c1_skill_dmgInc,
          },
        ],
      }),
      ct.condTem('constellation2', {
        path: condC2InFieldPath,
        value: condC2InField,
        name: ct.ch('inFieldAndTakeDmg'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(c2InField_field_dmg_, {
                  name: ct.ch('field_dmg_'),
                  unit: '%',
                }),
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
            node: infoMut(dmgFormulas.burst.fistDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.driveDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
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
      ct.headerTem('constellation1', {
        fields: [
          {
            node: c1_burst_dmgInc,
          },
        ],
      }),
      ct.headerTem('constellation4', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation4.heal, {
              name: stg('healing'),
            }),
          },
          {
            text: stg('cd'),
            value: dm.c4.cd,
            unit: 's',
            fixed: 1,
          },
        ],
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            node: c6_burst_critRate_,
          },
        ],
      }),
      ct.condTem('constellation6', {
        path: condC6CritStacksPath,
        value: condC6CritStacks,
        name: ct.ch('critHitDuringBurst'),
        states: objectKeyMap(c6CritStacksArr, (stack) => ({
          name: st('hits', { count: stack }),
          fields: [
            {
              node: c6CritStacks_burst_critDMG_,
            },
          ],
        })),
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive2.initialHeal, {
              name: ct.ch('initialHeal'),
            }),
          },
          {
            node: infoMut(dmgFormulas.passive2.dotHeal, {
              name: ct.ch('dotHeal'),
              multi: 5,
            }),
          },
        ],
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.fieldsTem('constellation1', {
        fields: [{ node: c1_hp_ }],
      }),
    ]),
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
