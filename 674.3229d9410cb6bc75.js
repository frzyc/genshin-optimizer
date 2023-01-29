"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[674],{

/***/ 360531:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ PageTools)
});

// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__(202784);
// EXTERNAL MODULE: ../../node_modules/react-ga4/dist/index.js
var dist = __webpack_require__(761877);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/index.js
var icons_material = __webpack_require__(111084);
// EXTERNAL MODULE: ./src/app/Assets/Assets.tsx + 19 modules
var Assets = __webpack_require__(378547);
// EXTERNAL MODULE: ./src/app/Components/Card/CardDark.tsx
var CardDark = __webpack_require__(87985);
// EXTERNAL MODULE: ./src/app/Components/Card/CardLight.tsx
var CardLight = __webpack_require__(567937);
// EXTERNAL MODULE: ./src/app/Components/ColoredText.tsx
var ColoredText = __webpack_require__(402344);
// EXTERNAL MODULE: ./src/app/Components/CustomNumberInput.tsx
var CustomNumberInput = __webpack_require__(789343);
// EXTERNAL MODULE: ./src/app/Components/Image/ImgFullwidth.tsx
var ImgFullwidth = __webpack_require__(352757);
// EXTERNAL MODULE: ./src/app/Components/Image/ImgIcon.tsx
var ImgIcon = __webpack_require__(726578);
// EXTERNAL MODULE: ./src/app/Components/TextButton.tsx
var TextButton = __webpack_require__(787051);
// EXTERNAL MODULE: ./src/app/Util/Util.ts
var Util = __webpack_require__(41015);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/PageTools/EXPCalc.tsx














