import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { cond, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Faruzan'
const elementKey: ElementKey = 'anemo'
const region: RegionKey = 'sumeru'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skill_dmg: skillParam_gen.skill[s++],
    vortex_dmg: skillParam_gen.skill[s++],
    galeDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    anemo_dmg_: skillParam_gen.burst[b++],
    giftDuration: skillParam_gen.burst[b++][0],
    anemo_enemyRes_: -skillParam_gen.burst[b++][0],
    riftDuration: skillParam_gen.burst[b++][0],
    polyDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chargeShotDec_: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    gift_dmgInc: skillParam_gen.passive2[p2++][0],
    cd: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation6: {
    anemo_critDMG_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[0],
  },
} as const

const [condBurstBenefitPath, condBurstBenefit] = cond(key, 'burstBenefit')
const burstBenefit_anemo_dmg_ = equal(
  condBurstBenefit,
  'on',
  subscript(input.total.burstIndex, datamine.burst.anemo_dmg_)
)

const [condBurstHitPath, condBurstHit] = cond(key, 'burstHit')
const burstHit_anemo_enemyRes_ = equal(
  condBurstHit,
  'on',
  datamine.burst.anemo_enemyRes_
)

const [condA4ActivePath, condA4Active] = cond(key, 'a4Active')

const c6Benefit_anemo_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condBurstBenefit, 'on', datamine.constellation6.anemo_critDMG_)
)

const dmgFormulas = {
  normal: Object.fromEntries(
    datamine.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', datamine.charged.aimed, 'charged'),
    aimedCharged: dmgNode('atk', datamine.charged.aimedCharged, 'charged', {
      hit: { ele: constant(elementKey) },
    }),
  },
  plunging: Object.fromEntries(
    Object.entries(datamine.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    skillDmg: dmgNode('atk', datamine.skill.skill_dmg, 'skill'),
    vortexDmg: dmgNode('atk', datamine.skill.vortex_dmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', datamine.burst.dmg, 'burst'),
  },
  passive2: {
    anemo_dmgInc: greaterEq(
      input.asc,
      1,
      equal(
        condA4Active,
        'on',
        equal(
          condBurstBenefit,
          'on',
          prod(percent(datamine.passive2.gift_dmgInc), input.base.atk)
        )
      )
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  region,
  data_gen,
  dmgFormulas,
  {
    premod: {
      burstBoost: burstC5,
      skillBoost: skillC3,
    },
    teamBuff: {
      premod: {
        anemo_dmgInc: dmgFormulas.passive2.anemo_dmgInc,
        anemo_dmg_: burstBenefit_anemo_dmg_,
        anemo_enemyRes_: burstHit_anemo_enemyRes_,
        anemo_critDMG_: c6Benefit_anemo_critDMG_,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
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
        fields: datamine.normal.hitArr.map((_, i) => ({
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
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.aimedCharged, {
              name: ct.chg(`auto.skillParams.5`),
            }),
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
            node: infoMut(dmgFormulas.skill.skillDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.vortexDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: datamine.skill.galeDuration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: datamine.skill.cd,
            unit: 's',
          },
        ],
      },
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
            text: ct.chg('burst.skillParams.5'),
            value: (data) =>
              data.get(input.constellation).value >= 2
                ? `${datamine.burst.polyDuration}s + ${
                    datamine.constellation2.durationInc
                  }s = ${
                    datamine.burst.polyDuration +
                    datamine.constellation2.durationInc
                  }`
                : datamine.burst.polyDuration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: datamine.burst.cd,
            unit: 's',
          },
          {
            text: stg('energyCost'),
            value: datamine.burst.enerCost,
          },
        ],
      },
      ct.condTem('burst', {
        teamBuff: true,
        path: condBurstBenefitPath,
        value: condBurstBenefit,
        name: ct.ch('giftCondName'),
        states: {
          on: {
            fields: [
              {
                node: burstBenefit_anemo_dmg_,
              },
              {
                text: ct.chg('burst.skillParams.2'),
                value: datamine.burst.giftDuration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.condTem('burst', {
        teamBuff: true,
        path: condBurstHitPath,
        value: condBurstHit,
        name: ct.ch('baleCondName'),
        states: {
          on: {
            fields: [
              {
                node: burstHit_anemo_enemyRes_,
              },
              {
                text: ct.chg('burst.skillParams.4'),
                value: datamine.burst.riftDuration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.condTem('passive2', {
        canShow: equal(condBurstBenefit, 'on', 1),
        teamBuff: true,
        path: condA4ActivePath,
        value: condA4Active,
        name: ct.ch('a4CondName'),
        states: {
          on: {
            fields: [
              {
                node: dmgFormulas.passive2.anemo_dmgInc,
              },
              {
                text: stg('cd'),
                value: datamine.passive2.cd,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation2', {
        fields: [
          {
            text: ct.ch('c2DurationInc'),
            value: datamine.constellation2.durationInc,
            unit: 's',
          },
        ],
      }),
      ct.headerTem('constellation6', {
        canShow: equal(condBurstBenefit, 'on', 1),
        teamBuff: true,
        fields: [
          {
            node: c6Benefit_anemo_critDMG_,
          },
          {
            // Only show on Faruzan's page
            canShow: (data) => data.get(input.activeCharKey).value === key,
            text: ct.ch('c6Arrow'),
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
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: burstC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}
export default new CharacterSheet(sheet, data)
