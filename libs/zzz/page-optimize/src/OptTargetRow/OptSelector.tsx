import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { TargetTag } from '@genshin-optimizer/zzz/db'
import {
  type ICachedCharacter,
  type Team,
  getTeamFrame0,
  targetTag,
} from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { own } from '@genshin-optimizer/zzz/formula'
import {
  FullTagDisplay,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { Box, ListItemText, MenuItem } from '@mui/material'
import { useMemo } from 'react'

const statTargets = [
  own.final.atk,
  own.final.hp,
  own.final.def,
  own.final.enerRegen,
  own.final.anomProf,
  own.final.anomMas,
] as const

export function OptSelector({
  character: { key: characterKey },
  team,
}: {
  team: Team
  character: ICachedCharacter
}) {
  const { tag: target } = getTeamFrame0(team)
  const calc = useZzzCalcContext()
  const { database } = useDatabaseContext()
  const tag = useMemo(() => {
    if (!target) return undefined
    return targetTag(target)
  }, [target])

  return (
    <DropdownButton
      color={tag ? 'success' : 'warning'}
      title={
        tag ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* TODO: translate */}
            <strong>Optimization Target: </strong>
            {<FullTagDisplay tag={tag} />}
          </Box>
        ) : (
          'Select an Optimization Target'
        )
      }
      variant={tag ? 'outlined' : undefined}
      sx={{ height: '100%', flexGrow: 1 }}
    >
      {calc?.listFormulas(own.listing.formulas).map(({ tag }, i) => {
        const { name, sheet } = tag
        if (!name || !sheet) return
        return (
          <MenuItem
            key={`${i}_${tag.sheet}_${tag.name}`}
            onClick={() =>
              database.teams.setFrame0(characterKey, {
                tag: {
                  sheet,
                  name,
                },
              })
            }
          >
            <ListItemText>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FullTagDisplay tag={tag} />
              </Box>
            </ListItemText>
          </MenuItem>
        )
      })}
      {statTargets.map(({ tag }, i) => {
        const { q, qt } = tag
        if (!q || !qt) return
        return (
          <MenuItem
            key={`${i}_${q}_${qt}`}
            onClick={() =>
              database.teams.setFrame0(characterKey, {
                tag: {
                  q: q as TargetTag['q'],
                  qt: qt as 'final',
                },
              })
            }
          >
            <ListItemText>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FullTagDisplay tag={tag} />
              </Box>
            </ListItemText>
          </MenuItem>
        )
      })}
    </DropdownButton>
  )
}
