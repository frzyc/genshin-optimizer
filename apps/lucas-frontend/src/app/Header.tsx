import { useDataManagerKeys } from '@genshin-optimizer/common/database-ui'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { useDatabase, useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { SillyContext } from '@genshin-optimizer/gi/ui'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Skeleton,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Fragment, Suspense, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useMatch } from 'react-router-dom'
import { bodyFont, celestia, displayFont } from '../theme/celestia'

type NavItem = {
  i18Key: string
  to: string
  value: string
  count?: ReactNode
}

const navItems: NavItem[] = [
  {
    i18Key: 'tabs.artifacts',
    to: '/artifacts',
    value: 'artifacts',
    count: <ArtifactCount />,
  },
  {
    i18Key: 'tabs.weapons',
    to: '/weapons',
    value: 'weapons',
    count: <WeaponCount />,
  },
  {
    i18Key: 'tabs.characters',
    to: '/characters',
    value: 'characters',
    count: <CharacterCount />,
  },
  { i18Key: 'tabs.teams', to: '/teams', value: 'teams', count: <TeamCount /> },
  { i18Key: 'tabs.archive', to: '/archive', value: 'archive' },
  { i18Key: 'tabs.tools', to: '/tools', value: 'tools' },
  { i18Key: 'tabs.doc', to: '/doc', value: 'doc' },
  { i18Key: 'tabs.setting', to: '/setting', value: 'setting' },
]

function ArtifactCount() {
  const database = useDatabase()
  return (
    <span className="nav-count">
      {useDataManagerKeys(database.arts).length}
    </span>
  )
}
function WeaponCount() {
  const database = useDatabase()
  return (
    <span className="nav-count">
      {useDataManagerKeys(database.weapons).length}
    </span>
  )
}
function CharacterCount() {
  const database = useDatabase()
  return (
    <span className="nav-count">
      {useDataManagerKeys(database.chars).length}
    </span>
  )
}
function TeamCount() {
  const database = useDatabase()
  return (
    <span className="nav-count">
      {useDataManagerKeys(database.teams).length}
    </span>
  )
}

const countSx = (active: boolean) => ({
  fontFamily: bodyFont,
  fontSize: 12,
  fontWeight: active ? 700 : 600,
  letterSpacing: 0,
  color: active ? celestia.gold : celestia.faint,
})

export default function Header({ anchor }: { anchor: string }) {
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          height={103}
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

function Wordmark({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation('ui')
  const { silly } = useContext(SillyContext)
  return (
    <Box
      component={RouterLink}
      to="/"
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 1,
        fontFamily: displayFont,
        fontSize: { xs: 17, md: 19 },
        letterSpacing: '3px',
        color: celestia.goldLight,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {t(silly ? 'sillyPageTitle' : 'pageTitle')}
      {shouldShowDevComponents && (
        <Box
          component="span"
          sx={{
            fontFamily: bodyFont,
            fontSize: 12,
            letterSpacing: 0,
            color: celestia.faint,
          }}
        >
          (Dev Mode)
        </Box>
      )}
    </Box>
  )
}

function DatabaseButton({ onClick }: { onClick?: () => void }) {
  const { name } = useDBMeta()
  return (
    <Box
      component={RouterLink}
      to="/setting"
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 34,
        px: 1.75,
        border: `1px solid ${celestia.gold}`,
        color: celestia.goldLight,
        fontFamily: displayFont,
        fontSize: 13,
        letterSpacing: '1.5px',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: '#1B1710' },
      }}
    >
      {name}
    </Box>
  )
}

function Diamond() {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
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
        bgcolor: celestia.header,
        backgroundImage: 'none',
        borderBottom: `1px solid ${celestia.hairline}`,
      }}
    >
      <Box
        sx={{ height: 56, display: 'flex', alignItems: 'center', gap: 2, px: 3.5 }}
      >
        <Wordmark />
        <Box flexGrow={1} />
        <DatabaseButton />
      </Box>
      <Box
        component="nav"
        aria-label="Navegação principal"
        sx={{
          height: 46,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: 0.75,
          borderTop: `1px solid ${celestia.hairlineSoft}`,
          overflowX: 'auto',
        }}
      >
        {navItems.map(({ i18Key, to, value, count }, i) => {
          const active = value === currentTab
          return (
            <Fragment key={value}>
              {i > 0 && <Diamond />}
              <Box
                component={RouterLink}
                to={to}
                aria-current={active ? 'page' : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: { md: 1.25, lg: 2 },
                  fontFamily: displayFont,
                  fontSize: 14,
                  letterSpacing: { md: '1px', lg: '2px' },
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  color: active ? celestia.goldLight : celestia.muted,
                  boxShadow: active ? `inset 0 -2px 0 ${celestia.gold}` : 'none',
                  transition: 'color 0.2s',
                  '&:hover': { color: celestia.goldLight },
                  '& .nav-count': {
                    ...countSx(active),
                    display: { md: 'none', lg: 'inline' },
                  },
                }}
              >
                {t(i18Key)}
                {count}
              </Box>
            </Fragment>
          )
        })}
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
            minWidth: 260,
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
          <Box
            sx={{
              display: 'flex',
              px: 3,
              pb: 2,
              mb: 1,
              borderBottom: `1px solid ${celestia.hairlineSoft}`,
            }}
          >
            <DatabaseButton onClick={close} />
          </Box>
          {navItems.map(({ i18Key, to, value, count }) => {
            const active = value === currentTab
            return (
              <Box
                key={value}
                component={RouterLink}
                to={to}
                onClick={close}
                aria-current={active ? 'page' : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  px: 3,
                  py: 1.5,
                  fontFamily: displayFont,
                  fontSize: 15,
                  letterSpacing: '2px',
                  textDecoration: 'none',
                  color: active ? celestia.goldLight : celestia.muted,
                  boxShadow: active ? `inset 3px 0 0 ${celestia.gold}` : 'none',
                  '& .nav-count': countSx(active),
                }}
              >
                {t(i18Key)}
                {count}
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
