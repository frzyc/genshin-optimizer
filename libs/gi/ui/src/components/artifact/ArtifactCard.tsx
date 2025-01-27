'use client'
// use client due to hydration difference between client rendering and server in translation
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
  ConditionalWrapper,
  InfoTooltip,
  InfoTooltipInline,
  ModalWrapper,
  NextImage,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { clamp, clamp01, getUnitStr } from '@genshin-optimizer/common/util'
import { artifactAsset } from '@genshin-optimizer/gi/assets'
import type {
  ArtifactRarity,
  CharacterKey,
  LocationKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allElementWithPhyKeys,
  allSubstatKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact, ICachedSubstat } from '@genshin-optimizer/gi/db'
import { useArtifact, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { SlotIcon, StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  artDisplayValue,
  getArtifactEfficiency,
  getMainStatDisplayStr,
  getSubstatValue,
  getSubstatValuesPercent,
} from '@genshin-optimizer/gi/util'
import { Lock, LockOpen } from '@mui/icons-material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  SvgIcon,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CloseIcon, ExcludeIcon, LoadoutIcon } from '../../consts'
import { PercentBadge } from '../PercentBadge'
import { CharIconSide, LocationAutocomplete, LocationName } from '../character'
import { ArtifactSetTooltipContent } from './ArtifactSetTooltip'
import {
  ArtifactSetName,
  ArtifactSetSlotDesc,
  ArtifactSetSlotName,
} from './ArtifactTrans'
import { SmolProgress } from './SmolProgress'
import { artifactLevelVariant } from './util'

type Data = {
  onClick?: () => void
  onDelete?: () => void
  onEdit?: () => void
  onLockToggle?: () => void
  setLocation?: (lk: LocationKey) => void
  mainStatAssumptionLevel?: number
  effFilter?: Set<SubstatKey>
  extraButtons?: JSX.Element
  excluded?: boolean
}
const allSubstatFilter = new Set(allSubstatKeys)

export function ArtifactCard(props: { artifactId: string } & Data) {
  const { artifactId, ...rest } = props
  const artifact = useArtifact(artifactId)
  if (!artifact) return null
  return <ArtifactCardObj artifact={artifact} {...rest} />
}
export function ArtifactCardObj({
  artifact,
  onClick,
  onDelete,
  onLockToggle,
  setLocation,
  onEdit,
  mainStatAssumptionLevel = 0,
  effFilter = allSubstatFilter,
  extraButtons,
  excluded = false,
}: {
  artifact: ICachedArtifact
} & Data) {
  const { t } = useTranslation(['artifact', 'ui'])
  const { t: tk } = useTranslation('statKey_gen')
  const [showUsage, onShowUsage, onHideUsage] = useBoolState(false)
  const wrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea
        onClick={onClick}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </CardActionArea>
    ),
    [onClick]
  )
  const falseWrapperFunc = useCallback(
    (children: ReactNode) => (
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    ),
    []
  )

  const {
    currentEfficiency,
    maxEfficiency,
    currentEfficiency_,
    maxEfficiency_,
  } = useMemo(() => {
    const { currentEfficiency, maxEfficiency } = getArtifactEfficiency(
      artifact,
      effFilter
    )
    const {
      currentEfficiency: currentEfficiency_,
      maxEfficiency: maxEfficiency_,
    } = getArtifactEfficiency(artifact, new Set(allSubstatKeys))
    return {
      currentEfficiency,
      maxEfficiency,
      currentEfficiency_,
      maxEfficiency_,
    }
  }, [artifact, effFilter])

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
  const mainStatLevel = Math.max(
    Math.min(mainStatAssumptionLevel, rarity * 4),
    level
  )
  const database = useDatabase()
  const builds: {
    loadoutName: string
    buildName: string
    charKey: CharacterKey
  }[] = useMemo(() => {
    return database.builds.values
      .filter(
        ({ artifactIds }) => artifactIds[artifact.slotKey] === artifact.id
      )
      .flatMap(({ id, name }) => {
        const buildName = name
        return database.teamChars.values
          .filter(({ buildIds }) => buildIds.includes(id))
          .map(({ key, name }) => {
            return {
              charKey: key,
              buildName,
              loadoutName: name,
            }
          })
      })
  }, [database.builds, database.teamChars, artifact.slotKey, artifact.id])
  const artifactValid = maxEfficiency !== 0
  const slotName = <ArtifactSetSlotName setKey={setKey} slotKey={slotKey} />
  const slotDesc = <ArtifactSetSlotDesc setKey={setKey} slotKey={slotKey} />
  const slotDescTooltip = slotDesc && (
    <InfoTooltip
      title={
        <Box>
          <Typography variant="h6">{slotName}</Typography>
          <Typography>{slotDesc}</Typography>
        </Box>
      }
    />
  )
  const ele = allElementWithPhyKeys.find((e) => mainStatKey.startsWith(e))

  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          sx={{ width: '100%', height: '100%', minHeight: 350 }}
        />
      }
    >
      <Suspense fallback={false}>
        <ArtifactBuildUsageModal
          show={showUsage}
          onHide={onHideUsage}
          usageText={t('artifact:artifactUsage')}
          builds={builds}
        />
      </Suspense>
      <CardThemed
        bgt="light"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <ConditionalWrapper
          condition={!!onClick}
          wrapper={wrapperFunc}
          falseWrapper={falseWrapperFunc}
        >
          <Box
            className={`grad-${rarity}star`}
            sx={{ position: 'relative', width: '100%' }}
          >
            {!onClick && !!onLockToggle && (
              <IconButton
                color="primary"
                onClick={onLockToggle}
                sx={{ position: 'absolute', right: 0, bottom: 0, zIndex: 2 }}
              >
                {lock ? <Lock /> : <LockOpen />}
              </IconButton>
            )}
            {excluded && (
              <SvgIcon
                color="primary"
                fontSize="large"
                sx={{ position: 'absolute', right: 3, bottom: 3, zIndex: 2 }}
              >
                <ExcludeIcon />
              </SvgIcon>
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
                <SlotIcon
                  iconProps={{ fontSize: 'inherit' }}
                  slotKey={slotKey}
                />
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
            <Box
              sx={{ height: '100%', position: 'absolute', right: 0, top: 0 }}
            >
              <Box
                component={NextImage ? NextImage : 'img'}
                alt="Artifact Piece Image"
                src={artifactAsset(setKey, slotKey)}
                sx={{
                  width: 'auto',
                  height: '110%',
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
            {substats.map(
              (stat: ICachedSubstat) =>
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
              <ColorText color="secondary" sx={{ flexGrow: 1 }}>
                {t('artifact:editor.curSubEff')}
              </ColorText>
              <PercentBadge
                value={currentEfficiency}
                max={9}
                valid={artifactValid}
              />
              {currentEfficiency !== currentEfficiency_ && <span>/</span>}
              {currentEfficiency !== currentEfficiency_ && (
                <PercentBadge
                  value={currentEfficiency_}
                  max={9}
                  valid={artifactValid}
                />
              )}
            </Typography>
            {currentEfficiency !== maxEfficiency && (
              <Typography variant="caption" sx={{ display: 'flex', gap: 1 }}>
                <ColorText color="secondary" sx={{ flexGrow: 1 }}>
                  {t('artifact:editor.maxSubEff')}
                </ColorText>
                <PercentBadge
                  value={maxEfficiency}
                  max={9}
                  valid={artifactValid}
                />
                {maxEfficiency !== maxEfficiency_ && <span>/</span>}
                {maxEfficiency !== maxEfficiency_ && (
                  <PercentBadge
                    value={maxEfficiency_}
                    max={9}
                    valid={artifactValid}
                  />
                )}
              </Typography>
            )}
            <Box flexGrow={1} />
            <Typography
              color="success.main"
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                mt: 1,
              }}
            >
              {(setKey && <ArtifactSetName setKey={setKey} />) ||
                'Artifact Set'}{' '}
              {setKey && (
                <InfoTooltipInline
                  title={<ArtifactSetTooltipContent setKey={setKey} />}
                />
              )}
              <SqBadge
                sx={{
                  ml: 'auto',
                  cursor: builds.length ? 'pointer' : 'default',
                }}
                color={builds.length ? 'success' : 'secondary'}
                onClick={builds.length ? onShowUsage : undefined}
              >
                {t('builds', { count: builds.length })}
              </SqBadge>
            </Typography>
          </CardContent>
        </ConditionalWrapper>
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
            {setLocation ? (
              <LocationAutocomplete
                location={location}
                setLocation={setLocation}
              />
            ) : (
              <LocationName location={location} />
            )}
          </Box>
          <Box
            display="flex"
            gap={1}
            alignItems="stretch"
            height="100%"
            sx={{ '& .MuiButton-root': { minWidth: 0, height: '100%' } }}
          >
            {!!onEdit && (
              <BootstrapTooltip
                title={<Typography>{t('artifact:edit')}</Typography>}
                placement="top"
                arrow
              >
                <Button color="info" size="small" onClick={onEdit}>
                  <EditIcon />
                </Button>
              </BootstrapTooltip>
            )}
            {!!onDelete && (
              <BootstrapTooltip
                title={lock ? t('artifact:cantDeleteLock') : ''}
                placement="top"
              >
                <span>
                  <Button
                    color="error"
                    size="small"
                    onClick={onDelete}
                    disabled={lock}
                  >
                    <DeleteForeverIcon />
                  </Button>
                </span>
              </BootstrapTooltip>
            )}
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
  stat: ICachedSubstat
  effFilter: Set<SubstatKey>
  rarity: ArtifactRarity
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
  const effOpacity = clamp01(0.5 + (efficiency / 5) * 0.5) //divide by 6 because an substat can have max 6 rolls
  const unit = getUnitStr(stat.key)
  const progresses = useMemo(
    () =>
      stat?.rolls && (
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
              color={`roll${clamp(
                rollOffset + rollData.indexOf(v),
                1,
                6
              )}.main`}
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
        {`+${artDisplayValue(stat.value, getUnitStr(stat.key))}${unit}`}
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

function ArtifactBuildUsageModal({
  show,
  onHide,
  usageText,
  builds,
}: {
  show: boolean
  onHide: () => void
  usageText: string
  builds: {
    loadoutName: string
    buildName: string
    charKey: CharacterKey
  }[]
}) {
  return (
    <ModalWrapper open={show} onClose={onHide}>
      <CardThemed>
        <CardHeader
          title={
            <Typography
              variant="h6"
              flexGrow={1}
              display="flex"
              alignItems="center"
            >
              {usageText}
            </Typography>
          }
          action={
            <IconButton onClick={onHide}>
              <CloseIcon />
            </IconButton>
          }
        />
        <List>
          {builds.map((build, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <CharIconSide characterKey={build.charKey} />
              </ListItemIcon>
              <LoadoutIcon titleAccess="Loadout" fontSize="small" />
              <ListItemText
                disableTypography={true}
                sx={{ display: 'flex', alignItems: 'center' }}
                primary={`${build.loadoutName}: ${build.buildName}`}
              />
            </ListItem>
          ))}
        </List>
      </CardThemed>
    </ModalWrapper>
  )
}
