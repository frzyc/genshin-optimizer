import { useDatabaseTally } from '@genshin-optimizer/common/database-ui'
import { AnvilIcon } from '@genshin-optimizer/common/svgicons'
import { useDatabaseContext } from '@genshin-optimizer/sr/ui'
import { Settings } from '@mui/icons-material'
import DiamondIcon from '@mui/icons-material/Diamond'
import GroupsIcon from '@mui/icons-material/Groups'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import { Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useMatch } from 'react-router-dom'

type ITab = {
  i18Key: string
  icon: ReactNode
  to: string
  value: string
  textSuffix?: ReactNode
}
const relics: ITab = {
  i18Key: 'tabs.relics',
  // TODO: replace with real relics icon later
  icon: <DiamondIcon />,
  to: '/relics',
  value: 'relics',
  textSuffix: <RelicChip key="relicsAdd" />,
}

const lightCones: ITab = {
  i18Key: 'tabs.lightcones',
  icon: <AnvilIcon />,
  to: '/lightcones',
  value: 'lightcones',
  textSuffix: <LightConeChip key="lightConeAdd" />,
}

const characters: ITab = {
  i18Key: 'tabs.characters',
  icon: <PersonIcon />,
  to: '/characters',
  value: 'characters',
  textSuffix: <CharacterChip key="charactersAdd" />,
}

const teams: ITab = {
  i18Key: 'tabs.teams',
  icon: <GroupsIcon />,
  to: '/teams',
  value: 'teams',
  textSuffix: <TeamChip key="charAdd" />,
}

const settings: ITab = {
  i18Key: 'tabs.settings',
  icon: <Settings />,
  to: '/settings',
  value: 'settings',
}

function RelicChip() {
  const { database } = useDatabaseContext()
  return (
    <Chip
      label={<strong>{useDatabaseTally(database.relics)}</strong>}
      size="small"
    />
  )
}

function LightConeChip() {
  const { database } = useDatabaseContext()

  return (
    <Chip
      label={<strong>{useDatabaseTally(database.lightCones)}</strong>}
      size="small"
    />
  )
}

function CharacterChip() {
  const { database } = useDatabaseContext()
  return (
    <Chip
      label={<strong>{useDatabaseTally(database.chars)}</strong>}
      size="small"
    />
  )
}

function TeamChip() {
  const { database } = useDatabaseContext()
  return (
    <Chip
      label={<strong>{useDatabaseTally(database.teams)}</strong>}
      size="small"
    />
  )
}

export default function Header({ anchor }: { anchor: string }) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
      <HeaderContent anchor={anchor} />
    </Suspense>
  )
}

const maincontent = [relics, lightCones, characters, teams, settings] as const

function HeaderContent({ anchor }: { anchor: string }) {
  const theme = useTheme()
  const isXL = useMediaQuery(theme.breakpoints.up('xl'))
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { t } = useTranslation(['ui', 'header'])
  const {
    params: { currentTab },
  } = useMatch({ path: '/:currentTab', end: false }) ?? {
    params: { currentTab: '' },
  }
  if (isMobile)
    return <MobileHeader anchor={anchor} currentTab={currentTab ?? ''} />
  return (
    <AppBar
      position="static"
      sx={{ bgcolor: '#343a40' }}
      elevation={0}
      id={anchor}
    >
      <Tabs
        value={currentTab}
        sx={{
          '& .MuiTab-root': {
            p: 1,
            minWidth: 'auto',
            minHeight: 'auto',
          },
          '& .MuiTab-root:hover': {
            transition: 'background-color 0.5s ease',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Tab
          value=""
          component={RouterLink}
          to="/"
          label={
            <Box display="flex" alignItems="center">
              <Typography variant="h6" sx={{ px: 1 }}>
                {t('pageTitle')}
              </Typography>
            </Box>
          }
        />
        {maincontent.map(({ i18Key, value, to, icon, textSuffix }) => {
          const tooltipIcon = isXL ? (
            icon
          ) : (
            <Tooltip arrow title={t(`header:${i18Key}`)}>
              {icon as JSX.Element}
            </Tooltip>
          )
          return (
            <Tab
              key={value}
              value={value}
              component={RouterLink}
              to={to}
              icon={tooltipIcon as ReactElement}
              iconPosition="start"
              label={
                isXL || textSuffix ? (
                  <Box display="flex" gap={1} alignItems="center">
                    {isXL && <span>{t(`header:${i18Key}`)}</span>}
                    {textSuffix}
                  </Box>
                ) : undefined
              }
              sx={{ ml: value === 'settings' ? 'auto' : undefined }}
            />
          )
        })}
      </Tabs>
    </AppBar>
  )
}

const mobileContent = [relics, lightCones, settings] as const
function MobileHeader({
  anchor,
  currentTab,
}: {
  anchor: string
  currentTab: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const { t } = useTranslation(['ui', 'header'])
  // Allow navigating back to the teams page when on a specific team.
  const inTeam = useMatch({ path: '/teams/:teamId/*' })
  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: '#343a40' }} elevation={0}>
        <Drawer
          anchor="right"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <List>
            <ListItemButton
              key="home"
              component={RouterLink}
              to={'/'}
              selected={currentTab === ''}
              disabled={currentTab === ''}
              onClick={handleDrawerToggle}
            >
              <ListItemText>{t('pageTitle')}</ListItemText>
            </ListItemButton>
            {mobileContent.map(
              ({ i18Key, value, to, icon, textSuffix: extra }) => (
                <ListItemButton
                  key={value}
                  component={RouterLink}
                  to={to}
                  selected={currentTab === value}
                  disabled={currentTab === value && !inTeam}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>
                    <Box display="flex" gap={1} alignItems="center">
                      {t(`header:${i18Key}`)}
                      {extra}
                    </Box>
                  </ListItemText>
                </ListItemButton>
              )
            )}
          </List>
        </Drawer>
        <Toolbar>
          <Button
            variant="text"
            sx={{ color: 'white' }}
            component={RouterLink}
            to="/"
          >
            <Typography variant="h6" noWrap component="div">
              {t('pageTitle')}
            </Typography>
          </Button>
          <Box flexGrow={1} />
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* add a blank toolbar to keep space and provide a scroll anchor */}
      <Toolbar id={anchor} />
    </>
  )
}
