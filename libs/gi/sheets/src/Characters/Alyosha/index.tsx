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
  min,
  naught,
  percent,
  prod,
  subscript,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  plungingDmgNodes,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Alyosha'
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
    pressDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    markDuration: skillParam_gen.skill[s++][0],
    precisionAtk_: skillParam_gen.skill[s++],
    precisionDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    fieldDmg: skillParam_gen.burst[b++],
    tugarinDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    heal: skillParam_gen.passive1[0][0],
  },
  passive2: {
    skillBurst_dmg_: skillParam_gen.passive2[0][0],
    maxEnerRech_: skillParam_gen.passive2[1][0],
  },
  passive3: {
    stellarconduct_dmg_: skillParam_gen.passive3![0][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    heal: skillParam_gen.constellation4[0],
  },
  constellation6: {
    eleMas: skillParam_gen.constellation6[0],
  },
} as const

const [condSkillPrecisionPath, condSkillPrecision] = cond(key, 'skillPrecision')
const skillPrecision = lookup(
  condSkillPrecision,
  {
    1: constant(1),
    2: greaterEq(input.constellation, 6, 2),
  },
  naught
)
const skillPrecision_atk_disp = infoMut(
  prod(
    skillPrecision,
    subscript(input.total.skillIndex, dm.skill.precisionAtk_)
  ),
  { path: 'atk_', isTeamBuff: true }
)
const skillPrecision_atk_ = equal(
  input.activeCharKey,
  target.charKey,
  skillPrecision_atk_disp
)

const [condA0StellarRadianceScPath, condA0StellarRadianceSc] = cond(
  key,
  'a0StellarRadianceSc'
)
const a0Precision_stellarconduct_dmg_disp = infoMut(
  equal(
    condA0StellarRadianceSc,
    'on',
    prod(skillPrecision, dm.passive3.stellarconduct_dmg_)
  ),
  { path: 'stellarconduct_dmg_', isTeamBuff: true }
)
const a0Precision_stellarconduct_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  a0Precision_stellarconduct_dmg_disp
)

const a4_skill_dmg_ = greaterEq(
  input.asc,
  4,
  prod(
    percent(dm.passive2.skillBurst_dmg_),
    min(prod(input.total.enerRech_, 100), dm.passive2.maxEnerRech_)
  )
)
const a4_burst_dmg_ = { ...a4_skill_dmg_ }

const c6Precision_eleMasDisp = infoMut(
  greaterEq(
    input.constellation,
    6,
    equal(condSkillPrecision, '2', dm.constellation6.eleMas)
  ),
  { path: 'eleMas', isTeamBuff: true }
)
const c6Precision_eleMas = equal(
  input.activeCharKey,
  target.charKey,
  c6Precision_eleMasDisp
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
    pressDmg: dmgNode('atk', dm.skill.pressDmg, 'skill'),
    holdDmg: dmgNode('atk', dm.skill.holdDmg, 'skill'),
  },
  burst: {
    fieldDmg: dmgNode('atk', dm.burst.fieldDmg, 'burst'),
    tugarinDmg: dmgNode('atk', dm.burst.tugarinDmg, 'burst'),
  },
  passive1: {
    heal: greaterEq(input.asc, 1, healNode('atk', dm.passive1.heal, 0)),
  },
  passive2: {
    a4_skill_dmg_,
    a4_burst_dmg_,
  },
  constellation4: {
    heal: greaterEq(
      input.constellation,
      4,
      healNode('atk', dm.constellation4.heal, 0)
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    skill_dmg_: a4_skill_dmg_,
    burst_dmg_: a4_burst_dmg_,
  },
  teamBuff: {
    premod: {
      atk_: skillPrecision_atk_,
      stellarconduct_dmg_: a0Precision_stellarconduct_dmg_,
      eleMas: c6Precision_eleMas,
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
          textSuffix: i === 2 || i === 3 ? `(${i - 1})` : undefined,
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
            name: ct.chg('auto.skillParams.4'),
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
          node: infoMut(dmgFormulas.skill.pressDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.holdDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.3'),
          value: dm.skill.markDuration,
          unit: 's',
        },
      ],
    },
    ct.condTem('skill', {
      path: condSkillPrecisionPath,
      value: condSkillPrecision,
      name: ct.ch('skillCond'),
      teamBuff: true,
      states: (data) =>
        objKeyMap(
          data.get(input.constellation).value >= 6 ? range(1, 2) : range(1, 1),
          (stack) => ({
            name: st('stack', { count: stack }),
            fields: [{ node: skillPrecision_atk_disp }],
          })
        ),
    }),
    ct.headerTem('passive3', {
      teamBuff: true,
      canShow: greaterEq(a0Precision_stellarconduct_dmg_disp, 0.01, 1),
      fields: [{ node: a0Precision_stellarconduct_dmg_disp }],
    }),
    ct.headerTem('constellation6', {
      teamBuff: true,
      canShow: greaterEq(c6Precision_eleMasDisp, 0.01, 1),
      fields: [{ node: c6Precision_eleMasDisp }],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.fieldDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.tugarinDmg, {
            name: ct.chg('burst.skillParams.1'),
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

  passive1: ct.talentTem('passive1', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.heal, { name: stg('healing') }),
        },
      ],
    },
  ]),
  passive2: ct.talentTem('passive2', [
    {
      fields: [
        {
          node: dmgFormulas.passive2.a4_skill_dmg_,
        },
        {
          node: dmgFormulas.passive2.a4_burst_dmg_,
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3', [
    ct.condTem('passive3', {
      path: condA0StellarRadianceScPath,
      value: condA0StellarRadianceSc,
      name: st('elementalReaction.polestar.inside'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              text: st('elementalReaction.stellar.gainRadianceSc'),
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation4.heal, {
            name: stg('healing'),
          }),
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
