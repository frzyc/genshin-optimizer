import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  one,
  percent,
  prod,
  subscript,
  sum,
  unequal,
} from '../../../Formula/utils'
import { objectKeyMap } from '../../../Util/Util'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import type { ICharacterSheet } from '../ICharacterSheet.d'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = 'RaidenShogun'
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0,
  s = 0,
  b = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    coorDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    burstDmg_bonus: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    resolveBonus1: skillParam_gen.burst[b++],
    resolveBonus2: skillParam_gen.burst[b++],
    resolveGained: skillParam_gen.burst[b++],
    hit1: skillParam_gen.burst[b++],
    hit2: skillParam_gen.burst[b++],
    hit3: skillParam_gen.burst[b++],
    hit41: skillParam_gen.burst[b++],
    hit42: skillParam_gen.burst[b++],
    hit5: skillParam_gen.burst[b++],
    charged1: skillParam_gen.burst[b++],
    charged2: skillParam_gen.burst[b++],
    stam: skillParam_gen.burst[b++][0],
    plunge: skillParam_gen.burst[b++],
    plungeLow: skillParam_gen.burst[b++],
    plungeHigh: skillParam_gen.burst[b++],
    enerGen: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    er: skillParam_gen.passive2[p2++][0],
    energyGen: skillParam_gen.passive2[p2++][0],
    electroDmg_bonus: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    def_ignore: skillParam_gen.constellation2[0],
  },
  constellation4: {
    atk_bonus: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
} as const

const [condSkillEyePath, condSkillEye] = cond(key, 'skillEye')
const skillEye_ = equal(
  'skillEye',
  condSkillEye,
  prod(
    constant(dm.burst.enerCost, { name: st('energy') }),
    subscript(input.total.skillIndex, dm.skill.burstDmg_bonus, {
      fixed: 2,
      unit: '%',
    })
  )
)

function skillDmg(atkType: number[]) {
  // if Raiden is above or equal to C2, then account for DEF Ignore else not
  return dmgNode('atk', atkType, 'skill', {
    enemy: {
      defIgn: greaterEq(input.constellation, 2, dm.constellation2.def_ignore),
    },
  })
}

const energyCosts = [40, 50, 60, 70, 80, 90]
const [condSkillEyeTeamPath, condSkillEyeTeam] = cond(key, 'skillEyeTeam')
const skillEyeTeamBurstDmgInc = unequal(
  input.activeCharKey,
  input.charKey,
  prod(
    lookup(
      condSkillEyeTeam,
      objectKeyMap(energyCosts, (i) => constant(i, { name: st('energy') })),
      0
    ),
    subscript(input.total.skillIndex, dm.skill.burstDmg_bonus, {
      fixed: 2,
      unit: '%',
    })
  )
)

const resolveStacks = [10, 20, 30, 40, 50, 60]
const [condResolveStackPath, condResolveStack] = cond(key, 'burstResolve')

const resolveStackNode = lookup(
  condResolveStack,
  objectKeyMap(resolveStacks, (i) => constant(i)),
  0,
  { name: ct.ch('burst.resolves') }
)
const resolveInitialBonus_ = prod(
  subscript(input.total.burstIndex, dm.burst.resolveBonus1, {
    name: ct.ch('burst.resolveInitial_'),
    unit: '%',
  }),
  resolveStackNode
)
const resolveInfusedBonus_ = prod(
  subscript(input.total.burstIndex, dm.burst.resolveBonus2, {
    name: ct.ch('burst.resolveInfused_'),
    unit: '%',
  }),
  resolveStackNode
)
function burstResolve(mvArr: number[], initial = false) {
  const resolveBonus = initial ? resolveInitialBonus_ : resolveInfusedBonus_

  return customDmgNode(
    prod(
      sum(
        subscript(input.total.burstIndex, mvArr, { unit: '%' }),
        resolveBonus
      ),
      input.total.atk
    ),
    'burst',
    {
      hit: {
        ele: constant('electro'),
      },
      enemy: {
        // if Raiden is above or equal to C2, then account for DEF Ignore else not
        defIgn: greaterEq(
          input.constellation,
          2,
          dm.constellation2.def_ignore,
          { unit: '%' }
        ),
      },
    }
  )
}

const a4EnergyRestore_ = greaterEq(
  input.asc,
  4,
  prod(
    sum(input.total.enerRech_, percent(-dm.passive2.er)),
    percent(dm.passive2.energyGen),
    100
  )
)

