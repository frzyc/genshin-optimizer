import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  compareEq,
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  one,
  percent,
  prod,
} from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import KeyMap from '../../../KeyMap'

const key: CharacterKey = 'Freminet'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    spin_dmg: skillParam_gen.auto[a++],
    final_dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    thrustDmg: skillParam_gen.skill[s++],
    thornDmg: skillParam_gen.skill[s++],
    frostDmg: skillParam_gen.skill[s++],
    level0Dmg: skillParam_gen.skill[s++],
    level1CryoDmg: skillParam_gen.skill[s++],
    level1PhysDmg: skillParam_gen.skill[s++],
    level2CryoDmg: skillParam_gen.skill[s++],
    level2PhysDmg: skillParam_gen.skill[s++],
    level3CryoDmg: skillParam_gen.skill[s++],
    level3PhysDmg: skillParam_gen.skill[s++],
    level4Dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    thornInterval: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdDecrease: skillParam_gen.passive1[0][0],
  },
  passive2: {
    pressure_dmg_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    pressure_critRate_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    energyGen: skillParam_gen.constellation2[0],
    level4EnergyGen: skillParam_gen.constellation2[1],
  },
  constellation4: {
    atk_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    maxStacks: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[3],
  },
  constellation6: {
    critDMG_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    maxStacks: skillParam_gen.constellation6[2],
    cd: skillParam_gen.constellation6[3],
  },
} as const

const [condStalkPath, condStalk] = cond(key, 'stalk')
const stalkFrost_dmg_ = compareEq(
  condStalk,
  'on',
  percent(2, { name: ct.ch('frost_dmgMult_') }),
  one
)

const [condA4AfterShatterPath, condA4AfterShatter] = cond(key, 'a4AfterShatter')
const a4AfterShatter_pressure_dmg_ = greaterEq(
  input.asc,
  4,
  equal(condA4AfterShatter, 'on', dm.passive2.pressure_dmg_)
)

const c1Pressure_critRate_ = greaterEq(
  input.constellation,
  1,
  dm.constellation1.pressure_critRate_
)

const [condC4C6StacksPath, condC4C6Stacks] = cond(key, 'c4C6Stacks')
const c4C6StacksArr = range(1, dm.constellation6.maxStacks)
const c4Stacks_atk_ = greaterEq(
  input.constellation,
  4,
  lookup(
    condC4C6Stacks,
    objKeyMap(c4C6StacksArr, (stack) =>
      prod(dm.constellation4.atk_, Math.min(dm.constellation4.maxStacks, stack))
    ),
    naught
  )
)
const c6Stacks_critDMG_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condC4C6Stacks,
    objKeyMap(c4C6StacksArr, (stack) =>
      prod(dm.constellation6.critDMG_, stack)
    ),
    naught
  )
)

