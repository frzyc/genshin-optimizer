import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { conditionals } from '@genshin-optimizer/sr/formula'
import { trans } from '../../util'
import type { TalentSheetElementKey } from '../consts'
/**
 *  TODO: this is a temporary sheet used to test out conditional UI.
 */

const key: CharacterKey = 'Arlan'
const [chg, _ch] = trans('char', key)
const sheet: UISheet<TalentSheetElementKey> = {
  skill: {
    title: chg('abilities.skill.0.name'),
    img: characterAsset(key, 'skill_0'),
    documents: [
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={characterAsset(key, 'skill_0')} />,
            text: 'Bool Conditional',
            additional: <SqBadge>conditional</SqBadge>,
          },
          metadata: conditionals.Arlan.boolConditional,
          label: 'Bool Conditional',
        },
      },
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={characterAsset(key, 'skill_0')} />,
            text: 'List Conditional',
            additional: <SqBadge>Skill</SqBadge>,
          },
          metadata: conditionals.Arlan.listConditional,
          label: (_, value) =>
            value === 0 ? 'Not Enabled' : value === 1 ? 'Value 1' : 'Value 2',
          badge: (_, value) => (value === 0 ? null : value === 1 ? '1' : '2'),
        },
      },
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={characterAsset(key, 'skill_0')} />,
            text: 'Num Conditional',
            additional: <SqBadge>Skill</SqBadge>,
          },
          metadata: conditionals.Arlan.numConditional,
          label: 'Number of stacks',
          badge: 'Stacks',
        },
      },
    ],
  },
}

export default sheet
