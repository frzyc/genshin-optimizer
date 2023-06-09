import { dumpFile } from "@genshin-optimizer/pipeline";
import { PROJROOT_PATH } from "../../consts";
import { RelicStatMainDMKey, statKeyMap } from "../../mapping";
import { readDMJSON } from "../../util";
import type { Value } from "../common";

export type RelicMainAffixConfig = {
  GroupID: number;
  AffixID: number;
  Property: RelicStatMainDMKey;
  BaseValue: Value;
  LevelAdd: Value;
  IsAvailable: boolean;
}
export const relicMainAffixConfig = JSON.parse(
  readDMJSON('ExcelOutput/RelicMainAffixConfig.json')
) as Record<"2" | "3" | "4" | "5", Record<string, RelicMainAffixConfig>>

const relicMainAffixConfigFlat = Object.values(relicMainAffixConfig).flatMap(o => Object.values(o))
dumpFile(`${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_gen.json`, relicMainAffixConfigFlat)

dumpFile(`${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_keys_gen.json`, [...(new Set(relicMainAffixConfigFlat.map(({ Property }) => Property)))])
dumpFile(`${PROJROOT_PATH}/src/dm/relic/RelicMainAffixConfig_keysmapped_gen.json`, [...(new Set(relicMainAffixConfigFlat.map(({ Property }) => statKeyMap[Property])))])
