import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Ningguang'
const ct = charTemplates(key)
const formula = formulas.Ningguang
const cond = conditionals.Ningguang

const sheet: UISheet<TalentSheetElementKey> = {
  auto: ct.talentTem('auto', [
    {
      type: 'text',
      text: ct.chg('auto.fields.normal'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.0'),
          fieldRef: formula.normal_0.tag,
        },
      ],
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.charged'),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('auto.skillParams.3'),
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
          fieldRef: formula.skill_screenHp.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
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
          title: ct.chg('burst.skillParams.1'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldValue: '',
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'text',
      text: ct.ch('starJadeStaminaCost'),
    },
  ]),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.Ascension4, { teamBuff: true }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'text',
      text: ct.ch('aoeGems'),
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'text',
      text: ct.ch('skillReset'),
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.Constellation4, { teamBuff: true }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'text',
      text: ct.ch('c6bonus'),
    },
  ]),
}

export default sheet
