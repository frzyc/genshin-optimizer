import { BusinessCenter } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getCharSheet } from "../../Data/Characters";
import { DatabaseContext } from "../../Database/Database";
import useDBMeta from "../../ReactHooks/useDBMeta";
import { LocationKey } from "../../Types/consts";
import LocationIcon from "./LocationIcon";

export default function LocationName({ location }: { location: LocationKey }) {
  const { t } = useTranslation("ui");
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const characterSheet = useMemo(() => location ? getCharSheet(database.chars.LocationToCharacterKey(location), gender) : undefined, [location, gender, database])
  return <Typography component="span">
    {(location && characterSheet?.name) ?
      <Box><LocationIcon characterKey={database.chars.LocationToCharacterKey(location)} />{characterSheet.name}</Box> :
      <span><BusinessCenter sx={{ verticalAlign: "text-bottom" }} /> {t("inventory")}</span>}
  </Typography>

}
