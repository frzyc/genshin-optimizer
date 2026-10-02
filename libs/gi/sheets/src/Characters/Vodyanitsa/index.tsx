import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  max,
  min,
  naught,
  one,
  percent,
  prod,
  subscript,
  sum,
  target,
} from '@genshin-optimizer/gi/wr'
import {
  activeCharBuff,
  cond,
  inactiveCharBuff,
  st,
  stg,
} from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Vodyanitsa'
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
      skillParam_gen.auto[a++], // 4
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
    duration: skillParam_gen.skill[s++][0],
    hornDmgInterval: skillParam_gen.skill[s++][0],
    hornDmg: skillParam_gen.skill[s++],
    songHealFlat: skillParam_gen.skill[s++],
    songHealMult: skillParam_gen.skill[s++],
    songHealInterval: skillParam_gen.skill[s++][0],
    hydrocryo_enemyRes_: skillParam_gen.skill[s++].map((v) => -v),
    resDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    songDmg_: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    anemo_enemyRes_: -skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    leadStackGain: skillParam_gen.passive2[0][0],
    chorusStackGain: skillParam_gen.passive2[1][0],
    hpThresh: skillParam_gen.passive2[2][0],
    stellarswirl_dmgInc: skillParam_gen.passive2[3][0],
    hydrocryo_dmgInc: skillParam_gen.passive2[4][0],
    maxStellarswirl_dmgInc: skillParam_gen.passive2[5][0],
    maxHydrocryo_dmgInc: skillParam_gen.passive2[6][0],
  },
  constellation1: {
    atk_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    hydrocryo_critDMG_: skillParam_gen.constellation2[0],
    stellarswirl_critDMG_: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
    durationInc: skillParam_gen.constellation2[3],
  },
  constellation4: {
    hpThresh: skillParam_gen.constellation4[0],
    heal_: skillParam_gen.constellation4[1],
    hp_: skillParam_gen.constellation4[2],
    duration: skillParam_gen.constellation4[3],
    maxStacks: skillParam_gen.constellation4[4],
  },
  constellation6: {
    stellarswirl_specialDmg_: skillParam_gen.constellation6[0],
    hydrocryo_dmg_: skillParam_gen.constellation6[1],
  },
} as const

const [condSkillHitPath, condSkillHit] = cond(key, 'skillHit')
const skillHit_hydro_enemyRes_ = equal(
  condSkillHit,
  'on',
  subscript(input.total.skillIndex, dm.skill.hydrocryo_enemyRes_)
)
const skillHit_cryo_enemyRes_ = { ...skillHit_hydro_enemyRes_ }

const [condSkillSongPath, condSkillSong] = cond(key, 'skillSong')
const skillSong_burst_mult_ = equal(
  condSkillSong,
  'on',
  subscript(input.total.burstIndex, dm.burst.songDmg_, { unit: '%' })
)

const [condA1VortexPath, condA1Vortex] = cond(key, 'a1Vortex')
const a1Vortex_anemo_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(condA1Vortex, 'on', dm.passive1.anemo_enemyRes_)
)

const [condA4LeadVocalPath, condA4LeadVocal] = cond(key, 'a4LeadVocal')
// Technically incorrect, should only apply to specific moves
// But we don't have a way to support that atm
const [a4LeadVocal_hydro_dmgIncDisp, a4LeadVocal_hydro_dmgInc] = activeCharBuff(
  target.charKey,
  greaterEq(
    input.asc,
    4,
    equal(
      condA4LeadVocal,
      'on',
      min(
        max(
          prod(
            sum(input.total.hp, -dm.passive2.hpThresh),
            1 / 1000,
            dm.passive2.hydrocryo_dmgInc
          ),
          0
        ),
        dm.passive2.maxHydrocryo_dmgInc
      )
    )
  ),
  { path: 'hydro_dmgInc' }
)
const [a4LeadVocal_cryo_dmgIncDisp, a4LeadVocal_cryo_dmgInc] = activeCharBuff(
  target.charKey,
  { ...a4LeadVocal_hydro_dmgIncDisp },
  { path: 'cryo_dmgInc' }
)
const [a4LeadVocal_stellarswirl_dmgIncDisp, a4LeadVocal_stellarswirl_dmgInc] =
  activeCharBuff(
    target.charKey,
    greaterEq(
      input.asc,
      4,
      equal(
        condA4LeadVocal,
        'on',
        min(
          max(
            prod(
              sum(input.total.hp, -dm.passive2.hpThresh),
              1 / 1000,
              dm.passive2.stellarswirl_dmgInc
            ),
            0
          ),
          dm.passive2.maxStellarswirl_dmgInc
        )
      )
    ),
    { path: 'stellarswirl_dmgInc' }
  )

