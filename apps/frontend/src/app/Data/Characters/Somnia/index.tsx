import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  infoMut,
  lookup,
  naught,
  one,
  percent,
  prod,
  subscript,
  sum,
  unequal,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, st, stg } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import type { ICharacterSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Somnia'
const elementKey: ElementKey = 'electro'
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
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    norm_charged_dmgInc: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    eleMas_: skillParam_gen.burst[b++],
    multDotDmg: skillParam_gen.burst[b++],
    sunderDmg: skillParam_gen.burst[b++],
    addDotDmg: skillParam_gen.burst[b++],
    supernovaDmg: skillParam_gen.burst[b++],
    subDotDmg: skillParam_gen.burst[b++],
    subDmgInc: skillParam_gen.burst[b++],
    subElemRes: skillParam_gen.burst[b++],
    resDuration: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chargedStamRed: skillParam_gen.passive1[0][0],
    chargedCastSpeed: skillParam_gen.passive1[1][0],
  },
  passive2: {
    elemas: skillParam_gen.passive2[0][0],
    stacks: skillParam_gen.passive2[1][0],
    maxElemas: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    chance: skillParam_gen.constellation1[0],
    dmg: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    energyRestore: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    cd: skillParam_gen.constellation6[2],
    critRate_: skillParam_gen.constellation6[3],
    critDMG_: skillParam_gen.constellation6[4],
    maxStacks: skillParam_gen.constellation6[5],
    duration: skillParam_gen.constellation6[6],
  },
} as const

const [condSuperpositionPath, condSuperposition] = cond(key, 'superposition')
const superposition_normCharged_dmgInc = equal(
  condSuperposition,
  'on',
  prod(
    subscript(input.total.skillIndex, dm.skill.norm_charged_dmgInc, {
      unit: '%',
    }),
    input.total.eleMas
  )
)

const [condCycloneActivePath, condCycloneActive] = cond(key, 'cycloneActive')

const [condMultiplicationPath, condMultiplication] = cond(key, 'multiplication')

const multiplication_infusion = equalStr(
  condCycloneActive,
  'on',
  equalStr(
    condMultiplication,
    'on',
    equalStr(
      lookup(
        target.weaponType,
        { sword: one, claymore: one, polearm: one },
        naught
      ),
      one,
      constant(elementKey)
    )
  )
)

const [condSubtractionPath, condSubtraction] = cond(key, 'subtraction')

const subtraction_normCharged_dmgInc = equal(
  condCycloneActive,
  'on',
  equal(
    condSubtraction,
    'on',
    prod(
      subscript(input.total.burstIndex, dm.burst.subDmgInc, { unit: '%' }),
      input.total.eleMas
    )
  )
)

const [condLessThan3Path, condLessThan3] = cond(key, 'lessThan3')
const lessThan3_eleRes_ = equal(
  condLessThan3,
  'on',
  prod(
    subscript(input.total.burstIndex, dm.burst.subElemRes, { unit: '%' }),
    input.total.eleMas
  )
)

const [condA4EnemiesHitPath, condA4EnemiesHit] = cond(key, 'a4EnemiesHit')
const a4EnemiesArr = range(1, dm.passive2.stacks)

const [condC1ModePath, condC1Mode] = cond(key, 'c1Mode')
const c1ModeMult = infoMut(
  sum(
    1,
    greaterEq(
      input.constellation,
      1,
      lookup(
        condC1Mode,
        {
          average: constant(dm.constellation1.chance * dm.constellation1.dmg),
          always: constant(dm.constellation1.dmg),
        },
        naught
      )
    )
  ),
  { name: ct.ch('c1Key'), unit: '%', asConst: true }
)

const [condC2PrimePath, condC2Prime] = cond(key, 'c2Prime')
const c2PrimeDmgInc = greaterEq(
  input.constellation,
  2,
  equal(
    condSuperposition,
    'on',
    equal(condC2Prime, 'on', { ...superposition_normCharged_dmgInc })
  )
)

