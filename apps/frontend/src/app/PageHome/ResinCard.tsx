import { AccessTimeFilled } from '@mui/icons-material'
import {
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Assets from '../Assets/Assets'
import CardDark from '../Components/Card/CardDark'
import CardLight from '../Components/Card/CardLight'
import ImgIcon from '../Components/Image/ImgIcon'
import { DatabaseContext } from '../Database/Database'
import { RESIN_MAX, RESIN_RECH_MS } from '../PageTools/ResinCounter'
import { timeZones } from '../PageTools/TeyvatTime'
import { SECOND_MS } from '../Util/TimeUtil'

export default function ResinCard() {
  const { database } = useContext(DatabaseContext)
  const [{ timeZoneKey, resin, resinDate }, setState] = useState(() =>
    database.displayTool.get()
  )
  useEffect(
    () => database.displayTool.follow((r, s) => setState(s)),
    [database]
  )
  const [time, setTime] = useState(
    new Date(Date.now() + timeZones[timeZoneKey])
  )

  useEffect(() => {
    const setSecondTimeout = () => {
      setTime(new Date(Date.now() + timeZones[timeZoneKey]))
      return setTimeout(() => {
        interval = setSecondTimeout()
      }, SECOND_MS - (Date.now() % SECOND_MS))
    }
    let interval = setSecondTimeout()
    return () => clearTimeout(interval)
  }, [timeZoneKey])

  const resinIncrement = useRef(undefined as undefined | NodeJS.Timeout)

  const setResin = (newResin: number) => {
    if (newResin >= RESIN_MAX) {
      resinIncrement.current && clearTimeout(resinIncrement.current)
      resinIncrement.current = undefined
    } else
      resinIncrement.current = setTimeout(
        () => console.log('set resin', newResin + 1),
        RESIN_RECH_MS
      )
    database.displayTool.set({
      resin: newResin,
      resinDate: new Date().getTime(),
    })
  }

  useEffect(() => {
    if (resin < RESIN_MAX) {
      const now = Date.now()
      const resinToMax = RESIN_MAX - resin
      const resinSinceLastDate = Math.min(
        Math.floor((now - resinDate) / RESIN_RECH_MS),
        resinToMax
      )
      const catchUpResin = resin + resinSinceLastDate
      const newDate = resinDate + resinSinceLastDate * RESIN_RECH_MS
      database.displayTool.set({ resin: catchUpResin, resinDate: newDate })
      if (catchUpResin < RESIN_MAX)
        resinIncrement.current = setTimeout(
          () => setResin(catchUpResin + 1),
          now - newDate
        )
    }
    return () => resinIncrement.current && clearTimeout(resinIncrement.current)
    // eslint-disable-next-line
  }, [database])

  return (
    <CardDark>
      <CardHeader
        title={
          <Typography variant="h5">
            {timeZoneKey} {time.toLocaleTimeString([], { timeZone: 'UTC' })}
          </Typography>
        }
        avatar={<AccessTimeFilled fontSize="large" />}
      />
      <Divider />
      <CardContent>
        <CardLight>
          <CardActionArea sx={{ p: 2 }} component={RouterLink} to="/tools">
            <Typography variant="h2" sx={{ textAlign: 'center' }}>
              <ImgIcon src={Assets.resin.fragile} />
              <span>
                {resin}/{RESIN_MAX}
              </span>
            </Typography>
          </CardActionArea>
        </CardLight>
      </CardContent>
    </CardDark>
  )
}
