import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input } from '../../../Formula'
import {
  greaterEq,
  infoMut,
  lookup,
  naught,
  unequal,
  percent,
  prod,
  threshold,
  one,
} from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
} from '../dataUtil'

const key: CharacterKey = 'Neuvillette'
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
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    judgmentDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    hpRestore: skillParam_gen.auto[a++][0],
    hpCost: skillParam_gen.auto[a++][0],
    hpCostInterval: skillParam_gen.auto[a++][0],
    hpThresh: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    thornDmg: skillParam_gen.skill[s++],
    thornInterval: skillParam_gen.skill[s++][0],
    dropletDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    waterfallDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg_: [
      0,
      skillParam_gen.passive1[0][0],
      skillParam_gen.passive1[1][0],
      skillParam_gen.passive1[2][0],
    ],
    duration: skillParam_gen.passive1[3][0],
  },
  passive2: {
    hpThresh: skillParam_gen.passive2[0][0],
    idk: skillParam_gen.passive2[1][0],
    hydro_dmg_: skillParam_gen.passive2[2][0] / 100,
    maxHydro_dmg_: 0.3,
  },
  constellation2: {
    charged_critDMG_: skillParam_gen.constellation2[0],
  },
  constellation6: {
    current_dmg_: skillParam_gen.constellation6[0],
  },
} as const

const [condA1StacksPath, condA1Stacks] = cond(key, 'a1Stacks')
const a1StacksArr = range(1, dm.passive1.dmg_.length - 1)
const a1Stacks_judgmentSpecialMult_ = threshold(
  input.asc,
  1,
  lookup(
    condA1Stacks,
    objKeyMap(a1StacksArr, (stack) => percent(1 + dm.passive1.dmg_[stack])),
    one
  ),
  one
)

const a4Arr = range(1, 50)
const [condA4HpPath, condA4Hp] = cond(key, 'a4Hp')
const a4Hp_hydro_dmg_ = greaterEq(
  input.asc,
  4,
  lookup(
    condA4Hp,
    objKeyMap(a4Arr, (hp) => percent(hp * dm.passive2.hydro_dmg_)),
    naught
  )
)

const c2Judgment_critDMG_ = greaterEq(
  input.constellation,
  2,
  lookup(
    condA1Stacks,
    objKeyMap(a1StacksArr, (stack) =>
      percent(stack * dm.constellation2.charged_critDMG_)
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
    judgmentDmg: dmgNode(
      'hp',
      dm.charged.judgmentDmg,
      'charged',
      {
        premod: {
          charged_critDMG_: c2Judgment_critDMG_,
        },
      },
      // TODO: Is this really special multiplier?
      a1Stacks_judgmentSpecialMult_
    ),
    hpRestore: healNode('hp', dm.charged.hpRestore, 0),
    hpLoss: prod(percent(dm.charged.hpCost), input.total.hp),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    skillDmg: dmgNode('hp', dm.skill.skillDmg, 'skill'),
    thornDmg: dmgNode('atk', dm.skill.thornDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('hp', dm.burst.skillDmg, 'burst'),
    waterfallDmg: dmgNode('hp', dm.burst.waterfallDmg, 'burst'),
  },
  constellation6: {
    currentDmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(
          percent(dm.constellation6.current_dmg_),
          input.total.hp,
          a1Stacks_judgmentSpecialMult_
        ),
        'charged',
        {
          premod: {
            charged_critDMG_: c2Judgment_critDMG_,
          },
        }
      )
    ),
  },
}
const autoC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  data_gen.ele as ElementKey,
  data_gen.region as RegionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      burstBoost: burstC5,
      autoBoost: autoC3,
      hydro_dmg_: a4Hp_hydro_dmg_,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.rarity,
  elementKey: data_gen.ele!,
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
          }),
        })),
      },
      {
        text: ct.chg('auto.fields.chargedLegal'),
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
            value: dm.charged.stam,
          },
        ],
      },
      { text: ct.chg('auto.fields.chargedJudgment') },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.judgmentDmg, {
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.hpRestore, {
              name: ct.chg(`auto.skillParams.6`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.hpLoss, {
              name: ct.chg('auto.skillParams.7'),
            }),
          },
        ],
      },
      ct.condTem('passive1', {
        value: condA1Stacks,
        path: condA1StacksPath,
        name: ct.ch('a1Cond'),
        states: objKeyMap(a1StacksArr, (stacks) => ({
          name: st('stack', { count: stacks }),
          fields: [
            {
              node: infoMut(a1Stacks_judgmentSpecialMult_, {
                name: ct.ch('judgmentSpecialMult_'),
              }),
            },
            {
              text: stg('duration'),
              value: dm.passive1.duration,
              unit: 's',
            },
          ],
        })),
      }),
      ct.headerTem('constellation2', {
        canShow: greaterEq(input.asc, 1, unequal(condA1Stacks, undefined, 1)),
        fields: [
          {
            node: infoMut(c2Judgment_critDMG_, {
              name: ct.ch('judgment_critDMG_'),
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
            node: infoMut(dmgFormulas.skill.skillDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.thornDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.thornInterval,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: dm.skill.dropletDuration,
            unit: 's',
          },
          {
            text: stg('cd'),
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
            node: infoMut(dmgFormulas.burst.skillDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.waterfallDmg, {
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
            value: dm.burst.enerCost,
          },
        ],
      },
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.condTem('passive2', {
        value: condA4Hp,
        path: condA4HpPath,
        name: st('percentCurrentHP'),
        states: objKeyMap(a4Arr, (hp) => ({
          name: `${hp + 30}%`,
          fields: [
            {
              node: a4Hp_hydro_dmg_,
            },
          ],
        })),
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: autoC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: burstC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.currentDmg, {
              name: ct.ch('currentDmg'),
              multi: 2,
            }),
          },
        ],
      },
    ]),
  },
}
export default new CharacterSheet(sheet, data)
