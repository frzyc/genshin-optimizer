import { useTitle } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
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
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import {
  CharacterContext,
  useCharacter,
  useCharOpt,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import {
  getConditional,
  isMember,
  isSheet,
  type Tag,
} from '@genshin-optimizer/zzz/formula'
import { CharacterName, LocationAutocomplete } from '@genshin-optimizer/zzz/ui'
import { Box } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterOptDisplay } from './CharacterOptDisplay'
import { CharCalcProvider } from './CharCalcProvider'
import { TeamHeaderHeightContext } from './context/TeamHeaderHeightContext'
import { OptSelector } from './OptSelector'

export default function PageOptimize() {
  const { database } = useDatabaseContext()
  const [characterKey, setCharacterKey] = useState<CharacterKey>(
    allCharacterKeys[0]
  )

  const { t } = useTranslation(['charNames_gen', 'page_character'])
  const character = useCharacter(characterKey)
  useEffect(() => {
    if (characterKey && !character) database.chars.getOrCreate(characterKey)
  }, [characterKey, character, database.chars])
  const charOpt = useCharOpt(characterKey)
  useEffect(() => {
    if (characterKey && !charOpt) database.charOpts.getOrCreate(characterKey)
  }, [characterKey, charOpt, database.charOpts])
  useTitle(
    useMemo(() => {
      const charName = characterKey && t(`charNames_gen:${characterKey}`)
      return charName ? `Optimize - ${charName}` : `Optimize`
    }, [characterKey, t])
  )
  const srcDstDisplayContextValue = useMemo(() => {
    const charList = characterKey ? [characterKey] : []
    const charDisplay = objKeyMap(charList, (ck) => (
      <CharacterName characterKey={ck} />
    ))
    return {
      srcDisplay: charDisplay,
      dstDisplay: charDisplay,
    }
  }, [characterKey])

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

      database.charOpts.setConditional(
        characterKey,
        sheet,
        condKey,
        src,
        dst,
        condValue
      )
    },
    [characterKey, database.charOpts]
  )
  const tag = useMemo<Tag>(
    () => ({
      src: characterKey,
      dst: characterKey,
      preset: `preset0`,
    }),
    [characterKey]
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
      <LocationAutocomplete
        locKey={characterKey}
        setLocKey={(ck) => ck && setCharacterKey(ck)}
      />
      {character && charOpt && (
        <CharacterContext.Provider value={character}>
          <TagContext.Provider value={tag}>
            <CharCalcProvider character={character} charOpt={charOpt}>
              <SrcDstDisplayContext.Provider value={srcDstDisplayContextValue}>
                <ConditionalValuesContext.Provider value={charOpt.conditionals}>
                  <SetConditionalContext.Provider value={setConditional}>
                    <DebugReadContext.Provider value={debugObj}>
                      <DebugReadModal />
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          flexDirection: 'column',
                          mt: 2,
                        }}
                      >
                        <OptSelector character={character} charOpt={charOpt} />
                        <TeamHeaderHeightContext.Provider value={0}>
                          <CharacterOptDisplay />
                        </TeamHeaderHeightContext.Provider>
                      </Box>
                    </DebugReadContext.Provider>
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
