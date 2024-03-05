import {
  CardThemed,
  InfoTooltipInline,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSetKeys } from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/ui'
import { Replay, Settings, StarRounded } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SetEffectDisplay from '../../../../../Components/Artifact/SetEffectDisplay'
import CardLight from '../../../../../Components/Card/CardLight'
import { DataContext, dataContextObj } from '../../../../../Context/DataContext'
import { TeamCharacterContext } from '../../../../../Context/TeamCharacterContext'
import { getArtSheet } from '../../../../../Data/Artifacts'
import {
  ArtifactSheet,
  artifactDefIcon,
} from '../../../../../Data/Artifacts/ArtifactSheet'
import { UIData } from '../../../../../Formula/uiData'
import { constant } from '../../../../../Formula/utils'
import { SetNum } from '../../../../../Types/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'

export default function ArtifactConditionalConfig({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation(['page_character_optimize', 'sheet'])
  const dataContext = useContext(DataContext)
  const database = useDatabase()
  const {
    teamChar: { conditional },
    teamCharId,
  } = useContext(TeamCharacterContext)
  const [show, onShow, onClose] = useBoolState(false)

  const artSheetsWithCond = allArtifactSetKeys
    .map((k) => getArtSheet(k))
    .filter((sheet) =>
      Object.values(sheet.setEffects).some((setEffect) =>
        setEffect.document.some((doc) => 'states' in doc)
      )
    )
  const artifactCondCount = useMemo(
    () =>
      Object.keys(conditional).filter(
        (k) =>
          allArtifactSetKeys.includes(k as ArtifactSetKey) &&
          !!Object.keys(conditional[k] ?? {}).length
      ).length,
    [conditional]
  )
  // Need to fake having 4 of every artifact set equipped to show the fields properly.
  const fakeDataContextObj = useMemo(
    () => ({
      ...dataContext,
      data: new UIData(
        {
          ...dataContext.data.data[0],
          artSet: objKeyMap(allArtifactSetKeys, (_) => constant(4)),
        },
        undefined
      ),
    }),
    [dataContext]
  )
  const resetArtConds = useCallback(() => {
    const tconditional = Object.fromEntries(
      Object.entries(conditional).filter(
        ([k]) => !allArtifactSetKeys.includes(k as any)
      )
    )
    database.teamChars.set(teamCharId, (teamChar) => {
      teamChar.conditional = tconditional
    })
  }, [conditional, database, teamCharId])

  return (
    <>
    {/* Button to open modal */}
    <CardThemed bgt="light" sx={{ display: 'flex', width: '100%' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography>
          <strong>{t`artSetConfig.modal.setCond.title`}</strong>
        </Typography>
        <Typography>
          {t`artSetConfig.setEffCond`}{' '}
          <SqBadge color={artifactCondCount ? 'success' : 'warning'}>
            {artifactCondCount} {t('artSetConfig.enabled')}
          </SqBadge>
        </Typography>
      <Button
        onClick={onShow}
        disabled={disabled}
        color="info"
        sx={{ borderRadius: 0, flexShrink: 1, minWidth: 40 }}
      >
        <Settings />
      </Button>
      </CardContent>
    </CardThemed>

      <ModalWrapper open={show} onClose={onClose}>
      <CardThemed bgt="dark">
      <CardContent
        sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}
      >
        <Typography variant="h6">{t`artSetConfig.title`}</Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <CardThemed bgt='light' sx={{ mb: 1 }}>
          <CardContent>
            <Box display="flex" gap={1}>
              <Typography>
                <strong>{t`artSetConfig.modal.setCond.title`}</strong>
              </Typography>
              <Typography sx={{ flexGrow: 1 }}>
                <SqBadge color={artifactCondCount ? 'success' : 'warning'}>
                  {artifactCondCount} {t('artSetConfig.selected')}
                </SqBadge>
              </Typography>
              <Button
                size="small"
                onClick={resetArtConds}
                color="error"
                startIcon={<Replay />}
              >{t`artSetConfig.modal.setCond.reset`}</Button>
            </Box>
            <Typography>{t`artSetConfig.modal.setCond.text`}</Typography>
          </CardContent>
        </CardThemed>
        <Grid container spacing={1} columns={{ xs: 3, lg: 4 }}>
          {artSheetsWithCond
            .sort((a, b) => {
              if (a.rarity[0] !== b.rarity[0]) {
                return b.rarity[0] - a.rarity[0]
              }
              if (a.key < b.key) {
                return -1
              }
              // Assume names aren't duplicated
              return 1
            })
            .map((sheet) => (
              <ArtifactSetCard
                artifactSheet={sheet}
                fakeDataContextObj={fakeDataContextObj}
                key={sheet.key}
              />
            ))}
        </Grid>
      </CardContent>
      <Divider />
    </CardThemed>
    </ModalWrapper>
    </>
  )
}

function ArtifactSetCard({
  artifactSheet,
  fakeDataContextObj,
}: {
  artifactSheet: ArtifactSheet
  fakeDataContextObj: dataContextObj
}) {
  const { t } = useTranslation('sheet')
  const setKey = artifactSheet.key
  const set4CondNums = Object.keys(artifactSheet.setEffects).filter(
    (setNumKey) =>
      artifactSheet.setEffects[setNumKey]?.document.some(
        (doc) => 'states' in doc
      )
  )
  return (
    <Grid item key={setKey} xs={1}>
      <CardThemed bgt="light" sx={{ height: '100%' }}>
        <Box
          className={`grad-${artifactSheet.rarity[1]}star`}
          width="100%"
          sx={{ display: 'flex' }}
        >
          <Box
            component="img"
            src={artifactDefIcon(setKey)}
            sx={{ height: 100, width: 'auto', mx: -1 }}
          />
          <Box
            sx={{
              flexGrow: 1,
              px: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6">{artifactSheet.name ?? ''}</Typography>
            <Box>
              {/* If there is ever a 2-Set conditional, we will need to change this */}
              <Typography variant="subtitle1">
                {artifactSheet.rarity.map((ns, i) => (
                  <Box
                    component="span"
                    sx={{ display: 'inline-flex', alignItems: 'center' }}
                    key={ns}
                  >
                    {ns} <StarRounded fontSize="inherit" />{' '}
                    {i < artifactSheet.rarity.length - 1 ? '/ ' : null}
                  </Box>
                ))}{' '}
                <InfoTooltipInline
                  title={
                    <Box>
                      <Typography>
                        <SqBadge color="success">{t`2set`}</SqBadge>
                      </Typography>
                      <Typography>
                        <Translate
                          ns={`artifact_${setKey}_gen`}
                          key18={'setEffects.2'}
                        />
                      </Typography>
                      <Box paddingTop={2}>
                        <Typography>
                          <SqBadge color="success">{t`4set`}</SqBadge>
                        </Typography>
                        <Typography>
                          <Translate
                            ns={`artifact_${setKey}_gen`}
                            key18={'setEffects.4'}
                          />
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </Typography>
            </Box>
          </Box>
        </Box>

        {!!set4CondNums.length && (
          <DataContext.Provider value={fakeDataContextObj}>
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              {set4CondNums.map((setNumKey) => (
                <SetEffectDisplay
                  key={setNumKey}
                  setKey={setKey}
                  setNumKey={parseInt(setNumKey) as SetNum}
                  hideHeader
                  conditionalsOnly
                />
              ))}
            </CardContent>
          </DataContext.Provider>
        )}
      </CardThemed>
    </Grid>
  )
}
