import { ColorText } from '@genshin-optimizer/common/ui'
import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allEleResKeys } from '@genshin-optimizer/gi/keymap'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  greaterEqStr,
  infoMut,
  input,
  lookup,
  max,
  min,
  naught,
  percent,
  prod,
  subscript,
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
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Arlecchino'
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
      skillParam_gen.auto[++a], // 6
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  infusion: {
    normal_dmgInc: skillParam_gen.auto[++a],
    bondConsumption: skillParam_gen.auto[++a][0],
    bondLimit: skillParam_gen.auto[++a][0],
  },
  charged_dash_stam: skillParam_gen.auto[++a][0],
  skill: {
    spikeDmg: skillParam_gen.skill[s++],
    finalDmg: skillParam_gen.skill[s++],
    sigilDmg: skillParam_gen.skill[s++],
    maxInstances: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    dmgInterval: skillParam_gen.skill[s++][0],
    bond: skillParam_gen.skill[s++][0],
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    idk: skillParam_gen.burst[b++][0],
    healBond: skillParam_gen.burst[b++][0],
    healAtk: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    interval: skillParam_gen.passive1[0][0],
    baseBond: skillParam_gen.passive1[1][0],
    bond: skillParam_gen.passive1[2][0],
  },
  passive2: {
    atkThresh: skillParam_gen.passive2[0][0],
    res: skillParam_gen.passive2[1][0],
    maxRes: skillParam_gen.passive2[2][0],
    maxAttack: skillParam_gen.passive2[3][0],
  },
  passive3: {
    pyro_dmg_: skillParam_gen.passive3![0][0],
    idk1: skillParam_gen.passive3![1][0],
    idk2: skillParam_gen.passive3![2][0],
  },
  constellation1: {
    infusionDmgInc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    bloodfireDmg: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
    all_res_: skillParam_gen.constellation2[2],
    duration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    cdReduce: skillParam_gen.constellation4[0],
    energyRegen: skillParam_gen.constellation4[1],
    cd: skillParam_gen.constellation4[2],
  },
  constellation6: {
    normal_burst_critRate_: skillParam_gen.constellation6[0],
    normal_burst_critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
    cd: skillParam_gen.constellation6[3],
    burstDmg: skillParam_gen.constellation6[4],
  },
} as const

const bondPercentArr = range(10, 200, 5)
const [condBondPercentPath, condBondPercent] = cond(key, 'bondPercent')
const bondPercent = lookup(
  condBondPercent,
  objKeyMap(bondPercentArr, (per) => percent(per / 100)),
  naught,
)

const infusion = greaterEqStr(
  bondPercent,
  dm.infusion.bondLimit,
  constant('pyro'),
)

const bond_normal_dmgInc = prod(
  subscript(input.total.autoIndex, dm.infusion.normal_dmgInc, { unit: '%' }),
  input.total.atk,
  bondPercent,
)

const a0_pyro_dmg_ = percent(dm.passive3.pyro_dmg_)

const c1_normal_dmgInc = greaterEq(
  input.constellation,
  1,
  prod(percent(dm.constellation1.infusionDmgInc), input.total.atk, bondPercent),
)

const [condC2AfterAbsorbPath, condC2AfterAbsorb] = cond(key, 'c2AfterAbsorb')
const c2AfterAbsorb_res_ = greaterEq(
  input.constellation,
  2,
  equal(condC2AfterAbsorb, 'on', dm.constellation2.all_res_),
)
const c2AfterAbsorb_all_res_ = objKeyMap(allEleResKeys, (key) =>
  infoMut({ ...c2AfterAbsorb_res_ }, { path: key }),
)

const c6BondPercent_dmgInc = greaterEq(
  input.constellation,
  6,
  prod(percent(dm.constellation6.burstDmg), input.total.atk, bondPercent),
)

const [condC6AfterSkillPath, condC6AfterSkill] = cond(key, 'c6AfterSkill')
const c6AfterSkill_normal_critRate_ = greaterEq(
  input.constellation,
  6,
  equal(condC6AfterSkill, 'on', dm.constellation6.normal_burst_critRate_),
)
const c6AfterSkill_burst_critRate_ = { ...c6AfterSkill_normal_critRate_ }

