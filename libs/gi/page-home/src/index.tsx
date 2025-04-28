import { CardThemed, NextImage } from '@genshin-optimizer/common/ui'
import { AdResponsive, LOOTBAR_LINK, lootbar } from '@genshin-optimizer/gi/ui'
import DescriptionIcon from '@mui/icons-material/Description'
import {
  Box,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import InventoryCard from './InventoryCard'
import QuickLinksCard from './QuickLinksCard'
import ResinCard from './ResinCard'
import TeamCard from './TeamCard'
import VidGuideCard from './VidGuideCard'

declare const __VERSION__: string
export default function PageHome() {
  const theme = useTheme()
  const lg = useMediaQuery(theme.breakpoints.up('lg'))
  ReactGA.send({ hitType: 'pageview', page: '/home' })
  if (lg)
    return (
      <Grid container spacing={2} direction={'row-reverse'}>
        <Grid
          item
          xs={12}
          lg={5}
          xl={4}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <QuickLinksCard />
          <ResinCard />
          <AdResponsive dataAdSlot="6687816711" />
        </Grid>
        <Grid
          item
          xs={12}
          lg={7}
          xl={8}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <IntroCard />
          <LootbarCard />
          <InventoryCard />
          <VidGuideCard />
          <PatchNotesCard />
          <TeamCard />
        </Grid>
      </Grid>
    )
  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <IntroCard />
      <LootbarCard />
      <QuickLinksCard />
      <InventoryCard />
      <ResinCard />
      <VidGuideCard />
      <PatchNotesCard />
      <TeamCard />
    </Box>
  )
}

function IntroCard() {
  const { t } = useTranslation('page_home')
  return (
    <CardThemed>
      <CardContent>
        <Typography variant="subtitle1">
          <Trans t={t} i18nKey="intro">
            The <strong>ultimate</strong>{' '}
            <Link
              href="https://genshin.mihoyo.com/"
              target="_blank"
              rel="noreferrer"
            >
              <i>Genshin Impact</i>
            </Link>{' '}
            calculator, GO will keep track of your artifact/weapon/character
            inventory, and help you create the best build based on how you play,
            with what you have.
          </Trans>
        </Typography>
      </CardContent>
    </CardThemed>
  )
}
function LootbarCard() {
  return (
    <CardThemed>
      <CardActionArea
        LinkComponent={Link}
        href={LOOTBAR_LINK}
        target="_blank"
        sx={{ margin: 'auto' }}
      >
        <Box
          component={NextImage ? NextImage : 'img'}
          src={lootbar}
          sx={{ width: '100%', height: 'auto', marginBottom: '-7px' }}
        />
      </CardActionArea>
    </CardThemed>
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
      />
      <Divider />
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
