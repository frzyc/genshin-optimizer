import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Alhaitham'
const ct = charTemplates(key)
const formula = formulas.Alhaitham
const cond = conditionals.Alhaitham

const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    {
      type: 'text',
      text: ct.chg('auto.fields.normal'),
    },
    {
      type: 'fields',
      fields: [
        formula.normal_0,
        formula.normal_1,
        formula.normal_2,
        formula.normal_3,
        formula.normal_4,
      ].map(({ tag }, i) => ({
        title: ct.chg(`auto.skillParams.${i}`),
        fieldRef: tag,
        ...(i === 2 ? { multi: 2 } : {}),
      })),
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.charged'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.5'),
          multi: 2,
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldValue: '',
        },
      ],
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.plunging'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: stg('plunging.dmg'),
          fieldRef: formula.plunging_dmg.tag,
        },
        {
          title: stg('plunging.low'),
          fieldRef: formula.plunging_low.tag,
        },
        {
          title: stg('plunging.high'),
          fieldRef: formula.plunging_high.tag,
        },
      ],
    },
  ]),
  skill: ct.talentTem('skill', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.0'),
          fieldRef: formula.skill_rushDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.ch('projectionDmg'),
          fieldRef: formula.skill_mirrorDmg1.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.withMirrors, {
      label: ct.ch('withMirrors'),
      fields: [
        {
          title: st('infusion.dendro'),
          fieldValue: '',
        },
      ],
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_instanceDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldValue: '',
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldValue: '',
        },
        {
          title: ct.chg('burst.skillParams.3'),
          fieldValue: '',
        },
        {
          title: ct.chg('burst.skillParams.4'),
          fieldValue: '',
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('energyCost'),
          fieldValue: '',
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.debateStacks, {
      label: ct.ch('debateStacks'),
      teamBuff: true,
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.mirrorsConsumed, {
      label: ct.ch('mirrorsConsumed'),
      teamBuff: true,
      fields: [
        {
          title: stg('duration'),
          fieldValue: '15',
          unit: 's',
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.excessMirror, {
      label: ct.ch('excessMirror'),
      fields: [
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
}

export default sheet
