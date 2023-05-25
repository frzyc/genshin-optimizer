import type { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input, target } from '../../../Formula'
import type { DisplaySub } from '../../../Formula/type'
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  percent,
  prod,
  subscript,
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { CharacterSheetKey } from '../../../Types/consts'
import { cond, stg, trans } from '../../SheetUtil'
import { charTemplates } from '../charTemplates'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet.d'
import Traveler from '../Traveler'

export default function electro(
  key: CharacterSheetKey,
  charKey: CharacterKey,
  dmgForms: { [key: string]: DisplaySub }
) {
  const elementKey: ElementKey = 'electro'
  const condCharKey = 'TravelerElectro'
  const ct = charTemplates(key, Traveler.data_gen.weaponTypeKey)
  const [, ch] = trans('char', condCharKey)
  const skillParam_gen = allStats.char.skillParam.TravelerElectroF
  let s = 0,
    b = 0
  const dm = {
    skill: {
      dmg: skillParam_gen.skill[s++],
      energyRestore: skillParam_gen.skill[s++],
      amulets: 2,
      amuletDuration: skillParam_gen.skill[s++][0],
      enerRech_: skillParam_gen.skill[s++][0],
      enerRech_duration: skillParam_gen.skill[s++][0],
      cd: skillParam_gen.skill[s++][0],
    },
    burst: {
      pressDmg: skillParam_gen.burst[b++],
      thunderDmg: skillParam_gen.burst[b++],
      thunderCd: 0.5,
      energyRestore: skillParam_gen.burst[b++],
      duration: skillParam_gen.burst[b++][0],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0],
    },
    passive1: {
      cdRed: skillParam_gen.passive1[0][0],
    },
    passive2: {
      enerRech_: skillParam_gen.passive2[0][0],
    },
    constellation1: {
      addlAmulets: 1,
    },
    constellation2: {
      duration: skillParam_gen.constellation2[0],
      electro_enemyRes: skillParam_gen.constellation2[1],
    },
    constellation6: {
      numAttacks: skillParam_gen.constellation6[0],
      thunder_dmg_: skillParam_gen.constellation6[0],
      energyRestore: skillParam_gen.constellation6[1],
    },
  } as const

  const [condSkillAmuletPath, condSkillAmulet] = cond(
    condCharKey,
    `${elementKey}SkillAmulet`
  )
  const p2_enerRech_ = greaterEq(
    input.asc,
    4,
    prod(input.premod.enerRech_, percent(dm.passive2.enerRech_))
  )
  const skillAmulet_enerRech_Disp = equal(
    condSkillAmulet,
    'on',
    sum(percent(dm.skill.enerRech_), p2_enerRech_)
  )
  const skillAmulet_enerRech_ = equal(
    input.activeCharKey,
    target.charKey,
    skillAmulet_enerRech_Disp
  )

  const burstEnergyRestore = subscript(
    input.total.burstIndex,
    dm.burst.energyRestore,
    { name: ct.chg(`burst.skillParmas.2`) }
  )

  const [condC2ThunderPath, condC2Thunder] = cond(
    condCharKey,
    `${elementKey}C2Thunder`
  )
  const c2Thunder_electro_enemyRes_ = greaterEq(
    input.constellation,
    2,
    equal(condC2Thunder, 'on', dm.constellation2.electro_enemyRes)
  )

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      dmg: dmgNode('atk', dm.skill.dmg, 'skill'),
    },
    burst: {
      pressDmg: dmgNode('atk', dm.burst.pressDmg, 'burst'),
      thunderDmg: dmgNode('atk', dm.burst.thunderDmg, 'burst'),
      thirdThunderDmg: greaterEq(
        input.constellation,
        6,
        customDmgNode(
          prod(
            subscript(input.total.burstIndex, dm.burst.thunderDmg, {
              unit: '%',
            }),
            percent(dm.constellation6.thunder_dmg_),
            input.total.atk
          ),
          'burst',
          { hit: { ele: constant(elementKey) } }
        )
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
          electro_enemyRes_: c2Thunder_electro_enemyRes_,
        },
        total: {
          enerRech_: skillAmulet_enerRech_, // In total to avoid loops
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
            text: ch('skill.amuletGenAmt'),
            value: (data) =>
              data.get(input.constellation).value >= 1
                ? dm.skill.amulets + dm.constellation1.addlAmulets
                : dm.skill.amulets,
          },
          {
            text: ct.chg('skill.skillParams.4'),
            value: dm.skill.amuletDuration,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: dm.skill.cd,
            unit: 's',
            fixed: 1,
          },
        ],
      },
      ct.condTem('skill', {
        value: condSkillAmulet,
        path: condSkillAmuletPath,
        name: ch('skill.absorb'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: subscript(
                  input.total.skillIndex,
                  dm.skill.energyRestore,
                  { name: ct.chg(`skill.skillParams.1`) }
                ),
              },
              {
                node: infoMut(
                  skillAmulet_enerRech_Disp,
                  KeyMap.info('enerRech_')
                ),
              },
              {
                text: stg('duration'),
                value: dm.skill.enerRech_duration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.headerTem('passive1', {
        fields: [
          {
            text: ct.chg('passive1.description'),
          },
        ],
      }),
      ct.headerTem('passive2', {
        fields: [
          {
            node: infoMut(p2_enerRech_, { name: ch('passive2.enerRech_') }),
          },
        ],
      }),
    ]),

    burst: ct.talentTem('burst', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.pressDmg, {
              name: ct.chg(`burst.skillParams.0`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.thunderDmg, {
              name: ct.chg(`burst.skillParams.1`),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.thirdThunderDmg, {
              name: ch('burst.3rd'),
            }),
          },
          {
            text: ch('burst.thunderCd'),
            value: dm.burst.thunderCd,
            unit: 's',
            fixed: 1,
          },
          {
            node: infoMut(burstEnergyRestore, {
              name: ct.chg(`burst.skillParams.2`),
            }),
          },
          {
            text: stg('duration'),
            value: dm.burst.duration,
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
      ct.condTem('constellation2', {
        value: condC2Thunder,
        path: condC2ThunderPath,
        name: ch('c2.thunderHit'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: c2Thunder_electro_enemyRes_,
              },
              {
                text: stg('duration'),
                value: dm.constellation2.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTem('passive1'),
    passive2: ct.talentTem('passive2'),
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
