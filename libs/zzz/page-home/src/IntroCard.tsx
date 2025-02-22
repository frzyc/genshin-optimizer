import { ZCard } from '@genshin-optimizer/zzz/ui'
import { CardContent, Link, Typography } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
export function IntroCard() {
  const { t } = useTranslation('page_home')
  return (
    <ZCard>
      <CardContent>
        <Typography variant="h4">Zenless Optimizer</Typography>
        <Typography variant="subtitle1">
          {/* TODO: translation, will likely change as project evolve more */}
          <Trans t={t} i18nKey="intro_TODO">
            Your <strong>ultimate</strong>{' '}
            <Link
              href="https://zenless.hoyoverse.com/"
              target="_blank"
              rel="noreferrer"
            >
              <i>Zenless Zone Zero</i>
            </Link>{' '}
            calculator! ZO will craft the best build, with what you have.
          </Trans>
        </Typography>
      </CardContent>
    </ZCard>
  )
}
