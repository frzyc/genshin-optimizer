import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/common/util'
import {
  allStellarReactionKeys,
  type CharacterKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  max,
  min,
  naught,
  percent,
  prod,
  stellarDmgNode,
  subscript,
  sum,
  target,
  threshold,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { any, cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
  stellarTalentDmgNode,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Odette'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    codaDotDmg: skillParam_gen.skill[s++],
    codaStellarconductDmg: skillParam_gen.skill[s++],
    codaStellarswirlDmg: skillParam_gen.skill[s++],
    plumeDmg: skillParam_gen.skill[s++],
    plumeStellarconductDmg: skillParam_gen.skill[s++],
    plumeStellarswirlDmg: skillParam_gen.skill[s++],
    wingDmg: skillParam_gen.skill[s++],
    wingStellarconductDmg: skillParam_gen.skill[s++],
    wingStellarswirlDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    codaCd: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    slashDmg: skillParam_gen.burst[b++], // x3
    finalDmg: skillParam_gen.burst[b++],
    stellar_dmg_: skillParam_gen.burst[b++],
    snowDuration: skillParam_gen.burst[b++][0],
    soloDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stackGain: skillParam_gen.passive1[0][0],
    stellar_dmg_: skillParam_gen.passive1[1][0],
    stackLoss: skillParam_gen.passive1[2][0],
  },
  passive2: {
    atkThresh: skillParam_gen.passive2[0][0],
    stellar_dmg_: skillParam_gen.passive2[1][0],
    max_stellar_dmg_: skillParam_gen.passive2[2][0],
  },
  passive3: {
    base_stellar_dmg_: skillParam_gen.passive3![0][0],
    maxBase_stellar_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    stackGain: skillParam_gen.constellation1[0],
    stackLoss: skillParam_gen.constellation1[1],
    four: skillParam_gen.constellation1[2],
    stellarconduct_dmg: skillParam_gen.constellation1[3],
    stellarswirl_dmg: skillParam_gen.constellation1[4],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    ele_enemyRes_: -skillParam_gen.constellation2[1],
  },
  constellation4: {
    stellarconduct_dmg: skillParam_gen.constellation4[0],
    stellarswirl_dmg: skillParam_gen.constellation4[1],
    cd: skillParam_gen.constellation4[2],
    stellar_dmg_: skillParam_gen.constellation4[3],
  },
  constellation6: {
    team_stellar_specialDmg_: skillParam_gen.constellation6[0],
    self_stellar_specialDmg_: skillParam_gen.constellation6[1],
  },
} as const

const a0_stellarconduct_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellar_dmg_), input.total.atk, 1 / 100),
  percent(dm.passive3.maxBase_stellar_dmg_)
)
const a0_stellarswirl_baseDmg_ = { ...a0_stellarconduct_baseDmg_ }

const [condA0StellarRadiancePath, condA0StellarRadiance] = cond(
  key,
  'a0StellarRadiance'
)
const isRadianceScOrNotRadiance = any(
  1,
  equal(condA0StellarRadiance, 'sc', 1),
  equal(condA0StellarRadiance, undefined, 1)
)

const [condBurstPath, condBurst] = cond(key, 'burst')
const burst_stellar_dmg_ = equal(
  condBurst,
  'on',
  subscript(input.total.burstIndex, dm.burst.stellar_dmg_, { unit: '%' })
)
const burst_stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (k) => [
  `${k}_dmg_`,
  { ...burst_stellar_dmg_ },
])

const maxSplendor = dm.passive1.stackGain + dm.constellation1.stackGain
const a1TeamSplendorArr = range(0, dm.passive1.stackGain)
const a1TeamSplendorMaxArr = range(0, maxSplendor)
const [condA1TeamSplendorPath, condA1TeamSplendor] = cond(key, 'a1TeamSplendor')
const a1TeamSplendor = lookup(
  condA1TeamSplendor,
  objKeyMap(a1TeamSplendorMaxArr, (stack) =>
    stack <= dm.passive1.stackGain
      ? constant(stack)
      : greaterEq(input.constellation, 1, stack)
  ),
  naught
)
const a1TeamSplendor_stellar_dmg_disp = greaterEq(
  input.asc,
  1,
  prod(a1TeamSplendor, percent(dm.passive1.stellar_dmg_))
)
const a1TeamSplendor_stellar_dmg_dispObj = objKeyValMap(
  allStellarReactionKeys,
  (k) => [
    `${k}_dmg_`,
    infoMut(
      { ...a1TeamSplendor_stellar_dmg_disp },
      { path: `${k}_dmg_`, isTeamBuff: true }
    ),
  ]
)
const a1TeamSplendor_stellar_dmg_ = unequal(
  target.charKey,
  key,
  a1TeamSplendor_stellar_dmg_disp
)
const a1TeamSplendor_stellar_dmg_obj = objKeyValMap(
  allStellarReactionKeys,
  (k) => [`${k}_dmg_`, { ...a1TeamSplendor_stellar_dmg_ }]
)

