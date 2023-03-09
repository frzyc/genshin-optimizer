import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import {
  equal,
  greaterEq,
  infoMut,
  lookup,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Mona'
const elementKey: ElementKey = 'hydro'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  sp = 0,
  p1 = 0,
  p2 = 0
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
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dot: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    bubbleDuration: skillParam_gen.burst[b++][0],
    dmg: skillParam_gen.burst[b++],
    dmgBonusNeg: skillParam_gen.burst[b++],
    omenDuration: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    dmgBonus: skillParam_gen.burst[b++],
  },
  sprint: {
    active_stam: skillParam_gen.sprint[sp++][0],
    drain_stam: skillParam_gen.sprint[sp++][0],
  },
  passive1: {
    torrentDuration: skillParam_gen.passive1[p1++][0],
    phantomDuration: skillParam_gen.passive1[p1++][0],
    percentage: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    unknown: skillParam_gen.passive2[p2++][0], // what is this?
    percentage: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    electroChargeDmgInc: skillParam_gen.constellation1[0],
    vaporizeDmgInc: skillParam_gen.constellation1[1],
    hydroSwirlDmgInc: skillParam_gen.constellation1[2],
    frozenExtension: skillParam_gen.constellation1[3],
    unknown: skillParam_gen.constellation1[4], // what is this?
    duration: skillParam_gen.constellation1[5],
  },
  constellation4: {
    critRateIncNeg: Math.abs(skillParam_gen.constellation4[0]), // why do they even keep this as a negative??
  },
  constellation6: {
    unknown: skillParam_gen.constellation6[0], // what is this?
    dmgBonus: skillParam_gen.constellation6[1],
    maxDmgBonus: skillParam_gen.constellation6[2],
    duration: skillParam_gen.constellation6[3],
  },
} as const

const [condOmenPath, condOmen] = cond(key, 'Omen')
const all_dmg_ = equal(
  'on',
  condOmen,
  subscript(input.total.burstIndex, dm.burst.dmgBonus, { unit: '%' })
)

const [condPoSPath, condPoS] = cond(key, 'ProphecyOfSubmersion')
const electrocharged_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condPoS, percent(dm.constellation1.electroChargeDmgInc))
)
const swirl_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condPoS, percent(dm.constellation1.hydroSwirlDmgInc))
)
const vaporize_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condPoS, percent(dm.constellation1.vaporizeDmgInc))
)

const [condPoOPath, condPoO] = cond(key, 'ProphecyOfOblivion')
const critRate_ = greaterEq(
  input.constellation,
  4,
  equal('on', condPoO, percent(dm.constellation4.critRateIncNeg))
)

const [condRoCPath, condRoC] = cond(key, 'RhetoricsOfCalamitas')
const charged_dmg_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condRoC,
    objectKeyMap(range(1, 3), (i) => percent(i * dm.constellation6.dmgBonus)),
    0
  )
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
    dot: dmgNode('atk', dm.skill.dot, 'skill'),
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  passive1: {
    dmg: greaterEq(
      input.asc,
      1,
      prod(
        dmgNode('atk', dm.skill.dmg, 'skill'),
        percent(dm.passive1.percentage)
      )
    ),
  },
  passive2: {
    hydro_dmg_: greaterEq(
      input.asc,
      4,
      prod(input.premod.enerRech_, percent(dm.passive2.percentage))
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'mondstadt',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC5,
      burstBoost: nodeC3,
      charged_dmg_,
      hydro_dmg_: dmgFormulas.passive2.hydro_dmg_,
    },
    teamBuff: {
      premod: {
        all_dmg_,
        electrocharged_dmg_,
        swirl_dmg_,
        vaporize_dmg_,
        critRate_,
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
            node: infoMut(dmgFormulas.skill.dot, {
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
            text: ct.ch('bubbleDuration'),
            value: dm.burst.bubbleDuration,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.burst.dmg, {
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
      ct.condTem('burst', {
        value: condOmen,
        path: condOmenPath,
        teamBuff: true,
        name: ct.ch('omen'),
        states: {
          on: {
            fields: [
              {
                node: all_dmg_,
              },
              {
                text: stg('duration'),
                value: (data) =>
                  dm.burst.omenDuration[data.get(input.total.burstIndex).value],
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),

    sprint: ct.talentTem('sprint', [
      {
        fields: [
          {
            text: st('activationStam'),
            value: dm.sprint.active_stam,
          },
          {
            text: st('stamDrain'),
            value: dm.sprint.drain_stam,
            unit: '/s',
          },
        ],
      },
    ]),

    passive1: ct.talentTem('passive1', [
      ct.fieldsTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.dmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: stg('duration'),
            value: dm.passive1.phantomDuration,
            unit: 's',
          },
        ],
      }),
    ]),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            node: dmgFormulas.passive2.hydro_dmg_,
          },
        ],
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.condTem('constellation1', {
        value: condPoS,
        path: condPoSPath,
        teamBuff: true,
        name: ct.ch('hitOp.affectedByOmen'),
        states: {
          on: {
            fields: [
              {
                node: electrocharged_dmg_,
              },
              {
                node: swirl_dmg_,
              },
              {
                node: vaporize_dmg_,
              },
              {
                text: ct.ch('frozenDuration'),
                value: dm.constellation1.frozenExtension * 100, // Convert to percentage
                unit: '%',
              },
            ],
          },
        },
      }),
    ]),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.condTem('constellation4', {
        value: condPoO,
        path: condPoOPath,
        teamBuff: true,
        name: ct.ch('hitOp.affectedByOmen'),
        states: {
          on: {
            fields: [
              {
                node: critRate_,
              },
            ],
          },
        },
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.condTem('constellation6', {
        value: condRoC,
        path: condRoCPath,
        name: ct.ch('uponSprint'),
        states: Object.fromEntries(
          range(1, 3).map((i) => [
            i,
            {
              name: st('stack', { count: i }),
              fields: [
                { node: charged_dmg_ },
                {
                  text: stg('duration'),
                  value: dm.constellation6.duration,
                  unit: 's',
                },
              ],
            },
          ])
        ),
      }),
    ]),
  },
}
export default new CharacterSheet(sheet, data)
