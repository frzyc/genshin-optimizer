import { Box, CardContent, Typography } from "@mui/material"
import { useCallback, useContext } from "react"
import { useTranslation } from "react-i18next"
import CardLight from "../../../../../Components/Card/CardLight"
import InfoTooltip from "../../../../../Components/InfoTooltip"
import { CharacterContext } from "../../../../../Context/CharacterContext"
import { StatFilters } from "../../../../../Database/DataManagers/BuildSettingData"
import useBuildSetting from "../useBuildSetting"
import OptimizationTargetEditorList from "./OptimizationTargetEditorList"

export default function StatFilterCard({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation("page_character_optimize")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildSetting: { statFilters }, buildSettingDispatch } = useBuildSetting(characterKey)
  const setStatFilters = useCallback((statFilters: StatFilters) => buildSettingDispatch({ statFilters }), [buildSettingDispatch])

  return <Box>
    <CardLight>
      <CardContent sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
        <Typography>{t`constraintFilter.title`}</Typography>
        <InfoTooltip title={<Typography>{t`constraintFilter.tooltip`}</Typography>} />
      </CardContent>
    </CardLight>
    <Box display="flex" flexDirection="column" gap={0.5}>
      <OptimizationTargetEditorList statFilters={statFilters} setStatFilters={setStatFilters} disabled={disabled} />
    </Box>
  </Box>
}
