import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Button, CardContent, Typography } from "@mui/material";
import { useContext } from "react";
import CardLight from "../../Components/Card/CardLight";
import { GlobalSettingsContext } from "../../GlobalSettings";

export default function TCToggleCard() {
  const { globalSettings: { tcMode }, globalSettingsDispatch } = useContext(GlobalSettingsContext)
  return <CardLight>
    <CardContent>
      <Typography gutterBottom color="warning.main">Enabling this toggle will show some features that might be too complex for the average user.</Typography>
      <Button fullWidth
        onClick={() => globalSettingsDispatch({ tcMode: !tcMode })}
        color={tcMode ? "success" : "primary"}
        startIcon={tcMode ? <CheckBox /> : <CheckBoxOutlineBlank />}>
        Theorycrafting Mode
      </Button>
    </CardContent>
  </CardLight>
}