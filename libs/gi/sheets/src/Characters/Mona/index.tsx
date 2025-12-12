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
  subscript,
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
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Mona'
const skillParam_gen = allStats.char.skillParam[key]

const [condLockHomeworkPath, condLockHomework] = cond(key, 'lockHomework')
const lockHomework_hexerei = equal(condLockHomework, 'on', 1)

const ct = charTemplates(key, lockHomework_hexerei)

let a = 0,
  s = 0,
  b = 0,
  sp = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
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
    dot: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    bubbleDuration: skillParam_gen.burst[b++][0],
    dmg: skillParam_gen.burst[b++],
    dmgBonusNeg: skillParam_gen.burst[b++],
    omenDuration: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    dmgBonus: skillParam_gen.burst[b++],
  },
  sprint: {
    active_stam: skillParam_gen?.sprint?.[sp++]?.[0],
    drain_stam: skillParam_gen?.sprint?.[sp++]?.[0],
  },
  passive1: {
    torrentDuration: skillParam_gen.passive1[p1++][0],
    phantomDuration: skillParam_gen.passive1[p1++][0],
    percentage: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    unknown: skillParam_gen.passive2[p2++][0], // what is this?
    percentage: skillParam_gen.passive2[p2++][0],
  },
  lockedPassive: {
    duration: skillParam_gen.lockedPassive![0][0],
    maxStacks: skillParam_gen.lockedPassive![1][0],
    vaporize_dmg_: skillParam_gen.lockedPassive![2][0],
    omenExt: skillParam_gen.lockedPassive![3][0],
    maxExtTimes: skillParam_gen.lockedPassive![4][0],
    extCd: skillParam_gen.lockedPassive![5][0],
  },
  constellation1: {
    electrocharged_dmg_: skillParam_gen.constellation1[0],
    vaporize_dmg_: skillParam_gen.constellation1[1],
    hydro_swirl_dmg_: skillParam_gen.constellation1[2],
    frozenExtension: skillParam_gen.constellation1[3],
    unknown: skillParam_gen.constellation1[4], // what is this?
    duration: skillParam_gen.constellation1[5],
    bonusEffect: skillParam_gen.constellation1[6],
    another15: skillParam_gen.constellation1[7],
  },
  constellation2: {
    caChance: skillParam_gen.constellation2[0],
    unknown1: skillParam_gen.constellation2[1],
    extraCaDur: skillParam_gen.constellation2[2],
    extraCaCd: skillParam_gen.constellation2[3],
    eleMas: skillParam_gen.constellation2[4],
    eleMasDuration: skillParam_gen.constellation2[5],
  },
  constellation4: {
    critRateInc: Math.abs(skillParam_gen.constellation4[0]), // why do they even keep this as a negative??
    hexCritDMG_: skillParam_gen.constellation4[1],
  },
  constellation6: {
    unknown: skillParam_gen.constellation6[0], // what is this?
    dmgBonus: skillParam_gen.constellation6[1],
    maxDmgBonus: skillParam_gen.constellation6[2],
    duration: skillParam_gen.constellation6[3],
    addlCaMult: skillParam_gen.constellation6[4],
  },
} as const

const [condOmenPath, condOmen] = cond(key, 'Omen')
const all_dmg_ = equal(
  'on',
  condOmen,
  subscript(input.total.burstIndex, dm.burst.dmgBonus, { unit: '%' })
)

const [condPoSPath, condPoS] = cond(key, 'ProphecyOfSubmersion')
const electrocharged_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condPoS, percent(dm.constellation1.electrocharged_dmg_))
)
const lunarcharged_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condPoS, percent(dm.constellation1.electrocharged_dmg_))
)
const swirl_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condPoS, percent(dm.constellation1.hydro_swirl_dmg_))
)
const vaporize_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condPoS, percent(dm.constellation1.vaporize_dmg_))
)

const critRate_ = greaterEq(
  input.constellation,
  4,
  equal(condOmen, 'on', percent(dm.constellation4.critRateInc))
)

const [condRoCPath, condRoC] = cond(key, 'RhetoricsOfCalamitas')
const charged_dmg_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condRoC,
    objKeyMap(range(1, 3), (i) => percent(i * dm.constellation6.dmgBonus)),
    0
  )
)

