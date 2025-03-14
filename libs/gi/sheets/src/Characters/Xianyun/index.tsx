import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  min,
  naught,
  percent,
  prod,
  subscript,
  threshold,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Xianyun'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

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
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    trailDmg: skillParam_gen.skill[s++],
    firstLeapDmg: skillParam_gen.skill[s++],
    secondLeapDmg: skillParam_gen.skill[s++],
    thirdLeapDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    instantDmg: skillParam_gen.burst[b++],
    coordinatedDmg: skillParam_gen.burst[b++],
    instantHealFlat: skillParam_gen.burst[b++],
    instantHealMult: skillParam_gen.burst[b++],
    deviceHealFlat: skillParam_gen.burst[b++],
    deviceHealMult: skillParam_gen.burst[b++],
    deviceHealInterval: skillParam_gen.burst[b++][0],
    dmgTriggers: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    critRate: [
      skillParam_gen.passive1[0][0],
      skillParam_gen.passive1[1][0],
      skillParam_gen.passive1[2][0],
      skillParam_gen.passive1[3][0],
    ],
    duration: skillParam_gen.passive1[4][0],
  },
  passive2: {
    plunging_dmg_inc: skillParam_gen.passive2[0][0],
    maxAtk: skillParam_gen.passive2[1][0],
    triggerInterval: skillParam_gen.passive2[2][0],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    plunging_dmg_inc_mult: skillParam_gen.constellation2[2],
  },
  constellation4: {
    heal1: skillParam_gen.constellation4[0],
    heal2: skillParam_gen.constellation4[1],
    heal3: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[3],
  },
  constellation6: {
    skill_critDMG_: [
      skillParam_gen.constellation6[0],
      skillParam_gen.constellation6[1],
      skillParam_gen.constellation6[2],
    ],
    cd: skillParam_gen.constellation6[3],
  },
} as const

const a1StacksArr = range(1, 4)
const [condA1StacksPath, condA1Stacks] = cond(key, 'a1Stacks')
const a1_plunging_critRate_ = greaterEq(
  input.asc,
  1,
  lookup(
    condA1Stacks,
    objKeyMap(a1StacksArr, (stack) => percent(dm.passive1.critRate[stack - 1])),
    naught,
  ),
)

const [condA4HasStacksPath, condA4HasStacks] = cond(key, 'a4HasStacks')
const a4HasStacks_plunging_dmg_inc = greaterEq(
  input.asc,
  4,
  equal(
    condA4HasStacks,
    'on',
    prod(
      prod(
        threshold(
          input.constellation,
          2,
          percent(
            (1 + dm.constellation2.plunging_dmg_inc_mult) *
              dm.passive2.plunging_dmg_inc,
          ),
          percent(dm.passive2.plunging_dmg_inc),
        ),
        min(input.total.atk, constant(dm.passive2.maxAtk)),
      ),
    ),
  ),
)

const [condC2AfterSkillPath, condC2AfterSkill] = cond(key, 'c2AfterSkill')
const c2AfterSkill_atk_ = greaterEq(
  input.constellation,
  2,
  equal(condC2AfterSkill, 'on', dm.constellation2.atk_),
)

const c6SkyladderUsesArr = range(1, 3)
const [condC6SkyladderUsesPath, condC6SkyladderUses] = cond(
  key,
  'c6SkyladderUses',
)
const c6Wave_critDMG_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condC6SkyladderUses,
    objKeyMap(c6SkyladderUsesArr, (uses) =>
      percent(dm.constellation6.skill_critDMG_[uses - 1]),
    ),
    naught,
  ),
)

