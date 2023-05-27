import { allStats } from '@genshin-optimizer/gi-stats'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  infoMut,
  percent,
  prod,
  sum,
  unequal,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { absorbableEle } from '../../../Types/consts'
import { cond, condReadNode, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'

import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'

const key: CharacterKey = 'KaedeharaKazuha'
const elementKey: ElementKey = 'anemo'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5x3
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    hold: skillParam_gen.skill[s++],
    cdHold: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    dot: skillParam_gen.burst[b++],
    add: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    absorbAdd: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    elemas_dmg_: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    elemas: skillParam_gen.constellation2[0],
  },
  constellation6: {
    auto_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const [condBurstAbsorptionPath, condBurstAbsorption] = cond(
  key,
  'burstAbsorption'
)

const [condSkillAbsorptionPath, condSkillAbsorption] = cond(
  key,
  'skillAbsorption'
)

const condSwirlPaths = Object.fromEntries(
  absorbableEle.map((e) => [e, [key, `swirl${e}`]])
)
const condSwirls = Object.fromEntries(
  absorbableEle.map((e) => [e, condReadNode(condSwirlPaths[e])])
)
const asc4 = Object.fromEntries(
  absorbableEle.map((ele) => [
    `${ele}_dmg_`,
    greaterEq(
      input.asc,
      4,
      equal(
        ele,
        condSwirls[ele],
        // Use premod since this is a percentage-based effect
        prod(
          percent(dm.passive2.elemas_dmg_, { fixed: 2 }),
          input.premod.eleMas
        )
      )
    ),
  ])
)

// 2 C2 conds for the 2 parts of his C2
const [condC2Path, condC2] = cond(key, 'c2')
const c2EleMas = greaterEq(
  input.constellation,
  2,
  equal('c2', condC2, dm.constellation2.elemas)
)

const [condC2PPath, condC2P] = cond(key, 'c2p')
const c2PEleMasDisp = greaterEq(
  input.constellation,
  2,
  equal('c2p', condC2P, dm.constellation2.elemas)
)
const c2PEleMas = equal(
  input.activeCharKey,
  target.charKey, // Apply to active character
  unequal(target.charKey, key, c2PEleMasDisp) // But not to Kazuha
)

const [condC6Path, condC6] = cond(key, 'c6')
const c6infusion = greaterEqStr(
  input.constellation,
  6,
  equalStr('c6', condC6, 'anemo')
)
const c6Dmg_ = greaterEq(
  input.constellation,
  6,
  // Not sure if this should be premod or total. I am guessing premod
  equal(
    'c6',
    condC6,
    prod(percent(dm.constellation6.auto_), input.premod.eleMas)
  )
)
// Share `match` and `prod` between the three nodes
const c6NormDmg_ = { ...c6Dmg_ }
const c6ChargedDmg_ = { ...c6Dmg_ }
const c6PlungingDmg_ = { ...c6Dmg_ }

const passive = percent(0.2)

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
    hold: dmgNode('atk', dm.skill.hold, 'skill'),
    pdmg: dmgNode('atk', dm.plunging.dmg, 'plunging', {
      hit: { ele: constant('anemo') },
    }),
    plow: dmgNode('atk', dm.plunging.low, 'plunging', {
      hit: { ele: constant('anemo') },
    }),
    phigh: dmgNode('atk', dm.plunging.high, 'plunging', {
      hit: { ele: constant('anemo') },
    }),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    dot: dmgNode('atk', dm.burst.dot, 'burst'),
    absorb: unequal(
      condBurstAbsorption,
      undefined,
      dmgNode('atk', dm.burst.add, 'burst', {
        hit: { ele: condBurstAbsorption },
      })
    ),
  },
  passive1: {
    absorb: unequal(
      condSkillAbsorption,
      undefined,
      customDmgNode(prod(input.total.atk, dm.passive1.absorbAdd), 'plunging', {
        hit: { ele: condSkillAbsorption },
      })
    ),
  },
  passive2: asc4,
  constellation6: {
    normal_dmg_: c6NormDmg_,
    charged_dmg_: c6ChargedDmg_,
    plunging_dmg_: c6PlungingDmg_,
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  'anemo',
  'inazuma',
  data_gen,
  dmgFormulas,
  {
    teamBuff: {
      premod: {
        staminaSprintDec_: passive,
        eleMas: c2PEleMas,
      },
      total: {
        // Should be in total, since other character abilities should not scale off this
        // if those abilities are percentage-based (e.g. XQ skill dmg red.)
        ...asc4,
      },
    },
    infusion: {
      overridableSelf: c6infusion,
    },
    total: {
      normal_dmg_: c6NormDmg_,
      charged_dmg_: c6ChargedDmg_,
      plunging_dmg_: c6PlungingDmg_,
    },
    premod: {
      skillBoost: nodeC3,
      burstBoost: nodeC5,
      eleMas: c2EleMas,
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
            name: ct.chg(`auto.skillParams.${i + (i < 3 ? 0 : -1)}`),
            textSuffix: i === 2 ? '(1)' : i === 3 ? '(2)' : '',
            multi: i === 5 ? 3 : undefined,
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
            node: infoMut(dmgFormulas.skill.press, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: (data) =>
              data.get(input.constellation).value >= 1
                ? `${dm.skill.cd} - 10% = ${dm.skill.cd * (1 - 0.1)}`
                : `${dm.skill.cd}`,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.hold, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            text: st('holdCD'),
            value: (data) =>
              data.get(input.constellation).value >= 1
                ? `${dm.skill.cdHold} - 10% = ${dm.skill.cdHold * (1 - 0.1)}`
                : `${dm.skill.cdHold}`,
            unit: 's',
          },
        ],
      },
      ct.headerTem('skill', {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.pdmg, {
              name: stg('plunging.dmg'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.plow, {
              name: stg('plunging.low'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.phigh, {
              name: stg('plunging.high'),
            }),
          },
        ],
      }),
      ct.headerTem('constellation1', {
        fields: [
          {
            node: infoMut(
              greaterEq(input.constellation, 1, percent(0.1)),
              KeyMap.info('skillCDRed_')
            ),
          },
          {
            text: ct.ch('c1'),
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
            node: infoMut(dmgFormulas.burst.dot, {
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
        // Burst absorption
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
                    name: ct.chg(`burst.skillParams.2`),
                  }),
                },
              ],
            },
          ])
        ),
      }),
      ct.condTem('constellation2', {
        // C2 self
        value: condC2,
        path: condC2Path,
        name: ct.ch('c2'),
        states: {
          c2: {
            fields: [
              {
                node: c2EleMas,
              },
            ],
          },
        },
      }),
      ct.condTem('constellation2', {
        // C2 Party
        canShow: unequal(input.activeCharKey, key, 1),
        value: condC2P,
        path: condC2PPath,
        teamBuff: true,
        name: st('activeCharField'),
        states: {
          c2p: {
            fields: [
              {
                node: infoMut(c2PEleMasDisp, {
                  ...KeyMap.info('eleMas'),
                  isTeamBuff: true,
                }),
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      ct.condTem('passive1', {
        // Skill Absorption
        value: condSkillAbsorption,
        path: condSkillAbsorptionPath,
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
                  node: infoMut(dmgFormulas.passive1.absorb, {
                    name: stg(`addEleDMG`),
                  }),
                },
              ],
            },
          ])
        ),
      }),
    ]),
    passive2: ct.talentTem('passive2', [
      ct.condTem('passive2', {
        // Poetics of Fuubutsu
        teamBuff: true,
        states: Object.fromEntries(
          absorbableEle.map((ele) => [
            ele,
            {
              value: condSwirls[ele],
              path: condSwirlPaths[ele],
              name: st(`swirlReaction.${ele}`),
              fields: [
                {
                  node: asc4[`${ele}_dmg_`],
                },
                {
                  text: stg('duration'),
                  value: dm.passive2.duration,
                  unit: 's',
                },
              ],
            },
          ])
        ),
      }),
      ct.condTem('constellation2', {
        // C2 self, in teambuff panel
        value: condC2,
        path: condC2Path,
        // Show C2 self buff if A4 is enabled
        teamBuff: true,
        canShow: unequal(
          input.activeCharKey,
          key,
          greaterEq(
            input.asc,
            4,
            sum(
              ...Object.values(condSwirls).map((val) =>
                unequal(val, undefined, 1)
              )
            )
          )
        ),
        name: ct.ch('c2'),
        states: {
          c2: {
            fields: [
              {
                node: c2EleMas,
              },
            ],
          },
        },
      }),
    ]),
    passive3: ct.talentTem('passive3', [
      ct.headerTem('passive3', {
        teamBuff: true,
        fields: [
          {
            node: passive,
          },
        ],
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
    constellation6: ct.talentTem('constellation6', [
      ct.condTem('constellation6', {
        // Crimson Momiji
        value: condC6,
        path: condC6Path,
        name: ct.ch('c6.after'),
        states: {
          c6: {
            fields: [
              {
                canShow: (data) => data.get(c6infusion).value === elementKey,
                text: (
                  <ColorText color={elementKey}>
                    {st('infusion.anemo')}
                  </ColorText>
                ),
              },
              {
                node: c6NormDmg_,
              },
              {
                node: c6ChargedDmg_,
              },
              {
                node: c6PlungingDmg_,
              },
              {
                text: stg('duration'),
                value: dm.constellation6.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
  },
}

export default new CharacterSheet(sheet, data)
