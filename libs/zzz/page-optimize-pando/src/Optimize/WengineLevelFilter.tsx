import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { WengineLevelSlider } from '@genshin-optimizer/zzz/ui'
import { CardContent, Divider, Typography } from '@mui/material'
import { memo, useContext } from 'react'

export const WengineLevelFilter = memo(function WengineLevelFilter({
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
          Wengine Level Filter
          {/* TODO: Translate */}
          {/* {t('levelFilter')} */}
        </Typography>
      </CardContent>
      <Divider />
      <WengineLevelSlider
        levelLow={optConfig?.wlevelLow ?? 60}
        levelHigh={optConfig?.wlevelHigh ?? 60}
        setLow={(wlevelLow) =>
          database.optConfigs.set(optConfigId, { wlevelLow })
        }
        setHigh={(wlevelHigh) =>
          database.optConfigs.set(optConfigId, { wlevelHigh })
        }
        setBoth={(wlevelLow, wlevelHigh) =>
          database.optConfigs.set(optConfigId, {
            wlevelLow,
            wlevelHigh,
          })
        }
        disabled={disabled}
      />
    </CardThemed>
  )
})
