import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap } from '@genshin-optimizer/util'
import ColorText from '../../../Components/ColoredText'
import { input, tally } from '../../../Formula'
import {
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  infoMut,
  percent,
  prod,
  subscript,
  unequal,
} from '../../../Formula/utils'
import { absorbableEle } from '../../../Types/consts'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import { dataObjForCharacterSheet, dmgNode, healNode } from '../dataUtil'

const key: CharacterKey = 'Lynette'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    thrustDmg: skillParam_gen.skill[s++],
    thrustDmgAgain: skillParam_gen.skill[s++],
    bladeDmg: skillParam_gen.skill[s++],
    hpRegen: skillParam_gen.skill[s++][0],
    hpCost: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    bladeInterval: skillParam_gen.skill[s++][0],
    holdMaxDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    boxDmg: skillParam_gen.burst[b++],
    shotDmg: skillParam_gen.burst[b++],
    boxDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    atk_: [
      0,
      skillParam_gen.passive1[1][0],
      skillParam_gen.passive1[2][0],
      skillParam_gen.passive1[3][0],
      skillParam_gen.passive1[4][0],
    ],
  },
  passive2: {
    burst_dmg_: skillParam_gen.passive2[0][0],
  },
  constellation6: {
    anemo_dmg_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const [condBurstAbsorbPath, condBurstAbsorb] = cond(key, 'burstAbsorb')

const [condA1AfterBurstPath, condA1AfterBurst] = cond(key, 'a1AfterBurst')
const a1AfterBurst_atk_ = greaterEq(
  input.asc,
  1,
  equal(condA1AfterBurst, 'on', subscript(tally.ele, [...dm.passive1.atk_]))
)

const a4BurstAbsorb_burst_dmg_ = greaterEq(
  input.asc,
  4,
  unequal(condBurstAbsorb, undefined, dm.passive2.burst_dmg_)
)

const [condC6AfterThrustPath, condC6AfterThrust] = cond(key, 'c6AfterThrust')
const c6AfterThrust_infusion = greaterEqStr(
  input.constellation,
  6,
  equalStr(condC6AfterThrust, 'on', 'anemo')
)
const c6AfterThrust_anemo_dmg_ = greaterEq(
  input.constellation,
  6,
  equal(condC6AfterThrust, 'on', dm.constellation6.anemo_dmg_)
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
    thrustDmg: dmgNode('atk', dm.skill.thrustDmg, 'skill'),
    bladeDmg: dmgNode('atk', dm.skill.bladeDmg, 'skill'),
    hpRegen: healNode('hp', percent(dm.skill.hpRegen), 0),
    hpCost: prod(percent(dm.skill.hpCost), input.total.hp),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    boxDmg: dmgNode('atk', dm.burst.boxDmg, 'burst'),
    shotDmg: unequal(
      condBurstAbsorb,
      undefined,
      dmgNode('atk', dm.burst.shotDmg, 'burst', {
        hit: { ele: condBurstAbsorb },
      })
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
    teamBuff: {
      premod: {
        atk_: a1AfterBurst_atk_,
      },
    },
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
      burst_dmg_: a4BurstAbsorb_burst_dmg_,
      anemo_dmg_: c6AfterThrust_anemo_dmg_,
    },
    infusion: {
      // TODO: Check if this is overridable
      overridableSelf: c6AfterThrust_infusion,
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
            name: ct.chg(`auto.skillParams.${i > 2 ? i - 1 : i}`),
            textSuffix: i === 2 || i === 3 ? `(${i - 1})` : undefined,
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
              name: ct.chg(`auto.skillParams.4`),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.dmg2, {
              name: ct.chg(`auto.skillParams.4`),
              textSuffix: '(2)',
            }),
          },
          {
            text: ct.chg('auto.skillParams.5'),
            value: dm.charged.stam,
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
            node: infoMut(dmgFormulas.skill.thrustDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.bladeDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.bladeInterval,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.hpRegen, {
              name: ct.chg(`skill.skillParams.3`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.hpCost, {
              name: ct.chg(`skill.skillParams.4`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.5'),
            value: dm.skill.holdMaxDuration,
            fixed: 1,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
          {
            canShow: (data) => data.get(input.constellation).value >= 4,
            text: st('charges'),
            value: 2,
          },
        ],
      },
      ct.condTem('constellation6', {
        value: condC6AfterThrust,
        path: condC6AfterThrustPath,
        name: ct.ch('c6CondName'),
        states: {
          on: {
            fields: [
              {
                text: (
                  <ColorText color="anemo">{st('infusion.anemo')}</ColorText>
                ),
              },
              {
                node: c6AfterThrust_anemo_dmg_,
              },
              {
                text: stg('duration'),
                value: 6,
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
            node: infoMut(dmgFormulas.burst.boxDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.burst.boxDuration,
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
      ct.condTem('burst', {
        value: condBurstAbsorb,
        path: condBurstAbsorbPath,
        name: st('eleAbsor'),
        states: objKeyMap(absorbableEle, (ele) => ({
          name: <ColorText color={ele}>{stg(`element.${ele}`)}</ColorText>,
          fields: [
            {
              node: infoMut(dmgFormulas.burst.shotDmg, {
                name: ct.chg('burst.skillParams.2'),
              }),
            },
          ],
        })),
      }),
      ct.condTem('passive1', {
        value: condA1AfterBurst,
        path: condA1AfterBurstPath,
        teamBuff: true,
        name: st('afterUse.burst'),
        states: {
          on: {
            fields: [
              {
                node: a1AfterBurst_atk_,
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
      ct.headerTem('passive2', {
        canShow: unequal(condBurstAbsorb, undefined, 1),
        fields: [
          {
            node: a4BurstAbsorb_burst_dmg_,
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.headerTem('constellation4', {
        fields: [
          {
            text: st('addlCharges'),
            value: 1,
          },
        ],
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
