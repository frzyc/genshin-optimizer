import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../Formula'
import {
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  prod,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
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

const key: CharacterKey = 'Albedo'
const elementKey: ElementKey = 'geo'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    dmg2: skillParam_gen.auto[a++], // 2
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    blossomDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    blossomCd: 2,
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    blossomDmg: skillParam_gen.burst[b++],
    blossomAmt: 7,
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    blossomDmgInc: 0.25,
    hpThresh: 50,
  },
  passive2: {
    eleMasInc: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    blossomEner: skillParam_gen.constellation1[0],
  },
  constellation2: {
    blossomDmgInc: 0.3,
    maxStacks: 4,
    stackDuration: 30,
  },
  constellation4: {
    plunging_dmg_: 0.3,
  },
  constellation6: {
    bonus_dmg_: 0.17,
  },
} as const

const [condBurstBlossomPath, condBurstBlossom] = cond(key, 'burstBlossom')
const [condBurstUsedPath, condBurstUsed] = cond(key, 'burstUsed')
const p2Burst_eleMas = equal(
  condBurstUsed,
  'burstUsed',
  greaterEq(input.asc, 4, dm.passive2.eleMasInc)
)

const [condP1EnemyHpPath, condP1EnemyHp] = cond(key, 'p1EnemyHp')
const p1_blossom_dmg_ = equal(
  condP1EnemyHp,
  'belowHp',
  greaterEq(input.asc, 1, dm.passive1.blossomDmgInc)
)

const [condC2StacksPath, condC2Stacks] = cond(key, 'c2Stacks')
const c2_burst_dmgInc = greaterEq(
  input.constellation,
  2,
  prod(
    lookup(
      condC2Stacks,
      Object.fromEntries(
        range(1, dm.constellation2.maxStacks).map((i) => [
          i,
          prod(i, dm.constellation2.blossomDmgInc),
        ])
      ),
      naught
    ),
    input.total.def
  )
)

const [condSkillInFieldPath, condSkillInField] = cond(key, 'skillInField')
const c4_plunging_dmg_disp = greaterEq(
  input.constellation,
  4,
  equal(condSkillInField, 'skillInField', dm.constellation4.plunging_dmg_)
)
const c4_plunging_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  c4_plunging_dmg_disp
)

// Maybe we should just have a single conditional for "in field AND crystallize shield"?
// This is technically a nested conditional
const [condC6CrystallizePath, condC6Crystallize] = cond(key, 'c6Crystallize')
const c6_Crystal_all_dmg_disp = greaterEq(
  input.constellation,
  6,
  equal(
    condSkillInField,
    'skillInField',
    equal(condC6Crystallize, 'c6Crystallize', dm.constellation6.bonus_dmg_)
  )
)
const c6_Crystal_all_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  c6_Crystal_all_dmg_disp
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg1: dmgNode('atk', dm.charged.dmg1, 'charged'),
    dmg2: dmgNode('atk', dm.charged.dmg2, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    blossom: dmgNode('def', dm.skill.blossomDmg, 'skill', {
      total: { skill_dmg_: p1_blossom_dmg_ },
    }),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.burstDmg, 'burst'),
    blossom: equal(
      'isoOnField',
      condBurstBlossom,
      dmgNode('atk', dm.burst.blossomDmg, 'burst')
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'mondstadt',
  data_gen,
  dmgFormulas,
  {
    teamBuff: {
      premod: {
        eleMas: p2Burst_eleMas,
        plunging_dmg_: c4_plunging_dmg_,
        all_dmg_: c6_Crystal_all_dmg_,
      },
    },
    premod: {
      skillBoost: skillC3,
      burstBoost: burstC5,
      burst_dmgInc: c2_burst_dmgInc,
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
              name: ct.chg(`auto.skillParams.5`),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.dmg2, {
              name: ct.chg(`auto.skillParams.5`),
              textSuffix: '(2)',
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
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.blossom, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.ch('blossomCD'),
            value: dm.skill.blossomCd,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.duration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('passive1', {
        value: condP1EnemyHp,
        path: condP1EnemyHpPath,
        name: st('enemyLessPercentHP', { percent: dm.passive1.hpThresh }),
        states: {
          belowHp: {
            fields: [
              {
                node: infoMut(p1_blossom_dmg_, {
                  name: ct.ch('blossomDmg_'),
                  unit: '%',
                }),
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation1', {
        fields: [
          {
            text: ct.ch('enerPerBlossom'),
            value: dm.constellation1.blossomEner,
            fixed: 1,
          },
        ],
      }),
      ct.condTem('constellation4', {
        value: condSkillInField,
        path: condSkillInFieldPath,
        name: st('activeCharField'),
        teamBuff: true,
        states: {
          skillInField: {
            fields: [
              {
                node: infoMut(
                  c4_plunging_dmg_disp,
                  KeyMap.info('plunging_dmg_')
                ),
              },
            ],
          },
        },
      }),
      ct.condTem('constellation6', {
        value: condC6Crystallize,
        path: condC6CrystallizePath,
        name: st('protectedByShieldCrystal'),
        canShow: equal(condSkillInField, 'skillInField', 1),
        teamBuff: true,
        states: {
          c6Crystallize: {
            fields: [
              {
                node: infoMut(c6_Crystal_all_dmg_disp, KeyMap.info('all_dmg_')),
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
        value: condBurstBlossom,
        path: condBurstBlossomPath,
        name: ct.ch('isotomaOnField'),
        states: {
          isoOnField: {
            fields: [
              {
                node: infoMut(dmgFormulas.burst.blossom, {
                  name: ct.chg(`burst.skillParams.1`),
                  multi: dm.burst.blossomAmt,
                }),
              },
            ],
          },
        },
      }),
      ct.condTem('passive2', {
        value: condBurstUsed,
        path: condBurstUsedPath,
        name: st('afterUse.burst'),
        teamBuff: true,
        states: {
          burstUsed: {
            fields: [
              {
                node: p2Burst_eleMas,
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
      ct.condTem('constellation2', {
        value: condC2Stacks,
        path: condC2StacksPath,
        name: ct.ch('c2Stacks'),
        states: Object.fromEntries(
          range(1, dm.constellation2.maxStacks).map((i) => [
            i,
            {
              name: st('stack', { count: i }),
              fields: [
                {
                  node: c2_burst_dmgInc,
                },
              ],
            },
          ])
        ),
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
