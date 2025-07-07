import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
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

const key: CharacterKey = 'Dahlia'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
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
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    shieldFlat: skillParam_gen.burst[b++],
    shieldMult: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cd: skillParam_gen.passive1[0][0],
  },
  passive2: {
    atkSPD_: skillParam_gen.passive2[0][0],
    maxAtkSpd_: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
  },
  constellation2: {
    shield_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[0],
  },
  constellation6: {
    atkSPD_: skillParam_gen.constellation6[0],
  },
} as const

const burstShield = shieldNodeTalent(
  'hp',
  dm.burst.shieldMult,
  dm.burst.shieldFlat,
  'burst'
)

const [condBurstActivePath, condBurstActive] = cond(key, 'burstActive')
const a4BurstActive_atkSPD_disp = greaterEq(
  input.asc,
  4,
  equal(
    condBurstActive,
    'on',
    min(
      prod(input.total.hp, percent(dm.passive2.atkSPD_)),
      percent(dm.passive2.maxAtkSpd_)
    )
  ),
  { path: 'atkSPD_', isTeamBuff: true }
)
const a4BurstActive_atkSPD_ = equal(
  input.activeCharKey,
  target.charKey,
  a4BurstActive_atkSPD_disp
)

const [condC2BurstConsumedPath, condC2BurstConsumed] = cond(
  key,
  'c2BurstConsumed'
)
const c2BurstConsumed_shield_disp = greaterEq(
  input.constellation,
  2,
  equal(condC2BurstConsumed, 'on', dm.constellation2.shield_),
  { path: 'shield_', isTeamBuff: true }
)
const c2BurstConsumed_shield_ = equal(
  input.activeCharKey,
  target.charKey,
  c2BurstConsumed_shield_disp
)

const c6BurstActive_atkSPD_disp = greaterEq(
  input.constellation,
  6,
  equal(condBurstActive, 'on', dm.constellation6.atkSPD_),
  { path: 'atkSPD_', isTeamBuff: true }
)
const c6BurstActive_atkSPD_ = equal(
  input.activeCharKey,
  target.charKey,
  c6BurstActive_atkSPD_disp
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg1: dmgNode('atk', dm.charged.dmg1, 'charged'),
    dmg2: dmgNode('atk', dm.charged.dmg2, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    shield: burstShield,
    hydroShield: shieldElement('hydro', burstShield),
  },
  passive2: {
    a4BurstActive_atkSPD_,
  },
}
const skillC3 = greaterEq(input.constellation, 5, 3)
const burstC5 = greaterEq(input.constellation, 3, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
  },
  teamBuff: {
    premod: {
      atkSPD_: sum(a4BurstActive_atkSPD_, c6BurstActive_atkSPD_),
      shield_: c2BurstConsumed_shield_,
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
          node: infoMut(dmgFormulas.charged.dmg1, {
            name: ct.chg(`auto.skillParams.4`),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.dmg2, {
            name: ct.chg(`auto.skillParams.4`),
            textSuffix: '(2)',
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
          node: infoMut(dmgFormulas.burst.shield, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.hydroShield, {
            name: ct.chg(`burst.skillParams.1`),
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
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      value: condBurstActive,
      path: condBurstActivePath,
      teamBuff: true,
      name: ct.ch('burstActiveCond'),
      states: {
        on: {
          fields: [
            {
              node: a4BurstActive_atkSPD_disp,
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
      path: condC2BurstConsumedPath,
      value: condC2BurstConsumed,
      teamBuff: true,
      name: ct.ch('c2Cond'),
      states: {
        on: {
          fields: [
            {
              node: c2BurstConsumed_shield_disp,
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
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.headerTem('constellation4', {
      fields: [
        {
          text: st('addlCharges'),
          value: 1,
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      path: condBurstActivePath,
      value: condBurstActive,
      teamBuff: true,
      name: ct.ch('burstActiveCond'),
      states: {
        on: {
          fields: [
            {
              node: c6BurstActive_atkSPD_disp,
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
