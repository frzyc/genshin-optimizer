import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  prod,
} from '../../../Formula/utils'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import {
  dataObjForCharacterSheet,
  dmgNode,
  shieldElement,
  shieldNodeTalent,
} from '../dataUtil'

const key: CharacterKey = 'Thoma'
const elementKey: ElementKey = 'pyro'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
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
    hpShield_: skillParam_gen.skill[s++],
    baseShield: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    maxHpShield_: skillParam_gen.skill[s++],
    maxBaseShield: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    collapseDmg: skillParam_gen.burst[b++],
    hpShield_: skillParam_gen.burst[b++],
    baseShield: skillParam_gen.burst[b++],
    shieldDuration: skillParam_gen.burst[b++][0],
    unknown: skillParam_gen.burst[b++][0],
    scorchingDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    shield_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: skillParam_gen.passive1[2][0],
    cd: skillParam_gen.passive1[3][0],
  },
  passive2: {
    collapse_dmgInc: skillParam_gen.passive2[0][0],
  },
  c2: {
    burstDuration: skillParam_gen.constellation2[0],
  },
  c4: {
    energyRestore: skillParam_gen.constellation4[0],
  },
  c6: {
    auto_dmg: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const [condP1BarrierStacksPath, condP1BarrierStacks] = cond(
  key,
  'p1BarrierStacks'
)
// This should technically only apply to the active character, but I am trying
// to minimize the amount of jank active character fixes.
const p1_shield_ = greaterEq(
  input.asc,
  1,
  lookup(
    condP1BarrierStacks,
    Object.fromEntries(
      range(1, dm.passive1.maxStacks).map((stacks) => [
        stacks,
        constant(stacks * dm.passive1.shield_),
      ])
    ),
    naught
  )
)

const p2Collapse_dmgInc = greaterEq(
  input.asc,
  4,
  prod(input.total.hp, dm.passive2.collapse_dmgInc)
)

const [condC6AfterBarrierPath, condC6AfterBarrier] = cond(key, 'c6AfterBarrier')
const c6_normal_dmg_ = greaterEq(
  input.constellation,
  6,
  equal(condC6AfterBarrier, 'on', dm.c6.auto_dmg)
)
const c6_charged_dmg_ = { ...c6_normal_dmg_ }
const c6_plunging_dmg_ = { ...c6_normal_dmg_ }

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg1: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    minShield: shieldNodeTalent(
      'hp',
      dm.skill.hpShield_,
      dm.skill.baseShield,
      'skill'
    ),
    minPyroShield: shieldElement(
      'pyro',
      shieldNodeTalent('hp', dm.skill.hpShield_, dm.skill.baseShield, 'skill')
    ),
    maxShield: shieldNodeTalent(
      'hp',
      dm.skill.maxHpShield_,
      dm.skill.maxBaseShield,
      'skill'
    ),
    maxPyroShield: shieldElement(
      'pyro',
      shieldNodeTalent(
        'hp',
        dm.skill.maxHpShield_,
        dm.skill.maxBaseShield,
        'skill'
      )
    ),
  },
  burst: {
    pressDmg: dmgNode('atk', dm.burst.pressDmg, 'burst'),
    collapseDmg: dmgNode('atk', dm.burst.collapseDmg, 'burst', {
      premod: { burst_dmgInc: p2Collapse_dmgInc },
    }),
    shield: shieldNodeTalent(
      'hp',
      dm.burst.hpShield_,
      dm.burst.baseShield,
      'burst'
    ),
    pyroShield: shieldElement(
      'pyro',
      shieldNodeTalent('hp', dm.burst.hpShield_, dm.burst.baseShield, 'burst')
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
    },
    teamBuff: {
      premod: {
        shield_: p1_shield_,
        normal_dmg_: c6_normal_dmg_,
        charged_dmg_: c6_charged_dmg_,
        plunging_dmg_: c6_plunging_dmg_,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
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
            multi: i === 2 ? 2 : undefined,
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
            }),
          },
          {
            text: ct.chg('auto.skillParams.5'),
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
            node: infoMut(dmgFormulas.skill.minShield, {
              name: stg('dmgAbsorption'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.minPyroShield, {
              name: st(`dmgAbsorption.${elementKey}`),
              variant: elementKey,
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.maxShield, {
              name: ct.ch('maxShield'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.maxPyroShield, {
              name: ct.ch('maxPyroShield'),
              variant: elementKey,
            }),
          },
          {
            text: stg('duration'),
            value: dm.skill.shieldDuration,
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
            node: infoMut(dmgFormulas.burst.pressDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.shield, {
              name: stg('dmgAbsorption'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.pyroShield, {
              name: st(`dmgAbsorption.${elementKey}`),
              variant: elementKey,
            }),
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.burst.shieldDuration,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.burst.collapseDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.4'),
            value: (data) =>
              data.get(input.constellation).value >= 2
                ? `${dm.burst.scorchingDuration}s + ${dm.c2.burstDuration}s = ${
                    dm.burst.scorchingDuration + dm.c2.burstDuration
                  }`
                : dm.burst.scorchingDuration,
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
      ct.condTem('passive1', {
        value: condP1BarrierStacks,
        path: condP1BarrierStacksPath,
        name: ct.ch('refreshBarrier'),
        teamBuff: true,
        states: Object.fromEntries(
          range(1, dm.passive1.maxStacks).map((stacks) => [
            stacks,
            {
              name: st('stack', { count: stacks }),
              fields: [
                {
                  node: p1_shield_,
                },
                {
                  text: stg('duration'),
                  value: dm.passive1.duration,
                  unit: 's',
                },
                {
                  text: st('triggerCD'),
                  value: dm.passive1.cd,
                  unit: 's',
                  fixed: 1,
                },
              ],
            },
          ])
        ),
      }),
      ct.headerTem('passive2', {
        fields: [
          {
            node: infoMut(p2Collapse_dmgInc, {
              name: ct.ch('a2'),
              variant: elementKey,
            }),
          },
        ],
      }),
      ct.headerTem('constellation2', {
        fields: [
          {
            text: ct.ch('c2'),
            value: dm.c2.burstDuration,
            unit: 's',
          },
        ],
      }),
      ct.headerTem('constellation4', {
        fields: [
          {
            text: st('energyRegen'),
            value: dm.c4.energyRestore,
          },
        ],
      }),
      ct.condTem('constellation6', {
        value: condC6AfterBarrier,
        path: condC6AfterBarrierPath,
        name: ct.ch('refreshBarrier'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: c6_normal_dmg_,
              },
              {
                node: c6_charged_dmg_,
              },
              {
                node: c6_plunging_dmg_,
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
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
