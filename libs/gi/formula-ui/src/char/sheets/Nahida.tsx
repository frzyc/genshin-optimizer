import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { formulas } from '@genshin-optimizer/gi/formula'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'
const key: CharacterKey = 'Nahida'
const ct = charTemplates(key)
const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    {
      type: 'text',
      text: ct.chg('auto.fields.normal'),
    },
    {
      type: 'fields',
      fields: Object.entries(formulas.Nahida)
        .filter(([key]) => key.startsWith('normal'))
        .map(([_, { tag }], i) => ({
          title: ct.chg(`auto.skillParams.${i}`),
          fieldRef: tag,
        })),
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.charged'),
    },
    // {
    //   fields: [
    //     {
    //       node: infoMut(dmgFormulas.charged.dmg, {
    //         name: ct.chg(`auto.skillParams.4`),
    //       }),
    //     },
    //     {
    //       text: ct.chg('auto.skillParams.5'),
    //       value: dm.charged.stamina,
    //     },
    //   ],
    // },
    // {
    //   text: ct.chg(`auto.fields.plunging`),
    // },
    // {
    //   fields: [
    //     {
    //       node: infoMut(dmgFormulas.plunging.dmg, {
    //         name: stg('plunging.dmg'),
    //       }),
    //     },
    //     {
    //       node: infoMut(dmgFormulas.plunging.low, {
    //         name: stg('plunging.low'),
    //       }),
    //     },
    //     {
    //       node: infoMut(dmgFormulas.plunging.high, {
    //         name: stg('plunging.high'),
    //       }),
    //     },
    //   ],
    // },
  ]),
}

export default sheet
