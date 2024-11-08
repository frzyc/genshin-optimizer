import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { ArtifactLevelSlider } from '@genshin-optimizer/gi/ui'
import InfoIcon from '@mui/icons-material/Info'
import { CardContent, Divider, Tooltip, Typography } from '@mui/material'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const LevelFilter = memo(function LevelFilter({
  levelTotal,
  upOptLevelLow,
  upOptLevelHigh,
  disabled,
  optConfigId,
}: {
  levelTotal: string
  upOptLevelLow: number
  upOptLevelHigh: number
  disabled?: boolean
  optConfigId: string
}) {
  const database = useDatabase()
  const { t } = useTranslation('page_character_optimize')
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', gap: 1 }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          {t('upOptLevelFilter')}
        </Typography>
        <SqBadge color="info">{levelTotal}</SqBadge>
        <Tooltip title={t('upOptLevelFilterTooltip')}>
          <InfoIcon />
        </Tooltip>
      </CardContent>
      <Divider />
      <ArtifactLevelSlider
        levelLow={upOptLevelLow}
        levelHigh={upOptLevelHigh}
        setLow={(upOptLevelLow) =>
          database.optConfigs.set(optConfigId, { upOptLevelLow })
        }
        setHigh={(upOptLevelHigh) =>
          database.optConfigs.set(optConfigId, { upOptLevelHigh })
        }
        setBoth={(upOptLevelLow, upOptLevelHigh) =>
          database.optConfigs.set(optConfigId, {
            upOptLevelLow,
            upOptLevelHigh,
          })
        }
        disabled={disabled}
      />
    </CardThemed>
  )
})
