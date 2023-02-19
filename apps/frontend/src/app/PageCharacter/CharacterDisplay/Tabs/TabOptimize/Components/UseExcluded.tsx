import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useContext, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import SqBadge from "../../../../../Components/SqBadge";
import { CharacterContext } from "../../../../../Context/CharacterContext";
import { DatabaseContext } from "../../../../../Database/Database";
import useBuildSetting from "../useBuildSetting";

export default function UseExcluded({ disabled = false, artsDirty }: { disabled?: boolean, artsDirty: object }) {
  const { t } = useTranslation("page_character_optimize")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildSetting: { useExcludedArts }, buildSettingDispatch } = useBuildSetting(characterKey)
  const { database } = useContext(DatabaseContext)
  const numExcludedArt = useMemo(() => artsDirty && database.arts.values.reduce((a, art) => a + (art.exclude ? 1 : 0), 0), [database, artsDirty])
  return <Button fullWidth onClick={() => buildSettingDispatch({ useExcludedArts: !useExcludedArts })} disabled={!numExcludedArt || disabled} startIcon={useExcludedArts ? <CheckBox /> : <CheckBoxOutlineBlank />} color={useExcludedArts ? "success" : "secondary"}>
    <Box sx={{ display: "flex", gap: 1 }}>
      <Box><Trans t={t} i18nKey="useExcluded.title" count={numExcludedArt}>Use Excluded Artifacts</Trans></Box>
      {useExcludedArts ? <SqBadge><Trans t={t} i18nKey="useExcluded.usingNum" count={numExcludedArt}>Using <strong>{{ count: numExcludedArt } as TransObject}</strong> excluded artifacts</Trans></SqBadge> :
        <SqBadge color="error"><Trans t={t} i18nKey="useExcluded.excNum" count={numExcludedArt}>Excluded <strong>{{ count: numExcludedArt } as TransObject}</strong> artifacts</Trans></SqBadge>}
    </Box>
  </Button>
}
