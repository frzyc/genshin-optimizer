import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
  subscript,
  sum,
} from '../../../Formula/utils'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
} from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'
const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'SangonomiyaKokomi'
const elementKey: ElementKey = 'hydro'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  c6i = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    heal_: skillParam_gen.skill[s++],
    heal: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    heal_: skillParam_gen.burst[b++],
    heal: skillParam_gen.burst[b++],
    nBonus_: skillParam_gen.burst[b++],
    cBonus_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    sBonus_: skillParam_gen.burst[b++],
  },
  p: {
    heal_: 0.25,
    critRate_: -1,
  },
  p2: {
    heal_ratio_: skillParam_gen.passive2[0][0],
  },
  c1: {
    hp_: skillParam_gen.constellation1[0],
  },
  c2: {
    s_heal_: skillParam_gen.constellation2[1],
    nc_heal_: skillParam_gen.constellation2[2],
  },
  c4: {
    atkSPD_: skillParam_gen.constellation4[0],
    energy: skillParam_gen.constellation4[1],
  },
  c6: {
    hp_: skillParam_gen.constellation6[c6i++],
    hydro_: skillParam_gen.constellation6[c6i++],
    duration: skillParam_gen.constellation6[c6i++],
  },
} as const

const [condBurstPath, condBurst] = cond(key, 'burst')
const [condC2Path, condC2] = cond(key, 'c2')
const [condC6Path, condC6] = cond(key, 'c6')

const burstNormalDmgInc = equal(
  condBurst,
  'on',
  prod(
    sum(
      subscript(input.total.burstIndex, dm.burst.nBonus_, { unit: '%' }),
      greaterEq(
        input.asc,
        4,
        prod(percent(dm.p2.heal_ratio_), input.premod.heal_)
      )
    ),
    input.premod.hp
  ),
  { variant: 'invalid' }
)
const burstChargedDmgInc = equal(
  condBurst,
  'on',
  prod(
    sum(
      subscript(input.total.burstIndex, dm.burst.cBonus_, { unit: '%' }),
      greaterEq(
        input.asc,
        4,
        prod(percent(dm.p2.heal_ratio_), input.premod.heal_)
      )
    ),
    input.premod.hp
  ),
  { variant: 'invalid' }
)
const burstSkillDmgInc = equal(
  condBurst,
  'on',
  prod(
    subscript(input.total.burstIndex, dm.burst.sBonus_, { unit: '%' }),
    input.premod.hp
  )
)

const passiveHeal_ = constant(dm.p.heal_)
const passiveCritRate_ = constant(dm.p.critRate_)
const c2SkillHeal = greaterEq(
  input.constellation,
  2,
  equal(condC2, 'on', prod(percent(dm.c2.s_heal_), input.total.hp))
)
const c2BurstHeal = greaterEq(
  input.constellation,
  2,
  equal(condC2, 'on', prod(percent(dm.c2.nc_heal_), input.total.hp))
)
const c4AtkSpd_ = greaterEq(input.constellation, 4, dm.c4.atkSPD_)
const c6Hydro_ = greaterEq(
  input.constellation,
  6,
  equal(condC6, 'on', dm.c6.hydro_)
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    heal: healNodeTalent('hp', dm.skill.heal_, dm.skill.heal, 'skill', {
      premod: { healInc: c2SkillHeal },
    }),
  },
  burst: {
    dmg: dmgNode('hp', dm.burst.dmg, 'burst'),
    heal: healNodeTalent('hp', dm.burst.heal_, dm.burst.heal, 'burst', {
      premod: { healInc: c2BurstHeal },
    }),
  },
  constellation1: {
    dmg: greaterEq(
      input.constellation,
      1,
      customDmgNode(prod(input.total.hp, percent(dm.c1.hp_)), 'elemental', {
        hit: { ele: constant(elementKey) },
      })
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'liyue',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC5,
      burstBoost: nodeC3,
      heal_: passiveHeal_,
      critRate_: passiveCritRate_,
      atkSPD_: c4AtkSpd_,
      hydro_dmg_: c6Hydro_,
      // TODO: below should be for `total`
      normal_dmgInc: burstNormalDmgInc,
      charged_dmgInc: burstChargedDmgInc,
      skill_dmgInc: burstSkillDmgInc,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: 'F',
  constellationName: ct.chg('constellationName'),
  title: ct.chg('title'),
  talent: {
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
            value: dm.charged.stamina,
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
            node: infoMut(dmgFormulas.skill.heal, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.duration,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.3'),
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
            node: infoMut(dmgFormulas.burst.dmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.6'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.7'),
            value: dm.burst.enerCost,
          },
        ],
      },
      ct.condTem('burst', {
        value: condBurst,
        path: condBurstPath,
        name: ct.ch('burst'),
        states: {
          on: {
            fields: [
              {
                node: burstNormalDmgInc,
              },
              {
                node: burstChargedDmgInc,
              },
              {
                node: burstSkillDmgInc,
              },
              {
                node: infoMut(dmgFormulas.burst.heal, {
                  name: ct.chg(`burst.skillParams.4`),
                  variant: 'heal',
                }),
              },
              {
                text: ct.chg('burst.skillParams.5'),
                value: dm.burst.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),

    passive: ct.talentTem('passive', [
      {
        fields: [
          {
            node: passiveHeal_,
          },
          {
            node: passiveCritRate_,
          },
        ],
      },
    ]),
    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.fieldsTem('constellation1', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation1.dmg, { name: st('dmg') }),
          },
        ],
      }),
    ]),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        path: condC2Path,
        value: condC2,
        name: ct.ch('c2'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(c2SkillHeal, { name: ct.ch('c2SkillHeal') }),
              },
              {
                node: infoMut(c2BurstHeal, { name: ct.ch('c2BurstHeal') }),
              },
            ],
          },
        },
      }),
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      { fields: [{ node: c4AtkSpd_ }] },
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.condTem('constellation6', {
        path: condC6Path,
        value: condC6,
        name: ct.ch('c6'),
        states: {
          on: { fields: [{ node: c6Hydro_ }] },
        },
      }),
    ]),
  },
}
export default new CharacterSheet(sheet, data)
