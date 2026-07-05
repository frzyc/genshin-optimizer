import { objKeyValMap } from '@genshin-optimizer/common/util'
import { type CharacterKey, allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  active,
  equal,
  greaterEq,
  inactive1,
  inactive2,
  inactive3,
  infoMut,
  input,
  min,
  percent,
  prod,
  subscript,
  tally,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { any, cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
  shieldElement,
  shieldNodeTalent,
} from '../dataUtil'

const key: CharacterKey = 'Nicole'
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
    skillDmg: skillParam_gen.skill[s++],
    shieldMult: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    atkRatio: skillParam_gen.skill[s++],
    maxAtk: skillParam_gen.skill[s++],
    graceDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    projectionDmg: skillParam_gen.burst[b++],
    projectionCount: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    fieldTime: skillParam_gen.passive1[1][0],
    atk: skillParam_gen.passive1[2][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
  },
  passive3: {
    cd: skillParam_gen.passive3![0][0],
  },
  lockedPassive: {
    projection_dmgInc: skillParam_gen.lockedPassive![0][0],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    atk: skillParam_gen.constellation2[0],
    ele_enemyRes_: -skillParam_gen.constellation2[1],
  },
  constellation4: {
    duration: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
    dmgInc: skillParam_gen.constellation4[2],
    triggerQuota: skillParam_gen.constellation4[3],
  },
  constellation6: {
    enemyDefIgn_: skillParam_gen.constellation6[0],
  },
} as const

const [condLockHomeworkPath, condLockHomework] = cond(key, 'lockHomework')
const lockHomework_hexerei = equal(condLockHomework, 'on', 1)

const skillShield = shieldNodeTalent(
  'atk',
  dm.skill.shieldMult,
  dm.skill.shieldFlat,
  'skill'
)

const [condSkillGraceActivePath, condSkillGraceActive] = cond(
  key,
  'skillGraceActive'
)
const skillGraceActive_atk = equal(
  condSkillGraceActive,
  'on',
  min(
    prod(
      subscript(input.total.skillIndex, dm.skill.atkRatio, { unit: '%' }),
      input.premod.atk
    ),
    subscript(input.total.skillIndex, dm.skill.maxAtk)
  )
)

const [condA1GuidanceActivePath, condA1GuidanceActive] = cond(
  key,
  'a1GuidanceActive'
)
const [condA4NicoleGuidancePath, condA4NicoleGuidance] = cond(
  key,
  'a4NicoleGuidance'
)
const a1GuidanceActive_atkDisp = greaterEq(
  input.asc,
  1,
  equal(
    condSkillGraceActive,
    'on',
    equal(condA1GuidanceActive, 'on', dm.passive1.atk)
  )
)
const a1GuidanceActive_atk = any(
  a1GuidanceActive_atkDisp,
  equal(
    active.charKey,
    target.charKey,
    any(
      1,
      unequal(condA4NicoleGuidance, 'on', 1),
      equal(condA4NicoleGuidance, 'on', unequal(target.charKey, key, 1))
    )
  ),
  greaterEq(
    input.constellation,
    6,
    any(1, equal(condA4NicoleGuidance, 'on', 1), equal(active.charKey, key, 1))
  )
)

const a4NicoleGuidanceActive_atk = greaterEq(
  input.asc,
  4,
  equal(
    condSkillGraceActive,
    'on',
    equal(condA4NicoleGuidance, 'on', dm.passive1.atk)
  )
)

const c2GraceActive_atk = greaterEq(
  input.constellation,
  2,
  equal(condSkillGraceActive, 'on', dm.constellation2.atk)
)
// TODO: To properly support C6, we should make Guidance be a per-char toggle somehow. Just applying it team-wide now as a simple solution
const c2GuidanceActive_eleRes_obj = objKeyValMap(
  allElementKeys,
  (ele) =>
    [
      `${ele}_enemyRes_`,
      greaterEq(
        input.constellation,
        2,
        equal(
          condSkillGraceActive,
          'on',
          any(
            dm.constellation2.ele_enemyRes_,
            equal(condA1GuidanceActive, 'on', equal(active.charEle, ele, 1)),
            greaterEq(
              input.constellation,
              6,
              equal(
                condA4NicoleGuidance,
                'on',
                any(
                  1,
                  equal(inactive1.charEle, ele, 1),
                  equal(inactive2.charEle, ele, 1),
                  equal(inactive3.charEle, ele, 1)
                )
              )
            ),
            equal(condA4NicoleGuidance, 'on', equal(ele, 'pyro', 1))
          )
        )
      ),
    ] as const
)

const [condC4PathfinderPath, condC4Pathfinder] = cond(key, 'c4Pathfinder')
const c4Pathfinder_normal_dmgInc = greaterEq(
  input.constellation,
  4,
  equal(
    condC4Pathfinder,
    'on',
    prod(percent(dm.constellation4.dmgInc), input.total.atk)
  )
)
const c4Pathfinder_charged_dmgInc = { ...c4Pathfinder_normal_dmgInc }
const c4Pathfinder_plunging_dmgInc = { ...c4Pathfinder_normal_dmgInc }
const c4Pathfinder_skill_dmgInc = { ...c4Pathfinder_normal_dmgInc }
const c4Pathfinder_burst_dmgInc = { ...c4Pathfinder_normal_dmgInc }

