import { Box, CardContent, Divider, Typography } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import CardLight from '../../../../../Components/Card/CardLight'
import InfoTooltip from '../../../../../Components/InfoTooltip'
import { CharacterContext } from '../../../../../Context/CharacterContext'
import type { StatFilters } from '../../../../../Database/DataManagers/BuildSettingData'
import useBuildSetting from '../useBuildSetting'
import OptimizationTargetEditorList from './OptimizationTargetEditorList'

export default function StatFilterCard({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation('page_character_optimize')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const {
    buildSetting: { statFilters },
    buildSettingDispatch,
  } = useBuildSetting(characterKey)
  const setStatFilters = useCallback(
    (statFilters: StatFilters) => buildSettingDispatch({ statFilters }),
    [buildSettingDispatch]
  )

  return (
    <Box>
      <CardLight>
        <CardContent
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography
              sx={{ fontWeight: 'bold' }}
            >{t`constraintFilter.title`}</Typography>
            <InfoTooltip
              title={<Typography>{t`constraintFilter.tooltip`}</Typography>}
            />
          </Box>
        </CardContent>
        <Divider />
        <Box display="flex" flexDirection="column" gap={0.5}>
          <OptimizationTargetEditorList
            statFilters={statFilters}
            setStatFilters={setStatFilters}
            disabled={disabled}
          />
        </Box>
      </CardLight>
    </Box>
  )
}
