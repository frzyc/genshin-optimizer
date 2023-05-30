import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import type { Data, DisplaySub } from '../../../Formula/type'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
  unequal,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterSheetKey } from '../../../Types/consts'
import { absorbableEle } from '../../../Types/consts'
import { objectKeyValueMap } from '../../../Util/Util'
import { cond, st, stg, trans } from '../../SheetUtil'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  customHealNode,
  dataObjForCharacterSheet,
  dmgNode,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'
import Traveler from '../Traveler'

export default function anemo(
  key: CharacterSheetKey,
  charKey: CharacterKey,
  dmgForms: { [key: string]: DisplaySub }
) {
  const elementKey: ElementKey = 'anemo'
  const condCharKey = 'TravelerAnemo'
  const [, ch] = trans('char', condCharKey)
  const ct = charTemplates(key, Traveler.data_gen.weaponType)

  const skillParam_gen = allStats.char.skillParam.TravelerAnemoF
  let s = 0,
    b = 0
  const dm = {
    skill: {
      initial_dmg: skillParam_gen.skill[s++],
      initial_max: skillParam_gen.skill[s++],
      ele_dmg: 0.25,
      storm_dmg: skillParam_gen.skill[s++],
      storm_max: skillParam_gen.skill[s++],
      cd: skillParam_gen.skill[s++][0],
      maxCd: skillParam_gen.skill[s++][0],
    },
    burst: {
      dmg: skillParam_gen.burst[b++],
      absorbDmg: skillParam_gen.burst[b++],
      duration: skillParam_gen.burst[b++][0],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0],
    },
    passive1: {
      dmg: 0.6,
    },
    passive2: {
      heal_: 0.02,
    },
    constellation2: {
      enerRech_: 0.16,
    },
    constellation6: {
      enemyRes_: -0.2,
    },
  } as const

  const [condSkillAbsorptionPath, condSkillAbsorption] = cond(
    condCharKey,
    'skillAbsorption'
  )

  const [condBurstAbsorptionPath, condBurstAbsorption] = cond(
    condCharKey,
    `${elementKey}BurstAbsorption`
  )

  const nodeC2 = greaterEq(input.constellation, 2, dm.constellation2.enerRech_)

  const [condC6Path, condC6] = cond(condCharKey, `${elementKey}C6Hit`)
  const nodeC6 = greaterEq(
    input.constellation,
    6,
    equal(condC6, 'on', dm.constellation6.enemyRes_)
  )
  const nodesC6 = objectKeyValueMap(absorbableEle, (ele) => [
    `${ele}_enemyRes_`,
    greaterEq(
      input.constellation,
      6,
      equal(
        condC6,
        'on',
        equal(condBurstAbsorption, ele, dm.constellation6.enemyRes_)
      )
    ),
  ])

  const absorptionData: Data = { hit: { ele: condSkillAbsorption } }

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      initial_dmg: dmgNode('atk', dm.skill.initial_dmg, 'skill'),
      initial_max: dmgNode('atk', dm.skill.initial_max, 'skill'),
      initial_ele_dmg: unequal(
        condSkillAbsorption,
        undefined,
        dmgNode(
          'atk',
          dm.skill.initial_dmg,
          'skill',
          absorptionData,
          constant(dm.skill.ele_dmg, { unit: '%' })
        )
      ),
      max_ele_dmg: unequal(
        condSkillAbsorption,
        undefined,
        dmgNode(
          'atk',
          dm.skill.initial_max,
          'skill',
          absorptionData,
          constant(dm.skill.ele_dmg, { unit: '%' })
        )
      ),
      storm_dmg: dmgNode('atk', dm.skill.storm_dmg, 'skill'),
      storm_max: dmgNode('atk', dm.skill.storm_max, 'skill'),
      storm_ele_dmg: unequal(
        condSkillAbsorption,
        undefined,
        dmgNode(
          'atk',
          dm.skill.storm_dmg,
          'skill',
          absorptionData,
          constant(dm.skill.ele_dmg, { unit: '%' })
        )
      ),
      storm_ele_max: unequal(
        condSkillAbsorption,
        undefined,
        dmgNode(
          'atk',
          dm.skill.storm_max,
          'skill',
          absorptionData,
          constant(dm.skill.ele_dmg, { unit: '%' })
        )
      ),
    },
    burst: {
      dmg: dmgNode('atk', dm.burst.dmg, 'burst'),
      absorb: unequal(
        condBurstAbsorption,
        undefined,
        dmgNode('atk', dm.burst.absorbDmg, 'burst', {
          hit: { ele: condBurstAbsorption },
        })
      ),
    },
    passive1: {
      dmg: greaterEq(
        input.asc,
        1,
        customDmgNode(prod(input.total.atk, dm.passive1.dmg), 'elemental', {
          hit: { ele: constant(elementKey) },
        })
      ),
    },
    passive2: {
      heal: greaterEq(
        input.asc,
        2,
        customHealNode(prod(percent(dm.passive2.heal_), input.total.hp))
      ),
    },
  } as const

  const nodeC3 = greaterEq(input.constellation, 3, 3)
  const nodeC5 = greaterEq(input.constellation, 5, 3)
  const data = dataObjForCharacterSheet(
    charKey,
    elementKey,
    undefined,
    Traveler.data_gen,
    dmgFormulas,
    {
      premod: {
        skillBoost: nodeC5,
        burstBoost: nodeC3,
        enerRech_: nodeC2,
      },
      teamBuff: {
        premod: {
          ...nodesC6,
          anemo_enemyRes_: nodeC6,
        },
      },
    }
  )

  const talent: TalentSheet = {
    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.initial_dmg, {
              name: ct.chg(`skill.skillParams.0`),
              multi: 2,
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.initial_max, {
              name: ct.chg(`skill.skillParams.1`),
              multi: 4,
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.storm_dmg, {
              name: ct.chg(`skill.skillParams.2`),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.storm_max, {
              name: ct.chg(`skill.skillParams.3`),
            }),
          },
          {
            text: ct.chg('skill.skillParams.4'),
            value: dm.skill.cd,
            unit: 's',
          },
          {
            text: ct.chg('skill.skillParams.5'),
            value: dm.skill.maxCd,
            unit: 's',
          },
        ],
      },
      ct.condTem('skill', {
        value: condSkillAbsorption,
        path: condSkillAbsorptionPath,
        name: st('eleAbsor'),
        states: Object.fromEntries(
          absorbableEle.map((eleKey) => [
            eleKey,
            {
              name: (
                <ColorText color={eleKey}>{stg(`element.${eleKey}`)}</ColorText>
              ),
              fields: [
                {
                  node: infoMut(dmgFormulas.skill.initial_ele_dmg, {
                    name: ch('initialEleDmg'),
                  }),
                },
                {
                  node: infoMut(dmgFormulas.skill.max_ele_dmg, {
                    name: ch('maxEleDmg'),
                    multi: 4,
                  }),
                },
                {
                  node: infoMut(dmgFormulas.skill.storm_ele_dmg, {
                    name: ch('stormEleDmg'),
                  }),
                },
                {
                  node: infoMut(dmgFormulas.skill.storm_ele_max, {
                    name: ch('stormEleMaxDmg'),
                  }),
                },
              ],
            },
          ])
        ),
      }),
      ct.headerTem('constellation4', {
        fields: [
          {
            text: ch('c4'),
            value: 10,
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
            text: ct.chg('burst.skillParams.2'),
            value: dm.burst.duration,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.3'),
            value: dm.burst.cd,
            unit: 's',
          },
          {
            text: ct.chg('burst.skillParams.4'),
            value: dm.burst.enerCost,
          },
        ],
      },
      ct.condTem('burst', {
        value: condBurstAbsorption,
        path: condBurstAbsorptionPath,
        name: st('eleAbsor'),
        states: Object.fromEntries(
          absorbableEle.map((eleKey) => [
            eleKey,
            {
              name: (
                <ColorText color={eleKey}>{stg(`element.${eleKey}`)}</ColorText>
              ),
              fields: [
                {
                  node: infoMut(dmgFormulas.burst.absorb, {
                    name: ct.chg(`burst.skillParams.1`),
                  }),
                },
              ],
            },
          ])
        ),
      }),
      ct.condTem('constellation6', {
        // C6 anemo
        value: condC6,
        path: condC6Path,
        teamBuff: true,
        name: ch('c6'),
        states: {
          on: {
            fields: [
              {
                node: infoMut(nodeC6, KeyMap.info('anemo_enemyRes_')),
              },
            ],
          },
        },
      }),
      ct.headerTem('constellation6', {
        // C6 elemental self-display
        canShow: unequal(
          condBurstAbsorption,
          undefined,
          equal(condC6, 'on', equal(target.charKey, key, 1))
        ),
        fields: absorbableEle.map((eleKey) => ({
          node: nodesC6[`${eleKey}_enemyRes_`],
        })),
      }),
      ct.condTem('constellation6', {
        // C6 elemental team-display
        value: condBurstAbsorption,
        path: condBurstAbsorptionPath,
        name: st('eleAbsor'),
        teamBuff: true,
        canShow: equal(condC6, 'on', unequal(input.activeCharKey, key, 1)),
        states: Object.fromEntries(
          absorbableEle.map((eleKey) => [
            eleKey,
            {
              name: (
                <ColorText color={eleKey}>{stg(`element.${eleKey}`)}</ColorText>
              ),
              fields: [
                {
                  node: nodesC6[`${eleKey}_enemyRes_`],
                },
              ],
            },
          ])
        ),
      }),
    ]),
    passive1: ct.talentTem('passive1', [
      ct.fieldsTem('passive1', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.dmg, { name: ch('p1') }),
          },
        ],
      }),
    ]),
    passive2: ct.talentTem('passive2', [
      ct.fieldsTem('passive2', {
        fields: [
          {
            node: infoMut(dmgFormulas.passive2.heal, { name: stg(`healing`) }),
          },
        ],
      }),
    ]),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      { fields: [{ node: nodeC2 }] },
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  }
  return {
    talent,
    data,
    elementKey,
  }
}
