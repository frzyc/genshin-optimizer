import { range } from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input, target } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Ganyu'
const elementKey: ElementKey = 'cryo'
const region: RegionKey = 'liyue'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

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
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    frostflake: skillParam_gen.auto[a++],
    frostflakeBloom: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    inheritedHp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[p1++][0],
    critRateInc: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    cryoDmgBonus: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    opCryoRes: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    enerRegen: skillParam_gen.constellation1[2],
  },
} as const

const [condA1Path, condA1] = cond(key, 'A1')
const [condA4Path, condA4] = cond(key, 'A4')
const [condC1Path, condC1] = cond(key, 'C1')
const [condC4Path, condC4] = cond(key, 'C4')
const cryo_enemyRes_ = greaterEq(
  input.constellation,
  1,
  equal('on', condC1, percent(dm.constellation1.opCryoRes))
)
const cryo_dmg_disp = greaterEq(
  input.asc,
  4,
  equal('on', condA4, percent(dm.passive2.cryoDmgBonus))
)
const cryo_dmg_ = equal(input.activeCharKey, target.charKey, cryo_dmg_disp)
const all_dmg_ = greaterEq(
  input.constellation,
  4,
  lookup(
    condC4,
    Object.fromEntries(range(1, 5).map((i) => [i, percent(0.05 * i)])),
    naught
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    aimedCharged: dmgNode('atk', dm.charged.aimedCharged, 'charged', {
      hit: { ele: constant('cryo') },
    }),
    frostflake: dmgNode('atk', dm.charged.frostflake, 'charged', {
      premod: {
        critRate_: greaterEq(
          input.asc,
          1,
          equal(condA1, 'on', percent(dm.passive1.critRateInc))
        ),
      },
      hit: { ele: constant('cryo') },
    }),
    frostflakeBloom: dmgNode('atk', dm.charged.frostflakeBloom, 'charged', {
      premod: {
        critRate_: greaterEq(
          input.asc,
          1,
          equal(condA1, 'on', percent(dm.passive1.critRateInc))
        ),
      },
      hit: { ele: constant('cryo') },
    }),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    inheritedHp: prod(
      subscript(input.total.skillIndex, dm.skill.inheritedHp),
      input.total.hp
    ),
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
}
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
      skillBoost: nodeC5,
      burstBoost: nodeC3,
    },
    teamBuff: {
      premod: {
        cryo_dmg_,
        all_dmg_,
        cryo_enemyRes_,
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
          {
            node: infoMut(dmgFormulas.charged.frostflake, {
              name: ct.chg(`auto.skillParams.8`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.frostflakeBloom, {
              name: ct.chg(`auto.skillParams.9`),
            }),
          },
        ],
      },
      ct.condTem('passive1', {
        value: condA1,
        path: condA1Path,
        name: ct.ch('a1.condName'),
        states: {
          on: {
            fields: [
              {
                text: ct.ch('a1.critRateInc'),
                value: dm.passive1.critRateInc * 100,
                unit: '%',
              },
              {
                text: stg('duration'),
                value: `${dm.passive1.duration}s`,
              },
            ],
          },
        },
      }),
      ct.condTem('constellation1', {
        value: condC1,
        path: condC1Path,
        name: ct.ch('c1.condName'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: cryo_enemyRes_,
              },
              {
                text: stg('duration'),
                value: `${dm.constellation1.duration}s`,
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
            node: infoMut(dmgFormulas.skill.inheritedHp, {
              name: ct.chg(`skill.skillParams.0`),
              variant: 'heal',
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: `${dm.skill.duration}s`,
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: `${dm.skill.cd}s`,
          },
          {
            canShow: (data) => data.get(input.constellation).value >= 2,
            text: st('charges'),
            value: 2,
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
            text: ct.chg('burst.skillParams.1'),
            value: `${dm.burst.duration}s`,
          },
          {
            text: ct.chg('burst.skillParams.2'),
            value: `${dm.burst.cd}s`,
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: `${dm.burst.enerCost}`,
          },
        ],
      },
      ct.condTem('passive2', {
        value: condA4,
        path: condA4Path,
        teamBuff: true,
        name: st('activeCharField'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(cryo_dmg_disp, KeyMap.info('cryo_dmg_')),
              },
            ],
          },
        },
      }),
      ct.condTem('constellation4', {
        value: condC4,
        path: condC4Path,
        teamBuff: true,
        name: st('opponentsField'),
        states: Object.fromEntries(
          range(1, 5).map((i) => [
            i,
            {
              name: st('seconds', { count: (i - 1) * 3 }),
              fields: [
                { node: all_dmg_ },
                { text: ct.ch('c4.lingerDuration'), value: 3, unit: 's' },
              ],
            },
          ])
        ),
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      ct.fieldsTem('constellation2', {
        fields: [
          {
            text: st('addlCharges'),
            value: 1,
          },
        ],
      }),
    ]),
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
