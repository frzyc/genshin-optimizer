import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { ColorText } from '@genshin-optimizer/ui-common'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input, tally } from '../../../Formula'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  infoMut,
  lookup,
  naught,
  one,
  percent,
  sum,
  threshold,
  unequal,
} from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'

const key: CharacterKey = 'Navia'
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
      skillParam_gen.auto[a++], // 3x3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    cyclicDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    baseShardDmg: skillParam_gen.skill[s++],
    addlCharge_dmg_: skillParam_gen.skill[s++][0],
    shrapnelDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    supportDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    auto_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cdReduction: skillParam_gen.constellation1[1],
  },
  constellation2: {
    critRate_: skillParam_gen.constellation2[0],
  },
  constellation4: {
    geo_enemyRes_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    shot_critDMG_: skillParam_gen.constellation6[0],
  },
} as const

const skillChargesArr = range(1, 6)
const [condSkillChargesPath, condSkillCharges] = cond(key, 'skillCharges')
const skillShotsFired = lookup(
  condSkillCharges,
  {
    1: constant(7),
    2: constant(9),
    3: constant(11),
    4: constant(11),
    5: constant(11),
    6: constant(11),
  },
  constant(5)
)
const shotsHitArr = range(1, 11)
// TODO: Verify this
const shotsHit_mult_map = {
  1: 0,
  2: 0.05,
  3: 0.1,
  4: 0.15,
  5: 0.2,
  6: 0.36,
  7: 0.4,
  8: 0.6,
  9: 0.66,
  10: 0.9,
  11: 1,
}
const [condShotsHitPath, condShotsHit] = cond(key, 'shotsHit')
const shotsHit_shot_mult_ = lookup(
  condShotsHit,
  objKeyMap(shotsHitArr, (shot) =>
    greaterEq(skillShotsFired, shot, percent(shotsHit_mult_map[shot]))
  ),
  naught
)
const excessSkillCharges_skill_dmg_ = lookup(
  condSkillCharges,
  objKeyMap(skillChargesArr, (charge) =>
    charge > 3 ? constant((charge - 3) * dm.skill.addlCharge_dmg_) : undefined
  ),
  naught
)

const [condA1AfterSkillPath, condA1AfterSkill] = cond(key, 'a1AfterSkill')
const a1AfterSkillInfusion = greaterEqStr(
  input.asc,
  1,
  equalStr(condA1AfterSkill, 'on', constant('geo'))
)
const a1AfterSkill_auto_dmg_ = greaterEq(
  input.asc,
  1,
  equal(condA1AfterSkill, 'on', dm.passive1.auto_dmg_)
)
const a1AfterSkill_normal_dmg_ = { ...a1AfterSkill_auto_dmg_ }
const a1AfterSkill_charged_dmg_ = { ...a1AfterSkill_auto_dmg_ }
const a1AfterSkill_plunging_dmg_ = { ...a1AfterSkill_auto_dmg_ }

const a4ElementArr = ['pyro', 'electro', 'cryo', 'hydro']
const numTeammates = sum(...a4ElementArr.map((ele) => tally[ele]))
const a4Element_atk_ = greaterEq(
  input.asc,
  4,
  threshold(
    numTeammates,
    2,
    dm.passive2.atk_ * 2,
    greaterEq(numTeammates, 1, dm.passive2.atk_)
  )
)

const c2Shot_critRate_ = greaterEq(
  input.constellation,
  2,
  lookup(
    condSkillCharges,
    objKeyMap(skillChargesArr, (charge) =>
      percent(Math.min(charge, 3) * dm.constellation2.critRate_)
    ),
    naught
  )
)

const [condC4AfterBurstHitPath, condC4AfterBurstHit] = cond(
  key,
  'c4AfterBurstHit'
)
const c4AfterBurstHit_geo_enemyRes_ = greaterEq(
  input.constellation,
  4,
  equal(condC4AfterBurstHit, 'on', -dm.constellation4.geo_enemyRes_)
)