const booksData = {
  advice: {
    name: "Wanderer's Advice",
    exp: 1000,
    cost: 200,
    img: Assets/* default.exp_books.advice */.Z.exp_books.advice
  },
  experience: {
    name: "Adventurer's Experience",
    exp: 5000,
    cost: 1000,
    img: Assets/* default.exp_books.experience */.Z.exp_books.experience
  },
  wit: {
    name: "Hero's Wit",
    exp: 20000,
    cost: 4000,
    img: Assets/* default.exp_books.wit */.Z.exp_books.wit
  }
};
const levelExp = [0, 1000, 1325, 1700, 2150, 2625, 3150, 3725, 4350, 5000, 5700, 6450, 7225, 8050, 8925, 9825, 10750, 11725, 12725, 13775, 14875, 16800, 18000, 19250, 20550, 21875, 23250, 24650, 26100, 27575, 29100, 30650, 32250, 33875, 35550, 37250, 38975, 40750, 42575, 44425, 46300, 50625, 52700, 54775, 56900, 59075, 61275, 63525, 65800, 68125, 70475, 76500, 79050, 81650, 84275, 86950, 89650, 92400, 95175, 98000, 100875, 108950, 112050, 115175, 118325, 121525, 124775, 128075, 131400, 134775, 138175, 148700, 152375, 156075, 159825, 163600, 167425, 171300, 175225, 179175, 183175, 216225, 243025, 273100, 306800, 344600, 386950, 434425, 487625, 547200];
const milestone = [20, 40, 50, 60, 70, 80, 90];
function initExpCalc() {
  return {
    mora: 0,
    level: 1,
    curExp: 0,
    goUnder: false,
    books: {
      advice: 0,
      experience: 0,
      wit: 0
    }
  };
}
function EXPCalc() {
  const [state, setState] = (0,react.useState)(() => initExpCalc());
  const {
    mora,
    level,
    curExp,
    goUnder,
    books,
    books: {
      advice,
      experience,
      wit
    }
  } = state;
  const milestoneLvl = milestone.find(lvl => lvl > level);
  let expReq = -curExp;
  for (let i = level; i < Math.min(milestoneLvl, levelExp.length); i++) expReq += levelExp[i];
  const bookResult = calculateBooks(wit, experience, advice, expReq, goUnder) || [];
  const [numWit = 0, numExperience = 0, numAdvice = 0] = bookResult;
  const bookResultObj = {
    advice: numAdvice,
    experience: numExperience,
    wit: numWit
  };
  const expFromBooks = numWit * 20000 + numExperience * 5000 + numAdvice * 1000;
  const moraCost = expFromBooks / 5;
  const expDiff = expReq - expFromBooks;
  const finalMora = mora - moraCost;
  let finalExp = expFromBooks + curExp;
  let finalLvl = level;
  for (; finalLvl < Math.min(milestoneLvl, levelExp.length); finalLvl++) {
    if (levelExp[finalLvl] <= finalExp) finalExp -= levelExp[finalLvl];else break;
  }
  if (finalLvl === milestoneLvl) finalExp = 0;
  let invalidText = "";
  if (finalMora < 0) invalidText = (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: ["You don't have enough ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
      children: "Mora"
    }), " for this operation."]
  });else if (bookResult.length === 0) invalidText = (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: ["You don't have enough ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
      children: "EXP. books"
    }), " to level to the next milestone."]
  });else if (level === 90) invalidText = "You are at the maximum level.";
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
      container: true,
      sx: {
        px: 2,
        py: 1
      },
      spacing: 2,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgIcon/* default */.Z, {
          src: booksData.wit.img,
          sx: {
            fontSize: "2em"
          }
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        flexGrow: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h6",
          children: "Experience Calculator"
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ButtonGroup, {
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
            color: "primary",
            disabled: !goUnder,
            onClick: () => setState(Object.assign({}, state, {
              goUnder: false
            })),
            children: "Full Level"
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
            color: "primary",
            disabled: goUnder,
            onClick: () => setState(Object.assign({}, state, {
              goUnder: true
            })),
            children: "Don't fully level"
          })]
        })
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
        container: true,
        spacing: 1,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
              children: "This calculator tries to calculate the amount of exp books required to get to the next milestone level. "
            }), goUnder ? "It will try to get as close to the milestone level as possible, so you can grind the rest of the exp without any waste." : "It will try to calculate the amount of books needed to minimize as much exp loss as possible."]
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 6,
          md: 3,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ButtonGroup, {
            sx: {
              display: "flex"
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TextButton/* default */.Z, {
              children: "Current Level"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* CustomNumberInputButtonGroupWrapper */.CC, {
              sx: {
                flexBasis: 30,
                flexGrow: 1
              },
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
                value: level,
                onChange: val => setState(Object.assign({}, state, {
                  level: (0,Util/* clamp */.uZ)(val, 0, 90)
                })),
                sx: {
                  px: 2
                }
              })
            })]
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 6,
          md: 3,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ButtonGroup, {
            sx: {
              display: "flex"
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TextButton/* default */.Z, {
              children: "Current EXP."
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* CustomNumberInputButtonGroupWrapper */.CC, {
              sx: {
                flexBasis: 30,
                flexGrow: 1
              },
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
                value: curExp,
                onChange: val => setState(Object.assign({}, state, {
                  curExp: (0,Util/* clamp */.uZ)(val, 0, (levelExp[level] || 1) - 1)
                })),
                endAdornment: `/${levelExp[level] || 0}`,
                sx: {
                  px: 2
                }
              })
            })]
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 6,
          md: 3,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              sx: {
                p: 1,
                display: "flex",
                justifyContent: "space-between"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: "Next Milestone Level:"
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                  children: milestoneLvl
                })
              })]
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 6,
          md: 3,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              sx: {
                p: 1,
                display: "flex",
                justifyContent: "space-between"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: "EXP. to milestone:"
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: expFromBooks
                  }), " / ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: expReq
                  })]
                })
              })]
            })
          })
        }), Object.entries(books).map(([bookKey]) => {
          return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
            item: true,
            xs: 12,
            md: 4,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BookDisplay, {
              bookKey: bookKey,
              value: books[bookKey],
              setValue: b => setState(Object.assign({}, state, {
                books: Object.assign({}, books, {
                  [bookKey]: b
                })
              })),
              required: bookResultObj[bookKey]
            })
          }, bookKey);
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 12,
          md: 4,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ButtonGroup, {
            sx: {
              display: "flex"
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TextButton/* default */.Z, {
              children: "Current Mora"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* CustomNumberInputButtonGroupWrapper */.CC, {
              sx: {
                flexBasis: 30,
                flexGrow: 1
              },
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
                value: mora,
                onChange: val => setState(Object.assign({}, state, {
                  mora: Math.max(val != null ? val : 0, 0)
                })),
                sx: {
                  px: 2
                }
              })
            })]
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 12,
          md: 4,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              sx: {
                p: 1,
                display: "flex",
                justifyContent: "space-between"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: "Mora Cost: "
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                  children: moraCost
                })
              })]
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 12,
          md: 4,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              sx: {
                p: 1,
                display: "flex",
                justifyContent: "space-between"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
                children: ["EXP ", !goUnder ? "Waste" : "Diff", ": "]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                    color: expDiff < 0 ? `error` : `success`,
                    children: expDiff
                  })
                })
              })]
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 12,
          md: 4,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              sx: {
                p: 1,
                display: "flex",
                justifyContent: "space-between"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: "Final Mora: "
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                    color: finalMora < 0 ? `error` : `success`,
                    children: finalMora
                  })
                })
              })]
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 12,
          md: 4,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              sx: {
                p: 1,
                display: "flex",
                justifyContent: "space-between"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: "Final Level: "
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                    color: "success",
                    children: finalLvl
                  })
                })
              })]
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 12,
          md: 4,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              sx: {
                p: 1,
                display: "flex",
                justifyContent: "space-between"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: "Final EXP: "
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                    color: finalExp < 0 ? `error` : `success`,
                    children: finalExp
                  })
                })
              })]
            })
          })
        })]
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        py: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
        container: true,
        spacing: 2,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          flexGrow: 1,
          children: !!invalidText && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Alert, {
            variant: "filled",
            severity: "error",
            children: invalidText
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: "auto",
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
            disabled: !!invalidText,
            onClick: () => setState(Object.assign({}, state, {
              level: finalLvl,
              curExp: finalExp,
              books: (0,Util/* objectMap */.xh)(bookResultObj, (val, bookKey) => books[bookKey] - val),
              mora: finalMora
            })),
            color: "success",
            startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Check */.JrY, {}),
            sx: {
              height: "100%"
            },
            children: "Apply"
          })
        })]
      })
    })]
  });
}
function BookDisplay(props) {
  const {
    bookKey,
    value = 0,
    setValue,
    required = 0
  } = props;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        py: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        children: booksData[bookKey].name
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
        container: true,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 3,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgFullwidth/* default */.Z, {
            src: booksData[bookKey].img
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
          item: true,
          xs: 9,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ButtonGroup, {
            sx: {
              display: "flex"
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TextButton/* default */.Z, {
              children: "Amount"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* CustomNumberInputButtonGroupWrapper */.CC, {
              sx: {
                flexBasis: 30,
                flexGrow: 1
              },
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
                value: value,
                onChange: val => setValue(Math.max(val != null ? val : 0, 0)),
                sx: {
                  px: 2
                }
              })
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              children: "Required:"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                  color: required ? "success" : "",
                  children: required
                })
              })
            })]
          })]
        })]
      })
    })]
  });
}
function calculateBooks(c20000, c5000, c1000, required, goUnder) {
  let current = goUnder ? Math.floor(required / 1000) : Math.ceil(required / 1000);
  const r20000 = Math.min(Math.floor(current / 20), c20000);
  current -= r20000 * 20;
  const r5000 = Math.min(Math.floor(current / 5), c5000);
  current -= r5000 * 5;
  const r1000 = Math.min(current, c1000);
  current -= r1000;
  if (goUnder || current === 0) return [r20000, r5000, r1000];else if (r5000 === 3 && r20000 !== c20000) return [r20000 + 1, 0, 0];else if (r5000 !== c5000) return [r20000, r5000 + 1, 0];else if (r20000 !== c20000) return [r20000 + 1, 0, 0];
  return null;
}
// EXTERNAL MODULE: ./src/app/PageTools/ResinCounter.tsx
var ResinCounter = __webpack_require__(181624);
// EXTERNAL MODULE: ./src/app/PageTools/TeyvatTime.tsx
var TeyvatTime = __webpack_require__(274133);
;// CONCATENATED MODULE: ./src/app/PageTools/index.tsx








function PageTools(props) {
  dist/* default.send */.ZP.send({
    hitType: "pageview",
    page: '/tools'
  });
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    my: 1,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TeyvatTime/* default */.ZP, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ResinCounter/* default */.ZP, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(EXPCalc, {})]
  });
}

/***/ })

}]);