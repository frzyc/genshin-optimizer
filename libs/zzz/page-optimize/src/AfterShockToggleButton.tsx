import { damageTypeKeysMap } from '@genshin-optimizer/zzz/formula-ui'
import { Button } from '@mui/material'

export function AfterShockToggleButton({
  isAftershock,
  setAftershock,
}: {
  isAftershock: boolean
  setAftershock: (aftershock: boolean) => void
}) {
  return (
    <Button
      onClick={() => setAftershock(!isAftershock)}
      color={isAftershock ? 'success' : 'secondary'}
    >
      {damageTypeKeysMap.aftershock}
    </Button>
  )
}