const c6AfterSkill_normal_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condC6AfterSkill, 'on', dm.constellation6.normal_burst_critDMG_),
)
const c6AfterSkill_burst_critDMG_ = { ...c6AfterSkill_normal_critDMG_ }

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')]),
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    spikeDmg: dmgNode('atk', dm.skill.spikeDmg, 'skill'),
    finalDmg: dmgNode('atk', dm.skill.finalDmg, 'skill'),
    sigilDmg: dmgNode('atk', dm.skill.sigilDmg, 'skill'),
  },
  burst: {
    burstDmg: dmgNode('atk', dm.burst.burstDmg, 'burst'),
  },
  passive2: objKeyMap(allEleResKeys, (key) =>
    infoMut(
      greaterEq(
        input.asc,
        4,
        min(
          prod(
            max(sum(input.total.atk, -dm.passive2.atkThresh), 0),
            percent(1 / (dm.passive2.maxAttack / dm.passive2.maxRes)),
          ),
          percent(dm.passive2.maxRes),
        ),
      ),
      { path: key },
    ),
  ),
  constellation2: {
    bloodfireDmg: greaterEq(
      input.constellation,
      2,
      greaterEq(
        input.asc,
        1,
        customDmgNode(
          prod(percent(dm.constellation2.bloodfireDmg), input.total.atk),
          'elemental',
          { hit: { ele: constant('pyro') } },
        ),
      ),
    ),
  },
}
const autoC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    autoBoost: autoC3,
    burstBoost: burstC5,
    ...objKeyMap(allEleResKeys, (key) =>
      sum(dmgFormulas.passive2[key], c2AfterAbsorb_all_res_[key]),
    ),
    normal_dmgInc: sum(bond_normal_dmgInc, c1_normal_dmgInc),
    normal_critRate_: c6AfterSkill_normal_critRate_,
    normal_critDMG_: c6AfterSkill_normal_critDMG_,
    burst_critRate_: c6AfterSkill_burst_critRate_,
    burst_critDMG_: c6AfterSkill_burst_critDMG_,
    burst_dmgInc: c6BondPercent_dmgInc,
    pyro_dmg_: a0_pyro_dmg_,
  },
  infusion: {
    nonOverridableSelf: infusion,
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
          name: ct.chg(`auto.skillParams.${i + 1}`),
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
            name: ct.chg(`auto.skillParams.7`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.8'),
          value: dm.charged.stam,
        },
        {
          text: ct.chg('auto.skillParams.9'),
          value: dm.charged_dash_stam,
          unit: '/s',
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
    {
      text: ct.chg('auto.fields.infusion'),
    },
    ct.condTem('auto', {
      path: condBondPercentPath,
      value: condBondPercent,
      name: st('bond.current'),
      states: objKeyMap(bondPercentArr, (percent) => ({
        name: `${percent}%`,
        fields: [
          {
            canShow: (data) => data.get(bondPercent).value >= 0.3,
            text: <ColorText color="pyro">{st('infusion.pyro')}</ColorText>,
          },
          {
            node: infoMut(bond_normal_dmgInc, { path: 'normal_dmgInc' }),
          },
        ],
      })),
    }),
    ct.headerTem('constellation1', {
      fields: [
        {
          node: infoMut(c1_normal_dmgInc, { path: 'normal_dmgInc' }),
        },
      ],
    }),
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.spikeDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.finalDmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sigilDmg, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('constellation6', {
      path: condC6AfterSkillPath,
      value: condC6AfterSkill,
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: c6AfterSkill_normal_critRate_,
            },
            {
              node: c6AfterSkill_normal_critDMG_,
            },
            {
              node: c6AfterSkill_burst_critRate_,
            },
            {
              node: c6AfterSkill_burst_critDMG_,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.duration,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: dm.constellation6.cd,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.burstDmg, {
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
    ct.condTem('constellation6', {
      path: condBondPercentPath,
      value: condBondPercent,
      name: st('bond.current'),
      states: objKeyMap(bondPercentArr, (percent) => ({
        name: `${percent}%`,
        fields: [
          {
            node: c6BondPercent_dmgInc,
          },
        ],
      })),
    }),
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    { fields: Object.values(dmgFormulas.passive2).map((node) => ({ node })) },
  ]),
  passive3: ct.talentTem('passive3', [{ fields: [{ node: a0_pyro_dmg_ }] }]),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.bloodfireDmg, {
            name: ct.ch('bloodfireDmg'),
          }),
        },
        {
          text: stg('cd'),
          value: dm.constellation2.cd,
          unit: 's',
        },
      ],
    }),
    ct.condTem('constellation2', {
      path: condC2AfterAbsorbPath,
      value: condC2AfterAbsorb,
      name: ct.ch('c2Cond'),
      states: {
        on: {
          fields: Object.values(c2AfterAbsorb_all_res_).map((node) => ({
            node,
          })),
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: autoC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
