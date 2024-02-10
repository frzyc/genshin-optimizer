import { objKeyMap } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../Formula'
import type { DisplaySub } from '../../../Formula/type'
import {
  equal,
  greaterEq,
  infoMut,
  lookup,
  min,
  naught,
  percent,
  prod,
  subscript,
} from '../../../Formula/utils'
import type { CharacterSheetKey } from '../../../Types/consts'
import { cond, st, stg, trans } from '../../SheetUtil'
import type { TalentSheet } from '../ICharacterSheet'
import Traveler from '../Traveler'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  shieldElement,
  shieldNode,
} from '../dataUtil'

export default function dendro(
  key: CharacterSheetKey,
  charKey: CharacterKey,
  dmgForms: { [key: string]: DisplaySub }
) {
  const elementKey: ElementKey = 'hydro'
  const condCharKey = 'TravelerHydro'
  const ct = charTemplates(key, Traveler.data_gen.weaponType)
  const [, ch] = trans('char', condCharKey)

  const skillParam_gen = allStats.char.skillParam.TravelerHydroF
  let s = 0,
    b = 0
  const dm = {
    skill: {
      dewdropDmg: skillParam_gen.skill[s++],
      surgeDmg: skillParam_gen.skill[s++],
      thornDmg: skillParam_gen.skill[s++],
      thornInterval: skillParam_gen.skill[s++][0],
      hpCost: skillParam_gen.skill[s++][0],
      dmgBonus: skillParam_gen.skill[s++],
      suffusionLimit: skillParam_gen.skill[s++][0],
      cd: skillParam_gen.skill[s++][0],
      holdDuration: skillParam_gen.skill[s++][0],
    },
    burst: {
      dmg: skillParam_gen.burst[b++],
      duration: skillParam_gen.burst[b++][0],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0],
    },
    passive1: {
      numDropsPerSec: skillParam_gen.passive1[0][0],
      maxDrops: skillParam_gen.passive1[1][0],
      heal: skillParam_gen.passive1[2][0],
    },
    passive2: {
      surge_dmgInc: skillParam_gen.passive2[0][0],
      maxSurge_dmgInc: skillParam_gen.passive2[1][0],
    },
    constellation1: {
      energyRegen: skillParam_gen.constellation1[0],
    },
    constellation2: {
      movementSpdDec: skillParam_gen.constellation2[0],
      durationInc: skillParam_gen.constellation2[1],
    },
    constellation4: {
      shield_: skillParam_gen.constellation4[0],
      restoreInterval: skillParam_gen.constellation4[1],
      restore_: 0.1,
    },
    constellation6: {
      heal: skillParam_gen.constellation6[0],
    },
  } as const

  const [condSkillSuffusionPath, condSkillSuffusion] = cond(
    condCharKey,
    'suffusion'
  )
  const suffusion_dewdrop_dmgInc = equal(
    condSkillSuffusion,
    'on',
    prod(
      subscript(input.total.skillIndex, dm.skill.dmgBonus, { unit: '%' }),
      input.total.hp
    )
  )

  const suffusion_hpCost = prod(percent(dm.skill.hpCost), input.total.hp)

  const a4HpConsumedPercentArr = [
    dm.skill.hpCost,
    2 * dm.skill.hpCost,
    3 * dm.skill.hpCost,
    4 * dm.skill.hpCost,
    5 * dm.skill.hpCost,
    6 * dm.skill.hpCost,
  ]
  const [condA4HpConsumedPercentPath, condA4HpConsumedPercent] = cond(
    condCharKey,
    'a4HpConsumedPercent'
  )
  const a4HpConsumed = lookup(
    condA4HpConsumedPercent,
    objKeyMap(a4HpConsumedPercentArr, (percentage) =>
      prod(input.total.hp, percent(percentage))
    ),
    naught
  )
  const a4HpConsumed_surge_dmgInc = greaterEq(
    input.asc,
    4,
    min(
      dm.passive2.maxSurge_dmgInc,
      prod(percent(dm.passive2.surge_dmgInc), a4HpConsumed)
    )
  )

  const c4Shield = greaterEq(
    input.constellation,
    4,
    shieldNode('hp', dm.constellation4.shield_, 0)
  )
  const c4HydroShield = greaterEq(
    input.constellation,
    4,
    shieldElement('hydro', c4Shield)
  )
  // Taken off of optimization targets as it scales on receiving character's HP.
  const c6healing = greaterEq(
    input.constellation,
    6,
    healNode('hp', dm.constellation6.heal, 0)
  )

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      surgeDmg: dmgNode('atk', dm.skill.surgeDmg, 'skill', {
        premod: { skill_dmgInc: a4HpConsumed_surge_dmgInc },
      }),
      dewdropDmg: dmgNode('atk', dm.skill.dewdropDmg, 'skill', {
        premod: { skill_dmgInc: suffusion_dewdrop_dmgInc },
      }),
      thornDmg: dmgNode('atk', dm.skill.thornDmg, 'skill'),
      suffusion_hpCost,
      suffusion_dewdrop_dmgInc,
    },
    burst: {
      dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    },
    passive1: {
      heal: greaterEq(input.asc, 1, healNode('hp', dm.passive1.heal, 0)),
    },
    passive2: {
      a4HpConsumed_surge_dmgInc,
    },
    constellation4: {
      c4Shield,
      c4HydroShield,
    },
  } as const

  const skillC3 = greaterEq(input.constellation, 3, 3)
  const burstC5 = greaterEq(input.constellation, 5, 3)

  const data = dataObjForCharacterSheet(
    charKey,
    elementKey,
    undefined,
    Traveler.data_gen,
    dmgFormulas,
    {
      premod: {
        burstBoost: burstC5,
        skillBoost: skillC3,
      },
    }
  )

  const talent: TalentSheet = {
    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.surgeDmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.dewdropDmg, {
              name: ct.chg(`skill.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.thornDmg, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.3'),
            value: dm.skill.thornInterval,
            unit: 's',
          },
          {
            node: infoMut(dmgFormulas.skill.suffusion_hpCost, {
              name: ct.chg('skill.skillParams.4'),
            }),
          },
          {
            text: ct.chg('skill.skillParams.6'),
            value: dm.skill.holdDuration,
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
        value: condSkillSuffusion,
        path: condSkillSuffusionPath,
        name: ch('skillCondName'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(dmgFormulas.skill.suffusion_dewdrop_dmgInc, {
                  name: ch('dewdropDmgInc'),
                }),
              },
            ],
          },
        },
      }),
      ct.condTem('passive2', {
        value: condA4HpConsumedPercent,
        path: condA4HpConsumedPercentPath,
        name: ch('a4CondName'),
        states: objKeyMap(a4HpConsumedPercentArr, (percent) => ({
          name: `${percent * 100}%`,
          fields: [
            {
              node: infoMut(dmgFormulas.passive2.a4HpConsumed_surge_dmgInc, {
                name: ch('surgeDmgInc'),
              }),
            },
          ],
        })),
      }),
      ct.headerTem('constellation4', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation4.c4Shield, {
              name: st('dmgAbsorption.none'),
            }),
          },
          {
            node: infoMut(dmgFormulas.constellation4.c4HydroShield, {
              name: st('dmgAbsorption.hydro'),
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
            value: (data) =>
              data.get(input.constellation).value >= 2
                ? `${dm.burst.duration}s + ${
                    dm.constellation2.durationInc
                  }s = ${dm.burst.duration + dm.constellation2.durationInc}`
                : dm.burst.duration,
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
      ct.headerTem('constellation2', {
        fields: [
          {
            text: KeyMap.getStr('moveSPD_'),
            value: dm.constellation2.movementSpdDec * -100,
            unit: '%',
          },
          {
            text: st('durationInc'),
            value: dm.constellation2.durationInc,
            unit: 's',
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.heal, { name: stg('healing') }),
          },
        ],
      },
      ct.headerTem('constellation1', {
        fields: [
          {
            text: stg('energyRegen'),
            value: dm.constellation1.energyRegen,
          },
        ],
      }),
    ]),
    passive2: ct.talentTem('passive2'),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: skillC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: burstC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6', [
      ct.headerTem('constellation6', {
        fields: [
          {
            node: infoMut(c6healing, {
              name: stg('healing'),
            }),
          },
        ],
      }),
    ]),
  }

  return {
    talent,
    data,
    elementKey,
  }
}
