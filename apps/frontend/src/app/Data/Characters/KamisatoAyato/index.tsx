import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'KamisatoAyato'
const elementKey: ElementKey = 'hydro'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++], // 1
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmgArr: [
      skillParam_gen.skill[s++],
      skillParam_gen.skill[s++],
      skillParam_gen.skill[s++],
    ],
    stateDuration: skillParam_gen.skill[s++][0],
    stackHpDmgInc: skillParam_gen.skill[s++],
    maxStacks: 4,
    illusionDmg: skillParam_gen.skill[s++],
    illusionDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    normal_dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stacksGained: skillParam_gen.passive1[0][0],
  },
  passive2: {
    enerThres_: skillParam_gen.passive2[0][0],
    cd: skillParam_gen.passive2[1][0],
    energyRestore: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    oppHpThres_: skillParam_gen.constellation1[0],
    shunDmg_: skillParam_gen.constellation1[1],
  },
  constellation2: {
    extraStacks: skillParam_gen.constellation2[0],
    stackThresh: 3,
    hp_: skillParam_gen.constellation2[1],
  },
  constellation4: {
    atkSPD: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    extraStrikes: 2,
    dmg: skillParam_gen.constellation6[0],
  },
} as const

const [condInSkillPath, condInSkill] = cond(key, 'inSkill')

const [condSkillStacksPath, condSkillStacks] = cond(key, 'skillStacks')
const skillStacks_dmgInc = equal(
  condInSkill,
  'on',
  lookup(
    condSkillStacks,
    Object.fromEntries(
      range(1, 5).map((stacks) => [
        stacks,
        prod(
          stacks,
          subscript(input.total.skillIndex, dm.skill.stackHpDmgInc, {
            unit: '%',
          }),
          input.total.hp
        ),
      ])
    ),
    naught
  )
)

const [condBurstInAreaPath, condBurstInArea] = cond(key, 'burstInArea')
const burst_normal_dmg_Disp = equal(
  condBurstInArea,
  'on',
  subscript(input.total.burstIndex, dm.burst.normal_dmg_)
)
const burst_normal_dmg_ = equal(
  input.activeCharKey,
  target.charKey,
  burst_normal_dmg_Disp
)

const [condC1OppHpPath, condC1OppHp] = cond(key, 'c1OppHp')
const c1Shun_dmg_ = greaterEq(
  input.constellation,
  1,
  equal(condC1OppHp, 'on', dm.constellation1.shunDmg_)
)

// Not sure what "Max HP increased by 50%" means
const c2_hp_ = greaterEq(
  input.constellation,
  2,
  equal(
    condInSkill,
    'on',
    lookup(
      condSkillStacks,
      Object.fromEntries(
        range(dm.constellation2.stackThresh, 5).map((stacks) => [
          stacks,
          percent(dm.constellation2.hp_),
        ])
      ),
      naught
    )
  )
)

const [condC4AfterBurstPath, condC4AfterBurst] = cond(key, 'c4AfterBurst')
const c4_atkSPD_ = greaterEq(
  input.constellation,
  4,
  equal(condC4AfterBurst, 'on', dm.constellation4.atkSPD)
)

