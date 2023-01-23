import { BusinessCenter } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import { DatabaseContext } from "../../Database/Database";
import useDBMeta from "../../ReactHooks/useDBMeta";
import usePromise from "../../ReactHooks/usePromise";
import { LocationKey } from "../../Types/consts";
import LocationIcon from "./LocationIcon";

export default function LocationName({ location }: { location: LocationKey }) {
  const { t } = useTranslation("ui");
  const { database } = useContext(DatabaseContext)
  const { gender } = useDBMeta()
  const characterSheet = usePromise(() => CharacterSheet.get((location && database) ? database.chars.LocationToCharacterKey(location) : "", gender), [location, gender, database])
  return <Typography component="span">
    {(location && characterSheet?.name) ?
      <span><LocationIcon characterKey={database.chars.LocationToCharacterKey(location)} /> {characterSheet.name}</span> :
      <span><BusinessCenter sx={{ verticalAlign: "text-bottom" }} /> {t<string>("inventory")}</span>}
  </Typography>

}
