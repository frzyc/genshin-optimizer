import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type CharacterKey, absorbableEle } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
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
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Ifa'
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
    tonicDmg: skillParam_gen.skill[s++],
    tonicHealPercent: skillParam_gen.skill[s++],
    tonicHealFlat: skillParam_gen.skill[s++],
    nsLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    markDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    nsConsumed: skillParam_gen.passive1[0][0],
    essentialsGained: skillParam_gen.passive1[1][0],
    maxEssentials: skillParam_gen.passive1[2][0],
    reaction_dmg_perEssential: skillParam_gen.passive1[3][0],
    lunarcharged_dmg_perEssential: 0.002,
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    nsThreshold: skillParam_gen.constellation2[0],
    addlEssentials: skillParam_gen.constellation2[1],
    essentialsLimitInc: skillParam_gen.constellation2[2],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    nsConsumption: skillParam_gen.constellation6[1],
  },
} as const

const [condA1EssentialsPath, condA1Essentials] = cond(key, 'a1Essentials')
const a1EssentialsArr = range(
  10,
  dm.passive1.maxEssentials + dm.constellation2.essentialsLimitInc,
  10
)
const a1Essentials = lookup(
  condA1Essentials,
  objKeyMap(a1EssentialsArr, (ess) =>
    ess > dm.passive1.maxEssentials
      ? greaterEq(input.constellation, 2, constant(ess))
      : constant(ess)
  ),
  naught
)
const a1Essentials_swirl_dmg_ = greaterEq(
  input.asc,
  1,
  prod(percent(dm.passive1.reaction_dmg_perEssential), a1Essentials)
)
const a1Essentials_electrocharged_dmg_ = { ...a1Essentials_swirl_dmg_ }
const a1Essentials_lunarcharged_dmg_ = greaterEq(
  input.asc,
  1,
  prod(percent(dm.passive1.lunarcharged_dmg_perEssential), a1Essentials)
)

const [condA4NsBurstPath, condA4NsBurst] = cond(key, 'a4NsBurst')
const a4NsBurst_eleMas = greaterEq(
  input.asc,
  4,
  equal(condA4NsBurst, 'on', dm.passive2.eleMas),
  { path: 'eleMas' }
)

const [condC4AfterBurstPath, condC4AfterBurst] = cond(key, 'c4AfterBurst')
const c4AfterBurst_eleMas = greaterEq(
  input.constellation,
  4,
  equal(condC4AfterBurst, 'on', dm.constellation4.eleMas),
  { path: 'eleMas' }
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
    tonicDmg: dmgNode(
      'atk',
      dm.skill.tonicDmg,
      'normal',
      undefined,
      undefined,
      'skill'
    ),
    tonicHeal: healNodeTalent(
      'eleMas',
      dm.skill.tonicHealPercent,
      dm.skill.tonicHealFlat,
      'skill'
    ),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    ...objKeyMap(absorbableEle, (ele) =>
      dmgNode('atk', dm.burst.markDmg, 'burst', { hit: { ele: constant(ele) } })
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'normal'
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
    eleMas: sum(a4NsBurst_eleMas, c4AfterBurst_eleMas),
  },
  teamBuff: {
    premod: {
      swirl_dmg_: a1Essentials_swirl_dmg_,
      electrocharged_dmg_: a1Essentials_electrocharged_dmg_,
      lunarcharged_dmg_: a1Essentials_lunarcharged_dmg_,
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
          node: infoMut(dmgFormulas.skill.tonicDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.tonicHeal, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.nsLimit,
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
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        ...absorbableEle.map((ele) => ({
          node: infoMut(dmgFormulas.burst[ele], {
            name: ct.chg(`burst.skillParams.1`),
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
      path: condA1EssentialsPath,
      value: condA1Essentials,
      name: ct.ch('a1Cond'),
      teamBuff: true,
      states: (data) => {
        const maxEss =
          data.get(input.constellation).value >= 2
            ? dm.passive1.maxEssentials + dm.constellation2.essentialsLimitInc
            : dm.passive1.maxEssentials
        return objKeyMap(range(10, maxEss, 10), (ess) => ({
          name: st('points', { count: ess }),
          fields: [
            {
              node: a1Essentials_swirl_dmg_,
            },
            {
              node: a1Essentials_electrocharged_dmg_,
            },
            {
              node: a1Essentials_lunarcharged_dmg_,
            },
          ],
        }))
      },
    }),
    ct.headerTem('constellation2', {
      fields: [
        {
          text: ct.ch('c2Text'),
          value: dm.constellation2.essentialsLimitInc,
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4NsBurstPath,
      value: condA4NsBurst,
      name: st('nightsoul.partyBurst'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: a4NsBurst_eleMas,
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
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      path: condC4AfterBurstPath,
      value: condC4AfterBurst,
      teamBuff: true,
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [
            {
              node: c4AfterBurst_eleMas,
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
    { fields: [{ node: nodeC5 }] },
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
