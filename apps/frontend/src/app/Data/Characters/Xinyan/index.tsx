import { allStats } from '@genshin-optimizer/gi-stats'
import { input, target } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
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

const key: CharacterKey = 'Xinyan'
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
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    spin: skillParam_gen.auto[a++],
    final: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    shieldArr: [
      {
        defShield_: skillParam_gen.skill[s++],
        baseShield: skillParam_gen.skill[s++],
      },
      {
        defShield_: skillParam_gen.skill[s++],
        baseShield: skillParam_gen.skill[s++],
      },
      {
        defShield_: skillParam_gen.skill[s++],
        baseShield: skillParam_gen.skill[s++],
      },
    ],
    lvl3Dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressPhysDmg: skillParam_gen.burst[b++],
    dotPyroDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
  },
  passive2: {
    physical_dmg_: skillParam_gen.passive2[0][0],
  },
  c1: {
    atkSPD_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[1],
  },
  c2: {
    burstphysical_critRate_: skillParam_gen.constellation2[0],
  },
  c4: {
    physical_enemyRes_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  c6: {
    staminaChargedDec_: -skillParam_gen.constellation6[0],
    charged_atkBonus: skillParam_gen.constellation6[1],
  },
} as const

const [condSkillHitNumPath, condSkillHitNum] = cond(key, 'skillHitNum')

const [condP2ShieldPath, condP2Shield] = cond(key, 'p2Shield')
const p2Shield_physical_dmg_Disp = greaterEq(
  input.asc,
  4,
  equal(condP2Shield, 'on', dm.passive2.physical_dmg_)
)
const p2Shield_physical_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  p2Shield_physical_dmg_Disp
)

const [condC1CritPath, condC1Crit] = cond(key, 'c1Crit')
const c1Crit_atkSPD_ = greaterEq(
  input.constellation,
  1,
  equal(condC1Crit, 'on', dm.c1.atkSPD_)
)

const c2BurstPhysical_critRate_ = greaterEq(
  input.constellation,
  2,
  dm.c2.burstphysical_critRate_
)

const [condC4SkillHitPath, condC4SkillHit] = cond(key, 'c4Burst')
const c4SkillHit_physical_enemyRes_ = greaterEq(
  input.constellation,
  4,
  equal(condC4SkillHit, 'on', dm.c4.physical_enemyRes_)
)