const [condLockStacksPath, condLockStacks] = cond(key, 'lockStacks')
const lockStacksArr = range(1, dm.lockedPassive.maxStacks)
const lockStacks = lookup(
  condLockStacks,
  objKeyMap(lockStacksArr, (stack) => constant(stack)),
  naught
)
const lockStacks_vaporize_dmg_disp = equal(
  condLockHomework,
  'on',
  greaterEq(
    tally.hexerei,
    2,
    prod(percent(dm.lockedPassive.vaporize_dmg_), lockStacks)
  )
)
const lockStacks_vaporize_dmg_ = unequal(
  target.charKey,
  key,
  lockStacks_vaporize_dmg_disp
)

const lockC1_electrocharged_dmg_disp = greaterEq(
  input.constellation,
  1,
  equal(
    condLockHomework,
    'on',
    equal(
      condPoS,
      'on',
      dm.constellation1.electrocharged_dmg_ * dm.constellation1.bonusEffect
    )
  )
)
const lockC1_electrocharged_dmg_ = unequal(
  input.activeCharKey,
  target.charKey,
  lockC1_electrocharged_dmg_disp
)

const lockC1_lunarcharged_dmg_disp = greaterEq(
  input.constellation,
  1,
  equal(
    condLockHomework,
    'on',
    equal(
      condPoS,
      'on',
      dm.constellation1.electrocharged_dmg_ * dm.constellation1.bonusEffect
    )
  )
)
const lockC1_lunarcharged_dmg_ = unequal(
  input.activeCharKey,
  target.charKey,
  lockC1_lunarcharged_dmg_disp
)

const lockC1_vaporize_dmg_disp = greaterEq(
  input.constellation,
  1,
  equal(
    condLockHomework,
    'on',
    equal(
      condPoS,
      'on',
      dm.constellation1.vaporize_dmg_ * dm.constellation1.bonusEffect
    )
  )
)
const lockC1_vaporize_dmg_ = unequal(
  input.activeCharKey,
  target.charKey,
  lockC1_vaporize_dmg_disp
)

const lockC1_hydro_swirl_dmg_disp = greaterEq(
  input.constellation,
  1,
  equal(
    condLockHomework,
    'on',
    equal(
      condPoS,
      'on',
      dm.constellation1.hydro_swirl_dmg_ * dm.constellation1.bonusEffect
    )
  )
)
const lockC1_hydro_swirl_dmg_ = unequal(
  input.activeCharKey,
  target.charKey,
  lockC1_hydro_swirl_dmg_disp
)

const [condLockC2Chargedpath, condLockC2Charged] = cond(key, 'lockC2Charged')
const lockC2Charged_eleMas = greaterEq(
  input.constellation,
  2,
  equal(
    condLockHomework,
    'on',
    equal(condLockC2Charged, 'on', dm.constellation2.eleMas)
  )
)

const lockC4OmenHex_critDMG_disp = greaterEq(
  input.constellation,
  4,
  equal(
    condLockHomework,
    'on',
    equal(condOmen, 'on', dm.constellation4.hexCritDMG_)
  )
)
const lockC4OmenHex_critDMG_ = equal(
  target.isHexerei,
  1,
  lockC4OmenHex_critDMG_disp
)

