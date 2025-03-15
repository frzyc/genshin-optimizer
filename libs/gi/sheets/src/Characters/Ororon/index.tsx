import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  lookup,
  naught,
  percent,
  prod,
  sum,
  target,
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

const key: CharacterKey = 'Ororon'
const skillParam_gen = allStats.char.skillParam[key]
const ele = allStats.char.data[key].ele!
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
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    activationDmg: skillParam_gen.burst[b++],
    soundwaveDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    nsPoint: skillParam_gen.passive1[0][0],
    dmg: skillParam_gen.passive1[1][0],
    ten: skillParam_gen.passive1[2][0],
    blessingDuration: skillParam_gen.passive1[3][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    energyRegen: skillParam_gen.passive2[1][0],
    selfEnergyRegen: skillParam_gen.passive2[2][0],
    cd: skillParam_gen.passive2[3][0],
    triggerQuota: skillParam_gen.passive2[4][0],
  },
  constellation1: {
    dmg_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  // TODO: Double check this
  constellation2: {
    electro_dmg_base: skillParam_gen.constellation2[0],
    electro_dmg_arr: [
      // Offset by 1 because of how the buff is coded in GO
      skillParam_gen.constellation2[0],
      skillParam_gen.constellation2[1],
      skillParam_gen.constellation2[2],
      skillParam_gen.constellation2[3],
    ],
    duration: skillParam_gen.constellation2[5],
  },
  constellation6: {
    atk_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    stacks: skillParam_gen.constellation6[2],
    dmg: skillParam_gen.constellation6[3],
  },
} as const

const [condC1AfterSkillHitPath, condC1AfterSkillHit] = cond(
  key,
  'c1AfterSkillHit',
)
const c1AfterSkillHit_hypersense_dmg_ = greaterEq(
  input.constellation,
  1,
  greaterEq(
    input.asc,
    1,
    equal(condC1AfterSkillHit, 'on', dm.constellation1.dmg_),
  ),
)

const [condC2SupersensePath, condC2Supersense] = cond(key, 'c2Supersense')
const c2Supersense_electro_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(condC2Supersense, 'on', dm.constellation2.electro_dmg_base),
  { path: 'electro_dmg_' },
)

const c2BurstHitArr = range(1, dm.constellation2.electro_dmg_arr.length)
const [condC2BurstHitStackPath, condC2BurstHitStack] = cond(
  key,
  'c2BurstHitStack',
)
const c2BurstHitStack_electro_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2Supersense,
    'on',
    lookup(
      condC2BurstHitStack,
      objKeyMap(c2BurstHitArr, (stack) =>
        percent(dm.constellation2.electro_dmg_arr[stack - 1]),
      ),
      naught,
    ),
  ),
  { path: 'electro_dmg_' },
)

const c6StacksArr = range(1, dm.constellation6.stacks)
const [condC6StacksPath, condC6Stacks] = cond(key, 'c6Stacks')
const c6Stacks_atk_disp = greaterEq(
  input.constellation,
  6,
  lookup(
    condC6Stacks,
    objKeyMap(c6StacksArr, (stack) =>
      prod(percent(dm.constellation6.atk_), stack),
    ),
    naught,
  ),
  { path: 'atk_', isTeamBuff: true },
)
const c6Stacks_atk_ = equal(
  input.activeCharKey,
  target.charKey,
  c6Stacks_atk_disp,
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')]),
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    fullyAimed: dmgNode('atk', dm.charged.fullyAimed, 'charged', hitEle[ele]),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    activationDmg: dmgNode('atk', dm.burst.activationDmg, 'burst'),
    soundwaveDmg: dmgNode('atk', dm.burst.soundwaveDmg, 'burst'),
  },
  passive1: {
    dmg: greaterEq(
      input.asc,
      1,
      customDmgNode(
        prod(percent(dm.passive1.dmg), input.total.atk),
        'elemental',
        {
          ...hitEle[ele],
          premod: { all_dmg_: c1AfterSkillHit_hypersense_dmg_ },
        },
      ),
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(
          percent(dm.passive1.dmg),
          input.total.atk,
          percent(dm.constellation6.dmg),
        ),
        'elemental',
        {
          ...hitEle[ele],
          premod: { all_dmg_: c1AfterSkillHit_hypersense_dmg_ },
        },
      ),
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: nodeC5,
    burstBoost: nodeC3,
    electro_dmg_: sum(c2Supersense_electro_dmg_, c2BurstHitStack_electro_dmg_),
  },
  teamBuff: {
    premod: {
      atk_: c6Stacks_atk_,
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
          node: infoMut(dmgFormulas.charged.aimed, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.fullyAimed, {
            name: ct.chg(`auto.skillParams.4`),
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
          node: infoMut(dmgFormulas.skill.dmg, {
            name: ct.chg(`skill.skillParams.0`),
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
          node: infoMut(dmgFormulas.burst.activationDmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.soundwaveDmg, {
            name: ct.chg(`burst.skillParams.1`),
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

  passive1: ct.talentTem('passive1', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.dmg, { name: st('dmg') }),
        },
      ],
    },
    ct.condTem('constellation1', {
      path: condC1AfterSkillHitPath,
      value: condC1AfterSkillHit,
      canShow: greaterEq(input.asc, 1, 1),
      name: st('hitOp.skill'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c1AfterSkillHit_hypersense_dmg_, {
                name: ct.ch('hypersense_dmg_'),
                unit: '%',
              }),
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
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2SupersensePath,
      value: condC2Supersense,
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [
            {
              node: c2Supersense_electro_dmg_,
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
    ct.condTem('constellation2', {
      path: condC2BurstHitStackPath,
      value: condC2BurstHitStack,
      name: st('hitOp.burst'),
      canShow: equal(condC2Supersense, 'on', 1),
      states: objKeyMap(c2BurstHitArr, (hit) => ({
        name: st('times', { count: hit }),
        fields: [
          {
            node: c2BurstHitStack_electro_dmg_,
          },
        ],
      })),
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: nodeC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.dmg, { name: st('dmg') }),
        },
      ],
    }),
    ct.condTem('constellation6', {
      path: condC6StacksPath,
      value: condC6Stacks,
      name: ct.ch('c6Cond'),
      teamBuff: true,
      states: objKeyMap(c6StacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: c6Stacks_atk_disp,
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
