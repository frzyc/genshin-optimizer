import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { valueString } from '@genshin-optimizer/common/util'
import type { GeneratedBuild } from '@genshin-optimizer/sr/db'
import {
  OptConfigContext,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import { EquipRow } from '@genshin-optimizer/sr/ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import { Box, Button, CardContent, Stack, Typography } from '@mui/material'
import { memo, useCallback, useContext } from 'react'
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
    optConfig.generatedBuildListId ?? '',
  )
  return (
    <Stack spacing={1}>
      {generatedBuildList?.builds.map((build, i) => (
        <CardThemed
          key={`${i}-${build.lightConeId}-${Object.values(build.relicIds).join(
            '-',
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
            <EquipRow
              relicIds={build.relicIds}
              lightConeId={build.lightConeId}
            />
          </CardContent>
        </CardThemed>
      ))}
    </Stack>
  )
})
export default GeneratedBuildsDisplay

function EquipBtn({
  build: { relicIds, lightConeId },
}: {
  build: GeneratedBuild
}) {
  const { t } = useTranslation('build')

  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const onEquip = useCallback(() => {
    Object.entries(relicIds).forEach(([slotKey, relicId]) =>
      database.chars.setEquippedRelic(characterKey, slotKey, relicId),
    )
    database.chars.setEquippedLightCone(characterKey, lightConeId)
  }, [characterKey, database.chars, lightConeId, relicIds])
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
