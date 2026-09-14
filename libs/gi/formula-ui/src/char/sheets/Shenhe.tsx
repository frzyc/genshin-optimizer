import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Shenhe'
const ct = charTemplates(key)
const formula = formulas.Shenhe
const cond = conditionals.Shenhe

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
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged_stamina.tag,
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
          fieldRef: formula.skill_press.tag,
        },
        {
          title: ct.ch('pressDuration'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.ch('pressQuota'),
          fieldValue: '',
        },
        {
          title: stg('press.cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_hold.tag,
        },
        {
          title: ct.ch('holdDuration'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.ch('holdQuota'),
          fieldValue: '',
        },
        {
          title: stg('hold.cd'),
          unit: 's',
          fieldRef: formula.skill_cdHold.tag,
        },
        {
          title: st('charges'),
          fieldValue: '',
        },
      ],
    },
    {
      type: 'text',
      text: ct.chg('constellation6.description'),
    },
    charConditionalDocument(key, cond.quill, {
      teamBuff: true,
      label: ct.ch('quill'),
      fields: [
        {
          title: ct.ch('quill'),
          fieldRef: formula.quillDmgInc.tag,
        },
      ],
    }),
    charConditionalDocument(key, cond.asc4Hold, {
      teamBuff: true,
      label: st('afterUse.skillHold'),
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_dot.tag,
        },
        {
          title: ct.chg('burst.skillParams.3'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.4'),
          unit: 's',
          fieldRef: formula.burst_cd.tag,
        },
        {
          title: ct.chg('burst.skillParams.5'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
    {
      type: 'fields',
      fields: [
        {
          title: st('durationInc'),
          fieldValue: '6',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.burst, {
      teamBuff: true,
      label: st('opponentsField'),
    }),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.asc1, {
      teamBuff: true,
      label: st('activeCharField'),
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.asc4, {
      teamBuff: true,
      label: st('afterUse.skillPress'),
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'fields',
      fields: [
        {
          title: st('addlCharges'),
          fieldValue: '1',
        },
      ],
    },
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4, {
      label: ct.ch('c4'),
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
