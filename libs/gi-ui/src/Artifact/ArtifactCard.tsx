import type { RarityKey, SubstatKey } from '@genshin-optimizer/consts'
import {
  allElementWithPhyKeys,
  allSubstatKeys,
} from '@genshin-optimizer/consts'
import { artifactAsset } from '@genshin-optimizer/gi-assets'
import type { IArtifact } from '@genshin-optimizer/gi-good'
import { SlotIcon, StatIcon } from '@genshin-optimizer/gi-svgicons'
import type { SubstatMeta } from '@genshin-optimizer/gi-util'
import {
  artDisplayValue,
  getArtifactEfficiency,
  getMainStatDisplayStr,
  getSubstatMetas,
  getSubstatValue,
  getSubstatValuesPercent,
} from '@genshin-optimizer/gi-util'
import { iconInlineProps } from '@genshin-optimizer/svgicons'
import {
  CardThemed,
  ColorText,
  InfoTooltip,
  StarsDisplay,
} from '@genshin-optimizer/ui-common'
import type { Unit } from '@genshin-optimizer/util'
import { clamp, clamp01 } from '@genshin-optimizer/util'
import { Lock, LockOpen } from '@mui/icons-material'
import {
  Box,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import PercentBadge from './PercentBadge'
import { artifactLevelVariant } from './util'

// TODO: translations
const sheet = {
  getSlotName: (s: string) => s,
  getSlotDesc: (s: string) => s,
}

type Data = {
  artifact: IArtifact
  mainStatAssumptionLevel?: number
  effFilter?: Set<SubstatKey>
  disabled?: boolean
  extraButtons?: JSX.Element
}
const allSubstatFilter = new Set(allSubstatKeys)

const MAX_ART_EFFICIENCY = 9

export function ArtifactCard({
  artifact,
  mainStatAssumptionLevel = 0,
  effFilter = allSubstatFilter,
  disabled = false,
  extraButtons,
}: Data): JSX.Element | null {
  const { t } = useTranslation(['artifact', 'ui'])
  const { t: tk } = useTranslation('statKey_gen')
  const {
    lock,
    slotKey,
    setKey,
    rarity,
    level,
    mainStatKey,
    substats,
    location = '',
  } = artifact
  // const setLocation = useCallback(
  //   (k: LocationKey) =>
  //     artifactId && database.arts.set(artifactId, { location: k }),
  //   [database, artifactId]
  // )

  const substatMetas = useMemo(() => getSubstatMetas(artifact), [artifact])

  const {
    currentEfficiency,
    maxEfficiency,
    currentEfficiency_,
    maxEfficiency_,
  } = useMemo(() => {
    if (!artifact)
      return {
        currentEfficiency: 0,
        maxEfficiency: 0,
        currentEfficiency_: 0,
        maxEfficiency_: 0,
      }
    const { currentEfficiency, maxEfficiency } = getArtifactEfficiency(
      artifact,
      substatMetas,
      effFilter
    )
    const {
      currentEfficiency: currentEfficiency_,
      maxEfficiency: maxEfficiency_,
    } = getArtifactEfficiency(artifact, substatMetas, new Set(allSubstatKeys))
    return {
      currentEfficiency,
      maxEfficiency,
      currentEfficiency_,
      maxEfficiency_,
    }
  }, [artifact, effFilter, substatMetas])

  const mainStatLevel = Math.max(
    Math.min(mainStatAssumptionLevel, rarity * 4),
    level
  )

  const artifactValid = maxEfficiency !== 0
  const slotName = sheet?.getSlotName(slotKey)
  const slotDesc = sheet?.getSlotDesc(slotKey)
  const slotDescTooltip = slotDesc && (
    <InfoTooltip
      title={
        <Box>
          <Suspense fallback={<Skeleton variant="text" width={100} />}>
            <Typography variant="h6">{slotName}</Typography>
          </Suspense>
          <Typography>{slotDesc}</Typography>
        </Box>
      }
    />
  )
  const ele = allElementWithPhyKeys.find((e) => mainStatKey.startsWith(e))
  const image = artifactAsset(setKey, slotKey)
  const src = typeof image === 'object' ? image.src : image
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', minHeight: 350 }}
        />
      }
    >
      {/* {editorProps && (
        <Suspense fallback={false}>
          <ArtifactEditor
            artifactIdToEdit={showEditor ? artifactId : ''}
            cancelEdit={onHideEditor}
            {...editorProps}
          />
        </Suspense>
      )} */}
      <CardThemed
        bgt="light"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          className={`grad-${rarity}star`}
          sx={{ position: 'relative', width: '100%' }}
        >
          <IconButton
            color="primary"
            disabled={disabled}
            onClick={() => {}} // TODO: lock onlick
            sx={{ position: 'absolute', right: 0, bottom: 0, zIndex: 2 }}
          >
            {lock ? <Lock /> : <LockOpen />}
          </IconButton>

          <Box sx={{ pt: 2, px: 2, position: 'relative', zIndex: 1 }}>
            {/* header */}
            <Box
              component="div"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 1 }}
            >
              <Chip
                size="small"
                label={<strong>{` +${level}`}</strong>}
                color={artifactLevelVariant(level)}
              />
              {!slotName && <Skeleton variant="text" width={100} />}
              {slotName && (
                <Typography
                  noWrap
                  sx={{
                    textAlign: 'center',
                    backgroundColor: 'rgba(100,100,100,0.35)',
                    borderRadius: '1em',
                    px: 1.5,
                  }}
                >
                  <strong>{slotName}</strong>
                </Typography>
              )}
              {!slotDescTooltip ? <Skeleton width={10} /> : slotDescTooltip}
            </Box>
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}
            >
              <SlotIcon iconProps={{ fontSize: 'inherit' }} slotKey={slotKey} />
              {t(`slotName.${slotKey}`)}
            </Typography>
            <Typography
              variant="h6"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <StatIcon
                statKey={mainStatKey}
                iconProps={{ sx: { color: `${ele}.main` } }}
              />
              <span>{tk(mainStatKey)}</span>
            </Typography>
            <Typography variant="h5">
              <strong>
                <ColorText
                  color={mainStatLevel !== level ? 'warning' : undefined}
                >
                  {getMainStatDisplayStr(mainStatKey, rarity, mainStatLevel)}
                </ColorText>
              </strong>
            </Typography>
            <StarsDisplay stars={rarity} colored />
            {/* {process.env.NODE_ENV === "development" && <Typography color="common.black">{id || `""`} </Typography>} */}
          </Box>
          <Box sx={{ height: '100%', position: 'absolute', right: 0, top: 0 }}>
            <Box
              component="img"
              src={src}
              width="auto"
              height="110%"
              sx={{
                float: 'right',
                marginBottom: '-5%',
                marginTop: '-5%',
                marginRight: '-5%',
              }}
            />
          </Box>
        </Box>
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            pt: 1,
            pb: '0!important',
            width: '100%',
          }}
        >
          {substatMetas.map(
            (stat) =>
              !!stat.value && (
                <SubstatDisplay
                  key={stat.key}
                  stat={stat}
                  effFilter={effFilter}
                  rarity={rarity}
                />
              )
          )}
          <Typography
            variant="caption"
            sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
          >
            <ColorText
              color="secondary"
              sx={{ flexGrow: 1 }}
            >{t`artifact:editor.curSubEff`}</ColorText>
            <PercentBadge
              value={currentEfficiency}
              max={MAX_ART_EFFICIENCY}
              valid={artifactValid}
            />
            {currentEfficiency !== currentEfficiency_ && <span>/</span>}
            {currentEfficiency !== currentEfficiency_ && (
              <PercentBadge
                value={currentEfficiency_}
                max={MAX_ART_EFFICIENCY}
                valid={artifactValid}
              />
            )}
          </Typography>
          {currentEfficiency !== maxEfficiency && (
            <Typography variant="caption" sx={{ display: 'flex', gap: 1 }}>
              <ColorText
                color="secondary"
                sx={{ flexGrow: 1 }}
              >{t`artifact:editor.maxSubEff`}</ColorText>
              <PercentBadge
                value={maxEfficiency}
                max={MAX_ART_EFFICIENCY}
                valid={artifactValid}
              />
              {maxEfficiency !== maxEfficiency_ && <span>/</span>}
              {maxEfficiency !== maxEfficiency_ && (
                <PercentBadge
                  value={maxEfficiency_}
                  max={MAX_ART_EFFICIENCY}
                  valid={artifactValid}
                />
              )}
            </Typography>
          )}
          <Box flexGrow={1} />
          {/* {art.probability !== undefined && art.probability >= 0 && (
            <strong>Probability: {(art.probability * 100).toFixed(2)}%</strong>
          )} */}
          <Typography color="success.main">
            {setKey}
            {/* {sheet?.name ?? 'Artifact Set'} */}{' '}
            {/* {sheet && (
                <InfoTooltipInline
                  title={<ArtifactSetTooltipContent artifactSheet={sheet} />}
                />
              )} */}
          </Typography>
        </CardContent>
        <Box
          sx={{
            p: 1,
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* <Box sx={{ flexGrow: 1 }}>
            {editable && canEquip ? (
              <LocationAutocomplete
                location={location}
                setLocation={setLocation}
              />
            ) : (
              <LocationName location={location} />
            )}
          </Box> */}
          <Box
            display="flex"
            gap={1}
            alignItems="stretch"
            height="100%"
            sx={{ '& .MuiButton-root': { minWidth: 0, height: '100%' } }}
          >
            {/* {editable && editorProps && (
              <BootstrapTooltip
                title={<Typography>{t`artifact:edit`}</Typography>}
                placement="top"
                arrow
              >
                <Button color="info" size="small" onClick={onShowEditor}>
                  <EditIcon />
                </Button>
              </BootstrapTooltip>
            )}
            {editable && !!onDelete && (
              <BootstrapTooltip
                title={lock ? t('artifact:cantDeleteLock') : ''}
                placement="top"
              >
                <span>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => onDelete(id)}
                    disabled={lock}
                  >
                    <DeleteForeverIcon />
                  </Button>
                </span>
              </BootstrapTooltip>
            )} */}
            {extraButtons}
          </Box>
        </Box>
      </CardThemed>
    </Suspense>
  )
}
function SubstatDisplay({
  stat,
  effFilter,
  rarity,
}: {
  stat: SubstatMeta
  effFilter: Set<SubstatKey>
  rarity: RarityKey
}) {
  const { t: tk } = useTranslation('statKey_gen')
  const numRolls = stat.rolls?.length ?? 0
  const maxRoll = stat.key ? getSubstatValue(stat.key) : 0
  const rollData = useMemo(
    () => (stat.key ? getSubstatValuesPercent(stat.key, rarity) : []),
    [stat.key, rarity]
  )
  const rollOffset = 7 - rollData.length
  const rollColor = `roll${clamp(numRolls, 1, 6)}`
  const efficiency = stat.efficiency ?? 0
  const inFilter = stat.key && effFilter.has(stat.key)
  const effOpacity = clamp01(0.5 + (efficiency / (100 * 5)) * 0.5) //divide by 6 because an substat can have max 6 rolls
  const unit = unitStr(stat.key)
  const progresses = useMemo(
    () => (
      <Box
        display="flex"
        gap={0.25}
        height="1.3em"
        sx={{ opacity: inFilter ? 1 : 0.3 }}
      >
        {[...stat.rolls].sort().map((v, i) => (
          <SmolProgress
            key={`${i}${v}`}
            value={(100 * v) / maxRoll}
            color={`roll${clamp(rollOffset + rollData.indexOf(v), 1, 6)}.main`}
          />
        ))}
      </Box>
    ),
    [inFilter, stat.rolls, maxRoll, rollData, rollOffset]
  )
  return (
    <Box display="flex" gap={1} alignContent="center">
      <Typography
        sx={{ flexGrow: 1 }}
        color={numRolls ? `${rollColor}.main` : 'error.main'}
        component="span"
      >
        <StatIcon statKey={stat.key} iconProps={iconInlineProps} />{' '}
        {tk(stat.key)}
        {`+${artDisplayValue(stat.value, unitStr(stat.key))}${unit}`}
      </Typography>
      {progresses}
      <Typography
        sx={{ opacity: effOpacity, minWidth: 40, textAlign: 'right' }}
      >
        {(efficiency * 100).toFixed()}%
      </Typography>
    </Box>
  )
}
export function SmolProgress({ color = 'red', value = 50 }) {
  return (
    <Box
      sx={{
        width: 7,
        height: '100%',
        bgcolor: color,
        overflow: 'hidden',
        borderRadius: 1,
        display: 'inline-block',
      }}
    >
      <Box
        sx={{
          width: 10,
          height: `${100 - clamp(value, 0, 100)}%`,
          bgcolor: 'gray',
        }}
      />
    </Box>
  )
}
function unitStr(key = ''): Unit {
  if (key.endsWith('_')) return '%'
  return ''
}
