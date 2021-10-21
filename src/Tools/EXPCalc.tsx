
import { Check } from '@mui/icons-material';
import { Alert, Box, Button, ButtonGroup, CardContent, Divider, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Assets from '../Assets/Assets';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import ColorText from '../Components/ColoredText';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from '../Components/CustomNumberInput';
import ImgFullwidth from '../Components/Image/ImgFullwidth';
import ImgIcon from '../Components/Image/ImgIcon';
import TextButton from '../Components/TextButton';
import { dbStorage } from '../Database/DBStorage';
import { clamp } from "../Util/Util";
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
export default function EXPCalc(props) {
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
  useEffect(() => setMora(dbStorage.get("mora") || 0), [])
  //save mora to localStorage
  useEffect(() => {
    dbStorage.set("mora", mora)
  }, [mora])

  //load mora from localStorage
  useEffect(() => setLevel(dbStorage.get("exp_calc_level") || 1), [])
  //save mora to localStorage
  useEffect(() => {
    dbStorage.set("exp_calc_level", level)
  }, [level])

  //load mora from localStorage
  useEffect(() => setCurExp(dbStorage.get("exp_calc_cur_exp") || 0), [])
  //save mora to localStorage
  useEffect(() => {
    dbStorage.set("exp_calc_cur_exp", curExp)
  }, [curExp])

  //load exp_books from localStorage
  useEffect(() => {
    let lsBookState = dbStorage.get("exp_books") || {}
    let setBookStates = { advice: setAdvice, experience: setExperience, wit: setWit }
    Object.entries(lsBookState).forEach(([key, val]: any) => setBookStates[key]?.(val))
  }, [])
  //save exp_books to localStorage
  useEffect(() =>
    dbStorage.set("exp_books", { advice, experience, wit }), [advice, experience, wit])

  let milestoneLvl = milestone.find(lvl => lvl > level)!
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

  let invalidText: Displayable = ""

  if (finalMora < 0)
    invalidText = <span>You don't have enough <b>Mora</b> for this operation.</span>
  else if (bookResult.length === 0)
    invalidText = <span>You don't have enough <b>EXP. books</b> to level to the next milestone.</span>
  else if (level === 90)
    invalidText = "You are at the maximum level."
  return <CardDark>
    <Grid container sx={{ px: 2, py: 1 }} spacing={2} >
      <Grid item>
        <ImgIcon src={books.wit.img} sx={{ fontSize: "2em" }} />
      </Grid>
      <Grid item flexGrow={1}>
        <Typography variant="h6">Experience Calculator</Typography>
      </Grid>
      <Grid item>
        <ButtonGroup>
          <Button color="primary" disabled={!goUnder} onClick={() => setGoUnder(false)}>Full Level</Button>
          <Button color="primary" disabled={goUnder} onClick={() => setGoUnder(true)}>Don't fully level</Button>
        </ButtonGroup>
      </Grid>
    </Grid>
    <Divider />

    <CardContent>
      <Grid container spacing={1}>
        <Grid item>
          <Typography>
            <span>This calculator tries to calculate the amount of exp books required to get to the next milestone level. </span>
            {goUnder ? "It will try to get as close to the milestone level as possible, so you can grind the rest of the exp without any waste." :
              "It will try to calculate the amount of books needed to minimize as much exp loss as possible."}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3} >
          <ButtonGroup sx={{ display: "flex" }}>
            <TextButton>Current Level</TextButton>
            <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
              <CustomNumberInput
                value={level}
                onChange={(val) => setLevel(clamp(val, 0, 90))}
                sx={{ px: 2 }}
              />
            </CustomNumberInputButtonGroupWrapper >
          </ButtonGroup>
        </Grid>
        <Grid item xs={6} md={3} >
          <ButtonGroup sx={{ display: "flex" }}>
            <TextButton>Current EXP.</TextButton>
            <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
              <CustomNumberInput
                value={curExp}
                onChange={(val) => setCurExp(clamp(val, 0, (levelExp[level] || 1) - 1))}
                endAdornment={`/${levelExp[level] || 0}`}
                sx={{ px: 2 }}
              />
            </CustomNumberInputButtonGroupWrapper>
          </ButtonGroup>
        </Grid>
        <Grid item xs={6} md={3} ><CardLight>
          <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography>
              Next Milestone Level:
            </Typography>
            <Typography>
              <b>{milestoneLvl}</b>
            </Typography>
          </Box>
        </CardLight></Grid>
        <Grid item xs={6} md={3} ><CardLight>
          <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography>
              EXP. to milestone:
            </Typography>
            <Typography>
              <span><strong>{expFromBooks}</strong> / <strong>{expReq}</strong></span>
            </Typography>
          </Box>
        </CardLight></Grid>
        {Object.entries(books).map(([bookKey, bookObj]) => {
          return <Grid item xs={12} md={4} key={bookKey}>
            <BookDisplay bookObj={bookObj} value={bookState[bookKey]} setValue={setBookState[bookKey]} required={bookResultObj[bookKey]} />
          </Grid>
        })}
        <Grid item xs={12} md={4} >
          <ButtonGroup sx={{ display: "flex" }}>
            <TextButton>Current Mora</TextButton>
            <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
              <CustomNumberInput
                value={mora}
                onChange={(val) => setMora(Math.max(val ?? 0, 0))}
                sx={{ px: 2 }}
              />
            </CustomNumberInputButtonGroupWrapper>
          </ButtonGroup>
        </Grid>
        <Grid item xs={12} md={4} ><CardLight>
          <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography>Mora Cost: </Typography>
            <Typography><b>{moraCost}</b></Typography>
          </Box>
        </CardLight></Grid>
        <Grid item xs={12} md={4} ><CardLight>
          <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography>EXP {!goUnder ? "Waste" : "Diff"}: </Typography>
            <Typography><b><ColorText color={expDiff < 0 ? `error` : `success`}>{expDiff}</ColorText></b></Typography>
          </Box>
        </CardLight></Grid>
        <Grid item xs={12} md={4} ><CardLight>
          <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography>Final Mora: </Typography>
            <Typography><b><ColorText color={finalMora < 0 ? `error` : `success`}>{finalMora}</ColorText></b></Typography>
          </Box>
        </CardLight></Grid>
        <Grid item xs={12} md={4} ><CardLight>
          <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography>Final Level: </Typography>
            <Typography><b><ColorText color="success">{finalLvl}</ColorText></b></Typography>
          </Box>
        </CardLight></Grid>
        <Grid item xs={12} md={4} ><CardLight>
          <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography>Final EXP: </Typography>
            <Typography><b><ColorText color={finalExp < 0 ? `error` : `success`}>{finalExp}</ColorText></b></Typography>
          </Box>
        </CardLight></Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardContent sx={{ py: 1 }}>
      <Grid container spacing={2}>
        <Grid item flexGrow={1}>
          {!!invalidText && <Alert variant="filled" severity="error" >{invalidText}</Alert>}
        </Grid>
        <Grid item xs="auto"><Button disabled={!!invalidText}
          onClick={() => {
            setLevel(finalLvl)
            setCurExp(finalExp)
            Object.entries(bookResultObj).forEach(([bookKey, val]) => setBookState[bookKey]?.(bookState[bookKey] - val))
            setMora(finalMora)
          }}
          color="success"
          startIcon={<Check />}
          sx={{ height: "100%" }}
        >Apply</Button>
        </Grid>
      </Grid>
    </CardContent>
  </CardDark>
}
function BookDisplay(props) {
  let { bookObj: { name, img }, value = 0, setValue, required = 0 } = props
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Typography>{name}</Typography>
    </CardContent>
    <Divider />
    <CardContent>
      <Grid container>
        <Grid item xs={3}><ImgFullwidth src={img} /></Grid>
        <Grid item xs={9}>
          <ButtonGroup sx={{ display: "flex" }}>
            <TextButton>Amount</TextButton>
            <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
              <CustomNumberInput
                value={value}
                onChange={(val) => setValue(Math.max(val ?? 0, 0))}
                sx={{ px: 2 }}
              />
            </CustomNumberInputButtonGroupWrapper>
          </ButtonGroup>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography>Required:</Typography>
            <Typography><b ><ColorText color={required ? "success" : ""}>{required}</ColorText></b></Typography>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </CardLight >
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