import { allStats } from '@genshin-optimizer/gi-stats'
import { input, target } from '../../../Formula'
import type { UIData } from '../../../Formula/uiData'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  infoMut,
  lookup,
  prod,
  subscript,
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'

const key: CharacterKey = 'Bennett'
const elementKey: ElementKey = 'pyro'
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
    press: skillParam_gen.skill[s++],
    hold1_1: skillParam_gen.skill[s++],
    hold1_2: skillParam_gen.skill[s++],
    hold2_1: skillParam_gen.skill[s++],
    hold2_2: skillParam_gen.skill[s++],
    explosion: skillParam_gen.skill[s++],
    cd_press: skillParam_gen.skill[s++][0],
    cd_hold1: skillParam_gen.skill[s++][0],
    cd_hold2: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    regen_: skillParam_gen.burst[b++],
    regenFlat: skillParam_gen.burst[b++],
    atkBonus: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cd_red: 0.2, // Not in the dm for some reason
  },
  passive2: {
    cd_red: 0.5, // Not in the dm for some reason
  },
  constellation1: {
    atk_inc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    hp_thresh: skillParam_gen.constellation2[0],
    er_inc: skillParam_gen.constellation2[1],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    pyro_dmg: skillParam_gen.constellation6[0],
  },
} as const

const a1SkillCd = greaterEq(input.asc, 1, dm.passive1.cd_red)

const burstAtkRatio = subscript(input.total.burstIndex, dm.burst.atkBonus, {
  unit: '%',
})
const burstAddlAtk = prod(burstAtkRatio, input.base.atk)
const c1AtkRatio = greaterEq(
  input.constellation,
  1,
  dm.constellation1.atk_inc,
  { name: ct.ch('additionalATKRatio_'), unit: '%' }
)
const c1AddlAtk = greaterEq(
  input.constellation,
  1,
  prod(c1AtkRatio, input.base.atk)
)
const atkIncRatio = sum(burstAtkRatio, c1AtkRatio)
const activeInAreaAtkDisp = prod(atkIncRatio, input.base.atk)

const [condInAreaPath, condInArea] = cond(key, 'activeInArea')
const activeInArea = equal(
  'activeInArea',
  condInArea,
  equal(input.activeCharKey, target.charKey, 1)
)
const activeInAreaAtk = equal(activeInArea, 1, activeInAreaAtkDisp)

const activeInAreaA4 = greaterEq(
  input.asc,
  4,
  equal(activeInArea, 1, dm.passive2.cd_red)
)

const c6AndCorrectWep = greaterEq(
  input.constellation,
  6,
  lookup(
    target.weaponType,
    { sword: constant(1), claymore: constant(1), polearm: constant(1) },
    constant(0)
  )
)
const activeInAreaC6PyroDmg = equal(
  activeInArea,
  1,
  greaterEq(input.constellation, 6, dm.constellation6.pyro_dmg)
)
const activeInAreaC6Infusion = equalStr(
  c6AndCorrectWep,
  1,
  equalStr(activeInArea, 1, elementKey)
)

