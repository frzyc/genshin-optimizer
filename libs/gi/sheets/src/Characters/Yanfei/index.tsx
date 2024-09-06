import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  naught,
  one,
  percent,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  customShieldNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
  shieldElement,
} from '../dataUtil'

const key: CharacterKey = 'Yanfei'
const elementKey: ElementKey = 'pyro'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    dmgArr: [
      skillParam_gen.auto[a++], // 0 seals
      skillParam_gen.auto[a++], // 1 seal
      skillParam_gen.auto[a++], // 2 seals
      skillParam_gen.auto[a++], // 3 seals
      skillParam_gen.auto[a++], // 4 seals
    ],
    unknown: {
      arr: [
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
      ],
    },
    stamina: skillParam_gen.auto[a++][0],
    sealStaminaRed_: skillParam_gen.auto[a++][0],
    maxSeals: 3,
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  sealDuration: skillParam_gen.auto[a++][0],
  // There is another unknown here for auto
  skill: {
    dmg: skillParam_gen.skill[0],
    cd: skillParam_gen.skill[1][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    charged_dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    sealInterval: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    seal_pyro_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    dmg: percent(skillParam_gen.passive2[0][0]),
  },
  c1: {
    sealStaminaRed_: skillParam_gen.constellation1[0],
  },
  c2: {
    hpThresh: skillParam_gen.constellation2[0],
    charged_critRate_: skillParam_gen.constellation2[1],
  },
  c4: {
    hpShield_: skillParam_gen.constellation4[0],
    duration: 15,
  },
  c6: {
    extraSeals: skillParam_gen.constellation6[0],
  },
} as const

const [condAfterBurstPath, condAfterBurst] = cond(key, 'afterBurst')
const afterBurst_charged_dmg_ = equal(
  condAfterBurst,
  'on',
  subscript(input.total.burstIndex, dm.burst.charged_dmg_)
)

const [condP1SealsPath, condP1Seals] = cond(key, 'p1Seals')
const sealsArr = range(1, 4)
const p1_pyro_dmg_ = greaterEq(
  input.asc,
  1,
  prod(
    lookup(
      condP1Seals,
      objKeyMap(sealsArr, (seal) =>
        // Only allow 4th seal for c6.
        seal === 4 ? greaterEq(input.constellation, 6, seal) : constant(seal)
      ),
      naught
    ),
    dm.passive1.seal_pyro_dmg_
  )
)

const a4_dmg = greaterEq(
  input.asc,
  4,
  customDmgNode(prod(input.total.atk, dm.passive2.dmg), 'charged')
)

const [condC2EnemyHpPath, condC2EnemyHp] = cond(key, 'c2EnemyHp')
const c2EnemyHp_critRate_ = greaterEq(
  input.constellation,
  2,
  equal(condC2EnemyHp, 'on', dm.c2.charged_critRate_)
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: Object.fromEntries(
    dm.charged.dmgArr.map((arr, i) => [
      i,
      i < 4
        ? dmgNode('atk', arr, 'charged')
        : greaterEq(input.constellation, 6, dmgNode('atk', arr, 'charged')),
    ])
  ),
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  passive2: {
    dmg: a4_dmg,
    probabilistic_dmg: prod(
      lookup(
        input.hit.hitMode,
        {
          hit: naught,
          critHit: one,
          avgHit: input.total.cappedCritRate,
        },
        naught
      ),
      a4_dmg
    ),
  },
  constellation4: {
    pyro_shield: greaterEq(
      input.constellation,
      4,
      shieldElement(
        elementKey,
        customShieldNode(prod(input.total.hp, dm.c4.hpShield_))
      )
    ),
    norm_shield: greaterEq(
      input.constellation,
      4,
      customShieldNode(prod(input.total.hp, dm.c4.hpShield_))
    ),
  },
} as const

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    charged_dmg_: afterBurst_charged_dmg_,
    charged_critRate_: c2EnemyHp_critRate_,
    pyro_dmg_: p1_pyro_dmg_,
  },
})

