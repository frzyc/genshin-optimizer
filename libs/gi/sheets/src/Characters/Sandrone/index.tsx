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
  min,
  naught,
  one,
  percent,
  prod,
  stellarDmg,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  hitEle,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Sandrone'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = 0,
  s = 0,
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
    sweepDmg: skillParam_gen.auto[a++],
    beamDmg: skillParam_gen.auto[a++],
    beamStellarDmg: skillParam_gen.auto[a++],
    overdriveDmg: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    prismDmg: skillParam_gen.skill[s++],
    prismStellarDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    bombardDmg: skillParam_gen.burst[b++], // x3
    rayDmg: skillParam_gen.burst[b++],
    rayStellarDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    prismAddlMult: skillParam_gen.passive1[0][0],
    rayAddlMult: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
    maxEleMas: skillParam_gen.passive2[1][0],
  },
  passive3: {
    base_stellarconduct_dmg_: skillParam_gen.passive3![0][0],
    maxBase_stellarconduct_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    stellarconduct_dmg_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    beam_critDMG_: skillParam_gen.constellation2[0],
    beamStack_critDMG_: skillParam_gen.constellation2[1],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    dmg2: skillParam_gen.constellation6[1],
    stellarconduct_specialDmg_: skillParam_gen.constellation6[2],
  },
} as const

const a0_stellarconduct_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellarconduct_dmg_), input.total.atk, 1 / 100),
  percent(dm.passive3.maxBase_stellarconduct_dmg_)
)
const [condA0StellarRadianceScPath, condA0StellarRadianceSc] = cond(
  key,
  'a0StellarRadianceSc'
)

const [condA1DecodingPath, condA1Decoding] = cond(key, 'a1Decoding')
const a1Decoding_prism_mult_ = sum(
  one,
  greaterEq(
    input.asc,
    1,
    equal(condA1Decoding, 'on', percent(dm.passive1.prismAddlMult))
  )
)

const [condA1TacticsPath, condA1Tactics] = cond(key, 'a1Tactics')
const a1TacticsArr = range(1, 10)
const a1Decoding_ray_mult_ = sum(
  one,
  greaterEq(
    input.asc,
    1,
    equal(
      condA1Decoding,
      'on',
      prod(
        percent(dm.passive1.rayAddlMult),
        lookup(
          condA1Tactics,
          objKeyMap(a1TacticsArr, (stack) => constant(stack)),
          naught
        )
      )
    )
  )
)

const a4EleMas = greaterEq(
  input.asc,
  4,
  min(prod(input.premod.atk, dm.passive2.eleMas), dm.passive2.maxEleMas)
)

const [condC1DecodingPath, condC1Decoding] = cond(key, 'c1Decoding')
const c1Decoding_stellarconduct_dmg_ = greaterEq(
  input.constellation,
  1,
  equal(condC1Decoding, 'on', percent(dm.constellation1.stellarconduct_dmg_))
)

const [condC2StacksPath, condC2Stacks] = cond(key, 'c2Stacks')
const c2StacksArr = range(1, 3)
const c2Stacks_beam_critDMG1_ = greaterEq(
  input.constellation,
  2,
  percent(dm.constellation2.beam_critDMG_)
)
const c2Stacks_beam_critDMG2_ = greaterEq(
  input.constellation,
  2,
  equal(
    condA0StellarRadianceSc,
    'on',
    lookup(
      condC2Stacks,
      objKeyMap(c2StacksArr, (stack) =>
        percent(dm.constellation2.beamStack_critDMG_ * stack)
      ),
      naught
    )
  )
)

const c6_stellarconduct_specialDmg_ = greaterEq(
  input.constellation,
  6,
  equal(
    condA0StellarRadianceSc,
    'on',
    percent(dm.constellation6.stellarconduct_specialDmg_)
  )
)

