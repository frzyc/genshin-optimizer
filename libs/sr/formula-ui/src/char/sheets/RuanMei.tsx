import { ColorText, ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { getUnitStr, toPercent } from '@genshin-optimizer/common/util'
import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import type { CharacterKey, StatKey } from '@genshin-optimizer/sr/consts'
import {
  buffs,
  conditionals,
  formulas,
  own,
} from '@genshin-optimizer/sr/formula'
import {
  getCharStat,
  getInterpolateObject,
  mappedStats,
} from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { statToFixed } from '@genshin-optimizer/sr/util'
import { trans } from '../../util'
import { bonusStatsReqMap } from '../BonusStats'
import {
  allTalentSheetElementStatBoostKey,
  type TalentSheetElementKey,
} from '../consts'
import { EidolonSubtitle } from '../EidolonSubtitle'
import { SkillSubtitle } from '../SkillSubtitle'
const key: CharacterKey = 'RuanMei'
const [chg, _ch] = trans('char', key)
const formula = formulas.RuanMei
const cond = conditionals.RuanMei
const buff = buffs.RuanMei
const dm = mappedStats.char[key]
const stats = getCharStat(key)
const sheet: UISheet<TalentSheetElementKey> = {
  basic: {
    title: chg('abilities.basic.0.name'),
    subtitle: (
      <SkillSubtitle talentKey="basic">
        {chg('abilities.basic.0.tag')}
      </SkillSubtitle>
    ),
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
    title: chg('abilities.skill.0.name'),
    subtitle: (
      <SkillSubtitle talentKey="skill">
        {chg('abilities.skill.0.tag')}
      </SkillSubtitle>
    ),
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
    ],
  },
  ult: {
    title: chg('abilities.ult.0.name'),
    subtitle: (
      <SkillSubtitle talentKey="ult">
        {chg('abilities.ult.0.tag')}
      </SkillSubtitle>
    ),
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
    ],
  },
  talent: {
    title: chg('abilities.talent.0.name'),
    subtitle: (
      <SkillSubtitle talentKey="talent">
        {chg('abilities.talent.0.tag')}
      </SkillSubtitle>
    ),
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
    ],
  },
  technique: {
    title: chg('abilities.technique.0.name'),
    subtitle: (
      <SkillSubtitle talentKey="technique">
        {chg('abilities.technique.0.tag')}
      </SkillSubtitle>
    ),
    img: characterAsset(key, 'technique_0'),
    documents: [
      {
        type: 'text',
        text: () =>
          chg(
            `abilities.technique.0.fullDesc`,
            getInterpolateObject(key, 'technique', 0)
          ),
      },
    ],
  },
  bonusAbility1: {
    title: chg('abilities.bonusAbility1.0.name'),
    subtitle: 'Req. Character Ascension 2', // TODO: translate
    img: characterAsset(key, 'bonusAbility1'),
    documents: [
      {
        type: 'text',
        text: () =>
          chg(
            `abilities.bonusAbility1.0.fullDesc`,
            getInterpolateObject(key, 'bonusAbility1', 0)
          ),
      },
    ],
  },
  bonusAbility2: {
    title: chg('abilities.bonusAbility2.0.name'),
    subtitle: 'Req. Character Ascension 4', // TODO: translate
    img: characterAsset(key, 'bonusAbility2'),
    documents: [
      {
        type: 'text',
        text: () =>
          chg(
            `abilities.bonusAbility2.0.fullDesc`,
            getInterpolateObject(key, 'bonusAbility2', 0)
          ),
      },
    ],
  },
  bonusAbility3: {
    title: chg('abilities.bonusAbility3.0.name'),
    subtitle: 'Req. Character Ascension 6', // TODO: translate
    img: characterAsset(key, 'bonusAbility3'),
    documents: [
      {
        type: 'text',
        text: () =>
          chg(
            `abilities.bonusAbility3.0.fullDesc`,
            getInterpolateObject(key, 'bonusAbility3', 0) // TODO: FIXME: does not seem to work for bonus Stats (wrong array format)
          ),
      },
      {
        type: 'fields',
        fields: [
          {
            title: 'bonus ability 3 buff',
            fieldRef: buff.ba3_brEff_.tag,
          },
        ],
      },
      {
        type: 'fields',
        fields: [
          {
            title: 'bonus ability 3 formula',
            fieldRef: formula.ba3_brEff_.tag,
          },
        ],
      },
    ],
  },
  ...Object.fromEntries(
    allTalentSheetElementStatBoostKey.map((key, i) => [
      key,
      {
        title: `Boost ${i + 1}`, // TODO: needs "Speed Boost" from i18n
        subtitle: bonusStatsReqMap[key],
        documents: [
          {
            type: 'fields',
            fields: Object.entries(
              stats.skillTree[key]?.levels?.[0].stats ?? {}
            ).map(([statKey, value]) => ({
              title: <StatDisplay statKey={statKey as StatKey} />,
              fieldValue: toPercent(value, statKey).toFixed(
                statToFixed(statKey as any)
              ),
              unit: getUnitStr(statKey),
            })),
          },
        ],
      },
    ])
  ),

  eidolon1: {
    title: chg('ranks.1.name'),
    subtitle: <EidolonSubtitle eidolon={1} />,
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
            // TODO: defIgn_ translation
            title: 'Ignore DEF',
            fieldRef: buff.e1_defIgn_.tag,
          },
        ],
      },
    ],
  },
  eidolon2: {
    title: chg('ranks.2.name'),
    subtitle: <EidolonSubtitle eidolon={2} />,
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
    title: chg('ranks.3.name'),
    subtitle: <EidolonSubtitle eidolon={3} />,
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
    ],
  },
  eidolon4: {
    title: chg('ranks.4.name'),
    subtitle: <EidolonSubtitle eidolon={4} />,
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
            // TODO: Translation
            { title: 'Break Effect', fieldRef: buff.e4_break_.tag },
            // TODO: Translation? duration?
            { title: 'Turns', fieldValue: dm.e4.duration },
          ],
        },
      },
    ],
  },
  eidolon5: {
    title: chg('ranks.5.name'),
    subtitle: <EidolonSubtitle eidolon={5} />,
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
    ],
  },
  eidolon6: {
    title: chg('ranks.6.name'),
    subtitle: <EidolonSubtitle eidolon={6} />,
    img: characterAsset(key, 'eidolon6'),
    documents: [
      {
        type: 'text',
        text: chg(`ranks.6.desc`, getInterpolateObject(key, 'eidolon', 6)),
      },
    ],
  },
}
console.log({ stats: stats.skillTree.statBoost1.levels?.[0].stats })
export default sheet
