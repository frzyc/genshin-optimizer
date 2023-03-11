import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
  unequal,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Collei'
const elementKey: ElementKey = 'dendro'
const region: RegionKey = 'sumeru'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
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
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    explosionDmg: skillParam_gen.burst[b++],
    leapDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    unknown: skillParam_gen.passive1[p1++][0],
    sproutDmg: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    durationInc: skillParam_gen.passive2[p2++][0],
    maxExtension: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    enerRech_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
    sproutDmg: skillParam_gen.constellation2[1],
    durationInc: skillParam_gen.constellation2[2],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    anbarDmg: skillParam_gen.constellation6[0],
  },
} as const

const c1_enerRech_ = greaterEq(
  input.constellation,
  1,
  dm.constellation1.enerRech_
)

const [condAfterBurstPath, condAfterBurst] = cond(key, 'afterBurst')
const c4AfterBurst_eleMasDisp = greaterEq(
  input.constellation,
  4,
  equal(condAfterBurst, 'on', dm.constellation4.eleMas)
)
const c4AfterBurst_eleMas = unequal(
  target.charKey,
  key,
  c4AfterBurst_eleMasDisp
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    aimedCharged: dmgNode('atk', dm.charged.aimedCharged, 'charged', {
      hit: { ele: constant(elementKey) },
    }),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    explosionDmg: dmgNode('atk', dm.burst.explosionDmg, 'burst'),
    leapDmg: dmgNode('atk', dm.burst.leapDmg, 'burst'),
  },
  passive1: {
    dmg: greaterEq(
      input.asc,
      1,
      customDmgNode(
        prod(percent(dm.passive1.sproutDmg), input.total.atk),
        'skill',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.anbarDmg), input.total.atk),
        'elemental',
        { hit: { ele: constant(elementKey) } }
      )
    ), // This is possibly burst damage
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
      enerRech_: c1_enerRech_,
    },
    teamBuff: {
      premod: {
        eleMas: c4AfterBurst_eleMas,
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
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      },
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.explosionDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.leapDmg, {
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
      ct.condTem('constellation4', {
        path: condAfterBurstPath,
        value: condAfterBurst,
        teamBuff: true,
        name: st('afterUse.burst'),
        canShow: unequal(target.charKey, input.activeCharKey, 1),
        states: {
          on: {
            fields: [
              {
                node: infoMut(c4AfterBurst_eleMasDisp, KeyMap.info('eleMas')),
              },
              {
                text: stg('duration'),
                value: dm.constellation4.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      ct.fieldsTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.dmg, {
              name: ct.ch('sproutDmg'),
            }),
          },
          {
            text: stg('duration'),
            value: dm.passive1.duration,
            unit: 's',
          },
        ],
      }),
    ]),
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
    constellation6: ct.talentTem('constellation6', [
      ct.fieldsTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.dmg, {
              name: ct.ch('miniAnbarDmg'),
            }),
          },
        ],
      }),
    ]),
  },
}
export default new CharacterSheet(sheet, data)