const c6_staminaChargedDec_ = greaterEq(
  input.constellation,
  6,
  dm.c6.staminaChargedDec_
)
const [condC6ChargedPath, condC6Charged] = cond(key, 'c6Charged')
const c6_chargedAtkBonus = greaterEq(
  input.constellation,
  6,
  equal(
    condC6Charged,
    'on',
    prod(input.total.def, percent(dm.c6.charged_atkBonus))
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    spin: dmgNode('atk', dm.charged.spin, 'charged'),
    final: dmgNode('atk', dm.charged.final, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    ...Object.fromEntries(
      dm.skill.shieldArr.map((data, i) => [
        `normShield${i + 1}`,
        shieldNodeTalent('def', data.defShield_, data.baseShield, 'skill'),
      ])
    ),
    ...Object.fromEntries(
      dm.skill.shieldArr.map((data, i) => [
        `pyroShield${i + 1}`,
        shieldElement(
          elementKey,
          shieldNodeTalent('def', data.defShield_, data.baseShield, 'skill')
        ),
      ])
    ),
    lvl3Dmg: dmgNode('atk', dm.skill.lvl3Dmg, 'skill'),
  },
  burst: {
    pressPhysDmg: dmgNode('atk', dm.burst.pressPhysDmg, 'burst', {
      hit: { ele: constant('physical') },
      premod: {
        burst_critRate_: c2BurstPhysical_critRate_,
      },
    }),
    dotPyroDmg: dmgNode('atk', dm.burst.dotPyroDmg, 'burst'),
  },
} as const

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'liyue',
  data_gen,
  dmgFormulas,
  {
    teamBuff: {
      premod: {
        physical_dmg_: p2Shield_physical_dmg_,
        physical_enemyRes_: c4SkillHit_physical_enemyRes_,
      },
    },
    premod: {
      skillBoost: skillC3,
      burstBoost: burstC5,
      atkSPD_: c1Crit_atkSPD_,
      staminaChargedDec_: c6_staminaChargedDec_,
      atk: c6_chargedAtkBonus,
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
            node: infoMut(dmgFormulas.charged.spin, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.final, {
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.6'),
            value: `${dm.charged.stamina}/s`,
          },
        ],
      },
      ct.headerTem('constellation6', {
        fields: [
          {
            node: c6_staminaChargedDec_,
          },
        ],
      }),
      ct.condTem('constellation6', {
        value: condC6Charged,
        path: condC6ChargedPath,
        name: ct.ch('c6.duringCharge'),
        states: {
          on: {
            fields: [
              {
                node: c6_chargedAtkBonus,
              },
            ],
          },
        },
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
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('skill', {
        value: condSkillHitNum,
        path: condSkillHitNumPath,
        name: ct.ch('skill.shieldLevel'),
        states: Object.fromEntries(
          range(1, 3).map((lvl) => [
            // For each level
            lvl,
            {
              name: ct.ch(`skill.shieldLevels.${lvl}`),
              fields: [
                ...(['norm', 'pyro'] as const).flatMap((type) => [
                  {
                    // For each type of shield
                    node: infoMut(
                      dmgFormulas.skill[`${type}Shield${lvl}`], // Make the node
                      {
                        name:
                          type === 'norm' // And change the key to match
                            ? ct.chg(`skill.skillParams.${lvl}`)
                            : ct.ch(`skill.pyroShield.${lvl}`),
                      }
                    ),
                  },
                ]),
                {
                  text: stg('duration'),
                  value: dm.skill.duration,
                  unit: 's',
                },
                // Level 3 damage
                ...(lvl === 3
                  ? [
                      {
                        node: infoMut(dmgFormulas.skill.lvl3Dmg, {
                          name: ct.chg(`skill.skillParams.4`),
                        }),
                      },
                    ]
                  : []),
              ],
            },
          ])
        ),
      }),
      ct.headerTem('passive1', {
        fields: [
          {
            text: ct.ch('p1.desc'),
          },
        ],
      }),
      ct.condTem('passive2', {
        value: condP2Shield,
        path: condP2ShieldPath,
        name: ct.ch('p2.activeShield'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: infoMut(
                  p2Shield_physical_dmg_Disp,
                  KeyMap.info('physical_dmg_')
                ),
              },
            ],
          },
        },
      }),
      ct.condTem('constellation4', {
        value: condC4SkillHit,
        path: condC4SkillHitPath,
        name: ct.ch('c4.swingHit'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: c4SkillHit_physical_enemyRes_,
              },
              {
                text: stg('duration'),
                value: dm.c4.duration,
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
            node: infoMut(dmgFormulas.burst.pressPhysDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.dotPyroDmg, {
              name: ct.chg(`burst.skillParams.1`),
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
      ct.headerTem('constellation2', {
        fields: [
          {
            node: infoMut(c2BurstPhysical_critRate_, {
              name: ct.ch('c2.key_'),
              unit: '%',
            }),
          },
          {
            text: ct.ch('c2.shield'),
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.condTem('constellation1', {
        value: condC1Crit,
        path: condC1CritPath,
        name: st('hitOp.crit'),
        states: {
          on: {
            fields: [
              {
                node: c1Crit_atkSPD_,
              },
              {
                text: stg('duration'),
                value: dm.c1.duration,
                unit: 's',
              },
              {
                text: stg('cd'),
                value: dm.c1.cd,
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
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: burstC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)
