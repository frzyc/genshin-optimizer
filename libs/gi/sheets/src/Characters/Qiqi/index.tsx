import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Qiqi'
const elementKey: ElementKey = 'cryo'

const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4x2
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
    hitRegenPercent: skillParam_gen.skill[s++],
    hitRegenFlat: skillParam_gen.skill[s++],
    contRegenPercent: skillParam_gen.skill[s++],
    contRegenFlat: skillParam_gen.skill[s++],
    tickDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    castDmg: skillParam_gen.skill[s++],
  },
  burst: {
    healPercent: skillParam_gen.burst[b++],
    healFlat: skillParam_gen.burst[b++],
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
} as const

const [condA1Path, condA1] = cond(key, 'QiqiA1')
const [condC2Path, condC2] = cond(key, 'QiqiC2')

// Values here doesn't exist in skillParam_gen
const nodeA1HealingBonus_disp = greaterEq(
  input.asc,
  1,
  equal(condA1, 'on', 0.2, { path: 'incHeal_' })
)
const nodeA1HealingBonus = equal(
  input.activeCharKey,
  target.charKey,
  nodeA1HealingBonus_disp
)
const nodeC2ChargedDmgInc = equal(
  condC2,
  'on',
  greaterEq(input.constellation, 2, 0.15)
)
const nodeC2NormalDmgInc = equal(
  condC2,
  'on',
  greaterEq(input.constellation, 2, 0.15)
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    castDmg: dmgNode('atk', dm.skill.castDmg, 'skill'),
    tickDmg: dmgNode('atk', dm.skill.tickDmg, 'skill'),
    hitRegen: healNodeTalent(
      'atk',
      dm.skill.hitRegenPercent,
      dm.skill.hitRegenFlat,
      'skill'
    ),
    contRegen: healNodeTalent(
      'atk',
      dm.skill.contRegenPercent,
      dm.skill.contRegenFlat,
      'skill'
    ),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    heal: healNodeTalent(
      'atk',
      dm.burst.healPercent,
      dm.burst.healFlat,
      'burst'
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
      burstBoost: nodeC3,
      skillBoost: nodeC5,
      normal_dmg_: nodeC2NormalDmgInc,
      charged_dmg_: nodeC2ChargedDmgInc,
    },
    teamBuff: {
      premod: {
        incHeal_: nodeA1HealingBonus,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.rarity,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponType,
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
            multi: i === 2 || i === 3 ? 2 : undefined,
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
              multi: 2,
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
            node: infoMut(dmgFormulas.skill.castDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.hitRegen, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.contRegen, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.tickDmg, {
              name: ct.chg(`skill.skillParams.3`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.4'),
            value: dm.skill.duration,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.5'),
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
            node: infoMut(dmgFormulas.burst.heal, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.2'),
            value: dm.skill.duration,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.skill.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.4'),
            value: dm.burst.cost,
          },
        ],
      },
    ]),

    passive1: ct.talentTem('passive1', [
      ct.condTem('passive1', {
        teamBuff: true,
        name: ct.ch('a1C'),
        value: condA1,
        path: condA1Path,
        states: {
          on: {
            fields: [
              {
                node: nodeA1HealingBonus_disp,
              },
              {
                text: stg('duration'),
                value: 8,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        value: condC2,
        path: condC2Path,
        name: st('enemyAffected.cryo'),
        states: {
          on: {
            fields: [
              {
                node: nodeC2NormalDmgInc,
              },
              {
                node: nodeC2ChargedDmgInc,
              },
            ],
          },
        },
      }),
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
