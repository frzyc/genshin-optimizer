import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
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
  stellarDmg,
  subscript,
  sum,
  threshold,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Wriothesley'
const skillParam_gen = allStats.char.skillParam[key]

const [condLockRevelationPath, condLockRevelation] = cond(key, 'lockRevelation')
const lockRevelation = equal(condLockRevelation, 'on', 1)

const ct = charTemplates(key, lockRevelation)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3
      skillParam_gen.auto[(a += 2)], // 4x2
      skillParam_gen.auto[++a], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    fistDmg: skillParam_gen.skill[s++],
    hpCost: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    bladeDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    bladeCd: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hpThresh: skillParam_gen.passive1[0][0],
    dmg_: skillParam_gen.passive1[1][0],
    hpRestore: skillParam_gen.passive1[2][0],
    cd: skillParam_gen.passive1[3][0],
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
    maxStacks: skillParam_gen.passive2[1][0],
  },
  lockedPassive: {
    hpThresh: skillParam_gen.lockedPassive![0][0],
    heal: skillParam_gen.lockedPassive![1][0],
    cd: skillParam_gen.lockedPassive![2][0],
    stellarconduct_dmg_: skillParam_gen.lockedPassive![3][0],
    hit3AddlMult_: skillParam_gen.lockedPassive![4][0],
    hit5AddlMult_: skillParam_gen.lockedPassive![5][0],
  },
  constellation1: {
    cd: skillParam_gen.constellation1[0],
    dmg_: skillParam_gen.constellation1[1],
    durationInc: skillParam_gen.constellation1[2],
    hit5_stellarconduct_dmg_: skillParam_gen.constellation1[3],
    luster_dmg_: skillParam_gen.constellation1[4],
    duration: skillParam_gen.constellation1[5],
  },
  constellation2: {
    dmg_: skillParam_gen.constellation2[0],
    normal_mult_: skillParam_gen.constellation2[1],
    charged_mult_: skillParam_gen.constellation2[2],
    hit3AddlMult_: skillParam_gen.constellation2[3],
    hit5AddlMult_: skillParam_gen.constellation2[4],
    lusterAddlMult_: skillParam_gen.constellation2[5],
  },
  constellation4: {
    selfAtkSPD_: skillParam_gen.constellation4[0],
    selfDuration: skillParam_gen.constellation4[1],
    teamAtkSPD_: skillParam_gen.constellation4[2],
    teamDuration: skillParam_gen.constellation4[3],
    heal: skillParam_gen.constellation4[4],
    dmgRed_: skillParam_gen.constellation4[5],
    selfAtkSPD2_: skillParam_gen.constellation4[6],
    teamAtkSPD2_: skillParam_gen.constellation4[7],
  },
  constellation6: {
    skill_critRate_: skillParam_gen.constellation6[0],
    skill_critDMG_: skillParam_gen.constellation6[1],
    icicle_dmg_: skillParam_gen.constellation6[2],
    fist_critRate_: skillParam_gen.constellation6[3],
    fist_critDMG_: skillParam_gen.constellation6[4],
    stellarDmg: skillParam_gen.constellation6[5],
  },
} as const

const [condLockStellarRadianceScPath, condLockStellarRadianceSc] = cond(
  key,
  'lockStellarRadianceSc'
)

const a1Rebuke_dmg_ = greaterEq(input.asc, 1, dm.passive1.dmg_, { unit: '%' })
const a1Stellarconduct_dmg_ = greaterEq(
  input.asc,
  1,
  equal(
    condLockRevelation,
    'on',
    equal(condLockStellarRadianceSc, 'on', dm.lockedPassive.stellarconduct_dmg_)
  )
)

const [condA4EdictStacksPath, condA4EdictStacks] = cond(key, 'a4EdictStacks')
const a4EdictStacksArr = range(1, dm.passive2.maxStacks)
const a4EdictStacks = lookup(
  condA4EdictStacks,
  objKeyMap(a4EdictStacksArr, (stack) => constant(stack)),
  naught
)
const a4EdictStacks_atk_ = greaterEq(
  input.asc,
  4,
  prod(a4EdictStacks, percent(dm.passive2.atk_))
)

