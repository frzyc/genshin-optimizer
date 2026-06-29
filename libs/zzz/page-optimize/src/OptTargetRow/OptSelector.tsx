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
  groupFormulas,
  isMultiTagField,
  isTagField,
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

  const groupedFields = useMemo(() => {
    if (!calc) return undefined
    return groupFormulas(
      calc.listFormulas(own.listing.formulas),
      characterKey,
      characterKey
    )
  }, [calc, characterKey])

  return (
    <DropdownButton
      color={tag ? 'success' : 'warning'}
      title={
        tag ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
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
      {groupedFields
        ? groupedFields.map((field, i) => {
            if (isMultiTagField(field)) {
              const dmgRef = field.fieldRefs.find(
                (r) => r.ref.q === 'standardDmg'
              )?.ref
              if (!dmgRef?.name) return null
              return (
                <MenuItem
                  key={`${i}_${characterKey}_${dmgRef.name}`}
                  onClick={() =>
                    database.teams.setFrame0(characterKey, {
                      tag: {
                        sheet: characterKey,
                        name: dmgRef.name ?? undefined,
                        formulaDimension: 'dmg',
                      },
                    })
                  }
                >
                  <ListItemText>
                    <Box sx={{ display: 'flex', gap: 1 }}>{field.title}</Box>
                  </ListItemText>
                </MenuItem>
              )
            }
            if (!isTagField(field)) return null
            const { fieldRef } = field
            const { name } = fieldRef
            if (!name) return null
            return (
              <MenuItem
                key={`${i}_${characterKey}_${name}_${fieldRef.q}`}
                onClick={() =>
                  database.teams.setFrame0(characterKey, {
                    tag: { sheet: characterKey, name },
                  })
                }
              >
                <ListItemText>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FullTagDisplay tag={fieldRef} />
                  </Box>
                </ListItemText>
              </MenuItem>
            )
          })
        : calc?.listFormulas(own.listing.formulas).map(({ tag }, i) => {
            const { name } = tag
            if (!name) return
            return (
              <MenuItem
                key={`${i}_${characterKey}_${tag.name}`}
                onClick={() =>
                  database.teams.setFrame0(characterKey, {
                    tag: {
                      sheet: characterKey,
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
