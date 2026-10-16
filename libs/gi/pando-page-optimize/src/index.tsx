import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, useTitle } from '@genshin-optimizer/common/ui'
import { stableArr } from '@genshin-optimizer/common/util'
import {
  DebugReadProvider,
  TagContext,
} from '@genshin-optimizer/game-opt/formula-ui'
import type { SetConditionalFunc } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  ConditionalValuesContext,
  SetConditionalContext,
  SrcDstDisplayContext,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allCharacterKeys } from '@genshin-optimizer/gi/consts'
import type {
  ICachedCharacter,
  PandoTeamConditional,
} from '@genshin-optimizer/gi/db'
import {
  isPandoTeamCharacterKey,
  pandoTeammateMembers,
} from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  PandoOptConfigProvider,
  useCharacter,
  useDatabase,
  useDBMeta,
  usePandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import type { Tag } from '@genshin-optimizer/gi/formula'
import {
  getConditional,
  isMember,
  isSheet,
} from '@genshin-optimizer/gi/formula'
import {
  CharCalcProvider,
  OptTargetTagRowSxProvider,
} from '@genshin-optimizer/gi/formula-ui'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import { Box, Button, CardContent, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { CharacterCommandDialog } from './command/CharacterCommandDialog'
import { OptTargetCommandDialog } from './command/OptTargetCommandDialog'
import { useOptimizeShortcuts } from './command/useOptimizeShortcuts'
import { CharacterOptDisplay } from './CharacterOptDisplay'
import {
  OptimizePageProvider,
  useOptimizePage,
} from './context/OptimizePageContext'
import { TeamHeaderHeightProvider } from './context/TeamHeaderHeightContext'
import { OptimizeChrome } from './OptimizeChrome'
import { OptimizeReadiness } from './OptimizeReadiness'

function isCharacterKey(key: string | undefined): key is CharacterKey {
  return Boolean(key && allCharacterKeys.includes(key as CharacterKey))
}

function OptimizePageContent({ character }: { character: ICachedCharacter }) {
  const database = useDatabase()
  const navigate = useNavigate()
  const {
    charPickerOpen,
    closeCharPicker,
    openCharPicker,
    targetPickerOpen,
    closeTargetPicker,
    openTargetPicker,
  } = useOptimizePage()

  const setCharacterKey = useCallback(
    (ck: CharacterKey) => {
      database.dbMeta.set({ optCharKey: ck })
      navigate(`/optimize/${ck}`, { replace: true })
    },
    [database.dbMeta, navigate]
  )

  useOptimizeShortcuts({
    enabled: true,
    onOpenCharacter: openCharPicker,
    onOpenTarget: openTargetPicker,
  })

  return (
    <TeamHeaderHeightProvider>
      <OptTargetTagRowSxProvider>
        <Suspense fallback={false}>
          <CharacterCommandDialog
            open={charPickerOpen}
            onClose={closeCharPicker}
            onSelect={setCharacterKey}
          />
          <OptTargetCommandDialog
            open={targetPickerOpen}
            onClose={closeTargetPicker}
          />
        </Suspense>
        <OptimizeChrome
          characterKey={character.key}
          onCharacterKeyChange={setCharacterKey}
        />
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexDirection: 'column',
            mt: 1,
          }}
        >
          <OptimizeReadiness />
          <CharacterOptDisplay key={character.key} />
        </Box>
      </OptTargetTagRowSxProvider>
    </TeamHeaderHeightProvider>
  )
}

