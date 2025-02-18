import { CardThemed } from '@genshin-optimizer/common/ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import DescriptionIcon from '@mui/icons-material/Description'
import {
  Box,
  CardContent,
  CardHeader,
  Grid,
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
          </Grid>
        </Grid>
      </Box>
    )
  // separate layout for vertical
  else
    return (
      <Box my={1} display="flex" flexDirection="column" gap={1}>
        <IntroCard />
        <QuickLinksCard />
        <TeamCard />
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
