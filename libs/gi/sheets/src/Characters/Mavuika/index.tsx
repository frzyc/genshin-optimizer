import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lessThan,
  lookup,
  naught,
  percent,
  prod,
  subscript,
  sum,
  target,
  threshold,
  unequal,
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

const key: CharacterKey = 'Mavuika'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2x2
      skillParam_gen.auto[a++], // 3x3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    finalDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    radianceDmg: skillParam_gen.skill[s++],
    radianceInterval: skillParam_gen.skill[s++][0],
    normalHitArr: [
      skillParam_gen.skill[s++], // 1
      skillParam_gen.skill[s++], // 2
      skillParam_gen.skill[s++], // 3
      skillParam_gen.skill[s++], // 4
      skillParam_gen.skill[s++], // 5
    ],
    sprintDmg: skillParam_gen.skill[s++],
    chargedCyclicDmg: skillParam_gen.skill[s++],
    chargedFinalDmg: skillParam_gen.skill[s++],
    plungeDmg: skillParam_gen.skill[s++],
    nsPointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    sunfell_dmgInc: skillParam_gen.burst[b++],
    flameNormal_dmgInc: skillParam_gen.burst[b++],
    flameCharged_dmgInc: skillParam_gen.burst[b++],
    nsToSpiritRatio: skillParam_gen.burst[b++][0],
    naToSpiritRatio: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    spiritLimit: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atk_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    // TODO: Surely this will be fixed
    dmg_: skillParam_gen.passive2[0][0] * 20,
    duration: skillParam_gen.passive2[1][0],
    maxSpirit: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    extraNs: skillParam_gen.constellation1[0],
    extraSpiritGain_: skillParam_gen.constellation1[1],
    atk_: skillParam_gen.constellation1[2],
    duration: skillParam_gen.constellation1[3],
  },
  constellation2: {
    base_atk: skillParam_gen.constellation2[0],
    enemyDefRed_: skillParam_gen.constellation2[1],
    normal_dmgInc: skillParam_gen.constellation2[2],
    charged_dmgInc: skillParam_gen.constellation2[3],
    burst_dmgInc: skillParam_gen.constellation2[4],
  },
  constellation4: {
    all_dmg_: skillParam_gen.constellation4[0],
  },
  constellation6: {
    flamestriderDmg: skillParam_gen.constellation6[0],
    ringDmg: skillParam_gen.constellation6[1],
    ringInterval: skillParam_gen.constellation6[2],
    nsGain: skillParam_gen.constellation6[3],
    cd: skillParam_gen.constellation6[4],
  },
} as const

const [condBurstSpiritPath, condBurstSpirit] = cond(key, 'burstSpirit')
const burstSpiritArr = range(100, dm.burst.spiritLimit, 10)
const burstSpirit = lookup(
  condBurstSpirit,
  objKeyMap(burstSpiritArr, (spirit) => constant(spirit)),
  naught
)
const sunfell_dmgInc = infoMut(
  prod(
    input.total.atk,
    subscript(input.total.burstIndex, dm.burst.sunfell_dmgInc, { unit: '%' }),
    burstSpirit
  ),
  { path: 'burst_dmgInc' }
)
const flameNormal_dmgInc = infoMut(
  prod(
    input.total.atk,
    subscript(input.total.burstIndex, dm.burst.flameNormal_dmgInc, {
      unit: '%',
    }),
    burstSpirit
  ),
  { name: ct.ch('flameNormal_dmgInc') }
)
const flameCharged_dmgInc = infoMut(
  prod(
    input.total.atk,
    subscript(input.total.burstIndex, dm.burst.flameCharged_dmgInc, {
      unit: '%',
    }),
    burstSpirit
  ),
  { name: ct.ch('flameCharged_dmgInc') }
)

const [condA1NsBurstPath, condA1NsBurst] = cond(key, 'a1NsBurst')
const a1NsBurst_atk_ = greaterEq(
  input.asc,
  1,
  equal(condA1NsBurst, 'on', dm.passive1.atk_),
  { path: 'atk_' }
)

const [condA4TimeSinceBurstPath, condA4TimeSinceBurst] = cond(
  key,
  'a4TimeSinceBurst'
)
const a4TimeSinceBurstArr = range(0, dm.passive2.duration - 1)
const a4TimeSinceBurst = lookup(
  condA4TimeSinceBurst,
  objKeyMap(a4TimeSinceBurstArr, (time) => constant(time)),
  naught
)
const a4TimeSinceBurst_dmg_disp = greaterEq(
  input.asc,
  4,
  unequal(
    condA4TimeSinceBurst,
    undefined,
    prod(
      percent(dm.passive2.dmg_),
      burstSpirit,
      1 / dm.passive2.duration,
      sum(
        dm.passive2.duration,
        prod(-1, threshold(input.constellation, 4, 0, a4TimeSinceBurst))
      )
    )
  ),
  { path: 'all_dmg_', isTeamBuff: true }
)
const a4TimeSinceBurst_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  a4TimeSinceBurst_dmg_disp
)

