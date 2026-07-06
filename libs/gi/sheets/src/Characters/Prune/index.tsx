import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/common/util'
import { type CharacterKey, absorbableEle } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  active,
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  max,
  min,
  naught,
  percent,
  prod,
  sum,
  tally,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { any, cond, st, stg } from '../../SheetUtil'
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

const key: CharacterKey = 'Prune'
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
    ringDmg: skillParam_gen.skill[s++],
    clangDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    bellDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
  },
  passive2: {
    dmg_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
    maxDmg_: skillParam_gen.passive2[2][0],
    atkThresh: skillParam_gen.passive2[3][0],
  },
  lockedPassive: {
    selfAtk_: skillParam_gen.lockedPassive![0][0],
    selfDuration: skillParam_gen.lockedPassive![1][0],
    teamAtk_: skillParam_gen.lockedPassive![2][0],
    teamDuration: skillParam_gen.lockedPassive![3][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    moreAtk_: skillParam_gen.constellation2[1],
    maxAtk_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    durationInc: skillParam_gen.constellation6[0],
    atk: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const [condLockHomeworkPath, condLockHomework] = cond(key, 'lockHomework')
const lockHomework_hexerei = equal(condLockHomework, 'on', 1)

const [condA4RallyPath, condA4Rally] = cond(key, 'a4Rally')
const a4Rally_normal_dmg_ = greaterEq(
  input.asc,
  4,
  equal(
    condA4Rally,
    'on',
    max(
      min(
        prod(
          percent(dm.passive2.dmg_),
          sum(input.premod.atk, -dm.passive2.atkThresh)
        ),
        percent(dm.passive2.maxDmg_)
      ),
      naught
    )
  )
)
const a4Rally_charged_dmg_ = { ...a4Rally_normal_dmg_ }
const a4Rally_plunging_dmg_ = { ...a4Rally_normal_dmg_ }
const a4Rally_skill_dmg_ = { ...a4Rally_normal_dmg_ }
const a4Rally_burst_dmg_ = { ...a4Rally_normal_dmg_ }

const [condLockRallyReactionPath, condLockRallyReaction] = cond(
  key,
  'lockRallyReaction'
)
const lockRallyReaction_selfAtk_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    greaterEq(
      input.asc,
      4,
      unequal(condLockRallyReaction, undefined, dm.lockedPassive.selfAtk_)
    )
  )
)
const lockRallyReaction_teamAtk_disp = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    greaterEq(
      input.asc,
      4,
      equal(
        condLockRallyReaction,
        'swirl',
        equal(target.flags.isHexerei, 1, dm.lockedPassive.teamAtk_)
      )
    )
  )
)
// Technically non-anemo can trigger this, but it requires enemy with anemo aura, which is not realy a thing
const lockRallyReaction_teamAtk_ = equal(
  target.charEle,
  'anemo',
  lockRallyReaction_teamAtk_disp
)

const [condC2StackPath, condC2Stack] = cond(key, 'c2Stack')
const c2StackArr = range(
  0,
  (dm.constellation2.maxAtk_ - dm.constellation2.atk_) /
    dm.constellation2.moreAtk_
)
const c2StackAtk_ = greaterEq(
  input.constellation,
  2,
  sum(
    percent(dm.constellation2.atk_),
    prod(
      percent(dm.constellation2.moreAtk_),
      lookup(
        condC2Stack,
        objKeyMap(c2StackArr, (s) => constant(s)),
        naught
      )
    )
  )
)

