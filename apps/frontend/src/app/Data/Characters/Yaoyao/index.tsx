import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../Formula'
import {
  equal,
  greaterEq,
  infoMut,
  min,
  percent,
  prod,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import {
  customDmgNode,
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
} from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = 'Yaoyao'
const elementKey: ElementKey = 'dendro'
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
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
    heal_hp_: skillParam_gen.skill[s++],
    heal_base: skillParam_gen.skill[s++],
    throwDuration: skillParam_gen.skill[s++][0],
    radishDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    radish_dmg: skillParam_gen.burst[b++],
    radish_heal_hp: skillParam_gen.burst[b++],
    radish_heal_flat: skillParam_gen.burst[b++],
    skill_dmg: skillParam_gen.burst[b++],
    dendro_res_: skillParam_gen.burst[b++][0],
    moveSPD_: 0.15,
    legacyDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  // passive1: {
  //   cd: skillParam_gen.passive1[0][0]
  // },
  passive2: {
    cd: skillParam_gen.passive2[0][0],
    heal_hp: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    duration: skillParam_gen.constellation1[0],
    dendro_dmg_: skillParam_gen.constellation1[1],
    staminaRestore: skillParam_gen.constellation1[2],
    cd: skillParam_gen.constellation1[3],
  },
  constellation2: {
    energyRegen: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
  },
  constellation4: {
    eleMas_Hp: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    maxEleMas: skillParam_gen.constellation4[2],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    heal_hp: skillParam_gen.constellation6[1],
  },
} as const

const [condAdeptalLegacyPath, condAdeptalLegacy] = cond(key, 'adeptalLegacy')
const adeptalLegacy_dendro_res_ = equal(
  condAdeptalLegacy,
  'on',
  dm.burst.dendro_res_
)
const adeptalLegacy_moveSPD_ = equal(condAdeptalLegacy, 'on', dm.burst.moveSPD_)

const [condC1ExplodePath, condC1Explode] = cond(key, 'c1Explode')
const c1Explode_dendro_dmg_disp = greaterEq(
  input.constellation,
  1,
  equal(condC1Explode, 'on', dm.constellation1.dendro_dmg_),
  { ...KeyMap.info('dendro_dmg_'), isTeamBuff: true }
)
const c1Explode_dendro_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  c1Explode_dendro_dmg_disp
)

const [condC4AfterSkillBurstPath, condC4AfterSkillBurst] = cond(
  key,
  'c4AfterSkillBurst'
)
const c4AfterSkillBurst_eleMas = greaterEq(
  input.constellation,
  4,
  equal(
    condC4AfterSkillBurst,
    'on',
    min(
      prod(percent(dm.constellation4.eleMas_Hp), input.premod.hp),
      dm.constellation4.maxEleMas
    )
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
    Object.entries(dm.plunging).map(([name, arr]) => [
      name,
      dmgNode('atk', arr, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    heal: healNodeTalent('hp', dm.skill.heal_hp_, dm.skill.heal_base, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skill_dmg, 'burst'),
    radish: dmgNode('atk', dm.burst.radish_dmg, 'burst'),
    radishHeal: healNodeTalent(
      'hp',
      dm.burst.radish_heal_hp,
      dm.burst.radish_heal_flat,
      'burst'
    ),
  },
  passive2: {
    heal: greaterEq(
      input.asc,
      4,
      customHealNode(prod(percent(dm.passive2.heal_hp), input.total.hp))
    ),
  },
  constellation4: {
    eleMas: c4AfterSkillBurst_eleMas,
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'burst'
      )
    ),
    heal: greaterEq(
      input.constellation,
      6,
      customHealNode(prod(percent(dm.constellation6.heal_hp), input.total.hp))
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'liyue',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC3,
      burstBoost: burstC5,
      dendro_res_: adeptalLegacy_dendro_res_,
      moveSPD_: adeptalLegacy_moveSPD_,
    },
    total: {
      eleMas: c4AfterSkillBurst_eleMas,
    },
    teamBuff: {
      premod: {
        dendro_dmg_: c1Explode_dendro_dmg_,
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
            name: ct.chg(`auto.skillParams.${i + (i < 3 ? 0 : -1)}`),
            textSuffix: i === 2 || i === 3 ? `(${i - 1})` : '',
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
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.heal, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.throwDuration,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: dm.skill.radishDuration,
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
            node: infoMut(dmgFormulas.burst.skillDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.radish, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.radishHeal, {
              name: ct.chg(`burst.skillParams.2`),
            }),
          },
          {
            text: stg('cd'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: stg('energyCost'),
            value: dm.burst.cost,
          },
        ],
      },
      ct.condTem('burst', {
        path: condAdeptalLegacyPath,
        value: condAdeptalLegacy,
        name: ct.ch('inLegacy'),
        states: {
          on: {
            fields: [
              {
                node: adeptalLegacy_dendro_res_,
              },
              {
                node: adeptalLegacy_moveSPD_,
              },
              {
                text: ct.chg('burst.skillParams.4'),
                value: dm.burst.legacyDuration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.dmg, {
              name: ct.ch('megaDmg'),
            }),
          },
          {
            node: infoMut(dmgFormulas.constellation6.heal, {
              name: ct.ch('megaHeal'),
            }),
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive2.heal, { name: ct.ch('a4Heal') }),
          },
          {
            text: stg('cd'),
            value: dm.passive2.cd,
            unit: 's',
          },
          {
            text: stg('duration'),
            value: dm.passive2.duration,
            unit: 's',
          },
        ],
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.condTem('constellation1', {
        path: condC1ExplodePath,
        value: condC1Explode,
        name: ct.ch('inExplosionAoE'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: c1Explode_dendro_dmg_disp,
              },
              {
                text: stg('duration'),
                value: dm.constellation1.duration,
                unit: 's',
              },
              {
                text: st('stamRestored'),
                value: dm.constellation1.staminaRestore,
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
    constellation4: ct.talentTem('constellation4', [
      ct.condTem('constellation4', {
        path: condC4AfterSkillBurstPath,
        value: condC4AfterSkillBurst,
        name: st('afterUse.skillOrBurst'),
        states: {
          on: {
            fields: [
              {
                node: c4AfterSkillBurst_eleMas,
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
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: burstC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
