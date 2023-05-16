import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, percent } from '../../../Formula/utils'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  shieldElement,
  shieldNode,
} from '../dataUtil'

const key: CharacterKey = 'Kaeya'
const elementKey: ElementKey = 'cryo'
const region: RegionKey = 'mondstadt'
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
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    healAtk_: 0.15,
  },
  constellation1: {
    critRate_: 0.15,
  },
  constellation4: {
    shieldHp_: 0.3,
    duration: 20,
    cooldown: 60,
  },
} as const

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg1: dmgNode('atk', dm.charged.dmg1, 'charged'),
    dmg2: dmgNode('atk', dm.charged.dmg2, 'charged'),
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
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  passive1: {
    heal: healNode('atk', percent(dm.passive2.healAtk_), 0),
  },
  constellation4: {
    shield: greaterEq(
      input.constellation,
      4,
      shieldNode('hp', percent(dm.constellation4.shieldHp_), 0)
    ),
    cryoShield: greaterEq(
      input.constellation,
      4,
      shieldElement(
        'cryo',
        shieldNode('hp', percent(dm.constellation4.shieldHp_), 0)
      )
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

//Conditional C1: Oppo affected by Cryo
const [condC1Path, condC1Cryo] = cond(key, 'CryoC1')
const nodeC1NormalCritRate = equal(
  condC1Cryo,
  'on',
  greaterEq(input.constellation, 1, dm.constellation1.critRate_)
)
const nodeC1ChargeCritRate = equal(
  condC1Cryo,
  'on',
  greaterEq(input.constellation, 1, dm.constellation1.critRate_)
)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  region,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC3,
      burstBoost: nodeC5,
      normal_critRate_: nodeC1NormalCritRate,
      charged_critRate_: nodeC1ChargeCritRate,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
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
            node: infoMut(dmgFormulas.charged.dmg1, {
              name: ct.chg(`auto.skillParams.5`),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.dmg2, {
              name: ct.chg(`auto.skillParams.5`),
              textSuffix: '(2)',
            }),
          },
          {
            text: ct.chg('auto.skillParams.7'),
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
            node: infoMut(dmgFormulas.skill.dmg, {
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
            text: ct.chg('burst.skillParams.2'),
            value: dm.burst.duration,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.1'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.burst.enerCost,
          },
          {
            canShow: (data) => data.get(input.constellation).value >= 2,
            text: ct.ch('c2burstDuration'),
          },
        ],
      },
    ]),

    passive1: ct.talentTem('passive1', [
      ct.headerTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.heal, { name: ct.ch('p1heal') }),
          },
        ],
      }),
    ]),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.condTem('constellation1', {
        value: condC1Cryo,
        path: condC1Path,
        name: st('enemyAffected.cryo'),
        states: {
          on: {
            fields: [
              {
                node: nodeC1NormalCritRate,
              },
              {
                node: nodeC1ChargeCritRate,
              },
            ],
          },
        },
      }),
    ]),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.fieldsTem('constellation4', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation4.shield, {
              name: st(`dmgAbsorption.none`),
            }),
          },
          {
            node: infoMut(dmgFormulas.constellation4.cryoShield, {
              name: st(`dmgAbsorption.cryo`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.2'),
            value: dm.constellation4.duration,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.1'),
            value: dm.constellation4.cooldown,
            unit: 's',
          },
        ],
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)
