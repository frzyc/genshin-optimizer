import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  CardThemed,
  ColorText,
  InfoTooltipInline,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import {
  bulkCatTotal,
  deepClone,
  isIn,
  objKeyMap,
} from '@genshin-optimizer/common/util'
import { artifactDefIcon } from '@genshin-optimizer/gi/assets'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
  SetNum,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
} from '@genshin-optimizer/gi/consts'
import type { ArtSetExclusionKey } from '@genshin-optimizer/gi/db'
import {
  allArtifactSetExclusionKeys,
  handleArtSetExclusion,
} from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import { Translate } from '@genshin-optimizer/gi/i18n'
import { getArtSheet } from '@genshin-optimizer/gi/sheets'
import { getArtSetStat } from '@genshin-optimizer/gi/stats'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  ArtifactSetName,
  DataContext,
  SetEffectDisplay,
  SetInclusionButton,
} from '@genshin-optimizer/gi/ui'
import { UIData } from '@genshin-optimizer/gi/uidata'
import { setKeysByRarities } from '@genshin-optimizer/gi/util'
import { constant } from '@genshin-optimizer/gi/wr'
import { allNonstackBuffs } from '@genshin-optimizer/gi/wr-types'
import { CheckBox, CheckBoxOutlineBlank, Replay } from '@mui/icons-material'
import BlockIcon from '@mui/icons-material/Block'
import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useContext, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export default function ArtifactSetConfig({
  disabled,
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation(['page_character_optimize', 'sheet'])
  const dataContext = useContext(DataContext)
  const database = useDatabase()
  const {
    teamChar: { key: charKey, conditional, optConfigId },
    teamCharId,
  } = useContext(TeamCharacterContext)
  const { artSetExclusion } = useOptConfig(optConfigId)!
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => setOpen(true), [setOpen])
  const onClose = useCallback(() => setOpen(false), [setOpen])
  const artKeysByRarity = useMemo(
    () =>
      Object.entries(setKeysByRarities)
        .reverse()
        .flatMap(([, sets]) => sets)
        .filter((key) => !key.includes('Prayers')),
    []
  )
  const allArts = useDataManagerValues(database.arts)
  const { artKeys, artSlotCount } = useMemo(() => {
    const artSlotCount = objKeyMap(artKeysByRarity, (_) =>
      objKeyMap(allArtifactSlotKeys, (_) => 0)
    )
    allArts.forEach(
      (art) =>
        artSlotCount[art.setKey] && artSlotCount[art.setKey][art.slotKey]++
    )
    const artKeys = [...artKeysByRarity].sort(
      (a, b) =>
        +(getNumSlots(artSlotCount[a]) < 2) -
        +(getNumSlots(artSlotCount[b]) < 2)
    )
    return { artKeys, artSlotCount }
  }, [artKeysByRarity, allArts])

  const allowRainbow2 = !artSetExclusion.rainbow?.includes(2)
  const allowRainbow4 = !artSetExclusion.rainbow?.includes(4)

  const { allowTotals } = useMemo(() => {
    const catKeys = { allowTotals: ['2', '4'] }
    return bulkCatTotal(catKeys, (ctMap) =>
      artKeysByRarity.forEach((setKey) => {
        if (!isIn(allArtifactSetExclusionKeys, setKey)) return
        ctMap['allowTotals']['2'].total++
        if (!artSetExclusion[setKey]?.includes(2)) {
          ctMap['allowTotals']['2'].current++
        }
        ctMap['allowTotals']['4'].total++
        if (!artSetExclusion[setKey]?.includes(4)) {
          ctMap['allowTotals']['4'].current++
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
          nonStacking: objKeyMap(allNonstackBuffs, () => constant(charKey)),
        },
        undefined
      ),
    }),
    [charKey, dataContext]
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
  }, [database, teamCharId, conditional])
  const setAllExclusion = useCallback(
    (setnum: 2 | 4, exclude = true) => {
      const artSetExclusion_ = deepClone(artSetExclusion)
      artKeysByRarity.forEach((k) => {
        if (!isIn(allArtifactSetExclusionKeys, k)) return
        if (exclude)
          artSetExclusion_[k] = [...(artSetExclusion_[k] ?? []), setnum]
        else if (artSetExclusion_[k])
          artSetExclusion_[k] = artSetExclusion_[k].filter((n) => n !== setnum)
      })
      database.optConfigs.set(optConfigId, {
        artSetExclusion: artSetExclusion_,
      })
    },
    [artKeysByRarity, artSetExclusion, database, optConfigId]
  )

  return (
    <>
      {/* Button to open modal */}
      <CardThemed bgt="light" sx={{ display: 'flex', width: '100%' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography>
            <strong>{t('artSetConfig.title')}</strong>
          </Typography>
          <Stack spacing={1}>
            <Typography>
              {t('artSetConfig.setEffCond')}{' '}
              <SqBadge color={artifactCondCount ? 'success' : 'warning'}>
                {artifactCondCount} {t('artSetConfig.enabled')}
              </SqBadge>
            </Typography>
            <Typography>
              {t('sheet:2set')}{' '}
              <SqBadge color="success">
                {allowTotals['2']} <ShowChartIcon {...iconInlineProps} />{' '}
                {t('artSetConfig.allowed')}
              </SqBadge>
            </Typography>
            <Typography>
              {t('sheet:4set')}{' '}
              <SqBadge color="success">
                {allowTotals['4']} <ShowChartIcon {...iconInlineProps} />{' '}
                {t('artSetConfig.allowed')}
              </SqBadge>
            </Typography>
            <Typography>
              {t('artSetConfig.2rainbow')}{' '}
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
              {t('artSetConfig.4rainbow')}{' '}
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
      </CardThemed>

      {/* Begin modal */}
      <ModalWrapper open={open} onClose={onClose}>
        <CardThemed>
          <CardContent sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="h6">{t('artSetConfig.title')}</Typography>
            <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
              <CloseIcon />
            </IconButton>
          </CardContent>
          <Divider />
          <CardContent>
            <CardThemed bgt="light" sx={{ mb: 1 }}>
              <CardContent>
                <Box display="flex" gap={1}>
                  <Typography>
                    <strong>{t('artSetConfig.modal.setCond.title')}</strong>
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
                  >
                    {t('artSetConfig.modal.setCond.reset')}
                  </Button>
                </Box>
                <Typography>{t('artSetConfig.modal.setCond.text')}</Typography>
              </CardContent>
            </CardThemed>
            <CardThemed bgt="light" sx={{ mb: 1 }}>
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
            </CardThemed>
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
                <CardThemed bgt="light">
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
                          database.optConfigs.set(optConfigId, {
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
                      >
                        {t('artSetConfig.2rainbow')}
                      </Button>
                      <Button
                        fullWidth
                        onClick={() =>
                          database.optConfigs.set(optConfigId, {
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
                      >
                        {t('artSetConfig.4rainbow')}
                      </Button>
                    </Box>
                  </CardContent>
                </CardThemed>
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
        </CardThemed>
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
    <CardThemed bgt="light">
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
    </CardThemed>
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
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const { artSetExclusion } = useOptConfig(optConfigId)!
  const setExclusionSet = useMemo(
    // We have nullish fallback so this should be fine
    () => artSetExclusion?.[setKey as ArtSetExclusionKey] ?? [],
    [artSetExclusion, setKey]
  )
  const slots = getNumSlots(slotCount)
  const sheet = getArtSheet(setKey)
  const artStat = getArtSetStat(setKey)
  // Get all conditionals that are not excluded
  // Assumes conditionals are 2 and 4p
  const condNums = useMemo(() => {
    return Object.keys(sheet.setEffects).filter((setNumKey) => {
      if (setNumKey !== '2' && setNumKey !== '4') {
        return false
      } else {
        const sheetHasConditionals = sheet.setEffects[setNumKey]?.document.some(
          (doc) => 'states' in doc
        )
        if (setNumKey === '2') {
          const cond2CanShow = !(
            setExclusionSet.includes(2) && setExclusionSet.includes(4)
          )
          return cond2CanShow && sheetHasConditionals
        } /* if (setNumKey === '4') */ else {
          const cond4CanShow = !setExclusionSet.includes(4)
          return cond4CanShow && sheetHasConditionals
        }
      }
    })
  }, [sheet.setEffects, setExclusionSet])
  return (
    <Grid item key={setKey} xs={1}>
      <CardThemed
        bgt="light"
        sx={{ height: '100%', opacity: slots < 2 ? '50%' : undefined }}
      >
        <Box
          className={`grad-${Math.max(...artStat.rarities)}star`}
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
            <Typography variant="h6">
              <ArtifactSetName setKey={setKey} />
            </Typography>
            <Box>
              {/* If there is ever a 2-Set conditional, we will need to change this */}
              <Typography
                variant="subtitle1"
                display="flex"
                gap={1}
                alignItems="center"
              >
                {artStat.rarities
                  .filter((r) => r >= 3)
                  .map((ns) => (
                    <Box
                      component="span"
                      sx={{ display: 'inline-flex', alignItems: 'center' }}
                      key={ns}
                    >
                      {ns} <StarRoundedIcon fontSize="inherit" />
                    </Box>
                  ))}
                <InfoTooltipInline
                  title={
                    <Suspense
                      fallback={
                        <Skeleton
                          variant="rectangular"
                          width={300}
                          height={200}
                        />
                      }
                    >
                      <Box>
                        <Typography>
                          <SqBadge color="success">{t('2set')}</SqBadge>
                        </Typography>
                        <Typography>
                          <Translate
                            ns={`artifact_${setKey}_gen`}
                            key18={'setEffects.2'}
                          />
                        </Typography>
                        <Box
                          paddingTop={2}
                          sx={{
                            opacity: setExclusionSet.includes(4) ? 0.6 : 1,
                          }}
                        >
                          <Typography>
                            <SqBadge color="success">{t('4set')}</SqBadge>
                          </Typography>
                          <Typography>
                            <Translate
                              ns={`artifact_${setKey}_gen`}
                              key18={'setEffects.4'}
                            />
                          </Typography>
                        </Box>
                      </Box>
                    </Suspense>
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

        {!!condNums.length && (
          <DataContext.Provider value={fakeDataContextObj}>
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              {condNums.map((setNumKey) => (
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

function getNumSlots(slotCount: Record<string, number>): number {
  return Object.values(slotCount).reduce((tot, v) => tot + (v ? 1 : 0), 0)
}
