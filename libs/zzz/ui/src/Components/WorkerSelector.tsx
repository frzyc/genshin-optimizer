import { DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function WorkerSelector({
  numWorkers,
  setNumWorkers,
}: {
  numWorkers: number
  setNumWorkers: (w: number) => void
}) {
  const { t } = useTranslation('optimize')
  const maxWorkers = navigator.hardwareConcurrency || 8
  return (
    <DropdownButton title={`${t('numWorkers')}: ${numWorkers}`}>
      {range(1, maxWorkers).map((n) => (
        <MenuItem key={n} onClick={() => setNumWorkers(n)}>
          {n} Workers
          {/* TODO: Translation */}
          {/* {t('workers', { count: n })} */}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