const c1Rebuke_dmg_ = greaterEq(input.constellation, 1, dm.constellation1.dmg_)
const rebuke_dmg_ = sum(a1Rebuke_dmg_, c1Rebuke_dmg_)

const [condC1LusterPath, condC1Luster] = cond(key, 'c1Luster')
const c1Luster_5hitStellarconduct_dmg_ = greaterEq(
  input.constellation,
  1,
  equal(
    condLockRevelation,
    'on',
    equal(
      condLockStellarRadianceSc,
      'on',
      equal(condC1Luster, 'on', dm.constellation1.hit5_stellarconduct_dmg_)
    )
  )
)
const [condC15HitPath, condC15Hit] = cond(key, 'c15Hit')
const c15Hit_lusterStellarconduct_dmg_ = greaterEq(
  input.constellation,
  1,
  equal(
    condLockRevelation,
    'on',
    equal(
      condLockStellarRadianceSc,
      'on',
      equal(condC15Hit, 'on', dm.constellation1.luster_dmg_)
    )
  )
)

const c2EdictStacks_burst_dmg_ = greaterEq(
  input.constellation,
  2,
  greaterEq(input.asc, 4, prod(a4EdictStacks, percent(dm.constellation2.dmg_)))
)
const c2EdictStacks_hit3AddlMult_ = greaterEq(
  input.constellation,
  2,
  equal(
    condLockRevelation,
    'on',
    equal(
      condLockStellarRadianceSc,
      'on',
      equal(
        condA4EdictStacks,
        '5',
        percent(
          dm.constellation2.hit3AddlMult_ - dm.lockedPassive.hit3AddlMult_
        )
      )
    )
  )
)
const c2EdictStacks_hit5AddlMult_ = greaterEq(
  input.constellation,
  2,
  equal(
    condLockRevelation,
    'on',
    equal(
      condLockStellarRadianceSc,
      'on',
      equal(
        condA4EdictStacks,
        '5',
        percent(
          dm.constellation2.hit5AddlMult_ - dm.lockedPassive.hit5AddlMult_
        )
      )
    )
  )
)
const c2EdictStacks_lusterAddlMult_ = greaterEq(
  input.constellation,
  2,
  equal(
    condLockRevelation,
    'on',
    equal(
      condLockStellarRadianceSc,
      'on',
      equal(condA4EdictStacks, '5', percent(dm.constellation2.lusterAddlMult_))
    )
  )
)
const c2EdictStacks_normalAddlMult_ = greaterEq(
  input.constellation,
  2,
  equal(
    condLockRevelation,
    'on',
    unequal(
      condLockStellarRadianceSc,
      'on',
      equal(condA4EdictStacks, '5', percent(dm.constellation2.normal_mult_))
    )
  )
)
const c2EdictStacks_chargedAddlMult_ = greaterEq(
  input.constellation,
  2,
  equal(
    condLockRevelation,
    'on',
    unequal(
      condLockStellarRadianceSc,
      'on',
      equal(condA4EdictStacks, '5', percent(dm.constellation2.charged_mult_))
    )
  )
)

const c6Rebuke_critRate_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.skill_critRate_
)
const c6Rebuke_critDMG_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.skill_critDMG_
)
const c6ChillingRepellingLuster_critRate_ = greaterEq(
  input.constellation,
  6,
  equal(
    condLockRevelation,
    'on',
    equal(condLockStellarRadianceSc, 'on', dm.constellation6.fist_critRate_)
  )
)
const c6ChillingRepellingLuster_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(
    condLockRevelation,
    'on',
    equal(condLockStellarRadianceSc, 'on', dm.constellation6.fist_critDMG_)
  )
)

