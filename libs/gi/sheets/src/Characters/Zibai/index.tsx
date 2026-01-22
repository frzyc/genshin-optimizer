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
  lunarDmg,
  min,
  naught,
  one,
  percent,
  prod,
  subscript,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  hitEle,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Zibai'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = -1,
  s = -1,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[(a += 2)], // 3x2
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[(a += 2)], // x2
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    stride1Dmg: skillParam_gen.skill[++s],
    stride2Dmg: skillParam_gen.skill[++s],
    shift4GleamDmg: skillParam_gen.skill[++s],
    duration: skillParam_gen.skill[++s][0],
    cd: skillParam_gen.skill[++s][0],
    shift1Dmg: skillParam_gen.skill[++s],
    shift2Dmg: skillParam_gen.skill[++s],
    shift3Dmg: skillParam_gen.skill[(s += 2)], // x2
    shift4Dmg: skillParam_gen.skill[++s],
    shiftCaDmg: skillParam_gen.skill[(s += 2)], // x2
  },
  burst: {
    skill1Dmg: skillParam_gen.burst[b++],
    skill2Dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stride_dmgInc: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    geo_def_: skillParam_gen.passive2[0][0],
    hydro_eleMas: skillParam_gen.passive2[1][0],
  },
  passive3: {
    base_lunarcrystallize_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunarcrystallize_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    stride_lunarcrystallize_dmg_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    lunarcrystallize_dmg_: skillParam_gen.constellation2[0],
    stride_dmgInc: skillParam_gen.constellation2[1],
  },
  constellation4: {
    shift4_mult_: skillParam_gen.constellation4[0],
  },
  constellation6: {
    stride_lunarcrystallize_dmg_: skillParam_gen.constellation6[0],
    duration: 3,
  },
} as const

const a0_lunarcrystallize_baseDmg_ = min(
  prod(
    percent(dm.passive3.base_lunarcrystallize_dmg_),
    input.total.def,
    1 / 100
  ),
  percent(dm.passive3.maxBase_lunarcrystallize_dmg_)
)

const [condA1MoonfallPath, condA1Moonfall] = cond(key, 'a1Moonfall')
const a1Moonfall_stride_dmgInc = infoMut(
  greaterEq(
    input.asc,
    1,
    equal(
      condA1Moonfall,
      'on',
      prod(percent(dm.passive1.stride_dmgInc), input.total.def)
    )
  ),
  { name: ct.ch('stride_dmgInc') }
)

const a4Geo_def_ = greaterEq(
  input.asc,
  4,
  prod(sum(tally.geo, -1), percent(dm.passive2.geo_def_)),
  {
    path: 'def_',
  }
)
const a4Hydro_eleMas = greaterEq(
  input.asc,
  4,
  prod(tally.hydro, dm.passive2.hydro_eleMas)
)

const [condC1FirstStridePath, condC1FirstStride] = cond(key, 'c1FirstStride')
const c1FirstStride_stride_lunarcrystallize_dmg_ = infoMut(
  greaterEq(
    input.constellation,
    1,
    equal(
      condC1FirstStride,
      'on',
      dm.constellation1.stride_lunarcrystallize_dmg_
    )
  ),
  {
    name: ct.ch('stride_lunarcrystallize_dmg_'),
    variant: 'lunarcrystallize',
    unit: '%',
  }
)

const [condC2ShiftModePath, condC2ShiftMode] = cond(key, 'c2ShiftMode')
const c2ShiftMode_lunarcrystallize_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(condC2ShiftMode, 'on', dm.constellation2.lunarcrystallize_dmg_),
  { path: 'lunarcrystallize_dmg_' }
)

const c2Moonfall_stride_dmgInc = infoMut(
  greaterEq(
    input.constellation,
    2,
    greaterEq(
      input.asc,
      1,
      greaterEq(
        tally.moonsign,
        2,
        equal(
          condA1Moonfall,
          'on',
          prod(
            percent(
              dm.constellation2.stride_dmgInc - dm.passive1.stride_dmgInc
            ),
            input.total.def
          )
        )
      )
    )
  ),
  { name: ct.ch('stride_dmgInc') }
)

const [condC4SplendorPath, condC4Splendor] = cond(key, 'c4Splendor')
const c4Splendor_shift_mult_ = infoMut(
  sum(
    one,
    greaterEq(
      input.constellation,
      4,
      equal(condC4Splendor, 'on', percent(dm.constellation4.shift4_mult_ - 1))
    )
  ),
  {
    name: ct.ch('shift_lunarcrystallize_mult_'),
    variant: 'lunarcrystallize',
    unit: '%',
    pivot: true,
  }
)

const [condC6PointPath, condC6Point] = cond(key, 'c6Point')
const c6PointArr = range(1, 30)
const c6Point_lunar_specialDmg_ = greaterEq(
  input.constellation,
  6,
  prod(
    percent(dm.constellation6.stride_lunarcrystallize_dmg_),
    lookup(
      condC6Point,
      objKeyMap(c6PointArr, (point) => constant(point)),
      naught
    )
  )
)

