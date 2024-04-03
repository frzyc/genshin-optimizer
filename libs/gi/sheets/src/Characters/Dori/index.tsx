import { ColorText } from '@genshin-optimizer/common/ui'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  infoMut,
  input,
  min,
  percent,
  prod,
  subscript,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Dori'
const elementKey: ElementKey = 'electro'
const regionKey: RegionKey = 'sumeru'
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
      skillParam_gen.auto[a++], // 2.1
      skillParam_gen.auto[a++], // 2.2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    shotDmg: skillParam_gen.skill[s++],
    roundDmg: skillParam_gen.skill[s++],
    numRounds: 2,
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    connectorDmg: skillParam_gen.burst[b++],
    healMult: skillParam_gen.burst[b++],
    healBase: skillParam_gen.burst[b++],
    energyRegen: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdRed: skillParam_gen.passive1[0][0],
    cd: skillParam_gen.passive1[1][0],
  },
  passive2: {
    energyRegen: skillParam_gen.passive2[0][0],
    maxEnergyRegen: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    addlRounds: 1,
  },
  constellation2: {
    toopDmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    hpThresh: 50,
    energyThresh: 50,
    incHeal_: skillParam_gen.constellation4[0],
    enerRech_: skillParam_gen.constellation4[1],
  },
  constellation6: {
    infusionDuration: skillParam_gen.constellation6[0],
    heal_: skillParam_gen.constellation6[1],
    cd: 0.1,
  },
} as const

const [condC4BelowHpPath, condC4BelowHp] = cond(key, 'c4BelowHp')
const [condC4BelowEnerPath, condC4BelowEner] = cond(key, 'c4BelowEner')
const c4BelowHp_incHeal_disp = greaterEq(
  input.constellation,
  4,
  equal(condC4BelowHp, 'belowHp', dm.constellation4.incHeal_)
)
const c4BelowHp_incHeal_ = equal(
  input.activeCharKey,
  target.charKey,
  c4BelowHp_incHeal_disp
)
const c4BelowEner_enerRech_disp = greaterEq(
  input.constellation,
  4,
  equal(condC4BelowEner, 'belowEner', dm.constellation4.enerRech_)
)
const c4BelowEner_enerRech_ = equal(
  input.activeCharKey,
  target.charKey,
  c4BelowEner_enerRech_disp
)

const [condC6AfterSkillPath, condC6AfterSkill] = cond(key, 'c6AfterSkill')
const c6AfterSkill_infusion = greaterEqStr(
  input.constellation,
  6,
  equalStr(condC6AfterSkill, 'on', elementKey)
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    spinningDmg: dmgNode('atk', dm.charged.spinningDmg, 'charged'),
    finalDmg: dmgNode('atk', dm.charged.finalDmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    shotDmg: dmgNode('atk', dm.skill.shotDmg, 'skill'),
    roundDmg: dmgNode('atk', dm.skill.roundDmg, 'skill'),
  },
  burst: {
    connectorDmg: dmgNode('atk', dm.burst.connectorDmg, 'burst'),
    heal: healNodeTalent('hp', dm.burst.healMult, dm.burst.healBase, 'burst'),
  },
  passive2: {
    energyRegen: greaterEq(
      input.asc,
      4,
      min(
        prod(constant(dm.passive2.energyRegen), input.total.enerRech_),
        constant(dm.passive2.maxEnergyRegen)
      )
    ),
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      customDmgNode(
        prod(
          subscript(input.total.skillIndex, dm.skill.shotDmg, { unit: '%' }),
          infoMut(percent(dm.constellation2.toopDmg), {
            name: ct.ch('c2MultiplierKey_'),
          }),
          input.total.atk
        ),
        'elemental',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
  constellation6: {
    heal: greaterEq(
      input.constellation,
      6,
      equal(
        condC6AfterSkill,
        'on',
        customHealNode(prod(percent(dm.constellation6.heal_), input.total.hp))
      )
    ),
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  regionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
    },
    infusion: {
      overridableSelf: c6AfterSkill_infusion, // This might end up being non-overridable, though I doubt it
    },
    teamBuff: {
      premod: {
        incHeal_: c4BelowHp_incHeal_,
        enerRech_: c4BelowEner_enerRech_,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.rarity,
  elementKey,
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
            name: ct.chg(`auto.skillParams.${i > 1 ? i - 1 : i}`),
            textSuffix: i >= 1 && i < 3 ? `(${i})` : undefined,
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
              name: ct.chg(`auto.skillParams.3`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.finalDmg, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.5'),
            value: dm.charged.stamina,
            unit: '/s',
          },
          {
            text: ct.chg('auto.skillParams.6'),
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
    ]),

    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.shotDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.roundDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.headerTem('passive2', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive2.energyRegen, {
              name: stg('energyRegen'),
            }),
          },
        ],
      }),
      ct.condTem('constellation6', {
        path: condC6AfterSkillPath,
        value: condC6AfterSkill,
        name: st('afterUse.skill'),
        states: {
          on: {
            fields: [
              {
                text: (
                  <ColorText color={elementKey}>
                    {st(`infusion.${elementKey}`)}
                  </ColorText>
                ),
              },
              {
                text: stg('duration'),
                value: dm.constellation6.infusionDuration,
                unit: 's',
              },
              {
                node: infoMut(dmgFormulas.constellation6.heal, {
                  name: stg('hpRegenPerHit'),
                  variant: 'heal',
                }),
              },
              {
                text: stg('cd'),
                value: dm.constellation6.cd,
                unit: 's',
                fixed: 1,
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
            node: infoMut(dmgFormulas.burst.connectorDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.heal, {
              name: ct.chg(`burst.skillParams.1`),
              variant: 'heal',
            }),
          },
          {
            text: stg('energyRegen'),
            value: (data) =>
              data.get(subscript(input.total.burstIndex, dm.burst.energyRegen))
                .value,
            fixed: 1,
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
            node: infoMut(dmgFormulas.constellation2.dmg, {
              name: ct.ch('c2DmgKey'),
            }),
          },
        ],
      }),
      ct.condTem('constellation4', {
        teamBuff: true,
        states: {
          belowHp: {
            path: condC4BelowHpPath,
            value: condC4BelowHp,
            name: ct.ch('c4ConnectedBelowHp'),
            fields: [
              {
                node: infoMut(c4BelowHp_incHeal_disp, { path: 'incHeal_' }),
              },
            ],
          },
          belowEner: {
            path: condC4BelowEnerPath,
            value: condC4BelowEner,
            name: ct.ch('c4ConnectedBelowEner'),
            fields: [
              {
                node: infoMut(c4BelowEner_enerRech_disp, { path: 'enerRech_' }),
              },
            ],
          },
        },
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
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)
