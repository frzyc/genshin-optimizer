import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Lauma'
const ct = charTemplates(key)
const formula = formulas.Lauma
const cond = conditionals.Lauma

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
          unit: '/s',
          fieldRef: formula.charged_spiritMoveStam.tag,
        },
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_spiritJumpStam.tag,
        },
        {
          title: ct.chg('auto.skillParams.5'),
          unit: 's',
          fieldRef: formula.charged_spiritDuration.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          unit: 's',
          fieldRef: formula.charged_spiritCd.tag,
        },
        {
          title: ct.chg('auto.skillParams.7'),
          fieldRef: formula.charged_spiritcallCost.tag,
        },
        {
          title: ct.chg('auto.skillParams.8'),
          fieldRef: formula.charged.tag,
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
          title: ct.chg('skill.skillParams.0'),
          fieldRef: formula.skill_pressDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_hold1Dmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_frostgroveDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          unit: 's',
          fieldRef: formula.skill_frostgroveDuration.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          unit: 's',
          fieldRef: formula.skill_moonDuration.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.skillVerdantDew),
    charConditionalDocument(key, cond.skillAfterHit, { teamBuff: true }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: stg('duration'),
          unit: 's',
          fieldRef: formula.skill_resDuration.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.burstPaleHymn, { teamBuff: true }),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1AfterSkill, { teamBuff: true }),
  ]),
  passive2: ct.talentTem('passive2', [
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
  ]),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('constellation1.skillParams.0'),
          fieldRef: formula.c1_heal.tag,
        },
        {
          title: stg('duration'),
          fieldRef: formula.c1_spiritDuration_inc.tag,
          unit: 's',
        },
        {
          title: ct.ch('c1_spiritStam_red_'),
          fieldRef: formula.c1_spiritStam_red_.tag,
        },
      ],
    },
  ]),
  constellation2: ct.talentTem('constellation2'),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4'),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('constellation6.skillParams.0'),
          fieldRef: formula.c6_dmg1.tag,
        },
        {
          title: ct.chg('constellation6.skillParams.1'),
          fieldRef: formula.c6_dmg2.tag,
        },
      ],
    },
  ]),
}

export default sheet
