import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  type CharacterKey,
  type CharacterSheetKey,
  allElementKeys,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { Data, DisplaySub, NumNode } from '@genshin-optimizer/gi/wr'
import {
  equal,
  inferInfoMut,
  infoMut,
  mergeData,
} from '@genshin-optimizer/gi/wr'
import { SwitchAccessShortcut } from '@mui/icons-material'
import { cond, condReadNode, stg, trans } from '../../SheetUtil'
import { IDocumentHeader } from '../../sheet'
import { CharacterSheet } from '../CharacterSheet'
import type {
  TalentSheetElement,
  TalentSheetElementKey,
} from '../ICharacterSheet.d'
import { charTemplates } from '../charTemplates'
import { dmgNode } from '../dataUtil'

type TravelerTalentFunc = (
  key: CharacterSheetKey,
  charKey: CharacterKey,
  dmgForms: { [key: string]: DisplaySub }
) => {
  talent: Partial<Record<TalentSheetElementKey, TalentSheetElement>>
  data: Data
}
export function travelerSheet(
  key: CharacterSheetKey,
  charKey: CharacterKey,
  talentFunc: TravelerTalentFunc
) {
  const [, ch] = trans('char', 'Traveler')
  const skillParam_gen = allStats.char.skillParam[key]
  const dm = {
    normal: {
      hitArr: [
        skillParam_gen.auto[0] as number[],
        skillParam_gen.auto[1] as number[],
        skillParam_gen.auto[2] as number[],
        skillParam_gen.auto[3] as number[],
        skillParam_gen.auto[4] as number[],
      ],
    },
    charged: {
      hit1: skillParam_gen.auto[5] as number[],
      hit2: skillParam_gen.auto[6] as number[],
      stamina: skillParam_gen.auto[7][0],
    },
    plunging: {
      dmg: skillParam_gen.auto[8] as number[],
      low: skillParam_gen.auto[9] as number[],
      high: skillParam_gen.auto[10] as number[],
    },
    lockedPassive: {
      anemo: skillParam_gen.lockedPassive![0][0],
      geo: skillParam_gen.lockedPassive![1][0],
      electro: skillParam_gen.lockedPassive![2][0],
      dendro: skillParam_gen.lockedPassive![3][0],
      hydro: skillParam_gen.lockedPassive![4][0],
      pyro: skillParam_gen.lockedPassive![5][0],
      cryo: skillParam_gen.lockedPassive![6][0],
    },
  } as const

  const [condBonusCannedPath, condBonusCanned] = cond('Traveler', 'bonusCanned')
  const bonusCanned_base_atk = equal(condBonusCanned, 'on', 3, {
    path: 'atk',
    prefix: 'base',
  })
  const [condBonusSkirk1Path, condBonusSkirk1] = cond('Traveler', 'bonusSkirk1')
  const bonusSkirk1_base_atk = equal(condBonusSkirk1, 'on', 2, {
    path: 'atk',
    prefix: 'base',
  })
  const [condBonusSkirk2Path, condBonusSkirk2] = cond('Traveler', 'bonusSkirk2')
  const bonusSkirk2_eleMas = equal(condBonusSkirk2, 'on', 15, {
    path: 'eleMas',
    prefix: 'base',
  })
  const [condBonusSkirk3Path, condBonusSkirk3] = cond('Traveler', 'bonusSkirk3')
  const bonusSkirk3_base_hp = equal(condBonusSkirk3, 'on', 50, {
    path: 'hp',
    prefix: 'base',
  })

  const [condLockedPassivePath, condLockedPassive] = cond(
    'Traveler',
    'lockedPassive'
  )
  const allEleConds = objKeyMap(allElementKeys, (ele) => {
    const [path, value] = cond('Traveler', `traveler${ele}`)
    const buff = equal(
      condLockedPassive,
      'on',
      equal(value, 'on', dm.lockedPassive[ele])
    )
    return { path, value, buff }
  })
  const baseData: Data = mergeData([
    {
      base: {
        atk: bonusCanned_base_atk,
        hp: bonusSkirk3_base_hp,
      },
      premod: {
        eleMas: bonusSkirk2_eleMas,
      },
    },
    {
      base: {
        atk: bonusSkirk1_base_atk,
      },
    },
    inferInfoMut({
      premod: {
        critRate_: allEleConds.anemo.buff,
        def_: allEleConds.geo.buff,
        enerRech_: allEleConds.electro.buff,
        eleMas: allEleConds.dendro.buff,
        hp_: allEleConds.hydro.buff,
        atk_: allEleConds.pyro.buff,
        critDMG_: allEleConds.cryo.buff,
      },
    }),
  ])

  const dmgFormulas = {
    normal: Object.fromEntries(
      dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
    ),
    charged: {
      dmg1: dmgNode('atk', dm.charged.hit1, 'charged'),
      dmg2: dmgNode('atk', dm.charged.hit2, 'charged'),
    },
    plunging: Object.fromEntries(
      Object.entries(dm.plunging).map(([key, value]) => [
        key,
        dmgNode(
          'atk',
          value,
          key === 'dmg' ? 'plunging_collision' : 'plunging_impact'
        ),
      ])
    ),
  } as const

  const { talent, data } = talentFunc(key, charKey, dmgFormulas)
  const ct = charTemplates(key)

  talent.auto = ct.talentTem('auto', [
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
          node: infoMut(dmgFormulas.charged.dmg1, {
            name: ct.chg(`auto.skillParams.5`),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.dmg2, {
            name: ct.chg(`auto.skillParams.5`),
            textSuffix: '(2)',
          }),
        },
        {
          text: ct.chg('auto.skillParams.6'),
          value: dm.charged.stamina,
        },
      ],
    },
    {
      text: ct.chg('auto.fields.plunging'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.plunging['dmg'], {
            name: stg('plunging.dmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging['low'], {
            name: stg('plunging.low'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging['high'], {
            name: stg('plunging.high'),
          }),
        },
      ],
    },
  ])

  const fakeHeader = {
    action: {
      props: {
        children: {
          props: {
            key18: 'passive',
          },
        },
      },
    },
  } as IDocumentHeader
  talent.passive = {
    name: ch('questBonusTitle'),
    img: '',
    sections: [
      {
        header: fakeHeader,
        value: condBonusCanned,
        path: condBonusCannedPath,
        name: ch('bonusCanned'),
        states: {
          on: {
            fields: [
              {
                node: bonusCanned_base_atk,
              },
            ],
          },
        },
      },
      {
        header: fakeHeader,
        value: condBonusSkirk1,
        path: condBonusSkirk1Path,
        name: ch('bonusSkirk1'),
        states: {
          on: {
            fields: [
              {
                node: bonusSkirk1_base_atk,
              },
            ],
          },
        },
      },
      {
        header: fakeHeader,
        value: condBonusSkirk2,
        path: condBonusSkirk2Path,
        name: ch('bonusSkirk2'),
        states: {
          on: {
            fields: [
              {
                node: bonusSkirk2_eleMas,
              },
            ],
          },
        },
      },
      {
        header: fakeHeader,
        value: condBonusSkirk3,
        path: condBonusSkirk3Path,
        name: ch('bonusSkirk3'),
        states: {
          on: {
            fields: [
              {
                node: bonusSkirk3_base_hp,
              },
            ],
          },
        },
      },
    ],
  }

  // Insert after the passive text, but before any other element-specific stuff
  talent.lockedPassive?.sections.splice(
    1,
    0,
    ct.condTem('lockedPassive', {
      path: condLockedPassivePath,
      value: condLockedPassive,
      name: ch('lockedPassiveCond'),
      teamBuff: true,
      states: {
        on: {
          fields: Object.values(allEleConds).map(({ buff }) => ({
            node: buff,
          })),
        },
      },
    })
  )

  return new CharacterSheet(talent, mergeData([data, baseData]))
}
