import { ImgIcon } from '@genshin-optimizer/common/ui'
import { commonDefIcon, mindscapeDefIcon } from '@genshin-optimizer/zzz/assets'
import { ListSubheader } from '@mui/material'
import type { ReactNode } from 'react'

export function talentSheetElementLabel(key: string): string {
  const match = /^m(\d)$/.exec(key)
  if (match) return `Mindscape ${match[1]}`
  if (key === 'core') return 'Core'
  if (key === 'potential') return 'Potential'
  return key
}

export function talentSheetElementIcon(key: string): string | undefined {
  if (key === 'core' || key === 'potential') return commonDefIcon('coreFlat')
  const match = /^m(\d)$/.exec(key)
  if (match) return mindscapeDefIcon(Number(match[1]) as 1 | 2 | 3 | 4 | 5 | 6)
  return undefined
}

/** Flat skill icon asset key for talent-tab section headers. */
export function skillSectionFlatIconKey(skill: string): string {
  return `${skill}Flat`
}

export function OptTalentSheetSectionHeader({
  sheetKey,
}: {
  sheetKey: string
}) {
  const icon = talentSheetElementIcon(sheetKey)
  return (
    <ListSubheader
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        lineHeight: 2,
        bgcolor: 'background.paper',
      }}
    >
      {icon && <ImgIcon src={icon} size={1.25} />}
      {talentSheetElementLabel(sheetKey)}
    </ListSubheader>
  )
}

export function OptPanelSectionHeader({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ListSubheader
      sx={{
        lineHeight: 2,
        bgcolor: 'background.paper',
      }}
    >
      {children}
    </ListSubheader>
  )
}
