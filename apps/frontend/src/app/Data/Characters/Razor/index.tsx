import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
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
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type {
  CharacterKey,
  ElementKey,
  RegionKey,
} from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Razor'
const elementKey: ElementKey = 'electro'
const regionKey: RegionKey = 'mondstadt'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
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
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    erBonus: skillParam_gen.skill[s++][0],
    enerRegen: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    companionDmg: skillParam_gen.burst[b++],
    atkSpdBonus: skillParam_gen.burst[b++],
    electroResBonus: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdRed: 0.18,
  },
  passive2: {
    enerThreshold: 0.5,
    erInc: 0.3,
  },
  passive3: {
    sprintStaminaDec: 0.2,
  },
  constellation1: {
    allDmgInc: 0.1,
    duration: 8,
  },
  constellation2: {
    hpThreshold: 0.3,
    critRateInc: 0.1,
  },
  constellation4: {
    defDec: 0.15,
    duration: 7,
  },
  constellation6: {
    dmg: 1,
    electroSigilGenerated: 1,
    cd: 10,
  },
} as const

const [condElectroSigilPath, condElectroSigil] = cond(key, 'ElectroSigil')
const [condTheWolfWithinPath, condTheWolfWithin] = cond(key, 'TheWolfWithin')
const [condA4Path, condA4] = cond(key, 'A4')
const [condC1Path, condC1] = cond(key, 'C1')
const [condC2Path, condC2] = cond(key, 'C2')
const [condC4Path, condC4] = cond(key, 'C4')

