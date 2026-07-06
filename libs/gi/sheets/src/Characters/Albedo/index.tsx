import { range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
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
  tally,
  target,
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

const key: CharacterKey = 'Albedo'
const skillParam_gen = allStats.char.skillParam[key]

const [condLockHomeworkPath, condLockHomework] = cond(key, 'lockHomework')
const lockHomework_hexerei = equal(condLockHomework, 'on', 1)

const ct = charTemplates(key, lockHomework_hexerei)

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
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    dmg2: skillParam_gen.auto[a++], // 2
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    blossomDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    blossomCd: 2,
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    blossomDmg: skillParam_gen.burst[b++],
    blossomAmt: 7,
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hpThresh: skillParam_gen.passive1[0][0] * 100,
    blossomDmg_: skillParam_gen.passive1[1][0],
    isotomaDmgInc: skillParam_gen.passive1[2][0],
  },
  passive2: {
    eleMasInc: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  lockedPassive: {
    teamDmg_: skillParam_gen.lockedPassive![0][0],
    maxTeamDmg_: skillParam_gen.lockedPassive![1][0],
    hexDmg_: skillParam_gen.lockedPassive![2][0],
    maxHexDmg_: skillParam_gen.lockedPassive![3][0],
    teamDuration: skillParam_gen.lockedPassive![4][0],
    hexDuration: skillParam_gen.lockedPassive![5][0],
  },
  constellation1: {
    blossomEner: skillParam_gen.constellation1[0],
    def_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation2: {
    blossomDmgInc: skillParam_gen.constellation2[0],
    maxStacks: 4,
    stackDuration: 30,
    dmg: skillParam_gen.constellation2[1],
    eleMas: 125,
    eleMasDuration: 10,
  },
  constellation4: {
    plunging_dmg_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    plunging_impact_dmg_: skillParam_gen.constellation4[2],
  },
  constellation6: {
    bonus_dmg_: 0.17,
    duration: skillParam_gen.constellation6[0],
    dmgInc: skillParam_gen.constellation6[1],
  },
} as const

const [condBurstUsedPath, condBurstUsed] = cond(key, 'burstUsed')
const p2Burst_eleMas = equal(
  condBurstUsed,
  'burstUsed',
  greaterEq(input.asc, 4, dm.passive2.eleMasInc)
)

const [condP1EnemyHpPath, condP1EnemyHp] = cond(key, 'p1EnemyHp')
const p1_blossom_dmg_ = greaterEq(
  input.asc,
  1,
  equal(condP1EnemyHp, 'belowHp', dm.passive1.blossomDmg_)
)

const [condC2StacksPath, condC2Stacks] = cond(key, 'c2Stacks')
const c2_burst_dmgInc = greaterEq(
  input.constellation,
  2,
  prod(
    lookup(
      condC2Stacks,
      Object.fromEntries(
        range(1, dm.constellation2.maxStacks).map((i) => [
          i,
          prod(i, percent(dm.constellation2.blossomDmgInc)),
        ])
      ),
      naught
    ),
    input.total.def
  )
)

const [condSkillInFieldPath, condSkillInField] = cond(key, 'skillInField')
const c4_plunging_dmg_disp = greaterEq(
  input.constellation,
  4,
  equal(condSkillInField, 'skillInField', dm.constellation4.plunging_dmg_)
)
const c4_plunging_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  c4_plunging_dmg_disp
)

// Maybe we should just have a single conditional for "in field AND crystallize shield"?
// This is technically a nested conditional
const [condC6CrystallizePath, condC6Crystallize] = cond(key, 'c6Crystallize')
const c6_Crystal_all_dmg_disp = greaterEq(
  input.constellation,
  6,
  equal(
    condSkillInField,
    'skillInField',
    equal(condC6Crystallize, 'c6Crystallize', dm.constellation6.bonus_dmg_)
  )
)
const c6_Crystal_all_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  c6_Crystal_all_dmg_disp
)

const [condLockCreateSolarPath, condLockCreateSolar] = cond(
  key,
  'lockCreateSolar'
)
const lockCreateSolar_normal_dmg_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    equal(
      condLockCreateSolar,
      'on',
      min(
        prod(percent(dm.lockedPassive.teamDmg_), input.total.def, 1 / 1000),
        percent(dm.lockedPassive.maxTeamDmg_)
      )
    )
  )
)
const lockCreateSolar_charged_dmg_ = { ...lockCreateSolar_normal_dmg_ }
const lockCreateSolar_plunging_dmg_ = { ...lockCreateSolar_normal_dmg_ }
const lockCreateSolar_skill_dmg_ = { ...lockCreateSolar_normal_dmg_ }
const lockCreateSolar_burst_dmg_ = { ...lockCreateSolar_normal_dmg_ }

