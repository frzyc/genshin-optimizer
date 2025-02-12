import { CardThemed } from '@genshin-optimizer/common/ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import DescriptionIcon from '@mui/icons-material/Description'
import { CardContent, CardHeader, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Roadmap } from './Roadmap'

declare const __VERSION__: string
export default function PageHome() {
  return (
    <Stack spacing={1} sx={{ my: 1 }}>
      <Roadmap />
      <ZCard>
        <PatchNotesCard />
      </ZCard>
    </Stack>
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
