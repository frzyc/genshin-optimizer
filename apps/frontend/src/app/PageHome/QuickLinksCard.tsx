/* eslint @typescript-eslint/no-unused-vars: [ "warn", { "argsIgnorePattern": "^_|^t$" } ] */
import {
  Article,
  Description,
  GitHub,
  Handshake,
  InsertLink,
  Scanner,
  Twitter,
  YouTube,
} from '@mui/icons-material'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  Link,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import CardDark from '../Components/Card/CardDark'
import DiscordIcon from '../SVGIcons/DiscordIcon'
import PatreonIcon from '../SVGIcons/PatreonIcon'
import PaypalIcon from '../SVGIcons/PaypalIcon'
import TwitchIcon from '../SVGIcons/TwitchIcon'

const buttons = [
  {
    title: () => 'Genshin Optimizer Discord',
    icon: <DiscordIcon />,
    tooltip: (t) => '',
    url: process.env.NX_URL_DISCORD_GO,
    color: 'discord',
  },
  {
    title: () => 'Genshin Optimizer Github',
    icon: <GitHub />,
    tooltip: (t) => '',
    url: process.env.NX_URL_GITHUB_GO,
    color: 'white',
  },
  {
    title: (t) => t`quickLinksCard.buttons.patchNotes.title`,
    icon: <Description />,
    tooltip: (t) => t`quickLinksCard.buttons.patchNotes.tooltip`,
    url: `${process.env.NX_URL_GITHUB_GO}/releases`,
    color: 'secondary',
  },
  {
    title: (t) => t`quickLinksCard.buttons.tyGuide.title`,
    icon: <YouTube />,
    tooltip: (t) => t`quickLinksCard.buttons.tyGuide.tooltip`,
    url: process.env.NX_URL_YOUTUBE_TUTPL,
    color: 'red',
  },
  {
    title: () => 'Twitch (frzyc)',
    icon: <TwitchIcon />,
    tooltip: (t) => '',
    url: process.env.NX_URL_TWITCH_FRZYC,
    color: 'twitch',
  },
  {
    title: () => 'Twitter (frzyc)',
    icon: <Twitter />,
    tooltip: (t) => '',
    url: process.env.NX_URL_TWITTER_FRZYC,
    color: 'twitter',
  },
  {
    title: () => 'Patreon (frzyc)',
    icon: <PatreonIcon />,
    tooltip: (t) => '',
    url: process.env.NX_URL_PATREON_FRZYC,
    color: 'patreon',
  },
  {
    title: () => 'PayPal (frzyc)',
    icon: <PaypalIcon />,
    tooltip: (t) => '',
    url: process.env.NX_URL_PAYPAL_FRZYC,
    color: 'paypal',
  },
  {
    title: (t) => t`quickLinksCard.buttons.scanners.title`,
    icon: <Scanner />,
    tooltip: (t) => t`quickLinksCard.buttons.scanners.tooltip`,
    to: '/scanner',
    color: 'primary',
  },
  {
    title: (t) => t`quickLinksCard.buttons.kqm.title`,
    icon: <Handshake />,
    tooltip: (t) => t`quickLinksCard.buttons.kqm.tooltip`,
    url: process.env.NX_URL_WEBSITE_KQM,
    color: 'keqing',
  },
  {
    title: (t) => t`quickLinksCard.buttons.devDiscord.title`,
    icon: <DiscordIcon />,
    tooltip: (t) => t`quickLinksCard.buttons.devDiscord.tooltip`,
    url: process.env.NX_URL_DISCORD_GDEV,
    color: 'discord',
  },
  {
    title: (t) => t`quickLinksCard.buttons.good.title`,
    icon: <Article />,
    tooltip: (t) => t`quickLinksCard.buttons.good.tooltip`,
    to: '/doc',
    color: 'primary',
  },
] as const

export default function QuickLinksCard() {
  const { t } = useTranslation(['page_home', 'ui'])
  return (
    <CardDark>
      <CardHeader
        title={<Typography variant="h5">{t`quickLinksCard.title`}</Typography>}
        avatar={<InsertLink fontSize="large" />}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {buttons.map((btnProps, i) => {
          const { title, icon, tooltip, color } = btnProps
          let button
          if ('to' in btnProps)
            button = (
              <Button
                fullWidth
                key={i}
                color={color}
                component={RouterLink}
                to={btnProps.to}
                startIcon={icon}
              >
                {title(t)}
              </Button>
            )
          if ('url' in btnProps)
            button = (
              <Button
                fullWidth
                key={i}
                color={color}
                component={Link}
                href={btnProps.url}
                target="_blank"
                rel="noopener"
                startIcon={icon}
              >
                {title(t)}
              </Button>
            )
          return (
            <Tooltip key={i} title={tooltip(t)} placement="top" arrow>
              {button}
            </Tooltip>
          )
        })}
      </CardContent>
    </CardDark>
  )
}
