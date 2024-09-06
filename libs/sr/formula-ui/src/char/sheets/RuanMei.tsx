import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { conditionals, formulas, own } from '@genshin-optimizer/sr/formula'
import { getInterpolateObject } from '@genshin-optimizer/sr/stats'
import { trans } from '../../util'
import type { TalentSheetElementKey } from '../consts'
const key: CharacterKey = 'RuanMei'
const [chg, _ch] = trans('char', key)
const sheet: UISheet<TalentSheetElementKey> = {
  basic: {
    name: chg('abilities.basic.0.name'),
    img: characterAsset(key, 'basic_0'),
    documents: [
      {
        type: 'text',
        text: (calculator) => {
          const basicLevel = calculator.compute(own.char.basic).val
          return chg(
            `abilities.basic.0.fullDesc`,
            getInterpolateObject(key, 'basic', basicLevel)
          )
        },
      },
      {
        type: 'fields',
        fields: [
          {
            title: chg('abilities.basic.0.shortDesc'),
            fieldRef: formulas.RuanMei.basicDmg_0.tag,
          },
        ],
      },
    ],
  },
  skill: {
    name: chg('abilities.skill.0.name'),
    img: characterAsset(key, 'skill_0'),
    documents: [
      {
        type: 'text',
        text: (calculator) => {
          const basicLevel = calculator.compute(own.char.basic).val
          return chg(
            `abilities.skill.0.fullDesc`,
            getInterpolateObject(key, 'skill', basicLevel)
          )
        },
      },
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={characterAsset(key, 'skill_0')} />,
            text: 'skill active',
            additional: <SqBadge>Skill</SqBadge>,
          },
          metadata: conditionals.RuanMei.skillOvertone,
          label: 'Overtone',
          fields: [{ title: 'Duration', fieldValue: 3 }],
        },
      },
    ],
  },
}

export default sheet
