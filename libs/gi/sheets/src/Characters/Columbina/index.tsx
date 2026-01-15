import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/common/util'
import {
  type CharacterKey,
  allLunarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  lunarDmg,
  min,
  naught,
  percent,
  prod,
  subscript,
  sum,
  tally,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
  shieldElement,
  shieldNode,
} from '../dataUtil'

const key: CharacterKey = 'Columbina'
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
    dewDmg: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    continuousDmg: skillParam_gen.skill[s++],
    lchargedDmg: skillParam_gen.skill[s++],
    lbloomDmg: skillParam_gen.skill[s++],
    lcrystallizeDmg: skillParam_gen.skill[s++],
    gravAccumCd: skillParam_gen.skill[s++][0],
    gravAccum: skillParam_gen.skill[s++][0],
    maxGrav: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    lunar_dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    critRate_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: 3,
  },
  passive3: {
    base_lunar_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunar_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    interruptRes: skillParam_gen.constellation1[1],
    resDuration: skillParam_gen.constellation1[2],
    shield: skillParam_gen.constellation1[3],
    shieldDuration: skillParam_gen.constellation1[4],
    triggerCd: skillParam_gen.constellation1[5],
    lunar_special_: skillParam_gen.constellation1[6],
  },
  constellation2: {
    gravityRate: skillParam_gen.constellation2[0],
    hp_: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
    atk: skillParam_gen.constellation2[3],
    eleMas: skillParam_gen.constellation2[4],
    def: skillParam_gen.constellation2[5],
    lunar_special_: skillParam_gen.constellation2[6],
  },
  constellation3: {
    lunar_special_: skillParam_gen.constellation3[0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    lunarcharged_dmg_: skillParam_gen.constellation4[1],
    lunarbloom_dmg_: skillParam_gen.constellation4[2],
    lunarcrystallize_dmg_: skillParam_gen.constellation4[3],
    cd: skillParam_gen.constellation4[4],
    lunar_special_: skillParam_gen.constellation4[5],
  },
  constellation5: {
    lunar_special_: skillParam_gen.constellation5[0],
  },
  constellation6: {
    crit_dmg_: 0.8,
    duration: skillParam_gen.constellation6[0],
    lunar_special_: skillParam_gen.constellation6[1],
  },
} as const

const [condBurstDomainPath, condBurstDomain] = cond(key, 'burstDomain')
const burstDomain_lunar_dmg_ = equal(
  condBurstDomain,
  'on',
  subscript(input.total.burstIndex, dm.burst.lunar_dmg_)
)
const burstDomain_lunar_dmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_dmg_`,
  { ...burstDomain_lunar_dmg_ },
])

const a0_lunar_baseDmg_ = min(
  prod(percent(dm.passive3.base_lunar_dmg_), input.total.hp, 1 / 1000),
  percent(dm.passive3.maxBase_lunar_dmg_)
)
const a0_lunar_baseDmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_baseDmg_`,
  {
    ...a0_lunar_baseDmg_,
  },
])

const [condA1StacksPath, condA1Stacks] = cond(key, 'a1Stacks')
const a1StacksArr = range(1, dm.passive1.maxStacks)
const a1Stacks_critRate_ = greaterEq(
  input.asc,
  1,
  prod(
    lookup(
      condA1Stacks,
      objKeyMap(a1StacksArr, (s) => constant(s)),
      naught
    ),
    percent(dm.passive1.critRate_)
  )
)

