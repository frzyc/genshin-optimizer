import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  useCharMeta,
  useCharacter,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { Favorite, FavoriteBorder } from '@mui/icons-material'
import {
  Box,
  CardActionArea,
  CardContent,
  IconButton,
  Skeleton,
} from '@mui/material'
import { Suspense, useCallback, useMemo } from 'react'
import type { CharacterContextObj } from '../../Context/CharacterContext'
import { CharacterContext } from '../../Context/CharacterContext'
import type { dataContextObj } from '../../Context/DataContext'
import { DataContext } from '../../Context/DataContext'
import { getCharSheet } from '../../Data/Characters'
import useCharData from '../../ReactHooks/useCharData'
import useCharacterReducer from '../../ReactHooks/useCharacterReducer'
import CardLight from '../Card/CardLight'
import ConditionalWrapper from '../ConditionalWrapper'
import { CharacterCardEquipmentRow } from './CharacterCard/CharacterCardEquipmentRow'
import {
  CharacterCardHeader,
  CharacterCardHeaderContent,
  HeaderContentNew,
} from './CharacterCard/CharacterCardHeader'
import { CharacterCardStats } from './CharacterCard/CharacterCardStats'
type CharacterCardProps = {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
  onClickHeader?: (characterKey: CharacterKey) => void
  footer?: Displayable
  hideStats?: boolean
}
export default function CharacterCard({
  characterKey,
  onClick,
  onClickHeader,
  footer,
  hideStats,
}: CharacterCardProps) {
  const database = useDatabase()
  const teamData = useCharData(characterKey)
  const character = useCharacter(characterKey)
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const characterDispatch = useCharacterReducer(characterKey)
  const data = teamData?.[characterKey]?.target
  const onClickHandler = useCallback(
    () => characterKey && onClick?.(characterKey),
    [characterKey, onClick]
  )
  const actionWrapperFunc = useCallback(
    (children) => (
      <CardActionArea
        onClick={onClickHandler}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </CardActionArea>
    ),
    [onClickHandler]
  )

  const characterContextObj: CharacterContextObj | undefined = useMemo(
    () =>
      character &&
      characterSheet && {
        character,
        characterSheet,
        characterDispatch,
      },
    [character, characterSheet, characterDispatch]
  )
  const dataContextObj: dataContextObj | undefined = useMemo(
    () =>
      data &&
      teamData && {
        data,
        teamData,
      },
    [data, teamData]
  )

  const { favorite } = useCharMeta(characterKey)
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          width="100%"
          height={hideStats ? 300 : 600}
        />
      }
    >
      <CardLight
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          sx={{
            display: 'flex',
            position: 'absolute',
            zIndex: 2,
            opacity: 0.7,
          }}
        >
          <IconButton
            sx={{ p: 0.5 }}
            onClick={(_) =>
              database.charMeta.set(characterKey, { favorite: !favorite })
            }
          >
            {favorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
          {character && dataContextObj && characterContextObj ? (
            <ExistingCharacterCardContent
              characterContextObj={characterContextObj}
              dataContextObj={dataContextObj}
              characterKey={characterKey}
              onClick={onClick}
              onClickHeader={() => onClickHeader(characterKey)}
              hideStats={hideStats}
            />
          ) : (
            <NewCharacterCardContent characterKey={characterKey} />
          )}
        </ConditionalWrapper>
        {footer}
      </CardLight>
    </Suspense>
  )
}

type ExistingCharacterCardContentProps = {
  characterContextObj: CharacterContextObj
  dataContextObj: dataContextObj
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
  onClickHeader?: () => void
  hideStats?: boolean
}
function ExistingCharacterCardContent({
  characterContextObj,
  dataContextObj,
  characterKey,
  onClick,
  onClickHeader,
  hideStats,
}: ExistingCharacterCardContentProps) {
  return (
    <CharacterContext.Provider value={characterContextObj}>
      <DataContext.Provider value={dataContextObj}>
        <CharacterCardHeader
          characterKey={characterKey}
          onClick={!onClick ? onClickHeader : undefined}
        >
          <CharacterCardHeaderContent characterKey={characterKey} />
        </CharacterCardHeader>
        <Box
          sx={(theme) => ({
            p: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flexGrow: 1,
            padding: hideStats ? `${theme.spacing(1)}!important` : undefined,
          })}
        >
          <CharacterCardEquipmentRow />
          {!hideStats && <CharacterCardStats />}
        </Box>
      </DataContext.Provider>
    </CharacterContext.Provider>
  )
}

function NewCharacterCardContent({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  return (
    <>
      <CharacterCardHeader characterKey={characterKey}>
        <HeaderContentNew characterKey={characterKey} />
      </CharacterCardHeader>
      <CardContent
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
          height: '100%',
        }}
      ></CardContent>
    </>
  )
}
