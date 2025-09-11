import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  percent,
  prod,
  sum,
  tally,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Aino'
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
    ],
  },
  charged: {
    cyclicDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg1: skillParam_gen.skill[s++],
    dmg2: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    ballDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    burst_dmg_: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    eleMas: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    atkDmg: skillParam_gen.constellation2[0],
    eleMasDmg: skillParam_gen.constellation2[1],
    cd: skillParam_gen.constellation2[2],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    ec_bloom_lc_lb_dmg_: skillParam_gen.constellation6[0],
    gleam_ec_bloom_lc_lb_dmg_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const a4_burst_dmgInc = greaterEq(
  input.asc,
  4,
  prod(percent(dm.passive2.burst_dmg_), input.total.eleMas)
)

const [condC1AfterSkillOrBurstPath, condC1AfterSkillOrBurst] = cond(
  key,
  'c1AfterSkillOrBurst'
)
const c1AfterSkill_self_eleMas = greaterEq(
  input.constellation,
  1,
  equal(condC1AfterSkillOrBurst, 'on', dm.constellation1.eleMas)
)
const c1AfterSkill_active_eleMasDisp = greaterEq(
  input.constellation,
  1,
  equal(condC1AfterSkillOrBurst, 'on', dm.constellation1.eleMas)
)
const c1AfterSkill_active_eleMas = equal(
  target.charKey,
  input.activeCharKey,
  unequal(input.activeCharKey, key, c1AfterSkill_active_eleMasDisp)
)

const [condC6AfterBurstPath, condC6AfterBurst] = cond(key, 'c6AfterBurst')
const c6AfterBurst_electrocharged_dmg_ = greaterEq(
  input.constellation,
  6,
  equal(condC6AfterBurst, 'on', percent(dm.constellation6.ec_bloom_lc_lb_dmg_))
)
const c6AfterBurst_bloom_dmg_ = { ...c6AfterBurst_electrocharged_dmg_ }
const c6AfterBurst_lunarcharged_dmg_ = { ...c6AfterBurst_electrocharged_dmg_ }
const c6AfterBurst_lunarbloom_dmg_ = { ...c6AfterBurst_electrocharged_dmg_ }
const c6AfterBurst_gleam_electrocharged_dmg_ = greaterEq(
  tally.moonsign,
  2,
  greaterEq(
    input.constellation,
    6,
    equal(
      condC6AfterBurst,
      'on',
      percent(dm.constellation6.gleam_ec_bloom_lc_lb_dmg_)
    )
  )
)
const c6AfterBurst_gleam_bloom_dmg_ = {
  ...c6AfterBurst_gleam_electrocharged_dmg_,
}
const c6AfterBurst_gleam_lunarcharged_dmg_ = {
  ...c6AfterBurst_gleam_electrocharged_dmg_,
}
const c6AfterBurst_gleam_lunarbloom_dmg_ = {
  ...c6AfterBurst_gleam_electrocharged_dmg_,
}
const c6AfterBurst_total_electrocharged_dmg_ = sum(
  c6AfterBurst_electrocharged_dmg_,
  c6AfterBurst_gleam_electrocharged_dmg_
)
const c6AfterBurst_total_bloom_dmg_ = sum(
  c6AfterBurst_bloom_dmg_,
  c6AfterBurst_gleam_bloom_dmg_
)
const c6AfterBurst_total_lunarcharged_dmg_ = sum(
  c6AfterBurst_lunarcharged_dmg_,
  c6AfterBurst_gleam_lunarcharged_dmg_
)
const c6AfterBurst_total_lunarbloom_dmg_ = sum(
  c6AfterBurst_lunarbloom_dmg_,
  c6AfterBurst_gleam_lunarbloom_dmg_
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    cyclicDmg: dmgNode('atk', dm.charged.cyclicDmg, 'charged'),
    finalDmg: dmgNode('atk', dm.charged.finalDmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    dmg1: dmgNode('atk', dm.skill.dmg1, 'skill'),
    dmg2: dmgNode('atk', dm.skill.dmg2, 'skill'),
  },
  burst: {
    ballDmg: dmgNode('atk', dm.burst.ballDmg, 'burst'),
  },
  passive2: {
    a4_burst_dmgInc,
  },
  constellation2: {
    dmg: customDmgNode(
      sum(
        prod(percent(dm.constellation2.atkDmg), input.total.atk),
        prod(percent(dm.constellation2.eleMasDmg), input.total.eleMas)
      ),
      'burst'
    ),
  },
}
const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC3,
    skillBoost: skillC5,
    burst_dmgInc: a4_burst_dmgInc,
    eleMas: c1AfterSkill_self_eleMas,
  },
  teamBuff: {
    premod: {
      eleMas: c1AfterSkill_active_eleMas,
      electrocharged_dmg_: c6AfterBurst_total_electrocharged_dmg_,
      bloom_dmg_: c6AfterBurst_total_bloom_dmg_,
      lunarcharged_dmg_: c6AfterBurst_total_lunarcharged_dmg_,
      lunarbloom_dmg_: c6AfterBurst_total_lunarbloom_dmg_,
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
        }),
      })),
    },
    {
      text: ct.chg('auto.fields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.cyclicDmg, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.finalDmg, {
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.5'),
          value: dm.charged.stam,
          unit: '/s',
        },
        {
          text: ct.chg('auto.skillParams.6'),
          value: dm.charged.duration,
          unit: 's',
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
          node: infoMut(dmgFormulas.skill.dmg1, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.dmg2, {
            name: ct.chg(`skill.skillParams.1`),
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
          node: infoMut(dmgFormulas.burst.ballDmg, {
            name: ct.chg(`burst.skillParams.0`),
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
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    ct.fieldsTem('passive2', {
      fields: [
        {
          node: a4_burst_dmgInc,
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1AfterSkillOrBurstPath,
      value: condC1AfterSkillOrBurst,
      teamBuff: true,
      name: st('afterUse.skillOrBurst'),
      states: {
        on: {
          fields: [
            {
              node: c1AfterSkill_self_eleMas,
            },
            {
              node: infoMut(c1AfterSkill_active_eleMasDisp, {
                path: 'eleMas',
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
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.dmg, { name: st('dmg') }),
        },
        {
          text: stg('cd'),
          value: dm.constellation2.cd,
          unit: 's',
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      path: condC6AfterBurstPath,
      value: condC6AfterBurst,
      teamBuff: true,
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [
            {
              node: c6AfterBurst_total_electrocharged_dmg_,
            },
            {
              node: c6AfterBurst_total_bloom_dmg_,
            },
            {
              node: c6AfterBurst_total_lunarcharged_dmg_,
            },
            {
              node: c6AfterBurst_total_lunarbloom_dmg_,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
