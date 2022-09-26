import { Translate } from "../Components/Translate"
import { ReadNode } from "../Formula/type"
import { customStringRead } from "../Formula/utils"
import { ArtifactSetKey, CharacterSheetKey, NonTravelerCharacterKey, WeaponKey } from "../Types/consts"

export const st = (strKey: string, values?: object) => <Translate ns="sheet" key18={strKey} values={values} />
export const sgt = (strKey: string) => <Translate ns="sheet_gen" key18={strKey} />

export const condReadNode = (path: string[]) => customStringRead(["conditional", ...path])
export function cond(key: NonTravelerCharacterKey | "TravelerAnemo" | "TravelerGeo" | "TravelerElectro" | "TravelerDendro" | WeaponKey | ArtifactSetKey, subKey: string): [path: string[], node: ReadNode<string>] {
  const path = [key, subKey]
  const node = condReadNode(path)
  return [path, node]
}

type Translated = [tr: ((i18key: string) => Displayable), tran: ((i18key: string, values?: object) => Displayable)]
export function trans(typeKey: "char", key: CharacterSheetKey): Translated
export function trans(typeKey: "weapon", key: WeaponKey): Translated
export function trans(typeKey: "artifact", key: ArtifactSetKey): Translated
export function trans(typeKey: "char" | "weapon" | "artifact", key: CharacterSheetKey | WeaponKey | ArtifactSetKey): Translated {
  return [
    (strKey: string) => <Translate ns={`${typeKey}_${key}_gen`} key18={strKey} />,
    (strKey: string, values?: object) => <Translate ns={`${typeKey}_${key}`} key18={strKey} values={values} />
  ]
}