const a1SelfSplendor = threshold(
  input.constellation,
  6,
  maxSplendor,
  sum(
    threshold(input.constellation, 1, maxSplendor, dm.passive1.stackGain),
    prod(-1, a1TeamSplendor)
  )
)
const a1SelfSplendor_stellar_dmg_ = greaterEq(
  input.asc,
  1,
  prod(a1SelfSplendor, percent(dm.passive1.stellar_dmg_))
)
const a1SelfSplendor_stellar_dmg_obj = objKeyValMap(
  allStellarReactionKeys,
  (k) => [`${k}_dmg_`, { ...a1SelfSplendor_stellar_dmg_ }]
)

const a4_stellar_dmg_ = greaterEq(
  input.asc,
  4,
  max(
    min(
      prod(
        sum(input.total.atk, -dm.passive2.atkThresh),
        percent(dm.passive2.stellar_dmg_ / 100)
      ),
      percent(dm.passive2.max_stellar_dmg_)
    ),
    0
  )
)
const a4_stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (k) => [
  `${k}_dmg_`,
  { ...a4_stellar_dmg_ },
])

const c2TeamSplendor_atk_ = greaterEq(
  input.constellation,
  2,
  greaterEq(input.asc, 1, prod(a1TeamSplendor, percent(dm.constellation2.atk_)))
)
const c2SelfSplendor_atk_ = greaterEq(
  input.constellation,
  2,
  greaterEq(input.asc, 1, prod(a1SelfSplendor, percent(dm.constellation2.atk_)))
)

const [condC2NearOpponentPath, condC2NearOpponent] = cond(key, 'c2NearOpponent')
const c2NearOpponent_cryo_enemyRes_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2NearOpponent,
    'on',
    unequal(condA0StellarRadiance, undefined, dm.constellation2.ele_enemyRes_)
  )
)
const c2NearOpponent_electro_enemyRes_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2NearOpponent,
    'on',
    equal(condA0StellarRadiance, 'sc', dm.constellation2.ele_enemyRes_)
  )
)
const c2NearOpponent_anemo_enemyRes_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2NearOpponent,
    'on',
    equal(condA0StellarRadiance, 'ss', dm.constellation2.ele_enemyRes_)
  )
)

const c4Burst_stellar_dmg_disp = greaterEq(
  input.constellation,
  4,
  equal(
    condBurst,
    'on',
    prod(burst_stellar_dmg_, percent(dm.constellation4.stellar_dmg_))
  )
)
const c4Burst_stellar_dmg_dispObj = objKeyValMap(
  allStellarReactionKeys,
  (k) => [
    `${k}_dmg_`,
    infoMut({ ...c4Burst_stellar_dmg_disp }, { path: `${k}_dmg_` }),
  ]
)
const c4Burst_stellar_dmg_ = unequal(
  target.charKey,
  key,
  c4Burst_stellar_dmg_disp
)
const c4Burst_stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (k) => [
  `${k}_dmg_`,
  { ...c4Burst_stellar_dmg_ },
])

