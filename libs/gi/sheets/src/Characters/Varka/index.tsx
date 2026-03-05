import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/common/util'
import { type CharacterKey, absorbableEle } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  min,
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
import { cond, condReadNode, st, stg } from '../../SheetUtil'
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

const key: CharacterKey = 'Varka'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2.2
      skillParam_gen.auto[a++], // 2.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 5.1
      skillParam_gen.auto[a++], // 5.2
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    skillDuration: skillParam_gen.skill[s++][0],
    hitArr: [
      skillParam_gen.skill[s++], // 1 ele
      skillParam_gen.skill[s++], // 2.2 ele
      skillParam_gen.skill[s++], // 2.1
      skillParam_gen.skill[s++], // 3.2 ele
      skillParam_gen.skill[s++], // 3.1
      skillParam_gen.skill[s++], // 4.1 ele
      skillParam_gen.skill[s++], // 4.2
      skillParam_gen.skill[s++], // 5.1 ele
      skillParam_gen.skill[s++], // 5.2
    ],
    cDmg1: skillParam_gen.skill[s++], // ele
    cDmg2: skillParam_gen.skill[s++],
    fourWindDmg1: skillParam_gen.skill[s++], // ele
    fourWindDmg2: skillParam_gen.skill[s++],
    azureDmg1: skillParam_gen.skill[s++], // ele
    azureDmg2: skillParam_gen.skill[s++],
    fourWindCd: skillParam_gen.skill[s++][0],
    skillPressCd: skillParam_gen.skill[s++][0],
    skillHoldCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg1: skillParam_gen.burst[b++],
    dmg2: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atkFactor: 1000,
    anemo_dmg_: skillParam_gen.passive1[0][0],
    max_anemo_dmg_: skillParam_gen.passive1[1][0],
    twoAnemoOrTwoPhec_mult_: skillParam_gen.passive1[2][0],
    twoAnemoAndTwoPhec_mult_: skillParam_gen.passive1[3][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    dmg_: skillParam_gen.passive2[1][0],
    maxStacks: skillParam_gen.passive2[2][0],
    stackGainPerChar: skillParam_gen.passive2[3][0],
  },
  lockedPassive: {
    cdReduce: skillParam_gen.lockedPassive![0][0],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    anemo_phec_dmg_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    three: skillParam_gen.constellation6[0],
    crit_dmg_: skillParam_gen.constellation6[1],
  },
} as const

const [condLockHomeworkPath, condLockHomework] = cond(key, 'lockHomework')
const lockHomework_hexerei = equal(condLockHomework, 'on', 1)

const phecElement = threshold(
  tally.pyro,
  1,
  constant('pyro'),
  threshold(
    tally.hydro,
    1,
    constant('hydro'),
    threshold(
      tally.electro,
      1,
      constant('electro'),
      threshold(tally.cryo, 1, constant('cryo'), constant('physical'))
    )
  )
)

const a1Phec_dmg_ = min(
  prod(
    input.premod.atk,
    1 / dm.passive1.atkFactor,
    percent(dm.passive1.anemo_dmg_)
  ),
  percent(dm.passive1.max_anemo_dmg_)
)
const a1Phec_anemo_dmg_ = greaterEq(
  input.asc,
  1,
  unequal(phecElement, 'physical', a1Phec_dmg_)
)
const a1Phec_pyro_dmg_ = greaterEq(
  input.asc,
  1,
  equal(phecElement, 'pyro', a1Phec_dmg_)
)
const a1Phec_hydro_dmg_ = greaterEq(
  input.asc,
  1,
  equal(phecElement, 'hydro', a1Phec_dmg_)
)
const a1Phec_electro_dmg_ = greaterEq(
  input.asc,
  1,
  equal(phecElement, 'electro', a1Phec_dmg_)
)
const a1Phec_cryo_dmg_ = greaterEq(
  input.asc,
  1,
  equal(phecElement, 'cryo', a1Phec_dmg_)
)

