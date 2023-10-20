import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input, tally } from '../../../Formula'
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
  subscript,
  sum,
} from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import { dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'

const key: CharacterKey = 'Lyney'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[++a], // 3x2, skip one entry
      skillParam_gen.auto[++a],
    ],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  charged: {
    aimed: skillParam_gen.auto[++a],
    fullyAimed: skillParam_gen.auto[++a],
    propDmg: skillParam_gen.auto[++a],
    hpCost: skillParam_gen.auto[++a],
    hatHp: skillParam_gen.auto[++a],
    hatDuration: skillParam_gen.auto[++a][0],
    pyrotechnicDmg: skillParam_gen.auto[++a],
    thornDmg: skillParam_gen.auto[++a],
    thornInterval: skillParam_gen.auto[++a][0],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    dmgInc: skillParam_gen.skill[s++],
    hpRegen: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    fireworkDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    energy: skillParam_gen.passive1[0][0],
    propAddlDmg: skillParam_gen.passive1[1][0],
  },
  passive2: {
    dmg_: skillParam_gen.passive2[0][0],
    extraDmg_: skillParam_gen.passive2[1][0],
  },
  constellation2: {
    critDmg_: skillParam_gen.constellation2[0],
    stackCd: skillParam_gen.constellation2[1],
    maxStacks: skillParam_gen.constellation2[2],
  },
  constellation4: {
    enemy_pyro_res_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
  },
} as const

const [condPropStacksPath, condPropStacks] = cond(key, 'propStacks')
const propStacksArr = range(1, 5)
const propStacks = lookup(
  condPropStacks,
  objKeyMap(propStacksArr, (stacks) => constant(stacks)),
  constant(0),
  { name: ct.ch('propStacks') }
)

// TODO: Check if this scales with Bennett ult. If it does not, change this to premod.atk
const skillDmgInc = prod(
  propStacks,
  subscript(input.total.skillIndex, dm.skill.dmgInc, { unit: '%' }),
  input.total.atk
)

const [condA1DrainHpPath, condA1DrainHp] = cond(key, 'a1DrainHp')
const a1_hatDmgInc = greaterEq(
  input.asc,
  1,
  equal(
    condA1DrainHp,
    'on',
    prod(percent(dm.passive1.propAddlDmg), input.total.atk)
  )
)

const [condA4AffectedByPyroPath, condA4AffectedByPyro] = cond(
  key,
  'a4AffectedByPyro'
)
const numPyroOther = infoMut(min(2, sum(tally.pyro, -1)), { asConst: true })
const a4AffectedByPyro_dmg_ = greaterEq(
  input.asc,
  4,
  equal(
    condA4AffectedByPyro,
    'on',
    sum(
      percent(dm.passive2.dmg_),
      prod(percent(dm.passive2.extraDmg_), numPyroOther)
    )
  )
)

const [condC2StacksPath, condC2Stacks] = cond(key, 'c2Stacks')
const c2StacksArr = range(1, dm.constellation2.maxStacks)
const c2_critDMG_ = greaterEq(
  input.constellation,
  2,
  prod(
    percent(dm.constellation2.critDmg_),
    lookup(
      condC2Stacks,
      objKeyMap(c2StacksArr, (stacks) => constant(stacks)),
      naught
    )
  )
)

const [condC4HitPath, condC4Hit] = cond(key, 'c4Hit')
const c4_pyro_enemy_res_ = greaterEq(
  input.constellation,
  4,
  equal(condC4Hit, 'on', -dm.constellation4.enemy_pyro_res_)
)

