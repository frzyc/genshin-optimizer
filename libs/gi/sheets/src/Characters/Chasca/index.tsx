import { objKeyMap, objKeyValMap } from '@genshin-optimizer/common/util'
import { type CharacterKey, absorbableEle } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  min,
  percent,
  prod,
  subscript,
  sum,
  tally,
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

const key: CharacterKey = 'Chasca'
const skillParam_gen = allStats.char.skillParam[key]
const ele = allStats.char.data[key].ele!
const ct = charTemplates(key)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    activationDmg: skillParam_gen.skill[s++],
    pressDmg: skillParam_gen.skill[s++],
    shellDmg: skillParam_gen.skill[s++],
    shiningShellDmg: skillParam_gen.skill[s++],
    nsPointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    galesplittingDmg: skillParam_gen.burst[b++],
    shellDmg: skillParam_gen.burst[b++],
    radiantDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chances: [
      skillParam_gen.passive1[0][0],
      skillParam_gen.passive1[1][0],
      skillParam_gen.passive1[2][0],
    ],
    shining_dmg_: [
      -1,
      skillParam_gen.passive1[3][0],
      skillParam_gen.passive1[4][0],
      skillParam_gen.passive1[5][0],
    ] as number[],
  },
  passive2: {
    dmg: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    addlChance: skillParam_gen.constellation1[0],
    nsPointConsumption: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    dmg: skillParam_gen.constellation4[1],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
  },
} as const

const phecElements = min(
  sum(
    ...absorbableEle.map((ele) => greaterEq(tally[ele], 1, 1)),
    greaterEq(input.constellation, 2, 1)
  ),
  3
)
const [condA1InMultitargetPath, condA1InMultitarget] = cond(
  key,
  'a1InMultitarget'
)
const a1InMultitarget_shining_dmg_ = greaterEq(
  input.asc,
  1,
  equal(
    condA1InMultitarget,
    'on',
    greaterEq(
      phecElements,
      1,
      subscript(phecElements, dm.passive1.shining_dmg_)
    )
  )
)

const [condC6FatalRoundsPath, condC6FatalRounds] = cond(key, 'c6FatalRounds')
const c6FatalRounds_multi_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condC6FatalRounds, 'on', dm.constellation6.critDMG_)
)
const multiFireAddl = { premod: { critDMG_: c6FatalRounds_multi_critDMG_ } }
const shiningAddl = {
  premod: {
    charged_dmg_: a1InMultitarget_shining_dmg_,
    critDMG_: c6FatalRounds_multi_critDMG_,
  },
}

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    fullyAimed: dmgNode('atk', dm.charged.fullyAimed, 'charged', hitEle[ele]),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    activationDmg: dmgNode('atk', dm.skill.activationDmg, 'skill'),
    pressDmg: dmgNode(
      'atk',
      dm.skill.pressDmg,
      'normal',
      { ...hitEle[ele], ...multiFireAddl },
      undefined,
      'skill'
    ),
    shellDmg: dmgNode(
      'atk',
      dm.skill.shellDmg,
      'charged',
      hitEle[ele],
      undefined,
      'skill'
    ),
    ...objKeyValMap(absorbableEle, (eleKey) => [
      `shiningShellDmg_${eleKey}`,
      dmgNode(
        'atk',
        dm.skill.shiningShellDmg,
        'charged',
        {
          ...hitEle[eleKey],
          ...shiningAddl,
        },
        undefined,
        'skill'
      ),
    ]),
  },
  burst: {
    galeSplittingDmg: dmgNode('atk', dm.burst.galesplittingDmg, 'burst'),
    shellDmg: dmgNode('atk', dm.burst.shellDmg, 'burst'),
    ...objKeyValMap(absorbableEle, (eleKey) => [
      `radiantDmg_${eleKey}`,
      dmgNode('atk', dm.burst.radiantDmg, 'burst', hitEle[eleKey]),
    ]),
  },
  passive2: {
    anemo: greaterEq(
      input.asc,
      4,
      dmgNode(
        'atk',
        dm.skill.shellDmg,
        'charged',
        hitEle[ele],
        percent(dm.passive2.dmg),
        'skill'
      )
    ),
    ...objKeyMap(absorbableEle, (eleKey) =>
      greaterEq(
        input.asc,
        4,
        dmgNode(
          'atk',
          dm.skill.shiningShellDmg,
          'charged',
          hitEle[eleKey],
          percent(dm.passive2.dmg),
          'skill'
        )
      )
    ),
  },
  constellation2: objKeyMap(absorbableEle, (eleKey) =>
    greaterEq(
      input.constellation,
      2,
      customDmgNode(
        prod(percent(dm.constellation2.dmg), input.total.atk),
        'charged',
        hitEle[eleKey]
      )
    )
  ),
  constellation4: {
    ...objKeyMap(absorbableEle, (eleKey) =>
      greaterEq(
        input.constellation,
        4,
        customDmgNode(
          prod(
            percent(dm.constellation4.dmg * dm.constellation2.dmg),
            input.total.atk
          ),
          'charged',
          hitEle[eleKey]
        )
      )
    ),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: nodeC5,
    skillBoost: nodeC3,
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
          multi: i === 2 ? 2 : i === 3 ? 3 : undefined,
        }),
      })),
    },
    {
      text: ct.chg('auto.fields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.aimed, {
            name: ct.chg('auto.skillParams.4'),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.fullyAimed, {
            name: ct.chg('auto.skillParams.5'),
          }),
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
          node: infoMut(dmgFormulas.skill.activationDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.pressDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shellDmg, {
            name: ct.chg('skill.skillParams.2'),
          }),
        },
        ...absorbableEle.map((ele) => ({
          node: infoMut(dmgFormulas.skill[`shiningShellDmg_${ele}`], {
            name: ct.chg('skill.skillParams.3'),
          }),
        })),
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.nsPointLimit,
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
          fixed: 1,
        },
      ],
    },
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.galeSplittingDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.shellDmg, {
            name: ct.chg('burst.skillParams.1'),
          }),
        },
        ...absorbableEle.map((ele) => ({
          node: infoMut(dmgFormulas.burst[`radiantDmg_${ele}`], {
            name: ct.chg('burst.skillParams.2'),
          }),
        })),
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
      path: condA1InMultitargetPath,
      value: condA1InMultitarget,
      name: ct.ch('a1Cond'),
      canShow: greaterEq(phecElements, 1, 1),
      states: {
        on: {
          fields: [
            {
              node: infoMut(a1InMultitarget_shining_dmg_, {
                name: ct.ch('shining_dmg_'),
                unit: '%',
              }),
            },
          ],
        },
      },
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    {
      fields: ['anemo' as const, ...absorbableEle].map((ele) => ({
        node: infoMut(dmgFormulas.passive2[ele], {
          name: st('dmg'),
        }),
      })),
    },
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    {
      fields: absorbableEle.map((ele) => ({
        node: infoMut(dmgFormulas.constellation2[ele], {
          name: st('dmg'),
        }),
      })),
    },
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    {
      fields: absorbableEle.map((ele) => ({
        node: infoMut(dmgFormulas.constellation4[ele], {
          name: st('dmg'),
        }),
      })),
    },
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: nodeC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      path: condC6FatalRoundsPath,
      value: condC6FatalRounds,
      name: ct.ch('c6Cond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c6FatalRounds_multi_critDMG_, {
                name: ct.ch('multiFire_critDMG_'),
                unit: '%',
              }),
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
