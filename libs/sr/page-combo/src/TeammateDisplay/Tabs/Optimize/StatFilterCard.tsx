import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { CardThemed, InfoTooltip } from '@genshin-optimizer/common/ui'
import type { StatFilters } from '@genshin-optimizer/sr/db'
import { LoadoutContext, useDatabaseContext } from '@genshin-optimizer/sr/ui'
import { Box, CardContent, Divider, Typography } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetEditorList from './OptimizationTargetEditorList'

export function StatFilterCard({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation('page_character_optimize')
  // const [statFilters, setStatFilters] = useState<StatFilters>({})
  const {
    loadout: { optConfigId },
  } = useContext(LoadoutContext)
  const { database } = useDatabaseContext()
  const { statFilters } = useDataManagerBase(database.optConfigs, optConfigId)!

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
            <Typography
              sx={{ fontWeight: 'bold' }}
            >{t`constraintFilter.title`}</Typography>
            <InfoTooltip
              title={<Typography>{t`constraintFilter.tooltip`}</Typography>}
            />
          </Box>
        </CardContent>
        <Divider />
        <OptimizationTargetEditorList
          statFilters={statFilters}
          setStatFilters={setStatFilters}
          disabled={disabled}
        />
      </CardThemed>
    </Box>
  )
}
