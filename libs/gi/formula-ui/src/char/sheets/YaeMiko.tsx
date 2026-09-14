import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'YaeMiko'
const ct = charTemplates(key)
const formula = formulas.YaeMiko
const cond = conditionals.YaeMiko

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
          title: ct.chg('auto.skillParams.3'),
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_stamina.tag,
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
          title: ct.chg('skill.skillParams.4'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldRef: formula.skill_cd.tag,
        },
        {
          title: st('charges'),
          fieldValue: '',
        },
      ],
    },
    charConditionalDocument(key, cond.lockRevelation, { teamBuff: true }),
    charConditionalDocument(key, cond.lockStellarRadianceSc, {
      teamBuff: true,
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: st('elementalReaction.stellar.gainRadianceSc'),
          fieldValue: '',
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('a1Dmg'),
          fieldRef: formula.a1.tag,
        },
        {
          title: ct.ch('a1StellarDmg'),
          fieldRef: formula.a1_stellar.tag,
        },
      ],
    },
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.0'),
          fieldRef: formula.lock_skill_1.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.lock_skill_2.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.lock_skill_3.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.lock_skill_4.tag,
        },
        {
          title: ct.ch('lockStellarDmg'),
          fieldRef: formula.lock_stellar.tag,
        },
      ],
    },
  ]),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.c1, {
      teamBuff: true,
      label: st('elementalReaction.superconductOrStellarconduct'),
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2, {
      teamBuff: true,
      label: ct.ch('c2Cond'),
    }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4, {
      teamBuff: true,
      label: ct.ch('c4'),
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'text',
      text: ct.ch('c6'),
    },
  ]),
}

export default sheet
