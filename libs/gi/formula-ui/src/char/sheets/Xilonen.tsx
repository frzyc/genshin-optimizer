import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Xilonen'
const ct = charTemplates(key)
const formula = formulas.Xilonen
const cond = conditionals.Xilonen

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
          fieldRef: formula.charged_stam.tag,
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
          title: ct.ch('ns_dmg'),
          fieldRef: formula.plunging_ns_dmg.tag,
        },
        {
          title: ct.ch('ns_low'),
          fieldRef: formula.plunging_ns_low.tag,
        },
        {
          title: ct.ch('ns_high'),
          fieldRef: formula.plunging_ns_high.tag,
        },
      ],
    },
    {
      type: 'text',
      text: ct.chg('auto.fields.nightsoul'),
    },
    {
      type: 'fields',
      fields: [
        formula.normal_ns0,
        formula.normal_ns1,
        formula.normal_ns2,
        formula.normal_ns3,
      ].map(({ tag }, i) => ({
        title: ct.chg(`auto.skillParams.${i + 7}`),
        fieldRef: tag,
      })),
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('ns_dmg'),
          fieldRef: formula.plunging_ns_dmg.tag,
        },
        {
          title: ct.ch('ns_low'),
          fieldRef: formula.plunging_ns_low.tag,
        },
        {
          title: ct.ch('ns_high'),
          fieldRef: formula.plunging_ns_high.tag,
        },
      ],
    },
  ]),
  skill: ct.talentTem('skill', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('skill.skillParams.3'),
          unit: 's',
          fieldRef: formula.skill_nsPointTimeLimit.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.skill_nsPointLimit.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    {
      type: 'text',
      text: ct.ch('sourceActive'),
    },
    {
      type: 'text',
      text: ct.ch('geoSourceActive'),
    },
    charConditionalDocument(key, cond.sourceActive, {
      teamBuff: true,
      label: ct.ch('sourceCond'),
      fields: [
        {
          title: ct.ch('sourceActive'),
          fieldValue: '',
        },
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.skill_sourceDuration.tag,
        },
      ],
    }),
    charConditionalDocument(key, cond.nsBlessing, {
      teamBuff: true,
      label: st('nightsoul.blessing'),
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
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_heal.tag,
        },
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.burst_healDuration.tag,
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
  passive1: ct.talentTem('passive1'),
  passive2: ct.talentTem('passive2', [
    charConditionalDocument(key, cond.nsBurst, {
      label: st('nightsoul.partyBurst'),
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4Blooming, {
      teamBuff: true,
      label: ct.ch('c4Cond'),
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('healing'),
          fieldRef: formula.c6_heal.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.c6Imperishable, {
      label: ct.ch('c6Cond'),
      fields: [
        {
          title: ct.ch('c6Imperishable_normal_dmgInc'),
          fieldRef: formula.c6Imperishable_normal_dmgInc.tag,
        },
        {
          title: ct.ch('c6Imperishable_plunging_dmgInc'),
          fieldRef: formula.c6Imperishable_plunging_dmgInc.tag,
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
      ],
    }),
  ]),
}

export default sheet
