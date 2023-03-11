import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input, tally } from '../../../Formula'
import {
  equal,
  greaterEq,
  infoMut,
  prod,
  subscript,
  sum,
  unequal,
} from '../../../Formula/utils'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import { cond, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import {
  dataObjForCharacterSheet,
  dmgNode,
  shieldElement,
  shieldNodeTalent,
} from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'YunJin'
const elementKey: ElementKey = 'geo'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 5
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
    shield_: skillParam_gen.skill[s++],
    shield: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    dmg1: skillParam_gen.skill[s++],
    dmg2: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    dmgInc: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    triggerNum: skillParam_gen.burst[b++][0],
  },
  passive2: {
    dmgInc: skillParam_gen.passive2.map((a) => a[0]),
  },
  constellation2: {
    normalInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    def_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    atkSpd: skillParam_gen.constellation6[0],
  },
} as const

const nodeA4 = greaterEq(
  input.asc,
  4,
  subscript(
    sum(...allElementKeys.map((ele) => greaterEq(tally[ele], 1, 1))),
    [0, ...dm.passive2.dmgInc],
    { unit: '%' }
  )
)

const [condBurstPath, condBurst] = cond(key, 'skill')
const nodeSkill = equal(
  'on',
  condBurst,
  sum(
    prod(
      input.premod.def,
      sum(
        subscript(input.total.burstIndex, dm.burst.dmgInc, { unit: '%' }),
        nodeA4
      )
    )
  )
)

const nodeC2 = greaterEq(
  input.constellation,
  2,
  equal('on', condBurst, dm.constellation2.normalInc)
)

const [condC4Path, condC4] = cond(key, 'c4')
const nodeC4 = greaterEq(
  input.constellation,
  4,
  equal('on', condC4, dm.constellation4.def_)
)

const nodeC6 = greaterEq(
  input.constellation,
  6,
  equal('on', condBurst, dm.constellation6.atkSpd)
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
    dmg: dmgNode('def', dm.skill.dmg, 'skill'),
    dmg1: dmgNode('def', dm.skill.dmg1, 'skill'),
    dmg2: dmgNode('def', dm.skill.dmg2, 'skill'),
    shield: shieldElement(
      'geo',
      shieldNodeTalent('hp', dm.skill.shield_, dm.skill.shield, 'skill')
    ),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    dmgInc: nodeSkill,
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
      def_: nodeC4,
    },
    teamBuff: {
      premod: {
        atkSPD_: nodeC6,
        normal_dmgInc: nodeSkill,
        normal_dmg_: nodeC2,
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
            name: ct.chg(
              `auto.skillParams.${i + (i > 2 ? -1 : 0) + (i > 4 ? -1 : 0)}`
            ),
            textSuffix:
              i === 2 || i === 4 ? '(1)' : i === 3 || i === 5 ? '(2)' : '',
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
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.dmg1, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.dmg2, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.shield, {
              name: ct.chg(`skill.skillParams.3`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.4'),
            value: (data) =>
              data.get(input.constellation).value >= 1
                ? `${dm.skill.cd} - 18% = ${(dm.skill.cd * (1 - 0.18)).toFixed(
                    2
                  )}`
                : `${dm.skill.cd}`,
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
            text: ct.chg('burst.skillParams.4'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.5'),
            value: dm.burst.enerCost,
          },
        ],
      },
      ct.condTem('burst', {
        teamBuff: true,
        value: condBurst,
        path: condBurstPath,
        name: ct.ch('burst'),
        states: {
          on: {
            fields: [
              {
                node: nodeSkill,
              },
              {
                node: nodeC2,
              },
              {
                node: nodeC6,
              },
              {
                text: ct.chg('burst.skillParams.2'),
                value: dm.burst.duration,
                unit: 's',
              },
              {
                text: ct.chg('burst.skillParams.3'),
                value: dm.burst.triggerNum,
              },
            ],
          },
        },
      }),
      ct.condTem('constellation4', {
        // C4 conditional in teambuff panel if burst is enabled
        teamBuff: true,
        canShow: unequal(input.activeCharKey, key, equal(condBurst, 'on', 1)),
        value: condC4,
        path: condC4Path,
        name: ct.ch('c4'),
        states: {
          on: {
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
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          { node: infoMut(nodeA4, { name: ct.ch('a4Inc_'), unit: '%' }) },
        ],
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      { fields: [{ node: nodeC2 }] },
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.condTem('constellation4', {
        value: condC4,
        path: condC4Path,
        name: ct.ch('c4'),
        states: {
          on: {
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
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
