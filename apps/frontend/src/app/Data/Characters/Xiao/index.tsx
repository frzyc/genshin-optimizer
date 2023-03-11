import type { CharacterData } from '@genshin-optimizer/pipeline'
import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula'
import {
  equal,
  equalStr,
  greaterEq,
  infoMut,
  lookup,
  naught,
  prod,
  subscript,
  unequal,
} from '../../../Formula/utils'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Xiao'
const elementKey: ElementKey = 'anemo'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[2], // 2
      skillParam_gen.auto[3], // 3
      skillParam_gen.auto[4], // 4
      skillParam_gen.auto[6], // 5
      skillParam_gen.auto[7], // 6
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[8], // 1
    stamina: skillParam_gen.auto[9][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[10],
    low: skillParam_gen.auto[11],
    high: skillParam_gen.auto[12],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmgBonus: skillParam_gen.burst[b++],
    drain: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmgBonus: skillParam_gen.passive1[0][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    skillDmgBonus: skillParam_gen.passive2[1][0],
    maxStacks: skillParam_gen.passive2[2][0],
  },
  passive3: {
    staminaClimbingDec_: 0.2,
  },
  constellation2: {
    enerRech_: skillParam_gen.constellation2[0],
  },
  constellation4: {
    hpThresh: skillParam_gen.constellation4[0],
    def_: skillParam_gen.constellation4[1],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
  },
} as const

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg1: dmgNode('atk', dm.charged.dmg1, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    press: dmgNode('atk', dm.skill.press, 'skill'),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

const [condInBurstPath, condInBurst] = cond(key, 'inBurst')
const auto_dmg_ = subscript(input.total.burstIndex, dm.burst.dmgBonus, {
  unit: '%',
})
const normal_dmg_ = equal('inBurst', condInBurst, auto_dmg_, { unit: '%' })
const charged_dmg_ = { ...normal_dmg_ }
const plunging_dmg_ = { ...normal_dmg_ }
const lifeDrain = subscript(input.total.burstIndex, dm.burst.drain)
const infusion = equalStr('inBurst', condInBurst, elementKey)

const [condA1BurstStackPath, condA1BurstStack] = cond(key, 'a1BurstStack')
const a1BurstStackArr = range(0, 4)
const all_dmg_ = greaterEq(
  input.asc,
  1,
  equal(
    'inBurst',
    condInBurst,
    lookup(
      condA1BurstStack,
      Object.fromEntries(
        a1BurstStackArr.map((i) => [i, prod(dm.passive1.dmgBonus, i + 1)])
      ),
      naught
    )
  )
)

const [condA4SkillStackPath, condA4SkillStack] = cond(key, 'a4SkillStack')
const a4SkillStackArr = range(1, dm.passive2.maxStacks)
const skill_dmg_ = greaterEq(
  input.asc,
  4,
  lookup(
    condA4SkillStack,
    Object.fromEntries(
      a4SkillStackArr.map((i) => [i, prod(dm.passive2.skillDmgBonus, i)])
    ),
    naught
  )
)

const c2Inactive = greaterEq(
  input.constellation,
  2,
  unequal(input.activeCharKey, key, 1)
)
const c2Inactive_enerRech_ = equal(c2Inactive, 1, dm.constellation2.enerRech_)

const [condC4BelowHPPath, condC4BelowHP] = cond(key, 'c4BelowHP')
const c4BelowHP_def_ = greaterEq(
  input.constellation,
  4,
  equal('c4BelowHP', condC4BelowHP, dm.constellation4.def_)
)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'liyue',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC3,
      burstBoost: nodeC5,
      normal_dmg_,
      charged_dmg_,
      plunging_dmg_,
      all_dmg_,
      skill_dmg_,
      enerRech_: c2Inactive_enerRech_,
      def_: c4BelowHP_def_,
    },
    infusion: {
      nonOverridableSelf: infusion,
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
            name: ct.chg(`auto.skillParams.${i}`),
            multi: i === 0 ? 2 : undefined,
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
              name: ct.chg(`auto.skillParams.6`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.7'),
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
            node: infoMut(dmgFormulas.skill.press, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: dm.skill.cd,
            unit: 's',
          },
          {
            text: st('charges'),
            value: (data) => (data.get(input.constellation).value >= 1 ? 3 : 2),
          },
        ],
      },
      ct.condTem('passive2', {
        // A4
        path: condA4SkillStackPath,
        value: condA4SkillStack,
        name: ct.ch('skillStack'),
        states: Object.fromEntries(
          a4SkillStackArr.map((i) => [
            i,
            {
              name: st('uses', { count: i }),
              fields: [{ node: skill_dmg_ }],
            },
          ])
        ),
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(auto_dmg_, {
              name: ct.ch('burst.autoAtkDmgBonus_'),
              unit: '%',
            }),
          },
          {
            node: infoMut(lifeDrain, {
              name: ct.ch('burst.lifeDrain_'),
              textSuffix: ct.ch('burst.currentHPPerSec'),
              unit: '%',
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
      ct.condTem('burst', {
        path: condInBurstPath,
        value: condInBurst,
        name: ct.ch('burst.inBurst'),
        states: {
          inBurst: {
            fields: [
              {
                node: normal_dmg_,
              },
              {
                node: charged_dmg_,
              },
              {
                node: plunging_dmg_,
              },
              {
                text: ct.ch('burst.incJump'),
              },
              {
                text: ct.ch('burst.incAtkAoe'),
              },
              {
                canShow: (data) => data.get(infusion).value === elementKey,
                text: (
                  <ColorText color="anemo">{st('infusion.anemo')}</ColorText>
                ),
              },
            ],
          },
        },
      }),
      ct.condTem('passive1', {
        // A1
        path: condA1BurstStackPath,
        value: condA1BurstStack,
        name: ct.ch('burst.stack'),
        canShow: equal('inBurst', condInBurst, 1),
        states: Object.fromEntries(
          a1BurstStackArr.map((i) => [
            i,
            {
              name: st('seconds', { count: i * 3 }),
              fields: [{ node: all_dmg_ }],
            },
          ])
        ),
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      ct.fieldsTem('constellation2', {
        canShow: equal(c2Inactive, 1, 1),
        teamBuff: true,
        fields: [{ node: c2Inactive_enerRech_ }],
      }),
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.condTem('constellation4', {
        path: condC4BelowHPPath,
        value: condC4BelowHP,
        name: st('lessPercentHP', {
          percent: dm.constellation4.hpThresh * 100,
        }),
        states: {
          c4BelowHP: {
            fields: [{ node: c4BelowHP_def_ }],
          },
        },
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)
