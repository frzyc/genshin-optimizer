import {
  BootstrapTooltip,
  CardThemed,
  ImgIcon,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { allTravelerKeys } from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharSheet } from '@genshin-optimizer/gi/sheets'
import {
  CharacterCompactConstSelector,
  CharacterConstellationName,
  CharacterCoverArea,
  CheckIcon,
  CloseIcon,
  LevelSelect,
  TalentDropdown,
  UnCheckIcon,
} from '@genshin-optimizer/gi/ui'
import {
  Box,
  Button,
  CardContent,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BuildTcContext } from './BuildTcContext'

export function CharProfileCharEditor({
  show,
  onClose,
}: {
  show: boolean
  onClose: () => void
}) {
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'sm' }}
    >
      <CardThemed>
        <CardContent>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={1000} />
            }
          >
            <Content onClose={onClose} />
          </Suspense>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function Content({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation(['page_team'])
  const database = useDatabase()
  const {
    character: charContext,
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { buildTc, setBuildTc } = useContext(BuildTcContext)

  const character = buildTc?.character ?? charContext

  const { level, ascension } = character

  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" gap={1}>
        {!!buildTc && (
          <BootstrapTooltip
            title={
              <Typography>
                <Trans t={t} i18nKey={'buildTcCharOverride.tip'}>
                  Set a specific level, constellation, ascension, or talent
                  level for this TC build, that is different from the base
                  character
                </Trans>
              </Typography>
            }
          >
            <Button
              sx={{ flexGrow: 1 }}
              startIcon={buildTc?.character ? <CheckIcon /> : <UnCheckIcon />}
              color={buildTc?.character ? 'warning' : 'primary'}
              onClick={() => {
                setBuildTc((buildTc) => {
                  if (buildTc?.character) buildTc.character = undefined
                  else buildTc.character = { ...character }
                })
              }}
            >
              {t('buildTcCharOverride.btn')}
            </Button>
          </BootstrapTooltip>
        )}
        {!!onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Box>
        <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
          <Grid item xs={5}>
            <CardThemed
              bgt="light"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <CharacterCoverArea />
            </CardThemed>
          </Grid>
          <Grid
            item
            xs={7}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Box display={'flex'} flexDirection={'column'} gap={1}>
              <Grid container columns={1} spacing={1}>
                {(['auto', 'skill', 'burst'] as const).map((talentKey) => (
                  <Grid item xs={1} key={talentKey}>
                    <TalentDropdown
                      key={talentKey}
                      talentKey={talentKey}
                      dropDownButtonProps={{
                        startIcon: (
                          <ImgIcon
                            src={characterSheet.getTalentOfKey(talentKey)?.img}
                            size={1.75}
                            sideMargin
                          />
                        ),
                        sx: {
                          color: buildTc?.character ? 'yellow' : undefined,
                        },
                      }}
                      setTalent={(talent) =>
                        buildTc?.character
                          ? setBuildTc((buildTc) => {
                              if (buildTc.character)
                                buildTc.character.talent[talentKey] = talent
                            })
                          : database.chars.set(characterKey, (char) => {
                              char.talent[talentKey] = talent
                            })
                      }
                    />
                  </Grid>
                ))}
              </Grid>
              <CardThemed bgt="light" sx={{ p: 1 }}>
                <LevelSelect
                  warning={!!buildTc?.character}
                  level={level}
                  ascension={ascension}
                  setBoth={(data) => {
                    buildTc?.character
                      ? setBuildTc((buildTc) => {
                          if (buildTc.character)
                            buildTc.character = {
                              ...buildTc.character,
                              ...data,
                            }
                        })
                      : allTravelerKeys.includes(characterKey)
                      ? allTravelerKeys.forEach((tkey) => {
                          database.chars.set(tkey, data)
                        })
                      : database.chars.set(characterKey, data)
                  }}
                />
              </CardThemed>
              <CardThemed bgt="light" sx={{ p: 1 }}>
                <Typography sx={{ textAlign: 'center', pb: -1 }} variant="h6">
                  <CharacterConstellationName
                    characterKey={characterKey}
                    gender={gender}
                  />
                </Typography>
                <Box sx={{ px: 1 }}>
                  <CharacterCompactConstSelector
                    warning={!!buildTc?.character}
                    setConstellation={(constellation) =>
                      buildTc?.character
                        ? setBuildTc((buildTc) => {
                            if (buildTc.character)
                              buildTc.character.constellation = constellation
                          })
                        : database.chars.set(characterKey, {
                            constellation,
                          })
                    }
                  />
                </Box>
              </CardThemed>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
