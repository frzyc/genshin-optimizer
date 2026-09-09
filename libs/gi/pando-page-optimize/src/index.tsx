import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ImgIcon, useTitle } from '@genshin-optimizer/common/ui'
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
import { characterAsset } from '@genshin-optimizer/gi/assets'
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
  isPortedCharacter,
  OptTargetTagRowSxProvider,
} from '@genshin-optimizer/gi/formula-ui'
import {
  CharacterName,
  CharacterSingleSelectionModal,
} from '@genshin-optimizer/gi/ui'
import { Box, Button } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { CharacterOptDisplay } from './CharacterOptDisplay'
import {
  TeamHeaderHeightContext,
  TEAM_HEADER_HEIGHT_PX,
} from './context/TeamHeaderHeightContext'
import { OptTargetRow } from './OptTargetRow'

function OptimizePageContent({ character }: { character: ICachedCharacter }) {
  return (
    <OptTargetTagRowSxProvider>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexDirection: 'column',
          mt: 1,
        }}
      >
        <OptTargetRow />
        <TeamHeaderHeightContext.Provider value={TEAM_HEADER_HEIGHT_PX}>
          <CharacterOptDisplay key={character.key} />
        </TeamHeaderHeightContext.Provider>
      </Box>
    </OptTargetTagRowSxProvider>
  )
}

export default function PageOptimize() {
  const database = useDatabase()
  const { optCharKey, gender } = useDBMeta()
  const characterKey =
    (isPandoTeamCharacterKey(optCharKey) && optCharKey) || allCharacterKeys[0]
  const [show, onShow, onHide] = useBoolState()
  const setCharacterKey = useCallback(
    (ck: CharacterKey) => database.dbMeta.set({ optCharKey: ck }),
    [database.dbMeta]
  )

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

  const ported = isPortedCharacter(characterKey)

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
          bgcolor: 'background.default',
        }}
      >
        <Button
          fullWidth
          color={ported ? 'success' : 'warning'}
          sx={{ justifyContent: 'flex-start', pl: '6px' }}
          onClick={onShow}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ImgIcon
              size={2}
              src={characterAsset(characterKey, 'icon', gender ?? 'F')}
            />
            <CharacterName characterKey={characterKey} gender={gender ?? 'F'} />
          </Box>
        </Button>
      </Box>
      {character && pandoTeam?.optConfigId && (
        <PandoOptConfigProvider optConfigId={pandoTeam.optConfigId}>
          <CharacterContext.Provider value={{ character }}>
            <TagContext.Provider value={tag}>
              <SrcDstDisplayContext.Provider value={srcDstDisplayContextValue}>
                <ConditionalValuesContext.Provider value={conditionals}>
                  <SetConditionalContext.Provider value={setConditional}>
                    {ported ? (
                      <CharCalcProvider
                        character={character}
                        pandoTeam={pandoTeam}
                      >
                        <DebugReadProvider>
                          <OptimizePageContent character={character} />
                        </DebugReadProvider>
                      </CharCalcProvider>
                    ) : (
                      <OptimizePageContent character={character} />
                    )}
                  </SetConditionalContext.Provider>
                </ConditionalValuesContext.Provider>
              </SrcDstDisplayContext.Provider>
            </TagContext.Provider>
          </CharacterContext.Provider>
        </PandoOptConfigProvider>
      )}
    </Box>
  )
}
