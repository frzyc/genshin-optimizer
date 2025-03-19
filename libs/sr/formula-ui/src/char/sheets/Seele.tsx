import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/sr/formula'
import { mappedStats } from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { trans } from '../../util'
import type { TalentSheetElementKey } from '../consts'
import {
  bonusAbilitySheet,
  bonusStatsSheets,
  eidolonSheet,
  talentSheet,
} from '../sheetUtil'

const key: CharacterKey = 'Seele'
const [chg, _ch] = trans('char', key)
const formula = formulas[key]
// TODO: Cleanup
//@ts-ignore
const cond = conditionals[key]
// TODO: Cleanup
//@ts-ignore
const buff = buffs[key]
// TODO: Cleanup
//@ts-ignore
const dm = mappedStats.char[key]

const sheet: UISheet<TalentSheetElementKey> = {
  basic: talentSheet(key, 'basic', [
    {
      type: 'fields',
      fields: [
        {
          title: chg('abilities.basic.0.name'),
          fieldRef: formula.basicDmg_0.tag,
        },
      ],
    },
  ]),
  skill: talentSheet(key, 'skill', [
    {
      type: 'fields',
      fields: [
        {
          title: chg('abilities.skill.0.name'),
          fieldRef: formula.skillDmg_0.tag,
        },
      ],
    },
    {
      type: 'conditional',
      conditional: {
        header: {
          icon: <ImgIcon src={characterAsset(key, 'skill_0')} />,
          text: 'Skill Used',
          additional: <SqBadge>Skill</SqBadge>,
        },
        metadata: cond.skillStacks,
        label: 'Skill SPD Stacks',
        fields: [
          {
            title: <StatDisplay statKey="spd_" />,
            fieldRef: buff.skill_spd_.tag,
          },
          {
            title: 'Duration',
            fieldValue: dm.skill.duration,
          },
        ],
      },
    },
  ]),
  ult: talentSheet(key, 'ult', [
    {
      type: 'fields',
      fields: [
        {
          title: chg('abilities.ult.0.name'),
          fieldRef: formula.ultDmg_0.tag,
        },
      ],
    },
  ]),
  talent: talentSheet(key, 'talent', [
    {
      type: 'conditional',
      conditional: {
        header: {
          icon: <ImgIcon src={characterAsset(key, 'talent_0')} />,
          text: 'Amplification State',
          additional: <SqBadge>Talent</SqBadge>,
        },
        metadata: cond.amplification,
        label: 'Enemy Defeated',
        fields: [
          {
            title: <StatDisplay statKey="dmg_" />,
            fieldRef: buff.amplification_dmg_.tag,
          },
        ],
      },
    },
  ]),
  technique: talentSheet(key, 'technique'),
  bonusAbility1: bonusAbilitySheet(key, 'bonusAbility1'),
  bonusAbility2: bonusAbilitySheet(key, 'bonusAbility2', [
    {
      type: 'conditional',
      conditional: {
        header: {
          icon: <ImgIcon src={characterAsset(key, 'bonusAbility2')} />,
          text: 'Lacerate',
        },
        metadata: cond.amplification,
        label: 'Enemy Defeated',
        fields: [
          {
            // TODO: Add Quantum type to resPen_
            title: <StatDisplay statKey="resPen_" />,
            fieldRef: buff.ba2_resPen_.tag,
          },
        ],
      },
    },
  ]),
  bonusAbility3: bonusAbilitySheet(key, 'bonusAbility3', []),

  ...bonusStatsSheets(key),
  eidolon1: eidolonSheet(key, 'eidolon1', [
    {
      type: 'conditional',
      conditional: {
        header: {
          icon: <ImgIcon src={characterAsset(key, 'eidolon1')} />,
          text: 'Enemy HP <= 80%',
          additional: <SqBadge>Eidolon 1</SqBadge>,
        },
        metadata: cond.enemyLowerThan80_,
        label: 'Enemy HP <= 80%',
        fields: [
          {
            title: <StatDisplay statKey="crit_" />,
            fieldRef: buff.e1_crit_.tag,
          },
        ],
      },
    },
  ]),
  eidolon2: eidolonSheet(key, 'eidolon2', []),
  eidolon3: eidolonSheet(key, 'eidolon3', [
    // {
    //   type: 'fields',
    //   fields: [
    //     {
    //       //TODO: Translate
    //       title: 'talent',
    //       fieldRef: buff.eidolon3_talent.tag,
    //     },
    //     {
    //       //TODO: Translate
    //       title: 'ult',
    //       fieldRef: buff.eidolon3_ult.tag,
    //     },
    //   ],
    // },
  ]),
  eidolon4: eidolonSheet(key, 'eidolon4', []),
  eidolon5: eidolonSheet(key, 'eidolon5', [
    // {
    //   type: 'fields',
    //   fields: [
    //     {
    //       //TODO: Translate
    //       title: 'basic',
    //       fieldRef: buff.eidolon5_basic.tag,
    //     },
    //     {
    //       //TODO: Translate
    //       title: 'skill',
    //       fieldRef: buff.eidolon5_skill.tag,
    //     },
    //   ],
    // },
  ]),
  eidolon6: eidolonSheet(key, 'eidolon6', [
    {
      type: 'fields',
      fields: [
        {
          title: chg('ranks.6.name'),
          fieldRef: formula.e6Dmg_0.tag,
        },
      ],
    },
  ]),
}
export default sheet
