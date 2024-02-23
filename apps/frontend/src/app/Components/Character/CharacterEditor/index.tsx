import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useCharacter, useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { CardContent, Skeleton } from '@mui/material'
import { Suspense, useEffect, useMemo, useState } from 'react'
import type { CharacterContextObj } from '../../../Context/CharacterContext'
import { CharacterContext } from '../../../Context/CharacterContext'
import type { dataContextObj } from '../../../Context/DataContext'
import { DataContext } from '../../../Context/DataContext'
import type { ChartData, GraphContextObj } from '../../../Context/GraphContext'
import { GraphContext } from '../../../Context/GraphContext'
import { getCharSheet } from '../../../Data/Characters'
import useCharData from '../../../ReactHooks/useCharData'
import useCharacterReducer from '../../../ReactHooks/useCharacterReducer'
import Content from './Content'

export default function CharacterEditor({
  characterKey,
  onClose,
}: {
  characterKey?: CharacterKey
  onClose: () => void
}) {
  return (
    <ModalWrapper open={!!characterKey} onClose={onClose}>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
      >
        {characterKey && (
          <CharacterEditorContent
            key={characterKey}
            characterKey={characterKey}
            onClose={onClose}
          />
        )}
      </Suspense>
    </ModalWrapper>
  )
}

type CharacterDisplayCardProps = {
  characterKey: CharacterKey
  onClose?: () => void
}
function CharacterEditorContent({
  characterKey,
  onClose,
}: CharacterDisplayCardProps) {
  const character = useCharacter(characterKey)
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const teamData = useCharData(characterKey)
  const { target: charUIData } = teamData?.[characterKey] ?? {}

  const characterDispatch = useCharacterReducer(character?.key ?? '')

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      oldData: undefined,
    }
  }, [charUIData, teamData])

  const characterContextValue: CharacterContextObj | undefined = useMemo(() => {
    if (!character || !characterSheet) return undefined
    return {
      character,
      characterSheet,
      characterDispatch,
    }
  }, [character, characterSheet, characterDispatch])

  const [chartData, setChartData] = useState(undefined as ChartData | undefined)
  const [graphBuilds, setGraphBuilds] = useState<string[][]>()
  const graphContextValue: GraphContextObj | undefined = useMemo(() => {
    return {
      chartData,
      setChartData,
      graphBuilds,
      setGraphBuilds,
    }
  }, [chartData, graphBuilds])

  // Clear state when switching characters
  useEffect(() => {
    setChartData(undefined)
    setGraphBuilds(undefined)
  }, [characterKey])

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {dataContextValue && characterContextValue && graphContextValue ? (
          <CharacterContext.Provider value={characterContextValue}>
            <DataContext.Provider value={dataContextValue}>
              <GraphContext.Provider value={graphContextValue}>
                <Content onClose={onClose} />
              </GraphContext.Provider>
            </DataContext.Provider>
          </CharacterContext.Provider>
        ) : (
          <Skeleton variant="rectangular" width="100%" height={1000} />
        )}
      </CardContent>
    </CardThemed>
  )
}
