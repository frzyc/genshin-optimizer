import { faDiscord, faPatreon, faPaypal } from "@fortawesome/free-brands-svg-icons";
import { faBook, faCalculator, faCog, faGavel, faIdCard, faTools } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu as MenuIcon } from "@mui/icons-material";
import { AppBar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Skeleton, Tab, Tabs, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Suspense, useState } from "react";
import ReactGA from 'react-ga';
import { Trans, useTranslation } from "react-i18next";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import { SlotIconSVG } from "./Artifact/Component/SlotNameWIthIcon";

const content = [{
  i18Key: "tabs.artifacts",
  svg: SlotIconSVG.flower,
  to: "/artifact",
  value: "artifact",
}, {
  i18Key: "tabs.weapons",
  svg: faGavel,
  to: "/weapon",
  value: "weapon",
}, {
  i18Key: "tabs.characters",
  svg: faIdCard,
  to: "/character",
  value: "character",
}, {
  i18Key: "tabs.builds",
  svg: faCalculator,
  to: "/build",
  value: "build",
}, {
  i18Key: "tabs.tools",
  svg: faTools,
  to: "/tools",
  value: "tools",
}, {
  i18Key: "tabs.database",
  svg: faCog,
  to: "/database",
  value: "database",
}, {
  i18Key: "tabs.doc",
  svg: faBook,
  to: "/doc",
  value: "doc",
},] as const

const links = [{
  i18Key: "social.paypal",
  href: process.env.REACT_APP_PAYPAL_LINK,
  svg: faPaypal,
  label: "paypal",
}, {
  i18Key: "social.patreon",
  href: process.env.REACT_APP_PATREON_LINK,
  svg: faPatreon,
  label: "patreon",
}, {
  i18Key: "social.discord",
  href: process.env.REACT_APP_DISCORD_LINK,
  svg: faDiscord,
  label: "discord",
},] as const

export default function Header(props) {
  return <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
    <HeaderContent {...props} />
  </Suspense>
}
function HeaderContent({ anchor }) {
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { t } = useTranslation("ui")

  const routeMatch = useRouteMatch({
    path: "/:slug",
    strict: true,
    sensitive: true
  });


  const currentTab = (routeMatch?.params as any)?.slug ?? false
  if (isMobile) return <MobileHeader anchor={anchor} currentTab={currentTab} />
  return <AppBar position="static" sx={{ bgcolor: "#343a40", display: "flex", flexWrap: "nowrap" }} elevation={0} id={anchor} >
    <Tabs
      value={currentTab}
      variant="scrollable"
      scrollButtons="auto"

      sx={{
        "& .MuiTab-root": {
          px: 1,
          flexDirection: "row",
          minWidth: 40,
          minHeight: "auto",
        },
        "& .MuiTab-root:hover": {
          transition: "background-color 0.5s ease",
          backgroundColor: "rgba(255,255,255,0.1)"
        },
        "& .MuiTab-root > .MuiTab-iconWrapper": {
          mb: 0,
          mr: 0.5
        },
      }}
    >
      <Tab value="" component={RouterLink} to="/" label={<Typography variant="h6" sx={{ px: 1 }}>
        <Trans t={t} i18nKey="pageTitle">Genshin Optimizer</Trans>
      </Typography>} />
      {content.map(({ i18Key, value, to, svg }) => <Tab key={value} value={value} component={RouterLink} to={to} icon={<FontAwesomeIcon icon={svg} />} label={t(i18Key)} />)}
      <Box flexGrow={1} />
      {links.map(({ i18Key, href, label, svg }) => <Tab key={label} component="a" href={href} target="_blank" icon={<FontAwesomeIcon icon={svg} />} onClick={e => ReactGA.outboundLink({ label }, () => { })} label={isLarge && t(i18Key)} />)}
    </Tabs>
  </AppBar>
}
function MobileHeader({ anchor, currentTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };


  const { t } = useTranslation("ui")
  return <>
    <AppBar position="fixed" sx={{ bgcolor: "#343a40" }} elevation={0}  >
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
          <ListItemButton key="home" component={RouterLink} to={'/'} selected={currentTab === ""} disabled={currentTab === ""} onClick={handleDrawerToggle} >
            <ListItemText>{t("pageTitle")}</ListItemText>
          </ListItemButton >
          {content.map(({ i18Key, value, to, svg }) =>
            <ListItemButton key={value} component={RouterLink} to={to} selected={currentTab === value} disabled={currentTab === value} onClick={handleDrawerToggle} >
              <ListItemIcon><FontAwesomeIcon icon={svg} /></ListItemIcon>
              <ListItemText>{t(i18Key)}</ListItemText>
            </ListItemButton >)}
        </List>
        <Divider />
        <List>
          {links.map(({ i18Key, href, svg, label }) =>
            <ListItemButton key={label} component="a" href={href} target="_blank" onClick={e => ReactGA.outboundLink({ label }, () => { })} >
              <ListItemIcon><FontAwesomeIcon icon={svg} /></ListItemIcon>
              <ListItemText>{t(i18Key)}</ListItemText>
            </ListItemButton >)}
        </List>
      </Drawer>
      <Toolbar>
        <Button variant="text" sx={{ color: "white" }} component={RouterLink} to="/">
          <Typography variant="h6" noWrap component="div">
            <Trans t={t} i18nKey="pageTitle">Genshin Optimizer</Trans>
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
}