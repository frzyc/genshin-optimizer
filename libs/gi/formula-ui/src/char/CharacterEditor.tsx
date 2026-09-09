import {
  CardThemed,
  DropdownButton,
  ImgIcon,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import {
  allTravelerKeys,
  talentLimits,
  type CharacterKey,
} from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  useCharacter,
  useDatabase,
  useDBMeta,
} from '@genshin-optimizer/gi/db-ui'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import {
  CharacterCardHeader,
  CharacterConstellationName,
  CharacterLevelSelect,
} from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardActionArea,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { Suspense, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterCardHeaderContent } from './CharacterCard'
import { CharStatsDisplay } from './CharStatsDisplay'
import { EquippedGrid } from './EquippedGrid'
import { isPortedCharacter } from './portedSheets'
import { talentSheetElementIcon } from './util'

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

function CharacterEditorContent({
  characterKey,
  onClose,
}: {
  characterKey: CharacterKey
  onClose?: () => void
}) {
  const character = useCharacter(characterKey)

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Suspense
          fallback={
            <Skeleton variant="rectangular" width="100%" height={1000} />
          }
        >
          {character ? (
            <CharacterContext.Provider value={{ character }}>
              <Content onClose={onClose} />
            </CharacterContext.Provider>
          ) : (
            <Skeleton variant="rectangular" width="100%" height={1000} />
          )}
        </Suspense>
      </CardContent>
    </CardThemed>
  )
}

function Content({ onClose }: { onClose?: () => void }) {
  const database = useDatabase()
  const { gender } = useDBMeta()
  const {
    character,
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const ported = isPortedCharacter(characterKey)

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" gap={1}>
        {!!onClose && (
          <IconButton onClick={onClose} sx={{ marginLeft: 'auto' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
        <Grid item xs={8} sm={5} md={4} lg={3}>
          <CardThemed
            bgt="light"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <CharacterCardHeader characterKey={characterKey}>
              <CharacterCardHeaderContent characterKey={characterKey} />
            </CharacterCardHeader>
            <Box sx={{ px: 1 }}>
              <CharacterLevelSelect
                level={character.level}
                ascension={character.ascension}
                setBoth={(data) => {
                  allTravelerKeys.includes(
                    characterKey as (typeof allTravelerKeys)[number]
                  )
                    ? allTravelerKeys.forEach((tkey) => {
                        database.chars.set(tkey, data)
                      })
                    : database.chars.set(characterKey, data)
                }}
              />
            </Box>
            <Typography sx={{ textAlign: 'center' }} variant="h6">
              <CharacterConstellationName
                characterKey={characterKey}
                gender={gender}
              />
            </Typography>
            <Box sx={{ px: 1 }}>
              <ConstSelector />
            </Box>
            {ported && <CharStatsDisplay characterKey={characterKey} />}
          </CardThemed>
        </Grid>
        <Grid
          item
          xs={12}
          sm={7}
          md={8}
          lg={9}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <Grid container columns={3} spacing={1}>
            {(['auto', 'skill', 'burst'] as const).map((talentKey) => (
              <Grid item xs={1} key={talentKey}>
                <TalentSelect talentKey={talentKey} />
              </Grid>
            ))}
          </Grid>
          <EquippedGrid />
        </Grid>
      </Grid>
    </Box>
  )
}

function ConstSelector() {
  const database = useDatabase()
  const { gender } = useDBMeta()
  const {
    character: { key: characterKey, constellation },
  } = useContext(CharacterContext)
  return (
    <Grid container spacing={1}>
      {range(1, 6).map((i) => (
        <Grid item xs={4} key={i}>
          <CardActionArea
            onClick={() =>
              database.chars.set(characterKey, {
                constellation: i === constellation ? i - 1 : i,
              })
            }
            style={{
              border: `1px solid ${grey[200]}`,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={characterAsset(
                characterKey,
                `constellation${i}` as
                  | 'constellation1'
                  | 'constellation2'
                  | 'constellation3'
                  | 'constellation4'
                  | 'constellation5'
                  | 'constellation6',
                gender
              )}
              sx={{
                ...(constellation >= i ? {} : { filter: 'brightness(50%)' }),
              }}
              width="100%"
              height="auto"
            />
          </CardActionArea>
        </Grid>
      ))}
    </Grid>
  )
}

function TalentSelect({
  talentKey,
}: {
  talentKey: keyof ICharacter['talent']
}) {
  const { t } = useTranslation('sheet_gen')
  const database = useDatabase()
  const {
    character: { key: characterKey, talent, ascension },
  } = useContext(CharacterContext)
  const level = talent[talentKey]
  const img = talentSheetElementIcon(characterKey, talentKey)

  return (
    <DropdownButton
      fullWidth
      title={t('talentLvl', { level })}
      color="primary"
      startIcon={img ? <ImgIcon src={img} size={1.75} sideMargin /> : undefined}
    >
      {range(1, talentLimits[ascension]).map((i) => (
        <MenuItem
          key={i}
          selected={level === i}
          disabled={level === i}
          onClick={() =>
            database.chars.set(characterKey, (char) => {
              char.talent[talentKey] = i
            })
          }
        >
          {t('talentLvl', { level: i })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
