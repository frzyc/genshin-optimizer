import { CardThemed } from '@genshin-optimizer/common/ui'
import DescriptionIcon from '@mui/icons-material/Description'
import { CardContent, CardHeader, Divider, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

declare const __VERSION__: string
export default function PageHome() {
  return (
    <CardThemed sx={{ my: 1 }}>
      <CardContent>
        <Typography variant="h5">I know what this looks like...</Typography>
        <Typography>
          This is an <i>Alpha</i>(desperately unfinished) version of{' '}
          <strong>Zenless Optimizer</strong>. You have to understand, this is
          the result of asking,
        </Typography>
        <Typography variant="caption">
          "What is the most Optimizer I can, if I was cutting corners like it's
          crunch time at a circle factory?" — frzyc, probably
        </Typography>
        <Typography>
          I know a lot of stuff isn't implemented, and the stuff that are, are
          super ugly. This is only like{' '}
          <Box component="span" sx={{ textDecoration: 'line-through' }}>
            10
          </Box>{' '}
          20 hours of coding, cut me some slack.
        </Typography>
        <Typography sx={{ my: 1 }}>Have an optimal day,</Typography>
        <Typography>
          <strong>frzyc</strong>
        </Typography>
      </CardContent>
      <Divider />
      <PatchNotesCard />
    </CardThemed>
  )
}

function PatchNotesCard() {
  const { t } = useTranslation('page_home')
  const [{ isLoaded, text }, setState] = useState({ isLoaded: false, text: '' })
  useEffect(() => {
    const regex = /^(\d+)\.(\d+)\.(\d+)$/
    const minorVersion = __VERSION__.replace(regex, `$1.$2.${0}`)
    fetch(process.env['NX_URL_GITHUB_API_ZZZ_RELEASES'] + minorVersion)
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
