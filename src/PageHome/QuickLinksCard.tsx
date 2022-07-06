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
  url: process.env.REACT_APP_URL_DISCORD_GO
}, {
  tooltip: "Genshin Optimizer Github",
  icon: <GitHub />,
  url: process.env.REACT_APP_URL_GITHUB_GO
}, {
  tooltip: "Youtube (frzyc)",
  icon: <YouTube />,
  url: process.env.REACT_APP_URL_YOUTUBE_FRZYC
}, {
  tooltip: "Twitch (frzyc)",
  icon: <FontAwesomeSvgIcon icon={faTwitch} />,
  url: process.env.REACT_APP_URL_TWITCH_FRZYC
}, {
  tooltip: "Twitter (frzyc)",
  icon: <Twitter />,
  url: process.env.REACT_APP_URL_TWITTER_FRZYC
}, {
  tooltip: "Patreon (frzyc)",
  icon: <FontAwesomeSvgIcon icon={faPatreon} />,
  url: process.env.REACT_APP_URL_PATREON_FRZYC
}, {
  tooltip: "PayPal (frzyc)",
  icon: <FontAwesomeSvgIcon icon={faPaypal} />,
  url: process.env.REACT_APP_URL_PAYPAL_FRZYC
},] as const

const buttons = [{
  title: t => t`quickLinksCard.buttons.tyGuide.title`,
  icon: <YouTube />,
  tooltip: t => t`quickLinksCard.buttons.tyGuide.tooltip`,
  url: process.env.REACT_APP_URL_YOUTUBE_TUTPL
}, {
  title: t => t`quickLinksCard.buttons.scanners.title`,
  icon: <Scanner />,
  tooltip: t => t`quickLinksCard.buttons.scanners.tooltip`,
  to: "/scanner"
}, {
  title: t => t`quickLinksCard.buttons.kqm.title`,
  icon: <Handshake />,
  tooltip: t => t`quickLinksCard.buttons.kqm.tooltip`,
  url: process.env.REACT_APP_URL_WEBSITE_KQM
}, {
  title: t => t`quickLinksCard.buttons.devDiscord.title`,
  icon: <FontAwesomeSvgIcon icon={faDiscord} />,
  tooltip: t => t`quickLinksCard.buttons.devDiscord.tooltip`,
  url: process.env.REACT_APP_URL_DISCORD_GDEV,
}, {
  title: t => t`quickLinksCard.buttons.good.title`,
  icon: <Article />,
  tooltip: t => t`quickLinksCard.buttons.good.tooltip`,
  to: "/doc"
}] as const

export default function QuickLinksCard() {
  const { t } = useTranslation(["page_home", "ui"])
  return <CardDark>
    <CardHeader title={<Typography variant="h5">{t`quickLinksCard.title`}</Typography>} avatar={<InsertLink fontSize="large" />} />
    <Divider />
    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

      <Box display="flex" justifyContent="space-between" gap={1}>
        {smallIcons.map(({ tooltip, icon, url }) => <Tooltip title={tooltip} placement="top" arrow>
          <Button fullWidth key={tooltip} sx={{ p: 1, minWidth: 0 }} component={Link} href={url} target="_blank" rel="noopener">{icon}</Button>
        </Tooltip>)}
      </Box>
      {buttons.map((btnProps, i) => {
        const { title, icon, tooltip } = btnProps
        let button;
        if ("to" in btnProps)
          button = <Button fullWidth key={i} component={RouterLink} to={btnProps.to} startIcon={icon}>{title(t)}</Button>
        if ("url" in btnProps)
          button = <Button fullWidth key={i} component={Link} href={btnProps.url} target="_blank" rel="noopener" startIcon={icon}>{title(t)}</Button>
        return <Tooltip title={tooltip(t)} placement="top" arrow>
          {button}
        </Tooltip>
      })}
    </CardContent>
  </CardDark>
}
