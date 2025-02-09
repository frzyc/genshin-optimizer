import { ColorText, ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import type { UISheet } from '@genshin-optimizer/gameOpt/sheet-ui'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { buffs, conditionals, formulas } from '@genshin-optimizer/sr/formula'
import { mappedStats } from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { trans } from '../../util'
import { type TalentSheetElementKey } from '../consts'
import {
  bonusAbilitySheet,
  bonusStatsSheets,
  eidolonSheet,
  talentSheet,
} from '../sheetUtil'

const key: CharacterKey = 'RuanMei'
const [chg, _ch] = trans('char', key)
const formula = formulas[key]
const cond = conditionals[key]
const buff = buffs[key]
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
      type: 'conditional',
      conditional: {
        header: {
          icon: <ImgIcon src={characterAsset(key, 'skill_0')} />,
          // TODO: translate
          text: 'skill active',
          additional: <SqBadge>Skill</SqBadge>,
        },
        metadata: cond.skillOvertone,
        label: 'Overtone',
        fields: [
          {
            // TODO: translate
            title: 'Ally DMG Increase',
            fieldRef: buff.skillOvertone_dmg_.tag,
          },
          {
            title: <StatDisplay statKey="weakness_" />,
            fieldRef: buff.skillOvertone_weakness_.tag,
          },
          // TODO: translate DM "Duration"
          { title: 'Duration', fieldValue: dm.skill.duration },
        ],
      },
    },
  ]),
  ult: talentSheet(key, 'ult', [
    {
      type: 'conditional',
      conditional: {
        header: {
          icon: <ImgIcon src={characterAsset(key, 'ult_0')} />,
          text: 'ult active',
          additional: <SqBadge>Ult</SqBadge>,
        },
        metadata: cond.ultZone,
        label: 'Ult zone',
        fields: [
          {
            title: <StatDisplay statKey="resPen_" />,
            fieldRef: buff.ultZone_resPen_.tag,
          },
          // TODO: action delay % on Thanatoplum Rebloom trigger
          {
            // TODO: translate
            title: (
              <ColorText color="ice">
                Thanatoplum Rebloom Break Damage
              </ColorText>
            ),
            fieldRef: formula.zoneBreakDmg.tag,
          },
          // TODO: show the increase of dmg multipler from e6
          // TODO: translate DM "Duration"
          // TODO: show the increase of zone duration from e6
          { title: 'Duration', fieldValue: dm.ult.duration },
        ],
      },
    },
  ]),
  talent: talentSheet(key, 'talent', [
    {
      type: 'fields',
      fields: [
        {
          title: <StatDisplay statKey="spd_" />,
          fieldRef: buff.talent_spd_.tag,
        },
        {
          //TODO: translate
          title: (
            <ColorText color="ice">Somatotypical Helix Break DMG</ColorText>
          ),
          fieldRef: formula.talentBreakDmg.tag,
        },
      ],
    },
  ]),
  technique: talentSheet(key, 'technique'),
  bonusAbility1: bonusAbilitySheet(key, 'bonusAbility1'),
  bonusAbility2: bonusAbilitySheet(key, 'bonusAbility2'),
  bonusAbility3: bonusAbilitySheet(key, 'bonusAbility3', [
    {
      type: 'fields',
      fields: [
        {
          title: 'bonus ability 3 buff',
          fieldRef: buff.ba3_dmg_.tag,
        },
        {
          title: 'bonus ability 3 formula',
          fieldRef: formula.ba3_dmg_.tag,
        },
      ],
    },
  ]),

  ...bonusStatsSheets(key),
  eidolon1: eidolonSheet(key, 'eidolon1', [
    {
      type: 'fields',
      fields: [
        {
          // TODO: defIgn_ translation
          title: 'Ignore DEF',
          fieldRef: buff.e1_defIgn_.tag,
        },
      ],
    },
  ]),
  eidolon2: eidolonSheet(key, 'eidolon2', [
    {
      type: 'fields',
      fields: [
        {
          title: 'atk_',
          fieldRef: buff.e2_atk_.tag,
        },
      ],
    },
  ]),
  eidolon3: eidolonSheet(key, 'eidolon3', [
    {
      type: 'fields',
      fields: [
        {
          //TODO: Translate
          title: 'talent',
          fieldRef: buff.eidolon3_talent.tag,
        },
        {
          //TODO: Translate
          title: 'ult',
          fieldRef: buff.eidolon3_ult.tag,
        },
      ],
    },
  ]),
  eidolon4: eidolonSheet(key, 'eidolon4', [
    {
      type: 'conditional',
      conditional: {
        header: {
          icon: <ImgIcon src={characterAsset(key, 'eidolon4')} />,
          text: chg('ranks.4.name'),
          additional: <SqBadge>Eidolon 4</SqBadge>,
        },
        metadata: cond.e4Broken,
        label: 'Enemy Weakness Broken',
        fields: [
          // TODO: Translation
          { title: 'Break Effect', fieldRef: buff.e4_break_.tag },
          // TODO: Translation? duration?
          { title: 'Turns', fieldValue: dm.e4.duration },
        ],
      },
    },
  ]),
  eidolon5: eidolonSheet(key, 'eidolon5', [
    {
      type: 'fields',
      fields: [
        {
          //TODO: Translate
          title: 'basic',
          fieldRef: buff.eidolon5_basic.tag,
        },
        {
          //TODO: Translate
          title: 'skill',
          fieldRef: buff.eidolon5_skill.tag,
        },
      ],
    },
  ]),
  eidolon6: eidolonSheet(key, 'eidolon6'),
}
export default sheet
