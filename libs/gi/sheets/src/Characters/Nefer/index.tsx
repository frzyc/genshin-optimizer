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
  lunarDmg,
  min,
  naught,
  one,
  percent,
  prod,
  subscript,
  sum,
  tally,
  threshold,
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

const key: CharacterKey = 'Nefer'
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
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    chargingStam: skillParam_gen.auto[a++][0],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmgAtk: skillParam_gen.skill[s++],
    skillDmgEleMas: skillParam_gen.skill[s++],
    usages: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    nefer1Atk: skillParam_gen.skill[s++],
    nefer1EleMas: skillParam_gen.skill[s++],
    nefer2Atk: skillParam_gen.skill[s++],
    nefer2EleMas: skillParam_gen.skill[s++],
    shade1: skillParam_gen.skill[s++],
    shade2: skillParam_gen.skill[s++],
    shade3: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    hit1Atk: skillParam_gen.burst[b++],
    hit1EleMas: skillParam_gen.burst[b++],
    hit2Atk: skillParam_gen.burst[b++],
    hit2EleMas: skillParam_gen.burst[b++],
    dmgPerStack: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    maxVeilStacks: skillParam_gen.passive1[0][0],
    veilDuration: skillParam_gen.passive1[1][0],
    maxVeilEleMas: skillParam_gen.passive1[2][0],
    eleMasDuration: skillParam_gen.passive1[3][0],
    conversionDuration: skillParam_gen.passive1[4][0],
    phantasmVeilMult_: skillParam_gen.passive1[5][0],
  },
  passive2: {},
  passive3: {
    base_lunarBloom_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunarBloom_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    lunarbloom_dmgInc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    stackGain: skillParam_gen.constellation2[0],
    newMaxStacks: skillParam_gen.constellation2[1],
    newEleMas: skillParam_gen.constellation2[2],
  },
  constellation4: {
    verdantDewGainSpeed: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    dendro_enemyRes_: -skillParam_gen.constellation4[2],
  },
  constellation6: {
    nefer2Dmg: skillParam_gen.constellation6[0],
    dmg2: skillParam_gen.constellation6[1],
    lunarbloom_specialDmg_: skillParam_gen.constellation6[2],
  },
} as const

const burstVeilsAbsorbedArr = range(1, 5)
const [condBurstVeilsAbsorbedPath, condBurstVeilsAbsorbed] = cond(
  key,
  'burstVeilsAbsorbed'
)
const burstVeilsAbsorbed_burst_dmg_ = greaterEq(
  input.asc,
  1,
  greaterEq(
    tally.moonsign,
    2,
    lookup(
      condBurstVeilsAbsorbed,
      objKeyMap(burstVeilsAbsorbedArr, (veils) => {
        const dmg_bonus_ = prod(
          veils,
          subscript(input.total.burstIndex, dm.burst.dmgPerStack, { unit: '%' })
        )
        if (veils < 4) {
          return dmg_bonus_
        } else {
          return greaterEq(input.constellation, 2, dmg_bonus_)
        }
      }),
      naught
    )
  )
)

const a1VeilStacksArr = range(1, 5)
const [condA1VeilStacksPath, condA1VeilStacks] = cond(key, 'a1VeilStacks')
const a1VeilStacks_pp_mult_ = sum(
  one,
  greaterEq(
    input.asc,
    1,
    greaterEq(
      tally.moonsign,
      2,
      lookup(
        condA1VeilStacks,
        objKeyMap(a1VeilStacksArr, (veils) => {
          const mult_ = prod(veils, percent(dm.passive1.phantasmVeilMult_))
          if (veils < 4) {
            return mult_
          } else {
            return greaterEq(input.constellation, 2, mult_)
          }
        }),
        naught
      )
    )
  )
)
const a1VeilStacks_eleMas = greaterEq(
  input.asc,
  1,
  greaterEq(
    tally.moonsign,
    2,
    lookup(
      condA1VeilStacks,
      objKeyMap(a1VeilStacksArr, (veils) =>
        threshold(
          input.constellation,
          2,
          greaterEq(veils, 5, dm.constellation2.newEleMas),
          greaterEq(veils, 3, dm.passive1.maxVeilEleMas)
        )
      ),
      naught
    )
  )
)

const a0_lunarbloom_baseDmg_ = min(
  prod(percent(dm.passive3.base_lunarBloom_dmg_), input.total.eleMas),
  percent(dm.passive3.maxBase_lunarBloom_dmg_)
)

const c1_ppLunarbloom_addlMv = greaterEq(
  input.constellation,
  1,
  percent(dm.constellation1.lunarbloom_dmgInc)
)

const [condC4ShadowDancePath, condC4ShadowDance] = cond(key, 'c4ShadowDance')
const c4ShadowDance_dendro_enemyRes_ = greaterEq(
  input.constellation,
  4,
  equal(condC4ShadowDance, 'on', dm.constellation4.dendro_enemyRes_)
)

