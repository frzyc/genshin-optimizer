import { FlowerIcon } from '@genshin-optimizer/gi-svgicons'
import { GenshinUserContext, UserContext } from '@genshin-optimizer/gi-ui-next'
import { AnvilIcon } from '@genshin-optimizer/svgicons'
import {
  Article,
  Construction,
  People,
  Scanner,
  Settings,
} from '@mui/icons-material'
import { Chip } from '@mui/material'
import type { ReactNode } from 'react'
import { useContext } from 'react'
type ITab = {
  i18Key: string
  icon: JSX.Element
  to: (locale: string) => string
  value: string
  textSuffix?: ReactNode
}
const artifacts: ITab = {
  i18Key: 'tabs.artifacts',
  icon: <FlowerIcon />,
  to: (l) => `/${l}/artifact`,
  value: 'artifact',
  textSuffix: <ArtifactChip key="weaponAdd" />,
}
const weapons: ITab = {
  i18Key: 'tabs.weapons',
  icon: <AnvilIcon />,
  to: (l) => `/${l}/weapon`,
  value: 'weapon',
  textSuffix: <WeaponChip key="weaponAdd" />,
}
const characters: ITab = {
  i18Key: 'tabs.characters',
  icon: <People />,
  to: (l) => `/${l}/character`,
  value: 'character',
  textSuffix: <CharacterChip key="charAdd" />,
}
const tools: ITab = {
  i18Key: 'tabs.tools',
  icon: <Construction />,
  to: (l) => `/${l}/tools`,
  value: 'tools',
}
const scanner: ITab = {
  i18Key: 'tabs.scanner',
  icon: <Scanner />,
  to: (l) => `/${l}/scanner`,
  value: 'scanner',
}
const doc: ITab = {
  i18Key: 'tabs.doc',
  icon: <Article />,
  to: (l) => `/${l}/doc`,
  value: 'doc',
}
const setting: ITab = {
  i18Key: 'tabs.setting',
  icon: <Settings />,
  to: (l) => `/${l}/login`,
  value: 'login',
  textSuffix: <DBChip />,
}

function DBChip() {
  const { user } = useContext(UserContext)
  return <Chip color="success" label={user?.username} />
}

function ArtifactChip() {
  const { artifacts } = useContext(GenshinUserContext)

  return <Chip label={<strong>{artifacts?.length}</strong>} size="small" />
}
function CharacterChip() {
  const { characters } = useContext(GenshinUserContext)
  return <Chip label={<strong>{characters?.length}</strong>} size="small" />
}
function WeaponChip() {
  const { weapons } = useContext(GenshinUserContext)
  return <Chip label={<strong>{weapons?.length}</strong>} size="small" />
}

export const maincontent = [
  artifacts,
  weapons,
  characters,
  tools,
  scanner,
  doc,
  setting,
] as const

export const mobileContent = [
  artifacts,
  weapons,
  characters,
  tools,
  scanner,
  doc,
  setting,
] as const