const c6Team_stellar_specialDmg_ = greaterEq(
  input.constellation,
  6,
  unequal(
    condA1TeamSplendor,
    undefined,
    dm.constellation6.team_stellar_specialDmg_
  )
)
const c6Team_stellar_specialDmg_obj = objKeyValMap(
  allStellarReactionKeys,
  (k) => [`${k}_specialDmg_`, { ...c6Team_stellar_specialDmg_ }]
)
const c6Self_stellar_specialDmg_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.self_stellar_specialDmg_
)
const c6Self_stellar_specialDmg_obj = objKeyValMap(
  allStellarReactionKeys,
  (k) => [`${k}_specialDmg_`, { ...c6Self_stellar_specialDmg_ }]
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    codaDotDmg: dmgNode('atk', dm.skill.codaDotDmg, 'skill'),
    codaStellarconductDmg: equal(
      isRadianceScOrNotRadiance,
      1,
      stellarTalentDmgNode(
        'atk',
        dm.skill.codaStellarconductDmg,
        'skill',
        'stellarconduct',
        'cryo'
      )
    ),
    codaStellarswirlDmg: equal(
      condA0StellarRadiance,
      'ss',
      stellarTalentDmgNode(
        'atk',
        dm.skill.codaStellarswirlDmg,
        'skill',
        'stellarswirl',
        'cryo'
      )
    ),
    plumeDmg: dmgNode('atk', dm.skill.plumeDmg, 'skill'),
    plumeStellarconductDmg: equal(
      condA0StellarRadiance,
      'sc',
      stellarTalentDmgNode(
        'atk',
        dm.skill.plumeStellarconductDmg,
        'skill',
        'stellarconduct',
        'cryo'
      )
    ),
    plumeStellarswirlDmg: equal(
      condA0StellarRadiance,
      'ss',
      stellarTalentDmgNode(
        'atk',
        dm.skill.plumeStellarswirlDmg,
        'skill',
        'stellarswirl',
        'cryo'
      )
    ),
    wingDmg: dmgNode('atk', dm.skill.wingDmg, 'skill'),
    wingStellarconductDmg: equal(
      condA0StellarRadiance,
      'sc',
      stellarTalentDmgNode(
        'atk',
        dm.skill.wingStellarconductDmg,
        'skill',
        'stellarconduct',
        'cryo'
      )
    ),
    wingStellarswirlDmg: equal(
      condA0StellarRadiance,
      'ss',
      stellarTalentDmgNode(
        'atk',
        dm.skill.wingStellarswirlDmg,
        'skill',
        'stellarswirl',
        'cryo'
      )
    ),
  },
  burst: {
    slashDmg: dmgNode('atk', dm.burst.slashDmg, 'burst'),
    finalDmg: dmgNode('atk', dm.burst.finalDmg, 'burst'),
  },
  passive2: a4_stellar_dmg_obj,
  passive3: {
    a0_stellarconduct_baseDmg_,
    a0_stellarswirl_baseDmg_,
  },
  constellation1: {
    stellarconduct_dmg: greaterEq(
      input.constellation,
      1,
      equal(
        isRadianceScOrNotRadiance,
        1,
        stellarDmgNode(
          percent(dm.constellation1.stellarconduct_dmg),
          'atk',
          'stellarconduct',
          'cryo'
        )
      )
    ),
    stellarswirl_dmg: greaterEq(
      input.constellation,
      1,
      equal(
        condA0StellarRadiance,
        'ss',
        stellarDmgNode(
          percent(dm.constellation1.stellarswirl_dmg),
          'atk',
          'stellarswirl',
          'cryo'
        )
      )
    ),
  },
  constellation4: {
    stellarconduct_dmg: greaterEq(
      input.constellation,
      4,
      equal(
        isRadianceScOrNotRadiance,
        1,
        stellarDmgNode(
          percent(dm.constellation4.stellarconduct_dmg),
          'atk',
          'stellarconduct',
          'cryo'
        )
      )
    ),
    stellarswirl_dmg: greaterEq(
      input.constellation,
      4,
      equal(
        condA0StellarRadiance,
        'ss',
        stellarDmgNode(
          percent(dm.constellation4.stellarswirl_dmg),
          'atk',
          'stellarswirl',
          'cryo'
        )
      )
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  dmgFormulas,
  {
    premod: {
      skillBoost: skillC3,
      burstBoost: burstC5,
      ...burst_stellar_dmg_obj,
      atk_: c2SelfSplendor_atk_,
      ...c6Self_stellar_specialDmg_obj,
    },
    teamBuff: {
      premod: {
        stellarconduct_baseDmg_: a0_stellarconduct_baseDmg_,
        stellarswirl_baseDmg_: a0_stellarswirl_baseDmg_,
        ...a1TeamSplendor_stellar_dmg_obj,
        atk_: c2TeamSplendor_atk_,
        cryo_enemyRes_: c2NearOpponent_cryo_enemyRes_,
        electro_enemyRes_: c2NearOpponent_electro_enemyRes_,
        anemo_enemyRes_: c2NearOpponent_anemo_enemyRes_,
        ...c6Team_stellar_specialDmg_obj,
      },
    },
  },
  {
    premod: {
      ...a1SelfSplendor_stellar_dmg_obj,
    },
    teamBuff: {
      premod: {
        ...c4Burst_stellar_dmg_obj,
      },
    },
  },
  {
    premod: {
      ...a4_stellar_dmg_obj,
    },
  }
)

const sheet: TalentSheet = {
  auto: ct.talentTem('auto', [
    {
      text: ct.chg('auto.fields.normal'),
    },
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i > 2 ? i - 1 : i}`),
          textSuffix: i >= 2 && i <= 3 ? `(${i - 1})` : undefined,
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
            name: ct.chg('auto.skillParams.5'),
          }),
        },
        {
          text: ct.chg('auto.skillParams.6'),
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
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.codaDotDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.codaStellarconductDmg, {
            name: ct.ch('codaStellarconductDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.codaStellarswirlDmg, {
            name: ct.ch('codaStellarswirlDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.plumeDmg, {
            name: ct.chg('skill.skillParams.3'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.plumeStellarconductDmg, {
            name: ct.ch('plumeStellarconductDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.plumeStellarswirlDmg, {
            name: ct.ch('plumeStellarswirlDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.wingDmg, {
            name: ct.chg('skill.skillParams.5'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.wingStellarconductDmg, {
            name: ct.ch('wingStellarconductDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.wingStellarswirlDmg, {
            name: ct.ch('wingStellarswirlDmg'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.7'),
          value: dm.skill.codaCd,
          unit: 's',
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
          node: infoMut(dmgFormulas.burst.slashDmg, {
            name: ct.chg('burst.skillParams.0'),
            multi: 3,
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.finalDmg, {
            name: ct.chg('burst.skillParams.1'),
          }),
        },
        {
          text: ct.chg('burst.skillParams.4'),
          value: dm.burst.soloDuration,
          unit: 's',
        },
        {
          text: stg('energyCost'),
          value: dm.burst.enerCost,
        },
      ],
    },
    ct.condTem('burst', {
      path: condBurstPath,
      value: condBurst,
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [
            ...Object.values(burst_stellar_dmg_obj).map((node) => ({ node })),
            {
              text: stg('duration'),
              value: dm.burst.snowDuration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation4', {
      teamBuff: true,
      fields: Object.values(c4Burst_stellar_dmg_dispObj).map((node) => ({
        node,
      })),
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1TeamSplendorPath,
      value: condA1TeamSplendor,
      teamBuff: true,
      name: ct.ch('a1Cond'),
      states: (data) =>
        objKeyMap(
          data.get(input.constellation).value < 1
            ? a1TeamSplendorArr
            : a1TeamSplendorMaxArr,
          (stack) => ({
            name: st('stack', { count: stack }),
            fields: [
              ...Object.values(a1SelfSplendor_stellar_dmg_obj).map((node) => ({
                node,
              })),
              ...Object.values(a1TeamSplendor_stellar_dmg_dispObj).map(
                (node) => ({ node })
              ),
            ],
          })
        ),
    }),
    ct.headerTem('constellation2', {
      teamBuff: true,
      fields: [
        {
          node: c2SelfSplendor_atk_,
        },
        {
          node: c2TeamSplendor_atk_,
        },
      ],
    }),
    ct.headerTem('constellation6', {
      teamBuff: true,
      fields: Object.values(c6Team_stellar_specialDmg_obj).map((node) => ({
        node,
      })),
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    {
      fields: Object.values(a4_stellar_dmg_obj).map((node) => ({ node })),
    },
  ]),
  passive3: ct.talentTem('passive3', [
    ct.headerTem('passive3', {
      teamBuff: true,
      fields: [
        {
          node: a0_stellarconduct_baseDmg_,
        },
        {
          node: a0_stellarswirl_baseDmg_,
        },
      ],
    }),
    ct.condTem('passive3', {
      path: condA0StellarRadiancePath,
      value: condA0StellarRadiance,
      teamBuff: true,
      name: st('elementalReaction.stellar.radiance'),
      states: {
        sc: {
          name: st('elementalReaction.polestar.inside'),
          fields: [
            {
              text: st('elementalReaction.stellar.gainRadianceSc'),
            },
          ],
        },
        ss: {
          name: st('elementalReaction.stellarswirl'),
          fields: [
            {
              text: st('elementalReaction.stellar.gainRadianceSs'),
            },
            {
              text: stg('duration'),
              value: 8,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.stellarconduct_dmg, {
            name: st('otherDmg.stellarconduct'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation1.stellarswirl_dmg, {
            name: st('otherDmg.stellarswirl'),
          }),
        },
        {
          text: st('talentEnhance.passive1'),
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          text: st('talentEnhance.passive1'),
        },
      ],
    }),
    ct.condTem('constellation2', {
      path: condC2NearOpponentPath,
      value: condC2NearOpponent,
      name: ct.ch('c2Cond'),
      teamBuff: true,
      canShow: unequal(condA0StellarRadiance, undefined, 1),
      states: {
        on: {
          fields: [
            {
              node: c2NearOpponent_cryo_enemyRes_,
            },
            {
              node: c2NearOpponent_anemo_enemyRes_,
            },
            {
              node: c2NearOpponent_electro_enemyRes_,
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
    ct.fieldsTem('constellation4', {
      fields: [
        {
          text: st('talentEnhance.burst'),
        },
        {
          node: infoMut(dmgFormulas.constellation4.stellarconduct_dmg, {
            name: st('otherDmg.stellarconduct'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation4.stellarswirl_dmg, {
            name: st('otherDmg.stellarswirl'),
          }),
        },
        {
          text: stg('cd'),
          value: dm.constellation4.cd,
          unit: 's',
          fixed: 1,
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
          text: st('talentEnhance.passive1'),
        },
        ...Object.values(c6Self_stellar_specialDmg_obj).map((node) => ({
          node,
        })),
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
