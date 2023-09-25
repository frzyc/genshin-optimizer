import type { ArtifactSetKey, ArtifactSlotKey } from '@genshin-optimizer/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
} from '@genshin-optimizer/consts'
import { useForceUpdate } from '@genshin-optimizer/react-util'
import { iconInlineProps } from '@genshin-optimizer/svgicons'
import { deepClone, objKeyMap } from '@genshin-optimizer/util'
import { CheckBox, CheckBoxOutlineBlank, Replay } from '@mui/icons-material'
import BlockIcon from '@mui/icons-material/Block'
import SettingsIcon from '@mui/icons-material/Settings'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import SetEffectDisplay from '../../../../../Components/Artifact/SetEffectDisplay'
import SlotIcon from '../../../../../Components/Artifact/SlotIcon'
import CardDark from '../../../../../Components/Card/CardDark'
import CardLight from '../../../../../Components/Card/CardLight'
import CloseButton from '../../../../../Components/CloseButton'
import ColorText from '../../../../../Components/ColoredText'
import { InfoTooltipInline } from '../../../../../Components/InfoTooltip'
import ModalWrapper from '../../../../../Components/ModalWrapper'
import SqBadge from '../../../../../Components/SqBadge'
import { Translate } from '../../../../../Components/Translate'
import { CharacterContext } from '../../../../../Context/CharacterContext'
import type { dataContextObj } from '../../../../../Context/DataContext'
import { DataContext } from '../../../../../Context/DataContext'
import { getArtSheet, setKeysByRarities } from '../../../../../Data/Artifacts'
import { artifactDefIcon } from '../../../../../Data/Artifacts/ArtifactSheet'
import type { ArtSetExclusionKey } from '../../../../../Database/DataManagers/BuildSettingData'
import {
  allArtifactSetExclusionKeys,
  handleArtSetExclusion,
} from '../../../../../Database/DataManagers/BuildSettingData'
import { DatabaseContext } from '../../../../../Database/Database'
import { UIData } from '../../../../../Formula/uiData'
import { constant } from '../../../../../Formula/utils'
import type { SetNum } from '../../../../../Types/consts'
import { bulkCatTotal } from '../../../../../Util/totalUtils'
import useBuildSetting from '../useBuildSetting'
import SetInclusionButton from './SetInclusionButton'

