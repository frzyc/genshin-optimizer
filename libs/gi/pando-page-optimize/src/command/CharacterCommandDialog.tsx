import { ModalWrapper } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allCharacterKeys } from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function CharacterCommandDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (key: CharacterKey) => void
}) {
  const { t } = useTranslation('page_optimize')
  const { gender } = useDBMeta()
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

  const keys = useMemo(() => {
    if (!deferredSearch) return allCharacterKeys
    return allCharacterKeys.filter((key) => {
      if (key.toLowerCase().includes(deferredSearch)) return true
      const ele = getCharEle(key)
      return ele.toLowerCase().includes(deferredSearch)
    })
  }, [deferredSearch])

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          maxWidth: 480,
          width: '100%',
          mx: 'auto',
          p: 2,
          maxHeight: 'min(70vh, 520px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1">{t('commandPickCharacter')}</Typography>
        <Typography variant="caption" color="text.secondary">
          {t('commandShortcutCharacter')}
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
          {keys.map((key) => (
            <ListItemButton
              key={key}
              onClick={() => {
                onSelect(key)
                onClose()
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  component="img"
                  src={characterAsset(key, 'icon', gender ?? 'F')}
                  alt=""
                  sx={{ width: 32, height: 32 }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <CharacterName characterKey={key} gender={gender ?? 'F'} />
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </ModalWrapper>
  )
}
