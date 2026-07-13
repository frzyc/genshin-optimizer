import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  input,
  lessThan,
  lookup,
  naught,
  percent,
  prod,
  stellarDmg,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { any, cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet.d'

const key: CharacterKey = 'YaeMiko'
const skillParam_gen = allStats.char.skillParam[key]

const [condLockRevelationPath, condLockRevelation] = cond(key, 'lockRevelation')
const lockRevelation = equal(condLockRevelation, 'on', 1)

const ct = charTemplates(key, lockRevelation)

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
    dmg1: skillParam_gen.skill[s++],
    dmg2: skillParam_gen.skill[s++],
    dmg3: skillParam_gen.skill[s++],
    dmg4: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    tenkoDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
    stellarDmg: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMas_dmg_: skillParam_gen.passive2[p2++][0],
  },
  lockedPassive: {
    dmgInc: skillParam_gen.lockedPassive![0][0],
    cd: skillParam_gen.lockedPassive![1][0],
    stellarDmg: skillParam_gen.lockedPassive![2][0],
    durationInc: skillParam_gen.lockedPassive![3][0],
  },
  constellation1: {
    enerRest: skillParam_gen.constellation1[0],
    electro_stellarconduct_dmg_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation2: {
    unknown1: skillParam_gen.constellation2[0], //what is this?
    aoeInc: skillParam_gen.constellation2[1],
    unknown2: skillParam_gen.constellation2[2], //what is this?,
    eleMas: [
      skillParam_gen.constellation2[3],
      skillParam_gen.constellation2[4],
      skillParam_gen.constellation2[5],
      skillParam_gen.constellation2[6],
    ],
  },
  constellation4: {
    ele_dmg_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    energyRegen: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[3],
    burst_dmg_: skillParam_gen.constellation4[4],
  },
  constellation6: {
    defIgn_: skillParam_gen.constellation6[0],
    stellarconduct_critDMG_: skillParam_gen.constellation6[1],
  },
} as const

const [condLockStellarRadianceScPath, condLockStellarRadianceSc] = cond(
  key,
  'lockStellarRadianceSc'
)

const nodeLk_dmgInc = prod(percent(dm.lockedPassive.dmgInc), input.total.atk)

const [condC1Path, condC1] = cond(key, 'c1')
const nodeC1_electro_dmg_ = greaterEq(
  input.constellation,
  1,
  equal(
    condLockRevelation,
    'on',
    equal(condC1, 'on', dm.constellation1.electro_stellarconduct_dmg_)
  )
)
const nodeC1_stellarconduct_dmg_ = { ...nodeC1_electro_dmg_ }

const condC2Arr = range(2, 4)
const [condC2Path, condC2] = cond(key, 'c2')
const nodeC2_eleMas = greaterEq(
  input.constellation,
  2,
  equal(
    condLockRevelation,
    'on',
    any(
      lookup(
        condC2,
        objKeyMap(condC2Arr, (stack) =>
          constant(dm.constellation2.eleMas[stack - 1])
        ),
        naught
      ),
      equal(target.charKey, key, 1),
      equal(input.activeCharKey, target.charKey, 1)
    )
  )
)

const [condC4Path, condC4] = cond(key, 'c4')
const nodeC4 = greaterEq(
  input.constellation,
  4,
  equal('hit', condC4, dm.constellation4.ele_dmg_)
)
const nodeC4_burst_dmg_ = greaterEq(
  input.constellation,
  4,
  equal(condLockRevelation, 'on', dm.constellation4.burst_dmg_)
)

