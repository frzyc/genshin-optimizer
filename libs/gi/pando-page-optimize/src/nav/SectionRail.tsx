import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { TeamHeaderHeightContext } from '../context/TeamHeaderHeightContext'
import {
  OPT_SECTION_I18N,
  OPT_SECTION_ORDER,
  type OptimizeSectionId,
} from './optimizeSections'
import { SectionNavContext } from './SectionNavContext'

export function MobileSectionTabs() {
  const { t } = useTranslation('page_optimize')
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const { activeSection, scrollToSection } = useContext(SectionNavContext)

  if (isDesktop) return null

  return (
    <Tabs
      value={activeSection}
      onChange={(_, id: OptimizeSectionId) => scrollToSection(id)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label={t('sectionNavLabel')}
      sx={{
        minHeight: 40,
        mx: -0.5,
        '& .MuiTabs-indicator': { height: 3 },
        '& .MuiTab-root': {
          minHeight: 40,
          minWidth: 'auto',
          px: 1.25,
          py: 0.5,
          fontSize: '0.8125rem',
          textTransform: 'none',
        },
      }}
    >
      {OPT_SECTION_ORDER.map((id) => (
        <Tab key={id} value={id} label={t(OPT_SECTION_I18N[id])} />
      ))}
    </Tabs>
  )
}

export function DesktopSectionRail() {
  const { t } = useTranslation('page_optimize')
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const headerHeight = useContext(TeamHeaderHeightContext)
  const { activeSection, scrollToSection } = useContext(SectionNavContext)

  if (!isDesktop) return null

  return (
    <Box
      component="nav"
      aria-label={t('sectionNavLabel')}
      sx={{
        width: 152,
        flexShrink: 0,
        position: 'sticky',
        top: headerHeight + 8,
        alignSelf: 'flex-start',
        maxHeight: `calc(100vh - ${headerHeight + 16}px)`,
        overflowY: 'auto',
        borderLeft: 1,
        borderColor: 'divider',
        pl: 1,
        ml: 1,
      }}
    >
      <List dense disablePadding>
        {OPT_SECTION_ORDER.map((id) => (
          <ListItemButton
            key={id}
            selected={activeSection === id}
            onClick={() => scrollToSection(id)}
            sx={{ borderRadius: 1, py: 0.25 }}
          >
            <ListItemText
              primary={t(OPT_SECTION_I18N[id])}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}