const [condA4ChorusPath, condA4Chorus] = cond(key, 'a4Chorus')
const [a4Chorus_hydro_dmgIncDisp, a4Chorus_hydro_dmgInc] = inactiveCharBuff(
  greaterEq(
    input.asc,
    4,
    equal(
      condA4Chorus,
      'on',
      min(
        max(
          prod(
            sum(input.total.hp, -dm.passive2.hpThresh),
            1 / 1000,
            dm.passive2.hydrocryo_dmgInc
          ),
          0
        ),
        dm.passive2.maxHydrocryo_dmgInc
      )
    )
  ),
  { path: 'hydro_dmgInc' }
)
const [a4Chorus_cryo_dmgIncDisp, a4Chorus_cryo_dmgInc] = inactiveCharBuff(
  { ...a4Chorus_hydro_dmgIncDisp },
  { path: 'cryo_dmgInc' }
)
const [a4Chorus_stellarswirl_dmgIncDisp, a4Chorus_stellarswirl_dmgInc] =
  inactiveCharBuff(
    greaterEq(
      input.asc,
      4,
      equal(
        condA4Chorus,
        'on',
        min(
          max(
            prod(
              sum(input.total.hp, -dm.passive2.hpThresh),
              1 / 1000,
              dm.passive2.stellarswirl_dmgInc
            ),
            0
          ),
          dm.passive2.maxStellarswirl_dmgInc
        )
      )
    ),
    { path: 'stellarswirl_dmgInc' }
  )

const [condC1HealPath, condC1Heal] = cond(key, 'c1Heal')
const c1Heal_atk = greaterEq(
  input.constellation,
  1,
  equal(condC1Heal, 'on', prod(input.total.hp, percent(dm.constellation1.atk_)))
)

const [condC2StatePath, condC2State] = cond(key, 'c2State')
const [c2State_hydro_critDMG_disp, c2State_hydro_critDMG_] = activeCharBuff(
  target.charKey,
  greaterEq(
    input.constellation,
    2,
    equal(condC2State, 'voice', dm.constellation2.hydrocryo_critDMG_)
  ),
  { path: 'hydro_critDMG_' },
  greaterEq(input.constellation, 6, 1)
)
const [c2State_cryo_critDMG_disp, c2State_cryo_critDMG_] = activeCharBuff(
  target.charKey,
  greaterEq(
    input.constellation,
    2,
    equal(condC2State, 'voice', dm.constellation2.hydrocryo_critDMG_)
  ),
  { path: 'cryo_critDMG_' },
  greaterEq(input.constellation, 6, 1)
)
const [c2State_stellarswirl_critDMG_disp, c2State_stellarswirl_critDMG_] =
  activeCharBuff(
    target.charKey,
    greaterEq(
      input.constellation,
      2,
      equal(condC2State, 'vortex', dm.constellation2.stellarswirl_critDMG_)
    ),
    { path: 'stellarswirl_critDMG_' },
    greaterEq(input.constellation, 6, 1)
  )

const [condC4StatePath, condC4State] = cond(key, 'c4State')
const c4State_heal_ = sum(
  one,
  greaterEq(
    input.constellation,
    4,
    equal(condC4State, 'below', dm.constellation4.heal_)
  )
)
const c4State_hp_ = greaterEq(
  input.constellation,
  4,
  lookup(
    condC4State,
    {
      above1: percent(dm.constellation4.hp_),
      above2: percent(dm.constellation4.hp_ * 2),
      above3: percent(dm.constellation4.hp_ * 3),
    },
    naught
  )
)

