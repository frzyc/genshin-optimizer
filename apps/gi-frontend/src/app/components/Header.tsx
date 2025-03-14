'use client'
import { AnvilIcon } from '@genshin-optimizer/common/svgicons'
import { FlowerIcon } from '@genshin-optimizer/gi/svgicons'
import GroupsIcon from '@mui/icons-material/Groups'
import PeopleIcon from '@mui/icons-material/People'
import { Skeleton, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactElement, ReactNode } from 'react'
import { Suspense, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserProfileContext } from '../context/UserProfileContext'
import go_icon from './go_icon.png'
import silly_icon from './silly_icon.png'
type ITab = {
  i18Key: string
  icon: ReactNode
  to: string
  value: string
  textSuffix?: ReactNode
}
const artifacts: ITab = {
  i18Key: 'tabs.artifacts',
  icon: <FlowerIcon />,
  to: '/artifacts',
  value: 'artifacts',
  // textSuffix: <ArtifactChip key="weaponAdd" />, //TODO: header tally
}
const weapons: ITab = {
  i18Key: 'tabs.weapons',
  icon: <AnvilIcon />,
  to: '/weapons',
  value: 'weapons',
  // textSuffix: <WeaponChip key="weaponAdd" />, //TODO: header tally
}
const characters: ITab = {
  i18Key: 'tabs.characters',
  icon: <PeopleIcon />,
  to: '/characters',
  value: 'characters',
  // textSuffix: <CharacterChip key="charAdd" />, //TODO: header tally
}
const teams: ITab = {
  i18Key: 'tabs.teams',
  icon: <GroupsIcon />,
  to: '/teams',
  value: 'teams',
  // textSuffix: <TeamChip key="charAdd" />, //TODO: header tally
}
const maincontent: ITab[] = [artifacts, weapons, characters, teams] as const

const settings = [
  { title: 'Profile', href: '/profile' },
  { title: 'Account', href: '/account' },
  { title: 'Dashboard', href: '/dashboard' },
  {
    title: 'Logout',
    action: '/auth/signout',
  },
]
export default function Header() {
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" height={56} width={'100%'} />}
    >
      <HeaderContent />
    </Suspense>
  )
}
function HeaderContent() {
  const { t } = useTranslation('ui')
  const silly = false //TODO: silly toggle
  const theme = useTheme()
  const isXL = useMediaQuery(theme.breakpoints.up('xl'))
  const pathname = usePathname()
  const currentTab = pathname.substring(1)
  return (
    <>
      <AppBar
        position="static"
        sx={{ bgcolor: 'neutral900.main', display: 'flex' }}
        elevation={0}
        // id={anchor}
      >
        <Box display="flex" alignItems="center">
          {/* desktop icon + menu */}
          <Tabs
            value={currentTab}
            sx={(theme) => ({
              flexGrow: 1,
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
              component={Link}
              href="/"
              label={
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={silly ? silly_icon.src : go_icon.src}
                    variant="rounded"
                    sx={(theme) => ({
                      height: '24px',
                      width: '24px',
                      boxShadow: `0 0 10px 1px ${theme.palette.brand500.main}`,
                    })}
                  />
                  <Typography variant="h6" sx={{ px: 1, fontWeight: 'Normal' }}>
                    {t(silly ? 'sillyPageTitle' : 'pageTitle')}
                  </Typography>
                  {/* {shouldShowDevComponents && (
                    <Typography variant="body1">(Dev Mode)</Typography>
                  )} */}
                </Box>
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
                  component={Link}
                  href={to}
                  icon={tooltipIcon as ReactElement}
                  iconPosition="start"
                  label={
                    isXL || textSuffix ? (
                      <Box display="flex" gap={0.5} alignItems="center">
                        {isXL && <Typography>{t(i18Key)}</Typography>}
                        {textSuffix}
                      </Box>
                    ) : undefined
                  }
                  sx={{ ml: value === 'setting' ? 'auto' : undefined }}
                />
              )
            })}
          </Tabs>
          {/* mobile and desktop icon */}
          <Box sx={{ flexGrow: 0 }}>
            <UserAvatar />
          </Box>
        </Box>
      </AppBar>
    </>
  )
}
function UserAvatar() {
  const { user } = useContext(UserProfileContext)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }
  return (
    <>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <Avatar
            alt={user?.user_metadata['full_name']}
            src={user?.user_metadata['avatar_url']}
          />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {settings.map(({ title, href, action }) =>
          action ? (
            <form key={title} action={action} method="post">
              <MenuItem
                onClick={handleCloseUserMenu}
                component="button"
                type="submit"
              >
                <Typography textAlign="center">{title}</Typography>
              </MenuItem>
            </form>
          ) : (
            <MenuItem
              key={title}
              onClick={handleCloseUserMenu}
              component={Link}
              href={href as string}
            >
              <Typography textAlign="center">{title}</Typography>
            </MenuItem>
          ),
        )}
      </Menu>
    </>
  )
}
