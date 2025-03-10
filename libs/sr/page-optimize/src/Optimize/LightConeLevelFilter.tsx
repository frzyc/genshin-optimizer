import { CardThemed } from '@genshin-optimizer/common/ui'
import { lightConeMaxLevel } from '@genshin-optimizer/sr/consts'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import { LightConeLevelSlider } from '@genshin-optimizer/sr/ui'
import { CardContent, Divider, Typography } from '@mui/material'
import { memo, useContext } from 'react'

export const LightConeLevelFilter = memo(function LightConeLevelFilter({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', gap: 1 }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          LightCone Level Filter
          {/* TODO: Translate */}
          {/* {t('levelFilter')} */}
        </Typography>
      </CardContent>
      <Divider />
      <LightConeLevelSlider
        levelLow={optConfig?.lcLevelLow ?? lightConeMaxLevel}
        levelHigh={optConfig?.lcLevelHigh ?? lightConeMaxLevel}
        setLow={(lcLevelLow) =>
          database.optConfigs.set(optConfigId, { lcLevelLow })
        }
        setHigh={(lcLevelHigh) =>
          database.optConfigs.set(optConfigId, { lcLevelHigh })
        }
        setBoth={(lcLevelLow, lcLevelHigh) =>
          database.optConfigs.set(optConfigId, {
            lcLevelLow,
            lcLevelHigh,
          })
        }
        disabled={disabled}
      />
    </CardThemed>
  )
})
