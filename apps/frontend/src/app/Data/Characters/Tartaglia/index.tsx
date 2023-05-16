import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../Formula'
import {
  constant,
  greaterEq,
  infoMut,
  prod,
  subscript,
} from '../../../Formula/utils'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'

const key: CharacterKey = 'Tartaglia'
const elementKey: ElementKey = 'hydro'
const region: RegionKey = 'snezhnaya'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p1 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  riptide: {
    flashDmg: skillParam_gen.auto[a++],
    burstDmg: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  riptideDuration: skillParam_gen.auto[a++][0],
  skill: {
    stanceDmg: skillParam_gen.skill[s++],
    normal1: skillParam_gen.skill[s++],
    normal2: skillParam_gen.skill[s++],
    normal3: skillParam_gen.skill[s++],
    normal4: skillParam_gen.skill[s++],
    normal5: skillParam_gen.skill[s++],
    normal61: skillParam_gen.skill[s++], // 6.1
    normal62: skillParam_gen.skill[s++], // 6.2
    charged1: skillParam_gen.skill[s++],
    charged2: skillParam_gen.skill[s++],
    riptideSlash: skillParam_gen.skill[s++],
    chargedStamina: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    preemptiveCd1: skillParam_gen.skill[s++][0],
    preemptiveCd2: skillParam_gen.skill[s++][0],
    maxCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    meleeDmg: skillParam_gen.burst[b++],
    riptideBlastDmg: skillParam_gen.burst[b++],
    rangedDmg: skillParam_gen.burst[b++],
    enerReturned: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    durationExt: skillParam_gen.passive1[p1++][0],
  },
  passive: {
    auto_boost: 1,
  },
  constellation1: {
    cdRed: 0.2,
  },
} as const

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    aimedCharged: dmgNode('atk', dm.charged.aimedCharged, 'charged', {
      hit: { ele: constant('hydro') },
    }),
    flashDmg: dmgNode('atk', dm.riptide.flashDmg, 'normal', {
      hit: { ele: constant('hydro') },
    }),
    burstDmg: dmgNode('atk', dm.riptide.burstDmg, 'normal', {
      hit: { ele: constant('hydro') },
    }),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    stanceDmg: dmgNode('atk', dm.skill.stanceDmg, 'skill'),
    normal1: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.normal1, { unit: '%' }),
        input.total.atk
      ),
      'normal',
      { hit: { ele: constant('hydro') } }
    ),
    normal2: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.normal2, { unit: '%' }),
        input.total.atk
      ),
      'normal',
      { hit: { ele: constant('hydro') } }
    ),
    normal3: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.normal3, { unit: '%' }),
        input.total.atk
      ),
      'normal',
      { hit: { ele: constant('hydro') } }
    ),
    normal4: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.normal4, { unit: '%' }),
        input.total.atk
      ),
      'normal',
      { hit: { ele: constant('hydro') } }
    ),
    normal5: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.normal5, { unit: '%' }),
        input.total.atk
      ),
      'normal',
      { hit: { ele: constant('hydro') } }
    ),
    normal61: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.normal61, { unit: '%' }),
        input.total.atk
      ),
      'normal',
      { hit: { ele: constant('hydro') } }
    ),
    normal62: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.normal62, { unit: '%' }),
        input.total.atk
      ),
      'normal',
      { hit: { ele: constant('hydro') } }
    ),
    charged1: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.charged1, { unit: '%' }),
        input.total.atk
      ),
      'charged',
      { hit: { ele: constant('hydro') } }
    ),
    charged2: customDmgNode(
      prod(
        subscript(input.total.skillIndex, dm.skill.charged2, { unit: '%' }),
        input.total.atk
      ),
      'charged',
      { hit: { ele: constant('hydro') } }
    ),
    riptideSlash: dmgNode('atk', dm.skill.riptideSlash, 'skill'),
  },
  burst: {
    meleeDmg: dmgNode('atk', dm.burst.meleeDmg, 'burst'),
    rangedDmg: dmgNode('atk', dm.burst.rangedDmg, 'burst'),
    riptideBlastDmg: dmgNode('atk', dm.burst.riptideBlastDmg, 'burst'),
  },
}

const nodePassive = constant(1)

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  region,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC3,
      burstBoost: nodeC5,
    },
    teamBuff: {
      premod: {
        autoBoost: nodePassive,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
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
            node: infoMut(dmgFormulas.charged.aimed, {
              name: ct.chg(`auto.skillParams.6`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.aimedCharged, {
              name: ct.chg(`auto.skillParams.7`),
            }),
          },
        ],
      },
      {
        text: ct.chg('auto.fields.riptide'),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.flashDmg, {
              name: ct.chg(`auto.skillParams.8`),
              multi: 3,
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.burstDmg, {
              name: ct.chg(`auto.skillParams.9`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.10'),
            value: (data) =>
              data.get(input.asc).value >= 1
                ? dm.passive1.durationExt + dm.riptideDuration
                : dm.riptideDuration,
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
            node: infoMut(dmgFormulas.skill.stanceDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.normal1, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.normal2, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.normal3, {
              name: ct.chg(`skill.skillParams.3`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.normal4, {
              name: ct.chg(`skill.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.normal5, {
              name: ct.chg(`skill.skillParams.5`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.normal61, {
              name: ct.chg(`skill.skillParams.6`),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.normal62, {
              name: ct.chg(`skill.skillParams.6`),
              textSuffix: '(2)',
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.charged1, {
              name: ct.chg(`skill.skillParams.7`),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.charged2, {
              name: ct.chg(`skill.skillParams.7`),
              textSuffix: '(2)',
            }),
          },
          {
            node: infoMut(constant(dm.skill.chargedStamina), {
              name: ct.chg(`skill.skillParams.8`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.riptideSlash, {
              name: ct.chg(`skill.skillParams.9`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.10'),
            value: dm.skill.duration,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.11'),
            value: (data) =>
              data.get(input.constellation).value >= 1
                ? `${
                    dm.skill.preemptiveCd1 -
                    dm.skill.preemptiveCd1 * dm.constellation1.cdRed
                  }
            - ${
              dm.skill.preemptiveCd2 -
              dm.skill.preemptiveCd2 * dm.constellation1.cdRed
            }`
                : `${dm.skill.preemptiveCd1} - ${dm.skill.preemptiveCd2}`,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.12'),
            value: (data) =>
              data.get(input.constellation).value >= 1
                ? `${dm.skill.maxCd - dm.skill.maxCd * dm.constellation1.cdRed}`
                : `${dm.skill.maxCd}`,
            unit: 's',
          },
        ],
      },
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.meleeDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.rangedDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.riptideBlastDmg, {
              name: ct.chg(`burst.skillParams.2`),
            }),
          },
          {
            text: ct.chg('burst.skillParams.4'),
            value: `${dm.burst.cd}`,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.5'),
            value: `${dm.burst.enerCost}`,
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: `${dm.burst.enerReturned}`,
          },
        ],
      },
    ]),
    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3', [
      ct.headerTem('passive3', {
        teamBuff: true,
        fields: [{ node: nodePassive }],
      }),
    ]),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
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
