import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ImgIcon, useTitle } from '@genshin-optimizer/common/ui'
import {
  objKeyMap,
  shouldShowDevComponents,
  stableArr,
} from '@genshin-optimizer/common/util'
import type { DebugReadContextObj } from '@genshin-optimizer/game-opt/formula-ui'
import {
  DebugReadContext,
  DebugReadModal,
  TagContext,
} from '@genshin-optimizer/game-opt/formula-ui'
import type { SetConditionalFunc } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  ConditionalValuesContext,
  SetConditionalContext,
  SrcDstDisplayContext,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { BaseRead } from '@genshin-optimizer/pando/engine'
import { characterAsset } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import type { TeamConditional } from '@genshin-optimizer/zzz/db'
import type { ICachedCharacter, Team } from '@genshin-optimizer/zzz/db'
import {
  CharacterContext,
  useCharacter,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import {
  type Tag,
  getConditional,
  isMember,
  isSheet,
} from '@genshin-optimizer/zzz/formula'
import { CharCalcProvider } from '@genshin-optimizer/zzz/formula-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import {
  CharacterName,
  CharacterSingleSelectionModal,
} from '@genshin-optimizer/zzz/ui'
import { Box, Button } from '@mui/material'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterOptDisplay } from './CharacterOptDisplay'
import { OptTargetRow } from './OptTargetRow'
import { TeamHeaderHeightContext } from './context/TeamHeaderHeightContext'

function OptimizePageContent({
  character,
  team,
}: {
  character: ICachedCharacter
  team: Team
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexDirection: 'column',
        mt: 1,
      }}
    >
      <OptTargetRow character={character} team={team} />
      <TeamHeaderHeightContext.Provider value={74}>
        <CharacterOptDisplay key={character.key} />
      </TeamHeaderHeightContext.Provider>
    </Box>
  )
}

export default function PageOptimize() {
  const { database } = useDatabaseContext()
  const { optCharKey } = useDataEntryBase(database.dbMeta)
  const characterKey = optCharKey ?? allCharacterKeys[0]
  const [show, onShow, onHide] = useBoolState()
  const setCharacterKey = useCallback(
    (ck: CharacterKey | null) =>
      database.dbMeta.set({ optCharKey: ck === null ? undefined : ck }),
    [database.dbMeta]
  )

  const { t } = useTranslation(['charNames_gen', 'page_character'])
  // Load tooltip translations
  useTranslation('tooltips_gen')
  const character = useCharacter(characterKey)
  if (characterKey && !character) database.chars.getOrCreate(characterKey)
  const team = useTeam(characterKey)
  if (characterKey && !team) database.teams.getOrCreate(characterKey)
  useTitle(
    useMemo(() => {
      const charName = characterKey && t(`charNames_gen:${characterKey}`)
      return charName ? `Optimize - ${charName}` : `Optimize`
    }, [characterKey, t])
  )
  const srcDstDisplayContextValue = useMemo(() => {
    const charList =
      team?.teammates.map((t) => t.characterKey) ?? stableArr<CharacterKey>()

    const charDisplay = objKeyMap(charList, (ck) => (
      <CharacterName characterKey={ck} />
    ))
    return {
      srcDisplay: charDisplay,
      dstDisplay: charDisplay,
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
      preset: `preset0`,
    }),
    [characterKey]
  )

  const conditionals = useMemo(
    () => [...(team?.frames[0]?.conditionals ?? stableArr<TeamConditional>())],
    [team?.frames]
  )

  const [debugRead, setDebugRead] = useState<BaseRead>()
  const debugObj = useMemo<DebugReadContextObj>(
    () => ({
      read: debugRead,
      setRead: setDebugRead,
    }),
    [debugRead]
  )
  return (
    <Box>
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={show}
          onHide={onHide}
          onSelect={setCharacterKey}
        />
      </Suspense>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#0C1020',
        }}
      >
        <Button
          fullWidth
          color={getCharStat(characterKey).attribute}
          sx={{
            justifyContent: 'flex-start',
            pl: '6px',
          }}
          onClick={onShow}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ImgIcon size={2} src={characterAsset(characterKey, 'circle')} />
            {t(`charNames_gen:${characterKey}`)}
          </Box>
        </Button>
      </Box>
      {character && team && (
        <CharacterContext.Provider value={character}>
          <TagContext.Provider value={tag}>
            <CharCalcProvider team={team}>
              <SrcDstDisplayContext.Provider value={srcDstDisplayContextValue}>
                <ConditionalValuesContext.Provider value={conditionals}>
                  <SetConditionalContext.Provider value={setConditional}>
                    {shouldShowDevComponents ? (
                      <DebugReadContext.Provider value={debugObj}>
                        <DebugReadModal />
                        <OptimizePageContent
                          character={character}
                          team={team}
                        />
                      </DebugReadContext.Provider>
                    ) : (
                      <OptimizePageContent character={character} team={team} />
                    )}
                  </SetConditionalContext.Provider>
                </ConditionalValuesContext.Provider>
              </SrcDstDisplayContext.Provider>
            </CharCalcProvider>
          </TagContext.Provider>
        </CharacterContext.Provider>
      )}
    </Box>
  )
}
