import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Columbina'
const ct = charTemplates(key)
const formula = formulas.Columbina
const cond = conditionals.Columbina

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
        {
          title: ct.chg('auto.skillParams.5'),
          multi: 3,
          fieldRef: formula.charged_dewDmg.tag,
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
          fieldRef: formula.skill_continuousDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_lunarchargedDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          multi: 5,
          fieldRef: formula.skill_lunarbloomDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.skill_lunarcrystallizeDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldValue: '',
        },
        {
          title: ct.chg('skill.skillParams.6'),
          fieldRef: formula.skill_duration.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.c2Lunarbloom),
    charConditionalDocument(key, cond.c2Lunarcrystallize),
    charConditionalDocument(key, cond.c6Lunarbloom),
    charConditionalDocument(key, cond.c6Lunarcrystallize),
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
          fieldRef: formula.burst_enerCost.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.burstDomain, { teamBuff: true }),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1Stacks),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('constellation1.skillParams.0'),
          fieldRef: formula.c1_shield.tag,
        },
        {
          title: ct.chg('constellation1.skillParams.1'),
          fieldRef: formula.c1_shieldHydro.tag,
        },
      ],
    },
  ]),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2Brilliance, { teamBuff: true }),
    charConditionalDocument(key, cond.c2Lunarcharged, { teamBuff: true }),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    charConditionalDocument(key, cond.c4Buff, {
      fields: [
        {
          title: ct.ch('c4Buff_lunarcharged_dmgInc'),
          fieldRef: formula.c4Buff_lunarcharged_dmgInc.tag,
        },
        {
          title: ct.ch('c4Buff_lunarbloom_dmgInc'),
          fieldRef: formula.c4Buff_lunarbloom_dmgInc.tag,
        },
        {
          title: ct.ch('c4Buff_lunarcrystallize_dmgInc'),
          fieldRef: formula.c4Buff_lunarcrystallize_dmgInc.tag,
        },
        {
          title: stg('cd'),
          fieldValue: '',
          unit: 's',
        },
      ],
    }),
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    charConditionalDocument(key, cond.c6Lunarcharged, {
      teamBuff: true,
    }),
  ]),
}

export default sheet
