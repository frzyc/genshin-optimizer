import { useDataManagerBaseDirty } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  objKeyMap,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import {
  allSpecialityKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
import {
  OptConfigContext,
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat, getWengineStats } from '@genshin-optimizer/zzz/stats'
import {
  StatDisplay,
  WengineName,
  WengineToggle,
  ZCard,
} from '@genshin-optimizer/zzz/ui'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { Suspense, useContext, useMemo } from 'react'
import { CharCalcMockCountProvider } from '../CharCalcProvider'
import { WengineLevelFilter } from './WengineLevelFilter'
export function WengineFilter({
  numWengine,
  disabled,
}: {
  numWengine: number
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const [show, onOpen, onClose] = useBoolState()
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Stack spacing={1}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}
            >
              Wengines:{' '}
              <SqBadge color={numWengine ? 'primary' : 'error'}>
                {numWengine}
              </SqBadge>
            </Box>
            <Button
              sx={{ flexGrow: 1 }}
              startIcon={
                optConfig.optWengine ? (
                  <CheckBoxIcon />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )
              }
              color={optConfig.optWengine ? 'success' : 'secondary'}
              onClick={() =>
                database.optConfigs.set(optConfigId, {
                  optWengine: !optConfig.optWengine,
                })
              }
            >
              Optimize Wengine
            </Button>
          </Box>
          <WengineFilterModal show={show} onClose={onClose} />
          {/* TODO: localization */}
          <Button
            color="info"
            fullWidth
            onClick={onOpen}
            disabled={disabled || !optConfig.optWengine}
          >
            Wengine Filter Config
          </Button>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function WengineFilterModal({
  show,
  onClose,
  disabled,
}: {
  show: boolean
  onClose: () => void
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardThemed>
        <CardHeader
          title="Wengine Filter"
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Suspense fallback={<Skeleton width="100%" height={'500px'} />}>
            <Stack spacing={1}>
              <WengineLevelFilter disabled={disabled} />
              <SpecialitySelector disabled={disabled} />
              <Button
                disabled={disabled}
                onClick={() =>
                  database.optConfigs.set(optConfigId, {
                    useEquippedWengine: !optConfig.useEquippedWengine,
                  })
                }
                color={optConfig.useEquippedWengine ? 'success' : 'secondary'}
              >
                Use equipped Wengine
              </Button>
              <WengineCondSelector />
            </Stack>
          </Suspense>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function SpecialitySelector({ disabled }: { disabled?: boolean }) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const { wEngineTypes } = optConfig
  const wengineDirty = useDataManagerBaseDirty(database.wengines)
  const { key: characterKey } = useCharacterContext()!
  const totals = useMemo(() => {
    return wengineDirty && optConfig.optWengine
      ? database.wengines.values.reduce(
          (totals, { key, level, location }) => {
            if (level < optConfig.wlevelLow || level > optConfig.wlevelHigh)
              return totals
            if (
              location &&
              !optConfig.useEquippedWengine &&
              location !== characterKey
            )
              return totals
            const type = getWengineStat(key).type
            if (!type) return totals
            totals[type]++
            return totals
          },
          objKeyMap(allSpecialityKeys, () => 0)
        )
      : objKeyMap(allSpecialityKeys, () => 0)
  }, [
    characterKey,
    wengineDirty,
    database.wengines,
    optConfig.wlevelLow,
    optConfig.wlevelHigh,
    optConfig.optWengine,
    optConfig.useEquippedWengine,
  ])
  return (
    <WengineToggle
      onChange={(wEngineTypes) =>
        database.optConfigs.set(optConfigId, { wEngineTypes })
      }
      value={wEngineTypes}
      disabled={disabled}
      totals={totals}
      fullWidth
    />
  )
}

function WengineCondSelector() {
  const character = useCharacterContext()
  const charOpt = useCharOpt(character?.key)
  const { optConfig } = useContext(OptConfigContext)
  const { wEngineTypes } = optConfig
  const wengineKeys = useMemo(
    () =>
      wEngineTypes.length
        ? allWengineKeys.filter((d) =>
            wEngineTypes.includes(getWengineStat(d).type)
          )
        : allWengineKeys,
    [wEngineTypes]
  )
  return (
    <Box>
      <Typography variant="h6">Wengine Condtional Configuration</Typography>
      <Typography>
        Wengine stats are displayed to be Lvl 60/60, P1, actual level/phase of
        wengine will be used in the solver.
      </Typography>
      {character && charOpt && (
        <CharCalcMockCountProvider
          character={character}
          conditionals={charOpt.conditionals}
        >
          <Grid container spacing={1}>
            {wengineKeys.map((d) => (
              <Grid item key={d} xs={1} md={2} lg={3}>
                <WengineCondCard wengineKey={d} />
              </Grid>
            ))}
          </Grid>
        </CharCalcMockCountProvider>
      )}
    </Box>
  )
}
function WengineCondCard({ wengineKey }: { wengineKey: WengineKey }) {
  // const wengineSheet = wengineSheets[wengineKey]
  const wengineStats = getWengineStats(wengineKey, 60, 5, 1)
  const mainStatKey = 'atk_base'
  const substatKey = getWengineStat(wengineKey)['second_statkey']
  return (
    <ZCard bgt="light" sx={{ height: '100%' }}>
      <CardHeader
        title={<WengineName wKey={wengineKey} />}
        avatar={<ImgIcon src={wengineAsset(wengineKey, 'icon')} size={2} />}
      />
      <CardContent>
        <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <StatDisplay statKey={'atk'} />
          <span>
            {toPercent(wengineStats[mainStatKey], mainStatKey).toFixed(
              statKeyToFixed(mainStatKey)
            )}
            {getUnitStr(mainStatKey)}
          </span>
        </Typography>
        <Typography sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <StatDisplay statKey={substatKey} />
          <span>
            {toPercent(wengineStats[substatKey], substatKey).toFixed(
              statKeyToFixed(substatKey)
            )}
            {getUnitStr(substatKey)}
          </span>
        </Typography>
      </CardContent>
      <Stack divider={<Divider />}>TODO: Wengine Sheet</Stack>
    </ZCard>
  )
}
