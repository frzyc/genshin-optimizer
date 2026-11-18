import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import { useTitle } from '@genshin-optimizer/common/ui'
import {
  objKeyMap,
  shouldShowDevComponents,
  stableArr,
} from '@genshin-optimizer/common/util'
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
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import type { TeamConditional } from '@genshin-optimizer/zzz/db'
import {
  CharacterContext,
  useCharacter,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import {
  getConditional,
  isMember,
  isSheet,
  type Tag,
} from '@genshin-optimizer/zzz/formula'
import {
  CharCalcProvider,
  OptTargetTagRowSxProvider,
} from '@genshin-optimizer/zzz/formula-ui'
import {
  CharacterName,
  CharacterSingleSelectionModal,
} from '@genshin-optimizer/zzz/ui'
import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { CharacterOptDisplay } from './CharacterOptDisplay'
import { OptTargetCommandDialog } from './command/OptTargetCommandDialog'
import { useOptimizeShortcuts } from './command/useOptimizeShortcuts'
import {
  OptimizePageProvider,
  useOptimizePage,
} from './context/OptimizePageContext'
import { TeamHeaderHeightProvider } from './context/TeamHeaderHeightContext'
import { OptimizeChrome } from './OptimizeChrome'

function isCharacterKey(key: string | undefined): key is CharacterKey {
  return Boolean(key && allCharacterKeys.includes(key as CharacterKey))
}

function OptimizePageContent({ characterKey }: { characterKey: CharacterKey }) {
  const { database } = useDatabaseContext()
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
    (ck: CharacterKey | null) => {
      if (!ck) return
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
          <CharacterSingleSelectionModal
            show={charPickerOpen}
            onHide={closeCharPicker}
            onSelect={(ck) => {
              setCharacterKey(ck)
              closeCharPicker()
            }}
          />
          <OptTargetCommandDialog
            open={targetPickerOpen}
            onClose={closeTargetPicker}
          />
        </Suspense>
        <OptimizeChrome characterKey={characterKey} />
        <CharacterOptDisplay />
      </OptTargetTagRowSxProvider>
    </TeamHeaderHeightProvider>
  )
}

export default function PageOptimize() {
  const { database } = useDatabaseContext()
  const navigate = useNavigate()
  const { characterKey: urlCharacterKey } = useParams()
  const { optCharKey } = useDataEntryBase(database.dbMeta)
  const { t } = useTranslation(['charNames_gen', 'page_character'])
  useTranslation('tooltips_gen')

  const characterKey = useMemo(() => {
    if (isCharacterKey(urlCharacterKey)) return urlCharacterKey
    if (isCharacterKey(optCharKey)) return optCharKey
    return allCharacterKeys[0]
  }, [urlCharacterKey, optCharKey])

  useEffect(() => {
    if (!isCharacterKey(urlCharacterKey) && characterKey) {
      navigate(`/optimize/${characterKey}`, { replace: true })
    }
  }, [urlCharacterKey, characterKey, navigate])

  useEffect(() => {
    if (isCharacterKey(urlCharacterKey) && urlCharacterKey !== optCharKey) {
      database.dbMeta.set({ optCharKey: urlCharacterKey })
    }
  }, [urlCharacterKey, optCharKey, database.dbMeta])

  const character = useCharacter(characterKey)
  useEffect(() => {
    if (characterKey && !character) database.chars.getOrCreate(characterKey)
  }, [characterKey, character, database.chars])
  const team = useTeam(characterKey)
  useEffect(() => {
    if (characterKey && !team) database.teams.getOrCreate(characterKey)
  }, [characterKey, team, database.teams])

  useTitle(
    useMemo(() => {
      const charName = characterKey && t(`charNames_gen:${characterKey}`)
      return charName ? `Optimize - ${charName}` : 'Optimize'
    }, [characterKey, t])
  )

  const srcDstDisplayContextValue = useMemo(() => {
    const charList =
      team?.teammates.map((mate) => mate.characterKey) ??
      stableArr<CharacterKey>()

    const charDisplay = objKeyMap(charList, (ck) => (
      <CharacterName characterKey={ck} />
    ))
    return {
      srcDisplay: charDisplay,
      dstDisplay: charDisplay,
      // ZZZ: src is TagContext / teammate card; dst picker deferred (too confusing).
      showSrcPicker: false,
      showDstPicker: false,
    }
  }, [team])

  const setConditional = useCallback<SetConditionalFunc>(
    (
      sheet: string,
      condKey: string,
      src: string,
      dst: string | null,
      condValue: number
    ) => {
      if (!isSheet(sheet) || !isMember(src) || !(dst === null || isMember(dst)))
        return
      const cond = getConditional(sheet, condKey)
      if (!cond) return

      database.teams.setFrameConditional(
        characterKey,
        0,
        sheet,
        condKey,
        src,
        dst,
        condValue
      )
    },
    [characterKey, database.teams]
  )
  const tag = useMemo<Tag>(
    () => ({
      src: characterKey,
      dst: characterKey,
      preset: 'preset0',
    }),
    [characterKey]
  )

  const conditionals = useMemo(
    () => [...(team?.frames[0]?.conditionals ?? stableArr<TeamConditional>())],
    [team?.frames]
  )

  const page = character && team && (
    <CharacterContext.Provider value={character}>
      <TagContext.Provider value={tag}>
        <CharCalcProvider
          character={character}
          team={team}
          wengineId={character.equippedWengine}
          discIds={character.equippedDiscs}
        >
          <SrcDstDisplayContext.Provider value={srcDstDisplayContextValue}>
            <ConditionalValuesContext.Provider value={conditionals}>
              <SetConditionalContext.Provider value={setConditional}>
                {shouldShowDevComponents ? (
                  <DebugReadProvider>
                    <OptimizePageContent characterKey={characterKey} />
                  </DebugReadProvider>
                ) : (
                  <OptimizePageContent characterKey={characterKey} />
                )}
              </SetConditionalContext.Provider>
            </ConditionalValuesContext.Provider>
          </SrcDstDisplayContext.Provider>
        </CharCalcProvider>
      </TagContext.Provider>
    </CharacterContext.Provider>
  )

  return <OptimizePageProvider key={characterKey}>{page}</OptimizePageProvider>
}
