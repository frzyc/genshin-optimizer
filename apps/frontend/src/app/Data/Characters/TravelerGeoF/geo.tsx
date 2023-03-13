import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { input, target } from '../../../Formula'
import type { DisplaySub } from '../../../Formula/type'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterSheetKey } from '../../../Types/consts'
import { cond, st, stg, trans } from '../../SheetUtil'
import { charTemplates } from '../charTemplates'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet.d'
import Traveler from '../Traveler'
import skillParam_gen from './skillParam_gen.json'

export default function geo(
  key: CharacterSheetKey,
  charKey: CharacterKey,
  dmgForms: { [key: string]: DisplaySub }
) {
  const elementKey: ElementKey = 'geo'
  const condCharKey = 'TravelerGeo'
  const ct = charTemplates(key, Traveler.data_gen.weaponTypeKey)
  const [, ch] = trans('char', condCharKey)

  let s = 0,
    b = 0
  const dm = {
    skill: {
      dmg: skillParam_gen.skill[s++],
      duration: skillParam_gen.skill[s++][0],
      cd: skillParam_gen.skill[s++][0],
    },
    burst: {
      dmg: skillParam_gen.burst[b++],
      numShockwaves: 4,
      duration: skillParam_gen.burst[b++][0],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0],
    },
    passive1: {
      skill_cdRed: 2,
    },
    passive2: {
      geoDmg: percent(0.6),
    },
    constellation1: {
      critRate_: percent(0.1),
    },
    constellation4: {
      energyRestore: 5,
      maxTriggers: 5,
    },
    constellation6: {
      burstDuration: 5,
      skillDuration: 10,
    },
  } as const

  const [condC1BurstAreaPath, condC1BurstArea] = cond(
    condCharKey,
    `${elementKey}C1BurstArea`
  )
  const c1BurstArea_critRate_Disp = greaterEq(
    input.constellation,
    1,
    equal(condC1BurstArea, 'on', dm.constellation1.critRate_)
  )
  const c1BurstArea_critRate_ = equal(
    input.activeCharKey,
    target.charKey,
    c1BurstArea_critRate_Disp
  )

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    },
    burst: {
      dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
    },
    passive2: {
      dmg: customDmgNode(
        prod(input.total.atk, dm.passive2.geoDmg),
        'elemental',
        { hit: { ele: constant('geo') } }
      ),
    },
    constellation2: {
      dmg: greaterEq(
        input.constellation,
        2,
        dmgNode('atk', dm.skill.dmg, 'skill')
      ),
    },
  } as const

  const burstC3 = greaterEq(input.constellation, 3, 3)
  const skillC5 = greaterEq(input.constellation, 5, 3)

  const data = dataObjForCharacterSheet(
    charKey,
    elementKey,
    undefined,
    Traveler.data_gen,
    dmgFormulas,
    {
      premod: {
        skillBoost: skillC5,
        burstBoost: burstC3,
      },
      teamBuff: {
        premod: {
          critRate_: c1BurstArea_critRate_,
        },
      },
    }
  )

  const talent: TalentSheet = {
    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.dmg, {
              name: ct.chg(`skill.skillParams.0`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.1'),
            value: (data) =>
              data.get(input.constellation).value >= 6
                ? `${dm.skill.duration}s + ${
                    dm.constellation6.skillDuration
                  }s = ${dm.skill.duration + dm.constellation6.skillDuration}`
                : dm.skill.duration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: (data) =>
              data.get(input.asc).value >= 1
                ? `${dm.skill.cd}s - ${dm.passive1.skill_cdRed}s = ${
                    dm.skill.cd - dm.passive1.skill_cdRed
                  }`
                : dm.skill.cd,
            unit: 's',
          },
        ],
      },
      ct.headerTem('passive1', {
        fields: [
          {
            text: st('skillCDRed'),
            value: dm.passive1.skill_cdRed,
            unit: 's',
          },
        ],
      }),
      ct.headerTem('constellation2', {
        fields: [
          {
            node: infoMut(dmgFormulas.constellation2.dmg, {
              name: ch('c2.key'),
            }),
          },
        ],
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            text: st('durationInc'),
            value: dm.constellation6.skillDuration,
            unit: 's',
          },
        ],
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.dmg, {
              name: stg(`skillDMG`),
              multi: dm.burst.numShockwaves,
            }),
          },
          {
            text: ct.chg('burst.skillParams.1'),
            value: (data) =>
              data.get(input.constellation).value >= 6
                ? `${dm.burst.duration}s + ${
                    dm.constellation6.burstDuration
                  }s = ${dm.burst.duration + dm.constellation6.burstDuration}`
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
      ct.condTem('constellation1', {
        value: condC1BurstArea,
        path: condC1BurstAreaPath,
        name: st('activeCharField'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: infoMut(
                  c1BurstArea_critRate_Disp,
                  KeyMap.info('critRate_')
                ),
              },
              {
                text: st('incInterRes'),
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation4', {
        fields: [
          {
            text: ch('c4.energyRestore'),
            value: dm.constellation4.energyRestore,
          },
        ],
      }),
      ct.headerTem('constellation6', {
        fields: [
          {
            text: st('durationInc'),
            value: dm.constellation6.burstDuration,
            unit: 's',
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive2.dmg, {
              name: ch('passive2.key'),
            }),
          },
        ],
      }),
    ]),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2'),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  }
  return {
    talent,
    data,
    elementKey,
  }
}
