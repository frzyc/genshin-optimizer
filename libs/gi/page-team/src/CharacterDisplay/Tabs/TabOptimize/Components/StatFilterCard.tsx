import { CardThemed, InfoTooltip } from '@genshin-optimizer/common/ui'
import type { StatFilters } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import { Box, CardContent, Divider, Typography } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetEditorList from './OptimizationTargetEditorList'

export default function StatFilterCard({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation('page_character_optimize')
  const {
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const { statFilters } = useOptConfig(optConfigId)!
  const database = useDatabase()
  const setStatFilters = useCallback(
    (statFilters: StatFilters) =>
      database.optConfigs.set(optConfigId, { statFilters }),
    [database, optConfigId]
  )

  return (
    <Box>
      <CardThemed bgt="light">
        <CardContent
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography sx={{ fontWeight: 'bold' }}>
              {t('constraintFilter.title')}
            </Typography>
            <InfoTooltip
              title={<Typography>{t('constraintFilter.tooltip')}</Typography>}
            />
          </Box>
        </CardContent>
        <Divider />
        <Box display="flex" flexDirection="column" gap={1}>
          <OptimizationTargetEditorList
            statFilters={statFilters}
            setStatFilters={setStatFilters}
            disabled={disabled}
          />
        </Box>
      </CardThemed>
    </Box>
  )
}
