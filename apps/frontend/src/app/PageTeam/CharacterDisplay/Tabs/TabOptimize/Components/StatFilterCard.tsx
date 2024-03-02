import type { StatFilters } from '@genshin-optimizer/gi/db'
import { useDatabase, useOptConfig } from '@genshin-optimizer/gi/db-ui'
import { Box, CardContent, Divider, Typography } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import CardLight from '../../../../../Components/Card/CardLight'
import InfoTooltip from '../../../../../Components/InfoTooltip'
import { TeamCharacterContext } from '../../../../../Context/TeamCharacterContext'
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
  const { statFilters } = useOptConfig(optConfigId)
  const database = useDatabase()
  const setStatFilters = useCallback(
    (statFilters: StatFilters) =>
      database.optConfigs.set(optConfigId, { statFilters }),
    [database, optConfigId]
  )

  return (
    <Box>
      <CardLight>
        <CardContent
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography
              sx={{ fontWeight: 'bold' }}
            >{t`constraintFilter.title`}</Typography>
            <InfoTooltip
              title={<Typography>{t`constraintFilter.tooltip`}</Typography>}
            />
          </Box>
        </CardContent>
        <Divider />
        <Box display="flex" flexDirection="column" gap={0.5}>
          <OptimizationTargetEditorList
            statFilters={statFilters}
            setStatFilters={setStatFilters}
            disabled={disabled}
          />
        </Box>
      </CardLight>
    </Box>
  )
}
