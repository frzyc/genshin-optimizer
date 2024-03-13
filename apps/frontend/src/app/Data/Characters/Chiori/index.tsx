import { ColorText } from '@genshin-optimizer/common/ui'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../Formula'
import type { NumNode } from '../../../Formula/type'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  infoMut,
  percent,
  prod,
} from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import type { ICharacterSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
  splitScaleDmgNode,
} from '../dataUtil'

const key: CharacterKey = 'Chiori'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3x2
      skillParam_gen.auto[(a += 2)], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stam: skillParam_gen.auto[(a += 2)][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    turretDmg_atk: skillParam_gen.skill[s++],
    turretDmg_def: skillParam_gen.skill[s++],
    turretDuration: skillParam_gen.skill[s++][0],
    turretInterval: skillParam_gen.skill[s++][0],
    sweepDmg_atk: skillParam_gen.skill[s++],
    sweepDmg_def: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    bloomDmg_atk: skillParam_gen.burst[b++],
    bloomDmg_def: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dollDmg: skillParam_gen.passive1[0][0],
    momentDuration: skillParam_gen.passive1[1][0],
    dollInterval: skillParam_gen.passive1[2][0],
    dollTriggers: skillParam_gen.passive1[3][0],
    infusionDuration: skillParam_gen.passive1[4][0],
  },
  passive2: {
    geo_dmg_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    aoeIncrease: skillParam_gen.constellation1[0],
  },
  constellation2: {
    interval: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    dmg: skillParam_gen.constellation2[2],
    dollDuration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    duration: skillParam_gen.constellation4[0],
    dollDuration: skillParam_gen.constellation4[1],
    maxDolls: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[4],
  },
  constellation6: {
    cdReduction: skillParam_gen.constellation6[0],
    auto_dmgInc_def: skillParam_gen.constellation6[1],
  },
} as const

const [condA1InfusionPath, condA1Infusion] = cond(key, 'a1Infusion')
const a1Infusion = greaterEqStr(
  input.asc,
  1,
  equalStr(condA1Infusion, 'on', constant('geo'))
)

const [condA4ConstructPath, condA4Construct] = cond(key, 'a4Construct')
const a4Construct_geo_dmg_ = greaterEq(
  input.asc,
  4,
  equal(condA4Construct, 'on', dm.passive2.geo_dmg_)
)

const c6Beauty_normal_dmgInc = greaterEq(
  input.constellation,
  6,
  prod(percent(dm.constellation6.auto_dmgInc_def), input.total.def)
)

function sweepDmg(specialMultiplier?: NumNode) {
  return splitScaleDmgNode(
    ['atk', 'def'],
    [dm.skill.sweepDmg_atk, dm.skill.sweepDmg_def],
    'skill',
    undefined,
    specialMultiplier
  )
}

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    turretDmg: splitScaleDmgNode(
      ['atk', 'def'],
      [dm.skill.turretDmg_atk, dm.skill.turretDmg_def],
      'skill'
    ),
    sweepDmg: sweepDmg(),
  },
  burst: {
    bloomDmg: splitScaleDmgNode(
      ['atk', 'def'],
      [dm.burst.bloomDmg_atk, dm.burst.bloomDmg_def],
      'burst'
    ),
  },
  passive1: {
    dollDmg: sweepDmg(percent(dm.passive1.dollDmg)),
  },
  constellation2: {
    dollDmg: greaterEq(
      input.constellation,
      2,
      sweepDmg(percent(dm.passive1.dollDmg * dm.constellation2.dmg))
    ),
  },
  constellation6: {
    c6_normal_dmgInc: c6Beauty_normal_dmgInc,
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
      normal_dmgInc: c6Beauty_normal_dmgInc,
      geo_dmg_: a4Construct_geo_dmg_,
    },
    infusion: {
      overridableSelf: a1Infusion,
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
      ct.headerTem('constellation6', {
        fields: [
          {
            node: c6Beauty_normal_dmgInc,
          },
        ],
      }),
    ]),

    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.turretDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: dm.skill.turretDuration,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.turretInterval,
            unit: 's',
            fixed: 1,
          },
          {
            node: infoMut(dmgFormulas.skill.sweepDmg, {
              name: ct.chg(`skill.skillParams.3`),
            }),
          },
          {
            text: stg('cd'),
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
            node: infoMut(dmgFormulas.burst.bloomDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
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

    passive1: ct.talentTem('passive1', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.dollDmg, {
              name: st('dmg'),
            }),
          },
        ],
      },
      ct.condTem('passive1', {
        value: condA1Infusion,
        path: condA1InfusionPath,
        name: ct.ch('a1Cond'),
        states: {
          on: {
            fields: [
              {
                text: <ColorText color="geo">{st('infusion.geo')}</ColorText>,
              },
            ],
          },
        },
      }),
    ]),
    passive2: ct.talentTem('passive2', [
      ct.condTem('passive2', {
        value: condA4Construct,
        path: condA4ConstructPath,
        name: ct.ch('a4Cond'),
        states: {
          on: {
            fields: [
              {
                node: a4Construct_geo_dmg_,
              },
            ],
          },
        },
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation2.dollDmg, {
              name: st('dmg'),
            }),
          },
        ],
      },
    ]),
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
