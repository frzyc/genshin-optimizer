import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { UIData } from '@genshin-optimizer/gi/uidata'
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
  sum,
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
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Clorinde'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[(a += 2)], // 3x2
      skillParam_gen.auto[(a += 3)], // 4x3
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
    normalDmg: skillParam_gen.skill[s++],
    piercingDmg: skillParam_gen.skill[s++],
    bond: skillParam_gen.skill[s++][0],
    thrust1Dmg: skillParam_gen.skill[s++],
    thrust2Dmg: skillParam_gen.skill[s++],
    thrust2Heal: skillParam_gen.skill[s++][0],
    thrust3Dmg: skillParam_gen.skill[s++],
    thrust3Heal: skillParam_gen.skill[s++][0],
    bondHealConvert: skillParam_gen.skill[s++][0],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    bond: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    maxDmgInc: skillParam_gen.passive1[1][0],
    atkRatio: skillParam_gen.passive1[2][0],
    maxStacks: 3,
  },
  passive2: {
    bondThreshold: skillParam_gen.passive2[0][0],
    bondHealConvert: skillParam_gen.passive2[1][0],
    critRate_: skillParam_gen.passive2[2][0],
    duration: skillParam_gen.passive2[3][0],
    maxStacks: 2,
  },
  constellation1: {
    idk: skillParam_gen.constellation1[0],
    dmg: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
    multi: 2,
  },
  constellation2: {
    maxDmgInc: skillParam_gen.constellation2[0],
    atkRatio: skillParam_gen.constellation2[1],
  },
  constellation4: {
    burst_dmg_: skillParam_gen.constellation4[0],
    max_burst_dmg_: skillParam_gen.constellation4[1],
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    dmgReducDuration: skillParam_gen.constellation6[2],
    dmgReduc: skillParam_gen.constellation6[3],
    dmg: skillParam_gen.constellation6[4],
    maxShades: skillParam_gen.constellation6[5],
    critDuration: skillParam_gen.constellation6[6],
  },
} as const

const a1ReactionsArr = range(1, dm.passive1.maxStacks)
const [condA1ReactionsPath, condA1Reactions] = cond(key, 'a1Reactions')
const a1AtkRatio = threshold(
  input.constellation,
  2,
  percent(dm.constellation2.atkRatio),
  percent(dm.passive1.atkRatio)
)
const a1MaxDmgInc = threshold(
  input.constellation,
  2,
  dm.constellation2.maxDmgInc,
  dm.passive1.maxDmgInc
)
const a1Reactions_normal_dmgInc = greaterEq(
  input.asc,
  1,
  min(
    a1MaxDmgInc,
    lookup(
      condA1Reactions,
      objKeyMap(a1ReactionsArr, (stack) =>
        prod(a1AtkRatio, input.total.atk, stack)
      ),
      naught
    )
  ),
  { path: 'normal_dmgInc' }
)
const a1Reactions_burst_dmgInc = { ...a1Reactions_normal_dmgInc }

const a4BondChangesArr = range(1, dm.passive2.maxStacks)
const [condA4BondChangesPath, condA4BondChanges] = cond(key, 'a4BondChanges')
const a4BondChanges_critRate_ = infoMut(
  greaterEq(
    input.asc,
    4,
    lookup(
      condA4BondChanges,
      objKeyMap(a4BondChangesArr, (stack) =>
        percent(stack * dm.passive2.critRate_)
      ),
      naught
    )
  ),
  { path: 'critRate_' }
)

const c4BondPercentArr = range(
  10,
  dm.constellation4.max_burst_dmg_ / dm.constellation4.burst_dmg_,
  5
)
const [condC4BondPercentPath, condC4BondPercent] = cond(key, 'c4BondPercent')
const c4BondPercentValue = lookup(
  condC4BondPercent,
  objKeyMap(c4BondPercentArr, (per) => constant(per)),
  naught
)
const c4_burst_dmg_ = greaterEq(
  input.constellation,
  4,
  prod(percent(dm.constellation4.burst_dmg_), c4BondPercentValue)
)

const [condC6AfterSkillPath, condC6AfterSkill] = cond(key, 'c6AfterSkill')
const c6AfterSkill_critRate_ = infoMut(
  greaterEq(
    input.constellation,
    6,
    equal(condC6AfterSkill, 'on', dm.constellation6.critRate_)
  ),
  { path: 'critRate_' }
)
const c6AfterSkill_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condC6AfterSkill, 'on', dm.constellation6.critDMG_)
)

