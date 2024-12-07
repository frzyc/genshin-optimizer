import {
  getUnitStr,
  objKeyMap,
  toPercent,
} from '@genshin-optimizer/common/util'
import type {
  Document,
  UISheetElement,
} from '@genshin-optimizer/pando/ui-sheet'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import type {
  CharacterGenderedKey,
  StatKey,
} from '@genshin-optimizer/sr/consts'
import { Translate } from '@genshin-optimizer/sr/i18n'
import {
  getCharInterpolateObject,
  getCharStat,
} from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { statToFixed } from '@genshin-optimizer/sr/util'
import { trans } from '../util'
import type {
  TalentSheetElementBonusAbilityKey,
  TalentSheetElementEidolonKey,
  TalentSheetElementStatBoostKey,
} from './consts'
import { allTalentSheetElementStatBoostKey, getEidolonKey } from './consts'
import { EidolonSubtitle } from './EidolonSubtitle'
import { SkillSubtitle } from './SkillSubtitle'
import { bonusAbilityReqMap, bonusStatsReqMap } from './StatBoostBonusAbility'

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
        text: () =>
          chg(
            `abilities.${talentKey}.0.fullDesc`,
            getCharInterpolateObject(ckey, talentKey, 0)
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
            getCharInterpolateObject(ckey, talentKey, 0) // TODO: FIXME: does not seem to work for bonus Stats (wrong array format)
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
    const stats = getCharStat(ckey)
    const [statKey, value] = Object.entries(
      stats.skillTree[key]?.levels?.[0].stats ?? {}
    )[0]
    return {
      title: <Translate ns={'charSheet_gen'} key18={`statBoost.${statKey}`} />,
      subtitle: bonusStatsReqMap[key].subtitle,
      documents: [
        {
          type: 'fields',
          fields: [
            {
              title: <StatDisplay statKey={statKey as StatKey} />,
              fieldValue: toPercent(value, statKey).toFixed(
                statToFixed(statKey as any)
              ),
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
          getCharInterpolateObject(ckey, 'eidolon', eidolonNum)
        ),
      },
      ...docs,
    ],
  }
}
