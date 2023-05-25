import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
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

const key: CharacterKey = 'Klee'
const elementKey: ElementKey = 'pyro'
const regionKey: RegionKey = 'mondstadt'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
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
    jumptyDumptyDmg1: skillParam_gen.skill[s++],
    jumptyDumptyDmg2: skillParam_gen.skill[s++],
    jumptyDumptyDmg3: skillParam_gen.skill[s++],
    mineDmg: skillParam_gen.skill[s++],
    mineDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    unknown: skillParam_gen.burst[b++], // what is this??
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    charged_dmg_: 0.5,
  },
  constellation1: {
    dmg_: 1.2,
  },
  constellation2: {
    enemyDefRed_: 0.23,
  },
  constellation4: {
    dmg: 5.55,
  },
  constellation6: {
    pyro_dmg_: 0.1,
  },
} as const

const [condA1Path, condA1] = cond(key, 'PoundingSurprise')
const charged_dmg_ = equal(
  'on',
  condA1,
  greaterEq(input.asc, 1, percent(dm.passive1.charged_dmg_))
)

const [condC2Path, condC2] = cond(key, 'ExplosiveFrags')
const enemyDefRed_ = equal(
  'on',
  condC2,
  greaterEq(input.constellation, 2, percent(dm.constellation2.enemyDefRed_))
)

const [condC6Path, condC6] = cond(key, 'BlazingDelight')
const pyro_dmg_ = equal(
  'on',
  condC6,
  greaterEq(input.constellation, 6, percent(dm.constellation6.pyro_dmg_))
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
    jumptyDumptyDmg: dmgNode('atk', dm.skill.jumptyDumptyDmg1, 'skill'),
    mineDmg: dmgNode('atk', dm.skill.mineDmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  constellation1: {
    chainedReactionsDmg: greaterEq(
      input.constellation,
      1,
      prod(
        percent(dm.constellation1.dmg_),
        dmgNode('atk', dm.burst.dmg, 'burst')
      )
    ),
  },
  constellation4: {
    sparklyExplosionDmg: greaterEq(
      input.constellation,
      4,
      customDmgNode(
        prod(percent(dm.constellation4.dmg), input.total.atk),
        'elemental',
        { hit: { ele: constant('pyro') } }
      )
    ),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  regionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC3,
      burstBoost: nodeC5,
      charged_dmg_,
    },
    teamBuff: {
      premod: {
        pyro_dmg_,
        enemyDefRed_,
      },
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
            node: infoMut(dmgFormulas.skill.jumptyDumptyDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.mineDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: `${dm.skill.mineDuration}`,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: `${dm.skill.cd}`,
            unit: 's',
          },
        ],
      },
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
            text: ct.chg('burst.skillParams.1'),
            value: `${dm.burst.duration}`,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.2'),
            value: `${dm.burst.cd}`,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: `${dm.burst.enerCost}`,
          },
        ],
      },
    ]),

    passive1: ct.talentTem('passive1', [
      ct.condTem('passive1', {
        value: condA1,
        path: condA1Path,
        name: ct.ch('a1CondName'),
        states: {
          on: {
            fields: [
              {
                node: charged_dmg_,
              },
              {
                text: ct.ch('a1CondName2'),
              },
            ],
          },
        },
      }),
    ]),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.fieldsTem('constellation1', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation1.chainedReactionsDmg, {
              name: st(`dmg`),
            }),
          },
        ],
      }),
    ]),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        value: condC2,
        path: condC2Path,
        teamBuff: true,
        name: ct.ch('c2CondName'),
        states: {
          on: {
            fields: [
              {
                node: enemyDefRed_,
              },
              {
                text: stg('duration'),
                value: 10,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.fieldsTem('constellation4', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation4.sparklyExplosionDmg, {
              name: st(`dmg`),
            }),
          },
        ],
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.condTem('constellation6', {
        value: condC6,
        path: condC6Path,
        teamBuff: true,
        name: ct.ch('c6CondName'),
        states: {
          on: {
            fields: [
              {
                node: pyro_dmg_,
              },
              {
                text: stg('duration'),
                value: 25,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
  },
}

export default new CharacterSheet(sheet, data)
