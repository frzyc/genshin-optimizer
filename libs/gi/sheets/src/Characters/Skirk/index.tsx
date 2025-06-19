import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type CharacterKey, allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  naught,
  one,
  percent,
  prod,
  subscript,
  sum,
  tally,
  threshold,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  hitEle,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Skirk'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = -1,
  s = -1,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[(a += 2)], // 3x2
      skillParam_gen.auto[++a], // 4
      skillParam_gen.auto[++a], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    hitArr: [
      skillParam_gen.skill[++s], // 1
      skillParam_gen.skill[++s], // 2
      skillParam_gen.skill[(s += 2)], // 3x2
      skillParam_gen.skill[(s += 2)], // 4x2
      skillParam_gen.skill[++s], // 5
    ],
    charged: {
      dmg: skillParam_gen.skill[++s], // x3
      stam: skillParam_gen.skill[++s][0],
    },
    plunging: {
      dmg: skillParam_gen.skill[++s],
      low: skillParam_gen.skill[++s],
      high: skillParam_gen.skill[++s],
    },
    duration: skillParam_gen.skill[++s][0],
    maxSerpent: skillParam_gen.skill[++s][0],
    cd: skillParam_gen.skill[++s][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    finalDmg: skillParam_gen.burst[b++],
    serpentBonus: skillParam_gen.burst[b++],
    maxSerpentFactor: 12,
    void_dmg_: [
      skillParam_gen.burst[b++],
      skillParam_gen.burst[b++],
      skillParam_gen.burst[b++],
      skillParam_gen.burst[b++],
    ],
    cd: skillParam_gen.burst[b++][0],
    maxTriggers: 10,
    triggerCd: 0.1,
  },
  passive1: {
    serpentGain: skillParam_gen.passive1[0][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    normal_mult_: [
      skillParam_gen.passive2[1][0],
      skillParam_gen.passive2[2][0],
      skillParam_gen.passive2[3][0],
    ],
    burst_mult_: [
      skillParam_gen.passive2[4][0],
      skillParam_gen.passive2[5][0],
      skillParam_gen.passive2[6][0],
    ],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    addlSerpentFactor: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    atk_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    atk_: [
      skillParam_gen.constellation4[0],
      skillParam_gen.constellation4[1],
      skillParam_gen.constellation4[2],
    ],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    burstDmg: skillParam_gen.constellation6[1],
    normalDmg: skillParam_gen.constellation6[2],
    dmgDecrease: skillParam_gen.constellation6[3],
    chargedDmg: skillParam_gen.constellation6[4],
  },
} as const

const [condBurstSerpentOverPath, condBurstSerpentOver] = cond(
  key,
  'burstSerpentOver'
)
const burstSerpentOverArr = range(
  1,
  dm.burst.maxSerpentFactor + dm.constellation2.addlSerpentFactor
)
const burstSerpentOver = lookup(
  condBurstSerpentOver,
  objKeyMap(burstSerpentOverArr, (s) =>
    s > dm.burst.maxSerpentFactor
      ? greaterEq(input.constellation, 2, s)
      : constant(s)
  ),
  naught
)

const [condBurstVoidAbsorbPath, condBurstVoidAbsorb] = cond(
  key,
  'burstVoidAbsorb'
)
const burstVoidAbsorbArr = range(0, dm.burst.void_dmg_.length - 1)
const burstVoidAbsorb_normal_dmg_ = lookup(
  condBurstVoidAbsorb,
  Object.fromEntries(
    dm.burst.void_dmg_.map((s, i) => [i, subscript(input.total.burstIndex, s)])
  ),
  naught
)

const [condA4DeathStacksPath, condA4DeathStacks] = cond(key, 'a4DeathStacks')
const a4DeathStacksArr = range(1, dm.passive2.normal_mult_.length)
const a4DeathStacks_skillNormal_mult_ = threshold(
  input.asc,
  4,
  lookup(
    condA4DeathStacks,
    objKeyMap(a4DeathStacksArr, (s) =>
      percent(1 + dm.passive2.normal_mult_[s - 1])
    ),
    one
  ),
  one
)
const a4DeathStacks_burst_mult_ = threshold(
  input.asc,
  4,
  lookup(
    condA4DeathStacks,
    objKeyMap(a4DeathStacksArr, (s) =>
      percent(1 + dm.passive2.burst_mult_[s - 1])
    ),
    one
  ),
  one
)

