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
  percent,
  prod,
  subscript,
  sum,
  tally,
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
  splitScaleDmgNode,
} from '../dataUtil'

const key: CharacterKey = 'Lauma'
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
    spiritMoveStam: skillParam_gen.auto[a++][0],
    spiritJumpStam: skillParam_gen.auto[a++][0],
    spiritDuration: skillParam_gen.auto[a++][0],
    spiritCd: skillParam_gen.auto[a++][0],
    spiritcallCost: skillParam_gen.auto[a++][0],
    dmg: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    hold1Dmg: skillParam_gen.skill[s++],
    hold2Dmg: skillParam_gen.skill[s++],
    frostgroveAtkDmg: skillParam_gen.skill[s++],
    frostgroveEleMasDmg: skillParam_gen.skill[s++],
    frostgroveDuration: skillParam_gen.skill[s++][0],
    moonDuration: skillParam_gen.skill[s++][0],
    res_: skillParam_gen.skill[s++].map((v) => -v),
    resDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    stacksGained: skillParam_gen.burst[b++][0],
    moonToPale: skillParam_gen.burst[b++][0],
    bloomDmgInc: skillParam_gen.burst[b++],
    lunarBloomDmgInc: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    bloom_critRate_: skillParam_gen.passive1[0][0],
    bloom_critDMG_: skillParam_gen.passive1[1][0],
    lunarBloom_critRate_: skillParam_gen.passive1[2][0],
    lunarBloom_critDMG_: skillParam_gen.passive1[3][0],
    duration: skillParam_gen.passive1[4][0],
  },
  passive2: {
    skill_dmg_: skillParam_gen.passive2[0][0],
    max_skill_dmg_: skillParam_gen.passive2[1][0],
    charged_cdRed_: skillParam_gen.passive2[2][0],
    max_charged_cdRed_: skillParam_gen.passive2[3][0],
  },
  passive3: {
    base_lunarBloom_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunarBloom_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    duration: skillParam_gen.constellation1[0],
    heal_: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
    spiritStam_red_: skillParam_gen.constellation1[3],
    spiritDuration_inc: skillParam_gen.constellation1[4],
  },
  constellation2: {
    bloom_dmgInc: skillParam_gen.constellation2[0],
    lunarBloom_dmgInc: skillParam_gen.constellation2[1],
    lunarBloom_dmg_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg1: skillParam_gen.constellation6[0],
    paleStacks: skillParam_gen.constellation6[1],
    paleDurationRefresh: skillParam_gen.constellation6[2],
    triggerQuota: skillParam_gen.constellation6[3],
    dmg2: skillParam_gen.constellation6[4],
    lunarBloom_specialMult_: skillParam_gen.constellation6[5],
  },
} as const

const [condSkillVerdantDewPath, condSkillVerdantDew] = cond(
  key,
  'skillVerdantDew'
)
const skillVerdantDewArr = range(1, 3)
const skillVerdantDew = lookup(
  condSkillVerdantDew,
  objKeyMap(skillVerdantDewArr, (dew) => constant(dew)),
  naught
)

const [condSkillAfterHitPath, condSkillAfterHit] = cond(key, 'skillAfterHit')
const skillAfterHit_dendro_res_ = equal(
  condSkillAfterHit,
  'on',
  subscript(input.total.skillIndex, dm.skill.res_, { unit: '%' })
)
const skillAfterHit_hydro_res_ = { ...skillAfterHit_dendro_res_ }

const [condBurstPaleHymnPath, condBurstPaleHymn] = cond(key, 'burstPaleHymn')
const burstPaleHymn_bloom_dmgInc = equal(
  condBurstPaleHymn,
  'on',
  prod(
    subscript(input.total.burstIndex, dm.burst.bloomDmgInc, { unit: '%' }),
    input.total.eleMas
  )
)
const burstPaleHymn_hyperbloom_dmgInc = { ...burstPaleHymn_bloom_dmgInc }
const burstPaleHymn_burgeon_dmgInc = { ...burstPaleHymn_bloom_dmgInc }
const burstPaleHymn_lunarbloom_dmgInc = equal(
  condBurstPaleHymn,
  'on',
  prod(
    subscript(input.total.burstIndex, dm.burst.lunarBloomDmgInc, { unit: '%' }),
    input.total.eleMas
  )
)

