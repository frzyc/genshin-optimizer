import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { Data, DisplaySub } from '@genshin-optimizer/gi/wr'
import { infoMut } from '@genshin-optimizer/gi/wr'
import { stg } from '../../SheetUtil'
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
  } as const

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
            name: ct.chg('auto.skillParams.5'),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.charged.dmg2, {
            name: ct.chg('auto.skillParams.5'),
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
  ])

  return new CharacterSheet(talent, data)
}
