import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Button, CardContent, Typography } from "@mui/material";
import CardLight from "../Components/Card/CardLight";
import { initGlobalSettings } from "../stateInit";
import useDBState from "../ReactHooks/useDBState";

export default function TCToggleCard() {
  const [{ tcMode }, setGlobalSettings] = useDBState("GlobalSettings", initGlobalSettings)

  return <CardLight>
    <CardContent>
      <Typography gutterBottom color="warning.main">Enabling this toggle will show some features that might be too complex for the average user.</Typography>
      <Button fullWidth
        onClick={() => setGlobalSettings({ tcMode: !tcMode })}
        color={tcMode ? "success" : "primary"}
        startIcon={tcMode ? <CheckBox /> : <CheckBoxOutlineBlank />}>
        Theorycrafting Mode
      </Button>
    </CardContent>
  </CardLight>
}
