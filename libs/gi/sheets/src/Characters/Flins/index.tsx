import { type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lunarDmg,
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
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Flins'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3
      skillParam_gen.auto[++a], // 4x2
      skillParam_gen.auto[++a], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    na1: skillParam_gen.skill[s++],
    na2: skillParam_gen.skill[s++],
    na3: skillParam_gen.skill[s++],
    na4: skillParam_gen.skill[s++], // x2
    na5: skillParam_gen.skill[s++],
    ca: skillParam_gen.skill[s++],
    spearstormDmg: skillParam_gen.skill[s++],
    spearstormCd: skillParam_gen.skill[s++][0],
    flameDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    middlePhaseLunarDmg: skillParam_gen.burst[b++],
    finalPhaseLunarDmg: skillParam_gen.burst[b++],
    enerCost: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    thunderDmg: skillParam_gen.burst[b++],
    thunderAddlDmg: skillParam_gen.burst[b++],
    thunderEnerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    lunarcharged_dmg_: skillParam_gen.passive1[0][0],
  },
  passive2: {
    eleMasPercent: skillParam_gen.passive2[0][0],
    maxEleMas: skillParam_gen.passive2[1][0],
  },
  passive3: {
    lunarcharged_base_dmg_per100: skillParam_gen.passive3![0][0],
    max: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
    dmgDuration: skillParam_gen.constellation2[1],
    electro_enemyRes_: -skillParam_gen.constellation2[2],
    resDuration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    atk_: skillParam_gen.constellation4[0],
    newEleMasPercent: skillParam_gen.constellation4[1],
    newMaxEleMas: skillParam_gen.constellation4[2],
  },
  constellation6: {
    lunarcharged_specialDmg_: skillParam_gen.constellation6[0],
    team_lunarcharged_specialDmg_: skillParam_gen.constellation6[1],
  },
} as const

const electroInfusion = {
  infusion: {
    nonOverridableSelf: constant('electro'),
  },
}

const a0_base_lc_dmg_ = min(
  prod(
    input.total.atk,
    1 / 100,
    percent(dm.passive3.lunarcharged_base_dmg_per100)
  ),
  percent(dm.passive3.max)
)

const a1_lunarcharged_dmg_ = greaterEq(
  input.asc,
  1,
  greaterEq(tally.moonsign, 2, dm.passive1.lunarcharged_dmg_)
)

const a4_eleMas = greaterEq(
  input.asc,
  4,
  min(
    prod(percent(dm.passive2.eleMasPercent), input.premod.atk),
    dm.passive2.maxEleMas
  )
)

const [condC2AfterElectroPath, condC2AfterElectro] = cond(key, 'c2AfterElectro')
const c2_electro_enemyRes_ = greaterEq(
  input.constellation,
  2,
  greaterEq(
    tally.moonsign,
    2,
    equal(condC2AfterElectro, 'on', dm.constellation2.electro_enemyRes_)
  )
)

const c4_atk_ = greaterEq(input.constellation, 4, dm.constellation4.atk_)
const c4_eleMas = greaterEq(
  input.asc,
  4,
  greaterEq(
    input.constellation,
    4,
    min(
      prod(
        percent(dm.constellation4.newEleMasPercent - dm.passive2.eleMasPercent),
        input.premod.atk
      ),
      dm.constellation4.newMaxEleMas - dm.passive2.maxEleMas
    )
  )
)

