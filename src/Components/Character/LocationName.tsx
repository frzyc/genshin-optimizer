import { BusinessCenter } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import { DatabaseContext } from "../../Database/Database";
import useGender from "../../ReactHooks/useGender";
import usePromise from "../../ReactHooks/usePromise";
import { LocationKey } from "../../Types/consts";

export default function LocationName({ location }: { location: LocationKey }) {
  const { t } = useTranslation("ui");
  const { database } = useContext(DatabaseContext)
  const gender = useGender(database)
  const characterSheet = usePromise(() => CharacterSheet.get((location && database) ? database.chars.LocationToCharacterKey(location) : "", gender), [location, gender, database])
  return <Typography component="span">
    {characterSheet?.name ? characterSheet.nameWIthIcon : <span><BusinessCenter sx={{ verticalAlign: "text-bottom" }} /> {t<string>("inventory")}</span>}
  </Typography>

}
