'use client'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { GeneratedBuild } from '@genshin-optimizer/gi/db'
import type { CharacterContextObj } from '@genshin-optimizer/gi/db-ui'
import { CharacterContext, useCharacter } from '@genshin-optimizer/gi/db-ui'
import { CardContent, Skeleton } from '@mui/material'
import { Suspense, useEffect, useMemo, useState } from 'react'
import type { dataContextObj } from '../../../context'
import { DataContext } from '../../../context'
import type { ChartData, GraphContextObj } from '../../../context/GraphContext'
import { GraphContext } from '../../../context/GraphContext'
import { useCharData } from '../../../hooks/useCharData'
import { Content } from './Content'

export function CharacterEditor({
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
  const teamData = useCharData(characterKey)
  const { target: charUIData } = teamData?.[characterKey] ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      compareData: undefined,
    }
  }, [charUIData, teamData])

  const characterContextValue: CharacterContextObj | undefined = useMemo(
    () =>
      character && {
        character,
      },
    [character]
  )

  const [chartData, setChartData] = useState<ChartData | undefined>()
  const [graphBuilds, setGraphBuilds] = useState<GeneratedBuild[] | undefined>()
  const graphContextValue: GraphContextObj | undefined = useMemo(() => {
    return {
      chartData,
      setChartData,
      graphBuilds,
      setGraphBuilds,
    }
  }, [chartData, graphBuilds])

  // biome-ignore lint/correctness/useExhaustiveDependencies: Clear state when switching characters
  useEffect(() => {
    setChartData(undefined)
    setGraphBuilds(undefined)
  }, [characterKey])

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Suspense
          fallback={
            <Skeleton variant="rectangular" width="100%" height={1000} />
          }
        >
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
        </Suspense>
      </CardContent>
    </CardThemed>
  )
}
