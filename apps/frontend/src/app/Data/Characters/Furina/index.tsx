import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { ColorText } from '@genshin-optimizer/ui-common'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  infoMut,
  lookup,
  max,
  min,
  naught,
  one,
  percent,
  prod,
  subscript,
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  healNodeTalent,
} from '../dataUtil'

const key: CharacterKey = 'Furina'
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
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ],
    bladeThornDmg: skillParam_gen.auto[9],
    bladeThornInterval: skillParam_gen.auto[10][0],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    bubbleDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    usherDmg: skillParam_gen.skill[s++],
    chevalDmg: skillParam_gen.skill[s++],
    crabDmg: skillParam_gen.skill[s++],
    usherHp: skillParam_gen.skill[s++][0],
    chevalHp: skillParam_gen.skill[s++][0],
    crabHp: skillParam_gen.skill[s++][0],
    streamsHealBase: skillParam_gen.skill[s++],
    streamsHealFlat: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    fanfarePerHp: skillParam_gen.burst[b++][0],
    maxFanfare: skillParam_gen.burst[b++][0],
    dmgIncRatio: skillParam_gen.burst[b++],
    heal_ratio: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    interval: skillParam_gen.passive1[1][0],
    heal: skillParam_gen.passive1[2][0],
  },
  passive2: {
    member_dmg_: skillParam_gen.passive2[0][0],
    max_member_dmg_: skillParam_gen.passive2[1][0],
    interval_dec_: skillParam_gen.passive2[2][0],
    max_interval_dec_: skillParam_gen.passive2[3][0],
  },
  constellation1: {
    bonusFanfare: skillParam_gen.constellation1[0],
    fanfareLimitInc: skillParam_gen.constellation1[1],
  },
  constellation2: {
    idk: skillParam_gen.constellation2[0],
    hp_: skillParam_gen.constellation2[1],
    stacks: skillParam_gen.constellation2[2],
    fanfare_gain_: skillParam_gen.constellation2[3],
    max_hp_: skillParam_gen.constellation2[4],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    auto_dmgInc: skillParam_gen.constellation6[1],
    ousiaCd: skillParam_gen.constellation6[2],
    ousiaHeal: skillParam_gen.constellation6[3],
    ousiaDuration: skillParam_gen.constellation6[4],
    pneumaHpCost: skillParam_gen.constellation6[5],
    pneumaAuto_dmgInc: skillParam_gen.constellation6[6],
    triggers: skillParam_gen.constellation6[7],
  },
} as const

const [condSkillHpConsumeStacksPath, condSkillHpConsumeStacks] = cond(
  key,
  'skillHpConsumeStacks'
)
const skillHpConsumeStacksArr = range(1, 4)
const member_mult_ = lookup(
  condSkillHpConsumeStacks,
  objKeyMap(skillHpConsumeStacksArr, (stack) => percent(1 + 0.1 * stack)),
  one
)

const [condBurstFanfarePath, condBurstFanfare] = cond(key, 'burstFanfare')
const burstFanfareArr = range(50, dm.burst.maxFanfare, 50)
const c1FanfareArr = range(
  50,
  dm.burst.maxFanfare + dm.constellation1.fanfareLimitInc,
  50
)
const clampedFanfareNum = lookup(
  condBurstFanfare,
  objKeyMap(c1FanfareArr, (stacks) =>
    stacks > 450 ? greaterEq(input.constellation, 1, stacks) : constant(stacks)
  ),
  naught
)
const burstFanfare_all_dmg_ = prod(
  clampedFanfareNum,
  subscript(input.total.burstIndex, dm.burst.dmgIncRatio, {
    unit: '%',
    fixed: 2,
  })
)
const burstFanfare_incHeal_ = prod(
  clampedFanfareNum,
  subscript(input.total.burstIndex, dm.burst.heal_ratio, {
    unit: '%',
    fixed: 2,
  })
)

const a4Member_dmg_ = greaterEq(
  input.asc,
  4,
  min(
    prod(percent(dm.passive2.member_dmg_), input.total.hp, percent(1 / 1000)),
    percent(dm.passive2.max_member_dmg_)
  )
)
const a4HealInterval = greaterEq(
  input.asc,
  4,
  max(
    prod(
      percent(-dm.passive2.interval_dec_),
      input.total.hp,
      percent(1 / 1000)
    ),
    percent(-dm.passive2.max_interval_dec_)
  )
)
const member_addl: Data = {
  premod: {
    skill_dmg_: a4Member_dmg_,
  },
}

const [condC2OverstackPath, condC2Overstack] = cond(key, 'c2Overstack')
const c2OverstackArr = range(50, dm.constellation2.stacks, 50)
const c2Overstack_hp_ = greaterEq(
  input.constellation,
  2,
  lookup(
    condC2Overstack,
    objKeyMap(c2OverstackArr, (stack) =>
      prod(stack, percent(dm.constellation2.hp_, { fixed: 2 }))
    ),
    naught
  )
)

