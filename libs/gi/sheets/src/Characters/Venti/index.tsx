import { ColorText } from '@genshin-optimizer/common/ui'
import { absorbableEle } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import {
  compareEq,
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
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

import { objKeyMap } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'

const key: CharacterKey = 'Venti'
const elementKey: ElementKey = 'anemo'
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
      skillParam_gen.auto[a++], // 1x2
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
    ],
    windsunder_mult_: skillParam_gen.auto[11],
  },
  charged: {
    aimed: skillParam_gen.auto[a++], // Aimed
    fully: skillParam_gen.auto[a++], // Fully-charged
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    pressCD: skillParam_gen.skill[s++][0],
    holdDmg: skillParam_gen.skill[s++],
    holdCD: skillParam_gen.skill[s++][0],
  },
  burst: {
    baseDmg: skillParam_gen.burst[b++],
    baseTicks: 20,
    absorbDmg: skillParam_gen.burst[b++],
    absorbTicks: 15,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
  },
  // No real p3/constellation dm values :(
  passive3: {
    stam_: 0.2,
  },
  lockedPassive: {
    dmg_: skillParam_gen.lockedPassive![0][0],
    burst_mult_: skillParam_gen.lockedPassive![1][0],
    duration: skillParam_gen.lockedPassive![2][0],
  },
  constellation1: {
    dmgRatio: 0.33,
    windsunder_mult_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    res_: -0.12,
    duration: 10,
    resetChance: skillParam_gen.constellation2[0],
    skill_mult_: skillParam_gen.constellation2[1],
    extraSkillDuration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    anemo_dmg_: 0.25,
    duration: 10,
  },
  constellation6: {
    res_: -0.2,
    duration: 10, // From KQM
    critDMG_: skillParam_gen.constellation6[0],
  },
} as const

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
const p3_staminaGlidingDec_ = constant(dm.passive3.stam_)

const [condBurstAbsorptionPath, condBurstAbsorption] = cond(
  key,
  'burstAbsorption'
)

const [condC2Path, condC2] = cond(key, 'c2')
const c2Hit_anemo_enemyRes_ = greaterEq(
  input.constellation,
  2,
  lookup(
    condC2,
    {
      hit: compareEq(
        condLockHomework,
        'on',
        dm.constellation2.res_ * 2,
        dm.constellation2.res_
      ),
      launched: prod(dm.constellation2.res_, 2),
    },
    naught
  )
)
const c2Hit_phys_enemyRes__ = { ...c2Hit_anemo_enemyRes_ }

const [condC4Path, condC4] = cond(key, 'c4')
const c4_anemo_dmg_ = greaterEq(
  input.constellation,
  4,
  unequal(
    condLockHomework,
    'on',
    equal(condC4, 'pickup', dm.constellation4.anemo_dmg_)
  )
)

const [condC6Path, condC6] = cond(key, 'c6')
const c6_anemo_enemyRes_ = greaterEq(
  input.constellation,
  6,
  equal(condC6, 'takeDmg', dm.constellation6.res_)
)
const c6_ele_enemyRes_arr = Object.fromEntries(
  absorbableEle.map((ele) => [
    `${ele}_enemyRes_`,
    greaterEq(
      input.constellation,
      6,
      equal(
        condC6,
        'takeDmg',
        equal(ele, condBurstAbsorption, dm.constellation6.res_)
      )
    ),
  ])
)

const [condLockBurstSwirlPath, condLockBurstSwirl] = cond(key, 'lockBurstSwirl')
const lockBurstSwirl_all_dmg_disp = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    equal(condLockBurstSwirl, 'on', dm.lockedPassive.dmg_)
  )
)
const lockBurstSwirl_all_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  lockBurstSwirl_all_dmg_disp
)
const lockBurstSwirl_burst_mult_ = sum(
  one,
  greaterEq(
    tally.hexerei,
    2,
    equal(
      condLockHomework,
      'on',
      equal(condLockBurstSwirl, 'on', percent(dm.lockedPassive.burst_mult_ - 1))
    )
  )
)

