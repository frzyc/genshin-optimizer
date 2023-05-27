import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
  threshold,
} from '../../../Formula/utils'
import { objectKeyMap } from '../../../Util/Util'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  shieldElement,
  shieldNodeTalent,
} from '../dataUtil'

const key: CharacterKey = 'Kirara'
const elementKey: ElementKey = 'dendro'
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
    dmg3: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    tailDmg: skillParam_gen.skill[s++],
    shield_hp_: skillParam_gen.skill[s++],
    shield_base: skillParam_gen.skill[s++],
    maxShield_hp_: skillParam_gen.skill[s++],
    maxShield_base: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    parcelDmg: skillParam_gen.skill[s++],
    parcelDuration: skillParam_gen.skill[s++][0],
    strikeDmg: skillParam_gen.skill[s++],
    cdMin: skillParam_gen.skill[s++][0],
    cdMax: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    explosionDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cd: skillParam_gen.passive1[0][0],
    maxStacks: skillParam_gen.passive1[1][0],
    shieldMult_: skillParam_gen.passive1[2][0],
  },
  passive2: {
    skill_dmg_: skillParam_gen.passive2[0][0],
    burst_dmg_: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    hpThresh: skillParam_gen.constellation1[0],
    maxExtra: skillParam_gen.constellation1[1],
  },
  constellation2: {
    shieldMult_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    cd: skillParam_gen.constellation2[2],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    all_dmg_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const skillShield = shieldNodeTalent(
  'hp',
  dm.skill.shield_hp_,
  dm.skill.shield_base,
  'skill'
)
const maxSkillShield = shieldNodeTalent(
  'hp',
  dm.skill.maxShield_hp_,
  dm.skill.maxShield_base,
  'skill'
)
const p1Shield = shieldNodeTalent(
  'hp',
  dm.skill.shield_hp_,
  dm.skill.shield_base,
  'skill',
  undefined,
  dm.passive1.shieldMult_
)
const c2Shield = shieldNodeTalent(
  'hp',
  dm.skill.maxShield_hp_,
  dm.skill.maxShield_base,
  'skill',
  undefined,
  dm.constellation2.shieldMult_
)

const [condC6AfterSkillBurstPath, condC6AfterSkillBurst] = cond(
  key,
  'c6AfterSkillBurst'
)
const c6Ele_dmg_map = objectKeyMap(
  allElementKeys.map((ele) => `${ele}_dmg_`),
  (_ele) =>
    greaterEq(
      input.constellation,
      6,
      equal(condC6AfterSkillBurst, 'on', dm.constellation6.all_dmg_)
    )
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
    Object.entries(dm.plunging).map(([name, arr]) => [
      name,
      dmgNode('atk', arr, 'plunging'),
    ])
  ),
  skill: {
    tailDmg: dmgNode('atk', dm.skill.tailDmg, 'skill'),
    shield: skillShield,
    dendroShield: shieldElement('dendro', skillShield),
    maxShield: maxSkillShield,
    maxDendroShield: shieldElement('dendro', maxSkillShield),
    parcelDmg: dmgNode('atk', dm.skill.parcelDmg, 'skill'),
    strikeDmg: dmgNode('atk', dm.skill.strikeDmg, 'skill'),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    explosionDmg: dmgNode('atk', dm.burst.explosionDmg, 'burst'),
  },
  passive1: {
    shield: greaterEq(input.asc, 1, p1Shield),
    dendroShield: greaterEq(input.asc, 1, shieldElement('dendro', p1Shield)),
  },
  passive2: {
    skill_dmg_: greaterEq(
      input.asc,
      4,
      prod(percent(dm.passive2.skill_dmg_), input.total.hp, 1 / 1000)
    ),
    burst_dmg_: greaterEq(
      input.asc,
      4,
      prod(percent(dm.passive2.burst_dmg_), input.total.hp, 1 / 1000)
    ),
  },
  constellation1: {
    extraCardamom: greaterEq(
      input.constellation,
      1,
      threshold(
        input.total.hp,
        dm.constellation1.hpThresh * 4,
        4,
        threshold(
          input.total.hp,
          dm.constellation1.hpThresh * 3,
          3,
          threshold(
            input.total.hp,
            dm.constellation1.hpThresh * 2,
            2,
            threshold(input.total.hp, dm.constellation1.hpThresh, 1, 0)
          )
        )
      )
    ),
  },
  constellation2: {
    shield: greaterEq(input.constellation, 2, c2Shield),
    dendroShield: greaterEq(
      input.constellation,
      2,
      shieldElement('dendro', c2Shield)
    ),
  },
  constellation4: {
    dmg: greaterEq(
      input.constellation,
      4,
      customDmgNode(
        prod(percent(dm.constellation4.dmg), input.total.atk),
        'burst',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'inazuma',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC3,
      burstBoost: burstC5,
      skill_dmg_: dmgFormulas.passive2.skill_dmg_,
      burst_dmg_: dmgFormulas.passive2.burst_dmg_,
    },
    teamBuff: {
      premod: c6Ele_dmg_map,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
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
            node: infoMut(dmgFormulas.charged.dmg1, {
              name: ct.chg(`auto.skillParams.4`),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.dmg2, {
              name: ct.chg(`auto.skillParams.4`),
              textSuffix: '(2)',
              multi: 2,
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
            node: infoMut(dmgFormulas.skill.tailDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.shield, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.dendroShield, {
              name: st(`dmgAbsorption.${elementKey}`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.maxShield, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.maxDendroShield, {
              name: st(`dmgAbsorption.max.${elementKey}`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: dm.skill.shieldDuration,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.parcelDmg, {
              name: ct.chg('skill.skillParams.4'),
            }),
          },
          {
            text: ct.chg('skill.skillParams.5'),
            value: dm.skill.parcelDuration,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.strikeDmg, {
              name: ct.chg('skill.skillParams.6'),
            }),
          },
          {
            text: stg('cd'),
            value: `${dm.skill.cdMin}s ~ ${dm.skill.cdMax}`,
            unit: 's',
          },
        ],
      },
      ct.headerTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.shield, {
              name: stg('dmgAbsorption'),
            }),
          },
          {
            node: infoMut(dmgFormulas.passive1.dendroShield, {
              name: st(`dmgAbsorption.${elementKey}`),
            }),
          },
        ],
      }),
      ct.headerTem('passive2', {
        fields: [
          {
            node: dmgFormulas.passive2.skill_dmg_,
          },
        ],
      }),
      ct.headerTem('constellation2', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation2.shield, {
              name: stg('dmgAbsorption'),
            }),
          },
          {
            node: infoMut(dmgFormulas.constellation2.dendroShield, {
              name: st(`dmgAbsorption.${elementKey}`),
            }),
          },
          {
            text: stg('duration'),
            value: dm.constellation2.duration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.constellation2.cd,
            unit: 's',
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
            node: infoMut(dmgFormulas.burst.explosionDmg, {
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
            value: dm.burst.cost,
          },
        ],
      },
      ct.headerTem('passive2', {
        fields: [{ node: dmgFormulas.passive2.burst_dmg_ }],
      }),
      ct.headerTem('constellation1', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation1.extraCardamom, {
              name: ct.ch('extraCardamom'),
            }),
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
      { fields: [{ node: skillC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.fieldsTem('constellation4', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation4.dmg, {
              name: ct.ch('c4Dmg'),
            }),
          },
          { text: stg('cd'), value: dm.constellation4.cd, unit: 's' },
        ],
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: burstC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.condTem('constellation6', {
        value: condC6AfterSkillBurst,
        path: condC6AfterSkillBurstPath,
        teamBuff: true,
        name: st('afterUse.skillOrBurst'),
        states: {
          on: {
            fields: Object.values(c6Ele_dmg_map).map((node) => ({ node })),
          },
        },
      }),
    ]),
  },
}
export default new CharacterSheet(sheet, data)