const [condC4Path, condC4] = cond(key, 'c4')
const c4AtkBonus_ = greaterEq(
  input.constellation,
  4,
  equal(
    'c4',
    condC4,
    unequal(input.activeCharKey, input.charKey, dm.constellation4.atk_bonus)
  )
)

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
    dmg: skillDmg(dm.skill.skillDmg),
    coorDmg: skillDmg(dm.skill.coorDmg),
    skillEye_,
  },
  burst: {
    dmg: burstResolve(dm.burst.dmg, true),
    hit1: burstResolve(dm.burst.hit1),
    hit2: burstResolve(dm.burst.hit2),
    hit3: burstResolve(dm.burst.hit3),
    hit41: burstResolve(dm.burst.hit41),
    hit42: burstResolve(dm.burst.hit42),
    hit5: burstResolve(dm.burst.hit5),
    charged1: burstResolve(dm.burst.charged1),
    charged2: burstResolve(dm.burst.charged2),
    plunge: burstResolve(dm.burst.plunge),
    plungeLow: burstResolve(dm.burst.plungeLow),
    plungeHigh: burstResolve(dm.burst.plungeHigh),
    energyGen: prod(
      subscript(input.total.burstIndex, dm.burst.enerGen),
      sum(one, a4EnergyRestore_)
    ),
  },
  passive2: {
    passive2ElecDmgBonus: greaterEq(
      input.asc,
      4,
      prod(
        sum(input.premod.enerRech_, percent(-dm.passive2.er)),
        percent(dm.passive2.electroDmg_bonus),
        100
      )
    ),
    energyRestore: infoMut(a4EnergyRestore_, {
      name: ct.ch('a4.enerRest'),
      unit: '%',
    }),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  'electro',
  'inazuma',
  data_gen,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC5,
      burstBoost: nodeC3,
      burst_dmg_: skillEye_,
      electro_dmg_: dmgFormulas.passive2.passive2ElecDmgBonus,
    },
    teamBuff: {
      premod: {
        atk_: c4AtkBonus_,
        burst_dmg_: skillEyeTeamBurstDmgInc,
      },
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.name,
  rarity: data_gen.star,
  elementKey: 'electro',
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: 'F',
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
            name: ct.chg(`auto.skillParams.${i + (i < 4 ? 0 : -1)}`),
            textSuffix: i === 3 ? '(1)' : i === 4 ? '(2)' : '',
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
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.coorDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: `${dm.skill.duration}s`,
          },
          {
            text: ct.chg('skill.skillParams.4'),
            value: `${dm.skill.cd}s`,
          },
        ],
      },
      ct.condTem('skill', {
        value: condSkillEye,
        path: condSkillEyePath,
        name: ct.ch('skill.eye'),
        states: {
          skillEye: {
            fields: [
              {
                node: skillEye_,
              },
            ],
          },
        },
      }),
      ct.condTem('skill', {
        value: condSkillEyeTeam,
        path: condSkillEyeTeamPath,
        teamBuff: true,
        canShow: unequal(input.activeCharKey, input.charKey, 1),
        name: ct.ch('skill.partyCost'),
        states: Object.fromEntries(
          energyCosts.map((c) => [
            c,
            {
              name: `${c}`,
              fields: [
                {
                  node: skillEyeTeamBurstDmgInc,
                },
              ],
            },
          ])
        ),
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.dmg, {
              name: ct.ch(`burst.burstDmg`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.hit1, {
              name: ct.chg(`burst.skillParams.3`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.hit2, {
              name: ct.chg(`burst.skillParams.4`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.hit3, {
              name: ct.chg(`burst.skillParams.5`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.hit41, {
              name: ct.chg(`burst.skillParams.6`),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.hit42, {
              name: ct.chg(`burst.skillParams.6`),
              textSuffix: '(2)',
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.hit5, {
              name: ct.chg(`burst.skillParams.7`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.charged1, {
              name: ct.chg(`burst.skillParams.8`),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.charged2, {
              name: ct.chg(`burst.skillParams.8`),
              textSuffix: '(2)',
            }),
          },
          {
            text: ct.chg('burst.skillParams.9'),
            value: `${dm.burst.stam}`,
          },
          {
            node: infoMut(dmgFormulas.burst.plunge, {
              name: ct.chg(`burst.skillParams.10`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.plungeLow, {
              name: stg('plunging.low'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.plungeHigh, {
              name: stg('plunging.high'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.energyGen, {
              name: ct.chg('burst.skillParams.12'),
            }),
          },
          {
            text: ct.chg('burst.skillParams.13'),
            value: `${dm.burst.duration}s`,
          },
          {
            text: ct.chg('burst.skillParams.14'),
            value: `${dm.burst.cd}s`,
          },
          {
            text: ct.chg('burst.skillParams.15'),
            value: `${dm.burst.enerCost}`,
          },
        ],
      },
      ct.condTem('burst', {
        value: condResolveStack,
        path: condResolveStackPath,
        name: ct.ch('burst.resolves'),
        states: Object.fromEntries(
          resolveStacks.map((c) => [
            c,
            {
              name: st('stack', { count: c }),
              fields: [
                {
                  node: infoMut(resolveInitialBonus_, {
                    name: ct.ch('burst.resolveInitial_'),
                    unit: '%',
                  }),
                },
                {
                  node: infoMut(resolveInfusedBonus_, {
                    name: ct.ch('burst.resolveInfused_'),
                    unit: '%',
                  }),
                },
              ],
            },
          ])
        ),
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            node: dmgFormulas.passive2.energyRestore,
          },
          {
            node: dmgFormulas.passive2.passive2ElecDmgBonus,
          },
        ],
      }),
    ]),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4', [
      ct.condTem('constellation4', {
        value: condC4,
        path: condC4Path,
        teamBuff: true,
        canShow: unequal(input.activeCharKey, input.charKey, 1),
        name: ct.ch('c4.expires'),
        states: {
          c4: {
            fields: [
              {
                node: c4AtkBonus_,
              },
              {
                text: ct.chg('skill.skillParams.2'),
                value: `${dm.constellation4.duration}s`,
              },
            ],
          },
        },
      }),
    ]),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  },
}

export default new CharacterSheet(sheet, data)