const a1Phec_sturm_mult_ = sum(
  one,
  greaterEq(
    input.asc,
    1,
    unequal(
      phecElement,
      'physical',
      subscript(
        sum(
          greaterEq(lookup(phecElement, tally, naught), 2, 1),
          greaterEq(tally.anemo, 2, 1)
        ),
        [
          0,
          dm.passive1.twoAnemoOrTwoPhec_mult_ - 1,
          dm.passive1.twoAnemoAndTwoPhec_mult_ - 1,
        ],
        { unit: '%' }
      )
    )
  )
)

const a4StacksArr = range(1, dm.passive2.maxStacks)
const [condA4StacksPath, condA4Stacks] = cond(key, 'a4Stacks')
const a4Stacks = lookup(
  condA4Stacks,
  objKeyMap(a4StacksArr, (k) => constant(k)),
  naught
)
const a4Stacks_sturm_dmg_ = greaterEq(
  input.asc,
  4,
  prod(percent(dm.passive2.dmg_), a4Stacks)
)

const c1Phec_sturm_mult_ = prod(
  percent(dm.constellation1.dmg),
  a1Phec_sturm_mult_
)

const condC4SwirlPaths = Object.fromEntries(
  absorbableEle.map((e) => [e, [key, `c4Swirl${e}`]])
)
const condC4Swirls = Object.fromEntries(
  absorbableEle.map((e) => [e, condReadNode(condC4SwirlPaths[e])])
)
const c4Swirls_anemo_dmg_ = greaterEq(
  input.constellation,
  4,
  greaterEq(
    sum(...absorbableEle.map((ele) => equal(ele, condC4Swirls[ele], 1))),
    1,
    dm.constellation4.anemo_phec_dmg_
  )
)
const c4Swirls_ele_dmg_ = objKeyValMap(absorbableEle, (ele) => [
  `${ele}_dmg_`,
  greaterEq(
    input.constellation,
    4,
    equal(ele, condC4Swirls[ele], dm.constellation4.anemo_phec_dmg_)
  ),
])

const c6Stacks_critDMG_ = greaterEq(
  input.constellation,
  6,
  greaterEq(input.asc, 4, prod(percent(dm.constellation6.crit_dmg_), a4Stacks))
)

const phecSturmData: Data = {
  premod: {
    all_dmg_: a4Stacks_sturm_dmg_,
  },
  hit: {
    ele: phecElement,
  },
}
const anemoSturmData: Data = {
  premod: {
    all_dmg_: a4Stacks_sturm_dmg_,
  },
  ...hitEle.anemo,
}

