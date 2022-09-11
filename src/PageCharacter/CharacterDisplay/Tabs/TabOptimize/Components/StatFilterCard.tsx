import { Box, CardContent, Typography } from "@mui/material"
import { useCallback, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import CardLight from "../../../../../Components/Card/CardLight"
import InfoTooltip from "../../../../../Components/InfoTooltip"
import StatEditorList from "../../../../../Components/StatEditorList"
import { CharacterContext } from "../../../../../Context/CharacterContext"
import { DataContext } from "../../../../../Context/DataContext"
import { input } from "../../../../../Formula"
import { StatKey } from "../../../../../KeyMap"
import { ElementKey, WeaponTypeKey } from "../../../../../Types/consts"
import useBuildSetting from "../useBuildSetting"

export default function StatFilterCard({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation("page_character_optimize")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const { buildSetting: { statFilters }, buildSettingDispatch } = useBuildSetting(characterKey)
  const setStatFilters = useCallback((statFilters: Dict<StatKey, number>) => buildSettingDispatch({ statFilters }), [buildSettingDispatch],)

  const statKeys = useMemo(() => {
    const statKeys: StatKey[] = ["atk", "hp", "def", "eleMas", "critRate_", "critDMG_", "heal_", "enerRech_"]
    if (data.get(input.weaponType).value as WeaponTypeKey !== "catalyst") statKeys.push("physical_dmg_")
    const charEle = data.get(input.charEle).value as ElementKey
    statKeys.push(`${charEle}_dmg_`)
    return statKeys
  }, [data])


  return <Box>
    <CardLight>
      <CardContent sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
        <Typography>{t`constraintFilter.title`}</Typography>
        <InfoTooltip title={<Typography>{t`constraintFilter.tooltip`}</Typography>} />
      </CardContent>
    </CardLight>
    <Box display="flex" flexDirection="column" gap={0.5}>
      <StatEditorList statKeys={statKeys} statFilters={statFilters} setStatFilters={setStatFilters} disabled={disabled} />
    </Box>
  </Box>
}
