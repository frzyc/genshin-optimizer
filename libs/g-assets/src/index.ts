import chars from "./gen/chars"
import artifacts from "./gen/artifacts"
import weapons from "./gen/weapons"
import { ArtifactSetKey, CharacterKey, charKeyToLocGenderedCharKey, GenderKey, ArtifactSlotKey, WeaponKey } from "@genshin-optimizer/consts"
type characterAssetKey = "icon" | "iconSide" | "banner" | "bar" | "skill" | "burst" | "passive1" | "passive2" | "passive3" | "constellation1" | "constellation2" | "constellation3" | "constellation4" | "constellation5" | "constellation6" | "sprint" | "passive"
export function characterAsset(ck: CharacterKey, asset: characterAssetKey, gender: GenderKey = "F"): string {
  switch (asset) {
    case "icon":
    case "iconSide":
      return chars[charKeyToLocGenderedCharKey(ck, gender)][asset] ?? "" //gender specific
    default:
      return chars[ck][asset] ?? ""
  }
}
export function artifactAsset(ak: ArtifactSetKey, slotKey: ArtifactSlotKey): string {
  return artifacts[ak][slotKey] ?? ""
}
export function weaponAsset(wk: WeaponKey, empowered = true) {
  return weapons[wk][empowered ? "awakenIcon" : "icon"] ?? weapons[wk]["icon"] ?? ""
}
