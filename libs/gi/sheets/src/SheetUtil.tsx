import type {
  ArtifactSetKey,
  CharacterKey,
  CharacterSheetKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { SillyContext, Translate } from '@genshin-optimizer/gi/ui'
import type { Info, NumNode, ReadNode, StrNode } from '@genshin-optimizer/gi/wr'
import {
  customStringRead,
  equal,
  infoMut,
  input,
} from '@genshin-optimizer/gi/wr'
import type { ReactNode } from 'react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export const st = (
  strKey: string,
  values?: Record<string, string | number>
) => <Translate ns="sheet" key18={strKey} values={values} />
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
  trg: (i18key: string) => ReactNode,
  tr: (i18key: string, values?: Record<string, string | number>) => ReactNode
]
type CharTransKey =
  | CharacterSheetKey
  | 'TravelerM'
  | 'TravelerF'
  | 'TravelerAnemo'
  | 'TravelerGeo'
  | 'TravelerElectro'
  | 'TravelerDendro'
  | 'TravelerHydro'
export function trans(typeKey: 'char', key: CharTransKey): Translated
export function trans(typeKey: 'weapon', key: WeaponKey): Translated
export function trans(typeKey: 'artifact', key: ArtifactSetKey): Translated
export function trans(
  typeKey: 'char' | 'weapon' | 'artifact',
  key: CharTransKey | WeaponKey | ArtifactSetKey
): Translated {
  const nogen =
    (typeKey === 'char' && key === 'Somnia') ||
    (typeKey === 'weapon' && key === 'QuantumCatalyst')
  return [
    (strKey: string) => (
      <Translate
        ns={nogen ? `${typeKey}_${key}` : `${typeKey}_${key}_gen`}
        key18={strKey}
      />
    ),
    (strKey: string, values?: Record<string, string | number>) => (
      <Translate ns={`${typeKey}_${key}`} key18={strKey} values={values} />
    ),
  ]
}
export function nameTrans(
  cKey: CharTransKey,
  chg: (i18key: string) => ReactNode
): ReactNode {
  return <NameTrans cKey={cKey} chg={chg} />
}
function NameTrans({
  cKey,
  chg,
}: {
  cKey: string
  chg: (i18key: string) => ReactNode
}) {
  const { silly } = useContext(SillyContext)
  const { i18n } = useTranslation('sillyWisher_charNames')
  if (silly && i18n.exists(`sillyWisher_charNames:${cKey}`))
    return <Translate ns={`sillyWisher_charNames`} key18={cKey} />
  else return chg('name') as JSX.Element
}

export function activeCharBuff(
  buffTargetKey: string | StrNode,
  node: NumNode,
  info: Info
) {
  return [
    infoMut(node, { ...info, isTeamBuff: true }),
    equal(input.activeCharKey, buffTargetKey, node),
  ]
}