const c6Guidance_enemyDefIgn_disp = greaterEq(
  input.constellation,
  6,
  equal(
    condSkillGraceActive,
    'on',
    any(
      dm.constellation6.enemyDefIgn_,
      equal(condA1GuidanceActive, 'on', 1),
      equal(condA4NicoleGuidance, 'on', 1)
    )
  )
)
const c6Guidance_enemyDefIgn_ = any(
  c6Guidance_enemyDefIgn_disp,
  equal(condA1GuidanceActive, 'on', equal(active.charKey, target.charKey, 1)),
  equal(condA4NicoleGuidance, 'on', 1)
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
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    shield: skillShield,
    shieldPyro: shieldElement('pyro', skillShield),
    skillGraceActive_atk,
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    // Projection DMG is handled on each individual character in dataUtil.tsx
  },
  lockedPassive: {
    projectionDmgInc: equal(
      condLockHomework,
      'on',
      greaterEq(
        tally.hexerei,
        2,
        prod(percent(dm.lockedPassive.projection_dmgInc), input.total.atk)
      )
    ),
  },
  // Constellation 1 Projection DMG is handled same as above
  constellation4: {
    c4Pathfinder_normal_dmgInc,
    c4Pathfinder_charged_dmgInc,
    c4Pathfinder_plunging_dmgInc,
    c4Pathfinder_skill_dmgInc,
    c4Pathfinder_burst_dmgInc,
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC3,
      burstBoost: burstC5,
    },
    total: {
      atk: a4NicoleGuidanceActive_atk,
    },
    teamBuff: {
      premod: {
        ...c2GuidanceActive_eleRes_obj,
        normal_dmgInc: c4Pathfinder_normal_dmgInc,
        charged_dmgInc: c4Pathfinder_charged_dmgInc,
        plunging_dmgInc: c4Pathfinder_plunging_dmgInc,
        skill_dmgInc: c4Pathfinder_skill_dmgInc,
        burst_dmgInc: c4Pathfinder_burst_dmgInc,
        enemyDefIgn_: c6Guidance_enemyDefIgn_,
      },
      total: {
        atk: skillGraceActive_atk,
      },
    },
    flags: { hexerei: lockHomework_hexerei },
  },
  {
    teamBuff: {
      total: {
        atk: a1GuidanceActive_atk,
      },
    },
  },
  {
    teamBuff: {
      total: {
        atk: c2GraceActive_atk,
      },
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
          node: infoMut(dmgFormulas.skill.skillDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shield, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shieldPyro, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.shieldDuration,
          unit: 's',
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('skill', {
      path: condSkillGraceActivePath,
      value: condSkillGraceActive,
      teamBuff: true,
      name: ct.ch('skillCond'),
      states: {
        on: {
          fields: [
            {
              node: skillGraceActive_atk,
            },
            {
              node: c2GraceActive_atk,
            },
            {
              text: ct.chg('skill.skillParams.5'),
              value: dm.skill.graceDuration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.headerTem('skill', {
      teamBuff: true,
      canShow: any(
        1,
        equal(condA1GuidanceActive, 'on', 1),
        equal(condA4NicoleGuidance, 'on', 1)
      ),
      fields: [
        {
          node: a4NicoleGuidanceActive_atk,
        },
        {
          node: infoMut(a1GuidanceActive_atkDisp, {
            path: 'atk',
            isTeamBuff: true,
          }),
        },
        ...Object.values(c2GuidanceActive_eleRes_obj).map((node) => ({
          node,
        })),
        {
          node: c6Guidance_enemyDefIgn_,
        },
      ],
    }),
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
          text: ct.chg('burst.skillParams.1'),
          value: ct.ch('projectionExplain'),
        },
        {
          text: ct.chg('burst.skillParams.3'),
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
    ct.condTem('passive1', {
      path: condA1GuidanceActivePath,
      value: condA1GuidanceActive,
      canShow: equal(condSkillGraceActive, 'on', 1),
      teamBuff: true,
      name: ct.ch('guidanceCond'),
      states: {
        on: {
          fields: [
            {
              text: ct.ch('guidance'),
            },
          ],
        },
      },
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4NicoleGuidancePath,
      value: condA4NicoleGuidance,
      canShow: equal(condSkillGraceActive, 'on', 1),
      teamBuff: true,
      name: ct.ch('nicoleGuidanceCond'),
      states: {
        on: {
          fields: [
            {
              text: ct.ch('nicoleGuidance'),
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
            {
              node: infoMut(dmgFormulas.lockedPassive.projectionDmgInc, {
                name: ct.ch('projection_dmgInc'),
              }),
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          text: ct.ch('arcaneProjectionDmg'),
          value: ct.ch('projectionExplain'),
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.headerTem('constellation2', {
      teamBuff: true,
      fields: [
        {
          text: ct.ch('graceEnhanced'),
        },
        {
          text: ct.ch('guidanceEnhanced'),
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      path: condC4PathfinderPath,
      value: condC4Pathfinder,
      teamBuff: true,
      name: ct.ch('c4Cond'),
      states: {
        on: {
          fields: [
            {
              node: c4Pathfinder_normal_dmgInc,
            },
            {
              node: c4Pathfinder_charged_dmgInc,
            },
            {
              node: c4Pathfinder_plunging_dmgInc,
            },
            {
              node: c4Pathfinder_skill_dmgInc,
            },
            {
              node: c4Pathfinder_burst_dmgInc,
            },
            {
              text: st('triggerQuota'),
              value: dm.constellation4.triggerQuota,
            },
            {
              text: stg('duration'),
              value: dm.constellation4.duration,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: dm.constellation4.cd,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.headerTem('constellation6', {
      teamBuff: true,
      fields: [
        {
          text: ct.ch('guidanceEnhanced'),
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
