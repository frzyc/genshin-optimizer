import {
  DiscordIcon,
  PatreonIcon,
  PaypalIcon,
  TwitchIcon,
} from '@genshin-optimizer/common/svgicons'
import { CardThemed } from '@genshin-optimizer/common/ui'
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
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

const buttons = [
  {
    title: () => 'Genshin Optimizer Discord',
    icon: <DiscordIcon />,
    tooltip: () => '',
    url: process.env['NX_URL_DISCORD_GO'],
    color: 'discord',
  },
  {
    title: () => 'Genshin Optimizer Github',
    icon: <GitHub />,
    tooltip: () => '',
    url: process.env['NX_URL_GITHUB_GO'],
    color: 'white',
  },
  {
    title: (t: TFunction) => t`quickLinksCard.buttons.patchNotes.title`,
    icon: <Description />,
    tooltip: (t: TFunction) => t`quickLinksCard.buttons.patchNotes.tooltip`,
    url: `${process.env['NX_URL_GITHUB_GO']}/releases`,
    color: 'secondary',
  },
  {
    title: (t: TFunction) => t`quickLinksCard.buttons.tyGuide.title`,
    icon: <YouTube />,
    tooltip: (t: TFunction) => t`quickLinksCard.buttons.tyGuide.tooltip`,
    url: process.env['NX_URL_YOUTUBE_TUTPL'],
    color: 'red',
  },
  {
    title: () => 'Twitch (frzyc)',
    icon: <TwitchIcon />,
    tooltip: () => '',
    url: process.env['NX_URL_TWITCH_FRZYC'],
    color: 'twitch',
  },
  {
    title: () => 'Twitter (frzyc)',
    icon: <Twitter />,
    tooltip: () => '',
    url: process.env['NX_URL_TWITTER_FRZYC'],
    color: 'twitter',
  },
  {
    title: () => 'Patreon (frzyc)',
    icon: <PatreonIcon />,
    tooltip: () => '',
    url: process.env['NX_URL_PATREON_FRZYC'],
    color: 'patreon',
  },
  {
    title: () => 'PayPal (frzyc)',
    icon: <PaypalIcon />,
    tooltip: () => '',
    url: process.env['NX_URL_PAYPAL_FRZYC'],
    color: 'paypal',
  },
  {
    title: (t: TFunction) => t`quickLinksCard.buttons.scanners.title`,
    icon: <Scanner />,
    tooltip: (t: TFunction) => t`quickLinksCard.buttons.scanners.tooltip`,
    to: '/scanner',
    color: 'primary',
  },
  {
    title: (t: TFunction) => t`quickLinksCard.buttons.kqm.title`,
    icon: <Handshake />,
    tooltip: (t: TFunction) => t`quickLinksCard.buttons.kqm.tooltip`,
    url: process.env['NX_URL_WEBSITE_KQM'],
    color: 'keqing',
  },
  {
    title: (t: TFunction) => t`quickLinksCard.buttons.devDiscord.title`,
    icon: <DiscordIcon />,
    tooltip: (t: TFunction) => t`quickLinksCard.buttons.devDiscord.tooltip`,
    url: process.env['NX_URL_DISCORD_GDEV'],
    color: 'discord',
  },
  {
    title: (t: TFunction) => t`quickLinksCard.buttons.good.title`,
    icon: <Article />,
    tooltip: (t: TFunction) => t`quickLinksCard.buttons.good.tooltip`,
    to: '/doc',
    color: 'primary',
  },
] as const

export default function QuickLinksCard() {
  const { t } = useTranslation(['page_home', 'ui'])
  return (
    <CardThemed>
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
          if (!button) return null
          return (
            <Tooltip key={i} title={tooltip(t)} placement="top" arrow>
              {button}
            </Tooltip>
          )
        })}
      </CardContent>
    </CardThemed>
  )
}
