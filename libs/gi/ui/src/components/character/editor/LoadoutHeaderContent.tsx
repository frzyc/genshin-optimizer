import { BootstrapTooltip } from '@genshin-optimizer/common/ui'
import { useDatabase, useOptConfig } from '@genshin-optimizer/gi/db-ui'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, CardContent, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { OptimizationIcon } from '../../../consts'
import { OptimizationTargetDisplay } from './OptimizationTargetDisplay'
export function LoadoutHeaderContent({
  teamCharId,
  showSetting = false,
  children,
}: {
  teamCharId: string
  showSetting?: boolean
  children?: ReactNode
}) {
  const { t } = useTranslation('loadout')
  const database = useDatabase()
  const { name, description, optConfigId, customMultiTargets } =
    database.teamChars.get(teamCharId)!
  const { optimizationTarget } = useOptConfig(optConfigId)!

  return (
    <CardContent
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <PersonIcon />
        <Typography variant="h6">{name}</Typography>
        {!!description && (
          <BootstrapTooltip title={<Typography>{description}</Typography>}>
            <InfoIcon />
          </BootstrapTooltip>
        )}

        {showSetting && <SettingsIcon sx={{ ml: 'auto' }} />}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <DashboardCustomizeIcon />
        <Typography>
          {t('loadoutHeader.mltTargets')}
          <strong>{customMultiTargets.length}</strong>
        </Typography>
      </Box>
      {optimizationTarget && (
        <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <OptimizationIcon />
          <Box>{t('loadoutHeader.optTarget')}</Box>
          <OptimizationTargetDisplay
            customMultiTargets={customMultiTargets}
            optimizationTarget={optimizationTarget}
          />
        </Typography>
      )}
      {children}
    </CardContent>
  )
}
