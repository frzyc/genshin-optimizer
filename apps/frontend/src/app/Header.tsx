import {
  Article,
  Construction,
  Menu as MenuIcon,
  People,
  Scanner,
  Settings,
} from '@mui/icons-material'
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
import { Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink, useMatch } from 'react-router-dom'
import Assets from './Assets/Assets'
import { DatabaseContext } from './Database/Database'
import useDBMeta from './ReactHooks/useDBMeta'
import useForceUpdate from './ReactHooks/useForceUpdate'
import FlowerIcon from './SVGIcons/ArtifactSlot/FlowerIcon'
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
  icon: Assets.svg.anvil,
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
  const { database } = useContext(DatabaseContext)
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
  const { database } = useContext(DatabaseContext)
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
function WeaponChip() {
  const { database } = useContext(DatabaseContext)
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

export default function Header(props) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
      <HeaderContent {...props} />
    </Suspense>
  )
}

const maincontent = [
  artifacts,
  weapons,
  characters,
  tools,
  scanner,
  doc,
  setting,
] as const
function HeaderContent({ anchor }) {
  const theme = useTheme()
  const isXL = useMediaQuery(theme.breakpoints.up('xl'))
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { t } = useTranslation('ui')

  const {
    params: { currentTab },
  } = useMatch({ path: '/:currentTab', end: false }) ?? {
    params: { currentTab: '' },
  }
  if (isMobile) return <MobileHeader anchor={anchor} currentTab={currentTab} />
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
              <Typography variant="h6" sx={{ px: 1 }}>
                <Trans t={t} i18nKey="pageTitle">
                  Genshin Optimizer
                </Trans>
              </Typography>
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
  tools,
  scanner,
  doc,
  setting,
] as const
function MobileHeader({ anchor, currentTab }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const { t } = useTranslation('ui')
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
          >
            <Typography variant="h6" noWrap component="div">
              <Trans t={t} i18nKey="pageTitle">
                Genshin Optimizer
              </Trans>
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