const c6Song_stellarswirl_specialDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condSkillSong, 'on', dm.constellation6.stellarswirl_specialDmg_)
)
const c6Song_hydro_dmg_ = greaterEq(
  input.constellation,
  6,
  equal(condSkillSong, 'on', dm.constellation6.hydrocryo_dmg_)
)
const c6Song_cryo_dmg_ = greaterEq(
  input.constellation,
  6,
  equal(condSkillSong, 'on', dm.constellation6.hydrocryo_dmg_)
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
    skillDmg: dmgNode('hp', dm.skill.skillDmg, 'skill'),
    hornDmg: dmgNode('hp', dm.skill.hornDmg, 'skill'),
    songHeal: healNodeTalent(
      'hp',
      dm.skill.songHealMult,
      dm.skill.songHealFlat,
      'skill',
      undefined,
      c4State_heal_
    ),
  },
  burst: {
    skillDmg: dmgNode(
      'hp',
      dm.burst.skillDmg,
      'burst',
      undefined,
      sum(one, skillSong_burst_mult_)
    ),
  },
  passive2: {
    a4LeadVocal_hydro_dmgIncDisp,
    a4LeadVocal_cryo_dmgIncDisp,
    a4LeadVocal_stellarswirl_dmgIncDisp,
    a4Chorus_hydro_dmgIncDisp,
    a4Chorus_cryo_dmgIncDisp,
    a4Chorus_stellarswirl_dmgIncDisp,
  },
  constellation1: {
    c1Heal_atk,
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    skillBoost: skillC3,
    hp_: c4State_hp_,
  },
  teamBuff: {
    premod: {
      hydro_enemyRes_: skillHit_hydro_enemyRes_,
      cryo_enemyRes_: skillHit_cryo_enemyRes_,
      anemo_enemyRes_: a1Vortex_anemo_enemyRes_,
      hydro_dmgInc: sum(a4LeadVocal_hydro_dmgInc, a4Chorus_hydro_dmgInc),
      cryo_dmgInc: sum(a4LeadVocal_cryo_dmgInc, a4Chorus_cryo_dmgInc),
      stellarswirl_dmgInc: sum(
        a4LeadVocal_stellarswirl_dmgInc,
        a4Chorus_stellarswirl_dmgInc
      ),
      hydro_critDMG_: c2State_hydro_critDMG_,
      cryo_critDMG_: c2State_cryo_critDMG_,
      stellarswirl_critDMG_: c2State_stellarswirl_critDMG_,
      stellarswirl_specialDmg_: c6Song_stellarswirl_specialDMG_,
      hydro_dmg_: c6Song_hydro_dmg_,
      cryo_dmg_: c6Song_cryo_dmg_,
    },
    total: {
      atk: c1Heal_atk,
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
            name: ct.chg('auto.skillParams.4'),
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
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          text: stg('duration'),
          value: (data) =>
            data.get(input.constellation).value >= 2
              ? `${dm.skill.duration}s + ${dm.constellation2.durationInc}s = ${dm.skill.duration + dm.constellation2.durationInc}`
              : dm.skill.duration,
          unit: 's',
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.hornDmgInterval,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.hornDmg, {
            name: ct.chg('skill.skillParams.3'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.songHeal, {
            name: ct.chg('skill.skillParams.4'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.5'),
          value: dm.skill.songHealInterval,
          unit: 's',
          fixed: 1,
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('skill', {
      path: condSkillHitPath,
      value: condSkillHit,
      teamBuff: true,
      name: st('hitOp.skill'),
      states: {
        on: {
          fields: [
            {
              node: skillHit_hydro_enemyRes_,
            },
            {
              node: skillHit_cryo_enemyRes_,
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
    ct.headerTem('constellation2', {
      fields: [
        {
          text: st('durationInc'),
          value: dm.constellation2.durationInc,
          unit: 's',
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
    ct.condTem('skill', {
      path: condSkillSongPath,
      value: condSkillSong,
      teamBuff: true,
      name: ct.ch('skillSongCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(skillSong_burst_mult_, {
                name: st('dmgMult.burst'),
              }),
            },
          ],
        },
      },
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      path: condA1VortexPath,
      value: condA1Vortex,
      teamBuff: true,
      name: ct.ch('a1Cond'),
      states: {
        on: {
          fields: [
            {
              node: a1Vortex_anemo_enemyRes_,
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
    ct.condTem('passive2', {
      path: condA4LeadVocalPath,
      value: condA4LeadVocal,
      teamBuff: true,
      name: ct.ch('a4LeadVocalCond'),
      states: {
        on: {
          fields: [
            {
              node: a4LeadVocal_hydro_dmgIncDisp,
            },
            {
              node: a4LeadVocal_cryo_dmgIncDisp,
            },
            {
              node: a4LeadVocal_stellarswirl_dmgIncDisp,
            },
            {
              text: st('triggerQuota'),
              value: dm.passive2.leadStackGain,
            },
            {
              text: stg('duration'),
              value: 30,
              unit: 's',
            },
          ],
        },
      },
    }),
    ct.condTem('passive2', {
      path: condA4ChorusPath,
      value: condA4Chorus,
      teamBuff: true,
      name: ct.ch('a4ChorusCond'),
      states: {
        on: {
          fields: [
            {
              node: a4Chorus_hydro_dmgIncDisp,
            },
            {
              node: a4Chorus_cryo_dmgIncDisp,
            },
            {
              node: a4Chorus_stellarswirl_dmgIncDisp,
            },
            {
              text: st('triggerQuota'),
              value: dm.passive2.chorusStackGain,
            },
            {
              text: stg('duration'),
              value: 30,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1HealPath,
      value: condC1Heal,
      teamBuff: true,
      name: ct.ch('c1Cond'),
      states: {
        on: {
          fields: [
            {
              node: c1Heal_atk,
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
    ct.condTem('constellation2', {
      path: condC2StatePath,
      value: condC2State,
      teamBuff: true,
      name: ct.ch('c2Cond'),
      states: {
        voice: {
          name: ct.ch('c2VoiceCond'),
          fields: [
            {
              node: c2State_hydro_critDMG_disp,
            },
            {
              node: c2State_cryo_critDMG_disp,
            },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
            },
          ],
        },
        vortex: {
          name: ct.ch('c2VortexCond'),
          fields: [
            {
              node: c2State_stellarswirl_critDMG_disp,
            },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
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
      path: condC4StatePath,
      value: condC4State,
      teamBuff: true,
      name: ct.ch('c1Cond'),
      states: {
        below: {
          name: st('lessPercentHP', {
            percent: dm.constellation4.hpThresh * 100,
          }),
          fields: [
            {
              node: infoMut(c4State_heal_, {
                name: ct.ch('c4HealMult_'),
                unit: '%',
              }),
            },
          ],
        },
        above1: {
          name: ct.ch('c4AboveCond', {
            count: 1,
          }),
          fields: [
            {
              node: c4State_hp_,
            },
            {
              text: stg('duration'),
              value: dm.constellation4.duration,
              unit: 's',
            },
          ],
        },
        above2: {
          name: ct.ch('c4AboveCond', {
            count: 2,
          }),
          fields: [
            {
              node: c4State_hp_,
            },
            {
              text: stg('duration'),
              value: dm.constellation4.duration,
              unit: 's',
            },
          ],
        },
        above3: {
          name: ct.ch('c4AboveCond', {
            count: 3,
          }),
          fields: [
            {
              node: c4State_hp_,
            },
            {
              text: stg('duration'),
              value: dm.constellation4.duration,
              unit: 's',
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
    ct.fieldsTem('constellation6', {
      fields: [
        {
          text: st('talentEnhance.constellation.2'),
        },
      ],
    }),
    ct.condTem('constellation6', {
      path: condSkillSongPath,
      value: condSkillSong,
      teamBuff: true,
      name: ct.ch('skillSongCond'),
      states: {
        on: {
          fields: [
            {
              node: c6Song_hydro_dmg_,
            },
            {
              node: c6Song_cryo_dmg_,
            },
            {
              node: c6Song_stellarswirl_specialDMG_,
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