const strideAddl = {
  premod: {
    geo_dmgInc: c2Moonfall_stride_dmgInc,
    lunarcrystallize_dmgInc: a1Moonfall_stride_dmgInc,
    lunarcrystallize_dmg_: c1FirstStride_stride_lunarcrystallize_dmg_,
  },
}

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    shift1Dmg: dmgNode(
      'def',
      dm.skill.shift1Dmg,
      'normal',
      hitEle.geo,
      undefined,
      'skill'
    ),
    shift2Dmg: dmgNode(
      'def',
      dm.skill.shift2Dmg,
      'normal',
      hitEle.geo,
      undefined,
      'skill'
    ),
    shift3Dmg: dmgNode(
      'def',
      dm.skill.shift3Dmg,
      'normal',
      hitEle.geo,
      undefined,
      'skill'
    ),
    shift4Dmg: dmgNode(
      'def',
      dm.skill.shift4Dmg,
      'normal',
      hitEle.geo,
      undefined,
      'skill'
    ),
    shiftCaDmg: dmgNode(
      'def',
      dm.skill.shiftCaDmg,
      'charged',
      hitEle.geo,
      undefined,
      'skill'
    ),
    stride1Dmg: dmgNode('def', dm.skill.stride1Dmg, 'skill', strideAddl),
    stride2Dmg: lunarDmg(
      subscript(input.total.skillIndex, dm.skill.stride2Dmg, { unit: '%' }),
      'def',
      'lunarcrystallize',
      strideAddl
    ),
    shift4GleamDmg: greaterEq(
      tally.moonsign,
      2,
      lunarDmg(
        subscript(input.total.skillIndex, dm.skill.shift4GleamDmg, {
          unit: '%',
        }),
        'def',
        'lunarcrystallize',
        undefined,
        c4Splendor_shift_mult_
      )
    ),
  },
  burst: {
    skill1Dmg: dmgNode('def', dm.burst.skill1Dmg, 'burst'),
    skill2Dmg: lunarDmg(
      subscript(input.total.burstIndex, dm.burst.skill2Dmg, { unit: '%' }),
      'def',
      'lunarcrystallize'
    ),
  },
  passive1: {
    a1Moonfall_stride_dmgInc,
  },
  passive3: {
    a0_lunarcrystallize_baseDmg_,
  },
  constellation2: {
    c2Moonfall_stride_dmgInc,
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    def_: a4Geo_def_,
    eleMas: a4Hydro_eleMas,
    lunarcrystallize_specialDmg_: c6Point_lunar_specialDmg_,
  },
  teamBuff: {
    premod: {
      lunarcrystallize_dmg_: c2ShiftMode_lunarcrystallize_dmg_,
      lunarcrystallize_baseDmg_: a0_lunarcrystallize_baseDmg_,
    },
  },
  isMoonsign: constant(1),
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
          multi: i === 2 ? 2 : undefined,
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
            multi: 2,
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
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.shift1Dmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shift2Dmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shift3Dmg, {
            name: ct.chg(`skill.skillParams.2`),
            multi: 2,
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shift4Dmg, {
            name: ct.chg(`skill.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shift4GleamDmg, {
            name: ct.chg(`skill.skillParams.7`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shiftCaDmg, {
            name: ct.chg(`skill.skillParams.4`),
            multi: 2,
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.stride1Dmg, {
            name: ct.chg(`skill.skillParams.5`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.stride2Dmg, {
            name: ct.chg(`skill.skillParams.6`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.8'),
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
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.skill1Dmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.skill2Dmg, {
            name: ct.chg(`burst.skillParams.1`),
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
      path: condA1MoonfallPath,
      value: condA1Moonfall,
      name: ct.ch('a1Cond'),
      states: {
        on: {
          fields: [
            {
              node: a1Moonfall_stride_dmgInc,
            },
            {
              text: stg('duration'),
              value: dm.passive1.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation2', {
      fields: [
        {
          node: c2Moonfall_stride_dmgInc,
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    {
      fields: [
        {
          node: a4Geo_def_,
        },
        {
          node: a4Hydro_eleMas,
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3', [
    ct.headerTem('passive3', {
      teamBuff: true,
      fields: [
        {
          node: a0_lunarcrystallize_baseDmg_,
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1FirstStridePath,
      value: condC1FirstStride,
      name: ct.ch('c1Cond'),
      states: {
        on: {
          fields: [
            {
              node: c1FirstStride_stride_lunarcrystallize_dmg_,
            },
          ],
        },
      },
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2ShiftModePath,
      value: condC2ShiftMode,
      name: ct.ch('c2Cond'),
      canShow: greaterEq(tally.moonsign, 2, 1),
      states: {
        on: {
          fields: [
            {
              node: c2ShiftMode_lunarcrystallize_dmg_,
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
    ct.condTem('constellation4', {
      path: condC4SplendorPath,
      value: condC4Splendor,
      name: ct.ch('c4Cond'),
      canShow: greaterEq(tally.moonsign, 2, 1),
      states: {
        on: {
          fields: [
            {
              node: c4Splendor_shift_mult_,
            },
          ],
        },
      },
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      path: condC6PointPath,
      value: condC6Point,
      name: ct.ch('c6Cond'),
      states: objKeyMap(c6PointArr, (point) => ({
        name: `${point}`,
        fields: [
          {
            node: c6Point_lunar_specialDmg_,
          },
          {
            text: stg('duration'),
            value: dm.constellation6.duration,
            unit: 's',
          },
        ],
      })),
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