const [condA1AfterSkillPath, condA1AfterSkill] = cond(key, 'a1AfterSkill')
const a1AfterSkill_bloom_critRate_ = greaterEq(
  input.asc,
  1,
  equal(
    tally.moonsign,
    1,
    equal(condA1AfterSkill, 'on', percent(dm.passive1.bloom_critRate_))
  )
)
const a1AfterSkill_hyperbloom_critRate_ = { ...a1AfterSkill_bloom_critRate_ }
const a1AfterSkill_burgeon_critRate_ = { ...a1AfterSkill_bloom_critRate_ }

const a1AfterSkill_lunarBloom_critRate_ = greaterEq(
  input.asc,
  1,
  greaterEq(
    tally.moonsign,
    2,
    equal(condA1AfterSkill, 'on', percent(dm.passive1.lunarBloom_critRate_))
  )
)
const a1AfterSkill_lunarBloom_critDMG_ = greaterEq(
  input.asc,
  1,
  greaterEq(
    tally.moonsign,
    2,
    equal(condA1AfterSkill, 'on', percent(dm.passive1.lunarBloom_critDMG_))
  )
)

const a4_skill_dmg_ = greaterEq(
  input.asc,
  4,
  min(
    prod(percent(dm.passive2.skill_dmg_), input.total.eleMas),
    percent(dm.passive2.max_skill_dmg_)
  )
)
const a4_skillLunarbloom_dmg_ = greaterEq(
  input.asc,
  4,
  min(
    prod(percent(dm.passive2.skill_dmg_), input.total.eleMas),
    percent(dm.passive2.max_skill_dmg_)
  )
)
const a4_charged_cdRed_ = greaterEq(
  input.asc,
  4,
  min(
    prod(percent(dm.passive2.charged_cdRed_), input.total.eleMas),
    percent(dm.passive2.max_charged_cdRed_)
  )
)

const a0_lunarbloom_baseDmg_ = min(
  prod(percent(dm.passive3.base_lunarBloom_dmg_), input.total.eleMas),
  percent(dm.passive3.maxBase_lunarBloom_dmg_)
)

const c2PaleHymn_bloom_dmgInc = greaterEq(
  input.constellation,
  2,
  equal(
    condBurstPaleHymn,
    'on',
    prod(percent(dm.constellation2.bloom_dmgInc), input.total.eleMas)
  )
)
const c2PaleHymn_hyperbloom_dmgInc = { ...c2PaleHymn_bloom_dmgInc }
const c2PaleHymn_burgeon_dmgInc = { ...c2PaleHymn_bloom_dmgInc }
const c2PaleHymn_lunarbloom_dmgInc = greaterEq(
  input.constellation,
  2,
  equal(
    condBurstPaleHymn,
    'on',
    prod(percent(dm.constellation2.lunarBloom_dmgInc), input.total.eleMas)
  )
)
const c2Ascendant_lunarbloom_dmg_ = greaterEq(
  input.constellation,
  2,
  greaterEq(tally.moonsign, 2, percent(dm.constellation2.lunarBloom_dmg_))
)

