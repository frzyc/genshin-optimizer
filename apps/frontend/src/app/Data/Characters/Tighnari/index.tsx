import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  min,
  naught,
  percent,
  prod,
} from '../../../Formula/utils'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'

const key: CharacterKey = 'Tighnari'
const elementKey: ElementKey = 'dendro'
const region: RegionKey = 'sumeru'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    wreathArrow: skillParam_gen.auto[a++],
    clusterArrow: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    fieldDuration: skillParam_gen.skill[s++][0],
    penetratorDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    primaryDmg: skillParam_gen.burst[b++],
    secondaryDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    charged_burst_dmg_: skillParam_gen.passive2[p2++][0],
    maxDmg_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    charged_critRate_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    dendro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    unknown: skillParam_gen.constellation6[0],
    dmg: skillParam_gen.constellation6[1],
    chargeTimeRed: 0.9,
  },
} as const

const [condA1AfterWreathPath, condA1AfterWreath] = cond(key, 'p1AfterWreath')
const a1AfterWreath_eleMas = greaterEq(
  input.asc,
  1,
  equal(condA1AfterWreath, 'on', dm.passive1.eleMas)
)

const a4_charged_dmg_ = greaterEq(
  input.asc,
  4,
  min(
    prod(
      percent(dm.passive2.charged_burst_dmg_, { fixed: 2 }),
      input.total.eleMas
    ),
    percent(dm.passive2.maxDmg_)
  )
)
const a4_burst_dmg_ = { ...a4_charged_dmg_ }
const chargedShaftAddl: Data = {
  hit: { ele: constant(elementKey) },
}

const c1_charged_critRate_ = greaterEq(
  input.constellation,
  1,
  dm.constellation1.charged_critRate_
)

const [condC2EnemyFieldPath, condC2EnemyField] = cond(key, 'c2EnemyField')
const c2EnemyField_dendro_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(condC2EnemyField, 'on', dm.constellation2.dendro_dmg_)
)

const [condC4Path, condC4] = cond(key, 'c4')
const c4_eleMas = greaterEq(
  input.constellation,
  4,
  lookup(
    condC4,
    {
      after: constant(dm.constellation4.eleMas),
      react: constant(dm.constellation4.eleMas * 2),
    },
    naught
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    aimedCharged: dmgNode(
      'atk',
      dm.charged.aimedCharged,
      'charged',
      chargedShaftAddl
    ),
    wreath: dmgNode('atk', dm.charged.wreathArrow, 'charged', chargedShaftAddl),
    cluster: dmgNode(
      'atk',
      dm.charged.clusterArrow,
      'charged',
      chargedShaftAddl
    ),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    primaryDmg: dmgNode('atk', dm.burst.primaryDmg, 'burst'),
    secondaryDmg: dmgNode('atk', dm.burst.secondaryDmg, 'burst'),
  },
  passive2: {
    charged_dmg_: a4_charged_dmg_,
    burst_dmg_: a4_burst_dmg_,
  },
  constellation6: {
    cluster: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'charged',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
}
const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  region,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
      eleMas: a1AfterWreath_eleMas,
      charged_dmg_: a4_charged_dmg_,
      burst_dmg_: a4_burst_dmg_,
      charged_critRate_: c1_charged_critRate_,
      dendro_dmg_: c2EnemyField_dendro_dmg_,
    },
    teamBuff: {
      premod: {
        eleMas: c4_eleMas,
      },
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
            node: infoMut(dmgFormulas.charged.aimed, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.aimedCharged, {
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.wreath, {
              name: ct.chg(`auto.skillParams.6`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.cluster, {
              name: ct.chg(`auto.skillParams.7`),
            }),
          },
        ],
      },
      ct.condTem('passive1', {
        path: condA1AfterWreathPath,
        value: condA1AfterWreath,
        name: ct.ch('p1Cond'),
        states: {
          on: {
            fields: [
              {
                node: a1AfterWreath_eleMas,
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation1', {
        fields: [
          {
            node: c1_charged_critRate_,
          },
        ],
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            text: ct.ch('c6WreathRed'),
            value: dm.constellation6.chargeTimeRed,
            unit: 's',
            fixed: 1,
          },
          {
            node: infoMut(dmgFormulas.constellation6.cluster, {
              name: ct.ch('c6DmgKey'),
            }),
          },
        ],
      }),
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
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: dm.skill.fieldDuration,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.penetratorDuration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('constellation2', {
        path: condC2EnemyFieldPath,
        value: condC2EnemyField,
        name: st('opponentsField'),
        states: {
          on: {
            fields: [
              {
                node: c2EnemyField_dendro_dmg_,
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
            node: infoMut(dmgFormulas.burst.primaryDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.secondaryDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            text: stg('cd'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: stg('energyCost'),
            value: dm.burst.energyCost,
          },
        ],
      },
      ct.condTem('constellation4', {
        path: condC4Path,
        value: condC4,
        teamBuff: true,
        name: '',
        states: {
          after: {
            name: st('afterUse.burst'),
            fields: [
              {
                node: c4_eleMas,
              },
              {
                text: stg('duration'),
                value: dm.constellation4.duration,
                unit: 's',
              },
            ],
          },
          react: {
            name: ct.ch('c4ReactCond'),
            fields: [
              {
                node: c4_eleMas,
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
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            node: a4_charged_dmg_,
          },
          {
            node: a4_burst_dmg_,
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
