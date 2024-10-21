import { CardThemed, useTitle } from '@genshin-optimizer/common/ui'
import type { CharacterContextObj } from '@genshin-optimizer/sr/ui'
import {
  CharacterContext,
  useCharacter,
  useCombo,
  useDatabaseContext,
} from '@genshin-optimizer/sr/ui'
import { Box, Skeleton } from '@mui/material'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Navigate,
  Route,
  Routes,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { ComboCharacterSelector } from './ComboCharacterSelector'
import { TeamCalcProvider } from './TeamCalcProvider'
import TeammateDisplay from './TeammateDisplay'
import type { ComboContextObj, PresetContextObj } from './context'
import { ComboContext, PresetContext, useComboContext } from './context'

const fallback = <Skeleton variant="rectangular" width="100%" height={1000} />

export default function PageTeam() {
  const { database } = useDatabaseContext()
  const { teamId: comboId } = useParams<{ teamId?: string }>()
  const invalidKey = !comboId || !database.combos.keys.includes(comboId)

  // An edit is triggered whenever a team gets opened even if no edits are done
  useEffect(() => {
    if (invalidKey) return
    database.combos.set(comboId, { lastEdit: Date.now() })
  }, [comboId, database.combos, invalidKey])

  if (invalidKey) return <Navigate to="/combos" />

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Suspense fallback={fallback}>
        {comboId && <Page comboId={comboId} />}
      </Suspense>
    </Box>
  )
}

function Page({ comboId }: { comboId: string }) {
  const navigate = useNavigate()
  const [presetIndex, setPresetIndex] = useState(0)
  const presetObj = useMemo(
    () =>
      ({
        presetIndex,
        setPresetIndex,
      } as PresetContextObj),
    [presetIndex, setPresetIndex]
  )
  const combo = useCombo(comboId)!
  const { comboMetadata } = combo
  // use the current URL as the "source of truth" for characterKey.
  const {
    params: { characterKey: characterKeyRaw },
  } = useMatch({ path: '/combos/:teamId/:characterKey', end: false }) ?? {
    params: {},
  }

  // validate characterKey
  const comboMetadatumIndex = useMemo(() => {
    const index = comboMetadata.findIndex(
      (comboMetadatum) =>
        comboMetadatum && comboMetadatum.characterKey === characterKeyRaw
    )
    if (index === -1) return 0
    return index
  }, [comboMetadata, characterKeyRaw])
  const comboMetadatum = useMemo(
    () => comboMetadata[comboMetadatumIndex],
    [comboMetadata, comboMetadatumIndex]
  )
  const characterKey = comboMetadatum?.characterKey
  useEffect(() => {
    if (characterKey && characterKey !== characterKeyRaw)
      navigate(`${characterKey}`, { replace: true })
  }, [characterKey, characterKeyRaw, comboMetadatum, navigate])

  const { t } = useTranslation(['charNames_gen', 'page_character'])

  useTitle(
    useMemo(() => {
      const charName = characterKey
        ? // TODO: replace Character with CharKeyToName function once it's ported
          t('charNames_gen:Character')
        : t('Combo Settings')
      return `${combo.name} - ${charName}`
    }, [characterKey, t, combo.name])
  )

  const comboContextObj: ComboContextObj | undefined = useMemo(() => {
    if (!comboId || !combo || !comboMetadatum) return undefined
    return {
      comboId,
      combo,
      comboMetadatum,
    }
  }, [comboMetadatum, combo, comboId])

  return (
    <PresetContext.Provider value={presetObj}>
      <TeamCalcProvider comboId={comboId} currentChar={characterKey}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexDirection: 'column',
            mx: 1,
            mt: 2,
          }}
        >
          <CardThemed
            sx={{
              overflow: 'visible',
              top: 0,
              position: 'sticky',
              zIndex: 100,
            }}
          >
            <ComboCharacterSelector comboId={comboId} charKey={characterKey} />
          </CardThemed>
          <Box
          // sx={(theme) => {
          //   const elementKey = characterKey && allStats.char[characterKey]
          //   if (!elementKey) return {}
          //   const hex = theme.palette[elementKey].main as string
          //   const color = hexToColor(hex)
          //   if (!color) return {}
          //   const rgba = colorToRgbaString(color, 0.1)
          //   return {
          //     background: `linear-gradient(to bottom, ${rgba} 0%, rgba(0,0,0,0)) 25%`,
          //   }
          // }}
          >
            {comboContextObj && (
              <ComboContext.Provider value={comboContextObj}>
                <TeammateDisplayWrapper />
              </ComboContext.Provider>
            )}
          </Box>
        </Box>
      </TeamCalcProvider>
    </PresetContext.Provider>
  )
}

function TeammateDisplayWrapper() {
  const {
    comboMetadatum: { characterKey },
  } = useComboContext()
  const character = useCharacter(characterKey)
  const characterContextValue: CharacterContextObj | undefined = useMemo(
    () =>
      character && {
        character,
      },
    [character]
  )
  if (!characterContextValue)
    return <Skeleton variant="rectangular" width="100%" height={1000} />

  return (
    <CharacterContext.Provider value={characterContextValue}>
      <Routes>
        <Route path=":characterKey">
          <Route path="*" index element={<TeammateDisplay />} />
        </Route>
      </Routes>
    </CharacterContext.Provider>
  )
}