const c6Ascendant_lunarbloom_specialDmg_ = greaterEq(
  input.constellation,
  6,
  greaterEq(
    tally.moonsign,
    2,
    percent(dm.constellation6.lunarBloom_specialMult_)
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
    pressDmg: dmgNode('atk', dm.skill.pressDmg, 'skill'),
    hold1Dmg: dmgNode('atk', dm.skill.hold1Dmg, 'skill'),
    hold2Dmg: lunarDmg(
      prod(
        skillVerdantDew,
        subscript(input.total.skillIndex, dm.skill.hold2Dmg, { unit: '%' })
      ),
      'eleMas',
      'lunarbloom',
      { premod: { lunarbloom_dmg_: a4_skillLunarbloom_dmg_ } }
    ),
    frostgroveDmg: splitScaleDmgNode(
      ['atk', 'eleMas'],
      [dm.skill.frostgroveAtkDmg, dm.skill.frostgroveEleMasDmg],
      'skill'
    ),
  },
  burst: {
    burstPaleHymn_bloom_dmgInc,
    burstPaleHymn_hyperbloom_dmgInc,
    burstPaleHymn_burgeon_dmgInc,
    burstPaleHymn_lunarbloom_dmgInc,
  },
  passive2: {
    a4_skill_dmg_,
    a4_skillLunarbloom_dmg_,
  },
  constellation1: {
    heal: greaterEq(
      input.constellation,
      1,
      healNode('eleMas', percent(dm.constellation1.heal_), 0)
    ),
  },
  constellation2: {
    c2PaleHymn_bloom_dmgInc,
    c2PaleHymn_hyperbloom_dmgInc,
    c2PaleHymn_burgeon_dmgInc,
    c2PaleHymn_lunarbloom_dmgInc,
  },
  constellation6: {
    dmg1: greaterEq(
      input.constellation,
      6,
      lunarDmg(percent(dm.constellation6.dmg1), 'eleMas', 'lunarbloom')
    ),
    dmg2: greaterEq(
      input.constellation,
      6,
      lunarDmg(percent(dm.constellation6.dmg2), 'eleMas', 'lunarbloom')
    ),
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC5,
    burstBoost: burstC3,
    skill_dmg_: a4_skill_dmg_,
  },
  teamBuff: {
    premod: {
      dendro_enemyRes_: skillAfterHit_dendro_res_,
      hydro_enemyRes_: skillAfterHit_hydro_res_,
      bloom_dmgInc: sum(burstPaleHymn_bloom_dmgInc, c2PaleHymn_bloom_dmgInc),
      hyperbloom_dmgInc: sum(
        burstPaleHymn_hyperbloom_dmgInc,
        c2PaleHymn_hyperbloom_dmgInc
      ),
      burgeon_dmgInc: sum(
        burstPaleHymn_burgeon_dmgInc,
        c2PaleHymn_burgeon_dmgInc
      ),
      lunarbloom_dmgInc: sum(
        burstPaleHymn_lunarbloom_dmgInc,
        c2PaleHymn_lunarbloom_dmgInc
      ),
      bloom_critRate_: a1AfterSkill_bloom_critRate_,
      hyperbloom_critRate_: a1AfterSkill_hyperbloom_critRate_,
      burgeon_critRate_: a1AfterSkill_burgeon_critRate_,
      lunarbloom_critRate_: a1AfterSkill_lunarBloom_critRate_,
      lunarbloom_critDMG_: a1AfterSkill_lunarBloom_critDMG_,
      lunarbloom_baseDmg_: a0_lunarbloom_baseDmg_,
      lunarbloom_dmg_: c2Ascendant_lunarbloom_dmg_,
      lunarbloom_specialDmg_: c6Ascendant_lunarbloom_specialDmg_,
    },
    tally: {
      moonsign: constant(1),
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
          text: ct.chg('auto.skillParams.3'),
          value: dm.charged.spiritMoveStam,
          unit: '/s',
        },
        {
          text: ct.chg('auto.skillParams.4'),
          value: dm.charged.spiritJumpStam,
        },
        {
          text: ct.chg('auto.skillParams.5'),
          value: dm.charged.spiritDuration,
          unit: 's',
        },
        {
          text: ct.chg('auto.skillParams.6'),
          value: dm.charged.spiritCd,
          unit: 's',
        },
        {
          text: ct.chg('auto.skillParams.7'),
          value: dm.charged.spiritcallCost,
        },
        {
          node: infoMut(dmgFormulas.charged.dmg, {
            name: ct.chg(`auto.skillParams.8`),
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
          node: infoMut(dmgFormulas.skill.pressDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.hold1Dmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.frostgroveDmg, {
            name: ct.chg('skill.skillParams.3'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.frostgroveDuration,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.5'),
          value: dm.skill.moonDuration,
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
      value: condSkillVerdantDew,
      path: condSkillVerdantDewPath,
      name: ct.ch('skillVerdantDewCond'),
      states: objKeyMap(skillVerdantDewArr, (vd) => ({
        name: `${vd}`,
        fields: [
          {
            node: infoMut(dmgFormulas.skill.hold2Dmg, {
              name: ct.chg('skill.skillParams.2'),
            }),
          },
        ],
      })),
    }),
    ct.condTem('skill', {
      value: condSkillAfterHit,
      path: condSkillAfterHitPath,
      name: st('hitOp.skill'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: skillAfterHit_dendro_res_,
            },
            {
              node: skillAfterHit_hydro_res_,
            },
            {
              text: stg('duration'),
              value: dm.skill.resDuration,
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
          text: ct.chg('burst.skillParams.0'),
          value: dm.burst.stacksGained,
        },
        {
          text: ct.chg('burst.skillParams.1'),
          value: dm.burst.moonToPale,
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
      value: condBurstPaleHymn,
      path: condBurstPaleHymnPath,
      teamBuff: true,
      name: ct.ch('burstPaleCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(burstPaleHymn_bloom_dmgInc, {
                isTeamBuff: true,
                path: 'bloom_dmgInc',
              }),
            },
            {
              node: infoMut(burstPaleHymn_hyperbloom_dmgInc, {
                isTeamBuff: true,
                path: 'hyperbloom_dmgInc',
              }),
            },
            {
              node: infoMut(burstPaleHymn_burgeon_dmgInc, {
                isTeamBuff: true,
                path: 'burgeon_dmgInc',
              }),
            },
            {
              node: infoMut(burstPaleHymn_lunarbloom_dmgInc, {
                isTeamBuff: true,
                path: 'lunarbloom_dmgInc',
              }),
            },
            {
              text: ct.chg('burst.skillParams.4'),
              value: dm.burst.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1AfterSkillPath,
      value: condA1AfterSkill,
      name: st('afterUse.skill'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: a1AfterSkill_bloom_critRate_,
            },
            {
              node: a1AfterSkill_hyperbloom_critRate_,
            },
            {
              node: a1AfterSkill_burgeon_critRate_,
            },
            {
              node: a1AfterSkill_lunarBloom_critRate_,
            },
            {
              node: a1AfterSkill_lunarBloom_critDMG_,
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
  passive2: ct.talentTem('passive2', [
    ct.headerTem('passive2', {
      fields: [
        {
          node: a4_skill_dmg_,
        },
        {
          node: infoMut(a4_skillLunarbloom_dmg_, { path: 'lunarbloom_dmg_' }),
        },
        {
          node: infoMut(a4_charged_cdRed_, {
            name: ct.ch('charged_cdRed_'),
            unit: '%',
          }),
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    ct.headerTem('passive3', {
      teamBuff: true,
      fields: [
        {
          node: a0_lunarbloom_baseDmg_,
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.heal, {
            name: stg('healing'),
          }),
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      value: condBurstPaleHymn,
      path: condBurstPaleHymnPath,
      teamBuff: true,
      name: ct.ch('burstPaleCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c2PaleHymn_bloom_dmgInc, {
                isTeamBuff: true,
                path: 'bloom_dmgInc',
              }),
            },
            {
              node: infoMut(c2PaleHymn_hyperbloom_dmgInc, {
                isTeamBuff: true,
                path: 'hyperbloom_dmgInc',
              }),
            },
            {
              node: infoMut(c2PaleHymn_burgeon_dmgInc, {
                isTeamBuff: true,
                path: 'burgeon_dmgInc',
              }),
            },
            {
              node: infoMut(c2PaleHymn_lunarbloom_dmgInc, {
                isTeamBuff: true,
                path: 'lunarbloom_dmgInc',
              }),
            },
            {
              text: ct.chg('burst.skillParams.4'),
              value: dm.burst.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation2', {
      teamBuff: true,
      canShow: greaterEq(tally.moonsign, 2, 1),
      fields: [
        {
          node: c2Ascendant_lunarbloom_dmg_,
        },
      ],
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
          node: infoMut(dmgFormulas.constellation6.dmg1, {
            name: ct.ch('frostgroveAddlDmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.constellation6.dmg2, {
            name: ct.ch('normalAddlDmg'),
          }),
        },
      ],
    }),
    ct.headerTem('constellation6', {
      teamBuff: true,
      canShow: greaterEq(tally.moonsign, 2, 1),
      fields: [
        {
          node: c6Ascendant_lunarbloom_specialDmg_,
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
