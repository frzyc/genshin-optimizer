import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
} from '../dataUtil'
import type { ICharacterSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Kaveh'
const elementKey: ElementKey = 'dendro'

const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]
const ct = charTemplates(key, data_gen.weaponType)

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
    spin: skillParam_gen.auto[a++],
    final: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
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
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    bloom_dmg_: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cd: skillParam_gen.passive1[0][0],
    heal_eleMas: skillParam_gen.passive1[1][0],
  },
  passive2: {
    maxStacks: skillParam_gen.passive2[0][0],
    eleMas: skillParam_gen.passive2[1][0],
  },
  c1: {
    duration: skillParam_gen.constellation1[0],
    dendro_res_: skillParam_gen.constellation1[1],
    incHeal_: skillParam_gen.constellation1[2],
  },
  c2: {
    atkSPD_: skillParam_gen.constellation2[0],
  },
  c4: {
    bloom_dmg_: skillParam_gen.constellation4[0],
  },
  c6: {
    dmg_: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
  },
} as const

const [condAfterBurstPath, condAfterBurst] = cond(key, 'afterBurst')
const afterBurst_infusion = equalStr(condAfterBurst, 'on', constant(elementKey))
const afterBurst_bloom_dmg_ = equal(
  condAfterBurst,
  'on',
  subscript(input.total.burstIndex, dm.burst.bloom_dmg_)
)

const [condA4StacksPath, condA4Stacks] = cond(key, 'a4Stacks')
const a4StacksArr = range(1, dm.passive2.maxStacks)
const a4_eleMas = greaterEq(
  input.asc,
  4,
  equal(
    condAfterBurst,
    'on',
    lookup(
      condA4Stacks,
      objectKeyMap(a4StacksArr, (stack) => prod(stack, dm.passive2.eleMas)),
      naught
    )
  )
)

const [condC1AfterSkillPath, condC1AfterSkill] = cond(key, 'c1AfterSkill')
const c1AfterSkill_dendro_res_ = greaterEq(
  input.constellation,
  1,
  equal(condC1AfterSkill, 'on', percent(dm.c1.dendro_res_))
)
const c1AfterSkill_incHeal_ = greaterEq(
  input.constellation,
  1,
  equal(condC1AfterSkill, 'on', percent(dm.c1.incHeal_))
)

const c2_atkSPD_ = greaterEq(
  input.constellation,
  2,
  equal(condAfterBurst, 'on', dm.c2.atkSPD_)
)

const c4_bloom_dmg_ = greaterEq(input.constellation, 4, dm.c4.bloom_dmg_)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    spin: dmgNode('atk', dm.charged.spin, 'charged'),
    final: dmgNode('atk', dm.charged.final, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  passive1: {
    heal: greaterEq(
      input.asc,
      1,
      customHealNode(prod(percent(dm.passive1.heal_eleMas), input.total.eleMas))
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(prod(percent(dm.c6.dmg_), input.total.atk), 'elemental', {
        hit: { ele: constant(elementKey) },
      })
    ),
  },
} as const

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'sumeru',
  data_gen,
  dmgFormulas,
  {
    premod: {
      burstBoost: burstC3,
      skillBoost: skillC5,
      eleMas: a4_eleMas,
      dendro_res_: c1AfterSkill_dendro_res_,
      incHeal_: c1AfterSkill_incHeal_,
      atkSPD_: c2_atkSPD_,
      bloom_dmg_: c4_bloom_dmg_,
    },
    teamBuff: {
      premod: {
        bloom_dmg_: afterBurst_bloom_dmg_,
      },
    },
    infusion: {
      nonOverridableSelf: afterBurst_infusion,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.rarity,
  elementKey,
  weaponTypeKey: data_gen.weaponType,
  gender: 'M',
  constellationName: ct.chg('constellationName'),
  title: ct.chg('title'),
  talent: {
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
            node: infoMut(dmgFormulas.charged.spin, {
              name: ct.chg(`auto.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.final, {
              name: ct.chg(`auto.skillParams.5`),
            }),
          },
          {
            text: ct.chg('auto.skillParams.6'),
            value: `${dm.charged.stamina}/s`,
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
      ct.condTem('constellation1', {
        value: condC1AfterSkill,
        path: condC1AfterSkillPath,
        name: st('hitOp.skill'),
        states: {
          on: {
            fields: [
              {
                node: c1AfterSkill_dendro_res_,
              },
              {
                node: c1AfterSkill_incHeal_,
              },
              {
                text: stg('duration'),
                value: dm.c1.duration,
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
            node: infoMut(dmgFormulas.burst.dmg, {
              name: ct.chg(`burst.skillParams.0`),
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
      ct.condTem('burst', {
        path: condAfterBurstPath,
        value: condAfterBurst,
        teamBuff: true,
        name: st('afterUse.burst'),
        states: {
          on: {
            fields: [
              {
                text: (
                  <ColorText color="dendro">{st('infusion.dendro')}</ColorText>
                ),
                canShow: (data) => data.get(input.activeCharKey).value === key,
              },
              {
                node: afterBurst_bloom_dmg_,
              },
            ],
          },
        },
      }),
      ct.condTem('passive2', {
        path: condA4StacksPath,
        value: condA4Stacks,
        canShow: equal(condAfterBurst, 'on', 1),
        teamBuff: true, // for nahida
        name: st('hitOp.normalChargedOrPlunging'),
        states: objectKeyMap(a4StacksArr, (stack) => ({
          name: st('stack', { count: stack }),
          fields: [
            {
              node: a4_eleMas,
            },
          ],
        })),
      }),
      ct.headerTem('constellation2', {
        canShow: equal(condAfterBurst, 'on', 1),
        fields: [
          {
            node: c2_atkSPD_,
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      ct.fieldsTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.heal, { name: stg('healing') }),
          },
          {
            text: stg('cd'),
            value: dm.passive1.cd,
            unit: 's',
            fixed: 1,
          },
        ],
      }),
    ]),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      { fields: [{ node: c4_bloom_dmg_ }] },
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.fieldsTem('constellation6', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.dmg, {
              name: ct.ch('c6Dmg'),
            }),
          },
          {
            text: stg('cd'),
            value: dm.c6.cd,
            unit: 's',
          },
        ],
      }),
    ]),
  },
}

export default new CharacterSheet(sheet, data)
