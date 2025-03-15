import { CardThemed, ConditionalWrapper } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { CharacterContextObj } from '@genshin-optimizer/gi/db-ui'
import {
  CharacterContext,
  useCharMeta,
  useCharacter,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import {
  Box,
  CardActionArea,
  CardContent,
  IconButton,
  Skeleton,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useMemo } from 'react'
import type { dataContextObj } from '../../context'
import { DataContext } from '../../context'
import { useCharData } from '../../hooks'
import {
  CharacterCardEquipmentRow,
  CharacterCardHeader,
  CharacterCardHeaderContent,
  CharacterCardStats,
  HeaderContentNew,
} from './card'

export function CharacterCard({
  characterKey,
  onClick,
  onClickHeader,
  hideStats,
}: {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
  onClickHeader?: (characterKey: CharacterKey) => void
  hideStats?: boolean
}) {
  const database = useDatabase()
  const teamData = useCharData(characterKey)
  const character = useCharacter(characterKey)
  const data = teamData?.[characterKey]?.target
  const onClickHandler = useCallback(
    () => characterKey && onClick?.(characterKey),
    [characterKey, onClick],
  )
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea
        onClick={onClickHandler}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </CardActionArea>
    ),
    [onClickHandler],
  )

  const characterContextObj: CharacterContextObj | undefined = useMemo(
    () =>
      character && {
        character,
      },
    [character],
  )
  const dataContextObj: dataContextObj | undefined = useMemo(
    () =>
      data &&
      teamData && {
        data,
        teamData,
      },
    [data, teamData],
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
      <CardThemed
        bgt="light"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(200,200,200,0.3)',
          ':hover': {
            border: '1px solid rgba(200,200,200,0.8)',
          },
        }}
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
            {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
        <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
          {character && dataContextObj && characterContextObj ? (
            <ExistingCharacterCardContent
              characterContextObj={characterContextObj}
              dataContextObj={dataContextObj}
              characterKey={characterKey}
              onClick={onClick}
              onClickHeader={() => onClickHeader?.(characterKey)}
              hideStats={hideStats}
            />
          ) : (
            <NewCharacterCardContent characterKey={characterKey} />
          )}
        </ConditionalWrapper>
      </CardThemed>
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
