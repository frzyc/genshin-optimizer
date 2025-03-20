import { DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { MenuItem } from '@mui/material'

export function WorkerSelector({
  numWorkers,
  setNumWorkers,
}: {
  numWorkers: number
  setNumWorkers: (w: number) => void
}) {
  const maxWorkers = navigator.hardwareConcurrency || 8
  return (
    <DropdownButton title={`${numWorkers} Workers`}>
      <MenuItem disabled>Scales with available CPU cores.</MenuItem>
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
