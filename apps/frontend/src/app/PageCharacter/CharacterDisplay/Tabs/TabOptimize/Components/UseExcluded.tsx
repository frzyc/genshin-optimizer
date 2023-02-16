import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import SqBadge from "../../../../../Components/SqBadge";
import { CharacterContext } from "../../../../../Context/CharacterContext";
import useBuildSetting from "../useBuildSetting";

export default function UseExcluded({ disabled = false, usingExcludedTotal, numExcluded }: { disabled?: boolean, usingExcludedTotal: string, numExcluded: number }) {
  const { t } = useTranslation("page_character_optimize")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildSetting: { useExcludedArts }, buildSettingDispatch } = useBuildSetting(characterKey)

  return <Button fullWidth onClick={() => buildSettingDispatch({ useExcludedArts: !useExcludedArts })} disabled={disabled} startIcon={useExcludedArts ? <CheckBox /> : <CheckBoxOutlineBlank />} color={useExcludedArts ? "success" : "secondary"}>
    <Box sx={{ display: "flex", gap: 1 }}>
      <Box><Trans t={t} i18nKey="useExcluded.title">Use Excluded Artifacts</Trans></Box>
      {useExcludedArts ? <SqBadge><Trans t={t} i18nKey="useExcluded.usingNum">Using <strong>{{ totalStr: usingExcludedTotal} as TransObject}</strong> excluded artifact(s)</Trans></SqBadge> :
        <SqBadge color="error"><Trans t={t} i18nKey="useExcluded.excNum" count={numExcluded}>Excluding <strong>{{ count: numExcluded } as TransObject}</strong> artifact(s)</Trans></SqBadge>}
    </Box>
  </Button>
}
