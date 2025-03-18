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
  naught,
  percent,
  prod,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Kinich'
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
      skillParam_gen.auto[a++], // mid-air
    ],
  },
  charged: {
    stam: skillParam_gen.auto[a++][0],
    dmg: skillParam_gen.auto[a++], // x4
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    shotDmg: skillParam_gen.skill[s++],
    cannonDmg: skillParam_gen.skill[s++],
    pointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    laserDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    pointGain: skillParam_gen.passive1[0][0],
    cd: skillParam_gen.passive1[1][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    dmgPerStack: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    moveSPD_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    cannon_critDMG_: skillParam_gen.constellation1[2],
  },
  constellation2: {
    dendro_enemyRes_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    cannon_dmg_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
    burst_dmg_: skillParam_gen.constellation4[2],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
  },
} as const

const a4StacksArr = range(1, 2)
const [condA4StacksPath, condA4Stacks] = cond(key, 'a4Stacks')
const a4Stacks = lookup(
  condA4Stacks,
  objKeyMap(a4StacksArr, (stack) => constant(stack)),
  naught
)
const a4Stacks_cannon_dmgInc = greaterEq(
  input.asc,
  4,
  prod(a4Stacks, percent(dm.passive2.dmgPerStack), input.total.atk)
)

const c1Cannon_critDMG_ = greaterEq(
  input.constellation,
  1,
  dm.constellation1.cannon_critDMG_
)

const [condC2HitPath, condC2Hit] = cond(key, 'c2Hit')
const c2Hit_dendro_enemyRes_ = greaterEq(
  input.constellation,
  2,
  equal(condC2Hit, 'on', -dm.constellation2.dendro_enemyRes_)
)

const [condC2FirstHitPath, condC2FirstHit] = cond(key, 'c2FirstHit')
const c2FirstHit_cannon_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(condC2FirstHit, 'on', dm.constellation2.cannon_dmg_)
)

const c4_burst_dmg_ = greaterEq(
  input.constellation,
  4,
  dm.constellation4.burst_dmg_
)

const cannonAddl = {
  premod: {
    skill_dmgInc: a4Stacks_cannon_dmgInc,
    skill_critDMG_: c1Cannon_critDMG_,
    skill_dmg_: c2FirstHit_cannon_dmg_,
  },
}
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
    shotDmg: dmgNode('atk', dm.skill.shotDmg, 'skill'),
    cannonDmg: dmgNode('atk', dm.skill.cannonDmg, 'skill', cannonAddl),
  },
  burst: {
    skillDmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    laserDmg: dmgNode('atk', dm.burst.laserDmg, 'burst'),
  },
  passive2: {
    a4Stacks_cannon_dmgInc,
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'skill',
        {
          hit: { ele: constant('dendro') },
          ...cannonAddl,
        }
      )
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    burst_dmg_: c4_burst_dmg_,
  },
  teamBuff: {
    premod: {
      dendro_enemyRes_: c2Hit_dendro_enemyRes_,
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
            multi: 3,
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
          node: infoMut(dmgFormulas.skill.shotDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.cannonDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: dm.skill.pointLimit,
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
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
            node: infoMut(a4Stacks_cannon_dmgInc, {
              name: ct.ch('cannon_dmgInc'),
            }),
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
    ct.headerTem('constellation1', {
      fields: [
        {
          node: infoMut(c1Cannon_critDMG_, {
            name: ct.ch('cannon_critDMG_'),
            unit: '%',
          }),
        },
      ],
    }),
    ct.headerTem('constellation2', {
      path: condC2HitPath,
      value: condC2Hit,
      teamBuff: true,
      name: st('hitOp.skill'),
      states: {
        on: {
          fields: [
            {
              node: c2Hit_dendro_enemyRes_,
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
      path: condC2FirstHitPath,
      value: condC2FirstHit,
      name: ct.ch('c2Cond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c2FirstHit_cannon_dmg_, {
                name: ct.ch('cannon_dmg_'),
                unit: '%',
              }),
            },
          ],
        },
      },
    }),
    ct.headerTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.dmg, { name: st('dmg') }),
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
          node: infoMut(dmgFormulas.burst.laserDmg, {
            name: ct.chg('burst.skillParams.1'),
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
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
    ct.headerTem('constellation4', {
      fields: [
        {
          node: c4_burst_dmg_,
        },
      ],
    }),
  ]),

  passive: ct.talentTem('passive'),
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
