import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input, tally } from '../../../Formula'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  infoMut,
  lookup,
  min,
  percent,
  prod,
  subscript,
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'AratakiItto'
const elementKey: ElementKey = 'geo'

const ct = charTemplates(key, data_gen.weaponTypeKey)

const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0],
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3],
    ],
  },
  charged: {
    sSlash: skillParam_gen.auto[4],
    akSlash: skillParam_gen.auto[5],
    akFinal: skillParam_gen.auto[6],
    stam: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  ss: {
    //Superlative Superstrength
    duration: skillParam_gen.auto[11][0],
  },
  skill: {
    dmg: skillParam_gen.skill[0],
    hp: skillParam_gen.skill[1],
    duration: skillParam_gen.skill[2][0],
    ss_cd: skillParam_gen.skill[3][0],
    cd: skillParam_gen.skill[4][0],
  },
  burst: {
    atkSpd: skillParam_gen.burst[0][0],
    defConv: skillParam_gen.burst[1],
    resDec: skillParam_gen.burst[2][0],
    duration: skillParam_gen.burst[3][0],
    cd: skillParam_gen.burst[4][0],
    cost: skillParam_gen.burst[5][0],
  },
  passive1: {
    maxStacks: 3,
    atkSPD_: 0.1,
  },
  passive2: {
    def_: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    initialStacks: skillParam_gen.constellation1[0],
    timedStacks: skillParam_gen.constellation1[1],
  },
  constellation2: {
    burstCdRed: skillParam_gen.constellation2[0],
    energyRegen: skillParam_gen.constellation2[1],
  },
  constellation4: {
    def_: skillParam_gen.constellation4[0],
    atk_: skillParam_gen.constellation4[1],
    duration: skillParam_gen.constellation4[2],
  },
  constellation6: {
    charged_critDMG_: skillParam_gen.constellation6[0],
  },
}

const [condBurstPath, condBurst] = cond(key, 'burst')
const [condP1Path, condP1] = cond(key, 'passive1')
const [condC4Path, condC4] = cond(key, 'constellation4')