const [condc6Path, condc6] = cond(key, 'c6')
const [condC6PneumaPath, condC6Pneuma] = cond(key, 'c6Pneuma')

const c6_infusion = greaterEqStr(
  input.constellation,
  6,
  equalStr(condc6, 'on', 'hydro')
)
const c6_auto_dmgInc = greaterEq(
  input.constellation,
  6,
  equal(
    condc6,
    'on',
    prod(percent(dm.constellation6.auto_dmgInc), input.total.hp)
  )
)
const c6_normal_dmgInc = infoMut(
  { ...c6_auto_dmgInc },
  KeyMap.info('normal_dmgInc')
)
const c6_charged_dmgInc = infoMut(
  { ...c6_auto_dmgInc },
  KeyMap.info('charged_dmgInc')
)
const c6_plunging_dmgInc = infoMut(
  { ...c6_auto_dmgInc },
  KeyMap.info('plunging_dmgInc')
)

const c6Pneuma_auto_dmgInc = greaterEq(
  input.constellation,
  6,
  equal(
    condc6,
    'on',
    equal(
      condC6Pneuma,
      'on',
      prod(percent(dm.constellation6.pneumaAuto_dmgInc), input.total.hp)
    )
  )
)
const c6Pneuma_normal_dmgInc = infoMut(
  { ...c6Pneuma_auto_dmgInc },
  KeyMap.info('normal_dmgInc')
)
const c6Pneuma_charged_dmgInc = infoMut(
  { ...c6Pneuma_auto_dmgInc },
  KeyMap.info('charged_dmgInc')
)
const c6Pneuma_plunging_dmgInc = infoMut(
  { ...c6Pneuma_auto_dmgInc },
  KeyMap.info('plunging_dmgInc')
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [
        i,
        dmgNode('atk', arr, 'normal', {
          premod: { normal_dmgInc: c6Pneuma_normal_dmgInc },
        }),
      ])
    ),
    thornBladeDmg: dmgNode('atk', dm.normal.bladeThornDmg, 'normal', {
      hit: { ele: constant(data_gen.ele) },
    }),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: {
    dmg: dmgNode('atk', dm.plunging.dmg, 'plunging'),
    low: dmgNode('atk', dm.plunging.low, 'plunging', {
      premod: { plunging_dmgInc: c6Pneuma_plunging_dmgInc },
    }),
    high: dmgNode('atk', dm.plunging.high, 'plunging', {
      premod: { plunging_dmgInc: c6Pneuma_plunging_dmgInc },
    }),
  },
  skill: {
    bubbleDmg: dmgNode('hp', dm.skill.bubbleDmg, 'skill'),
    usherDmg: dmgNode(
      'hp',
      dm.skill.usherDmg,
      'skill',
      member_addl,
      member_mult_
    ),
    chevalDmg: dmgNode(
      'hp',
      dm.skill.chevalDmg,
      'skill',
      member_addl,
      member_mult_
    ),
    crabDmg: dmgNode(
      'hp',
      dm.skill.crabDmg,
      'skill',
      member_addl,
      member_mult_
    ),
    streamsHeal: healNodeTalent(
      'hp',
      dm.skill.streamsHealBase,
      dm.skill.streamsHealFlat,
      'skill'
    ),
  },
  burst: {
    skillDmg: dmgNode('hp', dm.burst.skillDmg, 'burst'),
  },
  passive1: {
    heal: greaterEq(input.asc, 1, healNode('hp', percent(dm.passive1.heal), 0)),
  },
  passive2: {
    member_dmg_: a4Member_dmg_,
  },
  constellation6: {
    c6_normal_dmgInc,
    c6_charged_dmgInc,
    c6_plunging_dmgInc,
    heal: greaterEq(
      input.constellation,
      6,
      healNode('hp', percent(dm.constellation6.ousiaHeal), 0)
    ),
  },
}
const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  data_gen.ele as ElementKey,
  data_gen.region as RegionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
      hp_: c2Overstack_hp_,
      normal_dmgInc: c6_normal_dmgInc,
      plunging_dmgInc: c6_plunging_dmgInc,
      charged_dmgInc: sum(c6_charged_dmgInc, c6Pneuma_charged_dmgInc),
    },
    infusion: {
      nonOverridableSelf: c6_infusion,
    },
    teamBuff: {
      premod: {
        all_dmg_: burstFanfare_all_dmg_,
        incHeal_: burstFanfare_incHeal_,
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
            node: infoMut(dmgFormulas.charged.dmg, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.5'),
            value: dm.charged.stam,
          },
        ],
      },
      {
        text: ct.chg('auto.fields.arkhe'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.normal.thornBladeDmg, {
              name: ct.chg('auto.skillParams.8'),
            }),
          },
          {
            text: ct.chg('auto.skillParams.9'),
            value: dm.normal.bladeThornInterval,
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
      ct.condTem('constellation6', {
        value: condc6,
        path: condc6Path,
        name: st('afterUse.skill'),
        states: {
          on: {
            fields: [
              {
                text: (
                  <ColorText color="hydro">{st('infusion.hydro')}</ColorText>
                ),
              },
              {
                node: c6_normal_dmgInc,
              },
              {
                node: c6_charged_dmgInc,
              },
              {
                node: c6_plunging_dmgInc,
              },
            ],
          },
        },
      }),
      ct.condTem('constellation6', {
        canShow: equal(condc6, 'on', 1),
        path: condC6PneumaPath,
        value: condC6Pneuma,
        name: ct.ch('c6Pneuma'),
        states: {
          on: {
            fields: [
              {
                node: c6Pneuma_normal_dmgInc,
              },
              {
                node: c6Pneuma_charged_dmgInc,
              },
              {
                node: c6Pneuma_plunging_dmgInc,
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.heal, {
              name: ct.ch('c6Healing'),
            }),
          },
          {
            text: st('interval'),
            value: dm.constellation6.ousiaCd,
            unit: 's',
          },
          {
            text: stg('duration'),
            value: dm.constellation6.ousiaDuration,
            unit: 's',
          },
        ],
      }),
    ]),

    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.bubbleDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: stg('duration'),
            value: dm.skill.duration,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.usherDmg, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.chevalDmg, {
              name: ct.chg(`skill.skillParams.3`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.crabDmg, {
              name: ct.chg(`skill.skillParams.4`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.5'),
            value: dm.skill.usherHp * 100,
            unit: st('percentMaxHP'),
            fixed: 1,
          },
          {
            text: ct.chg('skill.skillParams.6'),
            value: dm.skill.chevalHp * 100,
            unit: st('percentMaxHP'),
            fixed: 1,
          },
          {
            text: ct.chg('skill.skillParams.7'),
            value: dm.skill.crabHp * 100,
            unit: st('percentMaxHP'),
            fixed: 1,
          },
          {
            node: infoMut(dmgFormulas.skill.streamsHeal, {
              name: ct.chg('skill.skillParams.8'),
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
        value: condSkillHpConsumeStacks,
        path: condSkillHpConsumeStacksPath,
        name: ct.ch('numOffer'),
        states: objKeyMap(skillHpConsumeStacksArr, (member) => ({
          name: st('members', { count: member }),
          fields: [
            {
              node: infoMut(member_mult_, { name: ct.ch('memberMult_') }),
            },
          ],
        })),
      }),
      ct.headerTem('passive2', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive2.member_dmg_, {
              name: ct.ch('a4MemberDmg'),
              unit: '%',
            }),
          },
          {
            node: infoMut(a4HealInterval, {
              name: ct.ch('a4HealInterval'),
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
            text: stg('duration'),
            value: dm.burst.duration,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.2'),
            value: (data) =>
              data.get(input.constellation).value >= 1
                ? `${dm.burst.maxFanfare} + ${
                    dm.constellation1.fanfareLimitInc
                  } = ${
                    dm.burst.maxFanfare + dm.constellation1.fanfareLimitInc
                  }`
                : dm.burst.maxFanfare,
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
        value: condBurstFanfare,
        path: condBurstFanfarePath,
        name: ct.ch('fanfarePoints'),
        teamBuff: true,
        states: (data) =>
          objKeyMap(
            data.get(input.constellation).value >= 1
              ? c1FanfareArr
              : burstFanfareArr,
            (points) => ({
              name: `${points}`,
              fields: [
                {
                  node: burstFanfare_all_dmg_,
                },
                {
                  node: burstFanfare_incHeal_,
                },
              ],
            })
          ),
      }),
      ct.headerTem('constellation1', {
        fields: [
          {
            text: ct.ch('c1Inc'),
            value: dm.constellation1.fanfareLimitInc,
          },
          { text: ct.ch('c1Bonus'), value: dm.constellation1.bonusFanfare },
        ],
      }),
      ct.condTem('constellation2', {
        value: condC2Overstack,
        path: condC2OverstackPath,
        name: ct.ch('c2Points'),
        teamBuff: true,
        states: objKeyMap(c2OverstackArr, (point) => ({
          name: `${point}`,
          fields: [
            {
              node: c2Overstack_hp_,
            },
          ],
        })),
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.heal, {
              name: stg('contHealing'),
            }),
          },
          {
            text: st('interval'),
            value: dm.passive1.interval,
            unit: 's',
          },
          {
            text: stg('duration'),
            value: dm.passive1.duration,
            unit: 's',
          },
        ],
      },
    ]),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