const [condC6StacksPath, condC6Stacks] = cond(key, 'c6Stacks')
const c6StacksArr = range(1, dm.constellation6.maxStacks)
const c6_critRate_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condC6Stacks,
    objectKeyMap(c6StacksArr, (stack) =>
      prod(percent(dm.constellation6.critRate_), stack)
    ),
    naught
  )
)
const c6_critDMG_ = greaterEq(
  input.constellation,
  6,
  lookup(
    condC6Stacks,
    objectKeyMap(c6StacksArr, (stack) =>
      prod(percent(dm.constellation6.critDMG_), stack)
    ),
    naught
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [
      i,
      dmgNode('atk', arr, 'normal', undefined, c1ModeMult),
    ])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged', undefined, c1ModeMult),
  },
  plunging: Object.fromEntries(
    Object.entries(dm.plunging).map(([key, value]) => [
      key,
      dmgNode('atk', value, 'plunging'),
    ])
  ),
  skill: {
    pressDmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    normal_dmgInc: superposition_normCharged_dmgInc,
    charged_dmgInc: { ...superposition_normCharged_dmgInc },
  },
  burst: {
    initialDmg: dmgNode('atk', dm.burst.pressDmg, 'burst'),
    multDotDmg: dmgNode('atk', dm.burst.multDotDmg, 'burst'),
    addDotDmg: dmgNode('atk', dm.burst.addDotDmg, 'burst'),
    subDotDmg: dmgNode('atk', dm.burst.subDotDmg, 'burst'),
    sunderDmg: dmgNode('eleMas', dm.burst.sunderDmg, 'burst'),
    supernovaDmg: dmgNode('eleMas', dm.burst.supernovaDmg, 'burst'),
    eleMas: equal(
      condCycloneActive,
      'on',
      prod(
        subscript(input.total.burstIndex, dm.burst.eleMas_, { unit: '%' }),
        input.premod.eleMas
      )
    ),
    sub_normal_dmgInc: subtraction_normCharged_dmgInc,
    sub_charged_dmgInc: { ...subtraction_normCharged_dmgInc },
    ...objectKeyMap(allElementWithPhyKeys, (_) => ({ ...lessThan3_eleRes_ })),
  },
  passive2: {
    eleMas: greaterEq(
      input.asc,
      4,
      equal(
        condCycloneActive,
        'on',
        lookup(
          condA4EnemiesHit,
          objectKeyMap(a4EnemiesArr, (stack) =>
            prod(percent(dm.passive2.elemas), stack, input.premod.eleMas)
          ),
          naught
        )
      )
    ),
  },
  constellation2: {
    normal_dmgInc: c2PrimeDmgInc,
    charged_dmgInc: { ...c2PrimeDmgInc },
  },
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

const data = dataObjForCharacterSheet(
  key,
  elementKey,
  'mondstadt',
  data_gen,
  dmgFormulas,
  {
    premod: {
      burstBoost: burstC3,
      skillBoost: skillC5,
      normal_dmgInc: sum(
        dmgFormulas.skill.normal_dmgInc,
        dmgFormulas.burst.sub_normal_dmgInc,
        dmgFormulas.constellation2.normal_dmgInc
      ),
      charged_dmgInc: sum(
        dmgFormulas.skill.charged_dmgInc,
        dmgFormulas.burst.sub_charged_dmgInc,
        dmgFormulas.constellation2.charged_dmgInc
      ),
      critRate_: c6_critRate_,
      critDMG_: c6_critDMG_,
    },
    teamBuff: {
      premod: {
        ...Object.fromEntries(
          allElementWithPhyKeys.map((ele) => [
            `${ele}_enemyRes_`,
            dmgFormulas.burst[ele],
          ])
        ),
      },
      infusion: {
        team: multiplication_infusion,
      },
    },
    total: {
      eleMas: sum(dmgFormulas.burst.eleMas, dmgFormulas.passive2.eleMas),
    },
  }
)

