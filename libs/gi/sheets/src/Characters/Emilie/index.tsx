import { ColorText } from '@genshin-optimizer/common/ui'
import { type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  infoMut,
  input,
  min,
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

const key: CharacterKey = 'Emilie'
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
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    level1Dmg: skillParam_gen.skill[s++],
    level2Dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    thornDmg: skillParam_gen.skill[s++],
    thornInterval: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    level3Dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
  },
  passive2: {
    burn_dmg_: skillParam_gen.passive2[0][0],
    max_burn_dmg_: skillParam_gen.passive2[1][0],
  },
  passive3: {
    burn_res_: skillParam_gen.passive3![0][0],
  },
  constellation1: {
    triggerInterval: skillParam_gen.constellation1[0],
    dmg_: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dendro_enemyRes_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[0],
    triggerIntervalReduce: skillParam_gen.constellation4[1],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    maxTriggers: skillParam_gen.constellation6[1],
    dmg: skillParam_gen.constellation6[2],
    cd: skillParam_gen.constellation6[3],
  },
} as const

const [condA4BurningPath, condA4Burning] = cond(key, 'a4Burning')
const a4_dmg_ = greaterEq(
  input.asc,
  4,
  equal(
    condA4Burning,
    'on',
    min(
      prod(input.total.atk, 1 / 1000, percent(dm.passive2.burn_dmg_)),
      percent(dm.passive2.max_burn_dmg_),
    ),
  ),
)

const c1_skill_dmg_ = greaterEq(input.constellation, 1, dm.constellation1.dmg_)
const c1_a1_dmg_ = greaterEq(
  input.constellation,
  1,
  greaterEq(input.asc, 1, dm.constellation1.dmg_),
)

const [condC2HitPath, condC2Hit] = cond(key, 'c2Hit')
const c2Hit_dendro_enemyRes_ = greaterEq(
  input.constellation,
  2,
  equal(condC2Hit, 'on', percent(-dm.constellation2.dendro_enemyRes_)),
)

const [condC6FragrancePath, condC6Fragrance] = cond(key, 'c6Fragrance')
const c6_infusion = greaterEqStr(
  input.constellation,
  6,
  equalStr(condC6Fragrance, 'on', 'dendro'),
)
const c6_normal_dmgInc = greaterEq(
  input.constellation,
  6,
  equal(
    condC6Fragrance,
    'on',
    prod(percent(dm.constellation6.dmg), input.total.atk),
  ),
)
const c6_charged_dmgInc = { ...c6_normal_dmgInc }

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')]),
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
    level1Dmg: dmgNode('atk', dm.skill.level1Dmg, 'skill'),
    level2Dmg: dmgNode('atk', dm.skill.level2Dmg, 'skill'),
    thornDmg: dmgNode('atk', dm.skill.thornDmg, 'skill'),
  },
  burst: {
    level3Dmg: dmgNode('atk', dm.burst.level3Dmg, 'burst'),
  },
  passive1: {
    dmg: greaterEq(
      input.asc,
      1,
      customDmgNode(
        prod(percent(dm.passive1.dmg), input.total.atk),
        'elemental',
        { hit: { ele: constant('dendro') }, premod: { all_dmg_: c1_a1_dmg_ } },
      ),
    ),
  },
  passive2: {
    a4_dmg_,
  },
  constellation6: {
    c6_normal_dmgInc,
    c6_charged_dmgInc,
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC3,
    burstBoost: burstC5,
    normal_dmgInc: c6_normal_dmgInc,
    charged_dmgInc: c6_charged_dmgInc,
    all_dmg_: a4_dmg_,
    skill_dmg_: c1_skill_dmg_,
  },
  teamBuff: {
    premod: {
      dendro_enemyRes_: c2Hit_dendro_enemyRes_,
    },
  },
  infusion: {
    nonOverridableSelf: c6_infusion,
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
            name: ct.chg(`auto.skillParams.4`),
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
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.level1Dmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.level2Dmg, {
            name: ct.chg(`skill.skillParams.2`),
            multi: 2,
          }),
        },
        {
          text: ct.chg('skill.skillParams.3'),
          value: dm.skill.duration,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.thornDmg, {
            name: ct.chg(`skill.skillParams.4`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.5'),
          value: dm.skill.thornInterval,
          unit: 's',
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
          node: c1_skill_dmg_,
        },
      ],
    }),
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.level3Dmg, {
            name: ct.chg(`burst.skillParams.0`),
          }),
        },
        {
          text: ct.chg('burst.skillParams.1'),
          value: (data: UIData) =>
            data.get(input.constellation).value >= 4
              ? `${dm.burst.duration}s + ${dm.constellation4.durationInc}s = ${
                  dm.burst.duration + dm.constellation4.durationInc
                }`
              : dm.burst.duration,
          unit: 's',
          fixed: 1,
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
          text: st('durationInc'),
          value: dm.constellation4.durationInc,
          unit: 's',
        },
      ],
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.fieldsTem('passive1', {
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.dmg, { name: st('dmg') }),
        },
      ],
    }),
    ct.headerTem('constellation1', {
      canShow: greaterEq(input.asc, 1, 1),
      fields: [
        {
          node: infoMut(c1_a1_dmg_, { name: ct.ch('a1_dmg_'), unit: '%' }),
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4BurningPath,
      value: condA4Burning,
      name: st('enemyState.burning'),
      states: {
        on: {
          fields: [
            {
              node: a4_dmg_,
            },
          ],
        },
      },
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2HitPath,
      value: condC2Hit,
      name: ct.ch('c2Cond'),
      teamBuff: true,
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
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: burstC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      path: condC6FragrancePath,
      value: condC6Fragrance,
      name: ct.ch('c6Cond'),
      states: {
        on: {
          fields: [
            {
              text: (
                <ColorText color="dendro">{st('infusion.dendro')}</ColorText>
              ),
            },
            {
              node: c6_normal_dmgInc,
            },
            {
              node: c6_charged_dmgInc,
            },
            {
              text: st('triggerQuota'),
              value: dm.constellation6.maxTriggers,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.duration,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: dm.constellation6.cd,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