const rebukeDmg = greaterEq(
  input.asc,
  1,
  dmgNode(
    'atk',
    dm.charged.dmg,
    'charged',
    {
      premod: {
        charged_critRate_: c6Rebuke_critRate_,
        charged_critDMG_: c6Rebuke_critDMG_,
        charged_dmg_: rebuke_dmg_,
      },
    },
    sum(one, c2EdictStacks_chargedAddlMult_)
  )
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode(
      'atk',
      dm.charged.dmg,
      'charged',
      undefined,
      sum(one, c2EdictStacks_chargedAddlMult_)
    ),
    rebukeDmg,
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [
        `enhanced_${i}`,
        dmgNode(
          'atk',
          arr,
          'normal',
          {
            premod: {
              critRate_: c6ChillingRepellingLuster_critRate_,
              critDMG_: c6ChillingRepellingLuster_critDMG_,
            },
          },
          prod(
            subscript(input.total.skillIndex, dm.skill.fistDmg, { unit: '%' }),
            sum(one, c2EdictStacks_normalAddlMult_)
          )
        ),
      ])
    ),
    hpCost: prod(percent(dm.skill.hpCost), input.total.hp),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    bladeDmg: dmgNode('atk', dm.burst.bladeDmg, 'burst', {
      hit: { reaction: constant('') },
    }),
  },
  passive1: {
    heal: healNode(
      'hp',
      threshold(
        input.constellation,
        4,
        dm.constellation4.heal + dm.passive1.hpRestore,
        dm.passive1.hpRestore
      ),
      0
    ),
    hit3: greaterEq(
      input.asc,
      1,
      equal(
        condLockRevelation,
        'on',
        equal(
          condLockStellarRadianceSc,
          'on',
          stellarDmg(
            subscript(input.total.autoIndex, dm.normal.hitArr[2], {
              unit: '%',
            }),
            'atk',
            'stellarconduct',
            'cryo',
            undefined,
            prod(
              subscript(input.total.skillIndex, dm.skill.fistDmg, {
                unit: '%',
              }),
              sum(
                one,
                percent(dm.lockedPassive.hit3AddlMult_),
                c2EdictStacks_hit3AddlMult_
              )
            )
          )
        )
      )
    ),
    hit5: greaterEq(
      input.asc,
      1,
      equal(
        condLockRevelation,
        'on',
        equal(
          condLockStellarRadianceSc,
          'on',
          stellarDmg(
            prod(
              subscript(input.total.autoIndex, dm.normal.hitArr[4], {
                unit: '%',
              }),
              subscript(input.total.skillIndex, dm.skill.fistDmg, { unit: '%' })
            ),
            'atk',
            'stellarconduct',
            'cryo',
            {
              premod: {
                stellarconduct_dmg_: c1Luster_5hitStellarconduct_dmg_,
                critRate_: c6ChillingRepellingLuster_critRate_,
                critDMG_: c6ChillingRepellingLuster_critDMG_,
              },
            },
            sum(
              one,
              percent(dm.lockedPassive.hit5AddlMult_),
              c2EdictStacks_hit5AddlMult_
            )
          )
        )
      )
    ),
    lusterDmg: greaterEq(
      input.asc,
      1,
      equal(
        condLockRevelation,
        'on',
        equal(
          condLockStellarRadianceSc,
          'on',
          stellarDmg(
            subscript(input.total.autoIndex, dm.charged.dmg, { unit: '%' }),
            'atk',
            'stellarconduct',
            'cryo',
            {
              premod: {
                stellarconduct_dmg_: c15Hit_lusterStellarconduct_dmg_,
                critRate_: c6ChillingRepellingLuster_critRate_,
                critDMG_: c6ChillingRepellingLuster_critDMG_,
              },
            },
            sum(one, c2EdictStacks_lusterAddlMult_)
          )
        )
      )
    ),
  },
  constellation6: {
    icicleDmg: greaterEq(input.constellation, 6, { ...rebukeDmg }),
    hit5: greaterEq(
      input.constellation,
      6,
      greaterEq(
        input.asc,
        1,
        equal(
          condLockRevelation,
          'on',
          equal(
            condLockStellarRadianceSc,
            'on',
            stellarDmg(
              prod(
                subscript(input.total.autoIndex, dm.normal.hitArr[4], {
                  unit: '%',
                }),
                subscript(input.total.skillIndex, dm.skill.fistDmg, {
                  unit: '%',
                })
              ),
              'atk',
              'stellarconduct',
              'cryo',
              {
                premod: {
                  stellarconduct_dmg_: c1Luster_5hitStellarconduct_dmg_,
                  critRate_: c6ChillingRepellingLuster_critRate_,
                  critDMG_: c6ChillingRepellingLuster_critDMG_,
                },
              },
              prod(
                sum(
                  one,
                  percent(dm.lockedPassive.hit5AddlMult_),
                  c2EdictStacks_hit5AddlMult_
                ),
                percent(dm.constellation6.stellarDmg)
              )
            )
          )
        )
      )
    ),
    lusterDmg: greaterEq(
      input.constellation,
      6,
      greaterEq(
        input.asc,
        1,
        equal(
          condLockRevelation,
          'on',
          equal(
            condLockStellarRadianceSc,
            'on',
            stellarDmg(
              subscript(input.total.autoIndex, dm.charged.dmg, { unit: '%' }),
              'atk',
              'stellarconduct',
              'cryo',
              {
                premod: {
                  stellarconduct_dmg_: c15Hit_lusterStellarconduct_dmg_,
                  critRate_: c6ChillingRepellingLuster_critRate_,
                  critDMG_: c6ChillingRepellingLuster_critDMG_,
                },
              },
              prod(
                sum(one, c2EdictStacks_lusterAddlMult_),
                percent(dm.constellation6.stellarDmg)
              )
            )
          )
        )
      )
    ),
  },
}
const autoC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    autoBoost: autoC3,
    atk_: a4EdictStacks_atk_,
    burst_dmg_: c2EdictStacks_burst_dmg_,
    stellarconduct_dmg_: a1Stellarconduct_dmg_,
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
          multi: i === 3 ? 2 : undefined,
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
            name: ct.chg(`auto.skillParams.5`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.6'),
          value: dm.charged.stam,
        },
      ],
    },
    ct.headerTem('passive1', {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.rebukeDmg, {
            name: ct.ch('rebukeDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.passive1.lusterDmg, {
            name: ct.ch('lusterDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.passive1.heal, { name: stg('healing') }),
        },
      ],
    }),
    ct.headerTem('constellation1', {
      fields: [
        {
          node: infoMut(c1Rebuke_dmg_, {
            name: ct.ch('rebuke_dmg_'),
            unit: '%',
          }),
        },
      ],
    }),
    ct.headerTem('constellation6', {
      canShow: equal(
        condLockRevelation,
        'on',
        equal(condLockStellarRadianceSc, 'on', 1)
      ),
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.lusterDmg, {
            name: ct.ch('icicleDmg'),
          }),
        },
      ],
    }),
    ct.headerTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.icicleDmg, {
            name: ct.ch('icicleDmg'),
          }),
        },
        {
          node: infoMut(c6Rebuke_critRate_, {
            name: ct.ch('rebuke_critRate_'),
            unit: '%',
          }),
        },
        {
          node: infoMut(c6Rebuke_critDMG_, {
            name: ct.ch('rebuke_critDMG_'),
            unit: '%',
          }),
        },
        {
          node: infoMut(c6ChillingRepellingLuster_critRate_, {
            name: ct.ch('chillingRepellingLuster_critRate_'),
            unit: '%',
          }),
        },
        {
          node: infoMut(c6ChillingRepellingLuster_critDMG_, {
            name: ct.ch('chillingRepellingLuster_critDMG_'),
            unit: '%',
          }),
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
          node: infoMut(dmgFormulas.skill.hpCost, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        ...dm.normal.hitArr.map((_, i) => ({
          node: infoMut(
            dmgFormulas.skill[
              `enhanced_${i}` as keyof typeof dmgFormulas.skill
            ],
            {
              name: ct.chg(`auto.skillParams.${i}`),
              multi: i === 3 ? 2 : undefined,
            }
          ),
        })),
        {
          text: stg('duration'),
          value: dm.skill.duration,
          unit: 's',
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.headerTem('passive1', {
      canShow: equal(
        condLockRevelation,
        'on',
        equal(condLockStellarRadianceSc, 'on', 1)
      ),
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.hit3, {
            name: ct.chg('auto.skillParams.2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.passive1.hit5, {
            name: ct.chg('auto.skillParams.4'),
          }),
        },
      ],
    }),
    ct.headerTem('constellation6', {
      canShow: equal(
        condLockRevelation,
        'on',
        equal(condLockStellarRadianceSc, 'on', 1)
      ),
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.hit5, {
            name: ct.ch('icicleDmg'),
          }),
        },
        {
          node: infoMut(c6ChillingRepellingLuster_critRate_, {
            name: ct.ch('chillingRepellingLuster_critRate_'),
            unit: '%',
          }),
        },
        {
          node: infoMut(c6ChillingRepellingLuster_critDMG_, {
            name: ct.ch('chillingRepellingLuster_critDMG_'),
            unit: '%',
          }),
        },
      ],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg('burst.skillParams.0'),
            multi: 5,
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.bladeDmg, {
            name: ct.chg('burst.skillParams.1'),
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
          value: dm.burst.cd,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.3'),
          value: dm.burst.bladeCd,
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
    ct.fieldsTem('passive1', {
      fields: [
        {
          node: a1Stellarconduct_dmg_,
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      value: condA4EdictStacks,
      path: condA4EdictStacksPath,
      name: ct.ch('a4Cond'),
      states: objKeyMap(a4EdictStacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: a4EdictStacks_atk_,
          },
        ],
      })),
    }),
    ct.headerTem('constellation2', {
      canShow: unequal(condA4EdictStacks, undefined, 1),
      fields: [
        {
          node: c2EdictStacks_burst_dmg_,
        },
        {
          node: infoMut(c2EdictStacks_hit3AddlMult_, {
            name: ct.ch('hit3AddlMult'),
          }),
        },
        {
          node: infoMut(c2EdictStacks_hit5AddlMult_, {
            name: ct.ch('hit5AddlMult'),
          }),
        },
        {
          node: infoMut(c2EdictStacks_lusterAddlMult_, {
            name: ct.ch('lusterAddlMult'),
          }),
        },
        {
          node: infoMut(c2EdictStacks_normalAddlMult_, {
            name: ct.ch('normalAddlMult'),
          }),
        },
        {
          node: infoMut(c2EdictStacks_chargedAddlMult_, {
            name: ct.ch('chargedAddlMult'),
          }),
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  lockedPassive: ct.talentTem('lockedPassive', [
    ct.condTem('lockedPassive', {
      path: condLockRevelationPath,
      value: condLockRevelation,
      name: st('revelation.done'),
      states: {
        on: {
          fields: [
            {
              text: st('hexerei.talentEnhance'),
            },
          ],
        },
      },
    }),
    ct.condTem('lockedPassive', {
      path: condLockStellarRadianceScPath,
      value: condLockStellarRadianceSc,
      canShow: lockRevelation,
      name: st('elementalReaction.polestar.inside'),
      states: {
        on: {
          fields: [
            {
              text: st('elementalReaction.gainRadianceSc'),
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1LusterPath,
      value: condC1Luster,
      canShow: equal(
        condLockRevelation,
        'on',
        equal(condLockStellarRadianceSc, 'on', 1)
      ),
      name: ct.ch('c1LusterCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c1Luster_5hitStellarconduct_dmg_, {
                name: ct.ch('5Hit_stellarconduct_dmg_'),
                variant: 'stellarconduct',
                unit: '%',
              }),
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
    ct.condTem('constellation1', {
      path: condC15HitPath,
      value: condC15Hit,
      canShow: equal(
        condLockRevelation,
        'on',
        equal(condLockStellarRadianceSc, 'on', 1)
      ),
      name: ct.ch('c15HitCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c15Hit_lusterStellarconduct_dmg_, {
                name: ct.ch('luster_stellarconduct_dmg_'),
                variant: 'stellarconduct',
                unit: '%',
              }),
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
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: autoC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
