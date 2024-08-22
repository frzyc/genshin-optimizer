import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  naught,
  percent,
  prod,
  subscript,
  sum,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Mika'
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
      skillParam_gen.auto[++a], // 3
      skillParam_gen.auto[++a], // 4x2
      skillParam_gen.auto[(a += 2)], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stamina: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    arrowDmg: skillParam_gen.skill[s++],
    flareDmg: skillParam_gen.skill[s++],
    shardDmg: skillParam_gen.skill[s++],
    atkSPD_: skillParam_gen.skill[s++],
    soulwindDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    castHealBase: skillParam_gen.burst[b++],
    castHealHp: skillParam_gen.burst[b++],
    plumeHealBase: skillParam_gen.burst[b++],
    plumeHealHp: skillParam_gen.burst[b++],
    plumeInterval: skillParam_gen.burst[b++][0],
    plumeDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    physical_dmg_: skillParam_gen.passive1[0][0],
    maxStacks: skillParam_gen.passive1[1][0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    energyRegenProcs: skillParam_gen.constellation4[1],
  },
  constellation6: {
    physical_critDMG_: skillParam_gen.constellation6[0],
    extraStacks: skillParam_gen.constellation6[1],
  },
} as const

const [condInSoulwindPath, condInSoulwind] = cond(key, 'inSoulwind')
const skillInSoulwind_atkSPD_disp = equal(
  condInSoulwind,
  'on',
  subscript(input.total.skillIndex, dm.skill.atkSPD_, {
    path: 'atkSPD_',
    isTeamBuff: true,
  })
)
const skillInSoulwind_atkSPD_ = equal(
  input.activeCharKey,
  target.charKey,
  skillInSoulwind_atkSPD_disp
)

const [condA1DetectorStacksPath, condA1DetectorStacks] = cond(
  key,
  'a1DetectorStacks'
)
const detectorStacksArr = range(1, 5)
const a1DetectorStacks_physical_dmg_disp = greaterEq(
  input.asc,
  1,
  equal(
    condInSoulwind,
    'on',
    lookup(
      condA1DetectorStacks,
      objKeyMap(detectorStacksArr, (stack) => {
        const totalPhysical_dmg_ = prod(
          stack,
          percent(dm.passive1.physical_dmg_)
        )
        // Check for A4 or C6
        if (stack === 4) {
          return greaterEq(
            sum(
              greaterEq(input.constellation, 6, 1),
              greaterEq(input.asc, 4, 1)
            ),
            1,
            totalPhysical_dmg_
          )
        }
        // Check for both A4 and C6
        else if (stack === 5) {
          return greaterEq(
            input.constellation,
            6,
            greaterEq(input.asc, 4, totalPhysical_dmg_)
          )
        }
        return totalPhysical_dmg_
      }),
      naught,
      { path: 'physical_dmg_', isTeamBuff: true }
    )
  )
)
const a1DetectorStacks_physical_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  a1DetectorStacks_physical_dmg_disp
)
const [condC6CritPath, condC6Crit] = cond(key, 'c6Crit')
const c6InSoulwind_physical_critDMG_disp = greaterEq(
  input.constellation,
  6,
  equal(
    condInSoulwind,
    'on',
    equal(condC6Crit, 'on', dm.constellation6.physical_critDMG_, {
      path: 'physical_critDMG_',
      isTeamBuff: true,
    })
  )
)
const c6InSoulwind_physical_critDMG_ = equal(
  input.activeCharKey,
  target.charKey,
  c6InSoulwind_physical_critDMG_disp
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
    arrowDmg: dmgNode('atk', dm.skill.arrowDmg, 'skill'),
    flareDmg: dmgNode('atk', dm.skill.flareDmg, 'skill'),
    shardDmg: dmgNode('atk', dm.skill.shardDmg, 'skill'),
  },
  burst: {
    castHeal: healNodeTalent(
      'hp',
      dm.burst.castHealHp,
      dm.burst.castHealBase,
      'burst'
    ),
    plumeHeal: healNodeTalent(
      'hp',
      dm.burst.plumeHealHp,
      dm.burst.plumeHealBase,
      'burst'
    ),
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC3,
    skillBoost: skillC5,
  },
  teamBuff: {
    premod: {
      atkSPD_: skillInSoulwind_atkSPD_,
      physical_dmg_: a1DetectorStacks_physical_dmg_,
      physical_critDMG_: c6InSoulwind_physical_critDMG_,
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
          value: dm.charged.stamina,
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
          node: infoMut(dmgFormulas.skill.arrowDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.flareDmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.shardDmg, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.soulwindDuration,
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
      path: condInSoulwindPath,
      value: condInSoulwind,
      teamBuff: true,
      name: ct.ch('inSoulwind'),
      states: {
        on: {
          fields: [
            {
              node: skillInSoulwind_atkSPD_disp,
            },
          ],
        },
      },
    }),
    ct.condTem('passive1', {
      path: condA1DetectorStacksPath,
      value: condA1DetectorStacks,
      teamBuff: true,
      canShow: equal(condInSoulwind, 'on', 1),
      name: ct.ch('numDetectorStacks'),
      states: (data) => {
        const isC6 = data.get(input.constellation).value === 6
        const isA4 = data.get(input.asc).value >= 4
        const maxStacks =
          dm.passive1.maxStacks + (isA4 ? 1 : 0) + (isC6 ? 1 : 0)
        return objKeyMap(range(1, maxStacks), (stack) => ({
          name: st('stack', { count: stack }),
          fields: [
            {
              node: a1DetectorStacks_physical_dmg_disp,
            },
          ],
        }))
      },
    }),
    ct.condTem('constellation6', {
      teamBuff: true,
      canShow: equal(condInSoulwind, 'on', 1),
      path: condC6CritPath,
      value: condC6Crit,
      name: ct.ch('inSoulwind'),
      states: {
        on: {
          fields: [
            {
              node: c6InSoulwind_physical_critDMG_disp,
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation6', {
      fields: [
        {
          text: ct.ch('incDetectorStacks'),
          value: dm.constellation6.extraStacks,
        },
      ],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.castHeal, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.plumeHeal, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
          value: (data: UIData) =>
            data.get(input.constellation).value >= 1 &&
            data.get(condInSoulwind).value === 'on' &&
            data.get(input.activeCharKey).value ===
              data.get(target.charKey).value
              ? `${dm.burst.plumeInterval}s - ${
                  data.get(skillInSoulwind_atkSPD_disp).value * 100
                }% = ${(
                  dm.burst.plumeInterval *
                  (1 - data.get(skillInSoulwind_atkSPD_disp).value)
                ).toFixed(2)}`
              : dm.burst.plumeInterval,
          unit: 's',
          fixed: 1,
        },
        {
          text: ct.chg('burst.skillParams.3'),
          value: dm.burst.plumeDuration,
          unit: 's',
        },
        {
          text: stg('cd'),
          value: dm.burst.cd,
          unit: 's',
        },
        {
          text: stg('energyCost'),
          value: dm.burst.energyCost,
        },
      ],
    },
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
