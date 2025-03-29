import { DropdownButton } from '@genshin-optimizer/common/ui'
import { MenuItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function BuildsSelector({
  numOfBuilds,
  setNumOfBuilds,
}: {
  numOfBuilds: number
  setNumOfBuilds: (w: number) => void
}) {
  const { t } = useTranslation('page_optimize')
  const numToSelect = [1, 2, 3, 5, 10]
  return (
    <DropdownButton title={`${numOfBuilds} Builds`}>
      <MenuItem>
        <Typography variant="caption" color="info.main">
          {t('buildDropdownDesc')}
        </Typography>
      </MenuItem>
      {numToSelect.map((n) => (
        <MenuItem key={n} onClick={() => setNumOfBuilds(n)}>
          {t('build', { count: n })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