const c6Shot_critDMG_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condSkillCharges,
    objKeyMap(skillChargesArr, (charge) =>
      charge > 3
        ? percent((charge - 3) * dm.constellation6.shot_critDMG_)
        : undefined
    ),
    naught
  )
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    cyclicDmg: dmgNode('atk', dm.charged.cyclicDmg, 'charged'),
    finalDmg: dmgNode('atk', dm.charged.finalDmg, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    totalShardDmg: dmgNode(
      'atk',
      dm.skill.baseShardDmg,
      'skill',
      {
        premod: {
          skill_critRate_: c2Shot_critRate_,
          skill_critDMG_: c6Shot_critDMG_,
        },
      },
      infoMut(sum(shotsHit_shot_mult_, one), {
        name: ct.ch('shot_mult_'),
        asConst: true,
        unit: '%',
      })
    ),
    bladeDmg: dmgNode('atk', dm.skill.bladeDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    supportDmg: dmgNode('atk', dm.burst.supportDmg, 'burst'),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  data_gen.ele as ElementKey,
  data_gen.region as RegionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC3,
      burstBoost: burstC5,
      normal_dmg_: a1AfterSkill_normal_dmg_,
      charged_dmg_: a1AfterSkill_charged_dmg_,
      plunging_dmg_: a1AfterSkill_plunging_dmg_,
      atk_: a4Element_atk_,
      skill_dmg_: excessSkillCharges_skill_dmg_,
    },
    infusion: {
      nonOverridableSelf: a1AfterSkillInfusion,
    },
    teamBuff: {
      premod: {
        geo_enemyRes_: c4AfterBurstHit_geo_enemyRes_,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.rarity,
  elementKey: data_gen.ele!,
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
          }),
        })),
      },
      {
        text: ct.chg('auto.fields.charged'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.cyclicDmg, {
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
            value: dm.charged.stam,
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
      ct.condTem('passive1', {
        value: condA1AfterSkill,
        path: condA1AfterSkillPath,
        name: st('afterUse.skill'),
        states: {
          on: {
            fields: [
              {
                text: <ColorText color="geo">{st('infusion.geo')}</ColorText>,
              },
              {
                node: a1AfterSkill_normal_dmg_,
              },
              {
                node: a1AfterSkill_charged_dmg_,
              },
              {
                node: a1AfterSkill_plunging_dmg_,
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

    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.totalShardDmg, {
              name: ct.ch(`skillTotalShardDmg`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: dm.skill.shrapnelDuration,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.bladeDmg, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: dm.skill.bladeInterval,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.condTem('skill', {
        value: condSkillCharges,
        path: condSkillChargesPath,
        name: ct.ch('chargesCond'),
        states: objKeyMap(skillChargesArr, (charge) => ({
          name: `${charge}`,
          fields: [
            {
              node: infoMut(skillShotsFired, { name: ct.ch('shotsFired') }),
            },
            {
              canShow: (data) =>
                data.get(excessSkillCharges_skill_dmg_).value > 0,
              node: excessSkillCharges_skill_dmg_,
            },
          ],
        })),
      }),
      ct.condTem('skill', {
        value: condShotsHit,
        path: condShotsHitPath,
        name: ct.ch('shotsHitCond'),
        states: (data) =>
          objKeyMap(range(1, data.get(skillShotsFired).value), (shot) => ({
            name: `${shot}`,
            fields: [
              {
                node: infoMut(shotsHit_shot_mult_, {
                  name: ct.ch('shot_mult_'),
                  unit: '%',
                }),
              },
            ],
          })),
      }),
      ct.headerTem('constellation2', {
        canShow: unequal(condSkillCharges, undefined, 1),
        fields: [
          {
            node: infoMut(c2Shot_critRate_, {
              name: ct.ch('shot_critRate_'),
              unit: '%',
            }),
          },
        ],
      }),
      ct.headerTem('constellation6', {
        canShow: unequal(c6Shot_critDMG_, naught, 1),
        fields: [
          {
            node: infoMut(c6Shot_critDMG_, {
              name: ct.ch('shot_critDMG_'),
              unit: '%',
            }),
          },
        ],
      }),
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
            node: infoMut(dmgFormulas.burst.supportDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.2'),
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
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      { fields: [{ node: a4Element_atk_ }] },
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: skillC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.condTem('constellation4', {
        value: condC4AfterBurstHit,
        path: condC4AfterBurstHitPath,
        name: st('hitOp.burst'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: c4AfterBurstHit_geo_enemyRes_,
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