const [condC6RallyReactionPath, condC6RallyReaction] = cond(
  key,
  'c6RallyReaction'
)
const c6RallyReaction_atk = greaterEq(
  input.constellation,
  6,
  greaterEq(
    input.asc,
    4,
    equal(
      condC6RallyReaction,
      'on',
      any(
        dm.constellation6.atk,
        equal(target.charKey, key, 1),
        equal(active.charKey, target.charKey, 1)
      )
    )
  )
)

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
    ringDmg: dmgNode('atk', dm.skill.ringDmg, 'skill'),
    ...objKeyValMap(absorbableEle, (ele) => [
      `clang${ele}Dmg`,
      dmgNode('atk', dm.skill.clangDmg, 'skill', hitEle[ele]),
    ]),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    bellDmg: dmgNode('atk', dm.burst.bellDmg, 'burst'),
  },
  passive1: objKeyValMap(absorbableEle, (ele) => [
    `${ele}Dmg`,
    greaterEq(
      input.asc,
      1,
      customDmgNode(
        prod(percent(dm.passive1.dmg), input.total.atk),
        'burst',
        hitEle[ele]
      )
    ),
  ]),
  passive2: { a4Rally_normal_dmg_ },
  constellation4: objKeyValMap(absorbableEle, (ele) => [
    `${ele}Dmg`,
    greaterEq(
      input.constellation,
      4,
      customDmgNode(
        prod(percent(dm.constellation4.dmg), input.total.atk),
        'burst',
        hitEle[ele]
      )
    ),
  ]),
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
      atk_: lockRallyReaction_selfAtk_,
    },
    teamBuff: {
      premod: {
        normal_dmg_: a4Rally_normal_dmg_,
        charged_dmg_: a4Rally_charged_dmg_,
        plunging_dmg_: a4Rally_plunging_dmg_,
        skill_dmg_: a4Rally_skill_dmg_,
        burst_dmg_: a4Rally_burst_dmg_,
        atk_: lockRallyReaction_teamAtk_,
        atk: c6RallyReaction_atk,
      },
    },
    flags: { isHexerei: lockHomework_hexerei },
  },
  {
    premod: {
      atk_: c2StackAtk_,
    },
  }
)

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
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.4'),
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
          node: infoMut(dmgFormulas.skill.ringDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        ...absorbableEle.map((ele) => ({
          node: infoMut(dmgFormulas.skill[`clang${ele}Dmg`], {
            name: ct.chg('skill.skillParams.1'),
          }),
        })),
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
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.bellDmg, {
            name: ct.chg('burst.skillParams.1'),
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
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

  passive1: ct.talentTem('passive1', [
    ct.fieldsTem('passive1', {
      fields: absorbableEle.map((ele) => ({
        node: infoMut(dmgFormulas.passive1[`${ele}Dmg`], { name: st('dmg') }),
      })),
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4RallyPath,
      value: condA4Rally,
      teamBuff: true,
      name: ct.ch('a4Cond'),
      states: {
        on: {
          fields: [
            {
              node: a4Rally_normal_dmg_,
            },
            {
              node: a4Rally_charged_dmg_,
            },
            {
              node: a4Rally_plunging_dmg_,
            },
            {
              node: a4Rally_skill_dmg_,
            },
            {
              node: a4Rally_burst_dmg_,
            },
            {
              text: stg('duration'),
              value: dm.passive2.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  lockedPassive: ct.talentTem('lockedPassive', [
    ct.condTem('lockedPassive', {
      path: condLockHomeworkPath,
      value: condLockHomework,
      teamBuff: true,
      name: st('hexerei.homeworkDone'),
      states: {
        on: {
          fields: [
            {
              text: st('hexerei.becomeHexerei', {
                val: `$t(charNames_gen:${key})`,
              }),
            },
            {
              text: st('hexerei.talentEnhance'),
            },
          ],
        },
      },
    }),
    ct.condTem('lockedPassive', {
      path: condLockRallyReactionPath,
      value: condLockRallyReaction,
      teamBuff: true,
      canShow: greaterEq(
        tally.hexerei,
        2,
        equal(
          condLockHomework,
          'on',
          greaterEq(input.asc, 4, equal(condA4Rally, 'on', 1))
        )
      ),
      name: ct.ch('lockCond'),
      states: {
        nonSwirl: {
          name: ct.ch('nonSwirl'),
          fields: [
            {
              node: lockRallyReaction_selfAtk_,
            },
            {
              text: stg('duration'),
              value: dm.lockedPassive.selfDuration,
              unit: 's',
            },
          ],
        },
        swirl: {
          name: ct.ch('swirl'),
          fields: [
            {
              node: lockRallyReaction_selfAtk_,
            },
            {
              node: infoMut(lockRallyReaction_teamAtk_disp, {
                path: 'atk_',
                isTeamBuff: true,
              }),
            },
            {
              text: stg('duration'),
              value: dm.lockedPassive.teamDuration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2StackPath,
      value: condC2Stack,
      teamBuff: true,
      name: st('stacks'),
      states: objKeyMap(c2StackArr, (stack) => ({
        name: `${stack}`,
        fields: [
          {
            node: c2StackAtk_,
          },
        ],
      })),
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.fieldsTem('constellation4', {
      fields: absorbableEle.map((ele) => ({
        node: infoMut(dmgFormulas.constellation4[`${ele}Dmg`], {
          name: st('dmg'),
        }),
      })),
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      path: condC6RallyReactionPath,
      value: condC6RallyReaction,
      teamBuff: true,
      name: ct.ch('c6Cond'),
      canShow: greaterEq(input.asc, 4, equal(condA4Rally, 'on', 1)),
      states: {
        on: {
          fields: [
            {
              node: c6RallyReaction_atk,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
