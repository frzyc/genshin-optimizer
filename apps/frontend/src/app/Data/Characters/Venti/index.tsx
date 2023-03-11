import type { CharacterData } from '@genshin-optimizer/pipeline'
import ColorText from '../../../Components/ColoredText'
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
  sum,
  unequal,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { absorbableEle } from '../../../Types/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'Venti'
const elementKey: ElementKey = 'anemo'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1x2
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++], // Aimed
    fully: skillParam_gen.auto[a++], // Fully-charged
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    pressCD: skillParam_gen.skill[s++][0],
    holdDmg: skillParam_gen.skill[s++],
    holdCD: skillParam_gen.skill[s++][0],
  },
  burst: {
    baseDmg: skillParam_gen.burst[b++],
    baseTicks: 20,
    absorbDmg: skillParam_gen.burst[b++],
    absorbTicks: 15,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
  },
  // No real p3/constellation dm values :(
  passive3: {
    stam_: 0.2,
  },
  constellation1: {
    dmgRatio: 0.33,
  },
  constellation2: {
    res_: -0.12,
    duration: 10,
  },
  constellation4: {
    anemo_dmg_: 0.25,
    duration: 10,
  },
  constellation6: {
    res_: -0.2,
    duration: 10, // From KQM
  },
} as const

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
const p3_staminaGlidingDec_ = constant(dm.passive3.stam_)

const [condBurstAbsorptionPath, condBurstAbsorption] = cond(
  key,
  'burstAbsorption'
)

const [condC2Path, condC2] = cond(key, 'c2')
const c2Hit_anemo_enemyRes_ = greaterEq(
  input.constellation,
  2,
  lookup(
    condC2,
    {
      hit: constant(dm.constellation2.res_),
      launched: prod(dm.constellation2.res_, 2),
    },
    naught
  )
)
const c2Hit_phys_enemyRes__ = { ...c2Hit_anemo_enemyRes_ }

const [condC4Path, condC4] = cond(key, 'c4')
const c4_anemo_dmg_ = greaterEq(
  input.constellation,
  4,
  equal(condC4, 'pickup', dm.constellation4.anemo_dmg_)
)

