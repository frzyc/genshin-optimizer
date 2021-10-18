import { Box, Button, ButtonGroup, CardContent, Divider, Grid, InputBase, Typography } from '@mui/material';
import React from 'react';
import ReactGA from 'react-ga';
import Assets from '../Assets/Assets';
import CardDark from '../Components/Card/CardDark';
import ImgIcon from '../Components/Image/ImgIcon';
import { dbStorage } from '../Database/DBStorage';
import { MINUTE_MS, SECOND_MS, timeString } from '../Util/TimeUtil';
import { deepClone } from "../Util/Util";
import EXPCalc from './EXPCalc';
import TeyvatTime from './TeyvatTime';

export default function ToolsDisplay(props) {
  return <Box sx={{
    mt: 1,
    "> div": { mb: 1 },
  }}>
    <TeyvatTime />
    <ResinCounter />
    <EXPCalc />
  </Box>
}

const RESIN_MAX = 160
const RESIN_RECH_MS = 8 * MINUTE_MS
class ResinCounter extends React.Component {
  resinIncrement: any
  updateTimer: any

  constructor(props) {
    super(props)
    let savedState = dbStorage.get("resinInfo")
    if (savedState) this.state = savedState
    else {
      this.state = {
        resin: 100,
        date: new Date().getTime(),
      }
    }
    let { resin, date } = this.state as any
    //catch up date.
    if (resin < RESIN_MAX && (Date.now() - date) > RESIN_RECH_MS) {
      let resinToMax = RESIN_MAX - resin
      let resinSinceLastDate = Math.min(Math.floor((Date.now() - date) / (RESIN_RECH_MS)), resinToMax)
      resin += resinSinceLastDate
      date += resinSinceLastDate * RESIN_RECH_MS;
      (this.state as any).resin = resin;
      (this.state as any).date = date;
    }
    ReactGA.pageview('/tools')
  }
  setResin = (resin) => this.setState((state: any) => {
    resin = parseInt(resin) || 0
    // resin = clamp(resin, 0, RESIN_MAX)//allow for resin over the cap,
    let newState: { resin: number, date?: number } = { resin }
    if (resin >= RESIN_MAX) {
      this.resinIncrement && clearTimeout(this.resinIncrement)
      this.resinIncrement = 0
      if (state.resin < RESIN_MAX) newState.date = new Date().getTime()//store the date as the full resin time
    } else {
      this.resinIncrement && clearTimeout(this.resinIncrement)
      this.resinIncrement = setInterval(() => this.setResin((this.state as any).resin + 1), RESIN_RECH_MS);
      newState.date = new Date().getTime()
    }
    return newState
  });
  componentDidMount() {
    let { resin, date } = this.state as any
    if (resin < RESIN_MAX) {
      let nextResinDateNum = date + RESIN_RECH_MS;
      let nextDelta = nextResinDateNum - (new Date() as any);
      this.resinIncrement = setTimeout(() => {
        this.setResin((this.state as any).resin + 1)
      }, nextDelta);
    }
    this.updateTimer = setInterval(() => this.forceUpdate(), SECOND_MS)
  }
  componentWillUnmount() {
    this.updateTimer && clearInterval(this.updateTimer)
    this.resinIncrement && clearTimeout(this.resinIncrement)
  }
  componentDidUpdate() {
    let state = deepClone(this.state)
    dbStorage.set("resinInfo", state)
  }
  render() {
    let { resin, date } = this.state as any
    let nextResinDateNum = resin >= RESIN_MAX ? date : date + RESIN_RECH_MS;

    let resinFullDateNum = resin >= RESIN_MAX ? date : (date + (RESIN_MAX - resin) * RESIN_RECH_MS)
    let resinFullDate = new Date(resinFullDateNum)

    let nextDeltaString = timeString(Math.abs(nextResinDateNum - Date.now()))

    return <CardDark>
      <Grid container sx={{ px: 2, py: 1 }} spacing={2} >
        <Grid item>
          <ImgIcon src={Assets.resin.fragile} sx={{ fontSize: "2em" }} />
        </Grid>
        <Grid item >
          <Typography variant="h6">Resin Counter</Typography>
        </Grid>
      </Grid>
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <Typography variant="h2">
              <ImgIcon src={Assets.resin.fragile} />
              <InputBase type="number" sx={{ width: "2em", fontSize: "4rem" }} value={resin} inputProps={{ min: 0, max: 999 }} onChange={(e => this.setResin(e.target.value))} />
              <span>/{RESIN_MAX}</span>
            </Typography>
          </Grid>
          <Grid item flexGrow={1}>
            <ButtonGroup fullWidth >
              <Button onClick={() => this.setResin(0)} disabled={resin === 0}>0</Button>
              <Button onClick={() => this.setResin(resin - 1)} disabled={resin === 0}>-1</Button>
              <Button onClick={() => this.setResin(resin - 20)} disabled={resin < 20}>-20</Button>
              <Button onClick={() => this.setResin(resin - 40)} disabled={resin < 40}>-40</Button>
              <Button onClick={() => this.setResin(resin - 60)} disabled={resin < 60}>-60</Button>
              <Button onClick={() => this.setResin(resin + 1)}>+1</Button>
              <Button onClick={() => this.setResin(resin + 60)}>+60</Button>
              <Button onClick={() => this.setResin(RESIN_MAX)} disabled={resin === RESIN_MAX}>MAX {RESIN_MAX}</Button>
            </ButtonGroup>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              {resin < RESIN_MAX ? <span>Next resin in {nextDeltaString}, full Resin at {resinFullDate.toLocaleTimeString()} {resinFullDate.toLocaleDateString()}</span> :
                <span>Resin has been full for at least {nextDeltaString}, since {resinFullDate.toLocaleTimeString()} {resinFullDate.toLocaleDateString()}</span>}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">Because we do not provide a mechanism to synchronize resin time, actual resin recharge time might be as much as 8 minutes earlier than predicted.</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </CardDark>
  }
}