const [condC1GainSpiritPath, condC1GainSpirit] = cond(key, 'c1GainSpirit')
const c1GainSpirit_atk_ = greaterEq(
  input.constellation,
  1,
  equal(condC1GainSpirit, 'on', dm.constellation1.atk_),
  { path: 'atk_' }
)

const [condC2RingFormPath, condC2RingForm] = cond(key, 'c2RingForm')
const [condC2FlameFormPath, condC2FlameForm] = cond(key, 'c2FlameForm')
const c2AnyForm_base_atk = greaterEq(
  input.constellation,
  2,
  greaterEq(
    sum(equal(condC2RingForm, 'on', 1), equal(condC2FlameForm, 'on', 1)),
    1,
    dm.constellation2.base_atk
  )
)
const c2RingForm_enemyDefRed_ = greaterEq(
  input.constellation,
  2,
  equal(condC2RingForm, 'on', dm.constellation2.enemyDefRed_)
)
const antiC2RingForm_enemyDefRed_ = lessThan(
  input.constellation,
  6,
  prod(-1, c2RingForm_enemyDefRed_)
)

const c2FlameForm_normal_dmgInc = greaterEq(
  input.constellation,
  2,
  equal(
    condC2FlameForm,
    'on',
    prod(input.total.atk, percent(dm.constellation2.normal_dmgInc))
  )
)
const c2FlameForm_charged_dmgInc = greaterEq(
  input.constellation,
  2,
  equal(
    condC2FlameForm,
    'on',
    prod(input.total.atk, percent(dm.constellation2.charged_dmgInc))
  )
)
const c2FlameForm_burst_dmgInc = greaterEq(
  input.constellation,
  2,
  equal(
    condC2FlameForm,
    'on',
    prod(input.total.atk, percent(dm.constellation2.burst_dmgInc))
  ),
  { path: 'burst_dmgInc' }
)

const c4AfterBurst_dmg_disp = greaterEq(
  input.constellation,
  4,
  greaterEq(
    input.asc,
    4,
    unequal(condA4TimeSinceBurst, undefined, dm.constellation4.all_dmg_)
  ),
  { path: 'all_dmg_', isTeamBuff: true }
)
const c4AfterBurst_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  c4AfterBurst_dmg_disp
)

