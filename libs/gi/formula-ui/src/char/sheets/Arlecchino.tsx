import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Arlecchino'
const ct = charTemplates(key)
const formula = formulas.Arlecchino
const cond = conditionals.Arlecchino

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
        formula.normal_5,
      ].map(({ tag }, i) => ({
        title: ct.chg(`auto.skillParams.${i + 1}`),
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
          title: ct.chg('auto.skillParams.7'),
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.8'),
          fieldValue: '',
        },
        {
          title: ct.chg('auto.skillParams.9'),
          fieldValue: '',
          unit: '/s',
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
    {
      type: 'text',
      text: ct.chg('auto.fields.infusion'),
    },
    charConditionalDocument(key, cond.bondPercent, {
      label: st('bond.current'),
    }),
  ]),
  skill: ct.talentTem('skill', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.0'),
          fieldRef: formula.skill_spikeDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_finalDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_sigilDmg.tag,
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
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
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('bloodfireDmg'),
          fieldRef: formula.bloodfireDmg.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.c2AfterAbsorb, {
      label: ct.ch('c2Cond'),
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.c6AfterSkill, {
      label: st('afterUse.skill'),
    }),
  ]),
}

export default sheet
