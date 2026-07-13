import { objKeyValMap } from '@genshin-optimizer/common/util'
import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  max,
  min,
  naught,
  percent,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'

const key: CharacterKey = 'YumemizukiMizuki'
const skillParam_gen = allStats.char.skillParam[key]

const [condLockRevelationPath, condLockRevelation] = cond(key, 'lockRevelation')
const lockRevelation = equal(condLockRevelation, 'on', 1)

const ct = charTemplates(key, lockRevelation)

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
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    contDmg: skillParam_gen.skill[s++],
    swirl_dmg_: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    skillDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    shockwaveDmg: skillParam_gen.burst[b++],
    hpRegenMult: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    hpRegenFlat: skillParam_gen.burst[b++],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  lockedPassive: {
    skillContDmgInc: skillParam_gen.lockedPassive![0][0],
    cd: skillParam_gen.lockedPassive![1][0],
    eleMas: skillParam_gen.lockedPassive![2][0],
    durationIThink: skillParam_gen.lockedPassive![3][0],
  },
  constellation1: {
    swirl_dmgInc: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
    dmg: skillParam_gen.constellation1[3],
  },
  constellation2: {
    phec_dmg_: skillParam_gen.constellation2[0],
    eleRes_: -skillParam_gen.constellation2[1],
  },
  constellation4: {
    energyRestore: skillParam_gen.constellation4[0],
    heal: skillParam_gen.constellation4[1],
  },
  constellation6: {
    swirl_critRate_: skillParam_gen.constellation6[0],
    swirl_critDMG_: 1,
    eleMasThresh: skillParam_gen.constellation6[1],
    critRate_: skillParam_gen.constellation6[2],
    critDMG_: skillParam_gen.constellation6[3],
    maxCritRate_: skillParam_gen.constellation6[4],
    maxCritDMG_: skillParam_gen.constellation6[5],
  },
} as const

const [condSkillDreamPath, condSkillDream] = cond(key, 'skillDream')
const skillDream_swirl_dmg_ = equal(
  condSkillDream,
  'on',
  prod(
    subscript(input.total.skillIndex, dm.skill.swirl_dmg_, { unit: '%' }),
    input.total.eleMas
  )
)

const [condA4PhecPath, condA4Phec] = cond(key, 'a4Phec')
const a4Phec_eleMas = greaterEq(
  input.asc,
  4,
  equal(condA4Phec, 'on', dm.passive2.eleMas)
)

const lockDream_eleMas = equal(
  condLockRevelation,
  'on',
  equal(
    condSkillDream,
    'on',
    prod(percent(dm.lockedPassive.eleMas), input.premod.eleMas)
  )
)

const [condC1AwaitingPath, condC1Awaiting] = cond(key, 'c1Awaiting')
const c1Awaiting_swirl_dmgInc = greaterEq(
  input.constellation,
  1,
  equal(
    condC1Awaiting,
    'on',
    prod(percent(dm.constellation1.swirl_dmgInc), input.total.eleMas)
  )
)

const c2Dream_dmg_ = objKeyValMap(absorbableEle, (ele) => [
  `${ele}_dmg_`,
  greaterEq(
    input.constellation,
    2,
    equal(
      condSkillDream,
      'on',
      prod(percent(dm.constellation2.phec_dmg_), input.total.eleMas)
    )
  ),
])
const c2Dream_res_ = objKeyValMap([...absorbableEle, 'anemo'], (ele) => [
  `${ele}_enemyRes_`,
  greaterEq(
    input.constellation,
    2,
    equal(condLockRevelation, 'on', dm.constellation2.eleRes_)
  ),
])

