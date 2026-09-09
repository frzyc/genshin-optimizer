import { DropdownButton } from '@genshin-optimizer/common/ui'
import { pandoMaxBuildsToShowList } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { MenuItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function BuildsSelector({
  maxBuildsToShow,
  optConfigId,
}: {
  maxBuildsToShow: number
  optConfigId: string
}) {
  const database = useDatabase()
  const { t } = useTranslation('page_optimize')
  return (
    <DropdownButton title={t('build', { count: maxBuildsToShow })}>
      <MenuItem>
        <Typography variant="caption" color="info.main">
          {t('buildDropdownDesc')}
        </Typography>
      </MenuItem>
      {pandoMaxBuildsToShowList.map((n) => (
        <MenuItem
          key={n}
          onClick={() =>
            database.pandoOptConfigs.set(optConfigId, { maxBuildsToShow: n })
          }
        >
          {t('build', { count: n })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

export function WorkerSelector({
  numWorkers,
  setNumWorkers,
}: {
  numWorkers: number
  setNumWorkers: (w: number) => void
}) {
  const { t } = useTranslation('page_optimize')
  const maxWorkers = navigator.hardwareConcurrency || 8
  return (
    <DropdownButton title={t('worker', { count: numWorkers })}>
      <MenuItem disabled>{t('workersCaption')}</MenuItem>
      {Array.from({ length: maxWorkers }, (_, i) => i + 1).map((n) => (
        <MenuItem key={n} onClick={() => setNumWorkers(n)}>
          {t('worker', { count: n })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
