import { ModalWrapper } from '@genshin-optimizer/common/ui'
import type { FormulaRef } from '@genshin-optimizer/gi/formula'
import { sameFormula } from '@genshin-optimizer/gi/formula'
import {
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
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { ref: currentRef } = useResolvedOptTarget()
  const { rows } = useCharCatalogRows(characterKey, calc)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search.trim().toLowerCase())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  const options = useMemo(() => {
    const out: { ref: FormulaRef; label: string }[] = []
    for (const row of rows) {
      const formulaRef = refFromJoinedRow(row)
      if (!formulaRef) continue
      const label = `${formulaRef.sheet} ${formulaRef.name} ${formulaRef.dim}`
      if (
        deferredSearch &&
        !label.toLowerCase().includes(deferredSearch) &&
        !formulaRef.name.toLowerCase().includes(deferredSearch)
      )
        continue
      out.push({ ref: formulaRef, label })
    }
    return out
  }, [rows, deferredSearch])

  if (!characterKey) return null

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          maxWidth: 560,
          width: '100%',
          mx: 'auto',
          p: 2,
          maxHeight: 'min(70vh, 520px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1">{t('commandPickTarget')}</Typography>
        <Typography variant="caption" color="text.secondary">
          {t('commandShortcutTarget')}
        </Typography>
        <TextField
          inputRef={inputRef}
          size="small"
          fullWidth
          placeholder={t('commandSearchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <List dense sx={{ overflow: 'auto', flex: 1 }}>
          {options.map(({ ref }) => (
            <ListItemButton
              key={`${ref.sheet}:${ref.name}:${ref.dim}`}
              selected={sameFormula(currentRef, ref)}
              onClick={() => {
                database.pandoTeams.set(characterKey, { ref })
                onClose()
              }}
            >
              <ListItemText
                primary={<OptTargetSelectedLabel formulaRef={ref} />}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </ModalWrapper>
  )
}