const electroNormalHit = {
  hit: { ele: constant('electro') },
  premod: { normal_dmgInc: a1Reactions_normal_dmgInc },
}

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    normalDmg: dmgNode(
      'atk',
      dm.skill.normalDmg,
      'normal',
      electroNormalHit,
      undefined,
      'skill'
    ),
    piercingDmg: dmgNode(
      'atk',
      dm.skill.piercingDmg,
      'normal',
      electroNormalHit,
      undefined,
      'skill'
    ),
    thrust1Dmg: dmgNode(
      'atk',
      dm.skill.thrust1Dmg,
      'normal',
      electroNormalHit,
      undefined,
      'skill'
    ),
    thrust2Dmg: dmgNode(
      'atk',
      dm.skill.thrust2Dmg,
      'normal',
      electroNormalHit,
      undefined,
      'skill'
    ),
    thrust3Dmg: dmgNode(
      'atk',
      dm.skill.thrust3Dmg,
      'normal',
      electroNormalHit,
      undefined,
      'skill'
    ),
    bladeDmg: dmgNode('atk', dm.skill.bladeDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
  },
  passive1: {
    a1Reactions_normal_dmgInc,
    a1Reactions_burst_dmgInc,
  },
  constellation1: {
    dmg: greaterEq(
      input.constellation,
      1,
      customDmgNode(
        prod(percent(dm.constellation1.dmg), input.total.atk),
        'normal',
        electroNormalHit
      )
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'normal',
        electroNormalHit
      )
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    burst_dmgInc: a1Reactions_burst_dmgInc,
    critRate_: sum(a4BondChanges_critRate_, c6AfterSkill_critRate_),
    burst_dmg_: c4_burst_dmg_,
    critDMG_: c6AfterSkill_critDMG_,
  },
})

const autoMultis: Record<number, number> = {
  2: 2,
  3: 3,
}
const sheet: TalentSheet = {
  auto: ct.talentTem('auto', [
    {
      text: ct.chg('auto.fields.normal'),
    },
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i}`),
          multi: autoMultis[i],
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
            name: ct.chg('auto.skillParams.5'),
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
      fields: [
        {
          node: infoMut(dmgFormulas.skill.normalDmg, {
            name: ct.chg('skill.skillParams.0'),
            textSuffix: st('level', { count: 1 }),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.piercingDmg, {
            name: ct.chg('skill.skillParams.0'),
            textSuffix: st('level', { count: 2 }),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.thrust1Dmg, {
            name: ct.chg('skill.skillParams.2'),
            textSuffix: st('level', { count: 1 }),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.thrust2Dmg, {
            name: ct.chg('skill.skillParams.2'),
            textSuffix: st('level', { count: 2 }),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.thrust3Dmg, {
            name: ct.chg('skill.skillParams.2'),
            textSuffix: st('level', { count: 3 }),
            multi: 3,
          }),
        },
        {
          text: ct.chg('skill.skillParams.3'),
          textSuffix: st('level', { count: 2 }),
          value: dm.skill.thrust2Heal * 100,
          unit: st('bond.percentOf'),
        },
        {
          text: ct.chg('skill.skillParams.3'),
          textSuffix: st('level', { count: 3 }),
          value: dm.skill.thrust3Heal * 100,
          unit: st('bond.percentOf'),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: (data: UIData) =>
            data.get(input.asc).value >= 4
              ? dm.passive2.bondHealConvert * 100
              : dm.skill.bondHealConvert * 100,
          unit: '%',
        },
        {
          node: infoMut(dmgFormulas.skill.bladeDmg, {
            name: ct.chg('skill.skillParams.5'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.6'),
          value: dm.skill.bladeInterval,
          unit: 's',
        },
        {
          text: stg('duration'),
          value: dm.skill.duration,
          unit: 's',
          fixed: 1,
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('constellation6', {
      value: condC6AfterSkill,
      path: condC6AfterSkillPath,
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: c6AfterSkill_critRate_,
            },
            {
              node: c6AfterSkill_critDMG_,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.critDuration,
              unit: 's',
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
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg('burst.skillParams.0'),
            multi: 5,
          }),
        },
        {
          text: ct.chg('burst.skillParams.1'),
          value: (data: UIData) =>
            dm.burst.bond[data.get(input.total.burstIndex).value] * 100,
          unit: '%',
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
    ct.condTem('constellation4', {
      path: condC4BondPercentPath,
      value: condC4BondPercent,
      name: st('bond.current'),
      states: objKeyMap(c4BondPercentArr, (bond) => ({
        name: `${bond}%`,
        fields: [
          {
            node: c4_burst_dmg_,
          },
        ],
      })),
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      value: condA1Reactions,
      path: condA1ReactionsPath,
      name: st('teamHitOp.electroReaction'),
      states: objKeyMap(a1ReactionsArr, (stack) => ({
        name: st('times', { count: stack }),
        fields: [
          {
            node: a1Reactions_normal_dmgInc,
          },
          {
            node: a1Reactions_burst_dmgInc,
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
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      value: condA4BondChanges,
      path: condA4BondChangesPath,
      name: st('bond.changes'),
      states: objKeyMap(a4BondChangesArr, (stack) => ({
        name: st('times', { count: stack }),
        fields: [
          {
            node: a4BondChanges_critRate_,
          },
          {
            text: stg('duration'),
            value: dm.passive2.duration,
            unit: 's',
          },
        ],
      })),
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.dmg, {
            name: st('dmg'),
            multi: dm.constellation1.multi,
          }),
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.dmg, { name: st('dmg') }),
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