const [condLockC4SkillBurstPath, condLockC4SkillBurst] = cond(
  key,
  'lockC4SkillBurst'
)
const lockC4SkillBurst_anemo_dmg_self = greaterEq(
  input.constellation,
  4,
  equal(
    condLockHomework,
    'on',
    equal(condLockC4SkillBurst, 'on', dm.constellation4.anemo_dmg_)
  )
)
const lockC4SkillBurst_anemo_dmg_activeDisp = greaterEq(
  input.constellation,
  4,
  equal(
    condLockHomework,
    'on',
    equal(condLockC4SkillBurst, 'on', dm.constellation4.anemo_dmg_)
  )
)
const lockC4SkillBurst_anemo_dmg_active = equal(
  input.activeCharKey,
  target.charKey,
  unequal(target.charKey, key, lockC4SkillBurst_anemo_dmg_activeDisp)
)

const lockC6_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(
    condLockHomework,
    'on',
    equal(condC6, 'takeDmg', dm.constellation6.critDMG_)
  )
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [
        `hex${i}`,
        greaterEq(
          tally.hexerei,
          2,
          equal(
            condLockHomework,
            'on',
            dmgNode(
              'atk',
              arr,
              'normal',
              { hit: { ele: constant('anemo') } },
              subscript(input.total.autoIndex, dm.normal.windsunder_mult_, {
                unit: '%',
              })
            )
          )
        ),
      ])
    ),
  },
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    fully: dmgNode('atk', dm.charged.fully, 'charged', {
      hit: { ele: constant(elementKey) },
    }),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    press: dmgNode('atk', dm.skill.pressDmg, 'skill'),
    hold: dmgNode('atk', dm.skill.holdDmg, 'skill'),
  },
  burst: {
    base: dmgNode(
      'atk',
      dm.burst.baseDmg,
      'burst',
      undefined,
      lockBurstSwirl_burst_mult_
    ),
    absorb: unequal(
      condBurstAbsorption,
      undefined,
      dmgNode(
        'atk',
        dm.burst.absorbDmg,
        'burst',
        {
          hit: { ele: condBurstAbsorption },
        },
        lockBurstSwirl_burst_mult_
      )
    ),
  },
  constellation1: {
    aimed: greaterEq(
      input.constellation,
      1,
      customDmgNode(
        prod(
          percent(dm.constellation1.dmgRatio),
          subscript(input.total.autoIndex, dm.charged.aimed, { unit: '%' }),
          input.total.atk
        ),
        'charged'
      )
    ),
    fully: greaterEq(
      input.constellation,
      1,
      customDmgNode(
        prod(
          percent(dm.constellation1.dmgRatio),
          subscript(input.total.autoIndex, dm.charged.fully, { unit: '%' }),
          input.total.atk
        ),
        'charged',
        { hit: { ele: constant(elementKey) } }
      )
    ),
    ...objKeyMap(
      dm.normal.hitArr.map((_arr, i) => `hex${i}` as const),
      (_k, i) =>
        greaterEq(
          tally.hexerei,
          2,
          equal(
            condLockHomework,
            'on',
            dmgNode(
              'atk',
              dm.normal.hitArr[i],
              'normal',
              { hit: { ele: constant('anemo') } },
              prod(
                subscript(input.total.autoIndex, dm.normal.windsunder_mult_, {
                  unit: '%',
                }),
                percent(dm.constellation1.windsunder_mult_)
              )
            )
          )
        )
    ),
  } as Record<'aimed' | 'fully' | `hex${number}`, NumNode>,
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      equal(
        condLockHomework,
        'on',
        dmgNode(
          'atk',
          dm.skill.pressDmg,
          'skill',
          undefined,
          percent(dm.constellation2.skill_mult_)
        )
      )
    ),
  },
}

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: nodeC3,
    skillBoost: nodeC5,
    anemo_dmg_: sum(c4_anemo_dmg_, lockC4SkillBurst_anemo_dmg_self),
    staminaGlidingDec_: p3_staminaGlidingDec_,
    critDMG_: lockC6_critDMG_,
  },
  teamBuff: {
    premod: {
      anemo_enemyRes_: sum(c2Hit_anemo_enemyRes_, c6_anemo_enemyRes_),
      physical_enemyRes_: c2Hit_phys_enemyRes__,
      ...c6_ele_enemyRes_arr,
      all_dmg_: lockBurstSwirl_all_dmg_,
      anemo_dmg_: lockC4SkillBurst_anemo_dmg_active,
    },
  },
  isHexerei: lockHomework_hexerei,
})

