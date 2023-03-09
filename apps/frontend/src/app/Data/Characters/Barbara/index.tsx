import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../Formula'
import { equal, greaterEq, infoMut } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { cond, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Barbara'
const elementKey: ElementKey = 'hydro'
const ct = charTemplates(key, data_gen.weaponTypeKey)

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
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    cregen_hp_: skillParam_gen.skill[s++],
    cregen_hp: skillParam_gen.skill[s++],
    regen_hp_: skillParam_gen.skill[s++],
    regen_hp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    hp_: skillParam_gen.burst[b++],
    hp: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stam: -skillParam_gen.passive1[0][0],
  },
  passive2: {
    ext: skillParam_gen.passive2[0][0],
    maxExt: skillParam_gen.passive2[0][1],
  },
  constellation2: {
    cdDec: 0.15,
    hydro_dmg_: 0.15,
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

const [condSkillPath, condSkill] = cond(key, 'skill')
const nodeA1 = greaterEq(
  input.asc,
  1,
  equal(
    condSkill,
    'on',
    equal(input.activeCharKey, target.charKey, dm.passive1.stam)
  )
)
const nodeA1Display = greaterEq(
  input.asc,
  1,
  equal(condSkill, 'on', dm.passive1.stam)
)

const [condC2Path, condC2] = cond(key, 'c2')
const nodeC2 = greaterEq(
  input.constellation,
  2,
  equal(
    condC2,
    'on',
    equal(input.activeCharKey, target.charKey, dm.constellation2.hydro_dmg_)
  )
)
const nodeC2Display = greaterEq(
  input.constellation,
  2,
  equal(condC2, 'on', dm.constellation2.hydro_dmg_)
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
    regen: healNodeTalent('hp', dm.skill.regen_hp_, dm.skill.regen_hp, 'skill'),
    cregen: healNodeTalent(
      'hp',
      dm.skill.cregen_hp_,
      dm.skill.cregen_hp,
      'skill'
    ),
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    regen: healNodeTalent('hp', dm.burst.hp_, dm.burst.hp, 'burst'),
  },
}

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
    },
    teamBuff: {
      premod: {
        staminaDec_: nodeA1,
        hydro_dmg_: nodeC2,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.star,
  elementKey: elementKey,
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
            node: infoMut(dmgFormulas.skill.regen, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.cregen, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            text: ct.chg(`skill.skillParams.3`),
            value: dm.skill.duration,
            unit: 's',
          },
          {
            text: ct.chg(`skill.skillParams.4`),
            value: (data) =>
              data.get(input.constellation).value >= 2
                ? `${dm.skill.cd}s - ${dm.constellation2.cdDec * 100}%`
                : `${dm.skill.cd}s`,
          },
        ],
      },
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.regen, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.1'),
            value: dm.burst.cd,
          },
          {
            text: ct.chg('burst.skillParams.2'),
            value: dm.burst.enerCost,
          },
        ],
      },
    ]),

    passive1: ct.talentTem('passive1', [
      ct.condTem('passive1', {
        teamBuff: true,
        value: condSkill,
        path: condSkillPath,
        name: ct.ch('passive1.cond'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(nodeA1Display, KeyMap.info('staminaDec_')),
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
        teamBuff: true,
        value: condC2,
        path: condC2Path,
        name: ct.ch('constellation2.cond'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(nodeC2Display, KeyMap.info('hydro_dmg_')),
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
