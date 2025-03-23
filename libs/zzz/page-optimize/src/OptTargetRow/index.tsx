import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { CharOpt, ICachedCharacter } from '@genshin-optimizer/zzz/db'
import {
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { qtMap } from '@genshin-optimizer/zzz/formula-ui'
import { Box, MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { AfterShockToggleButton } from '../AfterShockToggleButton'
import { CritModeSelector } from './CritModeSelector'
import { OptSelector } from './OptSelector'
import { SpecificDmgTypeSelector } from './SpecificDmgTypeSelector'
export function OptTargetRow({
  character,
  charOpt,
}: { character: ICachedCharacter; charOpt: CharOpt }) {
  return (
    <Box
      display="flex"
      gap={1}
      sx={{
        position: 'sticky',
        top: 40,
        zIndex: 100,
        background: '#0C1020',
      }}
    >
      <OptSelector character={character} charOpt={charOpt} />
      <StatQtDropDown />
      <SpecificDmgTypeSelector />
      <AfterShockToggle />
      <CritModeSelector />
    </Box>
  )
}

function AfterShockToggle() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { target } = charOpt
  const setAfterShock = useCallback(
    (aftershock: boolean) =>
      database.charOpts.set(character.key, ({ target: oldTarget = {} }) => {
        const { damageType2, ...oTarget } = oldTarget
        if (!aftershock) return { target: oTarget }
        return {
          target: {
            ...oTarget,
            damageType2: 'aftershock',
          },
        }
      }),
    [database, character.key]
  )
  if (target?.name !== 'standardDmgInst') return null
  return (
    <AfterShockToggleButton
      isAftershock={target?.damageType2 === 'aftershock'}
      setAftershock={setAfterShock}
    />
  )
}
function StatQtDropDown() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { target } = charOpt
  const { q, qt } = target ?? {}
  if (!q || !qt) return null
  return (
    <DropdownButton title={qtMap[qt as 'final' | 'initial']}>
      {(['final', 'initial'] as const).map((mqt) => (
        <MenuItem
          key={mqt}
          selected={mqt === qt}
          disabled={mqt === qt}
          onClick={() =>
            database.charOpts.set(character.key, { target: { q, qt: mqt } })
          }
        >
          {qtMap[mqt]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
