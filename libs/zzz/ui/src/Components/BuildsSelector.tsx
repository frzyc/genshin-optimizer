import { DropdownButton } from '@genshin-optimizer/common/ui'
import { maxBuildsToShowList } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { MenuItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function BuildsSelector({
  maxBuildsToShow,
  optConfigId,
}: {
  maxBuildsToShow: number
  optConfigId: string
}) {
  const { database } = useDatabaseContext()
  const { t } = useTranslation('page_optimize')
  return (
    <DropdownButton title={t('build', { count: maxBuildsToShow })}>
      <MenuItem>
        <Typography variant="caption" color="info.main">
          {t('buildDropdownDesc')}
        </Typography>
      </MenuItem>
      {maxBuildsToShowList.map((n) => (
        <MenuItem
          key={n}
          onClick={() =>
            database.optConfigs.set(optConfigId, { maxBuildsToShow: n })
          }
        >
          {t('build', { count: n })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
