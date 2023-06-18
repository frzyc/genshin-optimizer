import { allStats } from '@genshin-optimizer/gi-stats'
import { input, target } from '../../../Formula'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  infoMut,
  lookup,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type {
  CharacterKey,
  ElementKey,
  WeaponTypeKey,
} from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'

const key: CharacterKey = 'Chongyun'
const elementKey: ElementKey = 'cryo'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3
      skillParam_gen.auto[3], // 4
    ],
  },
  charged: {
    spin_dmg: skillParam_gen.auto[4],
    final_dmg: skillParam_gen.auto[5],
    stamina: skillParam_gen.auto[6][0],
    duration: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    infusionDuration: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    fieldDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atk_spd: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    dmg: skillParam_gen.passive2[p2++][0],
    res: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    cdr: skillParam_gen.constellation2[0],
  },
  constellation4: {
    energy_regen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    burst_dmg_: skillParam_gen.constellation6[0],
  },
} as const

const [condAsc4Path, condAsc4] = cond(key, 'asc4')
const [condSkillPath, condSkill] = cond(key, 'skill')
const [condC6Path, condC6] = cond(key, 'c6')

const skillDmg = dmgNode('atk', dm.skill.dmg, 'skill')

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
    dmg: skillDmg,
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  passive2: {
    dmg: greaterEq(input.asc, 4, skillDmg),
  },
  constellation1: {
    dmg: greaterEq(
      input.constellation,
      1,
      customDmgNode(
        prod(percent(dm.constellation1.dmg), input.total.atk),
        'elemental',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
}

const nodeAsc4 = greaterEq(input.asc, 4, equal(condAsc4, 'hit', -0.1))
const activeInArea = equal(
  'activeInArea',
  condSkill,
  equal(input.activeCharKey, target.charKey, 1)
)

const nodeAsc1Disp = greaterEq(input.asc, 1, percent(0.08))
const nodeAsc1 = equal(activeInArea, 1, nodeAsc1Disp)

const correctWep = lookup(
  target.weaponType,
  { sword: constant(1), claymore: constant(1), polearm: constant(1) },
  constant(0)
)

const activeInAreaInfusion = equalStr(
  correctWep,
  1,
  equalStr(activeInArea, 1, elementKey)
)

const nodeC6 = greaterEq(
  input.constellation,
  6,
  equal(condC6, 'on', dm.constellation6.burst_dmg_)
)

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
      burst_dmg_: nodeC6,
    },
    teamBuff: {
      premod: {
        cryo_enemyRes_: nodeAsc4,
        atkSPD_: nodeAsc1,
      },
      infusion: {
        team: activeInAreaInfusion,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.rarity,
  elementKey: 'cryo',
  weaponTypeKey: data_gen.weaponType as WeaponTypeKey,
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
        text: ct.chg(`auto.fields.plunging`),
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
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.fieldDuration,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('skill', {
        teamBuff: true,
        value: condSkill,
        path: condSkillPath,
        name: st('activeCharField'),
        states: {
          activeInArea: {
            fields: [
              {
                text: ct.ch('infusion'),
                variant: elementKey,
              },
              {
                text: ct.chg('skill.skillParams.1'),
                value: (data) =>
                  data.get(
                    subscript(input.total.skillIndex, dm.skill.infusionDuration)
                  ).value,
                unit: 's',
                fixed: 1,
              },
              {
                node: infoMut(nodeAsc1Disp, KeyMap.info('atkSPD_')),
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
            node: infoMut(dmgFormulas.burst.dmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.1'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.2'),
            value: dm.burst.enerCost,
          },
          {
            text: ct.ch('blades'),
            value: (data) => (data.get(input.constellation).value < 6 ? 3 : 4),
          },
        ],
      },
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive2.dmg, {
              name: ct.ch('passive2'),
            }),
          },
        ],
      }),
      ct.condTem('passive2', {
        teamBuff: true,
        value: condAsc4,
        path: condAsc4Path,
        name: ct.ch('asc4Cond'),
        states: {
          hit: {
            fields: [
              {
                node: nodeAsc4,
              },
            ],
          },
        },
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.fieldsTem('constellation1', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation1.dmg, {
              name: ct.ch('constellation1'),
            }),
          },
        ],
      }),
    ]),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.condTem('constellation6', {
        value: condC6,
        path: condC6Path,
        name: ct.ch('constellation6'),
        states: {
          on: {
            fields: [
              {
                node: nodeC6,
              },
            ],
          },
        },
      }),
    ]),
  },
}

export default new CharacterSheet(sheet, data)
