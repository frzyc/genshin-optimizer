import { getUnitStr, objKeyMap } from '@genshin-optimizer/common/util'
import type {
  Document,
  UISheetElement,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import {
  type CharacterGenderedKey,
  type StatKey,
  characterGenderedKeyToCharacterKey,
} from '@genshin-optimizer/sr/consts'
import { buffs, own } from '@genshin-optimizer/sr/formula'
import { Translate } from '@genshin-optimizer/sr/i18n'
import {
  getCharInterpolateObject,
  getCharStat,
} from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { trans } from '../util'
import { EidolonSubtitle } from './EidolonSubtitle'
import { SkillSubtitle } from './SkillSubtitle'
import { bonusAbilityReqMap, bonusStatsReqMap } from './StatBoostBonusAbility'
import type {
  TalentSheetElementBonusAbilityKey,
  TalentSheetElementEidolonKey,
  TalentSheetElementStatBoostKey,
} from './consts'
import { allTalentSheetElementStatBoostKey, getEidolonKey } from './consts'

export function talentSheet(
  ckey: CharacterGenderedKey,
  talentKey: 'basic' | 'skill' | 'ult' | 'talent' | 'technique',
  docs: Document[] = []
): UISheetElement {
  const [chg] = trans('char', ckey)
  return {
    title: chg(`abilities.${talentKey}.0.name`),
    subtitle: (
      <SkillSubtitle talentKey={talentKey}>
        {chg(`abilities.${talentKey}.0.tag`)}
      </SkillSubtitle>
    ),
    img: characterAsset(ckey, `${talentKey}_0`),
    documents: [
      {
        type: 'text',
        text: (calc) =>
          chg(
            `abilities.${talentKey}.0.fullDesc`,
            getCharInterpolateObject(
              characterGenderedKeyToCharacterKey(ckey),
              talentKey,
              talentKey === 'technique'
                ? 1
                : calc.compute(own.char[talentKey]).val
            )
          ),
      },
      ...docs,
    ],
  }
}
export function bonusAbilitySheet(
  ckey: CharacterGenderedKey,
  talentKey: TalentSheetElementBonusAbilityKey,
  docs: Document[] = []
): UISheetElement {
  const [chg] = trans('char', ckey)
  return {
    title: chg(`abilities.${talentKey}.0.name`),
    subtitle: bonusAbilityReqMap[talentKey].subtitle,
    img: characterAsset(ckey, talentKey),
    documents: [
      {
        type: 'text',
        text: () =>
          chg(
            `abilities.${talentKey}.0.fullDesc`,
            getCharInterpolateObject(
              characterGenderedKeyToCharacterKey(ckey),
              talentKey,
              0
            ) // TODO: FIXME: does not seem to work for bonus Stats (wrong array format)
          ),
      },
      ...docs,
    ],
  }
}
export function bonusStatsSheets(
  ckey: CharacterGenderedKey
): Record<TalentSheetElementStatBoostKey, UISheetElement> {
  return objKeyMap(allTalentSheetElementStatBoostKey, (key) => {
    const stats = getCharStat(characterGenderedKeyToCharacterKey(ckey))
    const [statKey] = Object.entries(
      stats.skillTree[key]?.levels?.[0].stats ?? {}
    )[0]
    const buff = buffs[characterGenderedKeyToCharacterKey(ckey)]
    return {
      title: <Translate ns={'charSheet_gen'} key18={`statBoost.${statKey}`} />,
      subtitle: bonusStatsReqMap[key].subtitle,
      documents: [
        {
          type: 'fields',
          fields: [
            {
              title: <StatDisplay statKey={statKey as StatKey} />,
              fieldRef: buff[key].tag,
              unit: getUnitStr(statKey),
            },
          ],
        },
      ],
    }
  })
}
export function eidolonSheet(
  ckey: CharacterGenderedKey,
  talentKey: TalentSheetElementEidolonKey,
  docs: Document[] = []
): UISheetElement {
  const [chg] = trans('char', ckey)
  const eidolonNum = getEidolonKey(talentKey)
  return {
    title: chg(`ranks.${eidolonNum}.name`),
    subtitle: <EidolonSubtitle eidolon={eidolonNum} />,
    img: characterAsset(ckey, talentKey),
    documents: [
      {
        type: 'text',
        text: chg(
          `ranks.${eidolonNum}.desc`,
          getCharInterpolateObject(
            characterGenderedKeyToCharacterKey(ckey),
            'eidolon',
            eidolonNum
          )
        ),
      },
      ...docs,
    ],
  }
}
