import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Ineffa'
const ct = charTemplates(key)
const formula = formulas.Ineffa
const cond = conditionals.Ineffa

function normalParamIndex(index: number) {
  return index > 2 ? index - 1 : index
}
function normalTitleSuffix(index: number) {
  if (index === 2) return ' (1)'
  if (index === 3) return ' (2)'
  return ''
}

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
        title: `${ct.chg(`auto.skillParams.${normalParamIndex(i)}`)}${normalTitleSuffix(i)}`,
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
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged_stam.tag,
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
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_shield.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          unit: 's',
          fieldRef: formula.skill_shieldDuration.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_birgittaDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          unit: 's',
          fieldRef: formula.skill_birgittaDuration.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
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
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.burst_cd.tag,
        },
        {
          title: stg('energyCost'),
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.a1.tag,
        },
      ],
    },
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4AfterBurst, {
      teamBuff: true,
      label: st('afterUse.burst'),
      fields: [
        {
          title: ct.ch('a4AfterBurst_eleMasDisp'),
          fieldRef: formula.a4AfterBurst_eleMasDisp.tag,
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
  passive3: ct.talentTem('passive3', [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.a0_base_lc_dmg_.tag,
        },
      ],
    },
  ]),
  passive: ct.talentTem('passive'),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.c1AfterShield, {
      teamBuff: true,
      label: ct.ch('c1Cond'),
      fields: [
        {
          title: ct.ch('c1AfterShield_lc_dmg_'),
          fieldRef: formula.c1AfterShield_lc_dmg_.tag,
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.c2.tag,
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: st('dmg'),
          fieldRef: formula.c6.tag,
        },
        {
          title: stg('cd'),
          fieldRef: formula.c6_cd.tag,
          unit: 's',
        },
      ],
    },
  ]),
}

export default sheet
