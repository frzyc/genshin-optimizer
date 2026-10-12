import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, IconButton, ListSubheader } from '@mui/material'
import type { ReactNode } from 'react'
import {
  type OptFieldSectionKey,
  type OptPanelSectionKey,
  useOptCategoryCollapse,
} from './hooks/useOptCategoryCollapse'

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