const c1Shield = greaterEq(
  input.constellation,
  1,
  greaterEq(tally.moonsign, 2, shieldNode('hp', dm.constellation1.shield, 0))
)
const c1_lunar_specialDmg_ = greaterEq(
  input.constellation,
  1,
  dm.constellation1.lunar_special_
)
const c1_lunar_specialDmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_specialDmg_`,
  { ...c1_lunar_specialDmg_ },
])

const [condC2BrilliancePath, condC2Brilliance] = cond(key, 'c2Brilliance')
const c2Brilliance_hp_ = greaterEq(
  input.constellation,
  2,
  equal(condC2Brilliance, 'on', dm.constellation2.hp_)
)
const [condC2LunarchargedPath, condC2Lunarcharged] = cond(key, 'c2Lunarcharged')
const c2Lunarcharged_atkDisp = greaterEq(
  input.constellation,
  2,
  greaterEq(
    tally.moonsign,
    2,
    equal(
      condC2Brilliance,
      'on',
      equal(
        condC2Lunarcharged,
        'lunarcharged',
        prod(percent(dm.constellation2.atk), input.premod.hp)
      )
    )
  )
)
const c2Lunarcharged_atk = equal(
  input.activeCharKey,
  target.charKey,
  c2Lunarcharged_atkDisp
)
const [condC2LunarbloomPath, condC2Lunarbloom] = cond(key, 'c2Lunarbloom')
const c2Lunarbloom_eleMasDisp = greaterEq(
  input.constellation,
  2,
  greaterEq(
    tally.moonsign,
    2,
    equal(
      condC2Brilliance,
      'on',
      equal(
        condC2Lunarbloom,
        'lunarbloom',
        prod(percent(dm.constellation2.eleMas), input.premod.hp)
      )
    )
  )
)
const c2Lunarbloom_eleMas = equal(
  input.activeCharKey,
  target.charKey,
  c2Lunarbloom_eleMasDisp
)
const [condC2LunarcrystallizePath, condC2Lunarcrystallize] = cond(
  key,
  'c2Lunarcrystallize'
)
const c2Lunarcrystallize_defDisp = greaterEq(
  input.constellation,
  2,
  greaterEq(
    tally.moonsign,
    2,
    equal(
      condC2Brilliance,
      'on',
      equal(
        condC2Lunarcrystallize,
        'lunarcrystallize',
        prod(percent(dm.constellation2.def), input.premod.hp)
      )
    )
  )
)
const c2Lunarcrystallize_def = equal(
  input.activeCharKey,
  target.charKey,
  c2Lunarcrystallize_defDisp
)
const c2_lunar_specialDmg_ = greaterEq(
  input.constellation,
  2,
  dm.constellation2.lunar_special_
)
const c2_lunar_specialDmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_specialDmg_`,
  { ...c2_lunar_specialDmg_ },
])

const c3_lunar_specialDmg_ = greaterEq(
  input.constellation,
  3,
  dm.constellation3.lunar_special_
)
const c3_lunar_specialDmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_specialDmg_`,
  { ...c3_lunar_specialDmg_ },
])

const [condC4BuffPath, condC4Buff] = cond(key, 'c4Buff')
const c4Buff_lunarcharged_dmgInc = greaterEq(
  input.constellation,
  4,
  equal(
    condC4Buff,
    'on',
    prod(percent(dm.constellation4.lunarcharged_dmg_), input.total.hp)
  )
)
const c4Buff_lunarbloom_dmgInc = greaterEq(
  input.constellation,
  4,
  equal(
    condC4Buff,
    'on',
    prod(percent(dm.constellation4.lunarbloom_dmg_), input.total.hp)
  )
)
const c4Buff_lunarcrystallize_dmgInc = greaterEq(
  input.constellation,
  4,
  equal(
    condC4Buff,
    'on',
    prod(percent(dm.constellation4.lunarcharged_dmg_), input.total.hp)
  )
)
const c4_lunar_specialDmg_ = greaterEq(
  input.constellation,
  4,
  dm.constellation4.lunar_special_
)
const c4_lunar_specialDmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_specialDmg_`,
  { ...c4_lunar_specialDmg_ },
])