const pressureAddl: Data = {
  premod: {
    skill_dmg_: a4AfterShatter_pressure_dmg_,
    skill_critRate_: c1Pressure_critRate_,
  },
}
const physPressureAddl: Data = {
  ...pressureAddl,
  hit: { ele: constant('physical') },
}

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    spinningDmg: dmgNode('atk', dm.charged.spin_dmg, 'charged'),
    finalDmg: dmgNode('atk', dm.charged.final_dmg, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    thrustDmg: dmgNode('atk', dm.skill.thrustDmg, 'skill'),
    frostDmg: dmgNode(
      'atk',
      dm.skill.frostDmg,
      'skill',
      undefined,
      stalkFrost_dmg_
    ),
    level0Dmg: dmgNode('atk', dm.skill.level0Dmg, 'skill', pressureAddl),
    level1CryoDmg: dmgNode(
      'atk',
      dm.skill.level1CryoDmg,
      'skill',
      pressureAddl
    ),
    level1PhysDmg: dmgNode(
      'atk',
      dm.skill.level1PhysDmg,
      'skill',
      physPressureAddl
    ),
    level2CryoDmg: dmgNode(
      'atk',
      dm.skill.level2CryoDmg,
      'skill',
      pressureAddl
    ),
    level2PhysDmg: dmgNode(
      'atk',
      dm.skill.level2PhysDmg,
      'skill',
      physPressureAddl
    ),
    level3CryoDmg: dmgNode(
      'atk',
      dm.skill.level3CryoDmg,
      'skill',
      pressureAddl
    ),
    level3PhysDmg: dmgNode(
      'atk',
      dm.skill.level3PhysDmg,
      'skill',
      physPressureAddl
    ),
    level4Dmg: dmgNode('atk', dm.skill.level4Dmg, 'skill', physPressureAddl),
    thornDmg: dmgNode('atk', dm.skill.thornDmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
  },
}
const normalC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  data_gen.ele as ElementKey,
  data_gen.region as RegionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      autoBoost: normalC3,
      atk_: c4Stacks_atk_,
      critDMG_: c6Stacks_critDMG_,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.rarity,
  elementKey: data_gen.ele!,
  weaponTypeKey: data_gen.weaponType,
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
          }),
        })),
      },
      {
        text: ct.chg('auto.fields.charged'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.spinningDmg, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.finalDmg, {
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.6'),
            value: dm.charged.stamina,
            unit: '/s',
          },
          {
            text: ct.chg('auto.skillParams.7'),
            value: dm.charged.duration,
            unit: 's',
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
            node: infoMut(dmgFormulas.skill.thrustDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.frostDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.level0Dmg, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.level1CryoDmg, {
              name: ct.chg(`skill.skillParams.3`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.level1PhysDmg, {
              name: ct.chg(`skill.skillParams.3`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.level2CryoDmg, {
              name: ct.chg(`skill.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.level2PhysDmg, {
              name: ct.chg(`skill.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.level3CryoDmg, {
              name: ct.chg(`skill.skillParams.5`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.level3PhysDmg, {
              name: ct.chg(`skill.skillParams.5`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.level4Dmg, {
              name: ct.chg(`skill.skillParams.6`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.thornDmg, {
              name: ct.chg(`skill.skillParams.7`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.8'),
            value: dm.skill.thornInterval,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: (data) =>
              data.get(condStalk).value === 'on'
                ? `${dm.skill.cd}s - 70% = ${dm.skill.cd * 0.3}`
                : dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('passive2', {
        value: condA4AfterShatter,
        path: condA4AfterShatterPath,
        name: st('elementalReaction.shatter'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(a4AfterShatter_pressure_dmg_, {
                  name: ct.ch('pressure_dmg_'),
                  unit: '%',
                }),
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
      ct.headerTem('constellation1', {
        fields: [
          {
            node: infoMut(c1Pressure_critRate_, {
              name: ct.ch('pressure_critRate_'),
              unit: '%',
              icon: KeyMap.info('critRate_').icon,
            }),
          },
        ],
      }),
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
        value: condStalk,
        path: condStalkPath,
        name: st('afterUse.burst'),
        states: {
          on: {
            fields: [
              {
                text: st('skillCDRed'),
                value: 70,
                unit: '%',
              },
              {
                node: stalkFrost_dmg_,
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
      { fields: [{ node: normalC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.condTem('constellation4', {
        value: condC4C6Stacks,
        path: condC4C6StacksPath,
        name: st('elementalReaction.cryo'),
        states: objKeyMap(c4C6StacksArr, (stack) => ({
          name: st('stack', { count: stack }),
          fields: [
            {
              node: c4Stacks_atk_,
            },
            {
              text: stg('duration'),
              value: dm.constellation4.duration,
              unit: 's',
            },
          ],
        })),
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.condTem('constellation6', {
        value: condC4C6Stacks,
        path: condC4C6StacksPath,
        name: st('elementalReaction.cryo'),
        states: objKeyMap(c4C6StacksArr, (stack) => ({
          name: st('stack', { count: stack }),
          fields: [
            {
              node: c6Stacks_critDMG_,
            },
            {
              text: stg('duration'),
              value: dm.constellation4.duration,
              unit: 's',
            },
          ],
        })),
      }),
    ]),
  },
}
export default new CharacterSheet(sheet, data)
