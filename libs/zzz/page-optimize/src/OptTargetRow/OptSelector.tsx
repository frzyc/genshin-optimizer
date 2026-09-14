import { DropdownButton } from '@genshin-optimizer/common/ui'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { sameFormula } from '@genshin-optimizer/zzz/formula'
import {
  listingReadForRef,
  OptFormulaSections,
  OptTargetDebugHelp,
  OptTargetSelectedLabel,
  refFromJoinedRow,
  useCharCatalogRows,
  useOptCategoryCollapse,
  useResolvedOptTarget,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { Box } from '@mui/material'
import { OptTargetFieldMenuItem } from './OptTargetFieldMenuItem'

export function OptSelector() {
  const character = useCharacterContext()
  const characterKey = character?.key
  const { database } = useDatabaseContext()
  const calc = useZzzCalcContext()
  const { ref: currentRef, tag } = useResolvedOptTarget()
  const { rows, statRows, categorySections, otherRows } = useCharCatalogRows(
    characterKey,
    calc
  )
  const collapse = useOptCategoryCollapse()
  const calcRead = listingReadForRef(currentRef, rows)

  const selectedTitle =
    currentRef && tag ? (
      <OptTargetSelectedLabel formulaRef={currentRef} inline />
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
            <OptTargetDebugHelp tag={tag} calcRead={calcRead} />
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
      {characterKey && (
        <OptFormulaSections
          statRows={statRows}
          otherRows={otherRows}
          categorySections={categorySections}
          collapse={collapse}
          renderRow={(row) => {
            const formulaRef = refFromJoinedRow(row)
            if (!formulaRef) return null
            return (
              <OptTargetFieldMenuItem
                key={`${formulaRef.sheet}:${formulaRef.name}`}
                formulaRef={formulaRef}
                selected={sameFormula(currentRef, formulaRef)}
                onSelect={() =>
                  database.teams.setFrame0(characterKey, { ref: formulaRef })
                }
              />
            )
          }}
        />
      )}
    </DropdownButton>
  )
}
