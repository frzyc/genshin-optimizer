import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const ct = charTemplates('Nahida')
const formula = formulas.Nahida
const cond = conditionals.Nahida
const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    {
      type: 'text',
      text: ct.chg('auto.fields.normal'),
    },
    {
      type: 'fields',
      fields: Object.entries(formula)
        .filter(([name]) => name.startsWith('normal'))
        .map(([_, { tag }], i) => ({
          title: ct.chg(`auto.skillParams.${i}`),
          fieldRef: tag,
        })),
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.charged'),
    },
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'conditional',
      conditional: {
        metadata: cond.partyInBurst,
        label: ct.ch('partyInBurst'),
        teamBuff: true,
      },
    },
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'conditional',
      conditional: {
        metadata: cond.a1ActiveInBurst,
        label: ct.chg('passive1.name'),
        teamBuff: true,
      },
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'conditional',
      conditional: {
        metadata: cond.c2Bloom,
        label: ct.ch('c2.bloomCondName'),
        teamBuff: true,
      },
    },
    {
      type: 'conditional',
      conditional: {
        metadata: cond.c2QSA,
        label: ct.ch('c2.qasCondName'),
        teamBuff: true,
      },
    },
  ]),
}

export default sheet