const c6Dream_swirlCritRate_ = greaterEq(
  input.constellation,
  6,
  equal(condSkillDream, 'on', dm.constellation6.swirl_critRate_)
)
const c6Dream_swirlCritDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condSkillDream, 'on', dm.constellation6.swirl_critDMG_)
)
// TODO: Verify if this reads premod or total
const c6_critRate_ = greaterEq(
  input.constellation,
  6,
  equal(
    condLockRevelation,
    'on',
    max(
      naught,
      min(
        percent(dm.constellation6.maxCritRate_),
        prod(
          percent(dm.constellation6.critRate_),
          sum(input.premod.eleMas, -dm.constellation6.eleMasThresh)
        )
      )
    )
  )
)
const c6_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(
    condLockRevelation,
    'on',
    max(
      naught,
      min(
        percent(dm.constellation6.maxCritDMG_),
        prod(
          percent(dm.constellation6.critDMG_),
          sum(input.premod.eleMas, -dm.constellation6.eleMasThresh)
        )
      )
    )
  )
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    contDmg: dmgNode('atk', dm.skill.contDmg, 'skill'),
    swirl_dmg_: skillDream_swirl_dmg_,
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    shockwaveDmg: dmgNode('atk', dm.burst.shockwaveDmg, 'burst'),
    snackHeal: healNodeTalent(
      'eleMas',
      dm.burst.hpRegenMult,
      dm.burst.hpRegenFlat,
      'burst'
    ),
  },
  lockedPassive: {
    skillContDmg: dmgNode('atk', dm.skill.contDmg, 'skill', {
      premod: {
        skill_dmgInc: equal(
          condLockRevelation,
          'on',
          prod(percent(dm.lockedPassive.skillContDmgInc), input.total.eleMas)
        ),
      },
    }),
    lockDream_eleMas,
  },
  constellation1: {
    c1Awaiting_swirl_dmgInc,
    dmg: greaterEq(
      input.constellation,
      1,
      equal(
        condLockRevelation,
        'on',
        customDmgNode(
          prod(percent(dm.constellation1.dmg), input.total.eleMas),
          'elemental'
        )
      )
    ),
  },
  constellation2: {
    ...c2Dream_dmg_,
  },
  constellation4: {
    heal: greaterEq(
      input.constellation,
      4,
      equal(
        condLockRevelation,
        'on',
        customHealNode(
          prod(percent(dm.constellation4.heal), input.total.eleMas)
        )
      )
    ),
  },
  constellation6: {
    c6_critRate_,
    c6_critDMG_,
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    skillBoost: skillC3,
    eleMas: a4Phec_eleMas,
  },
  teamBuff: {
    premod: {
      swirl_dmg_: skillDream_swirl_dmg_,
      swirl_dmgInc: c1Awaiting_swirl_dmgInc,
      ...c2Dream_dmg_, // Maybe should be total?
      ...c2Dream_res_,
      swirl_critRate_: c6Dream_swirlCritRate_,
      swirl_critDMG_: c6Dream_swirlCritDMG_,
    },
    // Maybe should be premod?
    total: {
      eleMas: lockDream_eleMas,
      critRate_: c6_critRate_,
      critDMG_: c6_critDMG_,
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
          node: infoMut(dmgFormulas.charged.dmg, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.4'),
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
          node: infoMut(dmgFormulas.skill.contDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
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
    ct.condTem('skill', {
      path: condSkillDreamPath,
      value: condSkillDream,
      teamBuff: true,
      name: ct.ch('skillCond'),
      states: {
        on: {
          fields: [
            {
              node: skillDream_swirl_dmg_,
            },
          ],
        },
      },
    }),
    ct.headerTem('lockedPassive', {
      canShow: equal(condSkillDream, 'on', 1),
      fields: [
        {
          node: lockDream_eleMas,
        },
      ],
    }),
    ct.headerTem('constellation2', {
      canShow: equal(condSkillDream, 'on', 1),
      teamBuff: true,
      fields: [
        ...Object.values(c2Dream_dmg_).map((node) => ({ node })),
        ...Object.values(c2Dream_res_).map((node) => ({ node })),
      ],
    }),
    ct.headerTem('constellation6', {
      canShow: equal(condSkillDream, 'on', 1),
      teamBuff: true,
      fields: [
        {
          node: c6Dream_swirlCritRate_,
        },
        {
          node: c6Dream_swirlCritDMG_,
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
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.shockwaveDmg, {
            name: ct.chg('burst.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.snackHeal, {
            name: ct.chg('burst.skillParams.2'),
          }),
        },
        {
          text: stg('duration'),
          value: dm.burst.duration,
          unit: 's',
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

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      value: condA4Phec,
      path: condA4PhecPath,
      teamBuff: true,
      name: ct.ch('a4Cond'),
      states: {
        on: {
          fields: [
            {
              node: a4Phec_eleMas,
            },
            {
              text: stg('duration'),
              value: dm.passive2.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  lockedPassive: ct.talentTem('lockedPassive', [
    ct.condTem('lockedPassive', {
      path: condLockRevelationPath,
      value: condLockRevelation,
      teamBuff: true,
      name: st('revelation.done'),
      states: {
        on: {
          fields: [
            {
              text: st('hexerei.talentEnhance'),
            },
            {
              node: infoMut(dmgFormulas.lockedPassive.skillContDmg, {
                name: ct.chg('skill.skillParams.1'),
              }),
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      value: condC1Awaiting,
      path: condC1AwaitingPath,
      teamBuff: true,
      name: ct.ch('c1Cond'),
      states: {
        on: {
          fields: [
            {
              node: c1Awaiting_swirl_dmgInc,
            },
            {
              text: stg('duration'),
              value: dm.constellation1.duration,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: dm.constellation1.cd,
              unit: 's',
              fixed: 1,
            },
            {
              text: st('triggerQuota'),
              value: 1,
            },
          ],
        },
      },
    }),
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation4.heal, {
            name: stg('healing'),
          }),
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    {
      fields: [
        {
          node: c6_critRate_,
        },
        {
          node: c6_critDMG_,
        },
      ],
    },
  ]),
}
export default new CharacterSheet(sheet, data)
