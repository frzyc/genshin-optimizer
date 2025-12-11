import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
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
  subscript,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Razor'
const elementKey: ElementKey = 'electro'
const skillParam_gen = allStats.char.skillParam[key]

const [condLockHomeworkPath, condLockHomework] = cond(key, 'lockHomework')
const lockHomework_hexerei = equal(condLockHomework, 'on', 1)

const ct = charTemplates(key, lockHomework_hexerei)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    erBonus: skillParam_gen.skill[s++][0],
    enerRegen: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    companionDmg: skillParam_gen.burst[b++],
    atkSpdBonus: skillParam_gen.burst[b++],
    electroResBonus: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdRed: 0.18,
  },
  passive2: {
    enerThreshold: 0.5,
    erInc: 0.3,
  },
  passive3: {
    sprintStaminaDec: 0.2,
  },
  lockedPassive: {
    burst_dmgInc: skillParam_gen.lockedPassive![0][0],
    dmg: skillParam_gen.lockedPassive![1][0],
    energyRegen: skillParam_gen.lockedPassive![2][0],
    cd: skillParam_gen.lockedPassive![3][0],
  },
  constellation1: {
    allDmgInc: 0.1,
    duration: 8,
  },
  constellation2: {
    hpThreshold: 0.3,
    critRateInc: 0.1,
  },
  constellation4: {
    defDec: 0.15,
    duration: 7,
  },
  constellation6: {
    dmg: 1,
    electroSigilGenerated: 1,
    cd: 10,
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const [condElectroSigilPath, condElectroSigil] = cond(key, 'ElectroSigil')
const [condTheWolfWithinPath, condTheWolfWithin] = cond(key, 'TheWolfWithin')
const [condA4Path, condA4] = cond(key, 'A4')
const [condC1Path, condC1] = cond(key, 'C1')
const [condC2Path, condC2] = cond(key, 'C2')
const [condC4Path, condC4] = cond(key, 'C4')

const enerRechElectroSigil_ = lookup(
  condElectroSigil,
  objKeyMap(range(1, 3), (i) => prod(i, percent(dm.skill.erBonus))),
  naught,
  { path: 'enerRech_' }
)
const electro_res_ = equal(
  'on',
  condTheWolfWithin,
  percent(dm.burst.electroResBonus)
)
const atkSPD_ = equal(
  'on',
  condTheWolfWithin,
  subscript(input.total.burstIndex, dm.burst.atkSpdBonus, { unit: '%' })
)
const enerRechA4_ = greaterEq(
  input.asc,
  4,
  equal('on', condA4, percent(dm.passive2.erInc, { path: 'enerRech_' }))
)
const all_dmg_ = greaterEq(
  input.constellation,
  1,
  equal('on', condC1, percent(dm.constellation1.allDmgInc))
)
const critRate_ = greaterEq(
  input.constellation,
  2,
  equal('on', condC2, percent(dm.constellation2.critRateInc))
)
const enemyDefRed_ = greaterEq(
  input.constellation,
  4,
  equal('on', condC4, percent(dm.constellation4.defDec))
)

const lock_burst_dmgInc = equal(
  condLockHomework,
  'on',
  prod(percent(dm.lockedPassive.burst_dmgInc), input.total.atk)
)
const companion_addl = {
  premod: {
    burst_dmgInc: lock_burst_dmgInc,
  },
}

const [condLockC6SigilPath, condLockC6Sigil] = cond(key, 'lockC6Sigil')
const lockC6Sigil_critRate_ = greaterEq(
  input.constellation,
  6,
  equal(
    condLockHomework,
    'on',
    equal(condLockC6Sigil, 'on', dm.constellation6.critRate_)
  )
)
const lockC6Sigil_critDMG_ = greaterEq(
  input.constellation,
  6,
  equal(
    condLockHomework,
    'on',
    equal(condLockC6Sigil, 'on', dm.constellation6.critDMG_)
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    spinningDmg: dmgNode('atk', dm.charged.spinningDmg, 'charged'),
    finalDmg: dmgNode('atk', dm.charged.finalDmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    press: dmgNode('atk', dm.skill.press, 'skill'),
    hold: dmgNode('atk', dm.skill.hold, 'skill'),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    companionDmg1: customDmgNode(
      prod(
        prod(
          subscript(input.total.autoIndex, dm.normal.hitArr[0]),
          subscript(input.total.burstIndex, dm.burst.companionDmg)
        ),
        input.total.atk
      ),
      'burst',
      companion_addl
    ),
    companionDmg2: customDmgNode(
      prod(
        prod(
          subscript(input.total.autoIndex, dm.normal.hitArr[1]),
          subscript(input.total.burstIndex, dm.burst.companionDmg)
        ),
        input.total.atk
      ),
      'burst',
      companion_addl
    ),
    companionDmg3: customDmgNode(
      prod(
        prod(
          subscript(input.total.autoIndex, dm.normal.hitArr[2]),
          subscript(input.total.burstIndex, dm.burst.companionDmg)
        ),
        input.total.atk
      ),
      'burst',
      companion_addl
    ),
    companionDmg4: customDmgNode(
      prod(
        prod(
          subscript(input.total.autoIndex, dm.normal.hitArr[3]),
          subscript(input.total.burstIndex, dm.burst.companionDmg)
        ),
        input.total.atk
      ),
      'burst',
      companion_addl
    ),
  },
  lockedPassive: {
    dmg: greaterEq(
      tally.hexerei,
      2,
      equal(
        condLockHomework,
        'on',
        customDmgNode(
          prod(percent(dm.lockedPassive.dmg), input.total.atk),
          'elemental',
          { hit: { ele: constant('electro') } }
        )
      )
    ),
  },
  constellation6: {
    dmg: greaterEq(
      input.constellation,
      6,
      customDmgNode(
        prod(percent(dm.constellation6.dmg), input.total.atk),
        'elemental',
        { hit: { ele: constant(elementKey) } }
      )
    ),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: nodeC5,
    burstBoost: nodeC3,
    enerRech_: sum(enerRechElectroSigil_, enerRechA4_),
    electro_res_,
    atkSPD_,
    all_dmg_,
    critRate_: sum(critRate_, lockC6Sigil_critRate_),
    critDMG_: lockC6Sigil_critDMG_,
  },
  teamBuff: {
    premod: {
      enemyDefRed_,
    },
  },
  isHexerei: lockHomework_hexerei,
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
          node: infoMut(dmgFormulas.charged.spinningDmg, {
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.finalDmg, {
            name: ct.chg(`auto.skillParams.5`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.6'),
          value: dm.charged.stamina,
          unit: '/s',
        },
        {
          text: ct.chg('auto.skillParams.7'),
          value: dm.charged.duration,
          unit: 's',
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
          node: infoMut(dmgFormulas.skill.press, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.5'),
          value: (data) =>
            data.get(input.asc).value >= 1
              ? dm.skill.pressCd - dm.skill.pressCd * dm.passive1.cdRed
              : dm.skill.pressCd,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.hold, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.6'),
          value: (data) =>
            data.get(input.asc).value >= 1
              ? dm.skill.holdCd - dm.skill.holdCd * dm.passive1.cdRed
              : dm.skill.holdCd,
          unit: 's',
        },
      ],
    },
    ct.condTem('skill', {
      // Electro Sigil
      value: condElectroSigil,
      path: condElectroSigilPath,
      name: ct.ch('electroSigil'),
      states: {
        ...objKeyMap(range(1, 3), (i) => ({
          name: st('stack', { count: i }),
          fields: [
            {
              node: enerRechElectroSigil_,
            },
            {
              text: ct.chg('skill.skillParams.4'),
              value: dm.skill.duration,
              unit: 's',
            },
            {
              text: ct.ch('electroSigilAbsorbed'),
              value: dm.skill.enerRegen * i,
            },
          ],
        })),
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
          node: infoMut(dmgFormulas.burst.companionDmg1, {
            name: ct.ch('soulCompanion.1'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.companionDmg2, {
            name: ct.ch('soulCompanion.2'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.companionDmg3, {
            name: ct.ch('soulCompanion.3'),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.companionDmg4, {
            name: ct.ch('soulCompanion.4'),
          }),
        },
        {
          text: ct.chg('burst.skillParams.5'),
          value: dm.burst.cd,
          unit: 's',
        },
        {
          text: ct.chg('burst.skillParams.6'),
          value: dm.burst.enerCost,
        },
      ],
    },
    ct.condTem('burst', {
      // The Wolf Within
      value: condTheWolfWithin,
      path: condTheWolfWithinPath,
      name: ct.chg('burst.description.3'),
      states: {
        on: {
          fields: [
            {
              node: atkSPD_,
            },
            {
              node: electro_res_,
            },
            {
              text: st('incInterRes'),
            },
            {
              text: st('immuneToElectroCharged'),
            },
            {
              text: ct.chg('burst.skillParams.4'),
              value: dm.burst.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),

  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      value: condA4,
      path: condA4Path,
      name: st('lessPercentEnergy', {
        percent: dm.passive2.enerThreshold * 100,
      }),
      states: {
        on: {
          fields: [
            {
              node: enerRechA4_,
            },
          ],
        },
      },
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  lockedPassive: ct.talentTem('lockedPassive', [
    ct.condTem('lockedPassive', {
      path: condLockHomeworkPath,
      value: condLockHomework,
      teamBuff: true,
      name: st('hexerei.homeworkDone'),
      states: {
        on: {
          fields: [
            {
              text: st('hexerei.becomeHexerei', {
                val: `$t(charNames_gen:${key})`,
              }),
            },
            {
              text: st('hexerei.talentEnhance'),
            },
            {
              node: infoMut(lock_burst_dmgInc, { name: ct.ch('wolf_dmgInc') }),
            },
          ],
        },
      },
    }),
    ct.fieldsTem('lockedPassive', {
      fields: [
        {
          node: infoMut(dmgFormulas.lockedPassive.dmg, { name: st('dmg') }),
        },
        {
          text: stg('cd'),
          value: dm.lockedPassive.cd,
          unit: 's',
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      value: condC1,
      path: condC1Path,
      name: st('getElementalOrbParticle'),
      states: {
        on: {
          fields: [
            {
              node: all_dmg_,
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
      value: condC2,
      path: condC2Path,
      name: st('enemyLessPercentHP', {
        percent: dm.constellation2.hpThreshold * 100,
      }),
      states: {
        on: {
          fields: [
            {
              node: infoMut(critRate_, { path: 'critRate_' }),
            },
          ],
        },
      },
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    ct.condTem('constellation4', {
      value: condC4,
      path: condC4Path,
      teamBuff: true,
      name: ct.ch('opHitWithClawAndThunder'),
      states: {
        on: {
          fields: [
            {
              node: enemyDefRed_,
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
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: nodeC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(dmgFormulas.constellation6.dmg, { name: st('dmg') }),
        },
        {
          text: ct.ch('electroSigilPerProc'),
          value: dm.constellation6.electroSigilGenerated,
        },
        {
          text: st('cooldown'),
          value: dm.constellation6.cd,
          unit: 's',
        },
      ],
    }),
    ct.condTem('constellation6', {
      path: condLockC6SigilPath,
      value: condLockC6Sigil,
      canShow: lockHomework_hexerei,
      name: ct.ch('c6LockCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(lockC6Sigil_critRate_, { path: 'critRate_' }),
            },
            {
              node: lockC6Sigil_critDMG_,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.duration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
}

export default new CharacterSheet(sheet, data)
