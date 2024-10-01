import { CardThemed, InfoTooltip } from '@genshin-optimizer/common/ui'
import type { StatFilters } from '@genshin-optimizer/sr/db'
import { Box, CardContent, Divider, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetEditorList from './OptimizationTargetEditorList'

export function StatFilterCard({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation('page_character_optimize')
  const [statFilters, setStatFilters] = useState<StatFilters>({})
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
        <Box display="flex" flexDirection="column" gap={0.5}>
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
