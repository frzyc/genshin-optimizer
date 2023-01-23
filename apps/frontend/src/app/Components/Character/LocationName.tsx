import { BusinessCenter } from "@mui/icons-material";
import { Typography } from "@mui/material";
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
      <span><LocationIcon characterKey={database.chars.LocationToCharacterKey(location)} /> {characterSheet.name}</span> :
      <span><BusinessCenter sx={{ verticalAlign: "text-bottom" }} /> {t<string>("inventory")}</span>}
  </Typography>

}