const burstSerpentOver_burst_dmgInc = prod(
  burstSerpentOver,
  subscript(input.total.burstIndex, dm.burst.serpentBonus, { unit: '%' }),
  a4DeathStacks_burst_mult_,
  input.total.atk
)

const a0SkillBoost = greaterEq(
  tally.cryo,
  1,
  greaterEq(
    tally.hydro,
    1,
    equal(
      sum(tally.cryo, tally.hydro),
      sum(...allElementKeys.map((k) => tally[k])),
      1
    )
  )
)

const [condC2AfterBurstPath, condC2AfterBurst] = cond(key, 'c2AfterBurst')
const c2_atk_ = greaterEq(
  input.constellation,
  2,
  equal(condC2AfterBurst, 'on', dm.constellation2.atk_),
  { path: 'atk_' }
)
const c2_inverted_atk_ = infoMut(prod(c2_atk_, -1), { path: 'atk_' })
const c2_inverted_atk_data = { premod: { atk_: c2_inverted_atk_ } }

const burstSerpentOver_burst_dmgIncDisp = prod(
  burstSerpentOver,
  subscript(input.total.burstIndex, dm.burst.serpentBonus, { unit: '%' }),
  a4DeathStacks_burst_mult_,
  sum(input.total.atk, prod(input.base.atk, c2_inverted_atk_))
)

const c4DeathStacks_atk_ = greaterEq(
  input.constellation,
  4,
  greaterEq(
    input.asc,
    4,
    lookup(
      condA4DeathStacks,
      objKeyMap(a4DeathStacksArr, (s) =>
        percent(dm.constellation4.atk_[s - 1])
      ),
      naught
    )
  ),
  { path: 'atk_' }
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [
      i,
      dmgNode('atk', arr, 'normal', c2_inverted_atk_data),
    ])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged', c2_inverted_atk_data),
  },
  plunging: plungingDmgNodes('atk', dm.plunging, c2_inverted_atk_data),
  skill: {
    ...(Object.fromEntries(
      dm.skill.hitArr.map((arr, i) => [
        i,
        dmgNode(
          'atk',
          arr,
          'normal',
          hitEle.cryo,
          a4DeathStacks_skillNormal_mult_,
          'skill'
        ),
      ])
    ) as Record<0 | 1 | 2 | 3 | 4, NumNode>),
    chargedDmg: dmgNode(
      'atk',
      dm.skill.charged.dmg,
      'charged',
      hitEle.cryo,
      undefined,
      'skill'
    ),
    ...plungingDmgNodes(
      'atk',
      dm.skill.plunging,
      hitEle.cryo,
      undefined,
      'skill'
    ),
  },
  burst: {
    skillDmg: dmgNode(
      'atk',
      dm.burst.skillDmg,
      'burst',
      c2_inverted_atk_data,
      a4DeathStacks_burst_mult_
    ),
    finalDmg: dmgNode(
      'atk',
      dm.burst.finalDmg,
      'burst',
      c2_inverted_atk_data,
      a4DeathStacks_burst_mult_
    ),
  },
  constellation1: {
    dmg: greaterEq(
      input.constellation,
      1,
      greaterEq(
        input.asc,
        1,
        customDmgNode(
          prod(percent(dm.constellation1.dmg), input.total.atk),
          'charged',
          hitEle.cryo
        )
      )
    ),
  },
  constellation6: {
    // TODO: Check if this is affected by a4 stacks
    burstDmg: greaterEq(
      input.constellation,
      6,
      greaterEq(
        input.asc,
        1,
        customDmgNode(
          prod(
            percent(dm.constellation6.burstDmg),
            input.total.atk,
            a4DeathStacks_burst_mult_
          ),
          'burst',
          {
            ...hitEle.cryo,
            ...c2_inverted_atk_data,
          }
        )
      )
    ),
    normalDmg: greaterEq(
      input.constellation,
      6,
      greaterEq(
        input.asc,
        1,
        customDmgNode(
          prod(
            percent(dm.constellation6.normalDmg),
            input.total.atk,
            a4DeathStacks_skillNormal_mult_
          ),
          'normal',
          hitEle.cryo
        )
      )
    ),
    chargedDmg: greaterEq(
      input.constellation,
      6,
      greaterEq(
        input.asc,
        1,
        customDmgNode(
          prod(percent(dm.constellation6.chargedDmg), input.total.atk),
          'charged',
          hitEle.cryo
        )
      )
    ),
  },
}
const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC5,
    burstBoost: burstC3,
    burst_dmgInc: burstSerpentOver_burst_dmgInc,
    normal_dmg_: burstVoidAbsorb_normal_dmg_,
    atk_: sum(c2_atk_, c4DeathStacks_atk_),
  },
  teamBuff: {
    premod: {
      skillBoost: a0SkillBoost,
    },
  },
})

