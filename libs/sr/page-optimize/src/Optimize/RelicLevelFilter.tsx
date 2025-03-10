import { CardThemed } from '@genshin-optimizer/common/ui'
import { relicMaxLevel } from '@genshin-optimizer/sr/consts'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import { RelicLevelSlider } from '@genshin-optimizer/sr/ui'
import { CardContent, Divider, Typography } from '@mui/material'
import { memo, useContext } from 'react'

export const RelicLevelFilter = memo(function RelicLevelFilter({
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
          Relic Level Filter
          {/* TODO: Translate */}
          {/* {t('levelFilter')} */}
        </Typography>
      </CardContent>
      <Divider />
      <RelicLevelSlider
        levelLow={optConfig?.levelLow ?? relicMaxLevel['5']}
        levelHigh={optConfig?.levelHigh ?? relicMaxLevel['5']}
        setLow={(levelLow) =>
          database.optConfigs.set(optConfigId, { levelLow })
        }
        setHigh={(levelHigh) =>
          database.optConfigs.set(optConfigId, { levelHigh })
        }
        setBoth={(levelLow, levelHigh) =>
          database.optConfigs.set(optConfigId, {
            levelLow,
            levelHigh,
          })
        }
        disabled={disabled}
      />
    </CardThemed>
  )
})
