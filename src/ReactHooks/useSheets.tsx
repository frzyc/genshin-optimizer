import { ArtifactSheet } from "../Artifact/ArtifactSheet";
import CharacterSheet from "../Character/CharacterSheet";
import { ArtifactSetKey, CharacterKey, WeaponKey } from "../Types/consts";
import WeaponSheet from "../Weapon/WeaponSheet";
import usePromise from "./usePromise";

export type Sheets = { characterSheets: Record<CharacterKey, CharacterSheet>, weaponSheets: Record<WeaponKey, WeaponSheet>, artifactSheets: Record<ArtifactSetKey, ArtifactSheet> }
export default function useSheets() {
  return usePromise(getSheets(), [])
}

export function getSheets() {
  return Promise.all([CharacterSheet.getAll(), WeaponSheet.getAll(), ArtifactSheet.getAll()])
    .then(([characterSheets, weaponSheets, artifactSheets]) => ({ characterSheets, weaponSheets, artifactSheets }))
}