const nodeC6 = greaterEq(input.constellation, 6, dm.constellation6.defIgn_)
const nodeC6_stellarconduct_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(condLockRevelation, 'on', dm.constellation6.stellarconduct_critDMG_)
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
    dmg1: lessThan(
      input.constellation,
      2,
      dmgNode('atk', dm.skill.dmg1, 'skill')
    ),
    dmg2: dmgNode('atk', dm.skill.dmg2, 'skill', {
      premod: { enemyDefIgn_: nodeC6 },
    }),
    dmg3: dmgNode('atk', dm.skill.dmg3, 'skill', {
      premod: { enemyDefIgn_: nodeC6 },
    }),
    dmg4: greaterEq(
      input.constellation,
      2,
      dmgNode('atk', dm.skill.dmg4, 'skill', {
        premod: { enemyDefIgn_: nodeC6 },
      })
    ),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    tenkoDmg: dmgNode('atk', dm.burst.tenkoDmg, 'burst'),
  },
  passive1: {
    dmg: greaterEq(
      input.asc,
      1,
      equal(
        condLockRevelation,
        'on',
        unequal(
          condLockStellarRadianceSc,
          'on',
          customDmgNode(
            prod(percent(dm.passive1.dmg), input.total.atk),
            'elemental'
          )
        )
      )
    ),
    stellarDmg: greaterEq(
      input.asc,
      1,
      equal(
        condLockRevelation,
        'on',
        equal(
          condLockStellarRadianceSc,
          'on',
          stellarDmg(
            percent(dm.passive1.stellarDmg),
            'atk',
            'stellarconduct',
            'electro'
          )
        )
      )
    ),
  },
  passive2: {
    nodeAsc4: greaterEq(
      input.asc,
      4,
      prod(input.total.eleMas, percent(dm.passive2.eleMas_dmg_, { fixed: 2 }))
    ),
  },
  lockedPassive: {
    dmg1: equal(
      condLockRevelation,
      'on',
      lessThan(
        input.constellation,
        2,
        dmgNode('atk', dm.skill.dmg1, 'skill', {
          premod: {
            skill_dmgInc: nodeLk_dmgInc,
          },
        })
      )
    ),
    dmg2: equal(
      condLockRevelation,
      'on',
      dmgNode('atk', dm.skill.dmg2, 'skill', {
        premod: {
          enemyDefIgn_: nodeC6,

          skill_dmgInc: nodeLk_dmgInc,
        },
      })
    ),
    dmg3: equal(
      condLockRevelation,
      'on',
      dmgNode('atk', dm.skill.dmg3, 'skill', {
        premod: {
          enemyDefIgn_: nodeC6,

          skill_dmgInc: nodeLk_dmgInc,
        },
      })
    ),
    dmg4: equal(
      condLockRevelation,
      'on',
      greaterEq(
        input.constellation,
        2,
        dmgNode('atk', dm.skill.dmg4, 'skill', {
          premod: {
            enemyDefIgn_: nodeC6,

            skill_dmgInc: nodeLk_dmgInc,
          },
        })
      )
    ),
    dmg: equal(
      condLockRevelation,
      'on',
      equal(
        condLockStellarRadianceSc,
        'on',
        stellarDmg(
          percent(dm.lockedPassive.stellarDmg),
          'atk',
          'stellarconduct',
          'electro'
        )
      )
    ),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
const data = dataObjForCharacterSheet(
  key,
  dmgFormulas,
  {
    premod: {
      skillBoost: nodeC3,
      burstBoost: nodeC5,
      burst_dmg_: nodeC4_burst_dmg_,
      stellarconduct_critDMG_: nodeC6_stellarconduct_critDMG_,
    },
    total: {
      skill_dmg_: dmgFormulas.passive2.nodeAsc4,
    },
    teamBuff: {
      premod: {
        electro_dmg_: nodeC4,
        stellarconduct_dmg_: nodeC1_stellarconduct_dmg_,
        eleMas: nodeC2_eleMas,
      },
    },
  },
  {
    teamBuff: {
      premod: {
        electro_dmg_: nodeC1_electro_dmg_,
      },
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
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.4'),
          value: dm.charged.stamina,
        },
      ],
    },
    {
      text: ct.chg(`auto.fields.plunging`),
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
          node: infoMut(dmgFormulas.skill.dmg1, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.dmg2, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.dmg3, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.dmg4, {
            name: ct.chg(`skill.skillParams.3`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.4'),
          value: dm.skill.duration,
          unit: 's',
        },

        {
          text: ct.chg('skill.skillParams.5'),
          value: dm.skill.cd,
        },
        {
          text: st('charges'),
          value: 3,
        },
      ],
    },
    ct.headerTem('constellation2', {
      fields: [
        {
          text: st('aoeInc'),
          value: dm.constellation2.aoeInc * 100,
          unit: '%',
        },
      ],
    }),
    ct.condTem('constellation4', {
      value: condC4,
      path: condC4Path,
      teamBuff: true,
      name: ct.ch('c4'),
      states: {
        hit: {
          fields: [
            {
              node: nodeC4,
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
    ct.headerTem('constellation6', {
      fields: [
        {
          text: ct.ch('c6'),
          value: dm.constellation6.defIgn_ * 100,
          unit: '%',
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
          node: infoMut(dmgFormulas.burst.tenkoDmg, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
          value: dm.burst.cd,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.3'),
          value: dm.burst.enerCost,
        },
      ],
    },
    ct.headerTem('constellation1', {
      fields: [
        {
          text: st('enerRegenPerHit'),
          value: dm.constellation1.enerRest,
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1', [
    ct.fieldsTem('passive1', {
      fields: [
        {
          node: infoMut(dmgFormulas.passive1.dmg, { name: ct.ch('a1Dmg') }),
        },
        {
          node: infoMut(dmgFormulas.passive1.stellarDmg, {
            name: ct.ch('a1StellarDmg'),
          }),
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    { fields: [{ node: dmgFormulas.passive2.nodeAsc4 }] },
  ]),
  passive3: ct.talentTem('passive3'),
  lockedPassive: ct.talentTem('lockedPassive', [
    ct.condTem('lockedPassive', {
      path: condLockRevelationPath,
      value: condLockRevelation,
      teamBuff: true,
      name: st('revelation.done'),
      states: {
        on: {
          fields: [
            {
              text: st('hexerei.talentEnhance'),
            },
          ],
        },
      },
    }),
    ct.fieldsTem('lockedPassive', {
      fields: [
        {
          node: infoMut(dmgFormulas.lockedPassive.dmg1, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.lockedPassive.dmg2, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.lockedPassive.dmg3, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          node: infoMut(dmgFormulas.lockedPassive.dmg4, {
            name: ct.chg(`skill.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.lockedPassive.dmg, {
            name: ct.ch('lockStellarDmg'),
          }),
        },
      ],
    }),
    ct.condTem('lockedPassive', {
      path: condLockStellarRadianceScPath,
      value: condLockStellarRadianceSc,
      teamBuff: true,
      canShow: lockRevelation,
      name: st('elementalReaction.polestar.inside'),
      states: {
        on: {
          fields: [
            {
              text: st('elementalReaction.gainRadianceSc'),
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1Path,
      value: condC1,
      teamBuff: true,
      canShow: equal(condLockRevelation, 'on', 1),
      name: st('elementalReaction.superconductOrStellarconduct'),
      states: {
        on: {
          fields: [
            {
              node: nodeC1_electro_dmg_,
            },
            {
              node: nodeC1_stellarconduct_dmg_,
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
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2Path,
      value: condC2,
      teamBuff: true,
      canShow: equal(condLockRevelation, 'on', 1),
      name: ct.ch('c2Cond'),
      states: objKeyMap(condC2Arr, (stack) => ({
        name: `${stack}`,
        fields: [
          {
            node: nodeC2_eleMas,
          },
        ],
      })),
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    { fields: [{ node: nodeC4_burst_dmg_ }] },
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: nodeC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    { fields: [{ node: nodeC6_stellarconduct_critDMG_ }] },
  ]),
}
export default new CharacterSheet(sheet, data)
