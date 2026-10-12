import { ImgIcon } from '@genshin-optimizer/common/ui'
import { commonDefIcon, mindscapeDefIcon } from '@genshin-optimizer/zzz/assets'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, IconButton, ListSubheader } from '@mui/material'
import type { ReactNode } from 'react'
import {
  type OptFieldSectionKey,
  type OptPanelSectionKey,
  useOptCategoryCollapse,
} from './hooks/useOptCategoryCollapse'

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

export function OptCollapsibleSectionHeader({
  sectionKey,
  children,
}: {
  sectionKey: OptFieldSectionKey
  children: ReactNode
}) {
  const collapse = useOptCategoryCollapse()
  const collapsed = collapse?.isCollapsed(sectionKey) ?? false

  if (!collapse) {
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
        {children}
      </ListSubheader>
    )
  }

  return (
    <ListSubheader
      disableSticky
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 0.5,
        lineHeight: 2,
        bgcolor: 'background.paper',
        cursor: 'pointer',
        pr: 0.5,
      }}
      onClick={(e) => {
        e.stopPropagation()
        collapse.toggleCollapsed(sectionKey)
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        {children}
      </Box>
      <IconButton
        size="small"
        aria-label={collapsed ? 'Expand section' : 'Collapse section'}
        onClick={(e) => {
          e.stopPropagation()
          collapse.toggleCollapsed(sectionKey)
        }}
      >
        {collapsed ? (
          <ExpandMoreIcon fontSize="small" />
        ) : (
          <ExpandLessIcon fontSize="small" />
        )}
      </IconButton>
    </ListSubheader>
  )
}

export function OptPanelSectionHeader({
  section,
  children,
}: {
  section: OptPanelSectionKey
  children: ReactNode
}) {
  return (
    <OptCollapsibleSectionHeader sectionKey={section}>
      {children}
    </OptCollapsibleSectionHeader>
  )
}