const dmgFormulas = {
  normal: {
    na1: dmgNode('atk', dm.normal.hitArr[0], 'normal'),
    na21: dmgNode('atk', dm.normal.hitArr[2], 'normal'),
    na22: dmgNode('atk', dm.normal.hitArr[1], 'normal'),
    na31: dmgNode('atk', dm.normal.hitArr[4], 'normal'),
    na32: dmgNode('atk', dm.normal.hitArr[3], 'normal'),
    na41: dmgNode('atk', dm.normal.hitArr[5], 'normal'),
    na42: dmgNode('atk', dm.normal.hitArr[6], 'normal'),
    na51: dmgNode('atk', dm.normal.hitArr[7], 'normal'),
    na52: dmgNode('atk', dm.normal.hitArr[8], 'normal'),
  },
  charged: {
    dmg1: dmgNode('atk', dm.charged.dmg1, 'charged'),
    dmg2: dmgNode('atk', dm.charged.dmg2, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    na1: dmgNode(
      'atk',
      dm.skill.hitArr[0],
      'normal',
      phecSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    na21: dmgNode(
      'atk',
      dm.skill.hitArr[2],
      'normal',
      anemoSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    na22: dmgNode(
      'atk',
      dm.skill.hitArr[1],
      'normal',
      phecSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    na31: dmgNode(
      'atk',
      dm.skill.hitArr[4],
      'normal',
      anemoSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    na32: dmgNode(
      'atk',
      dm.skill.hitArr[3],
      'normal',
      phecSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    na41: dmgNode(
      'atk',
      dm.skill.hitArr[5],
      'normal',
      phecSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    na42: dmgNode(
      'atk',
      dm.skill.hitArr[6],
      'normal',
      anemoSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    na51: dmgNode(
      'atk',
      dm.skill.hitArr[7],
      'normal',
      phecSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    na52: dmgNode(
      'atk',
      dm.skill.hitArr[8],
      'normal',
      anemoSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    ca1: dmgNode(
      'atk',
      dm.skill.cDmg1,
      'charged',
      phecSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    ca2: dmgNode(
      'atk',
      dm.skill.cDmg2,
      'charged',
      anemoSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    fourWind1: dmgNode(
      'atk',
      dm.skill.fourWindDmg1,
      'skill',
      phecSturmData,
      a1Phec_sturm_mult_
    ),
    fourWind2: dmgNode(
      'atk',
      dm.skill.fourWindDmg2,
      'skill',
      anemoSturmData,
      a1Phec_sturm_mult_
    ),
    azure1: dmgNode(
      'atk',
      dm.skill.azureDmg1,
      'charged',
      phecSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
    azure2: dmgNode(
      'atk',
      dm.skill.azureDmg2,
      'charged',
      anemoSturmData,
      a1Phec_sturm_mult_,
      'skill'
    ),
  },
  burst: {
    dmg1: dmgNode('atk', dm.burst.dmg1, 'burst', { hit: { ele: phecElement } }),
    dmg2: dmgNode('atk', dm.burst.dmg2, 'burst'),
  },
  passive1: {
    a1Phec_anemo_dmg_,
    a1Phec_pyro_dmg_,
    a1Phec_hydro_dmg_,
    a1Phec_electro_dmg_,
    a1Phec_cryo_dmg_,
  },
  constellation1: {
    fourWind1: greaterEq(
      input.constellation,
      1,
      dmgNode(
        'atk',
        dm.skill.fourWindDmg1,
        'skill',
        phecSturmData,
        c1Phec_sturm_mult_
      )
    ),
    fourWind2: greaterEq(
      input.constellation,
      1,
      dmgNode(
        'atk',
        dm.skill.fourWindDmg2,
        'skill',
        anemoSturmData,
        c1Phec_sturm_mult_
      )
    ),
    azure1: greaterEq(
      input.constellation,
      1,
      dmgNode(
        'atk',
        dm.skill.azureDmg1,
        'charged',
        phecSturmData,
        c1Phec_sturm_mult_,
        'skill'
      )
    ),
    azure2: greaterEq(
      input.constellation,
      1,
      dmgNode(
        'atk',
        dm.skill.azureDmg2,
        'charged',
        anemoSturmData,
        c1Phec_sturm_mult_,
        'skill'
      )
    ),
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      customDmgNode(
        prod(percent(dm.constellation2.dmg), input.total.atk),
        'elemental',
        hitEle.anemo
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
    anemo_dmg_: a1Phec_anemo_dmg_,
    pyro_dmg_: a1Phec_pyro_dmg_,
    hydro_dmg_: a1Phec_hydro_dmg_,
    electro_dmg_: a1Phec_electro_dmg_,
    cryo_dmg_: a1Phec_cryo_dmg_,
    critDMG_: c6Stacks_critDMG_,
  },
  teamBuff: {
    premod: {
      anemo_dmg_: c4Swirls_anemo_dmg_,
      ...c4Swirls_ele_dmg_,
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
      fields: Object.values(dmgFormulas.normal).map((node, i) => ({
        node: infoMut(node, {
          name: ct.chg(
            `auto.skillParams.${i === 0 ? i : i - Math.floor(i / 2)}`
          ),
          textSuffix: i === 0 ? undefined : `(${((i - 1) % 2) + 1})`,
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
        ...Object.entries(dmgFormulas.normal).map(([key], i) => ({
          node: infoMut(dmgFormulas.skill[key], {
            name: ct.chg(
              `skill.skillParams.${i === 0 ? 4 : i + 4 - Math.floor(i / 2)}`
            ),
            textSuffix: i === 0 ? undefined : `(${((i - 1) % 2) + 1})`,
          }),
        })),
        {
          node: infoMut(dmgFormulas.skill.ca1, {
            name: ct.chg(`skill.skillParams.9`),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.ca2, {
            name: ct.chg(`skill.skillParams.9`),
            textSuffix: '(2)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.fourWind1, {
            name: ct.chg(`skill.skillParams.10`),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.fourWind2, {
            name: ct.chg(`skill.skillParams.10`),
            textSuffix: '(2)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.azure1, {
            name: ct.chg(`skill.skillParams.11`),
            multi: 2,
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.azure2, {
            name: ct.chg(`skill.skillParams.11`),
            multi: 2,
            textSuffix: '(2)',
          }),
        },
        {
          text: ct.chg('skill.skillParams.3'),
          value: dm.skill.skillDuration,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.1'),
          value: dm.skill.skillPressCd,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.skillHoldCd,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.12'),
          value: dm.skill.fourWindCd,
          unit: 's',
        },
      ],
    },
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.dmg1, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.dmg2, {
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
  ]),

  passive1: ct.talentTem('passive1', [
    ct.fieldsTem('passive1', {
      canShow: unequal(phecElement, 'physical', 1),
      fields: [
        {
          node: a1Phec_anemo_dmg_,
        },
        {
          node: a1Phec_pyro_dmg_,
        },
        {
          node: a1Phec_hydro_dmg_,
        },
        {
          node: a1Phec_electro_dmg_,
        },
        {
          node: a1Phec_cryo_dmg_,
        },
        {
          canShow: (data) => data.get(a1Phec_sturm_mult_).value > 1,
          node: infoMut(a1Phec_sturm_mult_, {
            name: ct.ch('sturm_mult_'),
            pivot: true,
          }),
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4StacksPath,
      value: condA4Stacks,
      name: st('stacks'),
      states: objKeyMap(a4StacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: infoMut(a4Stacks_sturm_dmg_, {
              name: ct.ch('sturm_dmg_'),
              unit: '%',
            }),
          },
          {
            node: c6Stacks_critDMG_,
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
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.fourWind1, {
            name: ct.chg(`skill.skillParams.10`),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation1.fourWind2, {
            name: ct.chg(`skill.skillParams.10`),
            textSuffix: '(2)',
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation1.azure1, {
            name: ct.chg(`skill.skillParams.11`),
            multi: 2,
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation1.azure2, {
            name: ct.chg(`skill.skillParams.11`),
            multi: 2,
            textSuffix: '(2)',
          }),
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.dmg, { name: st('dmg') }),
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      teamBuff: true,
      states: Object.fromEntries(
        absorbableEle.map((ele) => [
          ele,
          {
            value: condC4Swirls[ele],
            path: condC4SwirlPaths[ele],
            name: st(`swirlReaction.${ele}`),
            fields: [],
          },
        ])
      ),
    }),
    ct.fieldsTem('constellation4', {
      teamBuff: true,
      canShow: greaterEq(c4Swirls_anemo_dmg_, 0.1, 1),
      fields: [
        {
          node: c4Swirls_anemo_dmg_,
        },
        ...Object.values(c4Swirls_ele_dmg_).map((node) => ({ node })),
        {
          text: stg('duration'),
          value: dm.constellation4.duration,
          unit: 's',
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          text: ct.ch('c6Text'),
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
