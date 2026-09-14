import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Yanfei'
const ct = charTemplates(key)
const formula = formulas.Yanfei
const cond = conditionals.Yanfei

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
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_stamina.tag,
        },
        {
          title: st('staminaDec_'),
          subtitle: ct.ch('perSeal'),
          fieldValue: '',
          unit: '%',
        },
        {
          title: ct.ch('maxSeals'),
          fieldValue: '',
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldValue: '',
          unit: 's',
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
        ...[
          formula.charged_0,
          formula.charged_1,
          formula.charged_2,
          formula.charged_3,
          formula.charged_4,
        ].map(({ tag }, i) => ({
          title: ct.ch(`charged.${i}`),
          fieldRef: tag,
        })),
        {
          title: ct.chg('auto.skillParams.4'),
          fieldRef: formula.charged_stamina.tag,
        },
        {
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.sealDuration.tag,
          unit: 's',
        },
      ],
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
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
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
          title: ct.ch('burst.grantMax'),
          fieldValue: '',
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
      type: 'text',
      text: ct.ch('burst.grantMax'),
    },
    charConditionalDocument(key, cond.afterBurst, {
      fields: [
        {
          title: ct.chg('burst.skillParams.2'),
          fieldRef: formula.burst_sealInterval.tag,
          unit: 's',
        },
        {
          title: stg('duration'),
          fieldRef: formula.burst_duration.tag,
          unit: 's',
        },
      ],
    }),
  ]),
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.p1Seals),
  ]),
  passive2: ct.talentTem('passive2'),
  passive3: ct.talentTem('passive3'),
  constellation1: ct.talentTem('constellation1'),
  constellation2: ct.talentTem('constellation2', [
    charConditionalDocument(key, cond.c2EnemyHp),
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
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
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'text',
      text: ct.ch('c6.maxSealInc'),
    },
  ]),
}

export default sheet
