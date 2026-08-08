import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { ICachedCharacter, Team } from '@genshin-optimizer/zzz/db'
import { getTeamFrame0, targetTag } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import {
  FullTagDisplay,
  OptFormulaSections,
  OptTargetDebugHelp,
  OptTargetSelectedLabel,
  statReadTagKey,
  statReadToTargetTag,
  useCharFormulaFields,
  useOptCategoryCollapse,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { Box, ListItemText, MenuItem } from '@mui/material'
import { useMemo } from 'react'
import { OptTargetFieldMenuItem } from './OptTargetFieldMenuItem'

export function OptSelector({
  character: { key: characterKey },
  team,
}: {
  team: Team
  character: ICachedCharacter
}) {
  const { tag: target } = getTeamFrame0(team)
  const { database } = useDatabaseContext()
  const calc = useZzzCalcContext()
  const tag = useMemo(() => {
    if (!target) return undefined
    return targetTag(target)
  }, [target])

  const { statReads, categorySections, otherFields } = useCharFormulaFields(
    characterKey,
    calc
  )
  const collapse = useOptCategoryCollapse()

  const selectedTitle = tag ? (
    <OptTargetSelectedLabel charKey={characterKey} tag={tag} inline />
  ) : null

  return (
    <DropdownButton
      color={tag ? 'success' : 'warning'}
      title={
        tag ? (
          <Box
            sx={{
              display: 'flex',
              gap: 0.75,
              alignItems: 'center',
              minWidth: 0,
              overflow: 'hidden',
              textWrap: 'nowrap',
            }}
          >
            <strong>Target:</strong>
            {selectedTitle}
            <OptTargetDebugHelp tag={tag} />
          </Box>
        ) : (
          'Select an Optimization Target'
        )
      }
      variant={tag ? 'outlined' : undefined}
      sx={{
        height: '100%',
        minWidth: 0,
        maxWidth: '100%',
        width: '100%',
        justifyContent: 'flex-start',
      }}
    >
      <OptFormulaSections
        statReads={statReads}
        otherFields={otherFields}
        categorySections={categorySections}
        collapse={collapse}
        renderStatRow={(read) => (
          <MenuItem
            key={`stat_${statReadTagKey(read.tag)}`}
            onClick={() =>
              database.teams.setFrame0(characterKey, {
                tag: statReadToTargetTag(read),
              })
            }
          >
            <ListItemText>
              <FullTagDisplay tag={read.tag} />
            </ListItemText>
          </MenuItem>
        )}
        renderFormulaField={(field, { section, category, index }) => (
          <OptTargetFieldMenuItem
            key={
              section === 'other' ? `other_${index}` : `${category}_${index}`
            }
            field={field}
            fieldKey={
              section === 'other' ? `other_${index}` : `${category}_${index}`
            }
            characterKey={characterKey}
            target={target}
            database={database}
          />
        )}
      />
    </DropdownButton>
  )
}
