import { faDiscord, faPatreon, faPaypal, faTwitch } from "@fortawesome/free-brands-svg-icons"
import { Article, GitHub, Handshake, InsertLink, Scanner, Twitter, YouTube } from "@mui/icons-material"
import { Box, Button, CardContent, CardHeader, Divider, Link, Tooltip, Typography } from "@mui/material"
import CardDark from "../Components/Card/CardDark"
import FontAwesomeSvgIcon from "../Components/FontAwesomeSvgIcon"
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from "react-i18next"

const smallIcons = [{
  tooltip: "Genshin Optimizer Discord",
  icon: <FontAwesomeSvgIcon icon={faDiscord} />,
  url: process.env.REACT_APP_URL_DISCORD_GO,
  color: "discord",
}, {
  tooltip: "Genshin Optimizer Github",
  icon: <GitHub />,
  url: process.env.REACT_APP_URL_GITHUB_GO,
  color: "white",
}, {
  tooltip: "Youtube (frzyc)",
  icon: <YouTube />,
  url: process.env.REACT_APP_URL_YOUTUBE_FRZYC,
  color: "red",
}, {
  tooltip: "Twitch (frzyc)",
  icon: <FontAwesomeSvgIcon icon={faTwitch} />,
  url: process.env.REACT_APP_URL_TWITCH_FRZYC,
  color: "twitch",
}, {
  tooltip: "Twitter (frzyc)",
  icon: <Twitter />,
  url: process.env.REACT_APP_URL_TWITTER_FRZYC,
  color: "twitter",
}, {
  tooltip: "Patreon (frzyc)",
  icon: <FontAwesomeSvgIcon icon={faPatreon} />,
  url: process.env.REACT_APP_URL_PATREON_FRZYC,
  color: "patreon",
}, {
  tooltip: "PayPal (frzyc)",
  icon: <FontAwesomeSvgIcon icon={faPaypal} />,
  url: process.env.REACT_APP_URL_PAYPAL_FRZYC,
  color: "paypal",
},] as const

const buttons = [{
  title: t => t`quickLinksCard.buttons.tyGuide.title`,
  icon: <YouTube />,
  tooltip: t => t`quickLinksCard.buttons.tyGuide.tooltip`,
  url: process.env.REACT_APP_URL_YOUTUBE_TUTPL,
  color: "red",
}, {
  title: t => t`quickLinksCard.buttons.scanners.title`,
  icon: <Scanner />,
  tooltip: t => t`quickLinksCard.buttons.scanners.tooltip`,
  to: "/scanner",
  color: "primary",
}, {
  title: t => t`quickLinksCard.buttons.kqm.title`,
  icon: <Handshake />,
  tooltip: t => t`quickLinksCard.buttons.kqm.tooltip`,
  url: process.env.REACT_APP_URL_WEBSITE_KQM,
  color: "keqing",
}, {
  title: t => t`quickLinksCard.buttons.devDiscord.title`,
  icon: <FontAwesomeSvgIcon icon={faDiscord} />,
  tooltip: t => t`quickLinksCard.buttons.devDiscord.tooltip`,
  url: process.env.REACT_APP_URL_DISCORD_GDEV,
  color: "discord",
}, {
  title: t => t`quickLinksCard.buttons.good.title`,
  icon: <Article />,
  tooltip: t => t`quickLinksCard.buttons.good.tooltip`,
  to: "/doc",
  color: "primary",
}] as const

export default function QuickLinksCard() {
  const { t } = useTranslation(["page_home", "ui"])
  return <CardDark>
    <CardHeader title={<Typography variant="h5">{t`quickLinksCard.title`}</Typography>} avatar={<InsertLink fontSize="large" />} />
    <Divider />
    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

      <Box display="flex" justifyContent="space-between" gap={1}>
        {smallIcons.map(({ tooltip, icon, url, color }) => <Tooltip key={tooltip} title={tooltip} placement="top" arrow>
          <Button fullWidth color={color} key={tooltip} sx={{ p: 1, minWidth: 0 }} component={Link} href={url} target="_blank" rel="noopener">{icon}</Button>
        </Tooltip>)}
      </Box>
      {buttons.map((btnProps, i) => {
        const { title, icon, tooltip, color } = btnProps
        let button;
        if ("to" in btnProps)
          button = <Button fullWidth key={i} color={color} component={RouterLink} to={btnProps.to} startIcon={icon}>{title(t)}</Button>
        if ("url" in btnProps)
          button = <Button fullWidth key={i} color={color} component={Link} href={btnProps.url} target="_blank" rel="noopener" startIcon={icon}>{title(t)}</Button>
        return <Tooltip key={i} title={tooltip(t)} placement="top" arrow>
          {button}
        </Tooltip>
      })}
    </CardContent>
  </CardDark>
}