const leapDmg = (lvlMultiplier: number[]) =>
  customDmgNode(
    prod(
      subscript(input.total.skillIndex, lvlMultiplier, { unit: '%' }),
      input.total.atk,
    ),
    'plunging_impact',
    {
      premod: {
        plunging_critDMG_: c6Wave_critDMG_,
      },
    },
  )

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')]),
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    trailDmg: dmgNode('atk', dm.skill.trailDmg, 'skill'),
    firstLeapDmg: leapDmg(dm.skill.firstLeapDmg),
    secondLeapDmg: leapDmg(dm.skill.secondLeapDmg),
    thirdLeapDmg: leapDmg(dm.skill.thirdLeapDmg),
  },
  burst: {
    instantDmg: dmgNode('atk', dm.burst.instantDmg, 'burst'),
    coordinatedDmg: dmgNode('atk', dm.burst.coordinatedDmg, 'burst'),
    instantHeal: healNodeTalent(
      'atk',
      dm.burst.instantHealMult,
      dm.burst.instantHealFlat,
      'burst',
    ),
    deviceHeal: healNodeTalent(
      'atk',
      dm.burst.deviceHealMult,
      dm.burst.deviceHealFlat,
      'burst',
    ),
  },
  passive2: {
    a4HasStacks_plunging_dmg_inc,
  },
  constellation4: {
    heal1: greaterEq(
      input.constellation,
      4,
      healNode('atk', percent(dm.constellation4.heal1), 0),
    ),
    heal2: greaterEq(
      input.constellation,
      4,
      healNode('atk', percent(dm.constellation4.heal2), 0),
    ),
    heal3: greaterEq(
      input.constellation,
      4,
      healNode('atk', percent(dm.constellation4.heal3), 0),
    ),
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC5,
    burstBoost: burstC3,
    atk_: c2AfterSkill_atk_,
  },
  teamBuff: {
    premod: {
      plunging_impact_dmgInc: a4HasStacks_plunging_dmg_inc,
      plunging_critRate_: a1_plunging_critRate_,
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
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.5'),
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
      fields: [
        {
          node: infoMut(dmgFormulas.skill.trailDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.firstLeapDmg, {
            name: ct.chg('skill.skillParams.1'),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.secondLeapDmg, {
            name: ct.chg('skill.skillParams.1'),
            textSuffix: '(2)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.thirdLeapDmg, {
            name: ct.chg('skill.skillParams.1'),
            textSuffix: '(3)',
          }),
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('constellation2', {
      value: condC2AfterSkill,
      path: condC2AfterSkillPath,
      teamBuff: true,
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: c2AfterSkill_atk_,
            },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.condTem('constellation6', {
      path: condC6SkyladderUsesPath,
      value: condC6SkyladderUses,
      name: ct.ch('c6Cond'),
      states: objKeyMap(c6SkyladderUsesArr, (uses) => ({
        name: `${uses}`,
        fields: [
          {
            node: infoMut(c6Wave_critDMG_, {
              name: ct.ch('wave_critDMG_'),
              unit: '%',
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
          node: infoMut(dmgFormulas.burst.instantDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.coordinatedDmg, {
            name: ct.chg('burst.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.instantHeal, {
            name: ct.chg('burst.skillParams.2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.deviceHeal, {
            name: ct.chg('burst.skillParams.3'),
          }),
        },
        {
          text: st('interval'),
          value: dm.burst.deviceHealInterval,
          unit: 's',
          fixed: 1,
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
      value: condA4HasStacks,
      path: condA4HasStacksPath,
      teamBuff: true,
      name: ct.ch('a4Cond'),
      states: {
        on: {
          fields: [
            {
              node: dmgFormulas.passive2.a4HasStacks_plunging_dmg_inc,
            },
          ],
        },
      },
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      value: condA1Stacks,
      path: condA1StacksPath,
      teamBuff: true,
      name: ct.ch('a1Cond'),
      states: objKeyMap(a1StacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: a1_plunging_critRate_,
          },
          {
            text: stg('duration'),
            value: dm.passive1.duration,
            unit: 's',
          },
        ],
      })),
    }),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.fieldsTem('constellation4', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation4.heal1, {
            name: ct.ch('c4Heal'),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation4.heal2, {
            name: ct.ch('c4Heal'),
            textSuffix: '(2)',
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation4.heal3, {
            name: ct.ch('c4Heal'),
            textSuffix: '(3)',
          }),
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
