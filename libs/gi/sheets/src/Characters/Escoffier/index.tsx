import { type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  percent,
  prod,
  subscript,
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
  healNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Escoffier'
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
    parfaitDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    healPercent: skillParam_gen.burst[b++],
    healFlat: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    heal: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    cryoRes_: [
      0,
      -skillParam_gen.passive2[0][0],
      -skillParam_gen.passive2[1][0],
      -skillParam_gen.passive2[2][0],
      -skillParam_gen.passive2[3][0],
    ],
    duration: skillParam_gen.passive2[4][0],
  },
  constellation1: {
    cryo_critDMG_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
    dmgInc: skillParam_gen.constellation2[1],
    triggerQuota: skillParam_gen.constellation2[2],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[0],
    energyRestore: skillParam_gen.constellation4[1],
    triggerQuota: skillParam_gen.constellation4[2],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
    triggerQuota: skillParam_gen.constellation6[2],
  },
} as const

const [condA4SkillBurstHitPath, condA4SkillBurstHit] = cond(
  key,
  'a4SkillBurstHit'
)
const hydroCryoTeammates = sum(tally.hydro, tally.cryo)
const a4SkillBurstHit_cryo_enemyRes_ = greaterEq(
  input.asc,
  4,
  equal(
    condA4SkillBurstHit,
    'on',
    subscript(hydroCryoTeammates, [...dm.passive2.cryoRes_])
  )
)
const a4SkillBurstHit_hydro_enemyRes_ = { ...a4SkillBurstHit_cryo_enemyRes_ }

const [condC1AfterSkillBurstPath, condC1AfterSkillBurst] = cond(
  key,
  'c1AfterSkillBurst'
)
const c1AfterSkillBurst_cryo_critDMG_ = greaterEq(
  input.constellation,
  1,
  greaterEq(
    input.asc,
    4,
    equal(
      hydroCryoTeammates,
      4,
      equal(condC1AfterSkillBurst, 'on', dm.constellation1.cryo_critDMG_)
    )
  )
)

const [condC2StacksPath, condC2Stacks] = cond(key, 'c2Stacks')
const c2Stacks_cryo_dmgIncDisp = greaterEq(
  input.constellation,
  2,
  equal(
    condC2Stacks,
    'on',
    prod(percent(dm.constellation2.dmgInc), input.total.atk)
  ),
  { path: 'cryo_dmgInc', isTeamBuff: true }
)
const c2Stacks_cryo_dmgInc = unequal(
  target.charKey,
  key,
  c2Stacks_cryo_dmgIncDisp
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
    parfaitDmg: dmgNode('atk', dm.skill.parfaitDmg, 'skill'),
    bladeDmg: dmgNode('atk', dm.skill.bladeDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    heal: healNodeTalent(
      'atk',
      dm.burst.healPercent,
      dm.burst.healFlat,
      'burst'
    ),
  },
  passive1: {
    heal: greaterEq(
      input.asc,
      1,
      healNode('atk', percent(dm.passive1.heal), 0)
    ),
  },
  constellation2: {
    c2Stacks_cryo_dmgInc,
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'skill'
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
  },
  teamBuff: {
    premod: {
      cryo_enemyRes_: a4SkillBurstHit_cryo_enemyRes_,
      hydro_enemyRes_: a4SkillBurstHit_hydro_enemyRes_,
      cryo_critDMG_: c1AfterSkillBurst_cryo_critDMG_,
      cryo_dmgInc: c2Stacks_cryo_dmgInc,
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
          name: ct.chg(`auto.skillParams.${i === 3 ? 2 : i}`),
          textSuffix: i >= 2 ? `(${i - 1})` : undefined,
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
          node: infoMut(dmgFormulas.skill.skillDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.parfaitDmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.duration,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.bladeDmg, {
            name: ct.chg(`skill.skillParams.3`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.bladeInterval,
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
          node: infoMut(dmgFormulas.burst.heal, {
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
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.heal, { name: stg('healing') }),
        },
        {
          text: stg('duration'),
          value: (data) =>
            data.get(input.constellation).value >= 4
              ? `${dm.passive1.duration}s + ${dm.constellation4.durationInc}s = ${dm.passive1.duration + dm.constellation4.durationInc}`
              : dm.passive1.duration,
          unit: 's',
        },
      ],
    }),
    ct.headerTem('constellation4', {
      fields: [
        {
          text: st('durationInc'),
          value: dm.constellation4.durationInc,
          unit: 's',
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4SkillBurstHitPath,
      value: condA4SkillBurstHit,
      teamBuff: true,
      name: st('hitOp.skillOrBurst'),
      states: {
        on: {
          fields: [
            {
              node: a4SkillBurstHit_hydro_enemyRes_,
            },
            {
              node: a4SkillBurstHit_cryo_enemyRes_,
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
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1AfterSkillBurstPath,
      value: condC1AfterSkillBurst,
      teamBuff: true,
      name: st('afterUse.skillOrBurst'),
      states: {
        on: {
          fields: [
            {
              node: c1AfterSkillBurst_cryo_critDMG_,
            },
            {
              canShow: (data) =>
                data.get(unequal(hydroCryoTeammates, 4, 1)).value === 1,
              text: ct.ch('c1Disabled'),
            },
          ],
        },
      },
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2StacksPath,
      value: condC2Stacks,
      teamBuff: true,
      name: ct.ch('c2Cond'),
      states: {
        on: {
          fields: [
            {
              node: c2Stacks_cryo_dmgIncDisp,
            },
            {
              text: st('triggerQuota'),
              value: dm.constellation2.triggerQuota,
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
          text: st('triggerQuota'),
          value: dm.constellation6.triggerQuota,
        },
        {
          text: stg('cd'),
          value: dm.constellation6.cd,
          unit: 's',
          fixed: 1,
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
