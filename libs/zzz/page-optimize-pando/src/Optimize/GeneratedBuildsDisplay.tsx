import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { valueString } from '@genshin-optimizer/common/util'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import type { DiscIds, GeneratedBuild } from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  useCharacterContext,
  useDatabaseContext,
  useDiscs,
  useWengine,
} from '@genshin-optimizer/zzz/db-ui'
import {
  CompactDiscCard,
  CompactWengineCard,
  DiscSetName,
  EmptyCompactCard,
  ZCard,
} from '@genshin-optimizer/zzz/ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { memo, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function useGeneratedBuildList(listId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.generatedBuildList, listId)
}
/**
 * A UI component that renders a list of generated builds
 */
const GeneratedBuildsDisplay = memo(function GeneratedBuildsDisplay() {
  const { optConfig } = useContext(OptConfigContext)
  const generatedBuildList = useGeneratedBuildList(
    optConfig.generatedBuildListId ?? ''
  )
  return (
    <Stack spacing={1}>
      {generatedBuildList?.builds.map((build, i) => (
        <CardThemed
          key={`${i}-${build.wengineId}-${Object.values(build.discIds).join(
            '-'
          )}`}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography>
                Build {i + 1}: {valueString(build.value)}
              </Typography>
              <EquipBtn build={build} />
            </Box>
            <EquipRow discIds={build.discIds} wengineId={build.wengineId} />
          </CardContent>
        </CardThemed>
      ))}
    </Stack>
  )
})
export default GeneratedBuildsDisplay

const columns = {
  xs: 2,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 4,
} as const

function EquipRow({
  discIds,
  wengineId,
}: {
  discIds: DiscIds
  wengineId?: string
}) {
  const { database } = useDatabaseContext()
  const sets = useMemo(() => {
    const sets: Partial<Record<DiscSetKey, number>> = {}
    Object.values(discIds).forEach((discId) => {
      const setKey = database.discs.get(discId)?.setKey
      if (!setKey) return
      sets[setKey] = (sets[setKey] || 0) + 1
    })
    return Object.fromEntries(
      Object.entries(sets)
        .map(([setKey, count]): [DiscSetKey, number] => {
          if (count >= 4) return [setKey as DiscSetKey, 4]
          if (count >= 2) return [setKey as DiscSetKey, 2]
          return [setKey as DiscSetKey, 0]
        })
        .filter(([, count]) => count > 0)
    ) as Partial<Record<DiscSetKey, 2 | 4>>
  }, [database.discs, discIds])

  const discs = useDiscs(discIds)
  const wengine = useWengine(wengineId)
  return (
    <Box>
      <Grid
        item
        columns={columns}
        container
        spacing={1}
        sx={{ flexDirection: 'row' }}
      >
        <Grid item xs={1} key={wengine?.id} sx={{ borderRadius: '20px' }}>
          {wengine &&
          wengine.id &&
          database.wengines.keys.includes(wengine.id) ? (
            <CompactWengineCard wengineId={wengine.id} />
          ) : (
            <EmptyCompactCard placeholder={'No Wengine Equipped'} />
          )}
        </Grid>
        <Grid item xs={1} sx={{ borderRadius: '20px' }}>
          <DiscSetCardCompact sets={sets} />
        </Grid>

        {!!discs &&
          Object.entries(discs).map(([slotKey, disc]) => (
            <Grid
              item
              xs={1}
              key={disc?.id || slotKey}
              sx={{ borderRadius: '20px' }}
            >
              {disc?.id && database.discs.keys.includes(disc.id) ? (
                <CompactDiscCard disc={disc} />
              ) : (
                <EmptyCompactCard placeholder={'Disc Slot'} slotKey={slotKey} />
              )}
            </Grid>
          ))}
      </Grid>
    </Box>
  )
}

export function DiscSetCardCompact({
  sets,
}: {
  sets: Partial<Record<DiscSetKey, 2 | 4>>
}) {
  return (
    <ZCard
      bgt="dark"
      sx={{
        height: '100%',
        width: '100%',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* TODO: translate */}
          {!Object.keys(sets).length && <Typography>No Disc sets</Typography>}
          {Object.entries(sets).map(([key, count]) => (
            <Typography key={key}>
              <SqBadge>{count}</SqBadge> <DiscSetName setKey={key} />
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </ZCard>
  )
}

function EquipBtn({
  build: { discIds, wengineId },
}: {
  build: GeneratedBuild
}) {
  const { t } = useTranslation('build')

  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext() ?? {}
  const onEquip = useCallback(() => {
    if (!characterKey) return
    Object.entries(discIds).forEach(
      ([_slotKey, discId]) =>
        discId && database.discs.set(discId, { location: characterKey })
    )
    wengineId && database.wengines.set(wengineId, { location: characterKey })
  }, [characterKey, discIds, wengineId, database.wengines, database.discs])
  return (
    <Button
      color="info"
      size="small"
      startIcon={<CheckroomIcon />}
      onClick={onEquip}
    >
      {t('buildDisplay.equipToCrr')}
    </Button>
  )
}
