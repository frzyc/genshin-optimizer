import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ImgIcon, useTitle } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { DebugReadContextObj } from '@genshin-optimizer/game-opt/formula-ui'
import {
  DebugReadContext,
  DebugReadModal,
  TagContext,
} from '@genshin-optimizer/game-opt/formula-ui'
import type {
  FormulaTextFunc,
  FullTagDisplayComponent,
  SetConditionalFunc,
  TagDisplayComponent,
} from '@genshin-optimizer/game-opt/sheet-ui'
import {
  ConditionalValuesContext,
  FormulaTextContext,
  FullTagDisplayContext,
  SetConditionalContext,
  SrcDstDisplayContext,
  TagDisplayContext,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { BaseRead } from '@genshin-optimizer/pando/engine'
import { characterAsset } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import {
  CharacterContext,
  useCharOpt,
  useCharacter,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import {
  type Tag,
  getConditional,
  isMember,
  isSheet,
} from '@genshin-optimizer/zzz/formula'
import {
  CharCalcProvider,
  FullTagDisplay,
  TagDisplay,
  formulaText,
} from '@genshin-optimizer/zzz/formula-ui'
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
  const character = useCharacter(characterKey)
  if (characterKey && !character) database.chars.getOrCreate(characterKey)
  const charOpt = useCharOpt(characterKey)
  if (characterKey && !charOpt) database.charOpts.getOrCreate(characterKey)
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
    <Providers>
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
        {character && charOpt && (
          <CharacterContext.Provider value={character}>
            <TagContext.Provider value={tag}>
              <CharCalcProvider
                character={character}
                charOpt={charOpt}
                wengineId={character.equippedWengine}
                discIds={character.equippedDiscs}
              >
                <SrcDstDisplayContext.Provider
                  value={srcDstDisplayContextValue}
                >
                  <ConditionalValuesContext.Provider
                    value={charOpt.conditionals}
                  >
                    <SetConditionalContext.Provider value={setConditional}>
                      <DebugReadContext.Provider value={debugObj}>
                        <DebugReadModal />
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            flexDirection: 'column',
                            mt: 1,
                          }}
                        >
                          <OptTargetRow
                            character={character}
                            charOpt={charOpt}
                          />
                          <TeamHeaderHeightContext.Provider value={74}>
                            <CharacterOptDisplay key={character.key} />
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
    </Providers>
  )
}
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FormulaTextContext.Provider value={formulaText as FormulaTextFunc}>
      <TagDisplayContext.Provider value={TagDisplay as TagDisplayComponent}>
        <FullTagDisplayContext.Provider
          value={FullTagDisplay as FullTagDisplayComponent}
        >
          {children}
        </FullTagDisplayContext.Provider>
      </TagDisplayContext.Provider>
    </FormulaTextContext.Provider>
  )
}
