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
  one,
  percent,
  prod,
  stellarDmgNode,
  sum,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
  splitScaleDmgNode,
  stellarTalentDmgNode,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'

const key: CharacterKey = 'Mitya'
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
    detonationDmg: skillParam_gen.auto[a + 3],
    detonationStellarDmg: skillParam_gen.auto[a + 4],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    tapDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    steadyDmg: skillParam_gen.skill[s++],
    steadyConsumptionDmg: skillParam_gen.skill[s++],
    steadyDetonationDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmgAtk: skillParam_gen.burst[b++],
    skillDmgEleMas: skillParam_gen.burst[b++],
    beaconsCreated: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas: skillParam_gen.passive1[0][0],
  },
  passive2: {
    critRate_: skillParam_gen.passive2[0][0],
    maxStacks: 4,
    duration: 15,
  },
  passive3: {
    base_stellarconduct_dmg_: skillParam_gen.passive3![0][0],
    maxBase_stellarconduct_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    critDMG_: skillParam_gen.constellation1[0],
    energyRegen: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
  },
  constellation2: {
    cryoElectro_enemyRes_: skillParam_gen.constellation2[0],
    steady_eleMas: skillParam_gen.constellation2[1],
    overloaded_eleMas: skillParam_gen.constellation2[2],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    chance: skillParam_gen.constellation6[0],
    stellarconduct_specialDmg_: skillParam_gen.constellation6[1],
    steady_mult_: skillParam_gen.constellation6[2],
  },
} as const

const a0_stellarconduct_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellarconduct_dmg_), input.total.eleMas),
  percent(dm.passive3.maxBase_stellarconduct_dmg_)
)

const [condA0StellarRadianceScPath, condA0StellarRadianceSc] = cond(
  key,
  'a0StellarRadianceSc'
)

const [condSkillDetonationPath, condSkillDetonation] = cond(
  key,
  'skillDetonation'
)
const skillDetonationSmallArr = range(1, 4)
const skillDetonationArr = range(1, 4 + 1)
const skillDetonationMult = lookup(
  condSkillDetonation,
  objKeyMap(skillDetonationArr, (core) =>
    core >= 5 ? greaterEq(input.constellation, 1, core) : constant(core)
  ),
  constant(1)
)

const [condA1BeaconsPath, condA1Beacons] = cond(key, 'a1Beacons')
const a1BeaconsSmallArr = range(1, 4)
const a1BeaconsArr = range(1, 4 + 1)
const a1Beacons = lookup(
  condA1Beacons,
  objKeyMap(a1BeaconsArr, (core) =>
    core >= 5 ? greaterEq(input.constellation, 1, core) : constant(core)
  ),
  naught
)
const a1BeaconsEleMas = prod(a1Beacons, dm.passive1.eleMas)

const [condA4StacksPath, condA4Stacks] = cond(key, 'a4Stacks')
const a4StacksArr = range(1, dm.passive2.maxStacks)
const a4Stacks = lookup(
  condA4Stacks,
  objKeyMap(a4StacksArr, (core) => constant(core)),
  naught
)
const a4Stacks_critRate_ = prod(a4Stacks, dm.passive2.critRate_)

const [condC1CorePath, condC1Core] = cond(key, 'c1Core')
const c1Core_critDMG_disp = infoMut(
  greaterEq(
    input.constellation,
    1,
    equal(condC1Core, 'on', dm.constellation1.critDMG_)
  ),
  { path: 'critDMG_', isTeamBuff: true }
)
const c1Core_critDMG_ = equal(
  input.activeCharKey,
  target.charKey,
  c1Core_critDMG_disp
)

const [condC2CoreFieldPath, condC2CoreField] = cond(key, 'c2CoreField')
const c2CoreField_cryo_enemyRes_ = greaterEq(
  input.constellation,
  2,
  equal(condC2CoreField, 'on', -dm.constellation2.cryoElectro_enemyRes_)
)
const c2CoreField_electro_enemyRes_ = { ...c2CoreField_cryo_enemyRes_ }