const [condLockCreateSilverPath, condLockCreateSilver] = cond(
  key,
  'lockCreateSilver'
)
const lockCreateSilver_normal_dmg_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    equal(
      condLockCreateSilver,
      'on',
      // Hexerei check works even for display since Albedo must also be Hexerei
      equal(
        target.isHexerei,
        1,
        min(
          prod(percent(dm.lockedPassive.hexDmg_), input.total.def, 1 / 1000),
          percent(dm.lockedPassive.maxHexDmg_)
        )
      )
    )
  )
)
const lockCreateSilver_charged_dmg_ = { ...lockCreateSilver_normal_dmg_ }
const lockCreateSilver_plunging_dmg_ = { ...lockCreateSilver_normal_dmg_ }
const lockCreateSilver_skill_dmg_ = { ...lockCreateSilver_normal_dmg_ }
const lockCreateSilver_burst_dmg_ = { ...lockCreateSilver_normal_dmg_ }

const [condA1LockSilverPath, condA1LockSilver] = cond(key, 'a1LockSilver')
const a1LockSilver_blossom_dmgInc = greaterEq(
  input.asc,
  1,
  equal(
    condLockHomework,
    'on',
    greaterEq(
      tally.hexerei,
      2,
      equal(
        condA1LockSilver,
        'on',
        prod(percent(dm.passive1.isotomaDmgInc), input.total.def)
      )
    )
  )
)

const [condC1LockAfterSkillPath, condC1LockAfterSkill] = cond(
  key,
  'c1LockAfterSkill'
)
const c1LockAfterSkill_def_ = greaterEq(
  input.constellation,
  1,
  equal(
    condLockHomework,
    'on',
    equal(condC1LockAfterSkill, 'on', dm.constellation1.def_)
  )
)

const c2LockFatalStacks_eleMas = greaterEq(
  input.constellation,
  2,
  greaterEq(
    input.asc,
    4,
    equal(
      condLockHomework,
      'on',
      equal(condC2Stacks, '4', dm.constellation2.eleMas)
    )
  )
)

const [condC4LockAfterJumpPath, condC4LockAfterJump] = cond(
  key,
  'c4LockAfterJump'
)
const c4LockAfterJump_plunging_impact_dmg_disp = greaterEq(
  input.constellation,
  4,
  equal(
    condLockHomework,
    'on',
    equal(condC4LockAfterJump, 'on', dm.constellation4.plunging_impact_dmg_)
  )
)
const c4LockAfterJump_plunging_impact_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  c4LockAfterJump_plunging_impact_dmg_disp
)

