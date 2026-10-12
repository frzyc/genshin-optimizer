import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Kirara'
const ct = charTemplates(key)
const formula = formulas.Kirara
const cond = conditionals.Kirara

function normalParamIndex(index: number) {
  return index + (index < 3 ? 0 : -1)
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
          subtitle: '(1)',
          fieldRef: formula.charged_dmg1.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          subtitle: '(2)',
          multi: 2,
          fieldRef: formula.charged_dmg2.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
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
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_shield.tag,
        },
        {
          title: st('dmgAbsorption.dendro'),
          fieldRef: formula.skill_dendroShield.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_maxShield.tag,
        },
        {
          title: st('dmgAbsorption.max.dendro'),
          fieldRef: formula.skill_maxDendroShield.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.5'),
          unit: 's',
          fieldRef: formula.skill_parcelDuration.tag,
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    {
      type: 'fields',
      fields: [
        {
          title: stg('dmgAbsorption'),
          fieldRef: formula.a1_shield.tag,
        },
        {
          title: st('dmgAbsorption.dendro'),
          fieldRef: formula.a1_dendroShield.tag,
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
          title: ct.chg('burst.skillParams.2'),
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
    {
      type: 'fields',
      fields: [
        {
          title: stg('dmgAbsorption'),
          fieldRef: formula.c2_shield.tag,
        },
        {
          title: st('dmgAbsorption.dendro'),
          fieldRef: formula.c2_dendroShield.tag,
        },
        {
          title: stg('duration'),
          fieldRef: formula.c2_duration.tag,
          unit: 's',
        },
        {
          title: stg('cd'),
          fieldRef: formula.c2_cd.tag,
          unit: 's',
        },
      ],
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c4Dmg'),
          fieldRef: formula.c4.tag,
        },
        {
          title: stg('cd'),
          fieldRef: formula.c4_cd.tag,
          unit: 's',
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.c6AfterSkillBurst, {
      teamBuff: true,
      label: st('afterUse.skillOrBurst'),
    }),
  ]),
}

export default sheet
