import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { SillyContext } from '@genshin-optimizer/gi/ui'
import MenuIcon from '@mui/icons-material/Menu'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Skeleton,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Fragment, Suspense, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useMatch } from 'react-router-dom'
import { bodyFont, celestia, displayFont } from '../theme/celestia'

const HEADER_HEIGHT = 60

const navItems = [
  { i18Key: 'tabs.artifacts', to: '/artifacts', value: 'artifacts' },
  { i18Key: 'tabs.weapons', to: '/weapons', value: 'weapons' },
  { i18Key: 'tabs.characters', to: '/characters', value: 'characters' },
  { i18Key: 'tabs.teams', to: '/teams', value: 'teams' },
  { i18Key: 'tabs.archive', to: '/archive', value: 'archive' },
  { i18Key: 'tabs.tools', to: '/tools', value: 'tools' },
  { i18Key: 'tabs.doc', to: '/doc', value: 'doc' },
] as const

const navLabelSx = {
  fontFamily: displayFont,
  fontWeight: 600,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
} as const

export default function Header({ anchor }: { anchor: string }) {
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          height={HEADER_HEIGHT}
          sx={{ bgcolor: celestia.header }}
        />
      }
    >
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

function Wordmark() {
  const { t } = useTranslation('ui')
  const { silly } = useContext(SillyContext)
  return (
    <Box
      component={RouterLink}
      to="/"
      sx={{
        ...navLabelSx,
        display: 'flex',
        alignItems: 'baseline',
        gap: 1,
        fontWeight: 700,
        fontSize: { xs: 16, lg: 18 },
        letterSpacing: { xs: '2px', lg: '2.5px' },
        color: celestia.goldLight,
      }}
    >
      {t(silly ? 'sillyPageTitle' : 'pageTitle')}
      {shouldShowDevComponents && (
        <Box
          component="span"
          sx={{
            fontFamily: bodyFont,
            fontWeight: 400,
            fontSize: 12,
            letterSpacing: 0,
            textTransform: 'none',
            color: celestia.faint,
          }}
        >
          (Dev Mode)
        </Box>
      )}
    </Box>
  )
}

function SettingsButton({ active }: { active: boolean }) {
  const { t } = useTranslation('ui')
  return (
    <Tooltip title={t('tabs.setting')} arrow>
      <IconButton
        component={RouterLink}
        to="/setting"
        aria-label={t('tabs.setting')}
        aria-current={active ? 'page' : undefined}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 0,
          border: `1px solid ${active ? celestia.gold : celestia.hairline}`,
          color: active ? celestia.goldLight : celestia.muted,
          transition: 'color 0.2s, border-color 0.2s',
          '&:hover': {
            color: celestia.goldLight,
            borderColor: celestia.gold,
            bgcolor: 'transparent',
          },
        }}
      >
        <SettingsOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

function Diamond() {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        display: { md: 'none', lg: 'block' },
        alignSelf: 'center',
        flexShrink: 0,
        width: 5,
        height: 5,
        transform: 'rotate(45deg)',
        bgcolor: celestia.ornament,
      }}
    />
  )
}

function DesktopHeader({
  anchor,
  currentTab,
}: {
  anchor: string
  currentTab: string
}) {
  const { t } = useTranslation('ui')
  return (
    <AppBar
      position="static"
      elevation={0}
      id={anchor}
      sx={{
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 3,
        px: { md: 2.5, lg: 3.5 },
        bgcolor: celestia.header,
        backgroundImage: 'none',
        borderBottom: `1px solid ${celestia.hairline}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Wordmark />
      </Box>
      <Box
        component="nav"
        aria-label="Navegação principal"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: { md: 0.25, lg: 0.75 },
          minWidth: 0,
        }}
      >
        {navItems.map(({ i18Key, to, value }, i) => {
          const active = value === currentTab
          return (
            <Fragment key={value}>
              {i > 0 && <Diamond />}
              <Box
                component={RouterLink}
                to={to}
                aria-current={active ? 'page' : undefined}
                sx={{
                  ...navLabelSx,
                  display: 'flex',
                  alignItems: 'center',
                  px: { md: 1, lg: 1.75 },
                  fontSize: { md: 13, lg: 14 },
                  letterSpacing: { md: '0.5px', lg: '1.5px' },
                  color: active ? celestia.goldLight : celestia.muted,
                  boxShadow: active ? `inset 0 -2px 0 ${celestia.gold}` : 'none',
                  transition: 'color 0.2s',
                  '&:hover': { color: celestia.goldLight },
                }}
              >
                {t(i18Key)}
              </Box>
            </Fragment>
          )
        })}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <SettingsButton active={currentTab === 'setting'} />
      </Box>
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
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('ui')
  const close = () => setOpen(false)
  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: celestia.header,
          backgroundImage: 'none',
          borderBottom: `1px solid ${celestia.hairline}`,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <Wordmark />
          <Box flexGrow={1} />
          <SettingsButton active={currentTab === 'setting'} />
          <IconButton
            aria-label="Abrir menu"
            edge="end"
            onClick={() => setOpen(true)}
            sx={{ color: celestia.goldLight }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={open}
        onClose={close}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            minWidth: 240,
            bgcolor: celestia.header,
            backgroundImage: 'none',
            borderLeft: `1px solid ${celestia.hairline}`,
          },
        }}
      >
        <Box
          component="nav"
          aria-label="Navegação principal"
          sx={{ display: 'flex', flexDirection: 'column', py: 2 }}
        >
          {navItems.map(({ i18Key, to, value }) => {
            const active = value === currentTab
            return (
              <Box
                key={value}
                component={RouterLink}
                to={to}
                onClick={close}
                aria-current={active ? 'page' : undefined}
                sx={{
                  ...navLabelSx,
                  px: 3,
                  py: 1.5,
                  fontSize: 14,
                  letterSpacing: '1.5px',
                  color: active ? celestia.goldLight : celestia.muted,
                  boxShadow: active ? `inset 3px 0 0 ${celestia.gold}` : 'none',
                }}
              >
                {t(i18Key)}
              </Box>
            )
          })}
        </Box>
      </Drawer>
      {/* blank toolbar keeps the space under the fixed bar and serves as the scroll anchor */}
      <Toolbar id={anchor} />
    </>
  )
}
