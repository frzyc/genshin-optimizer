import type { Calculator } from '@genshin-optimizer/sr/formula'
import { own } from '@genshin-optimizer/sr/formula'
import { Translate } from '@genshin-optimizer/sr/i18n'

export const bonusStatsReqMap = {
  statBoost1: {
    title: undefined,
    disabled: (calc: Calculator) => !calc.compute(own.char.statBoost1).val,
  },
  statBoost2: {
    title: <Translate ns="charSheet_gen" key18="req_asc" values={{ 1: 2 }} />, //'Req. Character Ascension 2',
    disabled: (calc: Calculator) =>
      calc.compute(own.char.ascension).val < 2 ||
      !calc.compute(own.char.statBoost2).val,
  },
  statBoost3: {
    title: <Translate ns="charSheet_gen" key18="req_asc" values={{ 1: 3 }} />, // 'Req. Character Ascension 3',
    disabled: (calc: Calculator) =>
      calc.compute(own.char.ascension).val < 3 ||
      !calc.compute(own.char.statBoost3).val,
  },
  statBoost4: {
    title: <Translate ns="charSheet_gen" key18="req_asc" values={{ 1: 3 }} />, // 'Req. Character Ascension 3',
    disabled: (calc: Calculator) =>
      calc.compute(own.char.ascension).val < 3 ||
      !calc.compute(own.char.statBoost4).val,
  },
  statBoost5: {
    title: <Translate ns="charSheet_gen" key18="req_asc" values={{ 1: 4 }} />, // 'Req. Character Ascension 4',
    disabled: (calc: Calculator) =>
      calc.compute(own.char.ascension).val < 4 ||
      !calc.compute(own.char.statBoost5).val,
  },
  statBoost6: {
    title: <Translate ns="charSheet_gen" key18="req_asc" values={{ 1: 5 }} />, // 'Req. Character Ascension 5',
    disabled: (calc: Calculator) =>
      calc.compute(own.char.ascension).val < 5 ||
      !calc.compute(own.char.statBoost6).val,
  },
  statBoost7: {
    title: <Translate ns="charSheet_gen" key18="req_asc" values={{ 1: 5 }} />, // 'Req. Character Ascension 5',
    disabled: (calc: Calculator) =>
      calc.compute(own.char.ascension).val < 5 ||
      !calc.compute(own.char.statBoost7).val,
  },
  statBoost8: {
    title: <Translate ns="charSheet_gen" key18="req_asc" values={{ 1: 6 }} />, // 'Req. Character Ascension 6',
    disabled: (calc: Calculator) =>
      calc.compute(own.char.ascension).val < 6 ||
      !calc.compute(own.char.statBoost8).val,
  },
  statBoost9: {
    title: <Translate ns="charSheet_gen" key18="req_lvl" values={{ 1: 75 }} />, // 'Req. Character Lv. 75',
    disabled: (calc: Calculator) =>
      calc.compute(own.char.lvl).val < 75 ||
      !calc.compute(own.char.statBoost9).val,
  },
  statBoost10: {
    title: <Translate ns="charSheet_gen" key18="req_lvl" values={{ 1: 80 }} />, // 'Req. Character Lv. 80',
    disabled: (calc: Calculator) =>
      calc.compute(own.char.lvl).val < 80 ||
      !calc.compute(own.char.statBoost10).val,
  },
} as const
