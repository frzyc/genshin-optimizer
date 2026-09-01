import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { ICachedCharacter, Team } from '@genshin-optimizer/zzz/db'
import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import {
  OptFormulaSections,
  OptTargetDebugHelp,
  OptTargetSelectedLabel,
  statReadTagKey,
  statReadToTargetTag,
  TagDisplay,
  useCharFormulaFields,
  useOptCategoryCollapse,
  useResolvedOptTarget,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { Box, ListItemText, MenuItem } from '@mui/material'
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
  const { resolvedOptTag: tag } = useResolvedOptTarget()
  const { statReads, readByListingKey, categorySections, otherFields } =
    useCharFormulaFields(characterKey, calc)
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
            <OptTargetDebugHelp tag={tag} readByListingKey={readByListingKey} />
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
              <TagDisplay tag={read.tag} />
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