const [condC6Path, condC6] = cond(key, 'c6')
const c6_anemo_enemyRes_ = greaterEq(
  input.constellation,
  6,
  equal(condC6, 'takeDmg', dm.constellation6.res_)
)
const c6_ele_enemyRes_arr = Object.fromEntries(
  absorbableEle.map((ele) => [
    `${ele}_enemyRes_`,
    greaterEq(
      input.constellation,
      6,
      equal(
        condC6,
        'takeDmg',
        equal(ele, condBurstAbsorption, dm.constellation6.res_)
      )
    ),
  ])
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    fully: dmgNode('atk', dm.charged.fully, 'charged', {
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
    press: dmgNode('atk', dm.skill.pressDmg, 'skill'),
    hold: dmgNode('atk', dm.skill.holdDmg, 'skill'),
  },
  burst: {
    base: dmgNode('atk', dm.burst.baseDmg, 'burst'),
    absorb: unequal(
      condBurstAbsorption,
      undefined,
      dmgNode('atk', dm.burst.absorbDmg, 'burst', {
        hit: { ele: condBurstAbsorption },
      })
    ),
  },
  constellation1: {
    aimed: greaterEq(
      input.constellation,
      1,
      customDmgNode(
        prod(
          percent(dm.constellation1.dmgRatio),
          subscript(input.total.autoIndex, dm.charged.aimed, { unit: '%' }),
          input.total.atk
        ),
        'charged'
      )
    ),
    fully: greaterEq(
      input.constellation,
      1,
      customDmgNode(
        prod(
          percent(dm.constellation1.dmgRatio),
          subscript(input.total.autoIndex, dm.charged.fully, { unit: '%' }),
          input.total.atk
        ),
        'charged',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
}

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'mondstadt',
  data_gen,
  dmgFormulas,
  {
    premod: {
      burstBoost: nodeC3,
      skillBoost: nodeC5,
      anemo_dmg_: c4_anemo_dmg_,
      staminaGlidingDec_: p3_staminaGlidingDec_,
    },
    teamBuff: {
      premod: {
        anemo_enemyRes_: sum(c2Hit_anemo_enemyRes_, c6_anemo_enemyRes_),
        physical_enemyRes_: c2Hit_phys_enemyRes__,
        ...c6_ele_enemyRes_arr,
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
            multi: i === 0 || i === 3 ? 2 : undefined,
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
            node: infoMut(dmgFormulas.constellation1.aimed, {
              name: ct.ch('addAimed'),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.fully, {
              name: ct.chg(`auto.skillParams.7`),
            }),
          },
          {
            node: infoMut(dmgFormulas.constellation1.fully, {
              name: ct.ch('addFullAimed'),
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
            node: infoMut(dmgFormulas.skill.press, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: dm.skill.pressCD,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.hold, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            text: st('holdCD'),
            value: dm.skill.holdCD,
            unit: 's',
          },
        ],
      },
      ct.headerTem('passive1', {
        fields: [
          {
            text: ct.ch('upcurrentDuration'),
            value: dm.passive1.duration,
            unit: 's',
          },
        ],
      }),
      ct.condTem('constellation2', {
        value: condC2,
        path: condC2Path,
        teamBuff: true,
        name: ct.chg('constellation2.name'),
        states: {
          hit: {
            name: ct.ch('c2.hit'),
            fields: [
              {
                node: infoMut(
                  c2Hit_anemo_enemyRes_,
                  KeyMap.info('anemo_enemyRes_')
                ),
              },
              {
                node: c2Hit_phys_enemyRes__,
              },
            ],
          },
          launched: {
            name: ct.ch('c2.launched'),
            fields: [
              {
                node: infoMut(
                  c2Hit_anemo_enemyRes_,
                  KeyMap.info('anemo_enemyRes_')
                ),
              },
              {
                node: c2Hit_phys_enemyRes__,
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
            node: infoMut(dmgFormulas.burst.base, {
              name: ct.chg(`burst.skillParams.0`),
              multi: dm.burst.baseTicks,
            }),
          },
          {
            text: ct.chg('burst.skillParams.2'),
            value: dm.burst.duration,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.4'),
            value: dm.burst.enerCost,
          },
        ],
      },
      ct.condTem('burst', {
        value: condBurstAbsorption,
        path: condBurstAbsorptionPath,
        name: st('eleAbsor'),
        states: Object.fromEntries(
          absorbableEle.map((eleKey) => [
            eleKey,
            {
              name: (
                <ColorText color={eleKey}>{stg(`element.${eleKey}`)}</ColorText>
              ),
              fields: [
                {
                  node: infoMut(dmgFormulas.burst.absorb, {
                    name: ct.chg(`burst.skillParams.1`),
                    multi: dm.burst.absorbTicks,
                  }),
                },
              ],
            },
          ])
        ),
      }),
      ct.headerTem('passive2', {
        fields: [
          {
            text: ct.ch('regenEner'),
          },
          {
            text: ct.ch('q'),
          },
        ],
      }),
      ct.condTem('constellation6', {
        // C6 Anemo
        value: condC6,
        path: condC6Path,
        teamBuff: true,
        name: ct.ch('c6'),
        states: {
          takeDmg: {
            fields: [
              {
                node: infoMut(
                  c6_anemo_enemyRes_,
                  KeyMap.info('anemo_enemyRes_')
                ),
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation6', {
        // C6 elemental self-display
        fields: absorbableEle.map((eleKey) => ({
          node: c6_ele_enemyRes_arr[`${eleKey}_enemyRes_`],
        })),
        canShow: unequal(
          condBurstAbsorption,
          undefined,
          equal(condC6, 'takeDmg', equal(target.charKey, key, 1))
        ),
      }),
      ct.condTem('constellation6', {
        // C6 elemental team-display
        value: condBurstAbsorption,
        path: condBurstAbsorptionPath,
        name: st('eleAbsor'),
        teamBuff: true,
        canShow: equal(condC6, 'takeDmg', unequal(input.activeCharKey, key, 1)),
        states: Object.fromEntries(
          absorbableEle.map((eleKey) => [
            eleKey,
            {
              name: (
                <ColorText color={eleKey}>{stg(`element.${eleKey}`)}</ColorText>
              ),
              fields: [
                {
                  node: c6_ele_enemyRes_arr[`${eleKey}_enemyRes_`],
                },
              ],
            },
          ])
        ),
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3', [
      { fields: [{ node: p3_staminaGlidingDec_ }] },
    ]),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.condTem('constellation4', {
        value: condC4,
        path: condC4Path,
        name: st('getElementalOrbParticle'),
        states: {
          pickup: {
            fields: [
              {
                node: c4_anemo_dmg_,
              },
            ],
          },
        },
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)
