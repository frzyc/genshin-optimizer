'use client'
import type {
  LocationCharacterKey,
  RarityKey,
  SubstatKey,
} from '@genshin-optimizer/consts'
import {
  allElementWithPhyKeys,
  allSubstatKeys,
} from '@genshin-optimizer/consts'
import { artifactAsset } from '@genshin-optimizer/gi-assets'
import type { Artifact } from '@genshin-optimizer/gi-frontend-gql'
import {
  GetAllUserArtifactDocument,
  useRemoveArtifactMutation,
  useUpdateArtifactMutation,
} from '@genshin-optimizer/gi-frontend-gql'
import type { IArtifact } from '@genshin-optimizer/gi-good'
import { SlotIcon, StatIcon } from '@genshin-optimizer/gi-svgicons'
import {
  ArtifactSlotDesc,
  ArtifactSlotName,
  PercentBadge,
  artifactLevelVariant,
} from '@genshin-optimizer/gi-ui'
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
  BootstrapTooltip,
  CardThemed,
  ColorText,
  InfoTooltip,
  StarsDisplay,
} from '@genshin-optimizer/ui-common'
import type { Unit } from '@genshin-optimizer/util'
import { clamp, clamp01 } from '@genshin-optimizer/util'
import { Lock, LockOpen } from '@mui/icons-material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import {
  Box,
  Button,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationAutocomplete } from './LocationAutocomplete'
import LocationName from './LocationName'
import { UserContext } from './UserDataWrapper'
import { updateArtifactList } from './artifactUtil'
import { assetWrapper } from './util'
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
  const { setKey, rarity } = artifact

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

  const artifactValid = maxEfficiency !== 0
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', minHeight: 350 }}
        />
      }
    >
      <CardThemed
        bgt="light"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Header
          artifact={artifact}
          mainStatAssumptionLevel={mainStatAssumptionLevel}
          disabled={disabled}
        />
        {/* Substats & efficiency */}
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
          <Typography color="success.main">
            {setKey}
            {/* TODO: */}
            {/* {sheet?.name ?? 'Artifact Set'} */}{' '}
            {/* {sheet && (
                <InfoTooltipInline
                  title={<ArtifactSetTooltipContent artifactSheet={sheet} />}
                />
              )} */}
          </Typography>
        </CardContent>
        <Footer
          artifact={artifact as Artifact}
          disabled={disabled}
          extraButtons={extraButtons}
        />
      </CardThemed>
    </Suspense>
  )
}
function Header({
  artifact,
  mainStatAssumptionLevel = 0,
  disabled = false,
}: Data): JSX.Element | null {
  const { t } = useTranslation(['artifact', 'ui'])
  const { t: tk } = useTranslation('statKey_gen')
  const { lock, slotKey, setKey, rarity, level, mainStatKey } = artifact

  const mainStatLevel = Math.max(
    Math.min(mainStatAssumptionLevel, rarity * 4),
    level
  )

  const slotName = <ArtifactSlotName setKey={setKey} slotKey={slotKey} />
  const slotDesc = <ArtifactSlotDesc setKey={setKey} slotKey={slotKey} />

  const ele = allElementWithPhyKeys.find((e) => mainStatKey.startsWith(e))
  return (
    <Box
      className={`grad-${rarity}star`}
      sx={{ position: 'relative', width: '100%' }}
    >
      {!disabled && (
        <IconButton
          color="primary"
          disabled={disabled}
          onClick={() => {}} // TODO: lock onclick
          sx={{ position: 'absolute', right: 0, bottom: 0, zIndex: 2 }}
        >
          {lock ? <Lock /> : <LockOpen />}
        </IconButton>
      )}
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
            <ColorText color={mainStatLevel !== level ? 'warning' : undefined}>
              {getMainStatDisplayStr(mainStatKey, rarity, mainStatLevel)}
            </ColorText>
          </strong>
        </Typography>
        <StarsDisplay stars={rarity} colored />
      </Box>
      <Box
        sx={{
          height: '125%',
          width: '125%',
          position: 'absolute',
          top: 0,
          right: 0,
          m: '-5%',
        }}
      >
        <Image
          src={assetWrapper(artifactAsset(setKey, slotKey))}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt=""
          style={{
            objectFit: 'contain',
            objectPosition: 'right',
          }}
        />
      </Box>
    </Box>
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
function SmolProgress({ color = 'red', value = 50 }) {
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
function Footer({
  artifact,
  disabled,
  extraButtons,
}: {
  artifact: Artifact
  disabled: boolean
  extraButtons: ReactNode
}) {
  const { t } = useTranslation('artifact')
  const { id, location: baseLocation, lock } = artifact
  const [location, setLocation] = useState(
    baseLocation as LocationCharacterKey | null
  )

  const { genshinUserId } = useContext(UserContext)
  const [updateArtifactMutation, { data, loading, error }] =
    useUpdateArtifactMutation({
      variables: {
        genshinUserId,
        artifact: { id, location },
      },
      update(cache, { data }) {
        const art = data?.updateArtifact
        if (!art) return
        cache.updateQuery(
          {
            query: GetAllUserArtifactDocument,
            variables: {
              genshinUserId,
            },
          },
          ({ getAllUserArtifact }) => {
            return {
              getAllUserArtifact: updateArtifactList(getAllUserArtifact, art),
            }
          }
        )
      },
    })
  useEffect(() => {
    if (baseLocation === location) return
    updateArtifactMutation()
  }, [baseLocation, location, updateArtifactMutation])
  return (
    <Box
      sx={{
        p: 1,
        display: 'flex',
        gap: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        {disabled ? (
          <LocationName location={location} />
        ) : (
          <LocationAutocomplete location={location} setLocation={setLocation} />
        )}
      </Box>
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
     */}
        {!disabled && (
          <BootstrapTooltip
            title={lock ? t('cantDeleteLock') : ''}
            placement="top"
          >
            <DeleteButton artifact={artifact} />
          </BootstrapTooltip>
        )}
        {extraButtons}
      </Box>
    </Box>
  )
}
function DeleteButton({ artifact }: { artifact: Artifact }) {
  const { lock, id } = artifact
  const { genshinUserId } = useContext(UserContext)
  const [removeArtifactMutation, { data, loading, error }] =
    useRemoveArtifactMutation({
      variables: {
        genshinUserId,
        artifactId: id,
      },
    })

  return (
    <span>
      <Button
        color="error"
        size="small"
        onClick={() => removeArtifactMutation()}
        disabled={lock || loading}
      >
        <DeleteForeverIcon />
      </Button>
    </span>
  )
}
