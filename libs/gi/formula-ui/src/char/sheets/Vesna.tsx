import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = 'Vesna'
const ct = charTemplates(key)
const formula = formulas.Vesna
const cond = conditionals.Vesna

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
          title: ct.chg('auto.skillParams.6'),
          fieldRef: formula.charged.tag,
        },
        {
          title: ct.chg('auto.skillParams.7'),
          unit: 's',
          fieldRef: formula.charged_stam.tag,
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
          fieldRef: formula.skill_skillDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.1'),
          fieldRef: formula.skill_sword1Dmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.2'),
          fieldRef: formula.skill_sword2Dmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.3'),
          fieldRef: formula.skill_sword2SpiritDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.4'),
          fieldRef: formula.skill_sword3SpiritDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.5'),
          fieldRef: formula.skill_sword3SpiritFinalDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.6'),
          fieldRef: formula.skill_sword2SpiritStellarswirlDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.7'),
          fieldRef: formula.skill_sword3SpiritStellarswirlDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.8'),
          fieldRef: formula.skill_sword3SpiritFinalStellarswirlDmg.tag,
        },
        {
          title: ct.chg('skill.skillParams.9'),
          fieldRef: formula.skill_windPinionDmg.tag,
        },
        {
          title: stg('cd'),
          unit: 's',
          fieldRef: formula.skill_cd.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.skillArmed, {
      label: ct.ch('skillArmedCond'),
      fields: [
        {
          title: st('infusion.anemo'),
          variant: 'anemo',
          fieldValue: '',
        },
        {
          title: ct.chg('skill.skillParams.10'),
          unit: 's',
          fieldRef: formula.skill_duration.tag,
        },
      ],
    }),
  ]),
  burst: ct.talentTem('burst', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.chg('burst.skillParams.0'),
          fieldRef: formula.burst_spiritDmg.tag,
        },
        {
          title: ct.chg('burst.skillParams.1'),
          fieldRef: formula.burst_spiritStellarswirlDmg.tag,
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
  passive1: ct.talentTem('passive1', [
    charConditionalDocument(key, cond.a1Stacks, {
      label: ct.ch('a1StacksCond'),
      fields: [
        {
          title: ct.ch('spiritMult_'),
          fieldRef: formula.a1Stacks_spiritMult_.tag,
        },
      ],
    }),
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c2Stacks_atk_'),
          fieldRef: formula.c2Stacks_atk_.tag,
        },
      ],
    },
  ]),
  passive2: ct.talentTem('passive2', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('a4Radiance_atk_'),
          fieldRef: formula.a4Radiance_atk_.tag,
        },
        {
          title: ct.ch('a4Radiance_eleMas'),
          fieldRef: formula.a4Radiance_eleMas.tag,
        },
      ],
    },
  ]),
  passive3: ct.talentTem('passive3', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('a0_stellarswirl_baseDmg_'),
          fieldRef: formula.a0_stellarswirl_baseDmg_.tag,
        },
      ],
    },
    charConditionalDocument(key, cond.a0StellarRadiance, {
      label: st('elementalReaction.team.stellarswirl'),
      teamBuff: true,
      fields: [
        {
          title: st('elementalReaction.stellar.gainRadianceSs'),
          fieldValue: '',
        },
        {
          title: stg('duration'),
          fieldValue: '8',
          unit: 's',
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    charConditionalDocument(key, cond.skillArmed, {
      label: ct.ch('skillArmedCond'),
      fields: [
        {
          title: ct.ch('c1Armed_stellarswirl_dmg_'),
          fieldRef: formula.c1Armed_stellarswirl_dmg_.tag,
        },
      ],
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    {
      type: 'text',
      text: st('talentEnhance.passive1'),
    },
  ]),
  constellation3: ct.talentTem('constellation3'),
  constellation4: ct.talentTem('constellation4', [
    {
      type: 'text',
      text: st('talentEnhance.passive2'),
    },
  ]),
  constellation5: ct.talentTem('constellation5'),
  constellation6: ct.talentTem('constellation6', [
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('transposeDmg'),
          fieldRef: formula.constellation6_transposeDmg.tag,
        },
        {
          title: ct.ch('transposeSwordDmg'),
          fieldRef: formula.constellation6_swordDmg.tag,
        },
        {
          title: ct.ch('transposeSwordStellarswirlDmg'),
          fieldRef: formula.constellation6_swordStellarswirlDmg.tag,
        },
      ],
    },
    {
      type: 'fields',
      fields: [
        {
          title: ct.ch('c6_stellarswirl_specialDmg_'),
          fieldRef: formula.c6_stellarswirl_specialDmg_.tag,
        },
      ],
    },
  ]),
}

export default sheet