const shunAddl: Data = {
  hit: {
    ele: constant(elementKey),
  },
  premod: {
    normal_dmgInc: skillStacks_dmgInc,
    normal_dmg_: c1Shun_dmg_,
  },
}

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    ...Object.fromEntries(
      dm.skill.dmgArr.map((arr, i) => [
        `dmg${i}`,
        equal(
          condInSkill,
          'on',
          customDmgNode(
            prod(
              subscript(input.total.skillIndex, arr, { unit: '%' }),
              input.total.atk
            ),
            'normal',
            shunAddl
          )
        ),
      ])
    ),
    illusionDmg: dmgNode('atk', dm.skill.illusionDmg, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
  },
  constellation6: {
    // Not sure if this benefits from C1 or not
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'normal',
        {
          hit: { ele: constant(elementKey) },
          premod: { normal_dmg_: c1Shun_dmg_ },
        }
      )
    ),
  },
}
const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'inazuma',
  data_gen,
  dmgFormulas,
  {
    teamBuff: {
      premod: {
        normal_dmg_: burst_normal_dmg_,
        atkSPD_: c4_atkSPD_,
      },
    },
    premod: {
      skillBoost: skillC3,
      burstBoost: burstC5,
      hp_: c2_hp_,
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
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
            node: infoMut(dmgFormulas.skill.illusionDmg, {
              name: ct.chg(`skill.skillParams.5`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.6'),
            value: dm.skill.illusionDuration,
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
        value: condInSkill,
        path: condInSkillPath,
        name: st('afterUse.skill'),
        states: {
          on: {
            fields: [
              ...dm.skill.dmgArr.map((_, i) => ({
                node: infoMut(dmgFormulas.skill[`dmg${i}`], {
                  name: ct.chg(`skill.skillParams.${i}`),
                }),
              })),
              {
                text: st('incInterRes'),
              },
              {
                text: ct.ch('skill.unableToAuto'),
              },
              {
                text: stg('duration'),
                value: dm.skill.stateDuration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.condTem('skill', {
        value: condSkillStacks,
        path: condSkillStacksPath,
        name: ct.ch('skill.namisenStacks'),
        canShow: equal(condInSkill, 'on', 1),
        states: Object.fromEntries(
          range(1, 5).map((stacks) => [
            stacks,
            {
              name: st('stack', { count: stacks }),
              fields: [
                {
                  node: infoMut(skillStacks_dmgInc, {
                    name: ct.ch('skill.shun_dmgInc'),
                  }),
                },
                {
                  text: st('maxStacks'),
                  value: (data) =>
                    data.get(input.constellation).value >= 2
                      ? dm.skill.maxStacks + dm.constellation2.extraStacks
                      : dm.skill.maxStacks,
                },
              ],
            },
          ])
        ),
      }),
      ct.headerTem('passive1', {
        canShow: equal(condInSkill, 'on', 1),
        fields: [
          {
            text: ct.ch('passive1.afterUse'),
            value: dm.passive1.stacksGained,
          },
          {
            text: ct.ch('passive1.afterExplode'),
            value: (data) =>
              data.get(input.constellation).value >= 2
                ? dm.skill.maxStacks + dm.constellation2.extraStacks
                : dm.skill.maxStacks,
          },
        ],
      }),
      ct.condTem('constellation1', {
        value: condC1OppHp,
        path: condC1OppHpPath,
        name: st('enemyLessEqPercentHP', {
          percent: dm.constellation1.oppHpThres_ * 100,
        }),
        canShow: equal(condInSkill, 'on', 1),
        states: {
          on: {
            fields: [
              {
                node: infoMut(c1Shun_dmg_, {
                  name: ct.ch('c1.shun_dmg_'),
                  unit: '%',
                }),
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation2', {
        fields: [
          {
            text: ct.ch('c2.addlStacks'),
            value: dm.constellation2.extraStacks,
          },
          {
            canShow: (data) => data.get(c2_hp_).value !== 0,
            node: c2_hp_,
          },
        ],
      }),
      ct.headerTem('constellation6', {
        canShow: equal(condInSkill, 'on', 1),
        fields: [
          {
            node: infoMut(dmgFormulas.constellation6.dmg, {
              name: ct.ch('c6.dmg'),
              multi: dm.constellation6.extraStrikes,
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
        value: condBurstInArea,
        path: condBurstInAreaPath,
        name: st('activeCharField'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: infoMut(
                  burst_normal_dmg_Disp,
                  KeyMap.info('normal_dmg_')
                ),
              },
            ],
          },
        },
      }),
      ct.condTem('constellation4', {
        value: condC4AfterBurst,
        path: condC4AfterBurstPath,
        name: st('afterUse.burst'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: c4_atkSPD_,
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
  },
}
export default new CharacterSheet(sheet, data)
