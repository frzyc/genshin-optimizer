import { initTranslation } from '../../i18n'
import { Typography, Box } from '@mui/material'
import { HomeClient } from './HomeClient'

export const metadata = {
  title: 'Genshin Optimizer - Home',
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const { t } = await initTranslation(locale, 'artifact_Adventurer_gen')
  return (
    <Box sx={{ display: 'flex' }}>
      <Typography>HOME PAGE</Typography>
      <Typography>{t(`setName`)}</Typography>
      <HomeClient locale={locale} />
    </Box>
  )
}