const sheet: ICharacterSheet = {
  key,
  name: ct.chg('name'),
  rarity: data_gen.rarity,
  elementKey,
  weaponTypeKey: data_gen.weaponType,
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
            value: dm.charged.stamina,
            unit: '/s',
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
      ct.condTem('constellation1', {
        value: condC1Mode,
        path: condC1ModePath,
        name: ct.ch('c1Cond'),
        states: {
          average: {
            name: ct.ch('average'),
            fields: [
              {
                node: c1ModeMult,
              },
            ],
          },
          always: {
            name: ct.ch('always'),
            fields: [
              {
                node: c1ModeMult,
              },
            ],
          },
        },
      }),
    ]),

    skill: ct.talentTem('skill', [
      ct.fieldsTem('skill', {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.pressDmg, {
              name: ct.chg('skill.skillParams.0'),
            }),
          },
          {
            text: stg('duration'),
            value: dm.skill.duration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
          },
        ],
      }),
      ct.condTem('skill', {
        value: condSuperposition,
        path: condSuperpositionPath,
        name: ct.ch('superpositionCond'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(
                  dmgFormulas.skill.normal_dmgInc,
                  KeyMap.info('normal_dmgInc')
                ),
              },
              {
                node: infoMut(
                  dmgFormulas.skill.charged_dmgInc,
                  KeyMap.info('charged_dmgInc')
                ),
              },
            ],
          },
        },
      }),
      ct.condTem('constellation2', {
        value: condC2Prime,
        path: condC2PrimePath,
        name: ct.ch('c2Cond'),
        canShow: equal(condSuperposition, 'on', 1),
        states: {
          on: {
            fields: [
              {
                node: infoMut(
                  dmgFormulas.constellation2.normal_dmgInc,
                  KeyMap.info('normal_dmgInc')
                ),
              },
              {
                node: infoMut(
                  dmgFormulas.constellation2.charged_dmgInc,
                  KeyMap.info('charged_dmgInc')
                ),
              },
            ],
          },
        },
      }),
    ]),

    burst: ct.talentTem('burst', [
      ct.fieldsTem('burst', {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.initialDmg, {
              name: ct.chg('burst.skillParams.0'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.multDotDmg, {
              name: ct.chg('burst.skillParams.2'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.sunderDmg, {
              name: ct.chg('burst.skillParams.3'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.addDotDmg, {
              name: ct.chg('burst.skillParams.4'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.supernovaDmg, {
              name: ct.chg('burst.skillParams.5'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.subDotDmg, {
              name: ct.chg('burst.skillParams.6'),
            }),
          },
          {
            text: stg('duration'),
            value: dm.burst.duration,
            unit: 's',
          },
          {
            text: stg('energyCost'),
            value: dm.burst.energyCost,
          },
          {
            text: stg('cd'),
            value: dm.burst.cd,
            unit: 's',
          },
        ],
      }),
      ct.condTem('burst', {
        value: condCycloneActive,
        path: condCycloneActivePath,
        teamBuff: true,
        name: ct.ch('cycloneActiveCond'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(dmgFormulas.burst.eleMas, KeyMap.info('eleMas')),
              },
            ],
          },
        },
      }),
      ct.condTem('burst', {
        value: condSubtraction,
        path: condSubtractionPath,
        // Only show for Somnia
        canShow: equal(
          condCycloneActive,
          'on',
          equal(input.activeCharKey, key, 1)
        ),
        name: ct.ch('subCond'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(
                  dmgFormulas.burst.sub_normal_dmgInc,
                  KeyMap.info('normal_dmgInc')
                ),
              },
              {
                node: infoMut(
                  dmgFormulas.burst.sub_charged_dmgInc,
                  KeyMap.info('charged_dmgInc')
                ),
              },
            ],
          },
        },
      }),
      ct.condTem('burst', {
        value: condMultiplication,
        path: condMultiplicationPath,
        teamBuff: true,
        // Only show for Somnia's teammates
        canShow: equal(
          condCycloneActive,
          'on',
          unequal(input.activeCharKey, key, 1)
        ),
        name: ct.ch('multCond'),
        states: {
          on: {
            fields: [
              {
                text: (
                  <ColorText color="electro">
                    {st('infusion.electro')}
                  </ColorText>
                ),
              },
            ],
          },
        },
      }),
      ct.condTem('burst', {
        value: condLessThan3,
        path: condLessThan3Path,
        teamBuff: true,
        name: ct.ch('lessThan3Cond'),
        states: {
          on: {
            fields: [
              ...allElementWithPhyKeys.map((ele) => ({
                node: dmgFormulas.burst[ele],
              })),
              {
                text: stg('duration'),
                value: dm.burst.resDuration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.condTem('passive2', {
        value: condA4EnemiesHit,
        path: condA4EnemiesHitPath,
        canShow: equal(condCycloneActive, 'on', 1),
        name: st('hitOp.burst'),
        states: objectKeyMap(a4EnemiesArr, (stack) => ({
          name: st('hits', { count: stack }),
          fields: [
            {
              node: infoMut(dmgFormulas.passive2.eleMas, KeyMap.info('eleMas')),
            },
          ],
        })),
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
    passive3: ct.talentTem('passive3'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.condTem('constellation6', {
        value: condC6Stacks,
        path: condC6StacksPath,
        name: ct.chg('constellation6.name'),
        states: objectKeyMap(c6StacksArr, (stack) => ({
          name: st('stack', { count: stack }),
          fields: [
            {
              node: c6_critRate_,
            },
            {
              node: c6_critDMG_,
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
  },
}
export default new CharacterSheet(sheet, data)
