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
  min,
  naught,
  percent,
  prod,
  sum,
  tally,
  target,
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
  healNode,
  healNodeTalent,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Chevreuse'
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
    pressDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    ballDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    healBase: skillParam_gen.skill[s++],
    healFlat: skillParam_gen.skill[s++],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    grenadeDmg: skillParam_gen.burst[b++],
    shellDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    pyroElectro_enemyRes_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
    max_atk_: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
  },
  constellation6: {
    triggerLength: skillParam_gen.constellation6[0],
    heal: skillParam_gen.constellation6[1],
    pyroElectro_dmg_: skillParam_gen.constellation6[2],
    duration: skillParam_gen.constellation6[3],
    maxStacks: skillParam_gen.constellation6[4],
  },
} as const

const onlyPyroElectroTeam = greaterEq(tally.electro, 1, equal(tally.ele, 2, 1))
const [condA1AfterOverloadPath, condA1AfterOverload] = cond(
  key,
  'a1AfterOverload'
)
const a1AfterOverload_pyro_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(
    onlyPyroElectroTeam,
    1,
    equal(condA1AfterOverload, 'on', -dm.passive1.pyroElectro_enemyRes_)
  )
)
const a1AfterOverload_electro_enemyRes_ = { ...a1AfterOverload_pyro_enemyRes_ }

const [condA4AfterBallPath, condA4AfterBall] = cond(key, 'a4AfterBall')
// TODO: Check if this is premod or total.
// Should be premod since it's a stat that shows on the char screen.
const a4AfterBall_atk_ = greaterEq(
  input.asc,
  4,
  equal(
    condA4AfterBall,
    'on',
    equal(
      sum(
        equal(target.charEle, 'pyro', 1),
        equal(target.charEle, 'electro', 1)
      ),
      1,
      min(
        prod(
          percent(dm.passive2.atk_),
          infoMut({ ...input.premod.hp }, { pivot: true }),
          1 / 1000
        ),
        percent(dm.passive2.max_atk_)
      )
    )
  )
)

const c6AfterHealStacksArr = range(1, dm.constellation6.maxStacks)
const [condC6AfterHealStacksPath, condC6AfterHealStacks] = cond(
  key,
  'c6AfterHealStacks'
)
const c6AfterHeal_pyro_dmg_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condC6AfterHealStacks,
    objKeyMap(c6AfterHealStacksArr, (stack) =>
      percent(stack * dm.constellation6.pyroElectro_dmg_)
    ),
    naught
  )
)
const c6AfterHeal_electro_dmg_ = { ...c6AfterHeal_pyro_dmg_ }

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
    holdDmg: dmgNode('atk', dm.skill.holdDmg, 'skill'),
    ballDmg: dmgNode('atk', dm.skill.ballDmg, 'skill'),
    heal: healNodeTalent('hp', dm.skill.healBase, dm.skill.healFlat, 'skill'),
    bladeDmg: dmgNode('atk', dm.skill.bladeDmg, 'skill'),
  },
  burst: {
    grenadeDmg: dmgNode('atk', dm.burst.grenadeDmg, 'burst'),
    shellDmg: dmgNode('atk', dm.burst.shellDmg, 'burst'),
  },
  passive2: {
    a4AfterBall_atk_,
  },
  constellation2: {
    dmg: greaterEq(
      input.constellation,
      2,
      customDmgNode(
        prod(percent(dm.constellation2.dmg), input.total.atk),
        'skill',
        { hit: { ele: constant('pyro') } }
      )
    ),
  },
  constellation6: {
    heal: greaterEq(
      input.constellation,
      6,
      healNode('hp', dm.constellation6.heal, 0)
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
  },
  teamBuff: {
    premod: {
      pyro_enemyRes_: a1AfterOverload_pyro_enemyRes_,
      electro_enemyRes_: a1AfterOverload_electro_enemyRes_,
      pyro_dmg_: c6AfterHeal_pyro_dmg_,
      electro_dmg_: c6AfterHeal_electro_dmg_,
      atk_: a4AfterBall_atk_,
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
          name: ct.chg(`auto.skillParams.${i > 2 ? i - 1 : i}`),
          textSuffix: i === 2 || i === 3 ? `(${i - 1})` : undefined,
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
          node: infoMut(dmgFormulas.skill.pressDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.holdDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.ballDmg, {
            name: ct.chg('skill.skillParams.2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.heal, {
            name: ct.chg('skill.skillParams.3'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.duration,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.bladeDmg, {
            name: ct.chg('skill.skillParams.5'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.6'),
          value: dm.skill.bladeInterval,
          unit: 's',
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
    ct.condTem('passive2', {
      value: condA4AfterBall,
      path: condA4AfterBallPath,
      teamBuff: true,
      // Pando TODO: target and input here both refer to the character the conditional belongs to in teambuffs tab, so this doesn't work
      // canShow: sum(
      //   equal(input.charEle, 'pyro', 1),
      //   equal(input.charEle, 'electro', 1)
      // ),
      name: ct.ch('a4CondName'),
      states: {
        on: {
          fields: [
            {
              node: a4AfterBall_atk_,
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
    ct.condTem('constellation6', {
      value: condC6AfterHealStacks,
      path: condC6AfterHealStacksPath,
      teamBuff: true,
      name: ct.ch('c6CondName'),
      states: objKeyMap(c6AfterHealStacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: c6AfterHeal_pyro_dmg_,
          },
          {
            node: c6AfterHeal_electro_dmg_,
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

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.grenadeDmg, {
            name: ct.chg('burst.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.shellDmg, {
            name: ct.chg('burst.skillParams.1'),
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
  ]),

  passive1: ct.talentTem('passive1', [
    ct.fieldsTem('passive1', {
      teamBuff: true,
      canShow: unequal(onlyPyroElectroTeam, 1, 1),
      fields: [
        {
          text: ct.ch('notPyroElectroTeam'),
        },
      ],
    }),
    ct.condTem('passive1', {
      value: condA1AfterOverload,
      path: condA1AfterOverloadPath,
      teamBuff: true,
      canShow: onlyPyroElectroTeam,
      name: st('reactionOp.overload'),
      states: {
        on: {
          fields: [
            {
              node: a1AfterOverload_pyro_enemyRes_,
            },
            {
              node: a1AfterOverload_electro_enemyRes_,
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
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.fieldsTem('constellation2', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation2.dmg, { name: st('dmg') }),
        },
        {
          text: stg('cd'),
          value: dm.constellation2.cd,
          unit: 's',
        },
      ],
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
          node: infoMut(dmgFormulas.constellation6.heal, {
            name: stg('healing'),
          }),
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