const flameNormalAddl = {
  ...hitEle.pyro,
  premod: {
    normal_dmgInc: sum(flameNormal_dmgInc, c2FlameForm_normal_dmgInc),
    enemyDefRed_: antiC2RingForm_enemyDefRed_,
  },
}
const flameChargedAddl = {
  ...hitEle.pyro,
  premod: {
    charged_dmgInc: sum(flameCharged_dmgInc, c2FlameForm_charged_dmgInc),
    enemyDefRed_: antiC2RingForm_enemyDefRed_,
  },
}
const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    finalDmg: dmgNode('atk', dm.charged.finalDmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    radianceDmg: dmgNode('atk', dm.skill.radianceDmg, 'skill'),
    normal1Dmg: dmgNode(
      'atk',
      dm.skill.normalHitArr[0],
      'normal',
      flameNormalAddl,
      undefined,
      'skill'
    ),
    normal2Dmg: dmgNode(
      'atk',
      dm.skill.normalHitArr[1],
      'normal',
      flameNormalAddl,
      undefined,
      'skill'
    ),
    normal3Dmg: dmgNode(
      'atk',
      dm.skill.normalHitArr[2],
      'normal',
      flameNormalAddl,
      undefined,
      'skill'
    ),
    normal4Dmg: dmgNode(
      'atk',
      dm.skill.normalHitArr[3],
      'normal',
      flameNormalAddl,
      undefined,
      'skill'
    ),
    normal5Dmg: dmgNode(
      'atk',
      dm.skill.normalHitArr[4],
      'normal',
      flameNormalAddl,
      undefined,
      'skill'
    ),
    // TODO: Check what damage type this is
    sprintDmg: dmgNode('atk', dm.skill.sprintDmg, 'skill', {
      premod: { enemyDefRed_: antiC2RingForm_enemyDefRed_ },
    }),
    chargedCyclicDmg: dmgNode(
      'atk',
      dm.skill.chargedCyclicDmg,
      'charged',
      flameChargedAddl,
      undefined,
      'skill'
    ),
    chargedFinalDmg: dmgNode(
      'atk',
      dm.skill.chargedFinalDmg,
      'charged',
      flameChargedAddl,
      undefined,
      'skill'
    ),
    plungeDmg: dmgNode(
      'atk',
      dm.skill.plungeDmg,
      'plunging_impact',
      {
        premod: { enemyDefRed_: antiC2RingForm_enemyDefRed_ },
        ...hitEle.pyro,
      },
      undefined,
      'skill'
    ),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst', {
      premod: { enemyDefRed_: antiC2RingForm_enemyDefRed_ },
    }),
    sunfell_dmgInc,
    flameNormal_dmgInc,
    flameCharged_dmgInc,
  },
  constellation2: {
    c2FlameForm_normal_dmgInc,
    c2FlameForm_charged_dmgInc,
    c2FlameForm_burst_dmgInc,
  },
  constellation6: {
    flamestriderDmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(input.total.atk, percent(dm.constellation6.flamestriderDmg)),
        'skill'
      )
    ),
    ringDmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(input.total.atk, percent(dm.constellation6.ringDmg)),
        'skill'
      )
    ),
  },
}
const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC3,
    skillBoost: skillC5,
    burst_dmgInc: sum(sunfell_dmgInc, c2FlameForm_burst_dmgInc),
    atk_: sum(a1NsBurst_atk_, c1GainSpirit_atk_),
  },
  base: {
    atk: c2AnyForm_base_atk,
  },
  teamBuff: {
    premod: {
      all_dmg_: sum(a4TimeSinceBurst_dmg_, c4AfterBurst_dmg_),
      enemyDefRed_: c2RingForm_enemyDefRed_,
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
          multi: i === 1 ? 2 : i === 2 ? 3 : undefined,
        }),
      })),
    },
    {
      text: ct.chg('auto.fields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.finalDmg, {
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
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.skillDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.radianceDmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.radianceInterval,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.normal1Dmg, {
            name: ct.chg(`skill.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.normal2Dmg, {
            name: ct.chg(`skill.skillParams.4`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.normal3Dmg, {
            name: ct.chg(`skill.skillParams.5`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.normal4Dmg, {
            name: ct.chg(`skill.skillParams.6`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.normal5Dmg, {
            name: ct.chg(`skill.skillParams.7`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.sprintDmg, {
            name: ct.chg(`skill.skillParams.8`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.chargedCyclicDmg, {
            name: ct.chg(`skill.skillParams.9`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.chargedFinalDmg, {
            name: ct.chg(`skill.skillParams.10`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.plungeDmg, {
            name: ct.chg(`skill.skillParams.11`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.12'),
          value: (data: UIData) =>
            data.get(input.constellation).value >= 1
              ? `${dm.skill.nsPointLimit} + ${dm.constellation1.extraNs} = ${
                  dm.skill.nsPointLimit + dm.constellation1.extraNs
                }`
              : dm.skill.nsPointLimit,
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
          node: infoMut(dmgFormulas.burst.skillDmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          text: ct.chg('burst.skillParams.1'),
          value: dm.burst.duration,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.5'),
          value: dm.burst.naToSpiritRatio,
        },
        {
          text: stg('cd'),
          value: dm.burst.cd,
          unit: 's',
        },
        // {
        //   text: ct.chg('burst.skillParams.7'),
        //   value: dm.burst.spiritLimit,
        // },
      ],
    },
    ct.condTem('burst', {
      path: condBurstSpiritPath,
      value: condBurstSpirit,
      name: ct.ch('burstCond'),
      states: objKeyMap(burstSpiritArr, (spirit) => ({
        name: st('stack', { count: spirit }),
        fields: [
          {
            node: sunfell_dmgInc,
          },
          {
            node: flameNormal_dmgInc,
          },
          {
            node: flameCharged_dmgInc,
          },
        ],
      })),
    }),
    ct.condTem('passive2', {
      path: condA4TimeSinceBurstPath,
      value: condA4TimeSinceBurst,
      teamBuff: true,
      name: ct.ch('a4Cond'),
      states: objKeyMap(a4TimeSinceBurstArr, (time) => ({
        name: st('seconds', { count: time }),
        fields: [
          {
            node: a4TimeSinceBurst_dmg_disp,
          },
        ],
      })),
    }),
    ct.headerTem('constellation4', {
      fields: [
        {
          node: c4AfterBurst_dmg_disp,
        },
      ],
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1NsBurstPath,
      value: condA1NsBurst,
      name: st('nightsoul.partyBurst'),
      states: {
        on: {
          fields: [
            {
              node: a1NsBurst_atk_,
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
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1GainSpiritPath,
      value: condC1GainSpirit,
      name: ct.ch('c1Cond'),
      states: {
        on: {
          fields: [
            {
              node: c1GainSpirit_atk_,
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
    {
      fields: [
        {
          node: c2AnyForm_base_atk,
        },
      ],
    },
    ct.condTem('constellation2', {
      path: condC2FlameFormPath,
      value: condC2FlameForm,
      teamBuff: true,
      name: ct.ch('c2FlameCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c2FlameForm_normal_dmgInc, {
                name: ct.ch('flameNormal_dmgInc'),
              }),
            },
            {
              node: infoMut(c2FlameForm_charged_dmgInc, {
                name: ct.ch('flameCharged_dmgInc'),
              }),
            },
            {
              node: c2FlameForm_burst_dmgInc,
            },
          ],
        },
      },
    }),
    ct.condTem('constellation2', {
      path: condC2RingFormPath,
      value: condC2RingForm,
      teamBuff: true,
      name: ct.ch('c2RingCond'),
      states: {
        on: {
          fields: [
            {
              canShow: (data) => data.get(input.constellation).value < 6,
              text: ct.ch('c2Exception'),
            },
            {
              node: c2RingForm_enemyDefRed_,
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.flamestriderDmg, {
            name: ct.ch('flamestriderDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation6.ringDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.constellation6.ringInterval,
          unit: 's',
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
