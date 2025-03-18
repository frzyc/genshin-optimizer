import { DiscordIcon } from '@genshin-optimizer/common/svgicons'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import { GitHub, InsertLink } from '@mui/icons-material'
import {
  Button,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

const links = [
  {
    title: () => 'Gacha Optimizer Discord',
    icon: <DiscordIcon />,
    url: process.env.NX_URL_DISCORD_GO,
  },
  {
    title: () => 'Github',
    icon: <GitHub />,
    url: process.env.NX_URL_GITHUB_GO,
  },
] as const

export default function QuickLinksCard() {
  const { t } = useTranslation(['page_home', 'ui'])
  return (
    <ZCard>
      <CardHeader
        title={
          <Typography variant="h5">{t('quickLinksCard.title')}</Typography>
        }
        avatar={<InsertLink fontSize="large" />}
      />
      <CardContent>
        <Stack spacing={1}>
          {links.map(({ title, icon, url }) => (
            <Button
              key={url}
              color="primary"
              fullWidth
              startIcon={icon}
              component="a"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              {title()}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </ZCard>
  )
}
