import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, Image, InputGroup, Row } from "react-bootstrap";
import ReactGA from 'react-ga';
import Assets from '../Assets/Assets';
import CustomFormControl from '../Components/CustomFormControl';
import { timeString } from '../Util/TimeUtil';
import { clamp, deepClone, loadFromLocalStorage, saveToLocalStorage } from "../Util/Util";

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

export default function PlannerDisplay(props) {
  return <Container className="mb-2">
    <TeyvatTime />
    <ResinCounter />
    <EXPCalc />
  </Container>
}

const RESIN_MAX = 160
const RESIN_RECH_MS = 8 * MINUTE_MS
class ResinCounter extends React.Component {
  constructor(props) {
    super(props)
    let savedState = loadFromLocalStorage("resinInfo")
    if (savedState) this.state = savedState
    else {
      this.state = {
        resin: 100,
        date: new Date().getTime(),
      }
    }
    let { resin, date } = this.state
    //catch up date.
    if (resin < RESIN_MAX && (Date.now() - date) > RESIN_RECH_MS) {
      let resinToMax = RESIN_MAX - resin
      let resinSinceLastDate = Math.min(Math.floor((Date.now() - date) / (RESIN_RECH_MS)), resinToMax)
      resin += resinSinceLastDate
      date += resinSinceLastDate * RESIN_RECH_MS
      this.state.resin = resin
      this.state.date = date
    }
    ReactGA.pageview('/tools')
  }
  setResin = (resin) => this.setState(state => {
    resin = parseInt(resin) || 0
    // resin = clamp(resin, 0, RESIN_MAX)//allow for resin over the cap, 
    let newState = { resin }
    if (resin >= RESIN_MAX) {
      this.resinIncrement && clearTimeout(this.resinIncrement)
      this.resinIncrement = 0
      if (state.resin < RESIN_MAX) newState.date = new Date().getTime()//store the date as the full resin time
    } else {
      this.resinIncrement && clearTimeout(this.resinIncrement)
      this.resinIncrement = setInterval(() => this.setResin(this.state.resin + 1), RESIN_RECH_MS);
      newState.date = new Date().getTime()
    }
    return newState
  });
  componentDidMount() {
    let { resin, date } = this.state
    if (resin < RESIN_MAX) {
      let nextResinDateNum = date + RESIN_RECH_MS;
      let nextDelta = nextResinDateNum - new Date();
      this.resinIncrement = setTimeout(() => {
        this.setResin(this.state.resin + 1)
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
    saveToLocalStorage("resinInfo", state)
  }
  render() {
    let { resin, date } = this.state
    let nextResinDateNum = resin >= RESIN_MAX ? date : date + RESIN_RECH_MS;

    let resinFullDateNum = resin >= RESIN_MAX ? date : (date + (RESIN_MAX - resin) * RESIN_RECH_MS)
    let resinFullDate = new Date(resinFullDateNum)

    let nextDeltaString = timeString(Math.abs(nextResinDateNum - Date.now()))

    return <Card bg="darkcontent" text="lightfont" className="mt-2">
      <Card.Header>
        <Image src={Assets.resin.fragile} className="thumb-small d-inline my-n1 ml-n2" /><span>Resin Counter</span>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col xs="auto" className="px-3">
            <span style={{ fontSize: "4em" }}>
              <Image src={Assets.resin.fragile} className="d-inline w-auto mt-n3 ml-n3 mr-n4" style={{ height: "1.5em" }} />
              <input type="number" className="invisible-input hide-appearance text-white mb-0 text-right" size="4" value={resin} min={0} max={999} style={{ width: "2.1em" }} onChange={(e => this.setResin(e.target.value))} />/{RESIN_MAX}
            </span>
          </Col>
          <Col>
            <ButtonGroup className="w-100 d-flex mb-2">
              <Button onClick={() => this.setResin(0)} disabled={resin === 0}>0</Button>
              <Button onClick={() => this.setResin(resin - 1)} disabled={resin === 0}>-1</Button>
              <Button onClick={() => this.setResin(resin - 20)} disabled={resin < 20}>-20</Button>
              <Button onClick={() => this.setResin(resin - 40)} disabled={resin < 40}>-40</Button>
              <Button onClick={() => this.setResin(resin - 60)} disabled={resin < 60}>-60</Button>
              <Button onClick={() => this.setResin(resin + 1)}>+1</Button>
              <Button onClick={() => this.setResin(resin + 60)}>+60</Button>
              <Button onClick={() => this.setResin(RESIN_MAX)} disabled={resin === RESIN_MAX}>MAX {RESIN_MAX}</Button>
            </ButtonGroup>
            <h5>{resin < RESIN_MAX ? <span>Next resin in {nextDeltaString}, full Resin at {resinFullDate.toLocaleTimeString()} {resinFullDate.toLocaleDateString()}</span> :
              <span>Resin has been full for at least {nextDeltaString}, since {resinFullDate.toLocaleTimeString()} {resinFullDate.toLocaleDateString()}</span>}</h5>
          </Col>
          <small>Because we do not provide a mechanism to synchronize resin time, actual resin recharge time might be as much as 8 minutes earlier than predicted.</small>
        </Row>
      </Card.Body>
    </Card>
  }
}

const timeZones = {
  "America": - 5 * HOUR_MS,
  "Europe": HOUR_MS,
  "Asia": 8 * HOUR_MS,
  "TW, HK, MO": 8 * HOUR_MS,
}
function TeyvatTime(props) {
  let [timeZoneKey, setTimeZoneKey] = useState(Object.keys(timeZones)[0])
  let [time, setTime] = useState(new Date(Date.now() + timeZones[timeZoneKey]))
  //load from localstorage
  useEffect(() => setTimeZoneKey(loadFromLocalStorage("server_timezone") || Object.keys(timeZones)[0]), [])
  //set a timer. timer resets when timezone is changed.
  useEffect(() => {
    let setSecondTimeout = () => {
      setTime(new Date(Date.now() + timeZones[timeZoneKey]))
      return setTimeout(() => {
        interval = setSecondTimeout()
      }, SECOND_MS - (Date.now() % SECOND_MS));
    }
    let interval = setSecondTimeout()
    saveToLocalStorage("server_timezone", timeZoneKey)
    return () => clearTimeout(interval)
  }, [timeZoneKey])

  let resetTime = new Date(time)
  if (resetTime.getUTCHours() < 4) {
    resetTime.setUTCHours(4, 0, 0, 0)
  } else {
    resetTime = new Date(resetTime.getTime() + DAY_MS)
    resetTime.setUTCHours(4, 0, 0, 0)
  }
  let remaningTimeMs = resetTime.getTime() - time.getTime()
  let remainingResetString = timeString(remaningTimeMs)

  return <Card bg="darkcontent" text="lightfont" className="mt-2">
    <Card.Header>
      <Row>
        <Col xs="auto">
          <h5 className="d-inline"><FontAwesomeIcon icon={faClock} className="fa-fw mr-2" /></h5><span>Teyvat Time</span>
        </Col>
        <Col xs="auto">
          <DropdownButton title={timeZoneKey}>
            {Object.keys(timeZones).map(zoneKey =>
              <Dropdown.Item key={zoneKey} onClick={() => setTimeZoneKey(zoneKey)} >{zoneKey}</Dropdown.Item>)}
          </DropdownButton>
        </Col>
      </Row>

    </Card.Header>
    <Card.Body>
      <Row className="d-flex justify-content-center">
        <Col xs="auto" className="px-3">
          <span style={{ fontSize: "4em" }} className="d-block">
            {time.toLocaleTimeString([], { timeZone: "UTC" })}
          </span>

        </Col>
        <Col xs="auto ">
          <div className="h-100 d-flex flex-column">
            <div xs={12} className="flex-grow-1">Server Date: <b>{time.toDateString()}</b></div>
            <div xs={12} className="flex-grow-1">Time until reset: <b>{remainingResetString}</b></div>
            <div xs={12} className="flex-grow-1">Resin until reset: <b>{Math.floor(remaningTimeMs / (8 * MINUTE_MS))}</b></div>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
}
const books = {
  advice: {
    name: "Wanderer's Advice",
    exp: 1000,
    cost: 200,
    img: Assets.exp_books.advice
  },
  experience: {
    name: "Adventurer's Experience",
    exp: 5000,
    cost: 1000,
    img: Assets.exp_books.experience
  },
  wit: {
    name: "Hero's Wit",
    exp: 20000,
    cost: 4000,
    img: Assets.exp_books.wit
  },
}


const levelExp = [0, 1000, 1325, 1700, 2150, 2625, 3150, 3725, 4350, 5000, 5700, 6450, 7225, 8050, 8925, 9825, 10750, 11725, 12725, 13775, 14875, 16800, 18000, 19250, 20550, 21875, 23250, 24650, 26100, 27575, 29100, 30650, 32250, 33875, 35550, 37250, 38975, 40750, 42575, 44425, 46300, 50625, 52700, 54775, 56900, 59075, 61275, 63525, 65800, 68125, 70475, 76500, 79050, 81650, 84275, 86950, 89650, 92400, 95175, 98000, 100875, 108950, 112050, 115175, 118325, 121525, 124775, 128075, 131400, 134775, 138175, 148700, 152375, 156075, 159825, 163600, 167425, 171300, 175225, 179175, 183175, 216225, 243025, 273100, 306800, 344600, 386950, 434425, 487625, 547200]
const milestone = [20, 40, 50, 60, 70, 80, 90]
function EXPCalc(props) {
  let [advice, setAdvice] = useState(0)
  let [experience, setExperience] = useState(0)
  let [wit, setWit] = useState(0)
  let bookState = { advice, experience, wit }
  let setBookState = { advice: setAdvice, experience: setExperience, wit: setWit }
  let [goUnder, setGoUnder] = useState(false)
  let [level, setLevel] = useState(1)
  let [curExp, setCurExp] = useState(0)
  let [mora, setMora] = useState(0)

  //load mora from localStorage
  useEffect(() => setMora(loadFromLocalStorage("mora") || 0), [])
  //save mora to localStorage
  useEffect(() => {
    saveToLocalStorage("mora", mora)
  }, [mora])

  //load mora from localStorage
  useEffect(() => setLevel(loadFromLocalStorage("exp_calc_level") || 1), [])
  //save mora to localStorage
  useEffect(() => {
    saveToLocalStorage("exp_calc_level", level)
  }, [level])

  //load mora from localStorage
  useEffect(() => setCurExp(loadFromLocalStorage("exp_calc_cur_exp") || 0), [])
  //save mora to localStorage
  useEffect(() => {
    saveToLocalStorage("exp_calc_cur_exp", curExp)
  }, [curExp])

  //load exp_books from localStorage
  useEffect(() => {
    let lsBookState = loadFromLocalStorage("exp_books") || {}
    let setBookStates = { advice: setAdvice, experience: setExperience, wit: setWit }
    Object.entries(lsBookState).forEach(([key, val]) => setBookStates[key]?.(val))
  }, [])
  //save exp_books to localStorage
  useEffect(() =>
    saveToLocalStorage("exp_books", { advice, experience, wit }), [advice, experience, wit])

  let milestoneLvl = milestone.find(lvl => lvl > level)
  let expReq = -curExp
  for (let i = level; i < Math.min(milestoneLvl, levelExp.length); i++)  expReq += levelExp[i]
  let bookResult = calculateBooks(wit, experience, advice, expReq, goUnder) || []
  let [numWit = 0, numExperience = 0, numAdvice = 0] = bookResult
  let bookResultObj = { advice: numAdvice, experience: numExperience, wit: numWit }
  let expFromBooks = numWit * 20000 + numExperience * 5000 + numAdvice * 1000
  let moraCost = expFromBooks / 5
  let expDiff = expReq - expFromBooks
  let finalMora = mora - moraCost
  let finalExp = expFromBooks + curExp
  let finalLvl = level
  for (; finalLvl < Math.min(milestoneLvl, levelExp.length); finalLvl++) {
    if (levelExp[finalLvl] <= finalExp) finalExp -= levelExp[finalLvl]
    else break;
  }
  if (finalLvl === milestoneLvl) finalExp = 0

  let invalidText = ""

  if (finalMora < 0)
    invalidText = <span>You don't have enough <b>Mora</b> for this operation.</span>
  else if (bookResult.length === 0)
    invalidText = <span>You don't have enough <b>EXP. books</b> to level to the next milestone.</span>
  else if (level === 90)
    invalidText = "You are at the maximum level."
  return <Card bg="darkcontent" text="lightfont" className="mt-2">
    <Card.Header>
      <Row>
        <Col xs="auto">
          <Image src={books.wit.img} className="thumb-small d-inline my-n1 ml-n2" /><span>Experience Calculator</span>
        </Col>
        <Col>
          <ButtonGroup>
            <Button variant={goUnder ? "primary" : "success"} disabled={!goUnder} onClick={() => setGoUnder(false)}>Full Level</Button>
            <Button variant={!goUnder ? "primary" : "success"} disabled={goUnder} onClick={() => setGoUnder(true)}>Don't fully level</Button>
          </ButtonGroup>
        </Col>
      </Row>

    </Card.Header>
    <Card.Body>
      <Row className="mb-2">
        <Col>
          <span>This calcualtor tries to calculate the amount of exp books required to get to the next milestone level. </span>
          {goUnder ? "It will try to get as close to the milestone level as possible, so you can grind the rest of the exp without any waste." :
            "It will try to calculate the amount of books needed to minize as much exp loss as possible."}
        </Col>
      </Row>
      <Row >
        <Col xs={12} md={4} className="mb-2">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Current Level</InputGroup.Text>
            </InputGroup.Prepend>
            <CustomFormControl
              value={level}
              onChange={(val) => setLevel(clamp(val, 0, 90))}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md={8} className="mb-2">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Current EXP.</InputGroup.Text>
            </InputGroup.Prepend>
            <CustomFormControl
              value={curExp}
              onChange={(val) => setCurExp(clamp(val, 0, (levelExp[level] || 1) - 1))}
            />
            <InputGroup.Append>
              <InputGroup.Text>/{levelExp[level] || 0}</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </Col>
        <Col xs={12} md={4} className="mb-2"><Card bg="lightcontent" text="lightfont">
          <Card.Body className="py-2">
            <span>Next Milestone: </span><span className="float-right text-right"><b>{milestoneLvl}</b></span>
          </Card.Body>
        </Card></Col>
        <Col xs={12} md={8} className="mb-2"><Card bg="lightcontent" text="lightfont">
          <Card.Body className="py-2">
            <span>EXP. needed to milestone: </span><span className="float-right text-right"><strong>{expFromBooks}</strong> / <b>{expReq}</b></span>
          </Card.Body>
        </Card></Col>
      </Row>
      <Row>
        {Object.entries(books).map(([bookKey, bookObj]) => {
          return <Col xs={12} lg={4} key={bookKey}>
            <BookDisplay bookObj={bookObj} value={bookState[bookKey]} setValue={setBookState[bookKey]} required={bookResultObj[bookKey]} />
          </Col>
        })}
        <Col xs={12} lg={4} className="mb-2">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Current Mora</InputGroup.Text>
            </InputGroup.Prepend>
            <CustomFormControl
              value={mora}
              onChange={(val) => setMora(Math.max(val, 0))}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md={4} className="mb-2"><Card bg="lightcontent" text="lightfont">
          <Card.Body className="py-2">
            <span>Mora Cost: </span><span className="float-right text-right"><b>{moraCost}</b></span>
          </Card.Body>
        </Card></Col>
        <Col xs={12} md={4} className="mb-2"><Card bg="lightcontent" text="lightfont">
          <Card.Body className="py-2">
            <span>EXP {!goUnder ? "Waste" : "Diff"}: </span><span className="float-right text-right"><b className={expDiff < 0 ? `text-danger` : `text-success`}>{expDiff}</b></span>
          </Card.Body>
        </Card></Col>
        <Col xs={12} md={4} className="mb-2"><Card bg="lightcontent" text="lightfont">
          <Card.Body className="py-2">
            <span>Final Mora: </span><span className="float-right text-right"><b className={finalMora < 0 ? `text-danger` : `text-success`}>{finalMora}</b></span>
          </Card.Body>
        </Card></Col>
        <Col xs={12} md={4} className="mb-2"><Card bg="lightcontent" text="lightfont">
          <Card.Body className="py-2">
            <span>Final Level: </span><span className="float-right text-right"><b className="text-success">{finalLvl}</b></span>
          </Card.Body>
        </Card></Col>
        <Col xs={12} md={4} className="mb-2"><Card bg="lightcontent" text="lightfont">
          <Card.Body className="py-2">
            <span>Final EXP: </span><span className="float-right text-right"><b className={finalExp < 0 ? `text-danger` : `text-success`}>{finalExp}</b></span>
          </Card.Body>
        </Card></Col>
      </Row>
    </Card.Body>
    <Card.Footer>
      <Row>
        <Col>
          {Boolean(invalidText) && <Alert variant="danger" className="mb-0 py-2">{invalidText}</Alert>}
        </Col>
        <Col xs="auto"><Button disabled={invalidText}
          onClick={() => {
            setLevel(finalLvl)
            setCurExp(finalExp)
            Object.entries(bookResultObj).forEach(([bookKey, val]) => setBookState[bookKey]?.(bookState[bookKey] - val))
            setMora(finalMora)
          }}
          variant="success">Apply</Button></Col>
      </Row>
    </Card.Footer>
  </Card>
}
function BookDisplay(props) {
  let { bookObj: { name, img }, value = 0, setValue, required = 0 } = props
  return <Card bg="lightcontent" text="lightfont" className="mb-2">
    <Card.Header>{name}</Card.Header>
    <Card.Body>
      <Row>
        <Col xs={3}><Image src={img} className="w-100 h-auto" rounded /></Col>
        <Col >
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text >Amount</InputGroup.Text >
            </InputGroup.Prepend>
            <CustomFormControl
              value={value}
              onChange={(val) => setValue(Math.max(val, 0))}
            />
          </InputGroup>
          <div className="mt-2"><span>Required: </span><span className="float-right text-right"><b className={required ? "text-success" : ""}>{required}</b></span></div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
}

function calculateBooks(c20000, c5000, c1000, required, goUnder) {
  let current = goUnder ? Math.floor(required / 1000) : Math.ceil(required / 1000)

  let r20000 = Math.min(Math.floor(current / 20), c20000)
  current -= r20000 * 20
  let r5000 = Math.min(Math.floor(current / 5), c5000)
  current -= r5000 * 5
  let r1000 = Math.min(current, c1000)
  current -= r1000
  if (goUnder || current === 0)
    return [r20000, r5000, r1000]
  else if (r5000 === 3 && r20000 !== c20000)
    return [r20000 + 1, 0, 0]
  else if (r5000 !== c5000)
    return [r20000, r5000 + 1, 0]
  else if (r20000 !== c20000)
    return [r20000 + 1, 0, 0]
  return null
}