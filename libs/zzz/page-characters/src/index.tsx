import { CardThemed } from '@genshin-optimizer/common/ui'
import { catTotal } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  allAttributeKeys,
  allCharacterKeys,
  allCharacterRarityKeys,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import {
  CharacterCard,
  CharacterEditor,
  CharacterRarityToggle,
  CharacterSingleSelectionModal,
  ElementToggle,
} from '@genshin-optimizer/zzz/ui'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  TextField,
} from '@mui/material'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate } from 'react-router-dom'
const columns = { xs: 1, sm: 1, md: 1, lg: 2, xl: 3 }

export default function PageCharacter() {
  const { t } = useTranslation('page_characters')
  const { database } = useDatabaseContext()
  const navigate = useNavigate()
  const {
    params: { characterKey: characterKeyRaw },
  } = useMatch({ path: '/characters/:characterKey', end: false }) ?? {
    params: {},
  }
  const { charKeys } = useMemo(() => {
    const charKeys = database.chars.keys
    return { charKeys }
  }, [database])

  const characterKey = useMemo(() => {
    if (!characterKeyRaw) return null
    if (!allCharacterKeys.includes(characterKeyRaw as CharacterKey)) {
      navigate('/characters')
      return null
    }
    return characterKeyRaw as CharacterKey
  }, [characterKeyRaw, navigate])

  const [newCharacter, setnewCharacter] = useState(false)

  const editCharacter = useCallback(
    (characterKey: CharacterKey) => {
      const character = database.chars.get(characterKey)
      if (!character) {
        database.chars.getOrCreate(characterKey)
      }
      navigate(`/characters/${characterKey}`)
    },
    [database.chars, navigate],
  )

  const attributeTotals = useMemo(
    () =>
      catTotal(allAttributeKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck]) => {
          const attribute = getCharStat(ck).attribute
          ct[attribute].total++
          if (database.chars.keys.includes(ck)) ct[attribute].current++
        }),
      ),
    [database],
  )

  const rarityTotals = useMemo(
    () =>
      catTotal(allCharacterRarityKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck]) => {
          const rarity = getCharStat(ck).rarity
          ct[rarity].total++
          if (database.chars.keys.includes(ck)) ct[rarity].current++
        }),
      ),
    [database],
  )

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      {characterKey && (
        <CharacterEditor
          characterKey={characterKey}
          onClose={() => navigate('/characters')}
        />
      )}
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={newCharacter}
          onHide={() => setnewCharacter(false)}
          onSelect={editCharacter}
        />
      </Suspense>
      <CardThemed>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Grid container spacing={1}>
            <Grid item>Wengine Toggle</Grid>
            <Grid item>
              <ElementToggle
                sx={{ height: '100%' }}
                onChange={() => {}}
                value={['fire']}
                totals={attributeTotals}
                size="small"
              />
            </Grid>
            <Grid item>
              <CharacterRarityToggle
                sx={{ height: '100%' }}
                onChange={() => {}}
                value={['S']}
                totals={rarityTotals}
                size="small"
              />
            </Grid>
            <Grid item flexGrow={1} />
            <Grid item>
              <TextField
                autoFocus
                value={'term'}
                onChange={() => {}}
                label={t('characterName')}
                size="small"
                sx={{ height: '100%' }}
                InputProps={{
                  sx: { height: '100%' },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </CardThemed>
      <Button fullWidth onClick={() => setnewCharacter(true)} color="info">
        {t('addNew')}
      </Button>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={3} columns={columns}>
          {charKeys.map((charKey) => (
            <Grid item key={charKey} xs={1}>
              <CharacterCard
                characterKey={charKey}
                onClick={() => navigate(`${charKey}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Suspense>
    </Box>
  )
}