const beamAddl = {
  ...hitEle.cryo,
  premod: {
    critDMG_: sum(c2Stacks_beam_critDMG1_, c2Stacks_beam_critDMG2_),
  },
}

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    sweepDmg: dmgNode('atk', dm.charged.sweepDmg, 'charged', hitEle.cryo),
    beamDmg: dmgNode('atk', dm.charged.beamDmg, 'charged', beamAddl),
    beamStellarDmg: equal(
      condA0StellarRadianceSc,
      'on',
      stellarDmg(
        subscript(input.total.autoIndex, dm.charged.beamStellarDmg, {
          unit: '%',
        }),
        'atk',
        'stellarconduct',
        'cryo',
        beamAddl
      )
    ),
    overdriveDmg: dmgNode(
      'atk',
      dm.charged.overdriveDmg,
      'charged',
      hitEle.cryo
    ),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    prismDmg1: dmgNode('atk', dm.skill.prismDmg, 'skill'),
    prismDmg2: dmgNode(
      'atk',
      dm.skill.prismDmg,
      'skill',
      undefined,
      a1Decoding_prism_mult_
    ),
    prismStellarDmg: equal(
      condA0StellarRadianceSc,
      'on',
      stellarDmg(
        subscript(input.total.skillIndex, dm.skill.prismStellarDmg, {
          unit: '%',
        }),
        'atk',
        'stellarconduct',
        'cryo',
        undefined,
        a1Decoding_prism_mult_
      )
    ),
  },
  burst: {
    bombardDmg: dmgNode('atk', dm.burst.bombardDmg, 'burst'),
    rayDmg: dmgNode('atk', dm.burst.rayDmg, 'burst'),
    rayStellarDmg: equal(
      condA0StellarRadianceSc,
      'on',
      stellarDmg(
        subscript(input.total.burstIndex, dm.burst.rayStellarDmg, {
          unit: '%',
        }),
        'atk',
        'stellarconduct',
        'cryo',
        undefined,
        a1Decoding_ray_mult_
      )
    ),
  },
  passive3: {
    a0_stellarconduct_baseDmg_,
  },
  constellation4: {
    dmg: greaterEq(
      input.constellation,
      4,
      stellarDmg(
        percent(dm.constellation4.dmg),
        'atk',
        'stellarconduct',
        'cryo'
      )
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'elemental',
        hitEle.cryo
      )
    ),
    dmg2: greaterEq(
      input.constellation,
      6,
      stellarDmg(
        percent(dm.constellation6.dmg2),
        'atk',
        'stellarconduct',
        'cryo'
      )
    ),
  },
}
const autoC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    autoBoost: autoC3,
    burstBoost: burstC5,
    stellarconduct_specialDmg_: c6_stellarconduct_specialDmg_,
  },
  total: {
    eleMas: a4EleMas,
  },
  teamBuff: {
    premod: {
      stellarconduct_baseDmg_: a0_stellarconduct_baseDmg_,
      stellarconduct_dmg_: c1Decoding_stellarconduct_dmg_,
    },
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
        {
          node: infoMut(dmgFormulas.charged.sweepDmg, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.beamDmg, {
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.beamStellarDmg, {
            name: ct.chg(`auto.skillParams.5`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.overdriveDmg, {
            name: ct.chg(`auto.skillParams.6`),
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
          node: infoMut(dmgFormulas.skill.prismDmg1, {
            name: ct.chg('skill.skillParams.0'),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.prismDmg2, {
            name: ct.chg('skill.skillParams.0'),
            textSuffix: '(2)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.prismStellarDmg, {
            name: ct.chg('skill.skillParams.1'),
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
          node: infoMut(dmgFormulas.burst.bombardDmg, {
            name: ct.chg(`burst.skillParams.0`),
            multi: 3,
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.rayDmg, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.rayStellarDmg, {
            name: ct.chg(`burst.skillParams.2`),
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
    ct.condTem('passive1', {
      path: condA1DecodingPath,
      value: condA1Decoding,
      canShow: equal(condA0StellarRadianceSc, 'on', 1),
      name: ct.ch('a1DecodingCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(a1Decoding_prism_mult_, {
                name: ct.ch('prismMult_'),
                unit: '%',
                pivot: true,
              }),
            },
          ],
        },
      },
    }),
    ct.condTem('passive1', {
      path: condA1TacticsPath,
      value: condA1Tactics,
      canShow: equal(condA0StellarRadianceSc, 'on', 1),
      name: ct.ch('a1TacticsCond'),
      states: objKeyMap(a1TacticsArr, (stack) => ({
        name: `${stack}`,
        fields: [
          {
            node: infoMut(a1Decoding_ray_mult_, {
              name: ct.ch('rayMult_'),
              pivot: true,
              unit: '%',
            }),
          },
        ],
      })),
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.fieldsTem('passive2', {
      fields: [
        {
          node: a4EleMas,
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    ct.headerTem('passive3', {
      teamBuff: true,
      fields: [
        {
          node: a0_stellarconduct_baseDmg_,
        },
      ],
    }),
    ct.condTem('passive3', {
      path: condA0StellarRadianceScPath,
      value: condA0StellarRadianceSc,
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
      path: condC1DecodingPath,
      value: condC1Decoding,
      name: ct.ch('c1Cond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: c1Decoding_stellarconduct_dmg_,
            },
          ],
        },
      },
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: infoMut(c2Stacks_beam_critDMG1_, {
            name: ct.ch('beam_critDMG_'),
          }),
        },
      ],
    }),
    ct.condTem('constellation2', {
      path: condC2StacksPath,
      value: condC2Stacks,
      name: ct.ch('c2Cond'),
      canShow: equal(condA0StellarRadianceSc, 'on', 1),
      states: objKeyMap(c2StacksArr, (stack) => ({
        name: `${stack}`,
        fields: [
          {
            node: infoMut(c2Stacks_beam_critDMG2_, {
              name: ct.ch('beam_critDMG_'),
            }),
          },
        ],
      })),
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: autoC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.fieldsTem('constellation4', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation4.dmg, {
            name: ct.ch('c4StellarDmg'),
          }),
        },
        {
          text: stg('cd'),
          value: dm.constellation4.cd,
          unit: 's',
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.dmg, {
            name: ct.ch('c6Dmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation6.dmg2, {
            name: ct.ch('c6StellarDmg'),
          }),
        },
      ],
    }),
    ct.headerTem('constellation6', {
      teamBuff: true,
      fields: [
        {
          node: c6_stellarconduct_specialDmg_,
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
