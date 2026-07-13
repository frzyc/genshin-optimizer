import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { NumNode } from '@genshin-optimizer/gi/wr'
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
  sum,
  tally,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  hitEle,
  plungingDmgNodes,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Lohen'
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3x3
      skillParam_gen.auto[++a], // 4
      skillParam_gen.auto[++a], // 5.1
      skillParam_gen.auto[++a], // 5.2
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    hitArr: [
      skillParam_gen.skill[s++], // 1
      skillParam_gen.skill[s++], // 2
      skillParam_gen.skill[s++], // 3x3
      skillParam_gen.skill[s++], // 4
      skillParam_gen.skill[s++], // 5.1
      skillParam_gen.skill[s++], // 5.2
    ],
    ca: skillParam_gen.skill[s++],
    castam: skillParam_gen.skill[s++][0],
    plunging: {
      dmg: skillParam_gen.skill[s++],
      low: skillParam_gen.skill[s++],
      high: skillParam_gen.skill[s++],
    },
    msDuration: skillParam_gen.skill[s++][0],
    joyGain1: skillParam_gen.skill[s++][0],
    joyGain2: skillParam_gen.skill[s++][0],
    baseAtkThresh: skillParam_gen.skill[s++][0],
    willGain: skillParam_gen.skill[s++][0],
    etchDmg: skillParam_gen.skill[s++],
    willEtchMult: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    maxWill: 100,
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    willDmgMult: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmgLimit: skillParam_gen.passive1[0][0],
    willGain: skillParam_gen.passive1[1][0],
  },
  passive2: {
    teammateAtk_: skillParam_gen.passive2[0][0],
    selfAtk_: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  passive3: {
    duration: skillParam_gen.passive3![0][0],
    durationInc: skillParam_gen.passive3![1][0],
    cd: skillParam_gen.passive3![2][0],
  },
  lockedPassive: {
    willThresh: skillParam_gen.lockedPassive![0][0],
    normalCharged_dmg_: skillParam_gen.lockedPassive![1][0],
    duration: skillParam_gen.lockedPassive![2][0],
  },
  constellation1: {
    addlWillGain: skillParam_gen.constellation1[0],
    addlWillLimit: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
    eleMas: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
    cd: skillParam_gen.constellation2[3],
  },
  constellation4: {
    energyRegen1: skillParam_gen.constellation4[0],
    energyRegen2: skillParam_gen.constellation4[1],
  },
  constellation6: {
    cd: skillParam_gen.constellation6[0],
    critDmg_: skillParam_gen.constellation6[1],
  },
} as const

const [condLockHomeworkPath, condLockHomework] = cond(key, 'lockHomework')
const lockHomework_hexerei = equal(condLockHomework, 'on', 1)

const [condWillConsumedPath, condWillConsumed] = cond(key, 'willConsumed')
const willConsumedArr = range(20, dm.skill.maxWill, 20)
const c1WillConsumedArr = range(
  20,
  dm.skill.maxWill * (1 + dm.constellation1.addlWillLimit),
  20
)
const willConsumed = lookup(
  condWillConsumed,
  objKeyMap(c1WillConsumedArr, (will) => {
    if (will <= dm.skill.maxWill) return constant(will)
    else return greaterEq(input.constellation, 1, will)
  }),
  naught
)

const willConsumed_etch_mult_ = sum(
  one,
  prod(percent(dm.skill.willEtchMult), willConsumed)
)
const willConsumed_burst_mult_ = sum(
  one,
  prod(percent(dm.burst.willDmgMult), willConsumed)
)

const [condA4MasterCryoPath, condA4MasterCryo] = cond(key, 'a4MasterCryo')
const a4MasterCryo_team_atk_disp = greaterEq(
  input.asc,
  4,
  equal(condA4MasterCryo, 'on', dm.passive2.teammateAtk_)
)
const a4MasterCryo_team_atk_ = unequal(
  target.charKey,
  key,
  a4MasterCryo_team_atk_disp
)
const a4MasterCryo_self_atk_ = greaterEq(
  input.asc,
  4,
  equal(condA4MasterCryo, 'on', dm.passive2.selfAtk_)
)

