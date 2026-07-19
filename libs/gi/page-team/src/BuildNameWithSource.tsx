import { useSrcTeamCharName } from '@genshin-optimizer/gi/db-ui'
import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function BuildNameWithSource({
  name,
  srcTeamCharId,
  suffix,
}: {
  name: ReactNode
  srcTeamCharId?: string
  suffix?: ReactNode
}) {
  const { t } = useTranslation('build')
  const source = useSrcTeamCharName(srcTeamCharId)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <span>{name}</span>
        {suffix}
      </Box>
      {source && (
        <Typography variant="caption" color="text.secondary">
          {t('buildCard.source', { name: source })}
        </Typography>
      )}
    </Box>
  )
}
