import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/sr/formula'
import { mappedStats } from '@genshin-optimizer/sr/stats'
import { trans } from '../../util'
import { type TalentSheetElementKey } from '../consts'
import {
  bonusAbilitySheet,
  bonusStatsSheets,
  eidolonSheet,
  talentSheet,
} from '../sheetUtil'

const key: CharacterKey = 'Robin'
const [chg, _ch] = trans('char', key)
const formula = formulas[key]
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cond = conditionals[key]
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const buff = buffs[key]
// TODO: Cleanup
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dm = mappedStats.char[key]

const sheet: UISheet<TalentSheetElementKey> = {
  basic: talentSheet(key, 'basic', [
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
  skill: talentSheet(key, 'skill', []),
  ult: talentSheet(key, 'ult', []),
  talent: talentSheet(key, 'talent', []),
  technique: talentSheet(key, 'technique'),
  bonusAbility1: bonusAbilitySheet(key, 'bonusAbility1'),
  bonusAbility2: bonusAbilitySheet(key, 'bonusAbility2'),
  bonusAbility3: bonusAbilitySheet(key, 'bonusAbility3', []),

  ...bonusStatsSheets(key),
  eidolon1: eidolonSheet(key, 'eidolon1', []),
  eidolon2: eidolonSheet(key, 'eidolon2', []),
  eidolon3: eidolonSheet(key, 'eidolon3', [
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
  eidolon4: eidolonSheet(key, 'eidolon4', []),
  eidolon5: eidolonSheet(key, 'eidolon5', [
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
  eidolon6: eidolonSheet(key, 'eidolon6'),
}
export default sheet