const hit_ele_pyro = { hit: { ele: constant(data_gen.ele) } }
const hat_addl: Data = {
  premod: { charged_dmgInc: a1_hatDmgInc },
  ...hit_ele_pyro,
}

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    fullyAimed: dmgNode('atk', dm.charged.fullyAimed, 'charged', hit_ele_pyro),
    prop: dmgNode('atk', dm.charged.propDmg, 'charged', hit_ele_pyro),
    hpCost: prod(
      subscript(input.total.autoIndex, dm.charged.hpCost, { unit: '%' }),
      input.total.hp
    ),
    hatHp: prod(
      subscript(input.total.autoIndex, dm.charged.hatHp, { unit: '%' }),
      input.total.hp
    ),
    pyrotechnic: dmgNode('atk', dm.charged.pyrotechnicDmg, 'charged', hat_addl),
    spiritbreath: dmgNode('atk', dm.charged.thornDmg, 'charged', hit_ele_pyro),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    skillDmgInc,
    hpRegen: healNodeTalent(
      'hp',
      dm.skill.hpRegen,
      new Array(15).fill(0),
      'skill',
      undefined,
      propStacks
    ),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    fireworkDmg: dmgNode('atk', dm.burst.fireworkDmg, 'burst'),
  },
  passive1: {
    hatDmgInc: a1_hatDmgInc,
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      dmgNode(
        'atk',
        dm.charged.pyrotechnicDmg,
        'charged',
        hit_ele_pyro,
        percent(dm.constellation6.dmg)
      )
    ),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  data_gen.ele as ElementKey,
  data_gen.region as RegionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      burstBoost: nodeC5,
      autoBoost: nodeC3,
      critDMG_: c2_critDMG_,
      all_dmg_: a4AffectedByPyro_dmg_,
      skill_dmgInc: skillDmgInc,
    },
    teamBuff: {
      premod: {
        pyro_enemyRes_: c4_pyro_enemy_res_,
      },
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
            multi: i === 2 ? 2 : undefined,
          }),
        })),
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
      {
        text: ct.chg('auto.fields.charged'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.aimed, {
              name: ct.chg(`auto.skillParams.6`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.fullyAimed, {
              name: ct.chg(`auto.skillParams.7`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.prop, {
              name: ct.chg('auto.skillParams.8'),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.hpCost, {
              name: ct.chg('auto.skillParams.9'),
            }),
          },
        ],
      },
      ct.headerTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.dmg, {
              name: ct.ch('c6Dmg'),
            }),
          },
        ],
      }),
      {
        text: ct.chg('auto.fields.grinMalkin'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.hatHp, {
              name: ct.chg('auto.skillParams.10'),
            }),
          },
          {
            text: ct.chg('auto.skillParams.11'),
            value: dm.charged.hatDuration,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.charged.pyrotechnic, {
              name: ct.chg('auto.skillParams.12'),
            }),
          },
        ],
      },
      ct.condTem('passive1', {
        value: condA1DrainHp,
        path: condA1DrainHpPath,
        name: ct.ch('a1CondName'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(a1_hatDmgInc, { name: ct.ch('hatDmgInc') }),
              },
              {
                text: stg('energyRegen'),
                value: 3,
              },
            ],
          },
        },
      }),
      {
        text: ct.chg('auto.fields.arkhe'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.spiritbreath, {
              name: ct.chg('auto.skillParams.13'),
            }),
          },
          {
            text: ct.chg('auto.skillParams.14'),
            value: dm.charged.thornInterval,
            unit: 's',
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
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('skill', {
        value: condPropStacks,
        path: condPropStacksPath,
        name: ct.ch('propStacksUsed'),
        states: objKeyMap(propStacksArr, (stacks) => ({
          name: st('stack', { count: stacks }),
          fields: [
            {
              node: dmgFormulas.skill.skillDmgInc,
            },
            {
              node: infoMut(dmgFormulas.skill.hpRegen, {
                name: ct.chg('skill.skillParams.2'),
              }),
            },
          ],
        })),
      }),
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
            node: infoMut(dmgFormulas.burst.fireworkDmg, {
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
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.condTem('passive2', {
        value: condA4AffectedByPyro,
        path: condA4AffectedByPyroPath,
        name: st('enemyAffected.pyro'),
        states: {
          on: {
            fields: [
              {
                node: a4AffectedByPyro_dmg_,
              },
            ],
          },
        },
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        path: condC2StacksPath,
        value: condC2Stacks,
        name: st('timeOnField'),
        states: objKeyMap(c2StacksArr, (stacks) => ({
          name: st('seconds', { count: stacks * 2 }),
          fields: [
            {
              node: c2_critDMG_,
            },
          ],
        })),
      }),
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.condTem('constellation4', {
        value: condC4Hit,
        path: condC4HitPath,
        name: st('hitOp.charged'),
        states: {
          on: {
            fields: [
              {
                node: c4_pyro_enemy_res_,
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
