import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'YumemizukiMizuki'
const ct = charTemplates(key)
const formula = formulas.YumemizukiMizuki
const cond = conditionals.YumemizukiMizuki

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
          fieldValue: '',
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
          title: stg('plunging.high'),
          fieldRef: formula.plunging_high.tag,
        },
        {
          title: stg('plunging.low'),
          fieldRef: formula.plunging_low.tag,
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
          fieldRef: formula.skill_contDmg.tag,
        },
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.skillDream, { teamBuff: true }),
    charConditionalDocument(key, cond.lockRevelation),
    charConditionalDocument(key, cond.lockStellarRadiance),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: st('elementalReaction.stellar.gainRadianceSs'),
          fieldValue: '',
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.a4Phec, { teamBuff: true }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
      ],
    },
    charConditionalDocument(key, cond.c1Awaiting, { teamBuff: true }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c1Awaiting_swirl_dmgInc'),
          fieldRef: formula.c1Awaiting_swirl_dmgInc.tag,
        },
        {
          title: ct.ch('c1Awaiting_stellarswirl_dmgInc'),
          fieldRef: formula.c1Awaiting_stellarswirl_dmgInc.tag,
        },
        {
          title: stg('duration'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
        {
          title: st('triggerQuota'),
          fieldValue: '',
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
          title: stg('healing'),
          fieldRef: formula.c4_heal.tag,
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c6_critRate_'),
          fieldRef: formula.c6_critRate_.tag,
        },
        {
          title: ct.ch('c6_critDMG_'),
          fieldRef: formula.c6_critDMG_.tag,
        },
      ],
    },
  ]),
}

export default sheet
