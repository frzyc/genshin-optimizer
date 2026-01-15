import type {
  CharacterKey,
  CharacterSheetKey,
  ElementKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { DisplaySub } from '@genshin-optimizer/gi/wr'
import {
  constant,
  equal,
  greaterEq,
  inferInfoMut,
  infoMut,
  input,
  percent,
  prod,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../SheetUtil'
import type { TalentSheet } from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  hitEle,
} from '../dataUtil'

export default function geo(
  key: CharacterSheetKey,
  charKey: CharacterKey,
  dmgForms: { [key: string]: DisplaySub }
) {
  const elementKey: ElementKey = 'geo'
  const condCharKey = 'TravelerGeo'
  const ct = charTemplates(key)
  const [, ch] = trans('char', condCharKey)
  const skillParam_gen = allStats.char.skillParam.TravelerGeoF
  let s = 0,
    b = 0
  const dm = {
    charged: {
      dmg1: skillParam_gen.auto[5],
      dmg2: skillParam_gen.auto[6],
    },
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
    lockedPassive: {
      charged_dmgInc: skillParam_gen.lockedPassive![7][0],
      cd: skillParam_gen.lockedPassive![8][0],
      shield_: skillParam_gen.lockedPassive![9][0],
      duration: skillParam_gen.lockedPassive![10][0],
      one: skillParam_gen.lockedPassive![11][0],
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

  const [, condLockedPassive] = cond('Traveler', 'lockedPassive')
  const lockedPassive_charged_dmgInc = equal(
    condLockedPassive,
    'on',
    prod(percent(dm.lockedPassive.charged_dmgInc), input.total.atk)
  )
  const lockedPassiveData = inferInfoMut({
    ...hitEle.geo,
    premod: { charged_dmgInc: lockedPassive_charged_dmgInc },
  })
  const [condLockedPassiveHitPath, condLockedPassiveHit] = cond(
    condCharKey,
    'lockedPassiveHit'
  )
  const lockedPassiveHit_shield_ = equal(
    condLockedPassive,
    'on',
    equal(condLockedPassiveHit, 'on', dm.lockedPassive.shield_)
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
    lockedPassive: {
      dmg1: equal(
        condLockedPassive,
        'on',
        dmgNode('atk', dm.charged.dmg1, 'charged', lockedPassiveData)
      ),
      dmg2: equal(
        condLockedPassive,
        'on',
        dmgNode('atk', dm.charged.dmg2, 'charged', lockedPassiveData)
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

  const data = dataObjForCharacterSheet(charKey, dmgFormulas, {
    premod: {
      skillBoost: skillC5,
      burstBoost: burstC3,
    },
    teamBuff: {
      premod: {
        critRate_: c1BurstArea_critRate_,
        shield_: lockedPassiveHit_shield_,
      },
    },
  })

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
              name: ct.chg('burst.skillParams.0'),
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
                node: infoMut(c1BurstArea_critRate_Disp, { path: 'critRate_' }),
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
            text: st('enerRegenPerHit'),
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
    lockedPassive: ct.talentTem('lockedPassive', [
      ct.fieldsTem('lockedPassive', {
        canShow: equal(condLockedPassive, 'on', 1),
        fields: [
          {
            node: infoMut(dmgFormulas.lockedPassive.dmg1, {
              name: ct.chg('auto.skillParams.5'),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.lockedPassive.dmg2, {
              name: ct.chg('auto.skillParams.5'),
              textSuffix: '(2)',
            }),
          },
          {
            node: lockedPassive_charged_dmgInc,
          },
          {
            text: stg('cd'),
            value: dm.lockedPassive.cd,
            unit: 's',
          },
        ],
      }),
      ct.condTem('lockedPassive', {
        canShow: equal(condLockedPassive, 'on', 1),
        path: condLockedPassiveHitPath,
        value: condLockedPassiveHit,
        name: st('hitOp.none'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: lockedPassiveHit_shield_,
              },
              {
                text: stg('duration'),
                value: dm.lockedPassive.duration,
                unit: 's',
              },
            ],
          },
        },
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
  }
}
