import { Typography } from "@mui/material";
import { Box } from "@mui/system";

export default function CardHeaderCustom({ avatar, title, action }: { avatar?: Displayable, title: Displayable, action?: Displayable }) {
  return <Box display="flex" gap={1} p={2} alignItems="center" >
    {avatar}
    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>{title}</Typography>
    {action && <Typography variant="caption">{action}</Typography>}
  </Box>
}