const [condC2CoreTypePath, condC2CoreType] = cond(key, 'c2CoreType')
const c2CoreType_steady_eleMas = greaterEq(
  input.constellation,
  2,
  equal(condC2CoreType, 'steady', dm.constellation2.steady_eleMas)
)
const c2CoreType_overloaded_eleMasDisp = infoMut(
  greaterEq(
    input.constellation,
    2,
    equal(condC2CoreType, 'overloaded', dm.constellation2.overloaded_eleMas)
  ),
  { path: 'eleMas', isTeamBuff: true }
)
const c2CoreType_overloaded_eleMas = equal(
  input.activeCharKey,
  target.charKey,
  c2CoreType_overloaded_eleMasDisp
)

const c6Steady_mult_ = sum(
  one,
  greaterEq(input.constellation, 6, percent(dm.constellation6.steady_mult_))
)
const c6_stellarconduct_specialDmg_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.stellarconduct_specialDmg_
)

const dmgFormulas = {
  normal: {
    ...Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
  },
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
    detonationDmg: dmgNode('atk', dm.charged.detonationDmg, 'charged'),
    detonationStellarDmg: stellarTalentDmgNode(
      'eleMas',
      dm.charged.detonationStellarDmg,
      'auto',
      'stellarconduct',
      'electro'
    ),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    tapDmg: dmgNode('atk', dm.skill.tapDmg, 'skill'),
    holdDmg: dmgNode('atk', dm.skill.holdDmg, 'skill'),
    steadyDmg: dmgNode(
      'atk',
      dm.skill.steadyDmg,
      'skill',
      undefined,
      c6Steady_mult_
    ),
    steadyConsumptionDmg: stellarTalentDmgNode(
      'eleMas',
      dm.skill.steadyConsumptionDmg,
      'skill',
      'stellarconduct',
      'electro',
      undefined,
      c6Steady_mult_
    ),
    steadyDetonationDmg: stellarTalentDmgNode(
      'eleMas',
      dm.skill.steadyDetonationDmg,
      'skill',
      'stellarconduct',
      'electro',
      undefined,
      prod(skillDetonationMult, c6Steady_mult_)
    ),
  },
  burst: {
    skillDmg: splitScaleDmgNode(
      ['atk', 'eleMas'],
      [dm.burst.skillDmgAtk, dm.burst.skillDmgEleMas],
      'burst'
    ),
  },
  constellation4: {
    dmg: greaterEq(
      input.constellation,
      4,
      stellarDmgNode(
        percent(dm.constellation4.dmg),
        'eleMas',
        'stellarconduct',
        'electro'
      )
    ),
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const autoC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(
  key,
  dmgFormulas,
  {
    premod: {
      autoBoost: autoC5,
      skillBoost: skillC3,
      critRate_: a4Stacks_critRate_,
    },
    teamBuff: {
      premod: {
        stellarconduct_baseDmg_: a0_stellarconduct_baseDmg_,
        eleMas: a1BeaconsEleMas,
        critDMG_: c1Core_critDMG_,
        cryo_enemyRes_: c2CoreField_cryo_enemyRes_,
        electro_enemyRes_: c2CoreField_electro_enemyRes_,
        stellarconduct_specialDmg_: c6_stellarconduct_specialDmg_,
      },
    },
    flags: {
      radiance: condA0StellarRadianceSc,
    },
  },
  {
    teamBuff: {
      premod: {
        eleMas: c2CoreType_steady_eleMas,
      },
    },
  },
  {
    teamBuff: {
      premod: {
        eleMas: c2CoreType_overloaded_eleMas,
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
            name: ct.chg('auto.skillParams.3'),
          }),
        },
        {
          text: ct.chg('auto.skillParams.4'),
          value: dm.charged.stam,
        },
        {
          node: infoMut(dmgFormulas.charged.detonationDmg, {
            name: ct.chg('auto.skillParams.7'),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.detonationStellarDmg, {
            name: ct.chg('auto.skillParams.8'),
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
          node: infoMut(dmgFormulas.skill.tapDmg, {
            name: ct.chg('skill.skillParams.0'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.holdDmg, {
            name: ct.chg('skill.skillParams.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.steadyDmg, {
            name: ct.chg('skill.skillParams.2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.steadyConsumptionDmg, {
            name: ct.chg('skill.skillParams.3'),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.steadyDetonationDmg, {
            name: ct.chg('skill.skillParams.4'),
          }),
        },
        {
          text: ct.chg('skill.skillParams.5'),
          value: dm.skill.duration,
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
      path: condSkillDetonationPath,
      value: condSkillDetonation,
      name: ct.ch('skillDetonationCond'),
      states: (data) =>
        objKeyMap(
          data.get(input.constellation).value >= 1
            ? skillDetonationArr
            : skillDetonationSmallArr,
          (core) => ({
            name: `${core}`,
            fields: [
              {
                node: infoMut(skillDetonationMult, {
                  name: ct.ch('detonationMult_'),
                  unit: '%',
                }),
              },
            ],
          })
        ),
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
          text: ct.chg('burst.skillParams.1'),
          value: dm.burst.beaconsCreated,
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
    ct.condTem('passive1', {
      path: condA1BeaconsPath,
      value: condA1Beacons,
      teamBuff: true,
      name: ct.ch('a1BeaconsCond'),
      states: (data) =>
        objKeyMap(
          data.get(input.constellation).value >= 1
            ? a1BeaconsArr
            : a1BeaconsSmallArr,
          (core) => ({
            name: `${core}`,
            fields: [
              {
                node: a1BeaconsEleMas,
              },
            ],
          })
        ),
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4StacksPath,
      value: condA4Stacks,
      name: ct.ch('a4StacksCond'),
      states: objKeyMap(a4StacksArr, (stack) => ({
        name: `${stack}`,
        fields: [
          {
            node: a4Stacks_critRate_,
          },
          {
            text: stg('duration'),
            value: dm.passive2.duration,
            unit: 's',
          },
        ],
      })),
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    ct.headerTem('passive3', {
      teamBuff: true,
      canShow: greaterEq(a0_stellarconduct_baseDmg_, 0.01, 1),
      fields: [
        {
          node: a0_stellarconduct_baseDmg_,
        },
      ],
    }),
    ct.condTem('passive3', {
      path: condA0StellarRadianceScPath,
      value: condA0StellarRadianceSc,
      teamBuff: true,
      name: st('elementalReaction.polestar.inside'),
      states: {
        sc: {
          fields: [
            {
              text: st('elementalReaction.stellar.gainRadianceSc'),
            },
          ],
        },
      },
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.fieldsTem('constellation1', {
      fields: [
        {
          text: ct.ch('c1Text'),
        },
      ],
    }),
    ct.condTem('constellation1', {
      path: condC1CorePath,
      value: condC1Core,
      teamBuff: true,
      name: ct.ch('c1CoreCond'),
      states: {
        on: {
          fields: [
            {
              node: c1Core_critDMG_disp,
            },
          ],
        },
      },
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2CoreFieldPath,
      value: condC2CoreField,
      teamBuff: true,
      name: ct.ch('c2CoreFieldCond'),
      states: {
        on: {
          fields: [
            {
              node: c2CoreField_cryo_enemyRes_,
            },
            {
              node: c2CoreField_electro_enemyRes_,
            },
          ],
        },
      },
    }),
    ct.condTem('constellation2', {
      path: condC2CoreTypePath,
      value: condC2CoreType,
      teamBuff: true,
      name: ct.ch('c2CoreTypeCond'),
      states: {
        steady: {
          name: ct.ch('c2CoreSteady'),
          fields: [
            {
              node: c2CoreType_steady_eleMas,
            },
          ],
        },
        overloaded: {
          name: ct.ch('c2CoreOverloaded'),
          fields: [
            {
              node: c2CoreType_overloaded_eleMasDisp,
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: skillC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.fieldsTem('constellation4', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation4.dmg, {
            name: st('dmg'),
          }),
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: autoC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(c6Steady_mult_, {
            name: ct.ch('detectionCoreMult_'),
            unit: '%',
            pivot: true,
          }),
        },
        {
          node: c6_stellarconduct_specialDmg_,
        },
      ],
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