const sheet: TalentSheet = {
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
        // TODO: Would probably be better as a conditional,
        // but can't make conditional states based on constellation value
        ...dm.charged.dmgArr.map((_, i) => ({
          node: infoMut(dmgFormulas.charged[i], {
            name: ct.ch(`charged.${i}`),
          }),
        })),
        {
          text: ct.chg('auto.skillParams.4'),
          // TODO: Should change this value based on how many seals, but can't do without conditional
          // charged attack. And its a bit execssive.
          value: dm.charged.stamina,
        },
        {
          text: st('staminaDec_'),
          value: dm.charged.sealStaminaRed_ * 100,
          textSuffix: ct.ch('perSeal'),
          unit: '%',
        },
        {
          text: ct.ch('maxSeals'),
          value: (data: UIData) =>
            data.get(input.constellation).value >= 6
              ? dm.charged.maxSeals + dm.c6.extraSeals
              : dm.charged.maxSeals,
        },
        {
          text: ct.chg('auto.skillParams.6'),
          value: dm.sealDuration,
          unit: 's',
        },
      ],
    },
    ct.condTem('passive1', {
      value: condP1Seals,
      path: condP1SealsPath,
      name: ct.ch('passive1.sealsConsumed'),
      states: (data) =>
        Object.fromEntries(
          range(1, data.get(input.constellation).value >= 6 ? 4 : 3).map(
            (seals) => [
              seals,
              {
                name: ct.ch(`seals.${seals}`),
                fields: [
                  {
                    node: p1_pyro_dmg_,
                  },
                  {
                    text: stg('duration'),
                    value: dm.passive1.duration,
                    unit: 's',
                  },
                ],
              },
            ]
          )
        ),
    }),
    ct.headerTem('passive2', {
      fields: [
        {
          node: infoMut(dmgFormulas.passive2.dmg, {
            name: ct.ch('passive2.key'),
          }),
        },
        {
          node: infoMut(dmgFormulas.passive2.probabilistic_dmg, {
            name: ct.ch('passive2.key'),
            textSuffix: ct.ch('passive2.probabilisticSuffix'),
          }),
        },
      ],
    }),
    ct.headerTem('constellation6', {
      fields: [
        {
          text: ct.ch('c6.maxSealInc'),
          value: dm.c6.extraSeals,
        },
      ],
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
          node: infoMut(dmgFormulas.skill.dmg, {
            name: ct.chg(`skill.skillParams.0`),
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
          node: infoMut(dmgFormulas.burst.dmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          text: ct.ch('burst.grantMax'),
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
    ct.condTem('burst', {
      value: condAfterBurst,
      path: condAfterBurstPath,
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [
            {
              text: ct.chg('burst.skillParams.2'),
              value: dm.burst.sealInterval,
              unit: 's',
            },
            {
              node: afterBurst_charged_dmg_,
            },
          ],
        },
      },
    }),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      fields: [
        {
          text: ct.ch('c1.sealChargedStam_'),
          value: dm.c1.sealStaminaRed_ * -100,
          textSuffix: ct.ch('perSeal'),
          unit: '%',
        },
        {
          text: st('incInterRes'),
        },
      ],
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      value: condC2EnemyHp,
      path: condC2EnemyHpPath,
      name: st('enemyLessPercentHP', { percent: dm.c2.hpThresh * 100 }),
      states: {
        on: {
          fields: [
            {
              node: c2EnemyHp_critRate_,
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation4.norm_shield, {
            name: stg('dmgAbsorption'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation4.pyro_shield, {
            name: st(`dmgAbsorption.${elementKey}`),
          }),
        },
        {
          text: stg('duration'),
          value: dm.c4.duration,
          unit: 's',
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}

export default new CharacterSheet(sheet, data)
