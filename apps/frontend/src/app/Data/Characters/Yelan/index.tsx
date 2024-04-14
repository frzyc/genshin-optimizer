import { range } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input, tally, target } from '../../../Formula'
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
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Yelan'
const elementKey: ElementKey = 'hydro'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x3
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    barb: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    resetChance: skillParam_gen.skill[s++][0],
    maxDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    throwDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hp_Arr: [0, ...skillParam_gen.passive1.map(([a]) => a)],
  },
  passive2: {
    baseDmg_: skillParam_gen.passive2[0][0],
    stackDmg_: skillParam_gen.passive2[1][0],
    maxDmg_: skillParam_gen.passive2[2][0],
    maxStacks: 14,
  },
  constellation1: {
    addlCharge: skillParam_gen.constellation1[0],
  },
  constellation2: {
    arrowDmg_: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
  },
  constellation4: {
    bonusHp_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    maxHp_: skillParam_gen.constellation4[2],
    maxStacks: 4,
  },
  constellation6: {
    charges: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    dmg_: skillParam_gen.constellation6[2],
  },
}

const a1_hp_ = greaterEq(input.asc, 1, subscript(tally.ele, dm.passive1.hp_Arr))

const [condA4StacksPath, condA4Stacks] = cond(key, 'a4Stacks')
const a4Stacks = range(0, dm.passive2.maxStacks)
const a4Dmg_Disp = greaterEq(
  input.asc,
  4,
  lookup(
    condA4Stacks,
    Object.fromEntries(
      a4Stacks.map((stacks) => [
        stacks,
        sum(
          percent(dm.passive2.baseDmg_),
          prod(stacks, percent(dm.passive2.stackDmg_))
        ),
      ])
    ),
    naught
  )
)
const a4Dmg = equal(target.charKey, input.activeCharKey, a4Dmg_Disp)

const [condC4StacksPath, condC4Stacks] = cond(key, 'c4Stacks')
const c4Stacks = range(1, dm.constellation4.maxStacks)
const c4Hp_ = greaterEq(
  input.constellation,
  4,
  lookup(
    condC4Stacks,
    Object.fromEntries(
      c4Stacks.map((stacks) => [
        stacks,
        prod(stacks, percent(dm.constellation4.bonusHp_)),
      ])
    ),
    naught
  )
)

const hitEle = { hit: { ele: constant(elementKey) } }
const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    aimedCharged: dmgNode('atk', dm.charged.aimedCharged, 'charged', hitEle),
    barb: dmgNode('hp', dm.charged.barb, 'charged', hitEle),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    dmg: dmgNode('hp', dm.skill.dmg, 'skill'),
  },
  burst: {
    pressDmg: dmgNode('hp', dm.burst.pressDmg, 'burst'),
    throwDmg: dmgNode('hp', dm.burst.throwDmg, 'burst'),
  },
  constellation2: {
    arrowDmg: greaterEq(
      input.constellation,
      2,
      customDmgNode(
        prod(percent(dm.constellation2.arrowDmg_), input.total.hp),
        'burst',
        hitEle
      )
    ),
  },
  constellation6: {
    barbDmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(
          subscript(input.total.autoIndex, dm.charged.barb, { unit: '%' }),
          percent(dm.constellation6.dmg_),
          input.total.hp
        ),
        'charged',
        hitEle
      )
    ),
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'liyue',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
      hp_: a1_hp_,
    },
    teamBuff: {
      premod: {
        all_dmg_: a4Dmg,
        hp_: c4Hp_,
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
            multi: i === 3 ? 2 : undefined,
          }),
        })),
      },
      ct.headerTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.barbDmg, {
              name: ct.ch('c6.dmg'),
            }),
          },
          {
            text: st('charges'),
            value: dm.constellation6.charges,
          },
          {
            text: stg('duration'),
            value: dm.constellation6.duration,
            unit: 's',
          },
        ],
      }),
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
        ],
      },
      {
        text: ct.chg(`auto.fields.breakthrough`),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.barb, {
              name: ct.chg(`auto.skillParams.6`),
            }),
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
            value: dm.skill.maxDuration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
          {
            canShow: (data) => data.get(input.constellation).value >= 1,
            text: st('charges'),
            value: 2,
          },
        ],
      },
      ct.condTem('constellation4', {
        path: condC4StacksPath,
        value: condC4Stacks,
        teamBuff: true,
        name: ct.ch('c4.condName'),
        states: Object.fromEntries(
          c4Stacks.map((stacks) => [
            stacks,
            {
              name: st('stack', { count: stacks }),
              fields: [
                {
                  node: c4Hp_,
                },
                {
                  text: stg('duration'),
                  value: dm.constellation4.duration,
                  unit: 's',
                },
              ],
            },
          ])
        ),
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.pressDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.throwDmg, {
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
      ct.condTem('passive2', {
        path: condA4StacksPath,
        value: condA4Stacks,
        teamBuff: true,
        name: st('afterUse.burst'),
        states: Object.fromEntries(
          a4Stacks.map((stack) => [
            stack,
            {
              name: st('seconds', { count: stack }),
              fields: [
                {
                  node: infoMut(a4Dmg_Disp, KeyMap.info('all_dmg_')),
                },
              ],
            },
          ])
        ),
      }),
      ct.headerTem('constellation2', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation2.arrowDmg, {
              name: ct.ch('c2.dmg'),
            }),
          },
          {
            text: stg('cd'),
            value: dm.constellation2.cd,
            unit: 's',
            fixed: 1,
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      ct.fieldsTem('passive1', {
        fields: [
          {
            node: a1_hp_,
          },
        ],
      }),
    ]),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.fieldsTem('constellation1', {
        fields: [
          {
            text: st('addlCharges'),
            value: 1,
          },
        ],
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
