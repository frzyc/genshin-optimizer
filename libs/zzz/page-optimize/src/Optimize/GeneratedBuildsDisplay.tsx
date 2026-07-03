import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { valueString } from '@genshin-optimizer/common/util'
import type { GeneratedBuild } from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import {
  CharCalcProvider,
  CharStatsDisplay,
} from '@genshin-optimizer/zzz/formula-ui'
import { EquipGrid } from '@genshin-optimizer/zzz/ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Button,
  CardContent,
  Collapse,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { memo, useCallback, useContext, useState } from 'react'
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
        <GeneratedBuildDisplay
          key={`${i}-${build.wengineId}-${Object.values(build.discIds).join(
            '-'
          )}`}
          build={build}
          index={i}
        />
      ))}
    </Stack>
  )
})
export default GeneratedBuildsDisplay

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

function GeneratedBuildDisplay({
  build,
  index,
}: {
  build: GeneratedBuild
  index: number
}) {
  const character = useCharacterContext()!
  const team = useTeam(character.key)!
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), [])
  return (
    <CardThemed>
      <CardContent>
        <Stack spacing={1}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                aria-label={expanded ? 'Collapse build' : 'Expand build'}
                onClick={toggleExpanded}
              >
                {expanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>
              <Typography>
                Build {index + 1}: {valueString(build.value)}
              </Typography>
            </Box>
            <EquipBtn build={build} />
          </Box>
          <Collapse in={expanded} unmountOnExit>
            <CharCalcProvider
              character={character}
              team={team}
              discIds={build.discIds}
              wengineId={build.wengineId}
            >
              <Box>
                <Grid container spacing={1}>
                  <Grid item xs={6} md={4} lg={3} xl={3}>
                    <CharStatsDisplay />
                  </Grid>
                  <Grid item xs={6} md={8} lg={9} xl={9}>
                    <EquipGrid
                      discIds={build.discIds}
                      wengineId={build.wengineId}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CharCalcProvider>
          </Collapse>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