const c5_lunar_specialDmg_ = greaterEq(
  input.constellation,
  5,
  dm.constellation5.lunar_special_
)
const c5_lunar_specialDmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_specialDmg_`,
  { ...c5_lunar_specialDmg_ },
])

const [condC6LunarchargedPath, condC6Lunarcharged] = cond(key, 'c6Lunarcharged')
const [condC6LunarbloomPath, condC6Lunarbloom] = cond(key, 'c6Lunarbloom')
const [condC6LunarcrystallizePath, condC6Lunarcrystallize] = cond(
  key,
  'c6Lunarcrystallize'
)
const c6_hydro_critDMG_ = greaterEq(
  input.constellation,
  6,
  greaterEq(
    sum(
      equal(condC6Lunarcharged, 'lunarcharged', 1),
      equal(condC6Lunarbloom, 'lunarbloom', 1),
      equal(condC6Lunarcrystallize, 'lunarcrystallize', 1)
    ),
    1,
    dm.constellation6.crit_dmg_
  )
)
const c6_electro_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condC6Lunarcharged, 'lunarcharged', dm.constellation6.crit_dmg_)
)
const c6_dendro_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condC6Lunarbloom, 'lunarbloom', dm.constellation6.crit_dmg_)
)
const c6_geo_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condC6Lunarcrystallize, 'lunarcrystallize', dm.constellation6.crit_dmg_)
)
const c6_lunar_specialDmg_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.lunar_special_
)
const c6_lunar_specialDmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_specialDmg_`,
  { ...c6_lunar_specialDmg_ },
])

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
    dewDmg: lunarDmg(
      subscript(input.total.autoIndex, dm.charged.dewDmg, { unit: '%' }),
      'hp',
      'lunarbloom'
    ),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('hp', dm.skill.skillDmg, 'skill'),
    continuousDmg: dmgNode('hp', dm.skill.continuousDmg, 'skill'),
    lunarchargedDmg: lunarDmg(
      subscript(input.total.skillIndex, dm.skill.lchargedDmg, { unit: '%' }),
      'hp',
      'lunarcharged',
      {
        premod: {
          lunarcharged_dmgInc: c4Buff_lunarcharged_dmgInc,
        },
      }
    ),
    lunarbloomDmg: lunarDmg(
      subscript(input.total.skillIndex, dm.skill.lbloomDmg, { unit: '%' }),
      'hp',
      'lunarbloom',
      {
        premod: {
          lunarbloom_dmgInc: c4Buff_lunarbloom_dmgInc,
        },
      }
    ),
    lunarcrystallizeDmg: lunarDmg(
      subscript(input.total.skillIndex, dm.skill.lcrystallizeDmg, {
        unit: '%',
      }),
      'hp',
      'lunarcrystallize',
      {
        premod: {
          lunarcrystallize_dmgInc: c4Buff_lunarcrystallize_dmgInc,
        },
      }
    ),
  },
  burst: {
    skillDmg: dmgNode('hp', dm.burst.skillDmg, 'burst'),
  },
  passive3: a0_lunar_baseDmg_obj,
  constellation1: {
    shield: c1Shield,
    shieldHydro: shieldElement('hydro', c1Shield),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    critRate_: a1Stacks_critRate_,
    hp_: c2Brilliance_hp_,
  },
  teamBuff: {
    premod: {
      ...a0_lunar_baseDmg_obj,
      ...burstDomain_lunar_dmg_obj,
      ...objKeyValMap(allLunarReactionKeys, (k) => {
        const sk = `${k}_specialDmg_` as const
        return [
          sk,
          sum(
            c1_lunar_specialDmg_obj[sk],
            c2_lunar_specialDmg_obj[sk],
            c3_lunar_specialDmg_obj[sk],
            c4_lunar_specialDmg_obj[sk],
            c5_lunar_specialDmg_obj[sk],
            c6_lunar_specialDmg_obj[sk]
          ),
        ]
      }),
      hydro_critDMG_: c6_hydro_critDMG_,
      electro_critDMG_: c6_electro_critDMG_,
      dendro_critDMG_: c6_dendro_critDMG_,
      geo_critDMG_: c6_geo_critDMG_,
    },
    total: {
      atk: c2Lunarcharged_atk,
      eleMas: c2Lunarbloom_eleMas,
      def: c2Lunarcrystallize_def,
    },
  },
  isMoonsign: constant(1),
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
        {
          node: infoMut(dmgFormulas.charged.dewDmg, {
            name: ct.chg(`auto.skillParams.5`),
            multi: 3,
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
          node: infoMut(dmgFormulas.skill.skillDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.continuousDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.lunarchargedDmg, {
            name: ct.chg('skill.skillParams.2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.lunarbloomDmg, {
            name: ct.chg('skill.skillParams.3'),
            multi: 5,
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.lunarcrystallizeDmg, {
            name: ct.chg('skill.skillParams.4'),
          }),
        },
        { text: ct.chg('skill.skillParams.5'), value: dm.skill.maxGrav },
        {
          text: ct.chg('skill.skillParams.6'),
          value: dm.skill.duration,
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
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg('burst.skillParams.0'),
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
    ct.condTem('burst', {
      path: condBurstDomainPath,
      value: condBurstDomain,
      name: st('activeCharField'),
      teamBuff: true,
      states: {
        on: {
          fields: Object.values(burstDomain_lunar_dmg_obj).map((node) => ({
            node,
          })),
        },
      },
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1StacksPath,
      value: condA1Stacks,
      name: st('stacks'),
      states: objKeyMap(a1StacksArr, (s) => ({
        name: `${s}`,
        fields: [
          {
            node: a1Stacks_critRate_,
          },
          {
            text: stg('duration'),
            value: dm.passive1.duration,
            unit: 's',
          },
        ],
      })),
    }),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3', [
    ct.headerTem('passive3', {
      teamBuff: true,
      fields: Object.values(a0_lunar_baseDmg_obj).map((node) => ({ node })),
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.shield, {
            name: st('dmgAbsorption.none'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation1.shieldHydro, {
            name: st('dmgAbsorption.hydro'),
          }),
        },
      ],
    }),
    ct.headerTem('constellation1', {
      teamBuff: true,
      fields: Object.entries(c1_lunar_specialDmg_obj).map(([k, node]) => ({
        node: infoMut(node, { path: k, isTeamBuff: true }),
      })),
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2BrilliancePath,
      value: condC2Brilliance,
      teamBuff: true,
      name: ct.ch('c2BrillianceCond'),
      states: {
        on: {
          fields: [
            {
              node: c2Brilliance_hp_,
            },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.condTem('constellation2', {
      teamBuff: true,
      canShow: equal(condC2Brilliance, 'on', greaterEq(tally.moonsign, 2, 1)),
      states: {
        lunarcharged: {
          path: condC2LunarchargedPath,
          value: condC2Lunarcharged,
          name: ct.ch('c2lunarchargedCond'),
          fields: [],
        },
        lunarbloom: {
          path: condC2LunarbloomPath,
          value: condC2Lunarbloom,
          name: ct.ch('c2lunarbloomCond'),
          fields: [],
        },
        lunarcrystallize: {
          path: condC2LunarcrystallizePath,
          value: condC2Lunarcrystallize,
          name: ct.ch('c2lunarcrystallizeCond'),
          fields: [],
        },
      },
    }),
    ct.fieldsTem('constellation2', {
      teamBuff: true,
      fields: [
        {
          node: infoMut(c2Lunarcharged_atkDisp, {
            path: 'atk',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(c2Lunarbloom_eleMasDisp, {
            path: 'eleMas',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(c2Lunarcrystallize_defDisp, {
            path: 'def',
            isTeamBuff: true,
          }),
        },
      ],
    }),
    ct.headerTem('constellation2', {
      teamBuff: true,
      fields: Object.entries(c2_lunar_specialDmg_obj).map(([k, node]) => ({
        node: infoMut(node, { path: k, isTeamBuff: true }),
      })),
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
    ct.headerTem('constellation3', {
      teamBuff: true,
      fields: Object.entries(c3_lunar_specialDmg_obj).map(([k, node]) => ({
        node: infoMut(node, { path: k, isTeamBuff: true }),
      })),
    }),
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      path: condC4BuffPath,
      value: condC4Buff,
      name: ct.ch('c4Cond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c4Buff_lunarcharged_dmgInc, {
                path: 'lunarcharged_dmgInc',
              }),
            },
            {
              node: infoMut(c4Buff_lunarbloom_dmgInc, {
                path: 'lunarbloom_dmgInc',
              }),
            },
            {
              node: infoMut(c4Buff_lunarcrystallize_dmgInc, {
                path: 'lunarcrystallize_dmgInc',
              }),
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
    ct.headerTem('constellation4', {
      teamBuff: true,
      fields: Object.entries(c4_lunar_specialDmg_obj).map(([k, node]) => ({
        node: infoMut(node, { path: k, isTeamBuff: true }),
      })),
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
    ct.headerTem('constellation5', {
      teamBuff: true,
      fields: Object.entries(c5_lunar_specialDmg_obj).map(([k, node]) => ({
        node: infoMut(node, { path: k, isTeamBuff: true }),
      })),
    }),
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      teamBuff: true,
      states: {
        lunarcharged: {
          path: condC6LunarchargedPath,
          value: condC6Lunarcharged,
          name: ct.ch('c6lunarchargedCond'),
          fields: [],
        },
        lunarbloom: {
          path: condC6LunarbloomPath,
          value: condC6Lunarbloom,
          name: ct.ch('c6lunarbloomCond'),
          fields: [],
        },
        lunarcrystallize: {
          path: condC6LunarcrystallizePath,
          value: condC6Lunarcrystallize,
          name: ct.ch('c6lunarcrystallizeCond'),
          fields: [],
        },
      },
    }),
    ct.fieldsTem('constellation6', {
      teamBuff: true,
      fields: [
        {
          node: c6_hydro_critDMG_,
        },
        {
          node: c6_electro_critDMG_,
        },
        {
          node: c6_dendro_critDMG_,
        },
        {
          node: c6_geo_critDMG_,
        },
        {
          text: stg('duration'),
          value: dm.constellation6.duration,
          unit: 's',
        },
      ],
    }),
    ct.headerTem('constellation6', {
      teamBuff: true,
      fields: Object.entries(c6_lunar_specialDmg_obj).map(([k, node]) => ({
        node: infoMut(node, { path: k, isTeamBuff: true }),
      })),
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
