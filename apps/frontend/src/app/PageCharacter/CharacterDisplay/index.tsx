import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { Box, CardContent, Skeleton } from '@mui/material'
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { CharacterContextObj } from '../../Context/CharacterContext'
import { CharacterContext } from '../../Context/CharacterContext'
import type { dataContextObj } from '../../Context/DataContext'
import { DataContext } from '../../Context/DataContext'
import { FormulaDataWrapper } from '../../Context/FormulaDataContext'
import type { ChartData, GraphContextObj } from '../../Context/GraphContext'
import { GraphContext } from '../../Context/GraphContext'
import { SillyContext } from '../../Context/SillyContext'
import { getCharSheet } from '../../Data/Characters'
import { DatabaseContext } from '../../Database/Database'
import useCharacter from '../../ReactHooks/useCharacter'
import useCharacterReducer from '../../ReactHooks/useCharacterReducer'
import useDBMeta from '../../ReactHooks/useDBMeta'
import useTeamData from '../../ReactHooks/useTeamData'
import Content from './Context'

export default function CharacterDisplay() {
  const navigate = useNavigate()
  const { database } = useContext(DatabaseContext)
  const onClose = useCallback(() => navigate('/characters'), [navigate])
  const { characterKey } = useParams<{ characterKey?: CharacterKey }>()
  const invalidKey = !database.chars.keys.includes(characterKey as CharacterKey)
  if (invalidKey) return <Navigate to="/characters" />

  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
      >
        {characterKey && (
          <CharacterDisplayCard
            key={characterKey}
            characterKey={characterKey}
            onClose={onClose}
          />
        )}
      </Suspense>
    </Box>
  )
}

type CharacterDisplayCardProps = {
  characterKey: CharacterKey
  onClose?: () => void
}
function CharacterDisplayCard({
  characterKey,
  onClose,
}: CharacterDisplayCardProps) {
  const { silly } = useContext(SillyContext)
  const character = useCharacter(characterKey)
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const teamData = useTeamData(characterKey)
  const { target: charUIData } = teamData?.[characterKey] ?? {}

  const { t } = useTranslation([
    'sillyWisher_charNames',
    'charNames_gen',
    'page_character',
  ])

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
                <FormulaDataWrapper>
                  <Content character={character} onClose={onClose} />
                </FormulaDataWrapper>
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