const [condC6LockAfterDestroyPath, condC6LockAfterDestroy] = cond(
  key,
  'c6LockAfterDestroy'
)
const c6LockAfterDestroy_fatal_dmgInc = greaterEq(
  input.constellation,
  6,
  equal(
    condLockHomework,
    'on',
    equal(
      condC6LockAfterDestroy,
      'on',
      prod(percent(dm.constellation6.dmgInc), input.total.def)
    )
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg1: dmgNode('atk', dm.charged.dmg1, 'charged'),
    dmg2: dmgNode('atk', dm.charged.dmg2, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    dmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    blossom: dmgNode('def', dm.skill.blossomDmg, 'skill', {
      premod: {
        skill_dmg_: p1_blossom_dmg_,
        skill_dmgInc: a1LockSilver_blossom_dmgInc,
      },
    }),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.burstDmg, 'burst'),
    blossom: dmgNode('atk', dm.burst.blossomDmg, 'burst', {
      premod: {
        burst_dmgInc: c6LockAfterDestroy_fatal_dmgInc,
      },
    }),
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      equal(
        condLockHomework,
        'on',
        customDmgNode(
          prod(percent(dm.constellation2.dmg), input.total.def),
          'burst'
        )
      )
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  teamBuff: {
    premod: {
      eleMas: sum(p2Burst_eleMas, c2LockFatalStacks_eleMas),
      normal_dmg_: sum(
        lockCreateSolar_normal_dmg_,
        lockCreateSilver_normal_dmg_
      ),
      charged_dmg_: sum(
        lockCreateSolar_charged_dmg_,
        lockCreateSilver_charged_dmg_
      ),
      plunging_dmg_: sum(
        lockCreateSolar_plunging_dmg_,
        lockCreateSilver_plunging_dmg_,
        c4_plunging_dmg_
      ),
      plunging_impact_dmg_: c4LockAfterJump_plunging_impact_dmg_,
      skill_dmg_: sum(lockCreateSolar_skill_dmg_, lockCreateSilver_skill_dmg_),
      burst_dmg_: sum(lockCreateSolar_burst_dmg_, lockCreateSilver_burst_dmg_),
      all_dmg_: c6_Crystal_all_dmg_,
    },
  },
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    burst_dmgInc: c2_burst_dmgInc,
    def_: c1LockAfterSkill_def_,
  },
  isHexerei: lockHomework_hexerei,
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
          node: infoMut(dmgFormulas.skill.blossom, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: ct.ch('blossomCD'),
          value: dm.skill.blossomCd,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.2'),
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
    ct.condTem('passive1', {
      value: condP1EnemyHp,
      path: condP1EnemyHpPath,
      name: st('enemyLessPercentHP', { percent: dm.passive1.hpThresh }),
      states: {
        belowHp: {
          fields: [
            {
              node: infoMut(p1_blossom_dmg_, {
                name: ct.ch('blossomDmg_'),
                unit: '%',
              }),
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation1', {
      fields: [
        {
          text: ct.ch('enerPerBlossom'),
          value: dm.constellation1.blossomEner,
          fixed: 1,
        },
      ],
    }),
    ct.condTem('constellation1', {
      canShow: lockHomework_hexerei,
      path: condC1LockAfterSkillPath,
      value: condC1LockAfterSkill,
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: c1LockAfterSkill_def_,
            },
            {
              text: stg('duration'),
              value: dm.constellation1.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.condTem('constellation4', {
      value: condSkillInField,
      path: condSkillInFieldPath,
      name: st('activeCharField'),
      teamBuff: true,
      states: {
        skillInField: {
          fields: [
            {
              node: infoMut(c4_plunging_dmg_disp, {
                path: 'plunging_dmg_',
                isTeamBuff: true,
              }),
            },
          ],
        },
      },
    }),
    ct.condTem('constellation4', {
      value: condC4LockAfterJump,
      path: condC4LockAfterJumpPath,
      name: ct.ch('c4JumpCond'),
      canShow: lockHomework_hexerei,
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: infoMut(c4LockAfterJump_plunging_impact_dmg_disp, {
                path: 'plunging_impact_dmg_',
                isTeamBuff: true,
              }),
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
    ct.condTem('constellation6', {
      value: condC6Crystallize,
      path: condC6CrystallizePath,
      name: st('protectedByShieldCrystalOrLunar'),
      canShow: equal(condSkillInField, 'skillInField', 1),
      teamBuff: true,
      states: {
        c6Crystallize: {
          fields: [
            {
              node: infoMut(c6_Crystal_all_dmg_disp, { path: 'all_dmg_' }),
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
          node: infoMut(dmgFormulas.burst.dmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.blossom, {
            name: ct.chg(`burst.skillParams.1`),
            multi: dm.burst.blossomAmt,
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
    ct.condTem('passive2', {
      value: condBurstUsed,
      path: condBurstUsedPath,
      name: st('afterUse.burst'),
      teamBuff: true,
      states: {
        burstUsed: {
          fields: [
            {
              node: infoMut(p2Burst_eleMas, {
                path: 'eleMas',
                isTeamBuff: true,
              }),
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
    ct.condTem('constellation2', {
      value: condC2Stacks,
      path: condC2StacksPath,
      teamBuff: true,
      name: ct.ch('c2Stacks'),
      states: Object.fromEntries(
        range(1, dm.constellation2.maxStacks).map((i) => [
          i,
          {
            name: st('stack', { count: i }),
            fields: [
              {
                node: c2_burst_dmgInc,
              },
              {
                node: infoMut(c2LockFatalStacks_eleMas, {
                  path: 'eleMas',
                  isTeamBuff: true,
                }),
              },
            ],
          },
        ])
      ),
    }),
    ct.condTem('constellation6', {
      value: condC6LockAfterDestroy,
      path: condC6LockAfterDestroyPath,
      canShow: lockHomework_hexerei,
      name: ct.ch('c6Cond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c6LockAfterDestroy_fatal_dmgInc, {
                name: ct.ch('fatalBlossom_dmgInc'),
              }),
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

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      canShow: greaterEq(tally.hexerei, 2, lockHomework_hexerei),
      path: condA1LockSilverPath,
      value: condA1LockSilver,
      name: ct.ch('a1LockCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(a1LockSilver_blossom_dmgInc, {
                name: ct.ch('transBlossom_dmgInc'),
              }),
            },
          ],
        },
      },
    }),
  ]),
  passive2: ct.talentTem('passive2'),
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
      canShow: greaterEq(tally.hexerei, 2, lockHomework_hexerei),
      path: condLockCreateSolarPath,
      value: condLockCreateSolar,
      teamBuff: true,
      name: ct.ch('createSolar'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(lockCreateSolar_normal_dmg_, {
                path: 'normal_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lockCreateSolar_charged_dmg_, {
                path: 'charged_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lockCreateSolar_plunging_dmg_, {
                path: 'plunging_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lockCreateSolar_skill_dmg_, {
                path: 'skill_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lockCreateSolar_burst_dmg_, {
                path: 'burst_dmg_',
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
    ct.condTem('lockedPassive', {
      canShow: greaterEq(tally.hexerei, 2, lockHomework_hexerei),
      path: condLockCreateSilverPath,
      value: condLockCreateSilver,
      teamBuff: true,
      name: ct.ch('createSilver'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(lockCreateSilver_normal_dmg_, {
                path: 'normal_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lockCreateSilver_charged_dmg_, {
                path: 'charged_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lockCreateSilver_plunging_dmg_, {
                path: 'plunging_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lockCreateSilver_skill_dmg_, {
                path: 'skill_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lockCreateSilver_burst_dmg_, {
                path: 'burst_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              text: stg('duration'),
              value: dm.lockedPassive.hexDuration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.dmg, { name: st('dmg') }),
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}

export default new CharacterSheet(sheet, data)
