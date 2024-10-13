import { v as requireCreateSvgIcon, w as interopRequireDefaultExports, j as jsxRuntimeExports, r as reactExports, d as jsxs, G as Grid, b as jsx, X as ImgIcon, T as Typography, aN as ButtonGroup, ag as Button, N as Divider, aO as TextButton, aP as CustomNumberInputButtonGroupWrapper, aQ as CustomNumberInput, aR as clamp, h as CardThemed, f as Box, aS as ColorText, O as CardContent, av as Alert, aT as objMap, Y as imgAssets, ax as ImgFullwidth, a as useDatabase, a9 as RESIN_MAX, aU as timeString, aV as InputBase, a8 as timeZones, aW as DAY_MS, aX as MenuItem, aY as DropdownButton, aZ as MINUTE_MS, aa as SECOND_MS, ac as ReactGA } from "./index-B8aczfSH.js";
import { R as RESIN_RECH_MS, d as default_1$1 } from "./AccessTimeFilled-DAjqC4h9.js";
var Check = {};
var _interopRequireDefault = interopRequireDefaultExports;
Object.defineProperty(Check, "__esModule", {
  value: true
});
var default_1 = Check.default = void 0;
var _createSvgIcon = _interopRequireDefault(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
var _default = (0, _createSvgIcon.default)(/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
}), "Check");
default_1 = Check.default = _default;
const booksData = {
  advice: {
    name: "Wanderer's Advice",
    exp: 1e3,
    cost: 200,
    img: imgAssets.exp_books.advice
  },
  experience: {
    name: "Adventurer's Experience",
    exp: 5e3,
    cost: 1e3,
    img: imgAssets.exp_books.experience
  },
  wit: {
    name: "Hero's Wit",
    exp: 2e4,
    cost: 4e3,
    img: imgAssets.exp_books.wit
  }
};
const levelExp = [
  0,
  1e3,
  1325,
  1700,
  2150,
  2625,
  3150,
  3725,
  4350,
  5e3,
  5700,
  6450,
  7225,
  8050,
  8925,
  9825,
  10750,
  11725,
  12725,
  13775,
  14875,
  16800,
  18e3,
  19250,
  20550,
  21875,
  23250,
  24650,
  26100,
  27575,
  29100,
  30650,
  32250,
  33875,
  35550,
  37250,
  38975,
  40750,
  42575,
  44425,
  46300,
  50625,
  52700,
  54775,
  56900,
  59075,
  61275,
  63525,
  65800,
  68125,
  70475,
  76500,
  79050,
  81650,
  84275,
  86950,
  89650,
  92400,
  95175,
  98e3,
  100875,
  108950,
  112050,
  115175,
  118325,
  121525,
  124775,
  128075,
  131400,
  134775,
  138175,
  148700,
  152375,
  156075,
  159825,
  163600,
  167425,
  171300,
  175225,
  179175,
  183175,
  216225,
  243025,
  273100,
  306800,
  344600,
  386950,
  434425,
  487625,
  547200
];
const milestone = [20, 40, 50, 60, 70, 80, 90];
function initExpCalc() {
  return {
    mora: 0,
    level: 1,
    curExp: 0,
    goUnder: false,
    books: { advice: 0, experience: 0, wit: 0 }
  };
}
function EXPCalc() {
  const [state, setState] = reactExports.useState(() => initExpCalc());
  const {
    mora,
    level,
    curExp,
    goUnder,
    books,
    books: { advice, experience, wit }
  } = state;
  const milestoneLvl = milestone.find((lvl) => lvl > level);
  let expReq = -curExp;
  for (let i = level; i < Math.min(milestoneLvl, levelExp.length); i++)
    expReq += levelExp[i];
  const bookResult = calculateBooks(wit, experience, advice, expReq, goUnder) || [];
  const [numWit = 0, numExperience = 0, numAdvice = 0] = bookResult;
  const bookResultObj = {
    advice: numAdvice,
    experience: numExperience,
    wit: numWit
  };
  const expFromBooks = numWit * 2e4 + numExperience * 5e3 + numAdvice * 1e3;
  const moraCost = expFromBooks / 5;
  const expDiff = expReq - expFromBooks;
  const finalMora = mora - moraCost;
  let finalExp = expFromBooks + curExp;
  let finalLvl = level;
  for (; finalLvl < Math.min(milestoneLvl, levelExp.length); finalLvl++) {
    if (levelExp[finalLvl] <= finalExp)
      finalExp -= levelExp[finalLvl];
    else
      break;
  }
  if (finalLvl === milestoneLvl)
    finalExp = 0;
  let invalidText = "";
  if (finalMora < 0)
    invalidText = /* @__PURE__ */ jsxs("span", { children: [
      "You don't have enough ",
      /* @__PURE__ */ jsx("b", { children: "Mora" }),
      " for this operation."
    ] });
  else if (bookResult.length === 0)
    invalidText = /* @__PURE__ */ jsxs("span", { children: [
      "You don't have enough ",
      /* @__PURE__ */ jsx("b", { children: "EXP. books" }),
      " to level to the next milestone."
    ] });
  else if (level === 90)
    invalidText = "You are at the maximum level.";
  return /* @__PURE__ */ jsxs(CardThemed, { children: [
    /* @__PURE__ */ jsxs(Grid, { container: true, sx: { px: 2, py: 1 }, spacing: 2, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(ImgIcon, { src: booksData.wit.img, size: 2 }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, flexGrow: 1, children: /* @__PURE__ */ jsx(Typography, { variant: "h6", children: "Experience Calculator" }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsxs(ButtonGroup, { children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            color: "primary",
            disabled: !goUnder,
            onClick: () => setState({ ...state, goUnder: false }),
            children: "Full Level"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            color: "primary",
            disabled: goUnder,
            onClick: () => setState({ ...state, goUnder: true }),
            children: "Don't fully level"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsxs(Typography, { children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "This calculator tries to calculate the amount of exp books required to get to the next milestone level.",
          " "
        ] }),
        goUnder ? "It will try to get as close to the milestone level as possible, so you can grind the rest of the exp without any waste." : "It will try to calculate the amount of books needed to minimize as much exp loss as possible."
      ] }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 6, md: 3, children: /* @__PURE__ */ jsxs(ButtonGroup, { sx: { display: "flex" }, children: [
        /* @__PURE__ */ jsx(TextButton, { children: "Current Level" }),
        /* @__PURE__ */ jsx(
          CustomNumberInputButtonGroupWrapper,
          {
            sx: { flexBasis: 30, flexGrow: 1 },
            children: /* @__PURE__ */ jsx(
              CustomNumberInput,
              {
                value: level,
                onChange: (val) => setState({ ...state, level: clamp(val ?? 0, 0, 90) }),
                sx: { px: 2 }
              }
            )
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 6, md: 3, children: /* @__PURE__ */ jsxs(ButtonGroup, { sx: { display: "flex" }, children: [
        /* @__PURE__ */ jsx(TextButton, { children: "Current EXP." }),
        /* @__PURE__ */ jsx(
          CustomNumberInputButtonGroupWrapper,
          {
            sx: { flexBasis: 30, flexGrow: 1 },
            children: /* @__PURE__ */ jsx(
              CustomNumberInput,
              {
                value: curExp,
                onChange: (val) => setState({
                  ...state,
                  curExp: clamp(val ?? 0, 0, (levelExp[level] || 1) - 1)
                }),
                endAdornment: `/${levelExp[level] || 0}`,
                sx: { px: 2 }
              }
            )
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 6, md: 3, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", children: /* @__PURE__ */ jsxs(
        Box,
        {
          sx: { p: 1, display: "flex", justifyContent: "space-between" },
          children: [
            /* @__PURE__ */ jsx(Typography, { children: "Next Milestone Level:" }),
            /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsx("b", { children: milestoneLvl }) })
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 6, md: 3, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", children: /* @__PURE__ */ jsxs(
        Box,
        {
          sx: { p: 1, display: "flex", justifyContent: "space-between" },
          children: [
            /* @__PURE__ */ jsx(Typography, { children: "EXP. to milestone:" }),
            /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: expFromBooks }),
              " / ",
              /* @__PURE__ */ jsx("strong", { children: expReq })
            ] }) })
          ]
        }
      ) }) }),
      Object.entries(books).map(([bookKey]) => {
        return /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(
          BookDisplay,
          {
            bookKey,
            value: books[bookKey],
            setValue: (b) => setState({ ...state, books: { ...books, [bookKey]: b } }),
            required: bookResultObj[bookKey]
          }
        ) }, bookKey);
      }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxs(ButtonGroup, { sx: { display: "flex" }, children: [
        /* @__PURE__ */ jsx(TextButton, { children: "Current Mora" }),
        /* @__PURE__ */ jsx(
          CustomNumberInputButtonGroupWrapper,
          {
            sx: { flexBasis: 30, flexGrow: 1 },
            children: /* @__PURE__ */ jsx(
              CustomNumberInput,
              {
                value: mora,
                onChange: (val) => setState({ ...state, mora: Math.max(val ?? 0, 0) }),
                sx: { px: 2 }
              }
            )
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", children: /* @__PURE__ */ jsxs(
        Box,
        {
          sx: { p: 1, display: "flex", justifyContent: "space-between" },
          children: [
            /* @__PURE__ */ jsx(Typography, { children: "Mora Cost: " }),
            /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsx("b", { children: moraCost }) })
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", children: /* @__PURE__ */ jsxs(
        Box,
        {
          sx: { p: 1, display: "flex", justifyContent: "space-between" },
          children: [
            /* @__PURE__ */ jsxs(Typography, { children: [
              "EXP ",
              !goUnder ? "Waste" : "Diff",
              ": "
            ] }),
            /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(ColorText, { color: expDiff < 0 ? `error` : `success`, children: expDiff }) }) })
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", children: /* @__PURE__ */ jsxs(
        Box,
        {
          sx: { p: 1, display: "flex", justifyContent: "space-between" },
          children: [
            /* @__PURE__ */ jsx(Typography, { children: "Final Mora: " }),
            /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(ColorText, { color: finalMora < 0 ? `error` : `success`, children: finalMora }) }) })
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", children: /* @__PURE__ */ jsxs(
        Box,
        {
          sx: { p: 1, display: "flex", justifyContent: "space-between" },
          children: [
            /* @__PURE__ */ jsx(Typography, { children: "Final Level: " }),
            /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(ColorText, { color: "success", children: finalLvl }) }) })
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", children: /* @__PURE__ */ jsxs(
        Box,
        {
          sx: { p: 1, display: "flex", justifyContent: "space-between" },
          children: [
            /* @__PURE__ */ jsx(Typography, { children: "Final EXP: " }),
            /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(ColorText, { color: finalExp < 0 ? `error` : `success`, children: finalExp }) }) })
          ]
        }
      ) }) })
    ] }) }),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(CardContent, { sx: { py: 1 }, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, flexGrow: 1, children: !!invalidText && /* @__PURE__ */ jsx(Alert, { variant: "filled", severity: "error", children: invalidText }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: "auto", children: /* @__PURE__ */ jsx(
        Button,
        {
          disabled: !!invalidText,
          onClick: () => setState({
            ...state,
            level: finalLvl,
            curExp: finalExp,
            books: objMap(
              bookResultObj,
              (val, bookKey) => books[bookKey] - val
            ),
            mora: finalMora
          }),
          color: "success",
          startIcon: /* @__PURE__ */ jsx(default_1, {}),
          sx: { height: "100%" },
          children: "Apply"
        }
      ) })
    ] }) })
  ] });
}
function BookDisplay(props) {
  const { bookKey, value = 0, setValue, required = 0 } = props;
  return /* @__PURE__ */ jsxs(CardThemed, { bgt: "light", children: [
    /* @__PURE__ */ jsx(CardContent, { sx: { py: 1 }, children: /* @__PURE__ */ jsx(Typography, { children: booksData[bookKey].name }) }),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 3, children: /* @__PURE__ */ jsx(ImgFullwidth, { src: booksData[bookKey].img }) }),
      /* @__PURE__ */ jsxs(Grid, { item: true, xs: 9, children: [
        /* @__PURE__ */ jsxs(ButtonGroup, { sx: { display: "flex" }, children: [
          /* @__PURE__ */ jsx(TextButton, { children: "Amount" }),
          /* @__PURE__ */ jsx(
            CustomNumberInputButtonGroupWrapper,
            {
              sx: { flexBasis: 30, flexGrow: 1 },
              children: /* @__PURE__ */ jsx(
                CustomNumberInput,
                {
                  value,
                  onChange: (val) => setValue(Math.max(val ?? 0, 0)),
                  sx: { px: 2 }
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Box, { display: "flex", justifyContent: "space-between", mt: 1, children: [
          /* @__PURE__ */ jsx(Typography, { children: "Required:" }),
          /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(ColorText, { color: required ? "success" : void 0, children: required }) }) })
        ] })
      ] })
    ] }) })
  ] });
}
function calculateBooks(c20000, c5000, c1000, required, goUnder) {
  let current = goUnder ? Math.floor(required / 1e3) : Math.ceil(required / 1e3);
  const r20000 = Math.min(Math.floor(current / 20), c20000);
  current -= r20000 * 20;
  const r5000 = Math.min(Math.floor(current / 5), c5000);
  current -= r5000 * 5;
  const r1000 = Math.min(current, c1000);
  current -= r1000;
  if (goUnder || current === 0)
    return [r20000, r5000, r1000];
  else if (r5000 === 3 && r20000 !== c20000)
    return [r20000 + 1, 0, 0];
  else if (r5000 !== c5000)
    return [r20000, r5000 + 1, 0];
  else if (r20000 !== c20000)
    return [r20000 + 1, 0, 0];
  return null;
}
const RESIN_COUNTER_VALUES = [0, -1, -10, -20, -30, -40, -60, 1, 60, RESIN_MAX];
function ResinCounter() {
  const database = useDatabase();
  const [{ resin, resinDate }, setState] = reactExports.useState(
    () => database.displayTool.get()
  );
  reactExports.useEffect(
    () => database.displayTool.follow((r, s) => setState(s)),
    [database]
  );
  const resinIncrement = reactExports.useRef(void 0);
  const setResin = (newResin) => {
    if (newResin >= RESIN_MAX) {
      resinIncrement.current && clearTimeout(resinIncrement.current);
      resinIncrement.current = void 0;
    } else
      resinIncrement.current = setTimeout(
        () => console.log("set resin", newResin + 1),
        RESIN_RECH_MS
      );
    database.displayTool.set({
      resin: newResin,
      resinDate: (/* @__PURE__ */ new Date()).getTime()
    });
  };
  reactExports.useEffect(() => {
    if (resin < RESIN_MAX) {
      const now = Date.now();
      const resinToMax = RESIN_MAX - resin;
      const resinSinceLastDate = Math.min(
        Math.floor((now - resinDate) / RESIN_RECH_MS),
        resinToMax
      );
      const catchUpResin = resin + resinSinceLastDate;
      const newDate = resinDate + resinSinceLastDate * RESIN_RECH_MS;
      database.displayTool.set({ resin: catchUpResin, resinDate: newDate });
      if (catchUpResin < RESIN_MAX)
        resinIncrement.current = setTimeout(
          () => setResin(catchUpResin + 1),
          now - newDate
        );
    }
    return () => resinIncrement.current && clearTimeout(resinIncrement.current);
  }, []);
  const nextResinDateNum = resin >= RESIN_MAX ? resinDate : resinDate + RESIN_RECH_MS;
  const resinFullDateNum = resin >= RESIN_MAX ? resinDate : resinDate + (RESIN_MAX - resin) * RESIN_RECH_MS;
  const resinFullDate = new Date(resinFullDateNum);
  const nextDeltaString = timeString(Math.abs(nextResinDateNum - Date.now()));
  const handleResinChange = (val) => {
    const MAX_ORIGINAL_RESIN = 2e3;
    const newResin = parseInt(val);
    if (newResin >= 0 && newResin <= MAX_ORIGINAL_RESIN) {
      setResin(newResin);
    }
  };
  return /* @__PURE__ */ jsxs(CardThemed, { children: [
    /* @__PURE__ */ jsxs(Grid, { container: true, sx: { px: 2, py: 1 }, spacing: 2, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(ImgIcon, { src: imgAssets.resin.fragile, size: 2 }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(Typography, { variant: "h6", children: "Resin Counter" }) })
    ] }),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 2, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsxs(Typography, { variant: "h2", children: [
        /* @__PURE__ */ jsx(ImgIcon, { src: imgAssets.resin.fragile }),
        /* @__PURE__ */ jsx(
          InputBase,
          {
            type: "number",
            sx: { width: "2.5em", fontSize: "4rem" },
            value: resin,
            inputProps: { min: 0, max: 999, sx: { textAlign: "right" } },
            onChange: (e) => handleResinChange(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxs("span", { children: [
          "/",
          RESIN_MAX
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Grid, { item: true, flexGrow: 1, children: [
        /* @__PURE__ */ jsx(ButtonGroup, { fullWidth: true, children: RESIN_COUNTER_VALUES.map((rcv) => {
          if (rcv === 0) {
            return /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => setResin(rcv),
                disabled: resin === 0,
                children: rcv
              }
            );
          }
          if (rcv === RESIN_MAX) {
            return /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => setResin(RESIN_MAX),
                disabled: resin >= RESIN_MAX,
                children: [
                  "MAX ",
                  rcv
                ]
              }
            );
          }
          if (rcv > 0) {
            return /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => setResin(resin + rcv),
                disabled: resin >= RESIN_MAX,
                children: [
                  "+",
                  rcv
                ]
              }
            );
          }
          return /* @__PURE__ */ jsx(
            Button,
            {
              onClick: () => setResin(resin + rcv),
              disabled: resin < Math.abs(rcv),
              children: rcv
            }
          );
        }) }),
        /* @__PURE__ */ jsx(Typography, { variant: "subtitle1", sx: { mt: 2 }, children: resin < RESIN_MAX ? /* @__PURE__ */ jsxs("span", { children: [
          "Next resin in ",
          nextDeltaString,
          ", full Resin at",
          " ",
          resinFullDate.toLocaleTimeString(),
          " ",
          resinFullDate.toLocaleDateString()
        ] }) : /* @__PURE__ */ jsxs("span", { children: [
          "Resin has been full for at least ",
          nextDeltaString,
          ", since",
          " ",
          resinFullDate.toLocaleTimeString(),
          " ",
          resinFullDate.toLocaleDateString()
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsx(Typography, { variant: "caption", children: "Because we do not provide a mechanism to synchronize resin time, actual resin recharge time might be as much as 8 minutes earlier than predicted." }) })
    ] }) })
  ] });
}
function TeyvatTime() {
  const database = useDatabase();
  const [{ timeZoneKey }, setState] = reactExports.useState(() => database.displayTool.get());
  reactExports.useEffect(
    () => database.displayTool.follow((r, s) => setState(s)),
    [database]
  );
  const setTimeZoneKey = reactExports.useCallback(
    (timeZoneKey2) => database.displayTool.set({ timeZoneKey: timeZoneKey2 }),
    [database]
  );
  const [time, setTime] = reactExports.useState(
    new Date(Date.now() + timeZones[timeZoneKey])
  );
  reactExports.useEffect(() => {
    const setSecondTimeout = () => {
      setTime(new Date(Date.now() + timeZones[timeZoneKey]));
      return setTimeout(() => {
        interval = setSecondTimeout();
      }, SECOND_MS - Date.now() % SECOND_MS);
    };
    let interval = setSecondTimeout();
    return () => clearTimeout(interval);
  }, [timeZoneKey]);
  let resetTime = new Date(time);
  if (resetTime.getUTCHours() < 4) {
    resetTime.setUTCHours(4, 0, 0, 0);
  } else {
    resetTime = new Date(resetTime.getTime() + DAY_MS);
    resetTime.setUTCHours(4, 0, 0, 0);
  }
  const remaningTimeMs = resetTime.getTime() - time.getTime();
  const remainingResetString = timeString(remaningTimeMs);
  return /* @__PURE__ */ jsxs(CardThemed, { children: [
    /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", gap: 1, alignItems: "center" }, children: [
      /* @__PURE__ */ jsx(default_1$1, {}),
      /* @__PURE__ */ jsx(Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "Teyvat Time" }),
      /* @__PURE__ */ jsx(DropdownButton, { title: timeZoneKey, children: Object.keys(timeZones).map((zoneKey) => /* @__PURE__ */ jsx(
        MenuItem,
        {
          selected: timeZoneKey === zoneKey,
          disabled: timeZoneKey === zoneKey,
          onClick: () => setTimeZoneKey(zoneKey),
          children: zoneKey
        },
        zoneKey
      )) })
    ] }),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, justifyContent: "center", spacing: 3, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, sx: { my: 4 }, children: /* @__PURE__ */ jsx(Typography, { variant: "h2", children: time.toLocaleTimeString([], { timeZone: "UTC" }) }) }),
      /* @__PURE__ */ jsxs(
        Grid,
        {
          item: true,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          children: [
            /* @__PURE__ */ jsxs(Typography, { children: [
              "Server Date: ",
              /* @__PURE__ */ jsx("b", { children: time.toDateString() })
            ] }),
            /* @__PURE__ */ jsxs(Typography, { children: [
              "Time until reset: ",
              /* @__PURE__ */ jsx("b", { children: remainingResetString })
            ] }),
            /* @__PURE__ */ jsxs(Typography, { children: [
              "Resin until reset:",
              " ",
              /* @__PURE__ */ jsx("b", { children: Math.floor(remaningTimeMs / (8 * MINUTE_MS)) })
            ] })
          ]
        }
      )
    ] }) })
  ] });
}
function PageTools() {
  ReactGA.send({ hitType: "pageview", page: "/tools" });
  return /* @__PURE__ */ jsxs(Box, { display: "flex", flexDirection: "column", gap: 1, children: [
    /* @__PURE__ */ jsx(TeyvatTime, {}),
    /* @__PURE__ */ jsx(ResinCounter, {}),
    /* @__PURE__ */ jsx(EXPCalc, {})
  ] });
}
export {
  PageTools as default
};