const [condUnderHPPath, condUnderHP] = cond(key, 'underHP')
const underHP = greaterEq(
  input.constellation,
  2,
  equal('underHP', condUnderHP, dm.constellation2.er_inc)
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
    press: dmgNode('atk', dm.skill.press, 'skill'),
    hold1_1: dmgNode('atk', dm.skill.hold1_1, 'skill'),
    hold1_2: dmgNode('atk', dm.skill.hold1_2, 'skill'),
    hold2_1: dmgNode('atk', dm.skill.hold2_1, 'skill'),
    hold2_2: dmgNode('atk', dm.skill.hold2_2, 'skill'),
    explosion: dmgNode('atk', dm.skill.explosion, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    regen: healNodeTalent('hp', dm.burst.regen_, dm.burst.regenFlat, 'burst'),
    atkInc: activeInAreaAtk,
  },
  constellation4: {
    dmg: greaterEq(
      input.constellation,
      4,
      prod(dmgNode('atk', dm.skill.hold1_2, 'skill'), dm.constellation4.dmg)
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'mondstadt',
  data_gen,
  dmgFormulas,
  {
    teamBuff: {
      premod: {
        pyro_dmg_: activeInAreaC6PyroDmg,
      },
      total: {
        // Not 100% sure if this should be in premod or total
        atk: activeInAreaAtk,
      },
      infusion: {
        team: activeInAreaC6Infusion,
      },
    },
    premod: {
      skillBoost: nodeC3,
      burstBoost: nodeC5,
      enerRech_: underHP,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.rarity,
  elementKey,
  weaponTypeKey: data_gen.weaponType,
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
            // Press
            node: infoMut(dmgFormulas.skill.press, {
              name: ct.ch('skill.pressDMG'),
            }),
          },
          {
            text: stg('press.cd'),
            unit: 's',
            value: (data) => calculateSkillCD(data, dm.skill.cd_press),
          },
          {
            // Lvl 1
            node: infoMut(dmgFormulas.skill.hold1_1, {
              name: ct.ch('skill.lvl1_1DMG'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.hold1_2, {
              name: ct.ch('skill.lvl1_2DMG'),
            }),
          },
          {
            text: ct.ch('skill.lvl1CD'),
            unit: 's',
            value: (data) => calculateSkillCD(data, dm.skill.cd_hold1),
          },
          {
            // Lvl 2
            node: infoMut(dmgFormulas.skill.hold2_1, {
              name: ct.ch('skill.lvl2_1DMG'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.hold2_2, {
              name: ct.ch('skill.lvl2_2DMG'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.explosion, {
              name: ct.ch('skill.explDMG'),
            }),
          },
          {
            text: ct.ch('skill.lvl2CD'),
            unit: 's',
            value: (data) => calculateSkillCD(data, dm.skill.cd_hold2),
          },
        ],
      },
      ct.headerTem('passive1', {
        fields: [
          {
            node: infoMut(a1SkillCd, KeyMap.info('skillCDRed_')),
          },
        ],
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
            node: infoMut(dmgFormulas.burst.regen, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.burst.duration,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.4'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.5'),
            value: dm.burst.enerCost,
          },
        ],
      },
      ct.condTem('burst', {
        value: condInArea,
        path: condInAreaPath,
        name: st('activeCharField'),
        teamBuff: true,
        states: {
          activeInArea: {
            fields: [
              {
                text: ct.chg('burst.skillParams.2'),
                value: (data) => data.get(burstAtkRatio).value * 100,
                unit: '%',
                fixed: 1,
              },
              {
                node: infoMut(burstAddlAtk, { name: st(`increase.atk`) }),
              },
            ],
          },
        },
      }),
      ct.headerTem('passive2', {
        fields: [
          {
            node: infoMut(activeInAreaA4, KeyMap.info('skillCDRed_')),
          },
        ],
        canShow: equal(condInArea, 'activeInArea', 1),
      }),
      ct.headerTem('constellation1', {
        fields: [
          {
            text: ct.ch('additionalATKRatio'),
            node: c1AtkRatio,
          },
          {
            node: infoMut(c1AddlAtk, { name: ct.ch('additionalATK') }),
          },
        ],
        canShow: equal(condInArea, 'activeInArea', 1),
        teamBuff: true,
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            node: constant(
              dm.constellation6.pyro_dmg,
              KeyMap.info('pyro_dmg_')
            ),
          },
          {
            text: ct.ch('c6PyroInfusion'),
          },
        ],
        canShow: equal(condInArea, 'activeInArea', 1),
        teamBuff: true,
      }),
    ]),
    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        value: condUnderHP,
        path: condUnderHPPath,
        name: st('lessPercentHP', {
          percent: dm.constellation2.hp_thresh * 100,
        }),
        states: {
          underHP: {
            fields: [
              {
                node: underHP,
              },
            ],
          },
        },
      }),
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.fieldsTem('constellation4', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation4.dmg, {
              name: ct.ch('c4DMG'),
            }),
          },
        ],
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)

function calculateSkillCD(data: UIData, skillCD: number): string {
  let cdFactor = 1.0
  let result: string = skillCD + 's'
  if (data.get(input.asc).value >= 1) {
    cdFactor = 0.8
  }
  cdFactor *= 1 - data.get(activeInAreaA4).value
  if (cdFactor !== 1.0) {
    result += ' - ' + (100 - cdFactor * 100) + '% = ' + skillCD * cdFactor
  }
  return result
}