export default function PageOptimize() {
  const database = useDatabase()
  const navigate = useNavigate()
  const { characterKey: urlCharacterKey } = useParams()
  const { optCharKey, gender } = useDBMeta()
  const chars = useDataManagerValues(database.chars)
  const { t } = useTranslation('page_optimize')

  const characterKey = useMemo(() => {
    if (isCharacterKey(urlCharacterKey)) return urlCharacterKey
    if (isPandoTeamCharacterKey(optCharKey)) return optCharKey
    return allCharacterKeys[0]
  }, [urlCharacterKey, optCharKey])

  useEffect(() => {
    if (!isCharacterKey(urlCharacterKey) && characterKey) {
      navigate(`/optimize/${characterKey}`, { replace: true })
    }
  }, [urlCharacterKey, characterKey, navigate])

  useEffect(() => {
    if (
      isCharacterKey(urlCharacterKey) &&
      urlCharacterKey !== optCharKey
    ) {
      database.dbMeta.set({ optCharKey: urlCharacterKey })
    }
  }, [urlCharacterKey, optCharKey, database.dbMeta])

  const character = useCharacter(characterKey)
  useEffect(() => {
    if (characterKey && !character)
      database.chars.getWithInitWeapon(characterKey)
  }, [characterKey, character, database.chars])
  const pandoTeam = usePandoTeam(characterKey)
  useEffect(() => {
    if (characterKey) database.pandoTeams.getOrCreate(characterKey)
  }, [characterKey, database.pandoTeams])

  useTitle(
    useMemo(
      () => (characterKey ? `Optimize - ${characterKey}` : 'Optimize'),
      [characterKey]
    )
  )

  const srcDstDisplayContextValue = useMemo(() => {
    const srcDisplay: Record<string, ReactNode> = {
      '0': <CharacterName characterKey={characterKey} gender={gender ?? 'F'} />,
    }
    pandoTeam?.teammates?.forEach((ck, i) => {
      if (!ck) return
      srcDisplay[pandoTeammateMembers[i]!] = (
        <CharacterName characterKey={ck} gender={gender ?? 'F'} />
      )
    })
    return { srcDisplay, dstDisplay: srcDisplay }
  }, [characterKey, gender, pandoTeam?.teammates])

  const setConditional = useCallback<SetConditionalFunc>(
    (sheet, condKey, src, dst, condValue) => {
      if (!isSheet(sheet) || !isMember(src) || !(dst === null || isMember(dst)))
        return
      if (!getConditional(sheet, condKey)) return
      database.pandoTeams.setConditional(
        characterKey,
        sheet,
        condKey,
        src,
        dst,
        condValue
      )
    },
    [characterKey, database.pandoTeams]
  )

  const tag = useMemo<Tag>(
    () => ({
      src: '0',
      dst: null,
      preset: 'preset0',
    }),
    []
  )

  const conditionals = useMemo(
    () => [...(pandoTeam?.conditionals ?? stableArr<PandoTeamConditional>())],
    [pandoTeam?.conditionals]
  )

  if (chars.length === 0) {
    return (
      <CardThemed sx={{ my: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('emptyDbTitle')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('emptyDbBody')}
          </Typography>
          <Button component={RouterLink} to="/settings" variant="contained">
            {t('emptyDbCta')}
          </Button>
        </CardContent>
      </CardThemed>
    )
  }

  return (
    <OptimizePageProvider>
      {character && pandoTeam?.optConfigId && (
        <PandoOptConfigProvider optConfigId={pandoTeam.optConfigId}>
          <CharacterContext.Provider value={{ character }}>
            <TagContext.Provider value={tag}>
              <SrcDstDisplayContext.Provider value={srcDstDisplayContextValue}>
                <ConditionalValuesContext.Provider value={conditionals}>
                  <SetConditionalContext.Provider value={setConditional}>
                    <CharCalcProvider
                      character={character}
                      pandoTeam={pandoTeam}
                    >
                      <DebugReadProvider>
                        <OptimizePageContent character={character} />
                      </DebugReadProvider>
                    </CharCalcProvider>
                  </SetConditionalContext.Provider>
                </ConditionalValuesContext.Provider>
              </SrcDstDisplayContext.Provider>
            </TagContext.Provider>
          </CharacterContext.Provider>
        </PandoOptConfigProvider>
      )}
    </OptimizePageProvider>
  )
}