const c6_lunarcharged_specialDmg_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.lunarcharged_specialDmg_
)
const c6_team_lunarcharged_specialDmg_ = greaterEq(
  input.constellation,
  6,
  greaterEq(tally.moonsign, 2, dm.constellation6.team_lunarcharged_specialDmg_)
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
    na1: dmgNode(
      'atk',
      dm.skill.na1,
      'normal',
      electroInfusion,
      undefined,
      'skill'
    ),
    na2: dmgNode(
      'atk',
      dm.skill.na2,
      'normal',
      electroInfusion,
      undefined,
      'skill'
    ),
    na3: dmgNode(
      'atk',
      dm.skill.na3,
      'normal',
      electroInfusion,
      undefined,
      'skill'
    ),
    na4: dmgNode(
      'atk',
      dm.skill.na4,
      'normal',
      electroInfusion,
      undefined,
      'skill'
    ),
    na5: dmgNode(
      'atk',
      dm.skill.na5,
      'normal',
      electroInfusion,
      undefined,
      'skill'
    ),
    ca: dmgNode(
      'atk',
      dm.skill.ca,
      'charged',
      electroInfusion,
      undefined,
      'skill'
    ),
    spearDmg: dmgNode('atk', dm.skill.spearstormDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    middleLunarDmg: lunarDmg(
      subscript(input.total.burstIndex, dm.burst.middlePhaseLunarDmg, {
        unit: '%',
      }),
      'atk',
      'lunarcharged'
    ),
    finalLunarDmg: lunarDmg(
      subscript(input.total.burstIndex, dm.burst.finalPhaseLunarDmg, {
        unit: '%',
      }),
      'atk',
      'lunarcharged'
    ),
    thunderDmg: lunarDmg(
      subscript(input.total.burstIndex, dm.burst.thunderDmg, { unit: '%' }),
      'atk',
      'lunarcharged'
    ),
    thunderAddlDmg: lunarDmg(
      subscript(input.total.burstIndex, dm.burst.thunderAddlDmg, { unit: '%' }),
      'atk',
      'lunarcharged'
    ),
  },
  passive2: {
    a4_eleMas,
  },
  passive3: {
    a0_base_lc_dmg_,
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      lunarDmg(percent(dm.constellation2.dmg), 'atk', 'lunarcharged')
    ),
  },
  constellation4: {
    c4_eleMas,
  },
}
const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC3,
    skillBoost: skillC5,
    lunarcharged_dmg_: a1_lunarcharged_dmg_,
    atk_: c4_atk_,
    lunarcharged_specialDmg_: c6_lunarcharged_specialDmg_,
  },
  total: {
    eleMas: sum(a4_eleMas, c4_eleMas),
  },
  teamBuff: {
    tally: {
      moonsign: constant(1),
    },
    premod: {
      lunarcharged_baseDmg_: a0_base_lc_dmg_,
      electro_enemyRes_: c2_electro_enemyRes_,
      lunarcharged_specialDmg_: c6_team_lunarcharged_specialDmg_,
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
          multi: i === 3 ? 2 : undefined,
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
            name: ct.chg(`auto.skillParams.5`),
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
          node: infoMut(dmgFormulas.skill.na1, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.na2, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.na3, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.na4, {
            name: ct.chg(`skill.skillParams.3`),
            multi: 2,
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.na5, {
            name: ct.chg(`skill.skillParams.4`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.ca, {
            name: ct.chg(`skill.skillParams.5`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.spearDmg, {
            name: ct.chg(`skill.skillParams.6`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.7'),
          value: dm.skill.spearstormCd,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.8'),
          value: dm.skill.flameDuration,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.9'),
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
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.middleLunarDmg, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.finalLunarDmg, {
            name: ct.chg(`burst.skillParams.2`),
          }),
        },
        {
          text: stg('energyCost'),
          value: dm.burst.enerCost,
        },
        {
          text: stg('cd'),
          value: dm.burst.cd,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.burst.thunderDmg, {
            name: ct.chg(`burst.skillParams.5`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.thunderAddlDmg, {
            name: ct.chg(`burst.skillParams.6`),
          }),
        },
        {
          text: ct.chg('burst.skillParams.7'),
          value: dm.burst.thunderEnerCost,
        },
      ],
    },
  ]),

  passive1: ct.talentTem('passive1', [
    ct.fieldsTem('passive1', {
      canShow: greaterEq(tally.moonsign, 2, 1),
      fields: [
        {
          node: a1_lunarcharged_dmg_,
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.fieldsTem('passive2', {
      fields: [
        {
          node: infoMut(a4_eleMas, { path: 'eleMas' }),
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    ct.fieldsTem('passive3', {
      fields: [
        {
          node: a0_base_lc_dmg_,
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.dmg, { name: st('dmg') }),
        },
      ],
    }),
    ct.condTem('constellation2', {
      path: condC2AfterElectroPath,
      value: condC2AfterElectro,
      teamBuff: true,
      canShow: greaterEq(tally.moonsign, 2, 1),
      name: st('hitOp.electro'),
      states: {
        on: {
          fields: [
            {
              node: c2_electro_enemyRes_,
            },
            {
              text: stg('duration'),
              value: dm.constellation2.resDuration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.fieldsTem('constellation4', {
      fields: [
        {
          node: c4_atk_,
        },
        {
          node: infoMut(c4_eleMas, { path: 'eleMas' }),
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      teamBuff: true,
      fields: [
        {
          node: c6_lunarcharged_specialDmg_,
        },
        {
          node: c6_team_lunarcharged_specialDmg_,
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