export default function ArtifactSetConfig({
  disabled,
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation(['page_character_optimize', 'sheet'])
  const dataContext = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const {
    character: { key: characterKey, conditional },
    characterDispatch,
  } = useContext(CharacterContext)
  const {
    buildSetting: { artSetExclusion },
    buildSettingDispatch,
  } = useBuildSetting(characterKey)
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => setOpen(true), [setOpen])
  const onClose = useCallback(() => setOpen(false), [setOpen])

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => database.arts.followAny(forceUpdate), [database, forceUpdate])

  const artKeysByRarity = useMemo(
    () =>
      Object.entries(setKeysByRarities)
        .reverse()
        .flatMap(([, sets]) => sets)
        .filter((key) => !key.includes('Prayers')),
    []
  )
  const { artKeys, artSlotCount } = useMemo(() => {
    const artSlotCount = objKeyMap(artKeysByRarity, (_) =>
      objKeyMap(allArtifactSlotKeys, (_) => 0)
    )
    database.arts.values.forEach(
      (art) =>
        artSlotCount[art.setKey] && artSlotCount[art.setKey][art.slotKey]++
    )
    const artKeys = [...artKeysByRarity].sort(
      (a, b) =>
        +(getNumSlots(artSlotCount[a]) < 2) -
        +(getNumSlots(artSlotCount[b]) < 2)
    )
    return dbDirty && { artKeys, artSlotCount }
  }, [dbDirty, database, artKeysByRarity])

  const allowRainbow2 = !artSetExclusion.rainbow?.includes(2)
  const allowRainbow4 = !artSetExclusion.rainbow?.includes(4)

  const { allowTotals } = useMemo(() => {
    const catKeys = { allowTotals: ['2', '4'] }
    return bulkCatTotal(catKeys, (ctMap) =>
      artKeysByRarity.forEach((setKey) => {
        ctMap.allowTotals['2'].total++
        if (!artSetExclusion[setKey]?.includes(2)) {
          ctMap.allowTotals['2'].current++
        }
        ctMap.allowTotals['4'].total++
        if (!artSetExclusion[setKey]?.includes(4)) {
          ctMap.allowTotals['4'].current++
        }
      })
    )
  }, [artKeysByRarity, artSetExclusion])
  const artifactCondCount = useMemo(
    () =>
      Object.keys(conditional).filter(
        (k) =>
          allArtifactSetKeys.includes(k as ArtifactSetKey) &&
          !!Object.keys(conditional[k] ?? {}).length
      ).length,
    [conditional]
  )
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
    characterDispatch({ conditional: tconditional })
  }, [conditional, characterDispatch])
  const setAllExclusion = useCallback(
    (setnum: number, exclude = true) => {
      const artSetExclusion_ = deepClone(artSetExclusion)
      artKeysByRarity.forEach((k) => {
        if (exclude)
          artSetExclusion_[k] = [...(artSetExclusion_[k] ?? []), setnum]
        else if (artSetExclusion_[k])
          artSetExclusion_[k] = artSetExclusion_[k].filter((n) => n !== setnum)
      })
      buildSettingDispatch({ artSetExclusion: artSetExclusion_ })
    },
    [artKeysByRarity, artSetExclusion, buildSettingDispatch]
  )

  return (
    <>
      {/* Button to open modal */}
      <CardLight sx={{ display: 'flex', width: '100%' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography>
            <strong>{t`artSetConfig.title`}</strong>
          </Typography>
          <Stack spacing={1}>
            <Typography>
              {t`artSetConfig.setEffCond`}{' '}
              <SqBadge color={artifactCondCount ? 'success' : 'warning'}>
                {artifactCondCount} {t('artSetConfig.enabled')}
              </SqBadge>
            </Typography>
            <Typography>
              {t`sheet:2set`}{' '}
              <SqBadge color="success">
                {allowTotals['2']} <ShowChartIcon {...iconInlineProps} />{' '}
                {t('artSetConfig.allowed')}
              </SqBadge>
            </Typography>
            <Typography>
              {t`sheet:4set`}{' '}
              <SqBadge color="success">
                {allowTotals['4']} <ShowChartIcon {...iconInlineProps} />{' '}
                {t('artSetConfig.allowed')}
              </SqBadge>
            </Typography>
            <Typography>
              {t`artSetConfig.2rainbow`}{' '}
              <SqBadge color={allowRainbow2 ? 'success' : 'secondary'}>
                {allowRainbow2 ? (
                  <ShowChartIcon {...iconInlineProps} />
                ) : (
                  <BlockIcon {...iconInlineProps} />
                )}{' '}
                {allowRainbow2 ? t('artSetConfig.allowed') : 'Excluded'}
              </SqBadge>
            </Typography>
            <Typography>
              {t`artSetConfig.4rainbow`}{' '}
              <SqBadge color={allowRainbow4 ? 'success' : 'secondary'}>
                {allowRainbow4 ? (
                  <ShowChartIcon {...iconInlineProps} />
                ) : (
                  <BlockIcon {...iconInlineProps} />
                )}{' '}
                {allowRainbow4 ? t('artSetConfig.allowed') : 'Excluded'}
              </SqBadge>
            </Typography>
          </Stack>
        </CardContent>
        <Button
          onClick={onOpen}
          disabled={disabled}
          color="info"
          sx={{ borderRadius: 0, flexShrink: 1, minWidth: 40 }}
        >
          <SettingsIcon />
        </Button>
      </CardLight>

      {/* Begin modal */}
      <ModalWrapper open={open} onClose={onClose}>
        <CardDark>
          <CardContent
            sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}
          >
            <Typography variant="h6">{t`artSetConfig.title`}</Typography>
            <CloseButton onClick={onClose} />
          </CardContent>
          <Divider />
          <CardContent>
            <CardLight sx={{ mb: 1 }}>
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
            </CardLight>
            <CardLight sx={{ mb: 1 }}>
              <CardContent>
                <Typography sx={{ flexGrow: 1 }}>
                  <strong>
                    <Trans
                      t={t}
                      i18nKey="artSetConfig.modal.ArtSetFilter.title"
                    >
                      {'Artifact Sets '}
                      <ColorText color="success">
                        Allowed
                        <ShowChartIcon {...iconInlineProps} />
                      </ColorText>
                      {' / '}
                      <ColorText color="secondary" variant="light">
                        Excluded
                        <BlockIcon {...iconInlineProps} />
                      </ColorText>
                    </Trans>
                  </strong>
                </Typography>
                <Typography>
                  <Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.intro">
                    You can allow/exclude which sets you want the builder to
                    consider. In the following examples, <strong>A</strong> is
                    on-set, and <strong>R</strong> is rainbow(off-set)
                  </Trans>
                </Typography>
                <Typography>
                  <Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.2set">
                    <strong>
                      <ColorText color="secondary" variant="light">
                        Excluding
                        <BlockIcon {...iconInlineProps} /> 2-Set
                      </ColorText>
                    </strong>
                    would exclude 2-Set builds:
                    <strong>
                      <ColorText color="secondary" variant="light">
                        AA
                      </ColorText>
                      RRR
                    </strong>
                    and
                    <strong>
                      <ColorText color="secondary" variant="light">
                        AAA
                      </ColorText>
                      RR
                    </strong>
                    .
                  </Trans>
                </Typography>
                <Typography>
                  <Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.4set">
                    <strong>
                      <ColorText color="secondary" variant="light">
                        Excluding
                        <BlockIcon {...iconInlineProps} /> 4-Set
                      </ColorText>
                    </strong>
                    would exclude 4-Set builds:
                    <strong>
                      <ColorText color="secondary" variant="light">
                        AAAA
                      </ColorText>
                      R
                    </strong>
                    and
                    <strong>
                      <ColorText color="secondary" variant="light">
                        AAAAA
                      </ColorText>
                    </strong>
                    .
                  </Trans>
                </Typography>
                <Typography>
                  <Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.2rain">
                    <strong>
                      <ColorText color="secondary" variant="light">
                        Excluding
                        <BlockIcon {...iconInlineProps} /> 3-Rainbow
                      </ColorText>
                    </strong>
                    would exclude 2-Set + 3-Rainbow builds:
                    <strong>
                      AA
                      <ColorText color="secondary" variant="light">
                        RRR
                      </ColorText>
                    </strong>
                    and
                    <strong>
                      AAA
                      <ColorText color="secondary" variant="light">
                        RR
                      </ColorText>
                    </strong>
                    .
                  </Trans>
                </Typography>
                <Typography>
                  <Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.4rain">
                    <strong>
                      <ColorText color="secondary" variant="light">
                        Excluding
                        <BlockIcon {...iconInlineProps} /> 5-Rainbow
                      </ColorText>
                    </strong>
                    would exclude full 5-Rainbow builds:
                    <strong>
                      <ColorText color="secondary" variant="light">
                        RRRRR
                      </ColorText>
                    </strong>
                    .
                  </Trans>
                </Typography>
              </CardContent>
            </CardLight>
            <Grid
              container
              columns={{ xs: 2, lg: 3 }}
              sx={{ mb: 1 }}
              spacing={1}
            >
              <Grid item xs={1}>
                <AllSetAllowExcludeCard
                  allowTotal={allowTotals['2']}
                  setNum={2}
                  setAllExclusion={setAllExclusion}
                />
              </Grid>
              <Grid item xs={1}>
                <AllSetAllowExcludeCard
                  allowTotal={allowTotals['4']}
                  setNum={4}
                  setAllExclusion={setAllExclusion}
                />
              </Grid>
              <Grid item xs={1}>
                <CardLight>
                  <CardContent>
                    <Typography gutterBottom>
                      <strong>
                        <Trans t={t} i18nKey="artSetConfig.alExRainbow">
                          <ColorText color="success">
                            Allow <ShowChartIcon {...iconInlineProps} />
                          </ColorText>
                          {' / '}
                          <ColorText color="secondary" variant="light">
                            Exclude <BlockIcon {...iconInlineProps} />
                          </ColorText>
                          {' Rainbow Builds'}
                        </Trans>
                      </strong>
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      <Button
                        fullWidth
                        onClick={() =>
                          buildSettingDispatch({
                            artSetExclusion: handleArtSetExclusion(
                              artSetExclusion,
                              'rainbow',
                              2
                            ),
                          })
                        }
                        color={allowRainbow2 ? 'success' : 'secondary'}
                        startIcon={
                          !allowRainbow2 ? (
                            <CheckBoxOutlineBlank />
                          ) : (
                            <CheckBox />
                          )
                        }
                        endIcon={
                          allowRainbow2 ? <ShowChartIcon /> : <BlockIcon />
                        }
                      >{t`artSetConfig.2rainbow`}</Button>
                      <Button
                        fullWidth
                        onClick={() =>
                          buildSettingDispatch({
                            artSetExclusion: handleArtSetExclusion(
                              artSetExclusion,
                              'rainbow',
                              4
                            ),
                          })
                        }
                        color={allowRainbow4 ? 'success' : 'secondary'}
                        startIcon={
                          !allowRainbow4 ? (
                            <CheckBoxOutlineBlank />
                          ) : (
                            <CheckBox />
                          )
                        }
                        endIcon={
                          allowRainbow4 ? <ShowChartIcon /> : <BlockIcon />
                        }
                      >{t`artSetConfig.4rainbow`}</Button>
                    </Box>
                  </CardContent>
                </CardLight>
              </Grid>
            </Grid>
            <Grid container spacing={1} columns={{ xs: 2, lg: 3 }}>
              {artKeys.map((setKey) => (
                <ArtifactSetCard
                  key={setKey}
                  setKey={setKey}
                  fakeDataContextObj={fakeDataContextObj}
                  slotCount={artSlotCount[setKey]}
                />
              ))}
            </Grid>
          </CardContent>
          <Divider />
          <CardContent sx={{ py: 1 }}>
            <CloseButton large onClick={onClose} />
          </CardContent>
        </CardDark>
      </ModalWrapper>
    </>
  )
}
function AllSetAllowExcludeCard({
  allowTotal,
  setNum,
  setAllExclusion,
}: {
  allowTotal: string
  setNum: 2 | 4
  setAllExclusion: (setNum: 2 | 4, exclude?: boolean) => void
}) {
  const { t } = useTranslation(['page_character_optimize', 'sheet'])
  return (
    <CardLight>
      <CardContent>
        <Typography gutterBottom>
          <strong>{t(`sheet:${setNum}set`)}</strong>{' '}
          <SqBadge color="success">
            {allowTotal} <ShowChartIcon {...iconInlineProps} />{' '}
            {t('artSetConfig.allowed')}
          </SqBadge>
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            disabled={
              allowTotal.charAt(0) !== '0' && allowTotal.indexOf('/') === -1
            }
            onClick={() => setAllExclusion(setNum, false)}
            color="success"
            startIcon={<ShowChartIcon />}
          >
            {t(`artSetConfig.allowAll${setNum}set`)}
          </Button>
          <Button
            fullWidth
            disabled={allowTotal.charAt(0) === '0'}
            onClick={() => setAllExclusion(setNum, true)}
            color="secondary"
            startIcon={<BlockIcon />}
          >
            {t(`artSetConfig.excludeAll${setNum}set`)}
          </Button>
        </Box>
      </CardContent>
    </CardLight>
  )
}
function ArtifactSetCard({
  setKey,
  fakeDataContextObj,
  slotCount,
}: {
  setKey: ArtifactSetKey
  fakeDataContextObj: dataContextObj
  slotCount: Record<ArtifactSlotKey, number>
}) {
  const { t } = useTranslation('sheet')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { buildSetting } = useBuildSetting(characterKey)
  const { artSetExclusion } = buildSetting
  const setExclusionSet = artSetExclusion?.[setKey] ?? []
  const allow4 = !setExclusionSet.includes(4)
  const slots = getNumSlots(slotCount)
  const sheet = getArtSheet(setKey)
  /* Assumes that all conditionals are from 4-Set. needs to change if there are 2-Set conditionals */
  const set4CondNums = useMemo(() => {
    if (!allow4) return []
    return Object.keys(sheet.setEffects).filter((setNumKey) =>
      sheet.setEffects[setNumKey]?.document.some((doc) => 'states' in doc)
    )
  }, [sheet.setEffects, allow4])
  return (
    <Grid item key={setKey} xs={1}>
      <CardLight
        sx={{ height: '100%', opacity: slots < 2 ? '50%' : undefined }}
      >
        <Box
          className={`grad-${sheet.rarity[0]}star`}
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
            <Typography variant="h6">{sheet.name ?? ''}</Typography>
            <Box>
              {/* If there is ever a 2-Set conditional, we will need to change this */}
              <Typography variant="subtitle1">
                {sheet.rarity.map((ns, i) => (
                  <Box
                    component="span"
                    sx={{ display: 'inline-flex', alignItems: 'center' }}
                    key={ns}
                  >
                    {ns} <StarRoundedIcon fontSize="inherit" />{' '}
                    {i < sheet.rarity.length - 1 ? '/ ' : null}
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
                      <Box
                        paddingTop={2}
                        sx={{ opacity: setExclusionSet.includes(4) ? 0.6 : 1 }}
                      >
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              {Object.entries(slotCount).map(([slotKey, count]) => (
                <Typography
                  key={slotKey}
                  sx={{ flexGrow: 1 }}
                  variant="subtitle2"
                >
                  <SqBadge
                    sx={{ width: '100%' }}
                    color={count ? 'primary' : 'secondary'}
                  >
                    <SlotIcon slotKey={slotKey} iconProps={iconInlineProps} />{' '}
                    {count}
                  </SqBadge>
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
        {allArtifactSetExclusionKeys.includes(setKey as ArtSetExclusionKey) && (
          <SetInclusionButton
            setKey={setKey as ArtSetExclusionKey}
            buttonGroupSx={{ '.MuiButton-root': { borderRadius: 0 } }}
          />
        )}

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
      </CardLight>
    </Grid>
  )
}

function getNumSlots(slotCount: Record<string, number>): number {
  return Object.values(slotCount).reduce((tot, v) => tot + (v ? 1 : 0), 0)
}