const sheet: TalentSheet = {
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
            name: ct.chg(`auto.skillParams.5`),
            multi: 2,
          }),
        },
        {
          text: ct.chg('auto.skillParams.6'),
          value: dm.charged.stam,
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
      fields: dm.skill.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.skill[i as 1 | 2 | 3 | 4], {
          name: ct.chg(`skill.skillParams.${i}`),
          multi: i === 2 || i === 3 ? 2 : undefined,
        }),
      })),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.chargedDmg, {
            name: ct.chg(`skill.skillParams.5`),
            multi: 3,
          }),
        },
        {
          text: ct.chg('skill.skillParams.6'),
          value: dm.skill.charged.stam,
        },
      ],
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.dmg, {
            name: stg('plunging.dmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.low, {
            name: stg('plunging.low'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.high, {
            name: stg('plunging.high'),
          }),
        },
      ],
    },
    {
      fields: [
        {
          text: ct.chg('skill.skillParams.9'),
          value: dm.skill.duration,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.10'),
          value: dm.skill.maxSerpent,
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
            multi: 5,
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.finalDmg, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          text: stg('cd'),
          value: dm.burst.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('burst', {
      path: condBurstSerpentOverPath,
      value: condBurstSerpentOver,
      name: ct.ch('burstSerpentCond'),
      states: (data) =>
        objKeyMap(
          range(
            1,
            dm.burst.maxSerpentFactor +
              (data.get(input.constellation).value >= 2
                ? dm.constellation2.addlSerpentFactor
                : 0)
          ),
          (stack) => ({
            name: st('points', { count: stack }),
            fields: [
              {
                node: infoMut(burstSerpentOver_burst_dmgIncDisp, {
                  path: 'burst_dmgInc',
                }),
              },
            ],
          })
        ),
    }),
    ct.fieldsTem('constellation2', {
      fields: [
        {
          text: ct.ch('c2AddlSerpentFactor'),
          value: dm.constellation2.addlSerpentFactor,
        },
      ],
    }),
    ct.condTem('burst', {
      path: condBurstVoidAbsorbPath,
      value: condBurstVoidAbsorb,
      name: ct.ch('burstVoidCond'),
      states: objKeyMap(burstVoidAbsorbArr, (stack) => ({
        name: `${stack}`,
        fields: [
          {
            node: burstVoidAbsorb_normal_dmg_,
          },
          {
            text: st('triggerQuota'),
            value: dm.burst.maxTriggers,
          },
          {
            text: stg('cd'),
            value: dm.burst.triggerCd,
            unit: 's',
            fixed: 1,
          },
        ],
      })),
    }),
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4DeathStacksPath,
      value: condA4DeathStacks,
      name: ct.ch('a4Cond'),
      states: objKeyMap(a4DeathStacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: infoMut(a4DeathStacks_skillNormal_mult_, {
              name: st('dmgMult.normal'),
            }),
          },
          {
            node: infoMut(a4DeathStacks_burst_mult_, {
              name: st('dmgMult.burst'),
            }),
          },
        ],
      })),
    }),
    ct.headerTem('constellation4', {
      canShow: greaterEq(
        input.asc,
        4,
        unequal(condA4DeathStacks, undefined, 1)
      ),
      fields: [{ node: c4DeathStacks_atk_ }],
    }),
  ]),
  passive3: ct.talentTem('passive3', [{ fields: [{ node: a0SkillBoost }] }]),
  constellation1: ct.talentTem('constellation1', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.dmg, { name: st('dmg') }),
        },
      ],
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2AfterBurstPath,
      value: condC2AfterBurst,
      name: ct.ch('c2Cond'),
      states: {
        on: {
          fields: [
            {
              node: c2_atk_,
            },
            { text: ct.ch('c2Atk_blurb') },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
              fixed: 1,
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.burstDmg, {
            name: ct.ch('c6BurstDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation6.normalDmg, {
            name: ct.ch('c6NormalDmg'),
            multi: 3,
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation6.chargedDmg, {
            name: ct.ch('c6ChargedDmg'),
            multi: 3,
          }),
        },
      ],
    },
  ]),
}
export default new CharacterSheet(sheet, data)
