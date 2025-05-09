import {
  AdResponsive,
  ZO_LOOTBAR_LINK,
  zo_lootbar_banner,
} from '@genshin-optimizer/common/ad'
import { CardThemed, NextImage } from '@genshin-optimizer/common/ui'
import { ZCard, ZOAdWrapper } from '@genshin-optimizer/zzz/ui'
import DescriptionIcon from '@mui/icons-material/Description'
import {
  Box,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { IntroCard } from './IntroCard'
import QuickLinksCard from './QuickLinksCard'
import { Roadmap } from './Roadmap'
import TeamCard from './TeamCard'

declare const __VERSION__: string
export default function PageHome() {
  const theme = useTheme()
  const lg = useMediaQuery(theme.breakpoints.up('lg'))
  if (lg)
    return (
      <Box sx={{ my: 1 }}>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            lg={7}
            xl={8}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <IntroCard />
            <LootbarCard />
            <Roadmap />
            <ZCard>
              <PatchNotesCard />
            </ZCard>
          </Grid>
          <Grid
            item
            xs={12}
            lg={5}
            xl={4}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <QuickLinksCard />
            <TeamCard />
            <AdResponsive dataAdSlot="2501378510" Ad={ZOAdWrapper} />
          </Grid>
        </Grid>
      </Box>
    )
  // separate layout for vertical
  else
    return (
      <Box my={1} display="flex" flexDirection="column" gap={1}>
        <IntroCard />
        <LootbarCard />
        <QuickLinksCard />
        <TeamCard />
        <Roadmap />
        <PatchNotesCard />
      </Box>
    )
}

function PatchNotesCard() {
  const { t } = useTranslation('page_home')
  const [{ isLoaded, text }, setState] = useState({ isLoaded: false, text: '' })
  useEffect(() => {
    const regex = /^(\d+)\.(\d+)\.(\d+)$/
    const minorVersion = __VERSION__.replace(regex, `$1.$2.${0}`)
    fetch(process.env['NX_URL_GITHUB_API_GO_RELEASES'] + minorVersion)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder('utf-8')
        const data = decoder.decode(buffer)
        const release = JSON.parse(data)
        setState({ isLoaded: true, text: release.body })
      })
      .catch((err) => console.log('Error: ' + err.message))
  }, [])

  return (
    <CardThemed>
      <CardHeader
        title={
          <Typography variant="h5">
            {t('quickLinksCard.buttons.patchNotes.title')}
          </Typography>
        }
        avatar={<DescriptionIcon fontSize="large" />}
        sx={{ padding: '16px 16px 0 16px' }}
      />
      <CardContent>
        {isLoaded ? (
          <ReactMarkdown children={text} remarkPlugins={[remarkGfm]} />
        ) : (
          'Loading...'
        )}
      </CardContent>
    </CardThemed>
  )
}
function LootbarCard() {
  return (
    <ZCard>
      <CardActionArea
        LinkComponent={Link}
        href={ZO_LOOTBAR_LINK}
        target="_blank"
        sx={{ margin: 'auto' }}
        aria-label="Visit Lootbar.gg for Zenless Zone Zero top-ups"
      >
        <Box
          component={NextImage ? NextImage : 'img'}
          alt="Lootbar.gg Banner"
          src={zo_lootbar_banner}
          sx={{ width: '100%', height: 'auto', marginBottom: '-7px' }}
        />
      </CardActionArea>
    </ZCard>
  )
}
