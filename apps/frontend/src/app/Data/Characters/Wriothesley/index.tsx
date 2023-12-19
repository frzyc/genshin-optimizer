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
  percent,
  prod,
  subscript,
  sum,
  threshold,
  unequal,
} from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import { dataObjForCharacterSheet, dmgNode, healNode } from '../dataUtil'

const key: CharacterKey = 'Wriothesley'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3
      skillParam_gen.auto[(a += 2)], // 4x2
      skillParam_gen.auto[++a], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    fistDmg: skillParam_gen.skill[s++],
    hpCost: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    bladeDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    bladeCd: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hpThresh: skillParam_gen.passive1[0][0],
    dmg_: skillParam_gen.passive1[1][0],
    hpRestore: skillParam_gen.passive1[2][0],
    cd: skillParam_gen.passive1[3][0],
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
    maxStacks: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    cd: skillParam_gen.constellation1[0],
    dmg_: skillParam_gen.constellation1[1],
    durationInc: skillParam_gen.constellation1[2],
  },
  constellation2: {
    dmg_: skillParam_gen.constellation2[0],
  },
  constellation4: {
    selfAtkSPD_: skillParam_gen.constellation4[0],
    selfDuration: skillParam_gen.constellation4[1],
    teamAtkSPD_: skillParam_gen.constellation4[2],
    teamDuration: skillParam_gen.constellation4[3],
    heal: skillParam_gen.constellation4[4],
  },
  constellation6: {
    skill_critRate_: skillParam_gen.constellation6[0],
    skill_critDMG_: skillParam_gen.constellation6[1],
    icicle_dmg_: skillParam_gen.constellation6[2],
  },
} as const

const a1Rebuke_dmg_ = greaterEq(input.asc, 1, dm.passive1.dmg_, { unit: '%' })

const [condA4EdictStacksPath, condA4EdictStacks] = cond(key, 'a4EdictStacks')
const a4EdictStacksArr = range(1, dm.passive2.maxStacks)
const a4EdictStacks_atk_ = greaterEq(
  input.asc,
  4,
  lookup(
    condA4EdictStacks,
    objKeyMap(a4EdictStacksArr, (stack) => percent(stack * dm.passive2.atk_)),
    naught
  )
)

const c1Rebuke_dmg_ = greaterEq(input.constellation, 1, dm.constellation1.dmg_)
const rebuke_dmg_ = sum(a1Rebuke_dmg_, c1Rebuke_dmg_)

const c2EdictStacks_burst_dmg_ = greaterEq(
  input.constellation,
  2,
  greaterEq(
    input.asc,
    4,
    lookup(
      condA4EdictStacks,
      objKeyMap(a4EdictStacksArr, (stack) =>
        percent(stack * dm.constellation2.dmg_)
      ),
      naught
    )
  )
)

const c6Rebuke_critRate_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.skill_critRate_
)
const c6Rebuke_critDMG_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.skill_critDMG_
)

const rebukeDmg = greaterEq(
  input.asc,
  1,
  dmgNode('atk', dm.charged.dmg, 'charged', {
    premod: {
      charged_critRate_: c6Rebuke_critRate_,
      charged_critDMG_: c6Rebuke_critDMG_,
      charged_dmg_: rebuke_dmg_,
    },
  })
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
    rebukeDmg,
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [
        `enhanced_${i}`,
        dmgNode(
          'atk',
          arr,
          'normal',
          undefined,
          // TODO: Is this really special multiplier?
          subscript(input.total.skillIndex, dm.skill.fistDmg, { unit: '%' })
        ),
      ])
    ),
    hpCost: prod(percent(dm.skill.hpCost), input.total.hp),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    bladeDmg: dmgNode('atk', dm.burst.bladeDmg, 'burst'),
  },
  passive1: {
    heal: healNode(
      'hp',
      threshold(
        input.constellation,
        4,
        dm.constellation4.heal + dm.passive1.hpRestore,
        dm.passive1.hpRestore
      ),
      0
    ),
  },
  constellation6: {
    icicleDmg: greaterEq(input.constellation, 6, { ...rebukeDmg }),
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
      atk_: a4EdictStacks_atk_,
      burst_dmg_: c2EdictStacks_burst_dmg_,
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
            multi: i === 3 ? 2 : undefined,
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
            value: dm.charged.stam,
          },
        ],
      },
      ct.headerTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.rebukeDmg, {
              name: ct.ch('rebukeDmg'),
            }),
          },
          {
            node: infoMut(dmgFormulas.passive1.heal, { name: stg('healing') }),
          },
        ],
      }),
      ct.headerTem('constellation1', {
        fields: [
          {
            node: infoMut(c1Rebuke_dmg_, {
              name: ct.ch('rebuke_dmg_'),
              unit: '%',
            }),
          },
        ],
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.icicleDmg, {
              name: ct.ch('icicleDmg'),
            }),
          },
          {
            node: infoMut(c6Rebuke_critRate_, {
              name: ct.ch('rebuke_critRate_'),
              unit: '%',
            }),
          },
          {
            node: infoMut(c6Rebuke_critDMG_, {
              name: ct.ch('rebuke_critDMG_'),
              unit: '%',
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
            node: infoMut(dmgFormulas.skill.hpCost, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          ...dm.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.skill[`enhanced_${i}`], {
              name: ct.chg(`auto.skillParams.${i}`),
              multi: i === 3 ? 2 : undefined,
            }),
          })),
          {
            text: stg('duration'),
            value: dm.skill.duration,
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
              name: ct.chg('burst.skillParams.0'),
              multi: 5,
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.bladeDmg, {
              name: ct.chg('burst.skillParams.1'),
            }),
          },
          {
            text: ct.chg('burst.skillParams.2'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.burst.bladeCd,
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
        value: condA4EdictStacks,
        path: condA4EdictStacksPath,
        name: ct.ch('a4Cond'),
        states: objKeyMap(a4EdictStacksArr, (stack) => ({
          name: st('stack', { count: stack }),
          fields: [
            {
              node: a4EdictStacks_atk_,
            },
          ],
        })),
      }),
      ct.headerTem('constellation2', {
        canShow: unequal(condA4EdictStacks, undefined, 1),
        fields: [
          {
            node: c2EdictStacks_burst_dmg_,
          },
        ],
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
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
