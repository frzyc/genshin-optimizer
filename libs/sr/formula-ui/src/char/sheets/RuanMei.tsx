import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import {
  buffs,
  conditionals,
  formulas,
  own,
} from '@genshin-optimizer/sr/formula'
import { getInterpolateObject, mappedStats } from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { trans } from '../../util'
import type { TalentSheetElementKey } from '../consts'
const key: CharacterKey = 'RuanMei'
const [chg, _ch] = trans('char', key)
const formula = formulas.RuanMei
const cond = conditionals.RuanMei
const buff = buffs.RuanMei
const dm = mappedStats.char[key]
const sheet: UISheet<TalentSheetElementKey> = {
  basic: {
    name: chg('abilities.basic.0.name'),
    tag: chg('abilities.basic.0.tag'),
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
            title: chg('abilities.basic.0.name'),
            fieldRef: formula.basicDmg_0.tag,
          },
        ],
      },
    ],
  },
  skill: {
    name: chg('abilities.skill.0.name'),
    tag: chg('abilities.skill.0.tag'),
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
          metadata: cond.skillOvertone,
          label: 'Overtone',
          fields: [
            {
              title: 'Ally DMG Increase',
              fieldRef: buff.skillOvertone_dmg_.tag,
            },
            { title: 'weakness', fieldRef: buff.skillOvertone_weakness_.tag },
            // TODO:
            // {title:"Break Efficiency",???}
            { title: 'Duration', fieldValue: dm.skill.duration },
          ],
        },
      },
    ],
  },
  ult: {
    name: chg('abilities.ult.0.name'),
    tag: chg('abilities.ult.0.tag'),
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
              title: <StatDisplay statKey={'resPen_'} />,
              fieldRef: buff.ultZone_resPen_.tag,
            },
          ],
        },
      },
    ],
  },
  talent: {
    name: chg('abilities.talent.0.name'),
    tag: chg('abilities.talent.0.tag'),
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
      {
        type: 'fields',
        fields: [
          {
            title: <StatDisplay statKey={'spd_'} />,
            fieldRef: buff.talent_spd_.tag,
          },
        ],
      },
      // TODO: Move this to proper document, just want to visualize it for now.
      {
        type: 'fields',
        fields: [
          {
            title: 'ba3 buff',
            fieldRef: buff.ba3_brEff_.tag,
          },
        ],
      },
      {
        type: 'fields',
        fields: [
          {
            title: 'ba3 formula',
            fieldRef: formula.ba3_brEff_.tag,
          },
        ],
      },
    ],
  },
  eidolon1: {
    name: chg('ranks.1.name'),
    img: characterAsset(key, 'eidolon1'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.1.desc`, getInterpolateObject(key, 'eidolon', 1)),
      },
      {
        type: 'fields',
        fields: [
          {
            title: 'defIgn_',
            fieldRef: buff.e1_defIgn_.tag,
          },
        ],
      },
    ],
  },
  eidolon2: {
    name: chg('ranks.2.name'),
    img: characterAsset(key, 'eidolon2'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.2.desc`, getInterpolateObject(key, 'eidolon', 2)),
      },
      {
        type: 'fields',
        fields: [
          {
            title: 'atk_',
            fieldRef: buff.e2_atk_.tag,
          },
        ],
      },
    ],
  },
  eidolon3: {
    name: chg('ranks.3.name'),
    img: characterAsset(key, 'eidolon3'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.3.desc`, getInterpolateObject(key, 'eidolon', 3)),
      },
      {
        type: 'fields',
        fields: [
          {
            title: 'talent',
            fieldRef: buff.eidolon3_talent.tag,
          },
          {
            title: 'ult',
            fieldRef: buff.eidolon3_ult.tag,
          },
        ],
      },
    ],
  },
  eidolon4: {
    name: chg('ranks.4.name'),
    img: characterAsset(key, 'eidolon4'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.4.desc`, getInterpolateObject(key, 'eidolon', 4)),
      },
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
            // TODO: display node?
            { title: 'Break Effect', fieldRef: buff.e4_break_.tag },
            { title: 'Turns', fieldValue: dm.e4.duration },
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
        text: chg(`ranks.5.desc`, getInterpolateObject(key, 'eidolon', 5)),
      },
      {
        type: 'fields',
        fields: [
          {
            title: 'basic',
            fieldRef: buff.eidolon5_basic.tag,
          },
          {
            title: 'skill',
            fieldRef: buff.eidolon5_skill.tag,
          },
        ],
      },
    ],
  },
  eidolon6: {
    name: chg('ranks.6.name'),
    img: characterAsset(key, 'eidolon6'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.6.desc`, getInterpolateObject(key, 'eidolon', 6)),
      },
    ],
  },
}

export default sheet
