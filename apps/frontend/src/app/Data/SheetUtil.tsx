import type { CharacterKey } from '@genshin-optimizer/consts'
import { useContext } from 'react'
import { Translate } from '../Components/Translate'
import { SillyContext } from '../Context/SillyContext'
import type { ReadNode } from '../Formula/type'
import { customStringRead } from '../Formula/utils'
import type {
  ArtifactSetKey,
  CharacterSheetKey,
  WeaponKey,
} from '../Types/consts'

export const st = (strKey: string, values?: object) => (
  <Translate ns="sheet" key18={strKey} values={values} />
)
export const stg = (strKey: string) => (
  <Translate ns="sheet_gen" key18={strKey} />
)

export const condReadNode = (path: string[]) =>
  customStringRead(['conditional', ...path])
export function cond(
  key: CharacterKey | WeaponKey | ArtifactSetKey,
  subKey: string
): [path: string[], node: ReadNode<string>] {
  const path = [key, subKey]
  const node = condReadNode(path)
  return [path, node]
}

type Translated = [
  trg: (i18key: string) => Displayable,
  tr: (i18key: string, values?: object) => Displayable
]
type CharTransKey =
  | CharacterSheetKey
  | 'TravelerM'
  | 'TravelerF'
  | 'TravelerAnemo'
  | 'TravelerGeo'
  | 'TravelerElectro'
  | 'TravelerElectro'
export function trans(typeKey: 'char', key: CharTransKey): Translated
export function trans(typeKey: 'weapon', key: WeaponKey): Translated
export function trans(typeKey: 'artifact', key: ArtifactSetKey): Translated
export function trans(
  typeKey: 'char' | 'weapon' | 'artifact',
  key: CharTransKey | WeaponKey | ArtifactSetKey
): Translated {
  return [
    (strKey: string) => (
      <Translate ns={`${typeKey}_${key}_gen`} key18={strKey} />
    ),
    (strKey: string, values?: object) => (
      <Translate ns={`${typeKey}_${key}`} key18={strKey} values={values} />
    ),
  ]
}
export function nameTrans(
  cKey: CharTransKey,
  chg: (i18key: string) => Displayable
): Displayable {
  return <NameTrans cKey={cKey} chg={chg} />
}
function NameTrans({
  cKey,
  chg,
}: {
  cKey: string
  chg: (i18key: string) => Displayable
}) {
  const { silly } = useContext(SillyContext)
  if (silly) return <Translate ns={`sillyWisher_charNames`} key18={cKey} />
  else return chg('name') as JSX.Element
}