const lockC6Omen_charged_mult_ = sum(
  one,
  greaterEq(
    input.constellation,
    6,
    equal(
      condOmen,
      'on',
      equal(condLockHomework, 'on', percent(dm.constellation6.addlCaMult))
    )
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode(
      'atk',
      dm.charged.dmg,
      'charged',
      undefined,
      lockC6Omen_charged_mult_
    ),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    dot: dmgNode('atk', dm.skill.dot, 'skill'),
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  passive1: {
    dmg: greaterEq(
      input.asc,
      1,
      prod(
        dmgNode('atk', dm.skill.dmg, 'skill'),
        percent(dm.passive1.percentage)
      )
    ),
  },
  passive2: {
    hydro_dmg_: greaterEq(
      input.asc,
      4,
      prod(input.premod.enerRech_, percent(dm.passive2.percentage))
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: nodeC5,
    burstBoost: nodeC3,
    charged_dmg_,
    hydro_dmg_: dmgFormulas.passive2.hydro_dmg_,
  },
  teamBuff: {
    premod: {
      all_dmg_,
      electrocharged_dmg_: sum(electrocharged_dmg_, lockC1_electrocharged_dmg_),
      lunarcharged_dmg_: sum(lunarcharged_dmg_, lockC1_lunarcharged_dmg_),
      swirl_dmg_: sum(swirl_dmg_, lockC1_hydro_swirl_dmg_),
      vaporize_dmg_: sum(
        vaporize_dmg_,
        lockStacks_vaporize_dmg_,
        lockC1_vaporize_dmg_
      ),
      critRate_,
      eleMas: lockC2Charged_eleMas,
      critDMG_: lockC4OmenHex_critDMG_,
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
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.5'),
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
          node: infoMut(dmgFormulas.skill.dot, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.dmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
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
          text: ct.chg('burst.skillParams.0'),
          value: dm.burst.bubbleDuration,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.burst.dmg, {
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
    ct.condTem('burst', {
      value: condOmen,
      path: condOmenPath,
      teamBuff: true,
      name: ct.ch('omen'),
      states: {
        on: {
          fields: [
            {
              node: all_dmg_,
            },
            {
              text: stg('duration'),
              value: (data) =>
                dm.burst.omenDuration[data.get(input.total.burstIndex).value],
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation4', {
      canShow: equal(condOmen, 'on', 1),
      teamBuff: true,
      fields: [
        {
          node: critRate_,
        },
        {
          node: infoMut(lockC4OmenHex_critDMG_, {
            path: 'critDMG_',
            isTeamBuff: true,
          }),
        },
      ],
    }),
    ct.headerTem('constellation6', {
      canShow: equal(condOmen, 'on', lockHomework_hexerei),
      fields: [
        {
          node: infoMut(lockC6Omen_charged_mult_, { name: ct.ch('ca_mult_') }),
        },
      ],
    }),
  ]),

  sprint: ct.talentTem('sprint', [
    {
      fields: [
        {
          text: st('activationStam'),
          value: dm.sprint.active_stam,
        },
        {
          text: st('stamDrain'),
          value: dm.sprint.drain_stam,
          unit: '/s',
        },
      ],
    },
  ]),

  passive1: ct.talentTem('passive1', [
    ct.fieldsTem('passive1', {
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.dmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: stg('duration'),
          value: dm.passive1.phantomDuration,
          unit: 's',
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.fieldsTem('passive2', {
      fields: [
        {
          node: dmgFormulas.passive2.hydro_dmg_,
        },
      ],
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
      path: condLockStacksPath,
      value: condLockStacks,
      teamBuff: true,
      canShow: greaterEq(tally.hexerei, 2, lockHomework_hexerei),
      name: ct.ch('lockStacksCond'),
      states: objKeyMap(lockStacksArr, (stack) => ({
        name: `${stack}`,
        fields: [
          {
            node: infoMut(lockStacks_vaporize_dmg_disp, {
              path: 'vaporize_dmg_',
              isTeamBuff: true,
            }),
          },
          {
            text: stg('duration'),
            value: dm.lockedPassive.duration,
            unit: 's',
          },
        ],
      })),
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      value: condPoS,
      path: condPoSPath,
      teamBuff: true,
      name: ct.ch('hitOp.affectedByOmen'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(electrocharged_dmg_, {
                path: 'electrocharged_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lunarcharged_dmg_, {
                path: 'lunarcharged_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(swirl_dmg_, {
                path: 'swirl_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(vaporize_dmg_, {
                path: 'vaporize_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(percent(dm.constellation1.frozenExtension), {
                name: ct.ch('frozenDuration'),
                isTeamBuff: true,
              }),
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
    ct.headerTem('constellation1', {
      canShow: equal(condPoS, 'on', lockHomework_hexerei),
      teamBuff: true,
      fields: [
        {
          node: infoMut(lockC1_electrocharged_dmg_disp, {
            path: 'electrocharged_dmg_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(lockC1_lunarcharged_dmg_disp, {
            path: 'lunarcharged_dmg_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(lockC1_hydro_swirl_dmg_disp, {
            path: 'swirl_dmg_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(lockC1_vaporize_dmg_disp, {
            path: 'vaporize_dmg_',
            isTeamBuff: true,
          }),
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condLockC2Chargedpath,
      value: condLockC2Charged,
      teamBuff: true,
      canShow: lockHomework_hexerei,
      name: st('hitOp.charged'),
      states: {
        on: {
          fields: [
            {
              node: lockC2Charged_eleMas,
            },
            {
              text: stg('duration'),
              value: dm.constellation2.eleMasDuration,
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
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: nodeC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      value: condRoC,
      path: condRoCPath,
      name: ct.ch('uponSprint'),
      states: Object.fromEntries(
        range(1, 3).map((i) => [
          i,
          {
            name: st('seconds', { count: i }),
            fields: [
              { node: charged_dmg_ },
              {
                text: stg('duration'),
                value: dm.constellation6.duration,
                unit: 's',
              },
            ],
          },
        ])
      ),
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