const sheet: TalentSheet = {
  auto: ct.talentTem('auto', [
    {
      canShow: unequal(condLockHomework, 'on', 1),
      text: ct.chg('auto.fields.normal'),
    },
    {
      canShow: lockHomework_hexerei,
      text: ct.chg('auto.upgradedFields.normal'),
    },
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i}`),
          multi: i === 0 || i === 3 ? 2 : undefined,
        }),
      })),
    },
    {
      canShow: unequal(condLockHomework, 'on', 1),
      text: ct.chg('auto.fields.charged'),
    },
    {
      canShow: lockHomework_hexerei,
      text: ct.chg('auto.upgradedFields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.aimed, {
            name: ct.chg(`auto.skillParams.6`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.fully, {
            name: ct.chg(`auto.skillParams.7`),
          }),
        },
      ],
    },
    ct.headerTem('constellation1', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.aimed, {
            name: ct.ch('addAimed'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation1.fully, {
            name: ct.ch('addFullAimed'),
          }),
        },
        ...dm.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.constellation1[`hex${i}`], {
            name: ct.chg(`auto.skillParams.${i}`),
            multi: i === 0 || i === 3 ? 2 : undefined,
          }),
        })),
      ],
    }),
    {
      canShow: unequal(condLockHomework, 'on', 1),
      text: ct.chg('auto.fields.plunging'),
    },
    {
      canShow: lockHomework_hexerei,
      text: ct.chg('auto.upgradedFields.plunging'),
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
      canShow: lockHomework_hexerei,
      text: ct.chg('auto.upgradedFields.hexerei'),
    },
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[`hex${i}`], {
          name: ct.chg(`auto.skillParams.${i}`),
          multi: i === 0 || i === 3 ? 2 : undefined,
        }),
      })),
    },
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.press, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.1'),
          value: dm.skill.pressCD,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.hold, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          text: stg('hold.cd'),
          value: dm.skill.holdCD,
          unit: 's',
        },
      ],
    },
    ct.headerTem('passive1', {
      fields: [
        {
          text: ct.ch('upcurrentDuration'),
          value: dm.passive1.duration,
          unit: 's',
        },
      ],
    }),
    ct.condTem('constellation2', {
      value: condC2,
      path: condC2Path,
      teamBuff: true,
      name: ct.chg('constellation2.name'),
      states: {
        hit: {
          name: ct.ch('c2.hit'),
          fields: [
            {
              node: infoMut(c2Hit_anemo_enemyRes_, {
                path: 'anemo_enemyRes_',
              }),
            },
            {
              node: c2Hit_phys_enemyRes__,
            },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
            },
          ],
        },
        launched: {
          name: ct.ch('c2.launched'),
          fields: [
            {
              node: infoMut(c2Hit_anemo_enemyRes_, {
                path: 'anemo_enemyRes_',
              }),
            },
            {
              node: c2Hit_phys_enemyRes__,
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation2', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.dmg, { name: st('dmg') }),
        },
      ],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.base, {
            name: ct.chg(`burst.skillParams.0`),
            multi: dm.burst.baseTicks,
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
          value: dm.burst.duration,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.3'),
          value: dm.burst.cd,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.4'),
          value: dm.burst.enerCost,
        },
      ],
    },
    ct.condTem('burst', {
      value: condBurstAbsorption,
      path: condBurstAbsorptionPath,
      name: st('eleAbsor'),
      states: Object.fromEntries(
        absorbableEle.map((eleKey) => [
          eleKey,
          {
            name: (
              <ColorText color={eleKey}>{stg(`element.${eleKey}`)}</ColorText>
            ),
            fields: [
              {
                node: infoMut(dmgFormulas.burst.absorb, {
                  name: ct.chg(`burst.skillParams.1`),
                  multi: dm.burst.absorbTicks,
                }),
              },
            ],
          },
        ])
      ),
    }),
    ct.headerTem('passive2', {
      fields: [
        {
          text: ct.ch('regenEner'),
        },
        {
          text: ct.ch('q'),
        },
      ],
    }),
    ct.condTem('constellation6', {
      // C6 Anemo
      value: condC6,
      path: condC6Path,
      teamBuff: true,
      name: ct.ch('c6'),
      states: {
        takeDmg: {
          fields: [
            {
              node: infoMut(c6_anemo_enemyRes_, { path: 'anemo_enemyRes_' }),
            },
            {
              node: lockC6_critDMG_,
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation6', {
      // C6 elemental self-display
      fields: absorbableEle.map((eleKey) => ({
        node: c6_ele_enemyRes_arr[`${eleKey}_enemyRes_`],
      })),
      canShow: unequal(
        condBurstAbsorption,
        undefined,
        equal(condC6, 'takeDmg', equal(target.charKey, key, 1))
      ),
    }),
    ct.condTem('constellation6', {
      // C6 elemental team-display
      value: condBurstAbsorption,
      path: condBurstAbsorptionPath,
      name: st('eleAbsor'),
      teamBuff: true,
      canShow: equal(condC6, 'takeDmg', unequal(input.activeCharKey, key, 1)),
      states: Object.fromEntries(
        absorbableEle.map((eleKey) => [
          eleKey,
          {
            name: (
              <ColorText color={eleKey}>{stg(`element.${eleKey}`)}</ColorText>
            ),
            fields: [
              {
                node: c6_ele_enemyRes_arr[`${eleKey}_enemyRes_`],
              },
            ],
          },
        ])
      ),
    }),
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3', [
    { fields: [{ node: p3_staminaGlidingDec_ }] },
  ]),
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
      path: condLockBurstSwirlPath,
      value: condLockBurstSwirl,
      teamBuff: true,
      canShow: greaterEq(tally.hexerei, 2, lockHomework_hexerei),
      name: ct.ch('lockCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(lockBurstSwirl_all_dmg_disp, {
                path: 'all_dmg_',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(lockBurstSwirl_burst_mult_, {
                name: ct.ch('stormeye_mult_'),
                pivot: true,
              }),
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      value: condC4,
      path: condC4Path,
      name: st('getElementalOrbParticle'),
      canShow: unequal(condLockHomework, 'on', 1),
      states: {
        pickup: {
          fields: [
            {
              node: infoMut(c4_anemo_dmg_, { path: 'anemo_dmg_' }),
            },
          ],
        },
      },
    }),
    ct.condTem('constellation4', {
      value: condLockC4SkillBurst,
      path: condLockC4SkillBurstPath,
      teamBuff: true,
      canShow: lockHomework_hexerei,
      name: st('afterUse.skillOrBurst'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(lockC4SkillBurst_anemo_dmg_self, {
                path: 'anemo_dmg_',
              }),
            },
            {
              node: infoMut(lockC4SkillBurst_anemo_dmg_activeDisp, {
                path: 'anemo_dmg_',
                isTeamBuff: true,
              }),
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
}

export default new CharacterSheet(sheet, data)