const c6Gleam_lunarbloom_specialDmg_ = greaterEq(
  input.constellation,
  6,
  greaterEq(tally.moonsign, 2, dm.constellation6.lunarbloom_specialDmg_)
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
    skillDmg: splitScaleDmgNode(
      ['atk', 'eleMas'],
      [dm.skill.skillDmgAtk, dm.skill.skillDmgEleMas],
      'skill',
      undefined,
      a1VeilStacks_pp_mult_
    ),
    nefer1Dmg: splitScaleDmgNode(
      ['atk', 'eleMas'],
      [dm.skill.nefer1Atk, dm.skill.nefer1EleMas],
      'charged',
      undefined,
      a1VeilStacks_pp_mult_,
      'skill'
    ),
    nefer2Dmg: threshold(
      input.constellation,
      6,
      lunarDmg(
        sum(percent(dm.constellation6.nefer2Dmg), c1_ppLunarbloom_addlMv),
        'eleMas',
        'lunarbloom',
        undefined,
        a1VeilStacks_pp_mult_
      ),
      splitScaleDmgNode(
        ['atk', 'eleMas'],
        [dm.skill.nefer2Atk, dm.skill.nefer2EleMas],
        'charged',
        undefined,
        a1VeilStacks_pp_mult_,
        'skill'
      )
    ),
    shade1Dmg: lunarDmg(
      sum(
        subscript(input.total.skillIndex, dm.skill.shade1, { unit: '%' }),
        c1_ppLunarbloom_addlMv
      ),
      'eleMas',
      'lunarbloom',
      undefined,
      a1VeilStacks_pp_mult_
    ),
    shade2Dmg: lunarDmg(
      sum(
        subscript(input.total.skillIndex, dm.skill.shade2, { unit: '%' }),
        c1_ppLunarbloom_addlMv
      ),
      'eleMas',
      'lunarbloom',
      undefined,
      a1VeilStacks_pp_mult_
    ),
    shade3Dmg: lunarDmg(
      sum(
        subscript(input.total.skillIndex, dm.skill.shade3, { unit: '%' }),
        c1_ppLunarbloom_addlMv
      ),
      'eleMas',
      'lunarbloom',
      undefined,
      a1VeilStacks_pp_mult_
    ),
  },
  burst: {
    hit1: splitScaleDmgNode(
      ['atk', 'eleMas'],
      [dm.burst.hit1Atk, dm.burst.hit1EleMas],
      'burst'
    ),
    hit2: splitScaleDmgNode(
      ['atk', 'eleMas'],
      [dm.burst.hit2Atk, dm.burst.hit2EleMas],
      'burst'
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      lunarDmg(
        sum(percent(dm.constellation6.dmg2), c1_ppLunarbloom_addlMv),
        'eleMas',
        'lunarbloom',
        undefined,
        a1VeilStacks_pp_mult_
      )
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    skillBoost: skillC3,
    burst_dmg_: burstVeilsAbsorbed_burst_dmg_,
    eleMas: a1VeilStacks_eleMas,
    lunarbloom_specialDmg_: c6Gleam_lunarbloom_specialDmg_,
  },
  teamBuff: {
    premod: {
      lunarbloom_baseDmg_: a0_lunarbloom_baseDmg_,
      dendro_enemyRes_: c4ShadowDance_dendro_enemyRes_,
    },
    tally: {
      moonsign: constant(1),
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
          multi: i === 2 ? 2 : undefined,
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
          value: dm.charged.chargingStam,
          unit: '/s',
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
        {
          node: infoMut(dmgFormulas.skill.nefer1Dmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.nefer2Dmg, {
            name: ct.chg('skill.skillParams.2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shade1Dmg, {
            name: ct.chg('skill.skillParams.3'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shade2Dmg, {
            name: ct.chg('skill.skillParams.4'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shade3Dmg, {
            name: ct.chg('skill.skillParams.5'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.6'),
          value: dm.skill.usages,
        },
        {
          text: ct.chg('skill.skillParams.7'),
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
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.hit1, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.hit2, {
            name: ct.chg('burst.skillParams.1'),
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
      canShow: greaterEq(input.asc, 1, greaterEq(tally.moonsign, 2, 1)),
      path: condBurstVeilsAbsorbedPath,
      value: condBurstVeilsAbsorbed,
      name: ct.ch('burstVeilsAbsorbedCond'),
      states: (data) =>
        objKeyMap(
          range(1, data.get(input.constellation).value >= 2 ? 5 : 3),
          (stacks) => ({
            name: st('stack', { count: stacks }),
            fields: [
              {
                node: burstVeilsAbsorbed_burst_dmg_,
              },
            ],
          })
        ),
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1VeilStacksPath,
      value: condA1VeilStacks,
      name: ct.ch('a1VeilStacksCond'),
      states: (data) =>
        objKeyMap(
          range(1, data.get(input.constellation).value >= 2 ? 5 : 3),
          (stacks) => ({
            name: st('stack', { count: stacks }),
            fields: [
              {
                node: infoMut(a1VeilStacks_pp_mult_, { name: ct.ch('a1Mult') }),
              },
              {
                node: a1VeilStacks_eleMas,
              },
              {
                text: stg('duration'),
                value: dm.passive1.veilDuration,
                unit: 's',
              },
            ],
          })
        ),
    }),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3', [
    ct.headerTem('passive3', {
      teamBuff: true,
      fields: [
        {
          node: a0_lunarbloom_baseDmg_,
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          node: infoMut(c1_ppLunarbloom_addlMv, { name: ct.ch('c1AddlMv') }),
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          text: ct.ch('c2Text'),
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      path: condC4ShadowDancePath,
      value: condC4ShadowDance,
      teamBuff: true,
      name: ct.ch('c4ShadowDanceCond'),
      states: {
        on: {
          fields: [
            {
              node: c4ShadowDance_dendro_enemyRes_,
            },
            {
              text: stg('duration'),
              value: dm.constellation4.duration,
              unit: 's',
              fixed: 1,
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
    ct.fieldsTem('constellation6', {
      fields: [
        {
          text: ct.ch('c6Text'),
        },
        {
          node: infoMut(dmgFormulas.constellation6.dmg, { name: st('dmg') }),
        },
        {
          node: c6Gleam_lunarbloom_specialDmg_,
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
