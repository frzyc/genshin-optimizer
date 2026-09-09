import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import CalculateIcon from '@mui/icons-material/Calculate'
import MenuIcon from '@mui/icons-material/Menu'
import { Settings } from '@mui/icons-material'
import {
  AppBar,
  Box,
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

const optimize: ITab = {
  i18Key: 'tabs.optimize',
  icon: <CalculateIcon />,
  to: '/optimize',
  value: 'optimize',
}

const settings: ITab = {
  i18Key: 'tabs.setting',
  icon: <Settings />,
  to: '/settings',
  value: 'settings',
  textSuffix: <DBChip />,
}

function DBChip() {
  const { name } = useDBMeta()
  return <Chip label={name} />
}

const maincontent = [optimize, settings] as const

export default function Header({ anchor }: { anchor: string }) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
      <HeaderContent anchor={anchor} />
    </Suspense>
  )
}

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
  const { t } = useTranslation('ui')
  return (
    <AppBar
      position="static"
      sx={{ bgcolor: 'neutral900.main' }}
      elevation={0}
      id={anchor}
    >
      <Tabs
        value={currentTab}
        sx={(themeSx) => ({
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
            backgroundImage: `linear-gradient(to top, ${themeSx.palette.brand500.main}, ${themeSx.palette.neutral700.main})`,
            color: `${themeSx.palette.neutral100.main} !important`,
          },
        })}
      >
        <Tab
          value=""
          component={RouterLink}
          to="/optimize"
          label={
            <Box display="flex" alignItems="center">
              <Typography variant="h6" sx={{ px: 1, fontWeight: 'Normal' }}>
                GI Pando
              </Typography>
              {shouldShowDevComponents && (
                <Typography variant="body1">(Dev Mode)</Typography>
              )}
            </Box>
          }
        />
        {maincontent.map(({ i18Key, value, to, icon, textSuffix }) => {
          const tooltipIcon = isXL ? (
            icon
          ) : (
            <Tooltip arrow title={t(i18Key)}>
              {icon as ReactElement}
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
                    {isXL && <span>{t(i18Key)}</span>}
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

function MobileHeader({
  anchor,
  currentTab,
}: {
  anchor: string
  currentTab: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation('ui')
  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: 'neutral900.main' }} id={anchor}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setMobileOpen(true)}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            GI Pando
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Tabs
          value={currentTab}
          orientation="vertical"
          onChange={() => setMobileOpen(false)}
        >
          {maincontent.map(({ i18Key, value, to, icon }) => (
            <Tab
              key={value}
              value={value}
              component={RouterLink}
              to={to}
              icon={icon as ReactElement}
              iconPosition="start"
              label={t(i18Key)}
            />
          ))}
        </Tabs>
      </Drawer>
    </>
  )
}