const enerRechElectroSigil_ = lookup(
  condElectroSigil,
  objectKeyMap(range(1, 3), (i) => prod(i, percent(dm.skill.erBonus))),
  naught,
  KeyMap.info('enerRech_')
)
const electro_res_ = equal(
  'on',
  condTheWolfWithin,
  percent(dm.burst.electroResBonus)
)
const atkSPD_ = equal(
  'on',
  condTheWolfWithin,
  subscript(input.total.burstIndex, dm.burst.atkSpdBonus, { unit: '%' })
)
const enerRechA4_ = greaterEq(
  input.asc,
  4,
  equal('on', condA4, percent(dm.passive2.erInc, KeyMap.info('enerRech_')))
)
const all_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condC1, percent(dm.constellation1.allDmgInc))
)
const critRate_ = greaterEq(
  input.constellation,
  2,
  equal('on', condC2, percent(dm.constellation2.critRateInc))
)
const enemyDefRed_ = greaterEq(
  input.constellation,
  4,
  equal('on', condC4, percent(dm.constellation4.defDec))
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    spinningDmg: dmgNode('atk', dm.charged.spinningDmg, 'charged'),
    finalDmg: dmgNode('atk', dm.charged.finalDmg, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    press: dmgNode('atk', dm.skill.press, 'skill'),
    hold: dmgNode('atk', dm.skill.hold, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    companionDmg1: customDmgNode(
      prod(
        prod(
          subscript(input.total.autoIndex, dm.normal.hitArr[0]),
          subscript(input.total.burstIndex, dm.burst.companionDmg)
        ),
        input.total.atk
      ),
      'burst'
    ),
    companionDmg2: customDmgNode(
      prod(
        prod(
          subscript(input.total.autoIndex, dm.normal.hitArr[1]),
          subscript(input.total.burstIndex, dm.burst.companionDmg)
        ),
        input.total.atk
      ),
      'burst'
    ),
    companionDmg3: customDmgNode(
      prod(
        prod(
          subscript(input.total.autoIndex, dm.normal.hitArr[2]),
          subscript(input.total.burstIndex, dm.burst.companionDmg)
        ),
        input.total.atk
      ),
      'burst'
    ),
    companionDmg4: customDmgNode(
      prod(
        prod(
          subscript(input.total.autoIndex, dm.normal.hitArr[3]),
          subscript(input.total.burstIndex, dm.burst.companionDmg)
        ),
        input.total.atk
      ),
      'burst'
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'elemental',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  regionKey,
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC5,
      burstBoost: nodeC3,
      enerRech_: sum(enerRechElectroSigil_, enerRechA4_),
      electro_res_,
      atkSPD_,
      all_dmg_,
      critRate_,
    },
    teamBuff: {
      premod: {
        enemyDefRed_,
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
            node: infoMut(dmgFormulas.charged.spinningDmg, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.finalDmg, {
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.6'),
            value: dm.charged.stamina,
            unit: '/s',
          },
          {
            text: ct.chg('auto.skillParams.7'),
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
            node: infoMut(dmgFormulas.skill.press, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.5'),
            value: (data) =>
              data.get(input.asc).value >= 1
                ? dm.skill.pressCd - dm.skill.pressCd * dm.passive1.cdRed
                : dm.skill.pressCd,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.hold, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.6'),
            value: (data) =>
              data.get(input.asc).value >= 1
                ? dm.skill.holdCd - dm.skill.holdCd * dm.passive1.cdRed
                : dm.skill.holdCd,
            unit: 's',
          },
        ],
      },
      ct.condTem('skill', {
        // Electro Sigil
        value: condElectroSigil,
        path: condElectroSigilPath,
        name: ct.ch('electroSigil'),
        states: {
          ...objectKeyMap(range(1, 3), (i) => ({
            name: st('stack', { count: i }),
            fields: [
              {
                node: enerRechElectroSigil_,
              },
              {
                text: ct.chg('skill.skillParams.4'),
                value: dm.skill.duration,
                unit: 's',
              },
              {
                text: ct.ch('electroSigilAbsorbed'),
                value: dm.skill.enerRegen * i,
              },
            ],
          })),
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
            node: infoMut(dmgFormulas.burst.companionDmg1, {
              name: ct.chg(`burst.skillParams.1`),
              textSuffix: ct.chg('auto.skillParams.0'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.companionDmg2, {
              name: ct.chg(`burst.skillParams.1`),
              textSuffix: ct.chg('auto.skillParams.1'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.companionDmg3, {
              name: ct.chg(`burst.skillParams.1`),
              textSuffix: ct.chg('auto.skillParams.2'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.companionDmg4, {
              name: ct.chg(`burst.skillParams.1`),
              textSuffix: ct.chg('auto.skillParams.3'),
            }),
          },
          {
            text: ct.chg('burst.skillParams.4'),
            value: dm.burst.duration,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.5'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.6'),
            value: dm.burst.enerCost,
          },
        ],
      },
      ct.condTem('burst', {
        // The Wolf Within
        value: condTheWolfWithin,
        path: condTheWolfWithinPath,
        name: ct.chg('burst.description.3'),
        states: {
          on: {
            fields: [
              {
                node: electro_res_,
              },
              {
                node: atkSPD_,
              },
              {
                text: st('incInterRes'),
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.condTem('passive2', {
        value: condA4,
        path: condA4Path,
        name: st('lessPercentEnergy', {
          percent: dm.passive2.enerThreshold * 100,
        }),
        states: {
          on: {
            fields: [
              {
                node: enerRechA4_,
              },
            ],
          },
        },
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.condTem('constellation1', {
        value: condC1,
        path: condC1Path,
        name: st('getElementalOrbParticle'),
        states: {
          on: {
            fields: [
              {
                node: all_dmg_,
              },
              {
                text: stg('duration'),
                value: dm.constellation1.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        value: condC2,
        path: condC2Path,
        name: st('enemyLessPercentHP', {
          percent: dm.constellation2.hpThreshold * 100,
        }),
        states: {
          on: {
            fields: [
              {
                node: critRate_,
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
      ct.condTem('constellation4', {
        value: condC4,
        path: condC4Path,
        teamBuff: true,
        name: ct.ch('opHitWithClawAndThunder'),
        states: {
          on: {
            fields: [
              {
                node: enemyDefRed_,
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
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.fieldsTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.dmg, { name: st('dmg') }),
          },
          {
            text: ct.ch('electroSigilPerProc'),
            value: dm.constellation6.electroSigilGenerated,
          },
          {
            text: st('cooldown'),
            value: dm.constellation6.cd,
            unit: 's',
          },
        ],
      }),
    ]),
  },
}

export default new CharacterSheet(sheet, data)
