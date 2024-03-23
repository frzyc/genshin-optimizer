import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { AnvilIcon } from '@genshin-optimizer/common/svgicons'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { FlowerIcon } from '@genshin-optimizer/gi/svgicons'
import { SillyContext } from '@genshin-optimizer/gi/ui'
import {
  Article,
  Construction,
  Menu as MenuIcon,
  People,
  Scanner,
  Settings,
} from '@mui/icons-material'
import GroupsIcon from '@mui/icons-material/Groups'
import {
  AppBar,
  Avatar,
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
import { Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useMatch } from 'react-router-dom'
import { shouldShowDevComponents } from './Util/Util'
import silly_icon from './silly_icon.png'
type ITab = {
  i18Key: string
  icon: Displayable
  to: string
  value: string
  textSuffix?: Displayable
}
const artifacts: ITab = {
  i18Key: 'tabs.artifacts',
  icon: <FlowerIcon />,
  to: '/artifacts',
  value: 'artifacts',
  textSuffix: <ArtifactChip key="weaponAdd" />,
}
const weapons: ITab = {
  i18Key: 'tabs.weapons',
  icon: <AnvilIcon />,
  to: '/weapons',
  value: 'weapons',
  textSuffix: <WeaponChip key="weaponAdd" />,
}
const characters: ITab = {
  i18Key: 'tabs.characters',
  icon: <People />,
  to: '/characters',
  value: 'characters',
  textSuffix: <CharacterChip key="charAdd" />,
}
const teams: ITab = {
  i18Key: 'tabs.teams',
  icon: <GroupsIcon />,
  to: '/teams',
  value: 'teams',
  textSuffix: <TeamChip key="charAdd" />,
}
const tools: ITab = {
  i18Key: 'tabs.tools',
  icon: <Construction />,
  to: '/tools',
  value: 'tools',
}
const scanner: ITab = {
  i18Key: 'tabs.scanner',
  icon: <Scanner />,
  to: '/scanner',
  value: 'scanner',
}
const doc: ITab = {
  i18Key: 'tabs.doc',
  icon: <Article />,
  to: '/doc',
  value: 'doc',
}
const setting: ITab = {
  i18Key: 'tabs.setting',
  icon: <Settings />,
  to: '/setting',
  value: 'setting',
  textSuffix: <DBChip />,
}

function DBChip() {
  const { name } = useDBMeta()
  return <Chip color="success" label={name} />
}

function ArtifactChip() {
  const database = useDatabase()
  const [dirty, setDirty] = useForceUpdate()
  useEffect(
    () => database.arts.followAny(() => setDirty()),
    [database, setDirty]
  )
  const total = useMemo(
    () => dirty && database.arts.keys.length,
    [dirty, database]
  )
  return <Chip label={<strong>{total}</strong>} size="small" />
}
function CharacterChip() {
  const database = useDatabase()
  const [dirty, setDirty] = useForceUpdate()
  useEffect(
    () => database.chars.followAny(() => setDirty()),
    [database, setDirty]
  )
  const total = useMemo(
    () => dirty && database.chars.keys.length,
    [dirty, database]
  )
  return <Chip label={<strong>{total}</strong>} size="small" />
}
function TeamChip() {
  const database = useDatabase()
  const [dirty, setDirty] = useForceUpdate()
  useEffect(
    () => database.teams.followAny(() => setDirty()),
    [database, setDirty]
  )
  const total = useMemo(
    () => dirty && database.teams.keys.length,
    [dirty, database]
  )
  return <Chip label={<strong>{total}</strong>} size="small" />
}
function WeaponChip() {
  const database = useDatabase()
  const [dirty, setDirty] = useForceUpdate()
  useEffect(
    () => database.weapons.followAny(() => setDirty()),
    [database, setDirty]
  )
  const total = useMemo(
    () => dirty && database.weapons.keys.length,
    [database, dirty]
  )
  return <Chip label={<strong>{total}</strong>} size="small" />
}

export default function Header({ anchor }: { anchor: string }) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
      <HeaderContent anchor={anchor} />
    </Suspense>
  )
}

const maincontent = [
  artifacts,
  weapons,
  characters,
  teams,
  tools,
  scanner,
  doc,
  setting,
] as const
function HeaderContent({ anchor }: { anchor: string }) {
  const theme = useTheme()
  const isXL = useMediaQuery(theme.breakpoints.up('xl'))
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { t } = useTranslation('ui')
  const { silly } = useContext(SillyContext)
  const {
    params: { currentTab },
  } = useMatch({ path: '/:currentTab', end: false }) ?? {
    params: { currentTab: '' },
  }
  if (isMobile)
    return <MobileHeader anchor={anchor} currentTab={currentTab ?? ''} />
  return (
    <Box>
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
              silly ? (
                <Box display="flex" alignItems="center">
                  <Avatar src={silly_icon} />
                  <Typography variant="h6" sx={{ px: 1 }}>
                    {t('sillyPageTitle')}
                  </Typography>
                  {shouldShowDevComponents ? (
                    <Typography variant="body1" sx={{ px: 1 }}>
                      (Dev Mode)
                    </Typography>
                  ) : undefined}
                </Box>
              ) : (
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" sx={{ px: 1 }}>
                    {t('pageTitle')}
                  </Typography>
                  {shouldShowDevComponents ? (
                    <Typography variant="body1" sx={{ px: 1 }}>
                      (Dev Mode)
                    </Typography>
                  ) : undefined}
                </Box>
              )
            }
          />
          {maincontent.map(({ i18Key, value, to, icon, textSuffix }) => {
            const tooltipIcon = isXL ? (
              icon
            ) : (
              <Tooltip arrow title={t(i18Key)}>
                {icon as JSX.Element}
              </Tooltip>
            )
            return (
              <Tab
                key={value}
                value={value}
                component={RouterLink}
                to={to}
                icon={tooltipIcon}
                iconPosition="start"
                label={
                  isXL || textSuffix ? (
                    <Box display="flex" gap={1} alignItems="center">
                      {isXL && <span>{t(i18Key)}</span>}
                      {textSuffix}
                    </Box>
                  ) : undefined
                }
                sx={{ ml: value === 'setting' ? 'auto' : undefined }}
              />
            )
          })}
        </Tabs>
      </AppBar>
    </Box>
  )
}

const mobileContent = [
  artifacts,
  weapons,
  characters,
  teams,
  tools,
  scanner,
  doc,
  setting,
] as const
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

  const { t } = useTranslation('ui')
  const { silly } = useContext(SillyContext)
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
              <ListItemText>
                {silly ? t('sillyPageTitle') : t('pageTitle')}
              </ListItemText>
            </ListItemButton>
            {mobileContent.map(
              ({ i18Key, value, to, icon, textSuffix: extra }) => (
                <ListItemButton
                  key={value}
                  component={RouterLink}
                  to={to}
                  selected={currentTab === value}
                  disabled={currentTab === value}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>
                    <Box display="flex" gap={1} alignItems="center">
                      {t(i18Key)}
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
            startIcon={silly ? <Avatar src={silly_icon} /> : undefined}
          >
            <Typography variant="h6" noWrap component="div">
              {silly ? t('sillyPageTitle') : t('pageTitle')}
            </Typography>
            {shouldShowDevComponents ? (
              <Typography variant="body1" sx={{ px: 1 }}>
                (Dev Mode)
              </Typography>
            ) : undefined}
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
