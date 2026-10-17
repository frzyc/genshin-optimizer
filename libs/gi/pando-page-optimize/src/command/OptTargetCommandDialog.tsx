import { ModalWrapper } from '@genshin-optimizer/common/ui'
import type { FormulaRef } from '@genshin-optimizer/gi/formula'
import { sameFormula } from '@genshin-optimizer/gi/formula'
import type { CatalogJoinedRow } from '@genshin-optimizer/gi/formula-ui'
import {
  catalogJoinedRowSearchFields,
  OptFormulaSections,
  OptTargetSelectedLabel,
  refFromJoinedRow,
  useCharCatalogRows,
  useGiCalcContext,
  useResolvedOptTarget,
} from '@genshin-optimizer/gi/formula-ui'
import { CharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { CritModeSelector } from '../OptTargetRow/CritModeSelector'
import { DimensionSelector } from '../OptTargetRow/DimensionSelector'
import { OptTargetFieldMenuItem } from '../OptTargetRow/OptTargetFieldMenuItem'
import {
  commandSearchInputProps,
  matchesCommandSearchAny,
  normalizeCommandSearch,
} from './commandSearch'

function rowMatchesSearch(row: CatalogJoinedRow, search: string): boolean {
  if (!refFromJoinedRow(row)) return false
  return matchesCommandSearchAny(catalogJoinedRowSearchFields(row), search)
}

function filterRows(rows: CatalogJoinedRow[], search: string) {
  if (!search) return rows
  return rows.filter((row) => rowMatchesSearch(row, search))
}

export function OptTargetCommandDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation('page_optimize')
  const { character } = useContext(CharacterContext)
  const characterKey = character?.key
  const database = useDatabase()
  const calc = useGiCalcContext()
  const { ref: currentRef, tag } = useResolvedOptTarget()
  const { statRows, categorySections, otherRows } = useCharCatalogRows(
    characterKey,
    calc
  )
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(normalizeCommandSearch(search))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  const filteredStatRows = useMemo(
    () => filterRows(statRows, deferredSearch),
    [statRows, deferredSearch]
  )
  const filteredOtherRows = useMemo(
    () => filterRows(otherRows, deferredSearch),
    [otherRows, deferredSearch]
  )
  const filteredCategorySections = useMemo(
    () =>
      categorySections
        .map((section) => ({
          ...section,
          rows: filterRows(section.rows, deferredSearch),
        }))
        .filter((section) => section.rows.length > 0),
    [categorySections, deferredSearch]
  )

  const hasResults =
    filteredStatRows.length > 0 ||
    filteredOtherRows.length > 0 ||
    filteredCategorySections.length > 0

  if (!characterKey) return null

  const onSelectRef = (formulaRef: FormulaRef) => {
    database.pandoTeams.set(characterKey, { ref: formulaRef })
    onClose()
  }

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          maxWidth: 640,
          width: '100%',
          mx: 'auto',
          p: 2,
          maxHeight: 'min(85vh, 640px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="subtitle1">{t('commandPickTarget')}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t('commandShortcutTarget')}
          </Typography>
        </Box>

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          alignItems="center"
          sx={{ width: '100%' }}
        >
          <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t('optTarget')}
            </Typography>
            <Typography variant="body2" noWrap>
              {currentRef && tag ? (
                <OptTargetSelectedLabel formulaRef={currentRef} />
              ) : (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {t('selectOptTarget')}
                </Typography>
              )}
            </Typography>
          </Box>
          <DimensionSelector />
          <CritModeSelector />
        </Stack>

        <Divider />

        <TextField
          inputRef={inputRef}
          size="small"
          fullWidth
          placeholder={t('commandSearchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          inputProps={commandSearchInputProps}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ overflow: 'auto', flex: 1, minHeight: 0, mx: -0.5 }}>
          {hasResults ? (
            <OptFormulaSections
              characterKey={characterKey}
              statRows={filteredStatRows}
              otherRows={filteredOtherRows}
              categorySections={filteredCategorySections}
              renderRow={(row) => {
                const formulaRef = refFromJoinedRow(row)
                if (!formulaRef) return null
                return (
                  <OptTargetFieldMenuItem
                    key={`${formulaRef.sheet}:${formulaRef.name}:${formulaRef.dim}`}
                    formulaRef={formulaRef}
                    selected={sameFormula(currentRef, formulaRef)}
                    onSelect={() => onSelectRef(formulaRef)}
                  />
                )
              }}
            />
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2, px: 1 }}
            >
              {t('commandSearchNoResults')}
            </Typography>
          )}
        </Box>
      </Box>
    </ModalWrapper>
  )
}
