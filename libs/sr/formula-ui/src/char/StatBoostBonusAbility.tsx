import type { AscensionKey } from '@genshin-optimizer/sr/consts'
import type { Calculator } from '@genshin-optimizer/sr/formula'
import { own } from '@genshin-optimizer/sr/formula'
import { Translate } from '@genshin-optimizer/sr/i18n'
import type {
  TalentSheetElementBonusAbilityKey,
  TalentSheetElementStatBoostKey,
} from './consts'

export type ReqMapEntry = {
  subtitle: React.ReactNode
  onClickable: (calc: Calculator) => boolean
  disabled: (calc: Calculator) => boolean
}
function reqMapEntryAsc(
  talentKey: TalentSheetElementStatBoostKey | TalentSheetElementBonusAbilityKey,
  ascension: AscensionKey,
): ReqMapEntry {
  return {
    subtitle: (
      <Translate ns="charSheet_gen" key18="req_asc" values={{ 1: ascension }} />
    ),
    onClickable: (calc: Calculator) =>
      calc.compute(own.char.ascension).val >= ascension,
    disabled: (calc: Calculator) =>
      calc.compute(own.char.ascension).val < ascension ||
      !calc.compute(own.char[talentKey]).val,
  }
}
function reqMapEntryLvl(
  talentKey: TalentSheetElementStatBoostKey | TalentSheetElementBonusAbilityKey,
  level: number,
): ReqMapEntry {
  return {
    subtitle: (
      <Translate ns="charSheet_gen" key18="req_lvl" values={{ 1: level }} />
    ),
    onClickable: (calc: Calculator) => calc.compute(own.char.lvl).val >= level,
    disabled: (calc: Calculator) =>
      calc.compute(own.char.lvl).val < level ||
      !calc.compute(own.char[talentKey]).val,
  }
}

export const bonusStatsReqMap: Record<
  TalentSheetElementStatBoostKey,
  ReqMapEntry
> = {
  statBoost1: {
    subtitle: undefined,
    onClickable: () => true,
    disabled: (calc: Calculator) => !calc.compute(own.char.statBoost1).val,
  },
  //'Req. Character Ascension 2'
  statBoost2: reqMapEntryAsc('statBoost2', 2),
  // 'Req. Character Ascension 3'
  statBoost3: reqMapEntryAsc('statBoost3', 3),
  // 'Req. Character Ascension 3'
  statBoost4: reqMapEntryAsc('statBoost4', 3),
  // 'Req. Character Ascension 4'
  statBoost5: reqMapEntryAsc('statBoost5', 4),
  // 'Req. Character Ascension 5'
  statBoost6: reqMapEntryAsc('statBoost6', 5),
  // 'Req. Character Ascension 5'
  statBoost7: reqMapEntryAsc('statBoost7', 5),
  // 'Req. Character Ascension 6'
  statBoost8: reqMapEntryAsc('statBoost8', 6),
  // 'Req. Character Lv. 75'
  statBoost9: reqMapEntryLvl('statBoost9', 75),
  // 'Req. Character Lv. 80'
  statBoost10: reqMapEntryLvl('statBoost10', 80),
} as const

export const bonusAbilityReqMap: Record<
  TalentSheetElementBonusAbilityKey,
  ReqMapEntry
> = {
  //'Req. Character Ascension 2'
  bonusAbility1: reqMapEntryAsc('bonusAbility1', 2),
  //'Req. Character Ascension 4'
  bonusAbility2: reqMapEntryAsc('bonusAbility2', 4),
  //'Req. Character Ascension 6'
  bonusAbility3: reqMapEntryAsc('bonusAbility3', 6),
} as const