const nodeSkillHP = prod(
  subscript(input.total.skillIndex, dm.skill.hp, KeyMap.info('hp_')),
  input.total.hp
)
const nodeBurstAtk = equal(
  condBurst,
  'on',
  prod(
    subscript(input.total.burstIndex, dm.burst.defConv, KeyMap.info('def_')),
    input.total.def
  )
)
const nodeBurstAtkSpd = equal(
  condBurst,
  'on',
  dm.burst.atkSpd,
  KeyMap.info('atkSPD_')
)
const allNodeBurstRes = Object.fromEntries(
  allElementWithPhyKeys.map((ele) => [
    `${ele}_res_`,
    equal(condBurst, 'on', -dm.burst.resDec),
  ])
)
const nodeBurstInfusion = equalStr(condBurst, 'on', 'geo')
const nodeA4Bonus = greaterEq(
  input.asc,
  4,
  prod(percent(dm.passive2.def_), input.premod.def)
)
const nodeP1AtkSpd = greaterEq(
  input.asc,
  4,
  lookup(
    condP1,
    Object.fromEntries(
      range(1, dm.passive1.maxStacks).map((i) => [
        i,
        constant(dm.passive1.atkSPD_ * i),
      ])
    ),
    0,
    KeyMap.info('atkSPD_')
  )
)
const nodeC2BurstRed = prod(min(tally.geo, 3), dm.constellation2.burstCdRed)
const nodeC2EnergyRegen = prod(min(tally.geo, 3), dm.constellation2.energyRegen)
const nodeC4Atk = equal(
  condC4,
  'on',
  greaterEq(input.constellation, 4, dm.constellation4.atk_)
)
const nodeC4Def = equal(
  condC4,
  'on',
  greaterEq(input.constellation, 4, dm.constellation4.def_)
)
const nodeC6CritDMG = greaterEq(
  input.constellation,
  6,
  dm.constellation6.charged_critDMG_
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    sSlash: dmgNode('atk', dm.charged.sSlash, 'charged'),
    akSlash: dmgNode('atk', dm.charged.akSlash, 'charged', {
      premod: { charged_dmgInc: nodeA4Bonus },
    }),
    akFinal: dmgNode('atk', dm.charged.akFinal, 'charged', {
      premod: { charged_dmgInc: nodeA4Bonus },
    }),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([name, arr]) => [
      name,
      dmgNode('atk', arr, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    hp: nodeSkillHP,
  },
  burst: {
    defConv: nodeBurstAtk,
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'inazuma',
  data_gen,
  dmgFormulas,
  {
    teamBuff: {
      premod: {
        atk_: nodeC4Atk,
        def_: nodeC4Def,
      },
    },
    premod: {
      skillBoost: nodeC3,
      burstBoost: nodeC5,
      charged_critDMG_: nodeC6CritDMG,
      atk: nodeBurstAtk,
      atkSPD_: sum(nodeBurstAtkSpd, nodeP1AtkSpd),
      ...allNodeBurstRes,
    },
    infusion: {
      nonOverridableSelf: nodeBurstInfusion,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.star,
  elementKey: 'geo',
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
          }),
        })),
      },
      {
        text: ct.chg('auto.fields.charged'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.akSlash, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.akFinal, {
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.6'),
            value: dm.ss.duration,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.charged.sSlash, {
              name: ct.chg(`auto.skillParams.7`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.8'),
            value: dm.charged.stam,
          },
        ],
      },
      ct.condTem('passive1', {
        name: ct.ch('a1.name'),
        value: condP1,
        path: condP1Path,
        states: Object.fromEntries(
          range(1, dm.passive1.maxStacks).map((i) => [
            i,
            {
              name: st('stack_one', { count: i }),
              fields: [
                {
                  node: nodeP1AtkSpd,
                },
              ],
            },
          ])
        ),
      }),
      ct.headerTem('passive2', {
        fields: [
          {
            node: infoMut(nodeA4Bonus, { name: ct.ch('a4:dmgInc') }),
          },
        ],
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            node: nodeC6CritDMG,
          },
        ],
      }),
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
            node: infoMut(dmgFormulas.skill.hp, {
              name: ct.chg(`skill.skillParams.1`),
              variant: 'heal',
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
            text: ct.chg('burst.skillParams.3'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.4'),
            value: dm.burst.cost,
          },
        ],
      },
      ct.condTem('burst', {
        name: st('afterUse.burst'),
        value: condBurst,
        path: condBurstPath,
        states: {
          on: {
            fields: [
              {
                text: st('infusion.geo'),
                variant: 'geo',
              },
              {
                node: nodeBurstAtkSpd,
              },
              ...Object.values(allNodeBurstRes).map((node) => ({ node })),
              {
                node: infoMut(nodeBurstAtk, {
                  name: ct.chg(`burst.skillParams.0`),
                }),
              },
              {
                text: ct.chg('burst.skillParams.2'),
                value: dm.burst.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation1', {
        fields: [
          {
            text: ct.ch('c1.initialGain'),
            value: dm.constellation1.initialStacks,
          },
          {
            text: ct.ch('c1.timedGain'),
            value: dm.constellation1.timedStacks,
          },
        ],
        canShow: equal(condBurst, 'on', 1),
      }),
      ct.headerTem('constellation2', {
        fields: [
          {
            text: st('burstCDRed'),
            value: (data) => data.get(nodeC2BurstRed).value,
            unit: 's',
            fixed: 1,
          },
          {
            text: st('energyRegen'),
            value: (data) => data.get(nodeC2EnergyRegen).value,
          },
        ],
        canShow: equal(condBurst, 'on', 1),
      }),
      ct.condTem('constellation4', {
        name: ct.ch('c4.name'),
        teamBuff: true,
        value: condC4,
        path: condC4Path,
        states: {
          on: {
            fields: [
              {
                node: nodeC4Atk,
              },
              {
                node: nodeC4Def,
              },
              {
                text: stg('duration'),
                value: dm.constellation4.duration,
                unit: 's',
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
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      { fields: [{ node: nodeC6CritDMG }] },
    ]),
  },
}

export default new CharacterSheet(sheet, data)
