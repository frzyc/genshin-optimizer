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
  naught,
  one,
  percent,
  prod,
  sum,
  tally,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Klee'
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
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    jumptyDumptyDmg1: skillParam_gen.skill[s++],
    jumptyDumptyDmg2: skillParam_gen.skill[s++],
    jumptyDumptyDmg3: skillParam_gen.skill[s++],
    mineDmg: skillParam_gen.skill[s++],
    mineDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    unknown: skillParam_gen.burst[b++], // what is this??
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    charged_dmg_: 0.5,
  },
  lockedPassive: {
    duration: skillParam_gen.lockedPassive![0][0],
    mult: [
      skillParam_gen.lockedPassive![1][0],
      skillParam_gen.lockedPassive![2][0],
      skillParam_gen.lockedPassive![3][0],
    ],
    idk2: skillParam_gen.lockedPassive![4][0],
  },
  constellation1: {
    dmg_: 1.2,
    duration: skillParam_gen.constellation1[0],
    atk_: skillParam_gen.constellation1[1],
  },
  constellation2: {
    enemyDefRed_: 0.23,
  },
  constellation4: {
    dmg: 5.55,
    dmg_: skillParam_gen.constellation4[0],
  },
  constellation6: {
    team_pyro_dmg_: 0.1,
    self_pyro_dmg_: skillParam_gen.constellation6[0],
    chance1: skillParam_gen.constellation6[1],
    chance2: skillParam_gen.constellation6[2],
  },
} as const

const boomCharged_dmg_ = greaterEq(
  input.asc,
  1,
  percent(dm.passive1.charged_dmg_)
)

const [condC2Path, condC2] = cond(key, 'ExplosiveFrags')
const enemyDefRed_ = greaterEq(
  input.constellation,
  2,
  equal('on', condC2, percent(dm.constellation2.enemyDefRed_))
)

const [condC6Path, condC6] = cond(key, 'BlazingDelight')
const team_pyro_dmg_disp = greaterEq(
  input.constellation,
  6,
  equal('on', condC6, percent(dm.constellation6.team_pyro_dmg_))
)
const team_pyro_dmg_ = greaterEq(
  sum(
    equal(condLockHomework, 'on', unequal(target.charKey, key, 1)),
    unequal(condLockHomework, 'on', 1)
  ),
  1,
  team_pyro_dmg_disp
)

const lockBadgeArr = range(1, dm.lockedPassive.mult.length)
const [condLockBadgePath, condLockBadge] = cond(key, 'lockBadge')
const lockBadge_mult_ = sum(
  one,
  equal(
    condLockHomework,
    'on',
    greaterEq(
      tally.hexerei,
      2,
      lookup(
        condLockBadge,
        objKeyMap(lockBadgeArr, (badge) =>
          percent(dm.lockedPassive.mult[badge - 1])
        ),
        naught
      )
    )
  )
)

const [condLockC1Path, condLockC1] = cond(key, 'lockC1')
const lockC1_atk_ = greaterEq(
  input.constellation,
  1,
  equal(condLockHomework, 'on', equal(condLockC1, 'on', dm.constellation1.atk_))
)

const lockC4_dmg_ = greaterEq(
  input.constellation,
  4,
  equal(
    condLockHomework,
    'on',
    equal(input.activeCharKey, key, dm.constellation4.dmg_)
  )
)

