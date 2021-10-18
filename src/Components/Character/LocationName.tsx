import { BusinessCenter } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import CharacterSheet from "../../Character/CharacterSheet";
import usePromise from "../../ReactHooks/usePromise";

export default function LocationName({ location }) {
  const { t } = useTranslation("ui");
  const characterSheet = usePromise(CharacterSheet.get(location ?? ""), [location])
  return <Typography component="span">
    {characterSheet?.name ? characterSheet.nameWIthIcon : <span><BusinessCenter /> {t`inventory`}</span>}
  </Typography>

}