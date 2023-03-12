import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../Formula/index'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
  subscript,
  sum,
  unequal,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { absorbableEle } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'

const data_gen = data_gen_src as CharacterData
const key: CharacterKey = 'ShikanoinHeizou'
const elementKey: ElementKey = 'anemo'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 4.3
      skillParam_gen.auto[a++], // 5
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
    dmg: skillParam_gen.skill[s++],
    declension_dmg_: skillParam_gen.skill[s++],
    conviction_dmg_: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    declension_duration: skillParam_gen.skill[s++][0],
  },
  burst: {
    slugger_dmg: skillParam_gen.burst[b++],
    iris_dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[p2++][0],
    eleMas: skillParam_gen.passive2[p2++][0],
  },
  passive3: {
    staminaSprintDec_: 0.25,
  },
  constellation1: {
    duration: skillParam_gen.constellation1[0],
    atkSpd_: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
  },
  constellation4: {
    baseEnergy: skillParam_gen.constellation4[0],
    addlEnergy: skillParam_gen.constellation4[1],
  },
  constellation6: {
    hsCritRate_: skillParam_gen.constellation6[0],
    hsCritDmg_: skillParam_gen.constellation6[1],
  },
} as const

const stacksArr = range(1, 4)
const [condDeclensionStacksPath, condDeclensionStacks] = cond(
  key,
  'declensionStacks'
)
const declension_dmg_ = lookup(
  condDeclensionStacks,
  Object.fromEntries(
    stacksArr.map((stacks) => [
      stacks,
      prod(
        subscript(input.total.skillIndex, dm.skill.declension_dmg_, {
          name: st('bonusScaling.skill_'),
          unit: '%',
        }),
        constant(stacks, { name: ct.ch('declensionStacks') })
      ),
    ])
  ),
  naught,
  { name: st('bonusScaling.skill_'), unit: '%' }
)
const conviction_dmg_ = equal(
  condDeclensionStacks,
  '4',
  subscript(input.total.skillIndex, dm.skill.conviction_dmg_, { unit: '%' }),
  { name: st('bonusScaling.skill_'), unit: '%' }
)
const totalStacks_dmg_ = sum(declension_dmg_, conviction_dmg_)

const [condSkillHitPath, condSkillHit] = cond(key, 'skillHit')
const a4_eleMasDisp = greaterEq(
  input.asc,
  4,
  equal(condSkillHit, 'on', dm.passive2.eleMas)
)
const a4_eleMas = unequal(target.charKey, key, a4_eleMasDisp)

// TODO: After non-stacking buffs
// const staminaSprintDec_ = percent(dm.passive3.staminaSprintDec_)

const [condTakeFieldPath, condTakeField] = cond(key, 'takeField')
const c1_atkSpd_ = greaterEq(
  input.constellation,
  1,
  equal(condTakeField, 'on', percent(dm.constellation1.atkSpd_))
)

const c6_skill_critRate_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condDeclensionStacks,
    Object.fromEntries(
      stacksArr.map((stacks) => [
        stacks,
        prod(
          percent(dm.constellation6.hsCritRate_),
          constant(stacks, { name: ct.ch('declensionStacks') })
        ),
      ])
    ),
    naught
  )
)
const c6_skill_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condDeclensionStacks, '4', percent(dm.constellation6.hsCritDmg_))
)

export const dmgFormulas = {
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
    dmg: customDmgNode(
      prod(
        sum(
          subscript(input.total.skillIndex, dm.skill.dmg, { unit: '%' }),
          totalStacks_dmg_
        ),
        input.total.atk
      ),
      'skill',
      { hit: { ele: constant('anemo') } }
    ),
  },
  burst: {
    slugger_dmg: dmgNode('atk', dm.burst.slugger_dmg, 'burst'),
    ...Object.fromEntries(
      absorbableEle.map((ele) => [
        `${ele}_iris_dmg`,
        dmgNode('atk', dm.burst.iris_dmg, 'burst', {
          hit: { ele: constant(ele) },
        }),
      ])
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'inazuma',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC3,
      burstBoost: burstC5,
      atkSPD_: c1_atkSpd_,
      skill_critRate_: c6_skill_critRate_,
      skill_critDMG_: c6_skill_critDMG_,
    },
    teamBuff: {
      premod: {
        // TODO: after non-stacking buffs
        // staminaSprintDec_
        eleMas: a4_eleMas,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: 'M',
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
            name: ct.chg(`auto.skillParams.${i > 2 ? (i < 6 ? 3 : 4) : i}`),
            textSuffix: i > 2 && i < 6 ? `(${i - 2})` : undefined,
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
            node: infoMut(dmgFormulas.skill.dmg, {
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
      ct.condTem('skill', {
        path: condDeclensionStacksPath,
        value: condDeclensionStacks,
        name: ct.ch('declensionStacks'),
        states: Object.fromEntries(
          stacksArr.map((stacks) => [
            stacks,
            {
              name: st('stack', { count: stacks }),
              fields: [
                {
                  node: infoMut(totalStacks_dmg_, {
                    name: st('bonusScaling.skill_'),
                    unit: '%',
                  }),
                },
                {
                  canShow: (data) =>
                    data.get(condDeclensionStacks).value === '4',
                  text: st('aoeInc'),
                },
                {
                  text: stg('duration'),
                  value: dm.skill.declension_duration,
                  unit: 's',
                },
              ],
            },
          ])
        ),
      }),
      ct.condTem('passive2', {
        path: condSkillHitPath,
        value: condSkillHit,
        name: st('hitOp.skill'),
        teamBuff: true,
        canShow: unequal(target.charKey, input.activeCharKey, 1),
        states: {
          on: {
            fields: [
              {
                node: infoMut(a4_eleMasDisp, KeyMap.info('eleMas')),
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
      ct.headerTem('constellation6', {
        fields: [
          {
            node: c6_skill_critRate_,
          },
          {
            node: c6_skill_critDMG_,
          },
        ],
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.slugger_dmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          ...absorbableEle.map((ele) => ({
            node: infoMut(dmgFormulas.burst[`${ele}_iris_dmg`], {
              name: ct.chg(`burst.skillParams.1`),
            }),
          })),
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
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem(
      'passive3' /* TODO: after non-stacking buffs, [{ fields: [{ node: staminaSprintDec_ }] }]*/
    ),
    constellation1: ct.talentTem('constellation1', [
      ct.condTem('constellation1', {
        path: condTakeFieldPath,
        value: condTakeField,
        name: ct.ch('takingField'),
        states: {
          on: {
            fields: [
              {
                node: c1_atkSpd_,
              },
              {
                text: stg('duration'),
                value: dm.constellation1.duration,
                unit: 's',
              },
              {
                text: stg('cd'),
                value: dm.constellation1.cd,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: skillC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: burstC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
