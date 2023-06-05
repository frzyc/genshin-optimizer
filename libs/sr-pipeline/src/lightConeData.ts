import type { LightConeKey, PathKey, RarityKey } from "@genshin-optimizer/sr-consts"
import { avatarBaseTypeMap, equipmentConfig, lightconeIdMap, lightConeRarityMap } from "@genshin-optimizer/sr-dm"

export type LightConeDataGen = {
  rarity: RarityKey
  path: PathKey
}

export type LightConeDatas = Record<LightConeKey, LightConeDataGen>
export default function LightConeData() {
  return Object.fromEntries(
    Object.entries(equipmentConfig).map(
      ([lightconeId, { Rarity, AvatarBaseType }]) => {
        const result: LightConeDataGen = {
          rarity: lightConeRarityMap[Rarity],
          path: avatarBaseTypeMap[AvatarBaseType],
        }
        const lightConeKey = lightconeIdMap[lightconeId]
        return [lightConeKey, result] as const
      })
  ) as LightConeDatas
}
