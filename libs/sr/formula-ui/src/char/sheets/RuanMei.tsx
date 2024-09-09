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
        text: (calculator) =>
          chg(
            `abilities.basic.0.fullDesc`,
            getInterpolateObject(
              key,
              'basic',
              calculator.compute(own.char.basic).val
            )
          ),
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
        text: (calculator) =>
          chg(
            `abilities.skill.0.fullDesc`,
            getInterpolateObject(
              key,
              'skill',
              calculator.compute(own.char.skill).val
            )
          ),
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
          fields: [
            // TODO:
            // {title:"Ally DMG Increase", ???},
            // {title:"Break Efficiency",???}
            { title: 'Duration', fieldValue: 3 },
          ],
        },
      },
    ],
  },
  ult: {
    name: chg('abilities.ult.0.name'),
    img: characterAsset(key, 'ult_0'),
    documents: [
      {
        type: 'text',
        text: (calculator) =>
          chg(
            `abilities.ult.0.fullDesc`,
            getInterpolateObject(
              key,
              'ult',
              calculator.compute(own.char.ult).val
            )
          ),
      },
    ],
  },
  talent: {
    name: chg('abilities.talent.0.name'),
    img: characterAsset(key, 'talent_0'),
    documents: [
      {
        type: 'text',
        text: (calculator) =>
          chg(
            `abilities.talent.0.fullDesc`,
            getInterpolateObject(
              key,
              'talent',
              calculator.compute(own.char.talent).val
            )
          ),
      },
    ],
  },
  eidolon1: {
    name: chg('ranks.1.name'),
    img: characterAsset(key, 'eidolon1'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.1.desc`),
      },
    ],
  },
  eidolon2: {
    name: chg('ranks.2.name'),
    img: characterAsset(key, 'eidolon2'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.2.desc`),
      },
    ],
  },
  eidolon3: {
    name: chg('ranks.3.name'),
    img: characterAsset(key, 'eidolon3'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.3.desc`),
      },
    ],
  },
  eidolon4: {
    name: chg('ranks.4.name'),
    img: characterAsset(key, 'eidolon4'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.4.desc`),
      },
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={characterAsset(key, 'eidolon4')} />,
            text: chg('ranks.4.name'),
            additional: <SqBadge>Eidolon 4</SqBadge>,
          },
          metadata: conditionals.RuanMei.e4Broken,
          label: 'Enemy Weakness Broken',
          fields: [
            // TODO: display node?
            // {title:"Break Effect",fieldRef:formulas.RuanMei.e4Broken},
            { title: 'Turns', fieldValue: 2 },
          ],
        },
      },
    ],
  },
  eidolon5: {
    name: chg('ranks.5.name'),
    img: characterAsset(key, 'eidolon5'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.5.desc`),
      },
    ],
  },
  eidolon6: {
    name: chg('ranks.6.name'),
    img: characterAsset(key, 'eidolon6'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.6.desc`),
      },
    ],
  },
}

export default sheet
