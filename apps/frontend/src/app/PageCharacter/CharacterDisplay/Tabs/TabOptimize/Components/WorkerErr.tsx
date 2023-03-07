import Alert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";

export default function WorkerErr() {
  const { t } = useTranslation("page_character_optimize")
  return <Alert severity="error" variant="filled" onClick={() => window.location.reload()} sx={{
    "& .MuiAlert-message": {
      flexGrow: 1,
      cursor: "pointer"
    }
  }}>{t`workerLoadFailed`}</Alert>
}
