import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  naught,
  percent,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
  splitScaleDmgNode,
} from '../dataUtil'

const key: CharacterKey = 'Sethos'
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
      skillParam_gen.auto[a++], // 2.1
      skillParam_gen.auto[a++], // 2.2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
    shadowAtk: skillParam_gen.auto[a++],
    shadowEm: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    energyRegen: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dusk_dmgInc: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    maxEnergyConsume: skillParam_gen.passive1[0][0],
    level1ConsumeRatio: skillParam_gen.passive1[1][0],
  },
  passive2: {
    cd: skillParam_gen.passive2[0][0],
    dmg: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
    maxShots: skillParam_gen.passive2[3][0],
  },
  constellation1: {
    shadow_crit_rate_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    electro_dmg_: skillParam_gen.constellation2[0],
    maxStacks: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    teamEleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    cd: skillParam_gen.constellation6[0],
  },
} as const

const burst_dusk_dmgInc = prod(
  subscript(input.total.burstIndex, dm.burst.dusk_dmgInc, { unit: '%' }),
  input.total.eleMas
)

const [condA4SandshadePath, condA4Sandshade] = cond(key, 'a4Sandshade')
const a4Sandshade_shadow_dmgInc = greaterEq(
  input.asc,
  4,
  equal(
    condA4Sandshade,
    'on',
    prod(percent(dm.passive2.dmg), input.total.eleMas)
  )
)

const c1_shadow_critRate_ = greaterEq(
  input.constellation,
  1,
  dm.constellation1.shadow_crit_rate_
)

const c2StacksArr = range(1, dm.constellation2.maxStacks)
const [condC2StacksPath, condC2Stacks] = cond(key, 'c2Stacks')
const c2Stacks = lookup(
  condC2Stacks,
  objKeyMap(c2StacksArr, (stack) => constant(stack)),
  naught
)
const c2Stacks_electro_dmg_ = greaterEq(
  input.constellation,
  2,
  prod(dm.constellation2.electro_dmg_, c2Stacks)
)

const [condC4StrikePath, condC4Strike] = cond(key, 'c4Strike')
const c4Strike_eleMas = greaterEq(
  input.constellation,
  4,
  equal(condC4Strike, 'on', dm.constellation4.teamEleMas)
)

const electroHit = { hit: { ele: constant(ele) } }
const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    fullyAimed: dmgNode('atk', dm.charged.fullyAimed, 'charged', electroHit),
    shadow: splitScaleDmgNode(
      ['atk', 'eleMas'],
      [dm.charged.shadowAtk, dm.charged.shadowEm],
      'charged',
      {
        premod: {
          charged_dmgInc: a4Sandshade_shadow_dmgInc,
          charged_critRate_: c1_shadow_critRate_,
        },
        ...electroHit,
      }
    ),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    dusk_dmgInc: burst_dusk_dmgInc,
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [
        `dusk_${i}`,
        dmgNode('atk', arr, 'charged', {
          premod: {
            charged_dmgInc: burst_dusk_dmgInc,
          },
          ...electroHit,
        }),
      ])
    ),
  } as { dusk_dmgInc: NumNode; [k: string]: NumNode },
}
const autoC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    autoBoost: autoC3,
    electro_dmg_: c2Stacks_electro_dmg_,
  },
  teamBuff: {
    premod: {
      eleMas: c4Strike_eleMas,
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
          name: ct.chg(`auto.skillParams.${i >= 2 ? i - 1 : i}`),
          textSuffix: i >= 1 && i <= 2 ? `(${i})` : undefined,
        }),
      })),
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
    {
      text: ct.chg('auto.fields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.aimed, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.fullyAimed, {
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.shadow, {
            name: ct.chg('auto.skillParams.5'),
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
          node: infoMut(dmgFormulas.burst.dusk_dmgInc, {
            name: ct.chg('burst.skillParams.0'),
          }),
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
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.burst[`dusk_${i}`], {
          name: ct.chg(`auto.skillParams.${i >= 2 ? i - 1 : i}`),
          textSuffix: i >= 1 && i <= 2 ? `(${i})` : undefined,
        }),
      })),
    },
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      value: condA4Sandshade,
      path: condA4SandshadePath,
      name: ct.ch('a4Cond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(a4Sandshade_shadow_dmgInc, {
                name: ct.ch('shadow_dmgInc'),
              }),
            },
          ],
        },
      },
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      value: condC2Stacks,
      path: condC2StacksPath,
      name: st('stacks'),
      states: objKeyMap(c2StacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: c2Stacks_electro_dmg_,
          },
          {
            text: stg('duration'),
            value: dm.constellation2.duration,
            unit: 's',
          },
        ],
      })),
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: autoC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      value: condC4Strike,
      path: condC4StrikePath,
      teamBuff: true,
      name: ct.ch('c4Cond'),
      states: {
        on: {
          fields: [
            {
              node: c4Strike_eleMas,
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
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
