import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  compareEq,
  constant,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  infoMut,
  input,
  lessThan,
  one,
  sum,
  tally,
  target,
  threshold,
} from '@genshin-optimizer/gi/wr'
import { cond, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNodeTalent,
  hitEle,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Jahoda'
const skillParam_gen = allStats.char.skillParam[key]
const ele = allStats.char.data[key].ele!
const ct = charTemplates(key)

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2x2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    bombDmg: skillParam_gen.skill[s++],
    unfilledDmg: skillParam_gen.skill[s++],
    filledDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    meowDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    unknown2: skillParam_gen.skill[s++][0],
    unknown105: skillParam_gen.skill[s++][0],
    energyRegen: skillParam_gen.skill[s++][0],
    energyRegenCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    robotDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    robotHealMult: skillParam_gen.burst[b++],
    robotHealFlat: skillParam_gen.burst[b++],
    lowestHealMult: skillParam_gen.burst[b++],
    lowestHealFlat: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    unknown24: skillParam_gen.burst[b++][0],
    unknown15: skillParam_gen.burst[b++][0],
  },
  passive1: {
    robot_dmg_mult_: skillParam_gen.passive1[0][0],
    robot_heal_mult_: skillParam_gen.passive1[1][0],
    robot_attackInterval: skillParam_gen.passive1[2][0],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    chance: skillParam_gen.constellation1[0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const highestTeamElement = threshold(
  // If pyro >= tally for each element
  sum(
    greaterEq(tally.pyro, tally.hydro, 1),
    greaterEq(tally.pyro, tally.electro, 1),
    greaterEq(tally.pyro, tally.cryo, 1)
  ),
  3,
  // AND pyro is at least 1, then pyro is max
  greaterEqStr(tally.pyro, 1, 'pyro'),
  // If pyro wasn't greatest, check hydro >= tally for each remaining ele
  threshold(
    sum(
      greaterEq(tally.hydro, tally.electro, 1),
      greaterEq(tally.hydro, tally.cryo, 1)
    ),
    2,
    // AND hydro is at least 1, then hydro is max
    greaterEqStr(tally.hydro, 1, 'hydro'),
    // Compare electro and cryo together
    threshold(
      tally.electro,
      tally.cryo,
      // AND electro is at least 1, then electro is max
      greaterEqStr(tally.electro, 1, 'electro'),
      // By this point, cryo must be at least 1
      'cryo'
    )
  )
)

const secondHighestTeamElement = compareEq(
  highestTeamElement,
  'pyro',
  // Check HEC
  threshold(
    sum(
      greaterEq(tally.hydro, tally.electro, 1),
      greaterEq(tally.hydro, tally.cryo, 1)
    ),
    2,
    greaterEqStr(tally.hydro, 1, 'hydro'),
    threshold(
      tally.electro,
      tally.cryo,
      greaterEqStr(tally.electro, 1, 'electro'),
      'cryo'
    )
  ),
  compareEq(
    highestTeamElement,
    'hydro',
    // Check PEC
    threshold(
      sum(
        greaterEq(tally.pyro, tally.electro, 1),
        greaterEq(tally.pyro, tally.cryo, 1)
      ),
      2,
      greaterEqStr(tally.pyro, 1, 'pyro'),
      threshold(
        tally.electro,
        tally.cryo,
        greaterEqStr(tally.electro, 1, 'electro'),
        'cryo'
      )
    ),
    compareEq(
      highestTeamElement,
      'electro',
      // Check PHC
      threshold(
        sum(
          greaterEq(tally.pyro, tally.hydro, 1),
          greaterEq(tally.pyro, tally.cryo, 1)
        ),
        2,
        greaterEqStr(tally.pyro, 1, 'pyro'),
        threshold(
          tally.hydro,
          tally.cryo,
          greaterEqStr(tally.hydro, 1, 'hydro'),
          'cryo'
        )
      ),
      equalStr(
        highestTeamElement,
        'cryo',
        // Check PHE
        threshold(
          sum(
            greaterEq(tally.pyro, tally.hydro, 1),
            greaterEq(tally.pyro, tally.electro, 1)
          ),
          2,
          greaterEqStr(tally.pyro, 1, 'pyro'),
          threshold(
            tally.hydro,
            tally.electro,
            greaterEqStr(tally.hydro, 1, 'hydro'),
            'electro'
          )
        )
      )
    )
  )
)

const a1_pyro_robot_dmg_mult_ = sum(
  one,
  greaterEq(
    input.asc,
    1,
    greaterEq(
      sum(
        equal(highestTeamElement, 'pyro', 1),
        greaterEq(
          input.constellation,
          2,
          greaterEq(
            tally.moonsign,
            2,
            equal(secondHighestTeamElement, 'pyro', 1)
          )
        )
      ),
      1,
      dm.passive1.robot_dmg_mult_ - 1
    )
  )
)
const a1_hydro_robot_heal_mult_ = sum(
  one,
  greaterEq(
    input.asc,
    1,
    greaterEq(
      sum(
        equal(highestTeamElement, 'hydro', 1),
        greaterEq(
          input.constellation,
          2,
          greaterEq(
            tally.moonsign,
            2,
            equal(secondHighestTeamElement, 'hydro', 1)
          )
        )
      ),
      1,
      dm.passive1.robot_heal_mult_ - 1
    )
  )
)

const [condA4HealPath, condA4Heal] = cond(key, 'a4Heal')
const a4Heal_eleMasDisp = greaterEq(
  input.asc,
  4,
  equal(condA4Heal, 'on', dm.passive2.eleMas)
)
const a4Heal_eleMas = equal(
  input.activeCharKey,
  target.charKey,
  a4Heal_eleMasDisp
)

const [condC6FlaskFullPath, condC6FlaskFull] = cond(key, 'c6FlaskFull')
const c6FlaskFull_critRate_ = greaterEq(
  input.constellation,
  6,
  greaterEq(
    tally.moonsign,
    2,
    equal(
      condC6FlaskFull,
      'on',
      equal(target.isMoonsign, 1, dm.constellation6.critRate_)
    )
  )
)
const c6FlaskFull_critDMG_ = greaterEq(
  input.constellation,
  6,
  greaterEq(
    tally.moonsign,
    2,
    equal(
      condC6FlaskFull,
      'on',
      equal(target.isMoonsign, 1, dm.constellation6.critDMG_)
    )
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    aimed: dmgNode('atk', dm.charged.aimed, 'charged'),
    fullyAimed: dmgNode('atk', dm.charged.fullyAimed, 'charged', {
      hit: { ele: constant(ele) },
    }),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    bombDmg: dmgNode('atk', dm.skill.bombDmg, 'skill'),
    unfilledDmg: dmgNode('atk', dm.skill.unfilledDmg, 'skill'),
    filledDmg: lessThan(
      tally.moonsign,
      2,
      dmgNode('atk', dm.skill.filledDmg, 'skill')
    ),
    meowDmgPyro: greaterEq(
      tally.moonsign,
      2,
      dmgNode('atk', dm.skill.meowDmg, 'skill', hitEle.pyro)
    ),
    meowDmgHydro: greaterEq(
      tally.moonsign,
      2,
      dmgNode('atk', dm.skill.meowDmg, 'skill', hitEle.hydro)
    ),
    meowDmgElectro: greaterEq(
      tally.moonsign,
      2,
      dmgNode('atk', dm.skill.meowDmg, 'skill', hitEle.electro)
    ),
    meowDmgCryo: greaterEq(
      tally.moonsign,
      2,
      dmgNode('atk', dm.skill.meowDmg, 'skill', hitEle.cryo)
    ),
  },
  burst: {
    dmg: dmgNode('atk', dm.burst.skillDmg, 'burst'),
    robotDmgPyro: greaterEq(
      tally.moonsign,
      2,
      dmgNode(
        'atk',
        dm.burst.robotDmg,
        'burst',
        hitEle.pyro,
        a1_pyro_robot_dmg_mult_
      )
    ),
    robotDmgHydro: greaterEq(
      tally.moonsign,
      2,
      dmgNode(
        'atk',
        dm.burst.robotDmg,
        'burst',
        hitEle.hydro,
        a1_pyro_robot_dmg_mult_
      )
    ),
    robotDmgElectro: greaterEq(
      tally.moonsign,
      2,
      dmgNode(
        'atk',
        dm.burst.robotDmg,
        'burst',
        hitEle.electro,
        a1_pyro_robot_dmg_mult_
      )
    ),
    robotDmgCryo: greaterEq(
      tally.moonsign,
      2,
      dmgNode(
        'atk',
        dm.burst.robotDmg,
        'burst',
        hitEle.cryo,
        a1_pyro_robot_dmg_mult_
      )
    ),
    robotHeal: healNodeTalent(
      'atk',
      dm.burst.robotHealMult,
      dm.burst.robotHealFlat,
      'burst',
      undefined,
      a1_hydro_robot_heal_mult_
    ),
    lowestHeal: healNodeTalent(
      'atk',
      dm.burst.lowestHealMult,
      dm.burst.lowestHealFlat,
      'burst',
      undefined,
      a1_hydro_robot_heal_mult_
    ),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: nodeC5,
    burstBoost: nodeC3,
  },
  teamBuff: {
    premod: {
      eleMas: a4Heal_eleMas,
      critRate_: c6FlaskFull_critRate_,
      critDMG_: c6FlaskFull_critDMG_,
    },
  },
  isMoonsign: constant(1),
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
          node: infoMut(dmgFormulas.charged.aimed, {
            name: ct.chg(`auto.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.fullyAimed, {
            name: ct.chg(`auto.skillParams.4`),
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
          node: infoMut(dmgFormulas.skill.bombDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.unfilledDmg, {
            name: ct.chg(`skill.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.filledDmg, {
            name: ct.chg(`skill.skillParams.2`),
          }),
        },
        {
          text: ct.chg('skill.skillParams.3'),
          value: dm.skill.duration,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.skill.meowDmgPyro, {
            name: ct.chg(`skill.skillParams.4`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.meowDmgHydro, {
            name: ct.chg(`skill.skillParams.4`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.meowDmgElectro, {
            name: ct.chg(`skill.skillParams.4`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.meowDmgCryo, {
            name: ct.chg(`skill.skillParams.4`),
          }),
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
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
          node: infoMut(dmgFormulas.burst.robotDmgPyro, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.robotDmgHydro, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.robotDmgElectro, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.robotDmgCryo, {
            name: ct.chg(`burst.skillParams.1`),
          }),
        },
        {
          text: ct.chg('burst.skillParams.2'),
          value: dm.burst.duration,
          unit: 's',
        },
        {
          node: infoMut(dmgFormulas.burst.robotHeal, {
            name: ct.chg(`burst.skillParams.3`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.lowestHeal, {
            name: ct.chg(`burst.skillParams.4`),
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
      fields: [
        {
          canShow: (data) => data.get(a1_pyro_robot_dmg_mult_).value > 1,
          node: infoMut(a1_pyro_robot_dmg_mult_, {
            name: ct.ch('robotDmg_mult_'),
            unit: '%',
            pivot: true,
          }),
        },
        {
          canShow: (data) => data.get(a1_hydro_robot_heal_mult_).value > 1,
          node: infoMut(a1_hydro_robot_heal_mult_, {
            name: ct.ch('robotHeal_mult_'),
            unit: '%',
            pivot: true,
          }),
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4HealPath,
      value: condA4Heal,
      name: ct.ch('a4Cond'),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: infoMut(a4Heal_eleMasDisp, {
                path: 'eleMas',
                isTeamBuff: true,
              }),
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
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: nodeC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: nodeC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.condTem('constellation6', {
      path: condC6FlaskFullPath,
      value: condC6FlaskFull,
      name: ct.ch('c6Cond'),
      canShow: greaterEq(tally.moonsign, 2, 1),
      teamBuff: true,
      states: {
        on: {
          fields: [
            {
              node: c6FlaskFull_critRate_,
            },
            {
              node: c6FlaskFull_critDMG_,
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
