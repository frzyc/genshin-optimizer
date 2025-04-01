import { useBoolState } from '@genshin-optimizer/common/react-util'
import { range } from '@genshin-optimizer/common/util'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import ChecklistIcon from '@mui/icons-material/Checklist'
import CloseIcon from '@mui/icons-material/Close'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import RedeemIcon from '@mui/icons-material/Redeem'
import {
  Alert,
  Badge,
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  Fab,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Zoom,
} from '@mui/material'
import { type ReactNode, useEffect } from 'react'
import { CardThemed } from './Card'
import { ModalWrapper } from './ModalWrapper'
export function DailyLogin() {
  const [show, onShow, onClose] = useBoolState(true)
  const { dailyArtCount, dailyOptCount, visitZO } = useDBMeta()
  const incomplete = dailyArtCount < 10 || dailyOptCount < 3 || !visitZO
  return (
    <>
      <DailyLoginModal show={show} onClose={onClose} />
      <Zoom in={true}>
        <Box
          onClick={onShow}
          role="presentation"
          sx={{ position: 'fixed', bottom: 30, right: 16 }}
        >
          <Fab color="secondary" size="small" aria-label="scroll back to top">
            {incomplete ? (
              <Badge badgeContent={`!`} color="error">
                <RedeemIcon />
              </Badge>
            ) : (
              <RedeemIcon />
            )}
          </Fab>
        </Box>
      </Zoom>
    </>
  )
}

function DailyLoginModal({
  show,
  onClose,
}: { show: boolean; onClose: () => void }) {
  const database = useDatabase()
  const { dailyArtCount, dailyOptCount, visitZO } = useDBMeta()
  useEffect(
    () =>
      database.arts.followAny(() =>
        database.dbMeta.set(({ dailyArtCount }) => ({
          dailyArtCount: dailyArtCount + 1,
        }))
      ),
    [database]
  )
  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardThemed>
        <CardHeader
          title="Daily Optimization Rewards"
          subheader="Claim your rewards"
          avatar={<RedeemIcon />}
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">
              You've Loggged in <strong>1</strong>/30 days.
            </Typography>
            <Stepper activeStep={0}>
              {range(1, 7).map((i) => (
                <Step key={i}>
                  <StepLabel>Day {i}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Typography variant="body1">
              You can claim <strong>5% optimizer speed</strong> as your rewards
              on the 7th day
            </Typography>

            <CardThemed bgt="dark">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h4">
                    <ChecklistIcon /> DAILY TASKS 0/3
                  </Typography>
                  <TaskCard complete={dailyOptCount >= 3}>
                    <Box>Optimize {dailyOptCount}/3 times.</Box>
                  </TaskCard>
                  <TaskCard complete={dailyArtCount >= 10}>
                    <Box>Update {dailyArtCount}/10 Artifacts.</Box>
                  </TaskCard>
                  <TaskCard
                    complete={visitZO}
                    onClick={() => {
                      window.open(
                        'https://frzyc.github.io/zenless-optimizer/',
                        '_blank'
                      )
                      database.dbMeta.set({ visitZO: true })
                    }}
                  >
                    <Box>Visit Zenless Optimizer</Box>
                  </TaskCard>
                </Stack>
              </CardContent>
            </CardThemed>

            <CardThemed bgt="dark">
              <CardContent>
                <Stack spacing={2}>
                  <Alert severity="warning">
                    🐌You are missing 20% Faster Optimization Speed with{' '}
                    <strong>Gacha Optimizer Monthly Pass</strong>!🐌
                  </Alert>
                  <Button
                    fullWidth
                    color="warning"
                    startIcon={<ElectricBoltIcon />}
                    endIcon={<ElectricBoltIcon />}
                    onClick={() =>
                      alert(
                        'ERR_42069_ETHICAL_OVERLOAD: Predatory Purchase failed.'
                      )
                    }
                  >
                    Unlock 2x Speed for $4.99/mo
                  </Button>
                </Stack>
              </CardContent>
            </CardThemed>
          </Stack>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function TaskCard({
  complete = false,
  children,
  onClick,
}: {
  complete?: boolean
  children?: ReactNode
  onClick?: () => void
}) {
  return (
    <CardThemed bgt={complete ? undefined : 'light'}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
          >
            {complete ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            {children}
          </Typography>
        </CardContent>
      </CardActionArea>
    </CardThemed>
  )
}
