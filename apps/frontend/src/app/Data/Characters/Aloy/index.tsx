import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import {
  compareEq,
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  subscript,
  unequal,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'

const key: CharacterKey = 'Aloy'
const elementKey: ElementKey = 'cryo'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1.1
      skillParam_gen.auto[a++], // 1.2
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    freezeBombDmg: skillParam_gen.skill[s++],
    chillWaterBomblets: skillParam_gen.skill[s++],
    atkDecrease: skillParam_gen.skill[s++],
    atkDecreaseDuration: skillParam_gen.skill[s++][0],
    coilNormalDmgBonus1: skillParam_gen.skill[s++],
    coilNormalDmgBonus2: skillParam_gen.skill[s++],
    coilNormalDmgBonus3: skillParam_gen.skill[s++],
    rushingNormalDmgBonus: skillParam_gen.skill[s++],
    rushingDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atkInc: 0.16,
    teamAtkInc: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    cryoDmgBonus: skillParam_gen.passive2[p2++][0],
  },
} as const

const [condCoilPath, condCoil] = cond(key, 'coil')
const normal_dmg_ = lookup(
  condCoil,
  {
    coil1: subscript(input.total.skillIndex, dm.skill.coilNormalDmgBonus1, {
      unit: '%',
    }),
    coil2: subscript(input.total.skillIndex, dm.skill.coilNormalDmgBonus2, {
      unit: '%',
    }),
    coil3: subscript(input.total.skillIndex, dm.skill.coilNormalDmgBonus3, {
      unit: '%',
    }),
    rush: subscript(input.total.skillIndex, dm.skill.rushingNormalDmgBonus, {
      unit: '%',
    }),
  },
  naught
)
const atk_ = greaterEq(
  input.asc,
  1,
  unequal(condCoil, undefined, percent(dm.passive1.atkInc))
)

const [condA1Path, condA1] = cond(key, 'A1')
const teamAtk_ = greaterEq(
  input.asc,
  1,
  equal(
    condA1,
    'on',
    unequal(input.activeCharKey, key, percent(dm.passive1.teamAtkInc))
  )
)

const [condA4Path, condA4] = cond(key, 'A4')
const cryo_dmg_ = greaterEq(
  input.asc,
  4,
  lookup(
    condA4,
    Object.fromEntries(
      range(1, 10).map((i) => [i, percent(dm.passive2.cryoDmgBonus * i)])
    ),
    naught
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [
      i,
      dmgNode('atk', arr, 'normal', {
        hit: {
          ele: compareEq('rush', condCoil, elementKey, 'physical'),
        },
      }),
    ])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    aimedCharged: dmgNode('atk', dm.charged.aimedCharged, 'charged', {
      hit: { ele: constant('cryo') },
    }),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    freezeBombDmg: dmgNode('atk', dm.skill.freezeBombDmg, 'skill'),
    chillWaterBomblets: dmgNode('atk', dm.skill.chillWaterBomblets, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
}

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  undefined,
  data_gen,
  dmgFormulas,
  {
    premod: {
      normal_dmg_,
      atk_,
      cryo_dmg_,
    },
    teamBuff: {
      premod: {
        atk_: teamAtk_,
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
            name: ct.chg(`auto.skillParams.${i + (i === 0 ? 0 : -1)}`),
            textSuffix: i === 0 ? '(1)' : i === 1 ? '(2)' : '',
          }),
        })),
      },
      {
        text: ct.chg('auto.fields.charged'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.aimed, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.aimedCharged, {
              name: ct.chg(`auto.skillParams.5`),
            }),
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
            node: infoMut(dmgFormulas.skill.freezeBombDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.chillWaterBomblets, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: subscript(input.total.skillIndex, dm.skill.atkDecrease, {
              name: ct.chg(`skill.skillParams.2`),
              unit: '%',
            }),
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: `${dm.skill.atkDecreaseDuration}`,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.7'),
            value: `${dm.skill.cd}`,
            unit: 's',
          },
        ],
      },
      ct.condTem('skill', {
        value: condCoil,
        path: condCoilPath,
        name: ct.ch('skill.coil'),
        states: {
          coil1: {
            name: ct.ch('skill.coil1'),
            fields: [
              {
                node: normal_dmg_,
              },
            ],
          },
          coil2: {
            name: ct.ch('skill.coil2'),
            fields: [
              {
                node: normal_dmg_,
              },
            ],
          },
          coil3: {
            name: ct.ch('skill.coil3'),
            fields: [
              {
                node: normal_dmg_,
              },
            ],
          },
          rush: {
            name: ct.ch('skill.rush'),
            fields: [
              {
                node: normal_dmg_,
              },
              {
                text: ct.ch('normCryoInfus'),
              },
              {
                text: ct.chg('skill.skillParams.6'),
                value: dm.skill.rushingDuration,
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
        ],
      },
    ]),

    passive1: ct.talentTem('passive1', [
      ct.fieldsTem('passive1', {
        fields: [
          {
            node: atk_,
          },
          {
            text: stg('duration'),
            value: dm.passive1.duration,
            unit: 's',
          },
        ],
      }),
      ct.condTem('passive1', {
        value: condA1,
        path: condA1Path,
        canShow: unequal(input.activeCharKey, key, 1),
        teamBuff: true,
        name: ct.ch('a1CondName'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(teamAtk_, KeyMap.info('atk_')),
              },
              {
                text: stg('duration'),
                value: dm.passive1.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
    passive2: ct.talentTem('passive2', [
      ct.condTem('passive2', {
        value: condA4,
        path: condA4Path,
        canShow: equal('rush', condCoil, 1),
        name: ct.ch('skill.rushState'),
        states: Object.fromEntries(
          range(1, 10).map((i) => [
            i,
            {
              name: st('stack', { count: i }),
              fields: [{ node: cryo_dmg_ }],
            },
          ])
        ),
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3'),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5'),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)
