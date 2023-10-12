import ChecklistIcon from '@mui/icons-material/Checklist'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeIcon from '@mui/icons-material/Home'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import StarIcon from '@mui/icons-material/Star'
import SupportIcon from '@mui/icons-material/Support'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import * as React from 'react'
import { auth } from '../auth'
import { SessionProviderWrapper } from '../components/SessionProviderWrapper'
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry'
import ApolloProviderWrapper from '../components/ApolloProviderWrapper'

export const metadata = {
  title: 'Next.js App Router + Material UI v5',
  description: 'Next.js App Router + Material UI v5',
}

const DRAWER_WIDTH = 240

const LINKS = [
  { text: 'Home', href: '/', icon: HomeIcon },
  { text: 'Starred', href: '/starred', icon: StarIcon },
  { text: 'Tasks', href: '/tasks', icon: ChecklistIcon },
]

const PLACEHOLDER_LINKS = [
  { text: 'Settings', icon: SettingsIcon },
  { text: 'Support', icon: SupportIcon },
  { text: 'Logout', icon: LogoutIcon },
]

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authSession = await auth() //load the session from the server side
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper session={authSession}>
          <ApolloProviderWrapper>
            <ThemeRegistry>
              <AppBar position="fixed" sx={{ zIndex: 2000 }}>
                <Toolbar sx={{ backgroundColor: 'background.paper' }}>
                  <DashboardIcon
                    sx={{ color: '#444', mr: 2, transform: 'translateY(-2px)' }}
                  />
                  <Typography variant="h6" noWrap component="div" color="black">
                    Next.js App Router
                  </Typography>
                </Toolbar>
              </AppBar>
              <Drawer
                sx={{
                  width: DRAWER_WIDTH,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    top: ['48px', '56px', '64px'],
                    height: 'auto',
                    bottom: 0,
                  },
                }}
                variant="permanent"
                anchor="left"
              >
                <Divider />
                <List>
                  {LINKS.map(({ text, href, icon: Icon }) => (
                    <ListItem key={href} disablePadding>
                      <ListItemButton component={Link} href={href}>
                        <ListItemIcon>
                          <Icon />
                        </ListItemIcon>
                        <ListItemText primary={text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ mt: 'auto' }} />
                <List>
                  {PLACEHOLDER_LINKS.map(({ text, icon: Icon }) => (
                    <ListItem key={text} disablePadding>
                      <ListItemButton>
                        <ListItemIcon>
                          <Icon />
                        </ListItemIcon>
                        <ListItemText primary={text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Drawer>
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  bgcolor: 'background.default',
                  ml: `${DRAWER_WIDTH}px`,
                  mt: ['48px', '56px', '64px'],
                  p: 3,
                }}
              >
                {children}
              </Box>
            </ThemeRegistry>
          </ApolloProviderWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
