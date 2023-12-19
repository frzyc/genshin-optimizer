import { SillyContext } from '@genshin-optimizer/gi-ui-next'
import { Menu as MenuIcon } from '@mui/icons-material'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mobileContent } from './TabsData'
import silly_icon from './silly_icon.png'

export default function MobileHeader({
  anchor,
  locale,
  currentTab,
}: {
  anchor: string
  locale: string
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
              component={Link}
              href={'/'}
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
                  component={Link}
                  href={to(locale)}
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
            component={Link}
            href="/"
            startIcon={silly ? <Avatar src={silly_icon.src} /> : undefined}
          >
            <Typography variant="h6" noWrap component="div">
              {silly ? t('sillyPageTitle') : t('pageTitle')}
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
