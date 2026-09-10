import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'KamisatoAyaka'
const ct = charTemplates(key)
const formula = formulas.KamisatoAyaka
const cond = conditionals.KamisatoAyaka

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
        ...(i === 3 ? { multi: 3 } : {}),
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
          multi: 3,
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
          fieldRef: formula.skill.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.afterSkillA1, {
      label: st('afterUse.skill'),
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_cutting.tag,
          multi: 19,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_bloom.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.afterBurst, {
      label: ct.ch('dmgBySnowflake'),
      teamBuff: true,
    }),
  ]),
  sprint: ct.talentTem('sprint', [
    charConditionalDocument(key, cond.afterSprint, {
      label: st('afterSprint'),
      fields: [
        {
          title: st('infusion.cryo'),
          variant: 'cryo',
          fieldValue: '',
        },
      ],
    }),
    charConditionalDocument(key, cond.afterApplySprint, {
      label: ct.ch('afterSprintCryo'),
    }),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.c2_cutting.tag,
          multi: 38,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.c2_bloom.tag,
          multi: 2,
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.C6, {
      label: ct.ch('c6Active'),
    }),
  ]),
}

export default sheet
