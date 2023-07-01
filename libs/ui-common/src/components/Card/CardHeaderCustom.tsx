import { Typography, Box } from '@mui/material'

export default function CardHeaderCustom({
  avatar,
  title,
  action,
}: {
  avatar?: JSX.Element
  title: JSX.Element
  action?: JSX.Element
}) {
  return (
    <Box display="flex" gap={1} p={2} alignItems="center">
      {avatar}
      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
      {action && <Typography variant="caption">{action}</Typography>}
    </Box>
  )
}
