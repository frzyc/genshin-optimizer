import { useBoolState } from '@genshin-optimizer/common/react-util'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { Close, Flare, MonetizationOn, Redeem, Toll } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { Stack } from '@mui/material'
import { useCallback, useState } from 'react'
import { CardThemed } from './Card'
import { ModalWrapper } from './ModalWrapper'

export function SpeedUpGacha() {
  const [show, onShow, onClose] = useBoolState(false)

  return (
    <>
      <SpeedUpModal show={show} onClose={onClose} />
      <Button
        color="roll6"
        onClick={onShow}
        sx={{
          animation: 'blinking 2s infinite',
          '@keyframes blinking': {
            '0%': {
              color: '#000',
            },
            '49%': {
              color: '#000',
            },
            '60%': {
              color: 'transparent',
            },
            '99%': {
              color: 'transparent',
            },
            '100%': {
              color: '#000',
            },
          },
        }}
      >
        !NEW! Speed Gacha
      </Button>
    </>
  )
}

const prizes = [
  '-10% speed! Try again or purchase the Gacha Optimizer Monthly Pass!',
  '-10% speed! Try again or purchase the Gacha Optimizer Monthly Pass!',
  '-10% speed! Try again or purchase the Gacha Optimizer Monthly Pass!',
  '-10% speed! Try again or purchase the Gacha Optimizer Monthly Pass!',
  '-10% speed! Try again or purchase the Gacha Optimizer Monthly Pass!',
  '-10% speed! Try again or purchase the Gacha Optimizer Monthly Pass!',
  '+20% speed! Surely you can get something better though...',
  '+20% speed! Surely you can get something better though...',
  '+20% speed! Surely you can get something better though...',
  '+200% speed! Imagine stacking this with the Gacha Optimizer Monthly Pass!',
]

function SpeedUpModal({
  show,
  onClose,
}: { show: boolean; onClose: () => void }) {
  const { gachaCoins, gachaDollars, gachaWishes } = useDBMeta()
  const database = useDatabase()
  const [option, setOption] = useState(-1)
  const [rolling, setRolling] = useState(false)
  const convertDollars = useCallback(() => {
    if (gachaDollars >= 9) {
      database.dbMeta.set((meta) => ({
        gachaDollars: meta.gachaDollars - 9,
        gachaCoins: meta.gachaCoins + 4,
      }))
    }
  }, [database, gachaDollars])
  const convertWishes = useCallback(() => {
    if (gachaWishes >= 3) {
      database.dbMeta.set((meta) => ({
        gatchaWishes: meta.gachaWishes - 3,
        gachaDollars: meta.gachaDollars + 10,
      }))
    }
  }, [database, gachaWishes])
  const earnWishes = useCallback(
    () =>
      database.dbMeta.set((meta) => ({
        gachaWishes: meta.gachaWishes + 1,
      })),
    [database]
  )

  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardThemed>
        <CardHeader
          title="Optimization Speed Gacha"
          subheader="Boost your optimizer"
          avatar={<Redeem />}
          action={
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">
              Need some more <i>SPEED</i>?
            </Typography>
            <Typography variant="body1">
              Spend 6 <strong>GO Coins</strong>* to get a chance at winning a
              speed boost to your optimizer. This stacks with your daily login
              bonus!
            </Typography>
            <Typography variant="subtitle1" color="#999" fontSize="0.8em">
              * 4 GO Coins can be purchased using <u>9 Gacha Dollars</u>**
            </Typography>
            <Typography variant="subtitle1" color="#666" fontSize="0.6em">
              ** 10 Gacha Dollars can be purchased using <u>3 Wishes</u>
            </Typography>
            <CardThemed bgt="dark" sx={{ height: '500px' }}>
              <CardContent>
                <Grid container rowGap={2}>
                  <Grid xs={3}>
                    <Stack>
                      <Typography display="flex" alignItems="center">
                        <Toll />
                        Current GO Coins: {gachaCoins}
                      </Typography>
                      <Typography display="flex" alignItems="center">
                        <MonetizationOn />
                        Current Gacha Dollars: {gachaDollars}
                      </Typography>
                      <Typography display="flex" alignItems="center">
                        <Flare />
                        Current Wishes: {gachaWishes}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid xs={3}>
                    <Button sx={{ xs: 1 }} onClick={convertDollars}>
                      Convert Gacha Dollars to GO Coins
                    </Button>
                  </Grid>
                  <Grid xs={3}>
                    <Button sx={{ xs: 1 }} onClick={convertWishes}>
                      Convert Wishes to Gacha Dollars
                    </Button>
                  </Grid>
                  <Grid xs={3}>
                    <Button sx={{ size: 4 }} onClick={earnWishes}>
                      Earn 1 Wish
                    </Button>
                  </Grid>
                  <br />
                  <Button
                    disabled={rolling || gachaCoins < 6}
                    fullWidth
                    sx={{
                      background:
                        'linear-gradient(rgba(255,0,0,1) 0%, rgba(255,154,0,1) 10%, rgba(208,222,33,1) 20%, rgba(79,220,74,1) 30%, rgba(63,218,216,1) 40%, rgba(47,201,226,1) 50%, rgba(28,127,238,1) 60%, rgba(95,21,242,1) 70%, rgba(186,12,248,1) 80%, rgba(251,7,217,1) 90%, rgba(255,0,0,1) 100%) 0 0/100% 200%',
                      animation: 'a 2s linear infinite',
                      '@keyframes a': {
                        to: {
                          'background-position': '0 -200%',
                        },
                      },
                    }}
                    onClick={() => {
                      database.dbMeta.set((meta) => ({
                        gachaCoins: meta.gachaCoins - 6,
                      }))
                      setOption(-1)
                      setRolling(true)
                      setTimeout(() => setRolling(false), 5600)
                      setOption(Math.floor(Math.random() * MAXROLL))
                    }}
                  >
                    Gacha
                  </Button>
                  <br />
                  {rolling && (
                    <Box width="100%" justifyContent="center">
                      <img
                        src={
                          option === -1
                            ? undefined
                            : option < 6
                              ? 'assets/blueWish.gif'
                              : option < 9
                                ? 'assets/purpleWish.gif'
                                : 'assets/goldWish.gif'
                        }
                        alt="wish"
                      />
                    </Box>
                  )}
                  {!rolling && option !== -1 && (
                    <Alert
                      sx={{ width: '100%' }}
                      severity={
                        option < 6 ? 'warning' : option < 9 ? 'info' : 'success'
                      }
                    >
                      You earned {prizes[option]}
                    </Alert>
                  )}
                </Grid>
              </CardContent>
            </CardThemed>
          </Stack>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

const MAXROLL = 10
