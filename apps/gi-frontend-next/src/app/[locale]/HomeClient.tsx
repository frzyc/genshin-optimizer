'use client'

import { Typography } from '@mui/material'
import { useTranslation } from '../../i18n/client'

export function HomeClient({ locale }: { locale: string }) {
  const { t } = useTranslation(locale, 'artifact_Adventurer_gen')
  return <Typography>{t(`setName`)}</Typography>
}
