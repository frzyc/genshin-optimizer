import { CardThemed } from '@genshin-optimizer/common/ui'
import { discMaxLevel } from '@genshin-optimizer/zzz/consts'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { DiscLevelSlider } from '@genshin-optimizer/zzz/ui'
import { CardContent, Divider, Typography } from '@mui/material'
import { memo, useContext } from 'react'
import { useTranslation } from 'react-i18next'

export const DiscLevelFilter = memo(function DiscLevelFilter({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation('optimize')
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', gap: 1 }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          {t('discLevelFilter')}
        </Typography>
      </CardContent>
      <Divider />
      <DiscLevelSlider
        levelLow={optConfig?.levelLow ?? discMaxLevel['S']}
        levelHigh={optConfig?.levelHigh ?? discMaxLevel['S']}
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
