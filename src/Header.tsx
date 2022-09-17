import { faDiscord, faPatreon, faPaypal } from "@fortawesome/free-brands-svg-icons";
import { Article, Construction, Menu as MenuIcon, People, Scanner, Settings } from "@mui/icons-material";
import { AppBar, Box, Button, Chip, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Skeleton, Tab, Tabs, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Suspense, useState } from "react";
import ReactGA from 'react-ga4';
import { Trans, useTranslation } from "react-i18next";
import { Link as RouterLink, useMatch } from "react-router-dom";
import Assets from "./Assets/Assets";
import { slotIconSVG } from "./Components/Artifact/SlotNameWIthIcon";
import FontAwesomeSvgIcon from "./Components/FontAwesomeSvgIcon";
import { dbMetaInit } from "./Database/Data/StateData";
import useDBState from "./ReactHooks/useDBState";

const content = [{
  i18Key: "tabs.artifacts",
  icon: <FontAwesomeSvgIcon icon={slotIconSVG.flower} />,
  to: "/artifacts",
  value: "artifacts",
  resize: false
}, {
  i18Key: "tabs.weapons",
  icon: Assets.svg.anvil,
  to: "/weapons",
  value: "weapons",
  resize: false
}, {
  i18Key: "tabs.characters",
  icon: <People />,
  to: "/characters",
  value: "characters",
  resize: false
}, {
  i18Key: "tabs.tools",
  icon: <Construction />,
  to: "/tools",
  value: "tools",
  resize: true,
}, {
  i18Key: "tabs.scanner",
  icon: <Scanner />,
  to: "/scanner",
  value: "scanner",
  resize: true,
}, {
  i18Key: "tabs.doc",
  icon: <Article />,
  to: "/doc",
  value: "doc",
  resize: true,
}, {
  i18Key: "tabs.setting",
  icon: <Settings />,
  to: "/setting",
  value: "setting",
  resize: true,
},] as const

const links = [{
  i18Key: "social.paypal",
  href: process.env.REACT_APP_URL_PAYPAL_FRZYC,
  icon: <FontAwesomeSvgIcon icon={faPaypal} />,
  label: "paypal",
}, {
  i18Key: "social.patreon",
  href: process.env.REACT_APP_URL_PATREON_FRZYC,
  icon: <FontAwesomeSvgIcon icon={faPatreon} />,
  label: "patreon",
}, {
  i18Key: "social.discord",
  href: process.env.REACT_APP_URL_DISCORD_GO,
  icon: <FontAwesomeSvgIcon icon={faDiscord} />,
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
  const [{ name }] = useDBState("dbMeta", dbMetaInit(1))

  const { t } = useTranslation("ui")

  const { params: { currentTab } } = useMatch({ path: "/:currentTab", end: false }) ?? { params: { currentTab: "" } };
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
      {content.map(({ i18Key, value, to, icon, resize }) => <Tab key={value} value={value} component={RouterLink} to={to} icon={icon} iconPosition="start" label={(isLarge || !resize) && t(i18Key)} />)}
      <Box display="flex" alignItems="center">
        <Chip color="success" label={name} />
      </Box>

      <Box flexGrow={1} />
      {links.map(({ i18Key, href, label, icon }) => <Tab key={label} component="a" href={href} target="_blank" icon={icon} iconPosition="start" onClick={e => ReactGA.outboundLink({ label }, () => { })} label={isLarge && t(i18Key)} />)}
    </Tabs>
  </AppBar>
}
function MobileHeader({ anchor, currentTab }) {
  const [{ name }] = useDBState("dbMeta", dbMetaInit(1))
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
          {content.map(({ i18Key, value, to, icon }) =>
            <ListItemButton key={value} component={RouterLink} to={to} selected={currentTab === value} disabled={currentTab === value} onClick={handleDrawerToggle} >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText>{t(i18Key)}</ListItemText>
            </ListItemButton >)}
          <Box display="flex" justifyContent="center">
            <Chip color="success" label={name} />
          </Box>
        </List>
        <Divider />
        <List>
          {links.map(({ i18Key, href, icon, label }) =>
            <ListItemButton key={label} component="a" href={href} target="_blank" onClick={e => ReactGA.outboundLink({ label }, () => { })} >
              <ListItemIcon>{icon}</ListItemIcon>
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
