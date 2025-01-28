import { useDatabaseTally } from '@genshin-optimizer/common/database-ui'
import { Tally } from '@genshin-optimizer/common/ui'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Settings } from '@mui/icons-material'
import CalculateIcon from '@mui/icons-material/Calculate'
import DiscFullIcon from '@mui/icons-material/DiscFull'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
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
const discs: ITab = {
  i18Key: 'tabs.discs',
  icon: <DiscFullIcon />,
  to: '/discs',
  value: 'discs',
  textSuffix: <DiscsTab key="rediscsAdd" />,
}

const optimize: ITab = {
  i18Key: 'tabs.optimize',
  icon: <CalculateIcon />,
  to: '/optimize',
  value: 'optimize',
}

const settings: ITab = {
  i18Key: 'tabs.settings',
  icon: <Settings />,
  to: '/settings',
  value: 'settings',
  textSuffix: <SettingsChip />,
}

function SettingsChip() {
  const { database } = useDatabaseContext()
  const { name } = database?.dbMeta.get() ?? 'Database 0'
  return <Chip label={name} />
}

function DiscsTab() {
  const { database } = useDatabaseContext()
  return <Tally>{useDatabaseTally(database.discs)}</Tally>
}

export default function Header({ anchor }: { anchor: string }) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
      <HeaderContent anchor={anchor} />
    </Suspense>
  )
}

const maincontent = [discs, optimize, settings] as const

function HeaderContent({ anchor }: { anchor: string }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const {
    params: { currentTab },
  } = useMatch({ path: '/:currentTab', end: false }) ?? {
    params: { currentTab: '' },
  }
  if (isMobile)
    return <MobileHeader anchor={anchor} currentTab={currentTab ?? ''} />
  return <DesktopHeader anchor={anchor} currentTab={currentTab ?? ''} />
}

function DesktopHeader({
  anchor,
  currentTab,
}: {
  anchor: string
  currentTab: string
}) {
  const theme = useTheme()
  const isXL = useMediaQuery(theme.breakpoints.up('xl'))
  const { t } = useTranslation(['ui', 'header'])
  return (
    <AppBar
      position="static"
      sx={{ bgcolor: 'neutral900.main' }}
      elevation={0}
      id={anchor}
    >
      <Tabs
        value={currentTab}
        sx={(theme) => ({
          '& .MuiTab-root': {
            p: 1,
            minWidth: 'auto',
            minHeight: 'auto',
          },
          '& .MuiTab-root:hover': {
            transition: 'background-color 0.5s ease',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '& .Mui-selected': {
            backgroundImage: `linear-gradient(to top, ${theme.palette.brand500.main}, ${theme.palette.neutral700.main})`,
            color: `${theme.palette.neutral100.main} !important`,
            textShadow:
              '0.25px 0 0 currentColor, -0.25px 0 0 currentColor, 0 0.25px 0 currentColor, 0 -0.25px 0',
          },
        })}
      >
        <Tab
          value=""
          component={RouterLink}
          to="/"
          label={
            <Box display="flex" alignItems="center">
              <Typography variant="h6" sx={{ px: 1, fontWeight: 'Normal' }}>
                Zenless Optimizer
                {/* TODO: {t('pageTitle')} */}
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
                  <Box display="flex" gap={0.5} alignItems="center">
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

const mobileContent = [discs, optimize, settings] as const
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
  return (
    <>
      <AppBar
        position="fixed"
        sx={{ bgcolor: 'neutral900.main' }}
        elevation={0}
      >
        <Drawer
          anchor="right"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          PaperProps={{
            sx: (theme) => ({
              // backgroundColor: 'neutral700.main',
              backgroundImage: `linear-gradient(to right, ${theme.palette.neutral700.main}, ${theme.palette.neutral700.main})`,
            }),
          }}
        >
          <Tabs
            value={currentTab}
            orientation="vertical"
            variant="scrollable"
            scrollButtons={false}
            TabIndicatorProps={{
              sx: {
                left: 0,
                width: '4px',
              },
            }}
            sx={(theme) => ({
              '& .Mui-selected': {
                backgroundImage: `linear-gradient(to right, ${theme.palette.brand500.main}, ${theme.palette.neutral700.main})`,
                color: `${theme.palette.neutral100.main} !important`,
                textShadow:
                  '0.1px 0 0 currentColor, -0.1px 0 0 currentColor, 0 0.1px 0 currentColor, 0 -0.1px 0',
              },
            })}
          >
            <Tab
              value=""
              component={RouterLink}
              to={'/'}
              onClick={handleDrawerToggle}
              label={
                'Zenless Optimizer'
                // <Typography>{t('pageTitle')}</Typography>
              }
            />
            {mobileContent.map(({ i18Key, value, to, icon, textSuffix }) => (
              <Tab
                key={value}
                value={value}
                component={RouterLink}
                to={to}
                onClick={handleDrawerToggle}
                icon={icon as ReactElement}
                iconPosition="start"
                label={
                  <Box display="flex" gap={0.5} alignItems="center">
                    <Typography>{t(`header:${i18Key}`)}</Typography>
                    {textSuffix}
                  </Box>
                }
                sx={{ justifyContent: 'flex-start' }}
              />
            ))}
          </Tabs>
        </Drawer>
        <Toolbar>
          <Button
            variant="text"
            sx={(theme) => ({
              color: `${theme.palette.neutral200.main} !important`,
            })}
            component={RouterLink}
            to="/"
          >
            <Typography variant="h6" noWrap component="div" sx={{ px: 1 }}>
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
