import { AppBar, Box, Skeleton, Tab, Tabs, Typography } from '@mui/material'
import { Suspense } from 'react'
import { Link as RouterLink, useMatch } from 'react-router-dom'

export default function Header({ anchor }: { anchor: string }) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
      <HeaderContent anchor={anchor} />
    </Suspense>
  )
}

function HeaderContent({ anchor }: { anchor: string }) {
  const {
    params: { currentTab },
  } = useMatch({ path: '/:currentTab', end: false }) ?? {
    params: { currentTab: '' },
  }
  return (
    <AppBar
      position="static"
      sx={{ bgcolor: '#343a40' }}
      elevation={0}
      id={anchor}
    >
      <Tabs
        value={currentTab}
        sx={{
          '& .MuiTab-root': {
            p: 1,
            minWidth: 'auto',
            minHeight: 'auto',
          },
          '& .MuiTab-root:hover': {
            transition: 'background-color 0.5s ease',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Tab
          value=""
          component={RouterLink}
          to="/"
          label={
            <Box display="flex" alignItems="center">
              <Typography variant="h6" sx={{ px: 1 }}>
                Star Rail Optimizer
              </Typography>
            </Box>
          }
        />
      </Tabs>
    </AppBar>
  )
}
