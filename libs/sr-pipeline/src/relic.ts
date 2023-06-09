import type { RelicMainStatKey, RelicSubStatKey } from "@genshin-optimizer/sr-consts";
import { relicMainAffixConfig, relicSubAffixConfig, statKeyMap } from "@genshin-optimizer/sr-dm";
import { objMap } from "@genshin-optimizer/util";

type SubStat = {
  base: number//BaseValue
  step: number//StepValue
  numSteps: number//StepNum
}

type MainStat = {
  base: number//BaseValue
  add: number//LevelAdd
}

export const sub = objMap(relicSubAffixConfig, (subsObj) =>
  Object.fromEntries(Object.values(subsObj).map(({ Property, BaseValue: { Value: base }, StepValue: { Value: step }, StepNum: numSteps }) =>
    [
      statKeyMap[Property] as RelicSubStatKey,
      {
        base,
        step,
        numSteps,
      } as SubStat
    ]
  )) as Record<RelicSubStatKey, SubStat>
)

export const main = objMap(relicMainAffixConfig, (subsObj) =>
  Object.fromEntries(Object.values(subsObj).map(({ Property, BaseValue: { Value: base }, LevelAdd: { Value: add } }) =>
    [
      statKeyMap[Property] as RelicMainStatKey,
      {
        base,
        add,
      } as MainStat
    ]
  )) as Record<RelicMainStatKey, MainStat>
)