const lockC6_pyro_dmg_ = greaterEq(
  input.constellation,
  6,
  equal(
    condC6,
    'on',
    equal(condLockHomework, 'on', dm.constellation6.self_pyro_dmg_)
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    jumptyDumptyDmg: dmgNode('atk', dm.skill.jumptyDumptyDmg1, 'skill'),
    mineDmg: dmgNode('atk', dm.skill.mineDmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  passive1: {
    dmg: greaterEq(
      input.asc,
      1,
      dmgNode(
        'atk',
        dm.charged.dmg,
        'charged',
        {
          premod: {
            charged_dmg_: boomCharged_dmg_,
          },
        },
        lockBadge_mult_
      )
    ),
  },
  constellation1: {
    chainedReactionsDmg: greaterEq(
      input.constellation,
      1,
      dmgNode(
        'atk',
        dm.burst.dmg,
        'burst',
        undefined,
        percent(dm.constellation1.dmg_)
      )
    ),
  },
  constellation4: {
    sparklyExplosionDmg: greaterEq(
      input.constellation,
      4,
      customDmgNode(
        prod(percent(dm.constellation4.dmg), input.total.atk),
        'elemental',
        {
          hit: { ele: constant('pyro') },
          premod: {
            pyro_dmg_: lockC4_dmg_,
          },
        }
      )
    ),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: nodeC3,
    burstBoost: nodeC5,
    atk_: lockC1_atk_,
    pyro_dmg_: lockC6_pyro_dmg_,
  },
  teamBuff: {
    premod: {
      pyro_dmg_: team_pyro_dmg_,
      enemyDefRed_,
    },
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
          node: infoMut(dmgFormulas.charged.dmg, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.4'),
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
          node: infoMut(dmgFormulas.skill.jumptyDumptyDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.mineDmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: `${dm.skill.mineDuration}`,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.3'),
          value: `${dm.skill.cd}`,
          unit: 's',
        },
        {
          text: st('charges'),
          value: 2,
        },
      ],
    },
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
          text: ct.chg('burst.skillParams.1'),
          value: `${dm.burst.duration}`,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.2'),
          value: `${dm.burst.cd}`,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.3'),
          value: `${dm.burst.enerCost}`,
        },
      ],
    },
  ]),

  passive1: ct.talentTem('passive1', [
    ct.fieldsTem('passive1', {
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.dmg, { name: ct.ch('boomDmg') }),
        },
        {
          text: ct.ch('boomStam'),
          value: 0,
        },
        {
          node: infoMut(boomCharged_dmg_, { name: ct.ch('boom_dmg_') }),
        },
      ],
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
      path: condLockBadgePath,
      value: condLockBadge,
      name: ct.ch('lockedCond'),
      canShow: greaterEq(tally.hexerei, 2, lockHomework_hexerei),
      states: objKeyMap(lockBadgeArr, (badge) => ({
        name: `${badge}`,
        fields: [
          {
            node: infoMut(lockBadge_mult_, { name: ct.ch('boom_mult_') }),
          },
        ],
      })),
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.chainedReactionsDmg, {
            name: st(`dmg`),
          }),
        },
      ],
    }),
    ct.condTem('constellation1', {
      path: condLockC1Path,
      value: condLockC1,
      teamBuff: true,
      name: ct.ch('c1Cond'),
      canShow: lockHomework_hexerei,
      states: {
        on: {
          fields: [
            {
              node: lockC1_atk_,
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
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      value: condC2,
      path: condC2Path,
      teamBuff: true,
      name: ct.ch('c2CondName'),
      canShow: unequal(condLockHomework, 'on', 1),
      states: {
        on: {
          fields: [
            {
              node: enemyDefRed_,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.condTem('constellation2', {
      value: condC2,
      path: condC2Path,
      teamBuff: true,
      name: st('hitOp.skill'),
      canShow: lockHomework_hexerei,
      states: {
        on: {
          fields: [
            {
              node: enemyDefRed_,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.fieldsTem('constellation4', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation4.sparklyExplosionDmg, {
            name: st(`dmg`),
          }),
        },
        {
          node: infoMut(lockC4_dmg_, { path: 'all_dmg_' }),
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: nodeC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      value: condC6,
      path: condC6Path,
      teamBuff: true,
      name: ct.ch('c6CondName'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(team_pyro_dmg_disp, {
                path: 'pyro_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: lockC6_pyro_dmg_,
            },
            {
              text: stg('duration'),
              value: 25,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
}

export default new CharacterSheet(sheet, data)
