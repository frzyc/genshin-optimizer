import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  greaterEq,
  infoMut,
  input,
  lookup,
  naught,
  percent,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Mualani'
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
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    basicDmg: skillParam_gen.skill[s++],
    waveDmgBonus: skillParam_gen.skill[s++],
    surgingDmgBonus: skillParam_gen.skill[s++],
    biteCd: skillParam_gen.skill[s++][0],
    pointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    pointsRegen: skillParam_gen.passive1[0][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    dmg: [
      skillParam_gen.passive2[1][0],
      skillParam_gen.passive2[2][0],
      skillParam_gen.passive2[3][0],
    ],
  },
  passive3: {
    pointReduceNatlan: skillParam_gen.passive3![0][0],
    pointReduceOthers: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    dmgInc: skillParam_gen.constellation1[0],
    pointReduce: skillParam_gen.constellation1[1],
  },
  constellation2: {},
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    shot_dmg_: skillParam_gen.constellation4[1],
  },
} as const

const wave_bite_dmgInc = infoMut(
  prod(
    subscript(input.total.skillIndex, dm.skill.waveDmgBonus, { unit: '%' }),
    input.total.hp
  ),
  { name: ct.ch('bite_dmgInc') }
)
const wave2_bite_dmgInc = prod(2, { ...wave_bite_dmgInc })
const surging_bite_dmgInc = sum(
  prod(3, { ...wave_bite_dmgInc }),
  prod(
    subscript(input.total.skillIndex, dm.skill.surgingDmgBonus, { unit: '%' }),
    input.total.hp
  )
)

const a4StacksArr = range(1, dm.passive2.dmg.length)
const [condA4StacksPath, condA4Stacks] = cond(key, 'a4Stacks')
const a4Stacks = lookup(
  condA4Stacks,
  objKeyMap(a4StacksArr, (stack) => constant(stack)),
  naught
)
const a4Stacks_burst_dmgInc = greaterEq(
  input.asc,
  4,
  prod(
    subscript(a4Stacks, [0, ...dm.passive2.dmg] as number[], { unit: '%' }),
    input.total.hp
  )
)

const c1First_surging_dmgInc = greaterEq(
  input.constellation,
  1,
  prod(percent(dm.constellation1.dmgInc), input.total.hp)
)

const c4_burst_dmg_ = greaterEq(
  input.constellation,
  4,
  dm.constellation4.shot_dmg_
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
    basicDmg: dmgNode(
      'hp',
      dm.skill.basicDmg,
      'normal',
      undefined,
      undefined,
      'skill'
    ),
    stack1Dmg: dmgNode(
      'hp',
      dm.skill.basicDmg,
      'normal',
      {
        premod: { normal_dmgInc: wave_bite_dmgInc },
      },
      undefined,
      'skill'
    ),
    stack2Dmg: dmgNode(
      'hp',
      dm.skill.basicDmg,
      'normal',
      {
        premod: { normal_dmgInc: wave2_bite_dmgInc },
      },
      undefined,
      'skill'
    ),
    surgingDmg: dmgNode(
      'hp',
      dm.skill.basicDmg,
      'normal',
      {
        premod: {
          normal_dmgInc: surging_bite_dmgInc,
        },
      },
      undefined,
      'skill'
    ),
  },
  burst: {
    dmg: dmgNode('hp', dm.burst.dmg, 'burst'),
  },
  passive2: {
    a4Stacks_burst_dmgInc,
  },
  constellation1: {
    surgingDmg: greaterEq(
      input.constellation,
      1,
      dmgNode(
        'hp',
        dm.skill.basicDmg,
        'normal',
        {
          premod: {
            normal_dmgInc: sum(surging_bite_dmgInc, c1First_surging_dmgInc),
          },
        },
        undefined,
        'skill'
      )
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    burstBoost: burstC5,
    skillBoost: skillC3,
    burst_dmgInc: a4Stacks_burst_dmgInc,
    burst_dmg_: c4_burst_dmg_,
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
            name: ct.chg('auto.skillParams.3'),
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
          node: infoMut(dmgFormulas.skill.basicDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.stack1Dmg, {
            name: ct.ch('wave1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.stack2Dmg, {
            name: ct.ch('wave2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.surgingDmg, {
            name: ct.ch('surgingDmg'),
          }),
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.headerTem('constellation1', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation1.surgingDmg, {
            name: ct.ch('c1FirstSurgingDmg'),
          }),
        },
      ],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.dmg, {
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
    ct.condTem('passive2', {
      value: condA4Stacks,
      path: condA4StacksPath,
      name: ct.ch('a4Cond'),
      states: objKeyMap(a4StacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: a4Stacks_burst_dmgInc,
          },
          {
            text: st('triggerQuota'),
            value: 1,
          },
          {
            text: stg('duration'),
            value: dm.passive2.duration,
            unit: 's',
          },
        ],
      })),
    }),
    ct.headerTem('constellation4', {
      fields: [
        {
          node: c4_burst_dmg_,
        },
      ],
    }),
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6'),
}
export default new CharacterSheet(sheet, data)
