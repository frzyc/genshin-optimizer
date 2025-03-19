import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type {
  CharacterGenderedKey,
  CharacterKey,
} from '@genshin-optimizer/sr/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/sr/formula'
import { mappedStats } from '@genshin-optimizer/sr/stats'
import { trans } from '../../util'
import type { TalentSheetElementKey } from '../consts'
import {
  bonusAbilitySheet,
  bonusStatsSheets,
  eidolonSheet,
  talentSheet,
} from '../sheetUtil'

const key: CharacterKey = 'TrailblazerImaginary'
// TODO: Add gender support somehow
const genderedKey: CharacterGenderedKey = 'TrailblazerImaginaryF'
const [chg, _ch] = trans('char', genderedKey)
const formula = formulas[key]
// TODO: Cleanup
//@ts-ignore
const _cond = conditionals[key]
// TODO: Cleanup
//@ts-ignore
const _buff = buffs[key]
// TODO: Cleanup
//@ts-ignore
const _dm = mappedStats.char[key]

const sheet: UISheet<TalentSheetElementKey> = {
  basic: talentSheet(genderedKey, 'basic', [
    {
      type: 'fields',
      fields: [
        {
          title: chg('abilities.basic.0.name'),
          fieldRef: formula.basicDmg_0.tag,
        },
      ],
    },
  ]),
  skill: talentSheet(genderedKey, 'skill', []),
  ult: talentSheet(genderedKey, 'ult', []),
  talent: talentSheet(genderedKey, 'talent', []),
  technique: talentSheet(genderedKey, 'technique'),
  bonusAbility1: bonusAbilitySheet(genderedKey, 'bonusAbility1'),
  bonusAbility2: bonusAbilitySheet(genderedKey, 'bonusAbility2'),
  bonusAbility3: bonusAbilitySheet(genderedKey, 'bonusAbility3', []),

  ...bonusStatsSheets(genderedKey),
  eidolon1: eidolonSheet(genderedKey, 'eidolon1', []),
  eidolon2: eidolonSheet(genderedKey, 'eidolon2', []),
  eidolon3: eidolonSheet(genderedKey, 'eidolon3', [
    // {
    //   type: 'fields',
    //   fields: [
    //     {
    //       //TODO: Translate
    //       title: 'talent',
    //       fieldRef: buff.eidolon3_talent.tag,
    //     },
    //     {
    //       //TODO: Translate
    //       title: 'ult',
    //       fieldRef: buff.eidolon3_ult.tag,
    //     },
    //   ],
    // },
  ]),
  eidolon4: eidolonSheet(genderedKey, 'eidolon4', []),
  eidolon5: eidolonSheet(genderedKey, 'eidolon5', [
    // {
    //   type: 'fields',
    //   fields: [
    //     {
    //       //TODO: Translate
    //       title: 'basic',
    //       fieldRef: buff.eidolon5_basic.tag,
    //     },
    //     {
    //       //TODO: Translate
    //       title: 'skill',
    //       fieldRef: buff.eidolon5_skill.tag,
    //     },
    //   ],
    // },
  ]),
  eidolon6: eidolonSheet(genderedKey, 'eidolon6'),
}
export default sheet
