import Alert from "@mui/material/Alert";

export default function WorkerErr() {
  return <Alert severity="error" variant="filled" onClick={() => window.location.reload()} sx={{
    "& .MuiAlert-message": {
      flexGrow: 1,
      cursor: "pointer"
    }
  }}>Worker failed to load. Click here to reload the page and try again</Alert>
}
