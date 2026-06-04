import { useConstObj } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import {
  TeamCharacterContext,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import { DataContext } from '@genshin-optimizer/gi/ui'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetSelector from '../Tabs/TabOptimize/Components/OptimizationTargetSelector'

export function OptimizationTargetControl() {
  const { t } = useTranslation('page_optimize')
  const {
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { data } = useContext(DataContext)
  const { optimizationTarget: optimizationTargetDb } =
    useOptConfig(optConfigId)!
  const optimizationTarget = useConstObj(optimizationTargetDb)

  const hasTarget =
    !!optimizationTarget &&
    !!objPathValue(data?.getDisplay(), optimizationTarget)

  return (
    <OptimizationTargetSelector
      optimizationTarget={optimizationTarget}
      setTarget={(target) =>
        database.optConfigs.set(optConfigId, { optimizationTarget: target })
      }
      disabled={false}
      defaultText={t('targetHero.unset')}
      targetSelectorModalProps={{
        excludeSections: ['character', 'bonusStats', 'teamBuff'],
      }}
      buttonProps={{
        color: hasTarget ? 'info' : 'warning',
        sx: {
          flexGrow: 1,
          minWidth: 0,
          width: '100%',
          justifyContent: 'flex-start',
          py: 0.75,
        },
      }}
    />
  )
}
