import { CardThemed } from '@genshin-optimizer/common/ui'
import { PandoOptConfigContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { ArtifactLevelSlider } from '@genshin-optimizer/gi/ui'
import { CardContent, Divider, Typography } from '@mui/material'
import { memo, useContext } from 'react'
import { useTranslation } from 'react-i18next'

export const ArtLevelFilter = memo(function ArtLevelFilter({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const { optConfigId, optConfig } = useContext(PandoOptConfigContext)
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', gap: 1 }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          {t('artLevelFilter')}
        </Typography>
      </CardContent>
      <Divider />
      <ArtifactLevelSlider
        levelLow={optConfig.levelLow}
        levelHigh={optConfig.levelHigh}
        setLow={(levelLow) =>
          database.pandoOptConfigs.set(optConfigId, { levelLow })
        }
        setHigh={(levelHigh) =>
          database.pandoOptConfigs.set(optConfigId, { levelHigh })
        }
        setBoth={(levelLow, levelHigh) =>
          database.pandoOptConfigs.set(optConfigId, {
            levelLow,
            levelHigh,
          })
        }
        disabled={disabled}
      />
    </CardThemed>
  )
})
