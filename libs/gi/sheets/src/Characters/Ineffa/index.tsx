import { type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  lunarchargedDmg,
  min,
  percent,
  prod,
  sum,
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
  shieldNodeTalent,
} from '../dataUtil'

const key: CharacterKey = 'Ineffa'
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
      skillParam_gen.auto[++a], // 3.1
      skillParam_gen.auto[++a], // 3.2
      skillParam_gen.auto[++a], // 4
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
    skillDmg: skillParam_gen.skill[s++],
    shieldMult: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    birgittaDmg: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    birgittaDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
    3.5: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMasFromAtk: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  passive: {
    lunarcharged_base_dmg_per100: skillParam_gen.passive![0][0],
    max: skillParam_gen.passive![1][0],
  },
  constellation1: {
    lunarcharged_dmg_: skillParam_gen.constellation1[0],
    max: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
  },
} as const

const skillShield = shieldNodeTalent(
  'atk',
  dm.skill.shieldMult,
  dm.skill.shieldFlat,
  'skill'
)

const a0_base_lc_dmg_ = min(
  prod(
    input.total.atk,
    1 / 100,
    percent(dm.passive.lunarcharged_base_dmg_per100)
  ),
  percent(dm.passive.max)
)

const [condA4AfterBurstPath, condA4AfterBurst] = cond(key, 'a4AfterBurst')
const a4AfterBurst_eleMasDisp = greaterEq(
  input.asc,
  4,
  equal(
    condA4AfterBurst,
    'on',
    prod(input.premod.atk, percent(dm.passive2.eleMasFromAtk))
  ),
  { path: 'eleMas', isTeamBuff: true }
)
const a4AfterBurst_eleMas = greaterEq(
  sum(
    equal(input.activeCharKey, target.charKey, 1),
    equal(key, target.charKey, 1)
  ),
  1,
  a4AfterBurst_eleMasDisp
)

const [condC1AfterShieldPath, condC1AfterShield] = cond(key, 'c1AfterShield')
const c1AfterShield_lc_dmg_ = greaterEq(
  input.constellation,
  1,
  equal(
    condC1AfterShield,
    'on',
    min(
      prod(
        input.total.atk,
        1 / 100,
        percent(dm.constellation1.lunarcharged_dmg_)
      ),
      percent(dm.constellation1.max)
    )
  )
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
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    shield: skillShield,
    shieldElectro: shieldElement('electro', skillShield),
    birgittaDmg: dmgNode('atk', dm.skill.birgittaDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
  },
  passive: {
    a0_base_lc_dmg_,
  },
  passive1: {
    dmg: greaterEq(
      input.asc,
      1,
      lunarchargedDmg(percent(dm.passive1.dmg), 'atk')
    ),
  },
  passive2: {
    a4AfterBurst_eleMas,
    a4AfterBurst_eleMasDisp,
  },
  constellation1: {
    c1AfterShield_lc_dmg_,
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      lunarchargedDmg(percent(dm.constellation2.dmg), 'atk')
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      lunarchargedDmg(percent(dm.constellation6.dmg), 'atk')
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
  },
  teamBuff: {
    premod: {
      lunarcharged_baseDmg_: a0_base_lc_dmg_,
      lunarcharged_dmg_: c1AfterShield_lc_dmg_,
    },
    total: {
      eleMas: a4AfterBurst_eleMas,
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
          name: ct.chg(`auto.skillParams.${i > 2 ? i - 1 : i}`),
          textSuffix: i === 2 ? '(1)' : i === 3 ? '(2)' : undefined,
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
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shield, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shieldElectro, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.shieldDuration,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.birgittaDmg, {
            name: ct.chg(`skill.skillParams.3`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.birgittaDuration,
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
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg(`burst.skillParams.0`),
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
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.dmg, { name: st('dmg') }),
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4AfterBurstPath,
      value: condA4AfterBurst,
      name: st('afterUse.burst'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: a4AfterBurst_eleMasDisp,
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
  passive: ct.talentTem('passive', [
    ct.fieldsTem('passive', {
      fields: [
        {
          node: a0_base_lc_dmg_,
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1AfterShieldPath,
      value: condC1AfterShield,
      name: ct.ch('c1Cond'),
      states: {
        on: {
          fields: [
            {
              node: c1AfterShield_lc_dmg_,
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
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.dmg, { name: st('dmg') }),
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.dmg, { name: st('dmg') }),
        },
        {
          text: stg('cd'),
          value: dm.constellation6.cd,
          unit: 's',
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
