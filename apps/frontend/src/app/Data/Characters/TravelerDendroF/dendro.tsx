import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import type { DisplaySub } from '../../../Formula/type'
import {
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterSheetKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import { charTemplates } from '../charTemplates'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet.d'
import Traveler from '../Traveler'

export default function dendro(
  key: CharacterSheetKey,
  charKey: CharacterKey,
  dmgForms: { [key: string]: DisplaySub }
) {
  const elementKey: ElementKey = 'dendro'
  const condCharKey = 'TravelerDendro'
  const ct = charTemplates(key, Traveler.data_gen.weaponType)

  const skillParam_gen = allStats.char.skillParam.TravelerDendroF
  let s = 0,
    b = 0
  const dm = {
    skill: {
      dmg: skillParam_gen.skill[s++],
      cd: skillParam_gen.skill[s++][0],
    },
    burst: {
      lampDmg: skillParam_gen.burst[b++],
      explosionDmg: skillParam_gen.burst[b++],
      unknown1: skillParam_gen.burst[b++],
      unknown2: skillParam_gen.burst[b++],
      lampDuration: skillParam_gen.burst[b++][0],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0],
    },
    passive1: {
      eleMas: skillParam_gen.passive1[0][0],
      maxStacks: 10,
    },
    passive2: {
      skill_dmgInc: skillParam_gen.passive2[0][0],
      burst_dmgInc: skillParam_gen.passive2[1][0],
    },
    constellation1: {
      energyRegen: 1,
    },
    constellation2: {
      durationInc: skillParam_gen.constellation2[0],
    },
    constellation6: {
      ele_dmg_: skillParam_gen.constellation6[0],
    },
  } as const

  const [condA1StacksPath, condA1Stacks] = cond(condCharKey, 'a1Stacks')
  const a1StacksArr = range(1, dm.passive1.maxStacks)
  const a1_eleMas_disp = greaterEq(
    input.asc,
    1,
    lookup(
      condA1Stacks,
      Object.fromEntries(
        a1StacksArr.map((stack) => [stack, prod(dm.passive1.eleMas, stack)])
      ),
      naught
    ),
    KeyMap.info('eleMas')
  )
  const a1_eleMas = equal(input.activeCharKey, target.charKey, a1_eleMas_disp)

  const a4_skill_dmg_ = greaterEq(
    input.asc,
    4,
    prod(percent(dm.passive2.skill_dmgInc, { fixed: 2 }), input.total.eleMas),
    { unit: '%' }
  )
  const a4_burst_dmg_ = greaterEq(
    input.asc,
    4,
    prod(percent(dm.passive2.burst_dmgInc), input.total.eleMas),
    { unit: '%' }
  )

  const [condC6BurstEffectPath, condC6BurstEffect] = cond(
    condCharKey,
    'c6BurstEffect'
  )
  const [condC6BurstElePath, condC6BurstEle] = cond(condCharKey, 'c6BurstEle')
  const c6_dendro_dmg_disp = greaterEq(
    input.constellation,
    6,
    equal(condC6BurstEffect, 'on', percent(dm.constellation6.ele_dmg_))
  )
  const c6_dendro_dmg_ = equal(
    input.activeCharKey,
    target.charKey,
    c6_dendro_dmg_disp
  )
  const c6_ele_dmg_disp = Object.fromEntries(
    ['hydro', 'pyro', 'electro'].map((ele) => [
      ele,
      greaterEq(
        input.constellation,
        6,
        equal(
          condC6BurstEffect,
          'on',
          equal(condC6BurstEle, ele, percent(dm.constellation6.ele_dmg_))
        )
      ),
    ])
  )
  const c6_ele_dmg_ = Object.fromEntries(
    Object.entries(c6_ele_dmg_disp).map(([ele, node]) => [
      `${ele}_dmg_`,
      equal(input.activeCharKey, target.charKey, node),
    ])
  )

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    },
    burst: {
      lampDmg: dmgNode('atk', dm.burst.lampDmg, 'burst'),
      explosionDmg: dmgNode('atk', dm.burst.explosionDmg, 'burst'),
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
        skill_dmg_: a4_skill_dmg_,
        burst_dmg_: a4_burst_dmg_,
      },
      teamBuff: {
        premod: {
          eleMas: a1_eleMas,
          dendro_dmg_: c6_dendro_dmg_,
          ...c6_ele_dmg_,
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
            node: infoMut(dmgFormulas.burst.lampDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.explosionDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            text: stg('duration'),
            value: (data) =>
              data.get(input.constellation).value >= 2
                ? `${dm.burst.lampDuration}s + ${
                    dm.constellation2.durationInc
                  }s = ${dm.burst.lampDuration + dm.constellation2.durationInc}`
                : dm.burst.lampDuration,
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
      ct.condTem('passive1', {
        path: condA1StacksPath,
        value: condA1Stacks,
        teamBuff: true,
        name: st('stacks'),
        states: Object.fromEntries(
          a1StacksArr.map((stack) => [
            stack,
            {
              name: st('stack', { count: stack }),
              fields: [
                {
                  node: a1_eleMas_disp,
                },
              ],
            },
          ])
        ),
      }),
      ct.headerTem('constellation2', {
        fields: [
          {
            text: st('durationInc'),
            value: dm.constellation2.durationInc,
            unit: 's',
          },
        ],
      }),
      ct.condTem('constellation6', {
        path: condC6BurstEffectPath,
        value: condC6BurstEffect,
        teamBuff: true,
        name: st('activeCharField'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(c6_dendro_dmg_disp, {
                  ...KeyMap.info('dendro_dmg_'),
                  isTeamBuff: true,
                }),
              },
            ],
          },
        },
      }),
      ct.condTem('constellation6', {
        path: condC6BurstElePath,
        value: condC6BurstEle,
        teamBuff: true,
        canShow: equal(condC6BurstEffect, 'on', 1),
        name: st('eleAbsor'),
        states: Object.fromEntries(
          Object.entries(c6_ele_dmg_disp).map(([ele, node]) => [
            ele,
            {
              name: <ColorText color={ele}>{stg(`element.${ele}`)}</ColorText>,
              fields: [
                {
                  node: infoMut(node, {
                    ...KeyMap.info(`${ele}_dmg_`),
                    isTeamBuff: true,
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
            node: a4_skill_dmg_,
          },
          {
            node: a4_burst_dmg_,
          },
        ],
      }),
    ]),
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
  }

  return {
    talent,
    data,
    elementKey,
  }
}
