import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Dori'
const ct = charTemplates(key)
const formula = formulas.Dori
const cond = conditionals.Dori

function normalParamIndex(index: number) {
  return index + (index < 1 ? 0 : -1)
}
function normalTitleSuffix(index: number) {
  if (index === 1) return ' (1)'
  if (index === 2) return ' (2)'
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
          title: ct.chg('auto.skillParams.5'),
          unit: '/s',
          fieldRef: formula.charged_stamina.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          unit: 's',
          fieldRef: formula.charged_duration.tag,
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
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    {
      type: 'fields',
      fields: [
        {
          title: stg('energyRegen'),
          fieldRef: formula.a4_energyRegen.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.c4BelowEner, {
      teamBuff: true,
      label: ct.ch('c4ConnectedBelowEner'),
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_heal.tag,
        },
        {
          title: stg('energyRegen'),
          fieldValue: '',
        },
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.burst_duration.tag,
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
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c2DmgKey'),
          fieldRef: formula.c2.tag,
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4BelowHp, {
      teamBuff: true,
      label: ct.ch('c4ConnectedBelowHp'),
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.c6AfterSkill, {
      label: st('afterUse.skill'),
      fields: [
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('hpRegenPerHit'),
          fieldRef: formula.c6_heal.tag,
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
}

export default sheet
