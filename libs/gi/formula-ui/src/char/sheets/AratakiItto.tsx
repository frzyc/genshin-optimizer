import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'AratakiItto'
const ct = charTemplates(key)
const formula = formulas.AratakiItto
const cond = conditionals.AratakiItto

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
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_akSlash.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          fieldRef: formula.charged_akFinal.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.ss_duration.tag,
          unit: 's',
        },
        {
          title: ct.chg('auto.skillParams.7'),
          fieldRef: formula.charged_sSlash.tag,
        },
        {
          title: ct.chg('auto.skillParams.8'),
          fieldRef: formula.charged_stam.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.passive1, {
      label: ct.ch('a1.name'),
    }),
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('a4:dmgInc'),
          fieldRef: formula.a4_kesagiri_dmgInc.tag,
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
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_hp.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_duration.tag,
          unit: 's',
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_cd.tag,
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
          title: ct.chg('burst.skillParams.3'),
          fieldRef: formula.burst_cd.tag,
          unit: 's',
        },
        {
          title: ct.chg('burst.skillParams.4'),
          fieldRef: formula.burst_cost.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.burst, {
      fields: [
        {
          title: st('infusion.geo'),
          variant: 'geo',
          fieldValue: '',
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_atkFromDef.tag,
        },
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_duration.tag,
          unit: 's',
        },
      ],
    }),
    charConditionalDocument(key, cond.constellation4, {
      teamBuff: true,
      fields: [
        {
          title: stg('duration'),
          fieldValue: '10',
          unit: 's',
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6'),
}

export default sheet
