import { DropdownButton } from '@genshin-optimizer/common/ui'
import { CharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { sameFormula } from '@genshin-optimizer/gi/formula'
import {
  listingReadForRef,
  OptFormulaSections,
  OptTargetDebugHelp,
  OptTargetSelectedLabel,
  refFromJoinedRow,
  useCharCatalogRows,
  useGiCalcContext,
  useResolvedOptTarget,
} from '@genshin-optimizer/gi/formula-ui'
import { Box } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { OptTargetFieldMenuItem } from './OptTargetFieldMenuItem'

export function OptSelector() {
  const { t } = useTranslation('page_optimize')
  const { character } = useContext(CharacterContext)
  const characterKey = character?.key
  const database = useDatabase()
  const calc = useGiCalcContext()
  const { ref: currentRef, tag } = useResolvedOptTarget()
  const { rows, statRows, categorySections, otherRows } = useCharCatalogRows(
    characterKey,
    calc
  )
  const calcRead = listingReadForRef(currentRef, rows)

  const selectedTitle =
    currentRef && tag ? (
      <OptTargetSelectedLabel formulaRef={currentRef} />
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
            <strong>{t('optTarget')}:</strong>
            {selectedTitle}
            <OptTargetDebugHelp tag={tag} calcRead={calcRead} />
          </Box>
        ) : (
          t('selectOptTarget')
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
          characterKey={characterKey}
          statRows={statRows}
          otherRows={otherRows}
          categorySections={categorySections}
          renderRow={(row) => {
            const formulaRef = refFromJoinedRow(row)
            if (!formulaRef) return null
            return (
              <OptTargetFieldMenuItem
                key={`${formulaRef.sheet}:${formulaRef.name}`}
                formulaRef={formulaRef}
                selected={sameFormula(currentRef, formulaRef)}
                onSelect={() =>
                  database.pandoTeams.set(characterKey, { ref: formulaRef })
                }
              />
            )
          }}
        />
      )}
    </DropdownButton>
  )
}
