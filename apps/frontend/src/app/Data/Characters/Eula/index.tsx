import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
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
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Eula'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p1 = 0
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
    icewhirl: skillParam_gen.skill[s++],
    physResDec: skillParam_gen.skill[s++],
    cryoResDec: skillParam_gen.skill[s++],
    resDecDuration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
    defBonus: skillParam_gen.skill[s++][0],
    unknown: skillParam_gen.skill[s++][0], // combined cooldown?
    physResDecNegative: skillParam_gen.skill[s++],
    cryoResDecNegative: skillParam_gen.skill[s++],
    grimheartDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    lightfallDmg: skillParam_gen.burst[b++],
    dmgPerStack: skillParam_gen.burst[b++],
    maxStack: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    percentage: skillParam_gen.passive1[p1++][0],
  },
  constellation1: {
    physInc: skillParam_gen.constellation1[0],
  },
  constellation4: {
    dmgInc: skillParam_gen.constellation4[0],
  },
} as const

const [condGrimheartStacksPath, condGrimheartStacks] = cond(key, 'Grimheart')
const [condGrimheartConsumedPath, condGrimheartConsumed] = cond(
  key,
  'grimheartConsumed'
)
const [condLightfallSwordPath, condLightfallSword] = cond(key, 'LightfallSword')
const [condC4Path, condC4] = cond(key, 'LightfallSwordC4')
const [condTidalIllusionPath, condTidalIllusion] = cond(key, 'TidalIllusion')

const lightfallSwordStacks = range(1, 30)
const lightfallSwordBonusScaling = prod(
  subscript(input.total.burstIndex, dm.burst.dmgPerStack, {
    name: ct.ch('burstC.bonusScaling'),
    unit: '%',
    variant: 'physical',
  }),
  lookup(
    condLightfallSword,
    objectKeyMap(lightfallSwordStacks, (stack) => constant(stack)),
    naught,
    { name: ct.ch('burstC.name') }
  )
)

const def_ = lookup(
  condGrimheartStacks,
  {
    stack1: percent(dm.skill.defBonus),
    stack2: percent(2 * dm.skill.defBonus),
  },
  naught
)
const cryo_enemyRes_ = equal(
  'on',
  condGrimheartConsumed,
  subscript(input.total.skillIndex, dm.skill.cryoResDecNegative)
)
const physical_enemyRes_ = equal(
  'on',
  condGrimheartConsumed,
  subscript(input.total.skillIndex, dm.skill.physResDecNegative)
)
const physical_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condTidalIllusion, percent(dm.constellation1.physInc))
)

const c4_sword_dmg_ = greaterEq(
  input.constellation,
  4,
  equal(condC4, 'on', constant(dm.constellation4.dmgInc)),
  { name: ct.ch('c4C.dmgBonus') }
)
const lightSwordAdditional: Data = {
  premod: { burst_dmg_: c4_sword_dmg_ },
  hit: { ele: constant('physical') },
}

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
    icewhirl: dmgNode('atk', dm.skill.icewhirl, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    lightFallSwordNew: customDmgNode(
      prod(
        sum(
          subscript(input.total.burstIndex, dm.burst.lightfallDmg, {
            unit: '%',
          }),
          lightfallSwordBonusScaling
        ),
        input.total.atk
      ),
      'burst',
      lightSwordAdditional
    ),
  },
  passive1: {
    shatteredLightfallSword: greaterEq(
      input.asc,
      1,
      prod(
        dmgNode(
          'atk',
          dm.burst.lightfallDmg,
          'burst',
          lightSwordAdditional,
          percent(dm.passive1.percentage)
        )
      )
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  'cryo',
  'mondstadt',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC5,
      burstBoost: nodeC3,
      def_,
      cryo_enemyRes_,
      physical_enemyRes_,
      physical_dmg_,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.star,
  elementKey: 'cryo',
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
            multi: i === 2 || i === 4 ? 2 : undefined,
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
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.finalDmg, {
              name: ct.chg(`auto.skillParams.6`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.7'),
            value: dm.charged.stamina,
            unit: '/s',
          },
          {
            text: ct.chg('auto.skillParams.8'),
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
            text: ct.chg('skill.skillParams.8'),
            value: `${dm.skill.pressCd}`,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.hold, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: st('holdCD'),
            value: `${dm.skill.holdCd}`,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: 2,
          },
          {
            node: infoMut(dmgFormulas.skill.icewhirl, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
        ],
      },
      ct.condTem('skill', {
        value: condGrimheartStacks,
        path: condGrimheartStacksPath,
        name: ct.ch('skillC.name'),
        states: {
          stack1: {
            name: st('stack', { count: 1 }),
            fields: [
              {
                node: def_,
              },
              {
                text: st('incInterRes'),
              },
              {
                text: ct.chg('skill.skillParams.4'),
                value: dm.skill.grimheartDuration,
                unit: 's',
              },
            ],
          },
          stack2: {
            name: st('stack', { count: 2 }),
            fields: [
              {
                node: def_,
              },
              {
                text: st('incInterRes'),
              },
              {
                text: ct.chg('skill.skillParams.4'),
                value: dm.skill.grimheartDuration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.condTem('skill', {
        value: condGrimheartConsumed,
        path: condGrimheartConsumedPath,
        name: ct.ch('c1C.name'),
        states: {
          on: {
            fields: [
              {
                node: cryo_enemyRes_,
              },
              {
                node: physical_enemyRes_,
              },
              {
                text: stg('duration'),
                value: 7,
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
            node: infoMut(dmgFormulas.burst.lightFallSwordNew, {
              name: ct.ch('burstC.dmg'),
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
            text: stg('duration'),
            value: 7,
            unit: 's',
          },
        ],
      },
      ct.condTem('burst', {
        value: condLightfallSword,
        path: condLightfallSwordPath,
        name: ct.ch('burstC.name'),
        states: {
          ...objectKeyMap(lightfallSwordStacks, (i) => ({
            name: st('stack', { count: i }),
            fields: [
              {
                node: infoMut(lightfallSwordBonusScaling, {
                  name: ct.ch('burstC.bonusScaling'),
                  unit: '%',
                  variant: 'physical',
                }),
              },
            ],
          })),
        },
      }),
      ct.condTem('constellation4', {
        value: condC4,
        path: condC4Path,
        name: ct.ch('c4C.name'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(c4_sword_dmg_, {
                  name: ct.ch('c4C.dmgBonus'),
                  unit: '%',
                  variant: 'physical',
                }),
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            text: ct.ch('burstC.start5'),
          },
          {
            text: ct.ch('burstC.addStacks'),
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      ct.fieldsTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.shatteredLightfallSword, {
              name: ct.ch('passive1'),
            }),
          },
        ],
      }),
    ]),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1', [
      ct.condTem('constellation1', {
        value: condTidalIllusion,
        path: condTidalIllusionPath,
        name: ct.ch('c1C.name'),
        states: {
          on: {
            fields: [
              {
                node: physical_dmg_,
              },
              {
                text: stg('duration'),
                value: ct.ch('c1C.durationStack'),
              },
            ],
          },
        },
      }),
    ]),
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