const [condA0HighSpiritsPath, condA0HighSpirits] = cond(key, 'a0HighSpirits')
const a0HighSpirits_skillBoost = equal(condA0HighSpirits, 'on', 1)

const [condLockBuffPath, condLockBuff] = cond(key, 'lockBuff')
const lockBuff_normal_dmg_ = equal(
  condLockHomework,
  'on',
  greaterEq(
    tally.hexerei,
    2,
    equal(condLockBuff, 'on', dm.lockedPassive.normalCharged_dmg_)
  )
)
const lockBuff_charged_dmg_ = { ...lockBuff_normal_dmg_ }

const [condC2BladePath, condC2Blade] = cond(key, 'c2Blade')
const c2Blade_eleMasDisp = greaterEq(
  input.constellation,
  2,
  equal(condC2Blade, 'on', dm.constellation2.eleMas)
)
const c2Blade_eleMas = unequal(target.charKey, key, c2Blade_eleMasDisp)

const c6Etch_critDMG_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.critDmg_
)
const [condC6BurstMasterPath, condC6BurstMaster] = cond(key, 'c6BurstMaster')
const c6BurstMaster_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condC6BurstMaster, 'on', dm.constellation6.critDmg_)
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
    ...(Object.fromEntries(
      dm.skill.hitArr.map((arr, i) => [
        i,
        dmgNode('atk', arr, 'normal', hitEle.cryo, undefined, 'skill'),
      ])
    ) as Record<0 | 1 | 2 | 3 | 4 | 5, NumNode>),
    chargedDmg: dmgNode(
      'atk',
      dm.skill.ca,
      'charged',
      hitEle.cryo,
      undefined,
      'skill'
    ),
    ...plungingDmgNodes(
      'atk',
      dm.skill.plunging,
      hitEle.cryo,
      undefined,
      'skill'
    ),
    etchDmg: dmgNode(
      'atk',
      dm.skill.etchDmg,
      'skill',
      {
        premod: {
          critDMG_: c6Etch_critDMG_,
        },
      },
      willConsumed_etch_mult_
    ),
  },
  burst: {
    burstDmg: dmgNode(
      'atk',
      dm.burst.skillDmg,
      'burst',
      undefined,
      willConsumed_burst_mult_
    ),
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      customDmgNode(
        prod(input.total.atk, percent(dm.constellation2.dmg)),
        'elemental',
        hitEle.cryo
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
      atk_: a4MasterCryo_self_atk_,
      normal_dmg_: lockBuff_normal_dmg_,
      charged_dmg_: lockBuff_charged_dmg_,
      burst_critDMG_: c6BurstMaster_critDMG_,
    },
    teamBuff: {
      premod: {
        atk_: a4MasterCryo_team_atk_,
        eleMas: c2Blade_eleMas,
      },
    },
    flags: { isHexerei: lockHomework_hexerei },
  },
  {
    premod: {
      skillBoost: a0HighSpirits_skillBoost,
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
          name: ct.chg(`auto.skillParams.${i > 4 ? i - 1 : i}`),
          multi: i === 2 ? 3 : undefined,
          textSuffix: i >= 4 ? `(${i - 3})` : undefined,
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
            multi: 2,
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
        ...dm.skill.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.skill[i as 1 | 2 | 3 | 4 | 5], {
            name: ct.chg(`skill.skillParams.${i > 4 ? i - 1 : i}`),
            multi: i === 2 ? 3 : undefined,
            textSuffix: i >= 4 ? `(${i - 3})` : undefined,
          }),
        })),
        {
          node: infoMut(dmgFormulas.skill.chargedDmg, {
            name: ct.chg(`skill.skillParams.5`),
            multi: 2,
          }),
        },
        {
          text: ct.chg('skill.skillParams.6'),
          value: dm.charged.stam,
        },
        {
          node: infoMut(dmgFormulas.skill.dmg, {
            name: stg('plunging.dmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.low, {
            name: stg('plunging.low'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.high, {
            name: stg('plunging.high'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.9'),
          value: dm.skill.msDuration,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.etchDmg, {
            name: ct.chg('skill.skillParams.10'),
          }),
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('skill', {
      path: condWillConsumedPath,
      value: condWillConsumed,
      name: ct.ch('willConsumed'),
      states: (data) =>
        objKeyMap(
          data.get(input.constellation).value < 1
            ? willConsumedArr
            : c1WillConsumedArr,
          (will) => ({
            name: `${will}`,
            fields: [
              {
                node: infoMut(willConsumed_etch_mult_, {
                  name: ct.chg('skill.skillParams.11'),
                }),
              },
            ],
          })
        ),
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.burstDmg, {
            name: ct.chg(`burst.skillParams.0`),
            multi: 6,
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
    ct.condTem('burst', {
      path: condWillConsumedPath,
      value: condWillConsumed,
      name: ct.ch('willConsumed'),
      states: (data) =>
        objKeyMap(
          data.get(input.constellation).value < 1
            ? willConsumedArr
            : c1WillConsumedArr,
          (will) => ({
            name: `${will}`,
            fields: [
              {
                node: infoMut(willConsumed_burst_mult_, {
                  name: ct.chg('burst.skillParams.1'),
                }),
              },
            ],
          })
        ),
    }),
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4MasterCryoPath,
      value: condA4MasterCryo,
      name: ct.ch('a4Cond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: infoMut(a4MasterCryo_team_atk_disp, {
                path: 'atk_',
                isTeamBuff: true,
              }),
            },
            {
              node: a4MasterCryo_self_atk_,
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
  passive3: ct.talentTem('passive3', [
    ct.condTem('passive3', {
      path: condA0HighSpiritsPath,
      value: condA0HighSpirits,
      name: ct.ch('a0Cond'),
      states: {
        on: {
          fields: [
            {
              node: a0HighSpirits_skillBoost,
            },
          ],
        },
      },
    }),
  ]),
  lockedPassive: ct.talentTem('lockedPassive', [
    ct.condTem('lockedPassive', {
      path: condLockHomeworkPath,
      value: condLockHomework,
      teamBuff: true,
      name: st('hexerei.homeworkDone'),
      states: {
        on: {
          fields: [
            {
              text: st('hexerei.becomeHexerei', {
                val: `$t(charNames_gen:${key})`,
              }),
            },
            {
              text: st('hexerei.talentEnhance'),
            },
          ],
        },
      },
    }),
    ct.condTem('lockedPassive', {
      path: condLockBuffPath,
      value: condLockBuff,
      canShow: equal(condLockHomework, 'on', greaterEq(tally.hexerei, 2, 1)),
      name: ct.ch('lockBuffCond'),
      states: {
        on: {
          fields: [
            {
              node: lockBuff_normal_dmg_,
            },
            {
              node: lockBuff_charged_dmg_,
            },
            {
              text: stg('duration'),
              value: dm.lockedPassive.duration,
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
          text: ct.ch('c1Text'),
          value: dm.constellation1.addlWillLimit * 100,
          unit: '%',
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.dmg, { name: st('dmg') }),
        },
      ],
    }),
    ct.condTem('constellation2', {
      path: condC2BladePath,
      value: condC2Blade,
      name: ct.ch('c2Cond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: infoMut(c2Blade_eleMasDisp, {
                path: 'eleMas',
                isTeamBuff: true,
              }),
            },
            {
              text: stg('duration'),
              value: dm.constellation2.duration,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: dm.constellation2.cd,
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
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(c6Etch_critDMG_, {
            name: ct.ch('etch_critDMG_'),
            unit: '%',
          }),
        },
      ],
    }),
    ct.condTem('constellation6', {
      path: condC6BurstMasterPath,
      value: condC6BurstMaster,
      name: ct.ch('c6Cond'),
      states: {
        on: {
          fields: [
            {
              node: c6BurstMaster_critDMG_,
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
