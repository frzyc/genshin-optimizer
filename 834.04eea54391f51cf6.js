"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[834],{

/***/ 631834:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ ArtifactEditor)
});

// EXTERNAL MODULE: ../../libs/consts/src/index.ts
var src = __webpack_require__(682799);
// EXTERNAL MODULE: ../../libs/g-assets/src/index.ts + 1738 modules
var g_assets_src = __webpack_require__(918676);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/index.js
var icons_material = __webpack_require__(111084);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/Help.js
var Help = __webpack_require__(516549);
// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__(202784);
// EXTERNAL MODULE: ../../node_modules/react-i18next/dist/es/index.js + 17 modules
var es = __webpack_require__(732696);
// EXTERNAL MODULE: ../../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
var objectWithoutPropertiesLoose = __webpack_require__(998283);
// EXTERNAL MODULE: ./src/app/Types/consts.ts
var consts = __webpack_require__(736893);
// EXTERNAL MODULE: ./src/app/Components/DropdownMenu/DropdownButton.tsx
var DropdownButton = __webpack_require__(645475);
// EXTERNAL MODULE: ./src/app/Components/StarDisplay.tsx
var StarDisplay = __webpack_require__(871765);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/Components/Artifact/ArtifactRarityDropdown.tsx

let _ = t => t,
  _t;
const _excluded = ["rarity", "onChange", "filter"];






function ArtifactRarityDropdown(_ref) {
  let {
      rarity,
      onChange,
      filter
    } = _ref,
    props = (0,objectWithoutPropertiesLoose/* default */.Z)(_ref, _excluded);
  const {
    t
  } = (0,es/* useTranslation */.$G)("artifact");
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, Object.assign({}, props, {
    title: rarity ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarDisplay/* StarsDisplay */.q, {
      stars: rarity
    }) : t(_t || (_t = _`editor.rarity`)),
    color: rarity ? "success" : "primary",
    children: [5, 4, 3].map(rarity => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.MenuItem, {
      disabled: !filter(rarity),
      onClick: () => onChange(rarity),
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarDisplay/* StarsDisplay */.q, {
        stars: rarity
      })
    }, rarity))
  }));
}
// EXTERNAL MODULE: ./src/app/Components/Artifact/ArtifactSetAutocomplete.tsx
var ArtifactSetAutocomplete = __webpack_require__(617206);
// EXTERNAL MODULE: ./src/app/Components/Artifact/SlotIcon.tsx + 3 modules
var SlotIcon = __webpack_require__(815378);
;// CONCATENATED MODULE: ./src/app/Components/Artifact/ArtifactSlotDropdown.tsx

let ArtifactSlotDropdown_ = t => t,
  ArtifactSlotDropdown_t;
const ArtifactSlotDropdown_excluded = ["slotKey", "onChange", "hasUnselect"];








function ArtifactSlotDropdown(_ref) {
  let {
      slotKey = "",
      onChange,
      hasUnselect = false
    } = _ref,
    props = (0,objectWithoutPropertiesLoose/* default */.Z)(_ref, ArtifactSlotDropdown_excluded);
  const {
    t
  } = (0,es/* useTranslation */.$G)(["artifact", "ui"]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(DropdownButton/* default */.Z, Object.assign({
    title: slotKey ? t(`artifact:slotName:${slotKey}`) : t('artifact:slot'),
    color: slotKey ? "success" : "primary",
    startIcon: slotKey ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SlotIcon/* default */.Z, {
      slotKey: slotKey
    }) : undefined
  }, props, {
    children: [hasUnselect && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.MenuItem, {
      selected: slotKey === "",
      disabled: slotKey === "",
      onClick: () => onChange(""),
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.ListItemIcon, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Replay */.UHt, {})
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.ListItemText, {
        children: t(ArtifactSlotDropdown_t || (ArtifactSlotDropdown_t = ArtifactSlotDropdown_`ui:unselect`))
      })]
    }), hasUnselect && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), src/* allSlotKeys.map */.eV.map(key => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.MenuItem, {
      selected: slotKey === key,
      disabled: slotKey === key,
      onClick: () => onChange(key),
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.ListItemIcon, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SlotIcon/* default */.Z, {
          slotKey: key
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.ListItemText, {
        children: t(`artifact:slotName:${key}`)
      })]
    }, key))]
  }));
}
// EXTERNAL MODULE: ./src/app/Components/Card/CardDark.tsx
var CardDark = __webpack_require__(87985);
// EXTERNAL MODULE: ./src/app/Components/Card/CardLight.tsx
var CardLight = __webpack_require__(567937);
// EXTERNAL MODULE: ./src/app/Components/CloseButton.tsx
var CloseButton = __webpack_require__(672055);
;// CONCATENATED MODULE: ./src/app/Components/CustomNumberTextField.tsx

const CustomNumberTextField_excluded = ["value", "onChange", "disabled", "float"];



function CustomNumberTextField(_ref) {
  let {
      value,
      onChange,
      disabled = false,
      float = false
    } = _ref,
    props = (0,objectWithoutPropertiesLoose/* default */.Z)(_ref, CustomNumberTextField_excluded);
  const [state, setState] = (0,react.useState)("");
  const sendChange = (0,react.useCallback)(() => {
    if (state === "") return onChange(0);
    const parseFunc = float ? parseFloat : parseInt;
    onChange(parseFunc(state));
  }, [onChange, state, float]);
  (0,react.useEffect)(() => {
    var _value$toString;
    return setState((_value$toString = value == null ? void 0 : value.toString()) != null ? _value$toString : "");
  }, [value, setState]); // update value on value change

  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.TextField, Object.assign({
    value: state,
    "aria-label": "custom-input",
    type: "number",
    onChange: e => setState(e.target.value),
    onBlur: sendChange,
    disabled: disabled,
    onKeyDown: e => e.key === "Enter" && sendChange()
  }, props));
}
// EXTERNAL MODULE: ./src/app/Components/Image/ImgIcon.tsx
var ImgIcon = __webpack_require__(726578);
// EXTERNAL MODULE: ./src/app/Components/ModalWrapper.tsx
var ModalWrapper = __webpack_require__(898927);
// EXTERNAL MODULE: ./src/app/Components/StatDisplay.tsx
var StatDisplay = __webpack_require__(534612);
// EXTERNAL MODULE: ./src/app/Data/Artifacts/index.ts + 44 modules
var Artifacts = __webpack_require__(261420);
// EXTERNAL MODULE: ./src/app/Data/Artifacts/Artifact.ts + 2 modules
var Artifacts_Artifact = __webpack_require__(254878);
// EXTERNAL MODULE: ./src/app/Database/Database.ts + 11 modules
var Database = __webpack_require__(225870);
// EXTERNAL MODULE: ./src/app/Database/DataManagers/ArtifactData.ts
var ArtifactData = __webpack_require__(236999);
// EXTERNAL MODULE: ./src/app/KeyMap/index.tsx + 1 modules
var app_KeyMap = __webpack_require__(419807);
// EXTERNAL MODULE: ./src/app/KeyMap/StatIcon.tsx + 11 modules
var StatIcon = __webpack_require__(943397);
// EXTERNAL MODULE: ./src/app/ReactHooks/useForceUpdate.tsx
var useForceUpdate = __webpack_require__(536617);
;// CONCATENATED MODULE: ./src/app/ReactHooks/usePromise.tsx

/**
 *
 * @param promiseFunc
 * @param dependencies - Reloads the promise when any of the dependencies are changed. (Using useEffect dependency)
 * @param useOld - When the promises are updated, then there is a period of time before the new promise return. useOld uses the previous value without a undefined gap.
 * @returns
 */
function usePromise(promiseFunc, dependencies, useOld = true) {
  const [res, setRes] = (0,react.useState)(undefined);
  (0,react.useEffect)(() => {
    var _promiseFunc$then, _promiseFunc;
    let pending = true;
    //encapsulate `res` in an array `[res]`, because res can sometimes be a function, that can interfere with the `useState` api.
    (_promiseFunc$then = (_promiseFunc = promiseFunc()) == null ? void 0 : _promiseFunc.then(res => pending && setRes([res]), console.error)) != null ? _promiseFunc$then : setRes(undefined);
    return () => {
      pending = false;
      !useOld && setRes(undefined);
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
  return res == null ? void 0 : res[0];
}
// EXTERNAL MODULE: ./src/app/Types/artifact.ts
var Types_artifact = __webpack_require__(469190);
;// CONCATENATED MODULE: ./src/app/Data/Artifacts/artifact_sub_rolls_correction_gen.json
const artifact_sub_rolls_correction_gen_namespaceObject = JSON.parse('{"5":{"def_":{"24.0":"24.1"},"critRate_":{"8.5":"8.6","19.5":"19.4","23.0":"22.9"}}}');
;// CONCATENATED MODULE: ./src/app/Util/ArtifactUtil.ts







function randomizeArtifact(base = {}) {
  var _base$setKey, _base$rarity, _base$slotKey, _base$mainStatKey, _base$level;
  const setKey = (_base$setKey = base.setKey) != null ? _base$setKey : getRandomElementFromArray(allArtifactSets);
  const sheet = getArtSheet(setKey);
  const rarity = (_base$rarity = base.rarity) != null ? _base$rarity : getRandomElementFromArray(sheet.rarity);
  const slot = (_base$slotKey = base.slotKey) != null ? _base$slotKey : getRandomElementFromArray(sheet.slots);
  const mainStatKey = (_base$mainStatKey = base.mainStatKey) != null ? _base$mainStatKey : getRandomElementFromArray(Artifact.slotMainStats(slot));
  const level = (_base$level = base.level) != null ? _base$level : getRandomIntInclusive(0, rarity * 4);
  const substats = [0, 1, 2, 3].map(i => ({
    key: "",
    value: 0
  }));
  const {
    low,
    high
  } = Artifact.rollInfo(rarity);
  const totRolls = Math.floor(level / 4) + getRandomIntInclusive(low, high);
  const numOfInitialSubstats = Math.min(totRolls, 4);
  const numUpgradesOrUnlocks = totRolls - numOfInitialSubstats;
  const RollStat = substat => getRandomElementFromArray(Artifact.getSubstatRollData(substat, rarity));
  let remainingSubstats = allSubstatKeys.filter(key => mainStatKey !== key);
  for (const substat of substats.slice(0, numOfInitialSubstats)) {
    substat.key = getRandomElementFromArray(remainingSubstats);
    substat.value = RollStat(substat.key);
    remainingSubstats = remainingSubstats.filter(key => key !== substat.key);
  }
  for (let i = 0; i < numUpgradesOrUnlocks; i++) {
    const substat = getRandomElementFromArray(substats);
    substat.value += RollStat(substat.key);
  }
  for (const substat of substats) if (substat.key) {
    var _artifactSubstatRollC, _artifactSubstatRollC2, _artifactSubstatRollC3;
    const value = cacheValueString(substat.value, KeyMap.unit(substat.key));
    substat.value = parseFloat((_artifactSubstatRollC = (_artifactSubstatRollC2 = artifactSubstatRollCorrection[rarity]) == null ? void 0 : (_artifactSubstatRollC3 = _artifactSubstatRollC2[substat.key]) == null ? void 0 : _artifactSubstatRollC3[value]) != null ? _artifactSubstatRollC : value);
  }
  return {
    setKey,
    rarity,
    slotKey: slot,
    mainStatKey,
    level,
    substats,
    location: "",
    lock: false,
    exclude: false
  };
}
// EXTERNAL MODULE: ./src/app/Util/Util.ts
var Util = __webpack_require__(41015);
// EXTERNAL MODULE: ./src/app/PageArtifact/ArtifactCard.tsx
var ArtifactCard = __webpack_require__(485563);
// EXTERNAL MODULE: ./src/app/Components/InfoTooltip.tsx
var InfoTooltip = __webpack_require__(282334);
// EXTERNAL MODULE: ./src/app/Components/PercentBadge.tsx
var PercentBadge = __webpack_require__(945220);
;// CONCATENATED MODULE: ./src/app/PageArtifact/ArtifactEditor/Components/SubstatEfficiencyDisplayCard.tsx








function SubstatEfficiencyDisplayCard({
  efficiency,
  max = false,
  t,
  valid
}) {
  const eff = max ? "maxSubEff" : "curSubEff";
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
    sx: {
      py: 1,
      px: 2
    },
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
      container: true,
      spacing: 1,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        children: t(`editor.${eff}`)
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        flexGrow: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(InfoTooltip/* default */.Z, {
          title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              variant: "h6",
              children: t(`editor.${eff}`)
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                t: t,
                i18nKey: `editor.${eff}Desc`
              })
            })]
          })
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        xs: "auto",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PercentBadge/* default */.Z, {
          valid: valid,
          max: 900,
          value: valid ? efficiency : "ERR"
        })
      })]
    })
  });
}
// EXTERNAL MODULE: ./src/app/Components/CustomNumberInput.tsx
var CustomNumberInput = __webpack_require__(789343);
// EXTERNAL MODULE: ./src/app/Components/SqBadge.tsx
var SqBadge = __webpack_require__(783673);
// EXTERNAL MODULE: ./src/app/Components/TextButton.tsx
var TextButton = __webpack_require__(787051);
;// CONCATENATED MODULE: ./src/app/PageArtifact/ArtifactEditor/Components/SubstatInput.tsx
let SubstatInput_ = t => t,
  SubstatInput_t,
  _t2,
  _t3,
  _t4,
  _t5,
  _t6,
  _t7;
















function SubstatInput({
  index,
  artifact,
  setSubstat
}) {
  var _artifact$substats$in;
  const {
    t
  } = (0,es/* useTranslation */.$G)("artifact");
  const {
    mainStatKey = "",
    rarity = 5
  } = artifact != null ? artifact : {};
  const {
    key = "",
    value = 0,
    rolls = [],
    efficiency = 0
  } = (_artifact$substats$in = artifact == null ? void 0 : artifact.substats[index]) != null ? _artifact$substats$in : {};
  const accurateValue = rolls.reduce((a, b) => a + b, 0);
  const unit = app_KeyMap/* default.unit */.ZP.unit(key),
    rollNum = rolls.length;
  let error = "",
    rollData = [],
    allowedRolls = 0;
  if (artifact) {
    // Account for the rolls it will need to fill all 4 substates, +1 for its base roll
    const _rarity = artifact.rarity;
    const {
      numUpgrades,
      high
    } = Artifacts_Artifact/* default.rollInfo */.ZP.rollInfo(_rarity);
    const maxRollNum = numUpgrades + high - 3;
    allowedRolls = maxRollNum - rollNum;
    rollData = key ? Artifacts_Artifact/* default.getSubstatRollData */.ZP.getSubstatRollData(key, _rarity) : [];
  }
  const rollOffset = 7 - rollData.length;
  if (!rollNum && key && value) error = error || t(SubstatInput_t || (SubstatInput_t = SubstatInput_`editor.substat.error.noCalc`));
  if (allowedRolls < 0) error = error || t("editor.substat.error.noOverRoll", {
    value: allowedRolls + rollNum
  });
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
      sx: {
        display: "flex"
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ButtonGroup, {
        size: "small",
        sx: {
          width: "100%",
          display: "flex"
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(DropdownButton/* default */.Z, {
          startIcon: key ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* default */.C, {
            statKey: key
          }) : undefined,
          title: key ? app_KeyMap/* default.getArtStr */.ZP.getArtStr(key) : t('editor.substat.substatFormat', {
            value: index + 1
          }),
          disabled: !artifact,
          color: key ? "success" : "primary",
          sx: {
            whiteSpace: "nowrap"
          },
          children: [key && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.MenuItem, {
            onClick: () => setSubstat(index, {
              key: "",
              value: 0
            }),
            children: t(_t2 || (_t2 = SubstatInput_`editor.substat.noSubstat`))
          }), Types_artifact/* allSubstatKeys.filter */._.filter(key => mainStatKey !== key).map(k => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.MenuItem, {
            selected: key === k,
            disabled: key === k,
            onClick: () => setSubstat(index, {
              key: k,
              value: 0
            }),
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.ListItemIcon, {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* default */.C, {
                statKey: k
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.ListItemText, {
              children: app_KeyMap/* default.getArtStr */.ZP.getArtStr(k)
            })]
          }, k))]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* CustomNumberInputButtonGroupWrapper */.CC, {
          sx: {
            flexBasis: 30,
            flexGrow: 1
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
            float: unit === "%",
            placeholder: t(_t3 || (_t3 = SubstatInput_`editor.substat.selectSub`)),
            value: key ? value : undefined,
            onChange: value => setSubstat(index, {
              key,
              value: value != null ? value : 0
            }),
            disabled: !key,
            error: !!error,
            sx: {
              px: 1
            },
            inputProps: {
              sx: {
                textAlign: "right"
              }
            }
          })
        }), !!rollData.length && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TextButton/* default */.Z, {
          children: t(_t4 || (_t4 = SubstatInput_`editor.substat.nextRolls`))
        }), rollData.map((v, i) => {
          var _artifactSubstatRollC, _artifactSubstatRollC2, _artifactSubstatRollC3;
          let newValue = (0,app_KeyMap/* cacheValueString */.qs)(accurateValue + v, unit);
          newValue = (_artifactSubstatRollC = (_artifactSubstatRollC2 = artifact_sub_rolls_correction_gen_namespaceObject[rarity]) == null ? void 0 : (_artifactSubstatRollC3 = _artifactSubstatRollC2[key]) == null ? void 0 : _artifactSubstatRollC3[newValue]) != null ? _artifactSubstatRollC : newValue;
          return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
            color: `roll${(0,Util/* clamp */.uZ)(rollOffset + i, 1, 6)}`,
            disabled: value && !rollNum || allowedRolls <= 0,
            onClick: () => setSubstat(index, {
              key,
              value: parseFloat(newValue)
            }),
            children: newValue
          }, i);
        })]
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
      sx: {
        p: 1
      },
      children: error ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        color: "error",
        children: t(_t5 || (_t5 = SubstatInput_`ui:error`))
      }) : (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
        container: true,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
            color: rollNum === 0 ? "secondary" : `roll${(0,Util/* clamp */.uZ)(rollNum, 1, 6)}`,
            children: rollNum ? t("editor.substat.RollCount", {
              count: rollNum
            }) : t(_t6 || (_t6 = SubstatInput_`editor.substat.noRoll`))
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          flexGrow: 1,
          children: !!rolls.length && [...rolls].sort().map((val, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
            component: "span",
            color: `roll${(0,Util/* clamp */.uZ)(rollOffset + rollData.indexOf(val), 1, 6)}.main`,
            sx: {
              ml: 1
            },
            children: (0,app_KeyMap/* cacheValueString */.qs)(val, unit)
          }, `${i}.${val}`))
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: "auto",
          flexShrink: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
              t: t,
              i18nKey: "editor.substat.eff",
              color: "text.secondary",
              children: ["Efficiency: ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PercentBadge/* default */.Z, {
                valid: true,
                max: rollNum * 100,
                value: efficiency ? efficiency : t(_t7 || (_t7 = SubstatInput_`editor.substat.noStat`))
              })]
            })
          })
        })]
      })
    })]
  });
}
;// CONCATENATED MODULE: ./src/app/PageArtifact/ArtifactEditor/Components/imgs/scan_art_main.png
/* harmony default export */ const scan_art_main = (__webpack_require__.p + "scan_art_main.66f01e51a69c518e4278.png");
;// CONCATENATED MODULE: ./src/app/PageArtifact/ArtifactEditor/Components/imgs/snippet.png
/* harmony default export */ const snippet = (__webpack_require__.p + "snippet.d223e79704fd95bcb783.png");
;// CONCATENATED MODULE: ./src/app/PageArtifact/ArtifactEditor/Components/UploadExplainationModal.tsx








function UploadExplainationModal({
  modalShow,
  hide
}) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
    open: modalShow,
    onClose: hide,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
        sx: {
          py: 1
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
          container: true,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
            item: true,
            flexGrow: 1,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              variant: "subtitle1",
              children: "How do Upload Screenshots for parsing"
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
            item: true,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
              onClick: hide
            })
          })]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Alert, {
          variant: "outlined",
          severity: "warning",
          children: ["NOTE: Artifact Scanning currently only work for ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: "ENGLISH"
          }), " artifacts."]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
          container: true,
          spacing: 1,
          mt: 1,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
            item: true,
            xs: 8,
            md: 4,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
              component: "img",
              alt: "snippet of the screen to take",
              src: snippet,
              width: "100%",
              height: "auto"
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
            item: true,
            xs: 12,
            md: 8,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: "Using screenshots can dramatically decrease the amount of time you manually input in stats on the Genshin Optimizer."
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              variant: "h5",
              children: "Where to snip the screenshot."
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              gutterBottom: true,
              children: ["In game, Open your bag, and navigate to the artifacts tab. Select the artifact you want to scan with Genshin Optimizer. ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                children: "Only artifact from this screen can be scanned."
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              variant: "h6",
              children: "Single artifact"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              gutterBottom: true,
              children: ["To take a screenshot, in Windows, the shortcut is ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                children: "Shift + WindowsKey + S"
              }), ". Once you selected the region, the image is automatically included in your clipboard."]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              variant: "h6",
              children: "Multiple artifacts"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              gutterBottom: true,
              children: ["To take advantage of batch uploads, you can use a tool like ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("a", {
                href: "https://picpick.app/",
                target: "_blank",
                rel: "noreferrer",
                children: "PicPick"
              }), " to create a macro to easily to screenshot a region to screenshot multiple artifacts at once."]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              variant: "h5",
              children: "What to include in the screenshot."
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              children: "As shown in the Image, starting from the top with the artifact name, all the way to the set name(the text in green). "
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
            item: true,
            xs: 12,
            md: 7,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              variant: "h5",
              children: "Adding Screenshot to Genshin Optimizer"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              children: "At this point, you should have the artifact snippet either saved to your harddrive, or in your clipboard."
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: "You can click on the box next to \"Browse\" to browse the files in your harddrive for multiple screenshots."
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              children: ["For single screenshots from the snippets, just press ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                children: "Ctrl + V"
              }), " to paste from your clipboard."]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              gutterBottom: true,
              children: ["You should be able to see a Preview of your artifact snippet, and after waiting a few seconds, the artifact set and the substats will be filled in in the ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                children: "Artifact Editor"
              }), "."]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              variant: "h5",
              children: "Finishing the Artifact"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              children: ["Unfortunately, computer vision is not 100%. There will always be cases where something is not scanned properly. You should always double check the scanned artifact values! Once the artifact has been filled, Click on ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                children: "Add Artifact"
              }), " to finish editing the artifact."]
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
            item: true,
            xs: 8,
            md: 5,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
              component: "img",
              alt: "main screen after importing stats",
              src: scan_art_main,
              width: "100%",
              height: "auto"
            })
          })]
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
        sx: {
          py: 1
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
          large: true,
          onClick: hide
        })
      })]
    })
  });
}
// EXTERNAL MODULE: ../../node_modules/tesseract.js/src/index.js
var tesseract_js_src = __webpack_require__(424370);
// EXTERNAL MODULE: ./src/app/Components/ColoredText.tsx
var ColoredText = __webpack_require__(402344);
;// CONCATENATED MODULE: ./src/app/PageArtifact/BorrowManager.ts
class BorrowManager {
  constructor(init, deinit) {
    this.data = {};
    this.init = void 0;
    this.deinit = void 0;
    this.init = init;
    this.deinit = deinit;
  }

  /**
   * Borrow the object corresponding to `key`, creating the object as necessary.
   * The borrowing ends when `callback`'s promise is fulfilled.
   * When the last borrowing ends, `deinit` the object.
   *
   * Do not use `arg` after the `callback`'s promise is fulfilled.
   */
  async borrow(key, callback) {
    if (!this.data[key]) {
      this.data[key] = {
        value: this.init(key),
        refCount: 0
      };
    }
    const box = this.data[key];
    box.refCount += 1;
    const result = await callback(box.value);
    box.refCount -= 1;
    if (!box.refCount) {
      // Last user. Cleaning up
      delete this.data[key];
      this.deinit(key, box.value);
    }
    return result;
  }
}
;// CONCATENATED MODULE: ./src/app/PageArtifact/ScanningUtil.tsx













const starColor = {
  r: 255,
  g: 204,
  b: 50
}; //#FFCC32
const workerCount = 2;
const schedulers = new BorrowManager(async language => {
  const scheduler = (0,tesseract_js_src.createScheduler)();
  const promises = Array(workerCount).fill(0).map(async _ => {
    const worker = await (0,tesseract_js_src.createWorker)({
      errorHandler: console.error
    });
    await worker.load();
    await worker.loadLanguage(language);
    await worker.initialize(language);
    scheduler.addWorker(worker);
  });
  await Promise.any(promises);
  return scheduler;
}, (_language, value) => {
  value.then(value => value.terminate());
});
// RGB
const queueReducer = (queue, message) => {
  switch (message.type) {
    case "upload":
      return {
        processed: queue.processed,
        outstanding: [...queue.outstanding, ...message.files]
      };
    case "processing":
      // Processing `outstanding` head. Refresh
      return {
        processed: queue.processed,
        outstanding: [...queue.outstanding]
      };
    case "processed":
      if (queue.outstanding[0].file === message.file) return {
        processed: [...queue.processed, message.result],
        outstanding: queue.outstanding.slice(1)
      };
      return queue;
    // Not in the list, ignored
    case "pop":
      return {
        processed: queue.processed.slice(1),
        outstanding: queue.outstanding
      };
    case "clear":
      return {
        processed: [],
        outstanding: []
      };
  }
};
function processEntry(entry) {
  if (entry.result) return;
  const {
    file,
    fileName
  } = entry;
  entry.imageURL = fileToURL(file);
  entry.result = entry.imageURL.then(async imageURL => {
    const ocrResult = await ocr(imageURL);
    const [artifact, texts] = findBestArtifact(ocrResult.rarities, parseSetKeys(ocrResult.artifactSetTexts), parseSlotKeys(ocrResult.whiteTexts), parseSubstats(ocrResult.substatTexts), parseMainStatKeys(ocrResult.whiteTexts), parseMainStatValues(ocrResult.whiteTexts));
    return {
      file,
      result: {
        fileName,
        imageURL,
        artifact,
        texts
      }
    };
  });
}
const fileToURL = file => new Promise(resolve => {
  const reader = new FileReader();
  reader.onloadend = ({
    target
  }) => resolve(target.result);
  reader.readAsDataURL(file);
});
const urlToImageData = urlFile => new Promise(resolve => {
  const img = new Image();
  img.onload = ({
    target
  }) => resolve(imageToImageData(target));
  img.src = urlFile;
});
function imageToImageData(image) {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0, image.width, image.height);
  return context.getImageData(0, 0, image.width, image.height); // TODO: May be undefined
}

function imageDataToCanvas(imageData) {
  // create off-screen canvas element
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  // update canvas with new data
  canvas.getContext('2d').putImageData(imageData, 0, 0);
  return canvas; // produces a PNG file
}

async function ocr(imageURL) {
  const imageData = await urlToImageData(imageURL);
  const width = imageData.width,
    halfHeight = Math.floor(imageData.height / 2);
  const bottomOpts = {
    rectangle: {
      top: halfHeight,
      left: 0,
      width,
      height: halfHeight
    }
  };
  const awaits = [textsFromImage(bandPass(imageData, [140, 140, 140], [255, 255, 255], {
    mode: "bw",
    region: "top"
  })),
  // slotkey, mainStatValue, level
  textsFromImage(bandPass(imageData, [30, 50, 80], [160, 160, 160], {
    region: "bot"
  }), bottomOpts),
  // substats
  textsFromImage(bandPass(imageData, [30, 160, 30], [200, 255, 200], {
    mode: "bw",
    region: "bot"
  }), bottomOpts) // artifact set, look for greenish texts
  ];

  const rarities = parseRarities(imageData.data, imageData.width, imageData.height);
  const [whiteTexts, substatTexts, artifactSetTexts] = await Promise.all(awaits);
  return {
    whiteTexts,
    substatTexts,
    artifactSetTexts,
    rarities
  };
}
async function textsFromImage(imageData, options = undefined) {
  const canvas = imageDataToCanvas(imageData);
  const rec = await schedulers.borrow("eng", async scheduler => await (await scheduler).addJob("recognize", canvas, options));
  return rec.data.lines.map(line => line.text);
}
function findBestArtifact(rarities, textSetKeys, slotKeys, substats, mainStatKeys, mainStatValues) {
  // const relevantSetKey = [...new Set<ArtifactSetKey>([...textSetKeys, "Adventurer", "ArchaicPetra"])]
  // TODO: restore
  const relevantSetKey = [...new Set([...textSetKeys, "EmblemOfSeveredFate"])];
  let bestScore = -1,
    bestArtifacts = [{
      // setKey: "Adventurer", rarity: 3, level: 0, slotKey: "flower", mainStatKey: "hp", substats: [],
      // TODO: restore
      setKey: "EmblemOfSeveredFate",
      rarity: 3,
      level: 0,
      slotKey: "flower",
      mainStatKey: "hp",
      substats: [],
      location: "",
      lock: false,
      exclude: false
    }];

  // Rate each rarity
  const rarityRates = (0,Util/* objectKeyMap */.O)(consts/* allArtifactRarities */.En, rarity => {
    let score = 0;
    if (textSetKeys.size) {
      const count = [...textSetKeys].reduce((count, set) => count + ((0,Artifacts/* getArtSheet */.Sk)(set).rarity.includes(rarity) ? 1 : 0), 0);
      score += count / textSetKeys.size;
    }
    if (substats.length) {
      const count = substats.reduce((count, substat) => count + (Artifacts_Artifact/* default.getSubstatRolls */.ZP.getSubstatRolls(substat.key, substat.value, rarity).length ? 1 : 0), 0);
      score += count / substats.length * 2;
    }
    return score;
  });

  // Test all *probable* combinations
  for (const slotKey of src/* allSlotKeys */.eV) {
    for (const mainStatKey of Artifacts_Artifact/* default.slotMainStats */.ZP.slotMainStats(slotKey)) {
      const mainStatScore = (slotKeys.has(slotKey) ? 1 : 0) + (mainStatKeys.has(mainStatKey) ? 1 : 0);
      const relevantMainStatValues = mainStatValues.filter(value => value.unit !== "%" || app_KeyMap/* default.unit */.ZP.unit(mainStatKey) === "%") // Ignore "%" text if key isn't "%"
      .map(value => value.mainStatValue);
      for (const [rarityString, rarityIndividualScore] of Object.entries(rarityRates)) {
        const rarity = parseInt(rarityString);
        const setKeys = relevantSetKey.filter(setKey => (0,Artifacts/* getArtSheet */.Sk)(setKey).rarity.includes(rarity));
        const rarityScore = mainStatScore + rarityIndividualScore;
        if (rarityScore + 2 < bestScore) continue; // Early bail out

        for (const minimumMainStatValue of relevantMainStatValues) {
          const values = Artifacts_Artifact/* default.mainStatValues */.ZP.mainStatValues(rarity, mainStatKey);
          const level = Math.max(0, values.findIndex(level => level >= minimumMainStatValue));
          const mainStatVal = values[level];
          const mainStatValScore = rarityScore + (mainStatVal === minimumMainStatValue ? 1 : 0);
          for (const setKey of setKeys) {
            const score = mainStatValScore + (textSetKeys.has(setKey) ? 1 : 0);
            if (score >= bestScore) {
              if (score > bestScore) bestArtifacts = [];
              bestScore = score;
              bestArtifacts.push({
                setKey,
                rarity,
                level,
                slotKey,
                mainStatKey,
                substats: [],
                location: "",
                lock: false,
                exclude: false
              });
            }
          }
        }
        if (rarityScore >= bestScore) {
          const level = 0;
          for (const setKey of setKeys) {
            const score = rarityScore + (textSetKeys.has(setKey) ? 1 : 0);
            if (score > bestScore) bestArtifacts = [];
            bestScore = score;
            bestArtifacts.push({
              setKey,
              rarity,
              level,
              slotKey,
              mainStatKey,
              substats: [],
              location: "",
              lock: false,
              exclude: false
            });
          }
        }
      }
    }
  }
  const texts = {};
  const chosen = {
    setKey: new Set(),
    rarity: new Set(),
    level: new Set(),
    slotKey: new Set(),
    mainStatKey: new Set(),
    mainStatVal: new Set()
  };
  const result = bestArtifacts[0],
    resultMainStatVal = Artifacts_Artifact/* default.mainStatValue */.ZP.mainStatValue(result.mainStatKey, result.rarity, result.level);
  result.substats = substats.filter((substat, i) => substat.key !== result.mainStatKey && substats.slice(0, i).every(other => other.key !== substat.key));
  for (let i = result.substats.length; i < 4; i++) result.substats.push({
    key: "",
    value: 0
  });
  for (const other of bestArtifacts) {
    chosen.setKey.add(other.setKey);
    chosen.rarity.add(other.rarity);
    chosen.level.add(other.level);
    chosen.slotKey.add(other.slotKey);
    chosen.mainStatKey.add(other.mainStatKey);
  }
  function unknownText(value, name, text) {
    return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
      children: ["Unknown ", name, " : Set to ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
        color: "error",
        children: text(value)
      })]
    });
  }
  function ambiguousText(value, available, name, text) {
    return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
      children: ["Ambiguous ", name, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
        color: "error",
        children: text(value)
      }), " : May also be ", available.filter(v => v !== value).map((value, index) => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
          children: index > 0 ? "/" : ""
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
          color: "warning",
          children: text(value)
        })]
      }))]
    });
  }
  function detectedText(value, name, text) {
    return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
      children: ["Detected ", name, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
        color: "success",
        children: text(value)
      })]
    });
  }
  function inferredText(value, name, text) {
    return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
      children: ["Inferred ", name, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
        color: "warning",
        children: text(value)
      })]
    });
  }
  function addText(key, available, name, text) {
    const recommended = new Set([...chosen[key]].filter(value => available.has(value)));
    if (recommended.size > 1) texts[key] = ambiguousText(result[key], [...available], name, text);else if (recommended.size === 1) texts[key] = detectedText(result[key], name, text);else if (chosen[key].size > 1) texts[key] = unknownText(result[key], name, text);else texts[key] = inferredText(result[key], name, text);
  }
  addText("setKey", textSetKeys, "Set", value => (0,Artifacts/* getArtSheet */.Sk)(value).name);
  addText("rarity", rarities, "Rarity", value => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [value, " ", value !== 1 ? "Stars" : "Star"]
  }));
  addText("slotKey", slotKeys, "Slot", value => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: Artifacts_Artifact/* default.slotName */.ZP.slotName(value)
  }));
  addText("mainStatKey", mainStatKeys, "Main Stat", value => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: app_KeyMap/* default.getStr */.ZP.getStr(value)
  }));
  texts.substats = (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: result.substats.filter(substat => substat.key !== "").map((substat, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
      children: detectedText(substat, "Sub Stat", value => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
        children: [app_KeyMap/* default.getStr */.ZP.getStr(value.key), "+", (0,app_KeyMap/* cacheValueString */.qs)(value.value, app_KeyMap/* default.unit */.ZP.unit(value.key)), app_KeyMap/* default.unit */.ZP.unit(value.key)]
      }))
    }, i))
  });
  const valueStrFunc = value => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,app_KeyMap/* cacheValueString */.qs)(value, app_KeyMap/* default.unit */.ZP.unit(result.mainStatKey)), app_KeyMap/* default.unit */.ZP.unit(result.mainStatKey)]
  });
  if (mainStatValues.find(value => value.mainStatValue === resultMainStatVal)) {
    if (mainStatKeys.has(result.mainStatKey)) {
      texts.level = detectedText(result.level, "Level", value => "+" + value);
      texts.mainStatVal = detectedText(resultMainStatVal, "Main Stat value", valueStrFunc);
    } else {
      texts.level = inferredText(result.level, "Level", value => "+" + value);
      texts.mainStatVal = inferredText(resultMainStatVal, "Main Stat value", valueStrFunc);
    }
  } else {
    texts.level = unknownText(result.level, "Level", value => "+" + value);
    texts.mainStatVal = unknownText(resultMainStatVal, "Main Stat value", valueStrFunc);
  }
  return [result, texts];
}
function parseSetKeys(texts) {
  const results = new Set([]);
  for (const text of texts) for (const key of src/* allArtifactSets */.q2) if ((0,Util/* hammingDistance */.UX)(text.replace(/\W/g, ''), (0,Artifacts/* getArtSheet */.Sk)(key).nameRaw.replace(/\W/g, '')) <= 2) results.add(key);
  return results;
}
function parseRarities(pixels, width, height) {
  const d = pixels;
  let lastRowNum = 0,
    rowsWithNumber = 0;
  const results = new Set([]);
  for (let y = 0; y < height; y++) {
    let star = 0,
      onStar = false;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      if (colorCloseEnough({
        r,
        g,
        b
      }, starColor)) {
        if (!onStar) {
          onStar = true;
          star++;
        }
      } else {
        onStar = false;
      }
    }
    if (lastRowNum !== star) {
      lastRowNum = star;
      rowsWithNumber = 1;
    } else if (lastRowNum) {
      rowsWithNumber++;
      if (rowsWithNumber >= 10) results.add((0,Util/* clamp */.uZ)(lastRowNum, 3, 5));
    }
  }
  return results;
}
function colorCloseEnough(color1, color2, threshold = 5) {
  const intCloseEnough = (a, b) => Math.abs(a - b) <= threshold;
  return intCloseEnough(color1.r, color2.r) && intCloseEnough(color1.g, color2.g) && intCloseEnough(color1.b, color2.b);
}
function parseSlotKeys(texts) {
  const results = new Set();
  for (const text of texts) for (const key of src/* allSlotKeys */.eV) if ((0,Util/* hammingDistance */.UX)(text.replace(/\W/g, ''), Artifacts_Artifact/* default.slotName */.ZP.slotName(key).replace(/\W/g, '')) <= 2) results.add(key);
  return results;
}
function parseMainStatKeys(texts) {
  const results = new Set([]);
  for (const text of texts) for (const key of Types_artifact/* allMainStatKeys */.r) {
    var _KeyMap$getStr$toLowe, _KeyMap$getStr, _KeyMap$getStr2;
    if (text.toLowerCase().includes((_KeyMap$getStr$toLowe = (_KeyMap$getStr = app_KeyMap/* default.getStr */.ZP.getStr(key)) == null ? void 0 : _KeyMap$getStr.toLowerCase()) != null ? _KeyMap$getStr$toLowe : "")) results.add(key);
    //use fuzzy compare on the ... Bonus texts. heal_ is included.
    if (key.includes("_bonu") && (0,Util/* hammingDistance */.UX)(text.replace(/\W/g, ''), ((_KeyMap$getStr2 = app_KeyMap/* default.getStr */.ZP.getStr(key)) != null ? _KeyMap$getStr2 : "").replace(/\W/g, '')) <= 1) results.add(key);
  }
  return results;
}
function parseMainStatValues(texts) {
  const results = [];
  for (const text of texts) {
    let regex = /(\d+[,|\\.]+\d)%/;
    let match = regex.exec(text);
    if (match) results.push({
      mainStatValue: parseFloat(match[1].replace(/,/g, ".").replace(/\.{2,}/g, ".")),
      unit: "%"
    });
    regex = /(\d+[,|\\.]\d{3}|\d{2,3})/;
    match = regex.exec(text);
    if (match) results.push({
      mainStatValue: parseInt(match[1].replace(/[,|\\.]+/g, ""))
    });
  }
  return results;
}
function parseSubstats(texts) {
  const matches = [];
  for (let text of texts) {
    text = text.replace(/^[\W]+/, "").replace(/\n/, "");
    //parse substats
    Types_artifact/* allSubstatKeys.forEach */._.forEach(key => {
      const name = app_KeyMap/* default.getStr */.ZP.getStr(key);
      const regex = app_KeyMap/* default.unit */.ZP.unit(key) === "%" ? new RegExp(name + "\\s*\\+\\s*(\\d+[\\.|,]+\\d)%", "im") : new RegExp(name + "\\s*\\+\\s*(\\d+,\\d+|\\d+)($|\\s)", "im");
      const match = regex.exec(text);
      if (match) matches.push({
        key,
        value: parseFloat(match[1].replace(/,/g, ".").replace(/\.{2,}/g, "."))
      });
    });
  }
  return matches.slice(0, 4);
}
function bandPass(pixelData, color1, color2, options) {
  const {
    region = "all",
    mode = "color"
  } = options;
  const d = Uint8ClampedArray.from(pixelData.data);
  const top = region === "top",
    bot = region === "bot",
    all = region === "all";
  const bw = mode === "bw",
    invert = mode === "invert";
  const halfInd = Math.floor(pixelData.width * (pixelData.height / 2) * 4);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    if ((all || top && i < halfInd || bot && i > halfInd) && r >= color1[0] && r <= color2[0] && g >= color1[1] && g <= color2[1] && b >= color1[2] && b <= color2[2]) {
      if (bw) d[i] = d[i + 1] = d[i + 2] = 0;else if (invert) {
        d[i] = 255 - r;
        d[i + 1] = 255 - g;
        d[i + 2] = 255 - b;
      } // else orignal color
    } else {
      d[i] = d[i + 1] = d[i + 2] = 255;
    }
  }
  return new ImageData(d, pixelData.width, pixelData.height);
}
;// CONCATENATED MODULE: ./src/app/PageArtifact/ArtifactEditor.tsx
let ArtifactEditor_ = t => t,
  ArtifactEditor_t,
  ArtifactEditor_t2,
  ArtifactEditor_t3,
  ArtifactEditor_t4,
  ArtifactEditor_t5,
  ArtifactEditor_t6,
  ArtifactEditor_t7,
  _t8,
  _t9,
  _t10,
  _t11,
  _t12,
  _t13;




































const maxProcessingCount = 3,
  maxProcessedCount = 16;
const allSubstatFilter = new Set(Types_artifact/* allSubstatKeys */._);
function artifactReducer(state, action) {
  switch (action.type) {
    case "reset":
      return;
    case "substat":
      {
        const {
          index,
          substat
        } = action;
        const oldIndex = substat.key ? state.substats.findIndex(current => current.key === substat.key) : -1;
        if (oldIndex === -1 || oldIndex === index) state.substats[index] = substat;else
          // Already in used, swap the items instead
          [state.substats[index], state.substats[oldIndex]] = [state.substats[oldIndex], state.substats[index]];
        return Object.assign({}, state);
      }
    case "overwrite":
      return action.artifact;
    case "update":
      return Object.assign({}, state, action.artifact);
  }
}
const InputInvis = (0,node.styled)('input')({
  display: 'none'
});
function ArtifactEditor({
  artifactIdToEdit = "",
  cancelEdit,
  allowUpload = false,
  allowEmpty = false,
  disableSet = false,
  disableSlot = false
}) {
  var _firstProcessed$image, _artifact$setKey;
  const {
    t
  } = (0,es/* useTranslation */.$G)("artifact");
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [show, setShow] = (0,react.useState)(false);
  const [dirtyDatabase, setDirtyDatabase] = (0,useForceUpdate/* default */.Z)();
  (0,react.useEffect)(() => database.arts.followAny(setDirtyDatabase), [database, setDirtyDatabase]);
  const [editorArtifact, artifactDispatch] = (0,react.useReducer)(artifactReducer, undefined);
  const artifact = (0,react.useMemo)(() => editorArtifact && (0,ArtifactData/* validateArtifact */.BG)(editorArtifact), [editorArtifact]);
  const [modalShow, setModalShow] = (0,react.useState)(false);
  const [{
    processed,
    outstanding
  }, dispatchQueue] = (0,react.useReducer)(queueReducer, {
    processed: [],
    outstanding: []
  });
  const firstProcessed = processed[0];
  const firstOutstanding = outstanding[0];
  const processingImageURL = usePromise(() => firstOutstanding == null ? void 0 : firstOutstanding.imageURL, [firstOutstanding == null ? void 0 : firstOutstanding.imageURL]);
  const processingResult = usePromise(() => firstOutstanding == null ? void 0 : firstOutstanding.result, [firstOutstanding == null ? void 0 : firstOutstanding.result]);
  const remaining = processed.length + outstanding.length;
  const image = (_firstProcessed$image = firstProcessed == null ? void 0 : firstProcessed.imageURL) != null ? _firstProcessed$image : processingImageURL;
  const {
    artifact: artifactProcessed,
    texts
  } = firstProcessed != null ? firstProcessed : {};
  // const fileName = firstProcessed?.fileName ?? firstOutstanding?.fileName ?? "Click here to upload Artifact screenshot files"

  const disableEditSlot = !!(artifact != null && artifact.location) || disableSlot;
  (0,react.useEffect)(() => {
    if (!artifact && artifactProcessed) artifactDispatch({
      type: "overwrite",
      artifact: artifactProcessed
    });
  }, [artifact, artifactProcessed, artifactDispatch]);
  (0,react.useEffect)(() => {
    const numProcessing = Math.min(maxProcessedCount - processed.length, maxProcessingCount, outstanding.length);
    const processingCurrent = numProcessing && !outstanding[0].result;
    outstanding.slice(0, numProcessing).forEach(processEntry);
    if (processingCurrent) dispatchQueue({
      type: "processing"
    });
  }, [processed.length, outstanding]);
  (0,react.useEffect)(() => {
    if (processingResult) dispatchQueue(Object.assign({
      type: "processed"
    }, processingResult));
  }, [processingResult, dispatchQueue]);
  const uploadFiles = (0,react.useCallback)(files => {
    if (!files) return;
    setShow(true);
    dispatchQueue({
      type: "upload",
      files: Array.from(files).map(file => ({
        file,
        fileName: file.name
      }))
    });
  }, [dispatchQueue, setShow]);
  const clearQueue = (0,react.useCallback)(() => dispatchQueue({
    type: "clear"
  }), [dispatchQueue]);
  (0,react.useEffect)(() => {
    const pasteFunc = e => {
      var _clipboardData;
      return uploadFiles((_clipboardData = e.clipboardData) == null ? void 0 : _clipboardData.files);
    };
    allowUpload && window.addEventListener('paste', pasteFunc);
    return () => {
      if (allowUpload) window.removeEventListener('paste', pasteFunc);
    };
  }, [uploadFiles, allowUpload]);
  const onUpload = (0,react.useCallback)(e => {
    if (!e.target) return;
    uploadFiles(e.target.files);
    e.target.value = ""; // reset the value so the same file can be uploaded again...
  }, [uploadFiles]);
  const {
    old,
    oldType
  } = (0,react.useMemo)(() => {
    var _duplicated$;
    const databaseArtifact = dirtyDatabase && artifactIdToEdit && database.arts.get(artifactIdToEdit);
    if (databaseArtifact) return {
      old: databaseArtifact,
      oldType: "edit"
    };
    if (artifact === undefined) return {
      old: undefined,
      oldType: ""
    };
    const {
      duplicated,
      upgraded
    } = dirtyDatabase && database.arts.findDups(artifact);
    return {
      old: (_duplicated$ = duplicated[0]) != null ? _duplicated$ : upgraded[0],
      oldType: duplicated.length !== 0 ? "duplicate" : "upgrade"
    };
  }, [artifact, artifactIdToEdit, database, dirtyDatabase]);
  const {
    artifact: cArtifact,
    errors
  } = (0,react.useMemo)(() => {
    if (!artifact) return {
      artifact: undefined,
      errors: []
    };
    const validated = (0,ArtifactData/* cachedArtifact */.m1)(artifact, artifactIdToEdit);
    if (old) {
      validated.artifact.location = old.location;
      validated.artifact.exclude = old.exclude;
    }
    return validated;
  }, [artifact, artifactIdToEdit, old]);

  // Overwriting using a different function from `databaseArtifact` because `useMemo` does not
  // guarantee to trigger *only when* dependencies change, which is necessary in this case.
  (0,react.useEffect)(() => {
    if (artifactIdToEdit === "new") {
      setShow(true);
      artifactDispatch({
        type: "reset"
      });
    }
    const databaseArtifact = artifactIdToEdit && dirtyDatabase && database.arts.get(artifactIdToEdit);
    if (databaseArtifact) {
      setShow(true);
      artifactDispatch({
        type: "overwrite",
        artifact: (0,Util/* deepClone */.I8)(databaseArtifact)
      });
    }
  }, [artifactIdToEdit, database, dirtyDatabase]);
  const sheet = artifact ? (0,Artifacts/* getArtSheet */.Sk)(artifact.setKey) : undefined;
  const reset = (0,react.useCallback)(() => {
    cancelEdit == null ? void 0 : cancelEdit();
    dispatchQueue({
      type: "pop"
    });
    artifactDispatch({
      type: "reset"
    });
  }, [cancelEdit, artifactDispatch]);
  const update = (0,react.useCallback)(newValue => {
    var _artifact$level, _newValue$rarity;
    const newSheet = newValue.setKey ? (0,Artifacts/* getArtSheet */.Sk)(newValue.setKey) : sheet;
    function pick(value, available, prefer) {
      return value && available.includes(value) ? value : prefer != null ? prefer : available[0];
    }
    if (newValue.setKey) {
      newValue.rarity = pick(artifact == null ? void 0 : artifact.rarity, newSheet.rarity, Math.max(...newSheet.rarity));
      newValue.slotKey = pick(artifact == null ? void 0 : artifact.slotKey, newSheet.slots);
    }
    if (newValue.rarity) newValue.level = (_artifact$level = artifact == null ? void 0 : artifact.level) != null ? _artifact$level : 0;
    if (newValue.level) newValue.level = (0,Util/* clamp */.uZ)(newValue.level, 0, 4 * ((_newValue$rarity = newValue.rarity) != null ? _newValue$rarity : artifact.rarity));
    if (newValue.slotKey) newValue.mainStatKey = pick(artifact == null ? void 0 : artifact.mainStatKey, Artifacts_Artifact/* default.slotMainStats */.ZP.slotMainStats(newValue.slotKey));
    if (newValue.mainStatKey) {
      newValue.substats = [0, 1, 2, 3].map(i => artifact && artifact.substats[i].key !== newValue.mainStatKey ? artifact.substats[i] : {
        key: "",
        value: 0
      });
    }
    artifactDispatch({
      type: "update",
      artifact: newValue
    });
  }, [artifact, sheet, artifactDispatch]);
  const setSubstat = (0,react.useCallback)((index, substat) => {
    artifactDispatch({
      type: "substat",
      index,
      substat
    });
  }, [artifactDispatch]);
  const isValid = !errors.length;
  const canClearArtifact = () => window.confirm(t(ArtifactEditor_t || (ArtifactEditor_t = ArtifactEditor_`editor.clearPrompt`)));
  const {
    rarity = 5,
    level = 0,
    slotKey = "flower"
  } = artifact != null ? artifact : {};
  const {
    currentEfficiency = 0,
    maxEfficiency = 0
  } = cArtifact ? Artifacts_Artifact/* default.getArtifactEfficiency */.ZP.getArtifactEfficiency(cArtifact, allSubstatFilter) : {};
  const preventClosing = processed.length || outstanding.length;
  const onClose = (0,react.useCallback)(e => {
    if (preventClosing) e.preventDefault();
    setShow(false);
    cancelEdit();
  }, [preventClosing, setShow, cancelEdit]);
  const theme = (0,node.useTheme)();
  const grmd = (0,node.useMediaQuery)(theme.breakpoints.up('md'));
  const element = artifact ? src/* allElementsWithPhy.find */.Kj.find(ele => artifact.mainStatKey.includes(ele)) : undefined;
  const color = artifact ? element != null ? element : "success" : "primary";
  const updateSetKey = (0,react.useCallback)(setKey => update({
    setKey: setKey
  }), [update]);
  const setACDisable = (0,react.useCallback)(key => {
    if (key === "") return true;
    //Disable being able to select any of the prayer set unless the current slotkey is circlet
    if (disableEditSlot && slotKey !== "circlet" && (key === "PrayersForDestiny" || key === "PrayersForIllumination" || key === "PrayersForWisdom" || key === "PrayersToSpringtime")) return true;
    return false;
  }, [disableEditSlot, slotKey]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
    open: show,
    onClose: onClose,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
      fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Skeleton, {
        variant: "rectangular",
        sx: {
          width: "100%",
          height: show ? "100%" : 64
        }
      }),
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(UploadExplainationModal, {
          modalShow: modalShow,
          hide: () => setModalShow(false)
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardHeader, {
          title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
            t: t,
            i18nKey: "editor.title",
            children: "Artifact Editor"
          }),
          action: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
            disabled: !!preventClosing,
            onClick: onClose
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
          sx: {
            display: "flex",
            flexDirection: "column",
            gap: 1
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
            container: true,
            spacing: 1,
            columns: {
              xs: 1,
              md: 2
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
              item: true,
              xs: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
                sx: {
                  display: "flex",
                  gap: 1
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetAutocomplete/* default */.Z, {
                  disabled: disableSet,
                  disableClearable: true,
                  size: "small",
                  artSetKey: (_artifact$setKey = artifact == null ? void 0 : artifact.setKey) != null ? _artifact$setKey : "",
                  setArtSetKey: updateSetKey,
                  sx: {
                    flexGrow: 1
                  },
                  label: t("editor.unknownSetName"),
                  getOptionDisabled: ({
                    key
                  }) => setACDisable(key)
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactRarityDropdown, {
                  rarity: artifact ? rarity : undefined,
                  onChange: r => update({
                    rarity: r
                  }),
                  filter: r => {
                    var _sheet$rarity;
                    return !!(sheet != null && (_sheet$rarity = sheet.rarity) != null && _sheet$rarity.includes != null && _sheet$rarity.includes(r));
                  },
                  disabled: !sheet
                })]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
                component: "div",
                display: "flex",
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberTextField, {
                  id: "filled-basic",
                  label: "Level",
                  variant: "filled",
                  sx: {
                    flexShrink: 1,
                    flexGrow: 1,
                    mr: 1,
                    my: 0
                  },
                  margin: "dense",
                  size: "small",
                  value: level,
                  disabled: !sheet,
                  placeholder: `0~${rarity * 4}`,
                  onChange: l => update({
                    level: l
                  })
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ButtonGroup, {
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                    onClick: () => update({
                      level: level - 1
                    }),
                    disabled: !sheet || level === 0,
                    children: "-"
                  }), rarity ? [...Array(rarity + 1).keys()].map(i => 4 * i).map(i => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                    onClick: () => update({
                      level: i
                    }),
                    disabled: !sheet || level === i,
                    children: i
                  }, i)) : null, (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                    onClick: () => update({
                      level: level + 1
                    }),
                    disabled: !sheet || level === rarity * 4,
                    children: "+"
                  })]
                })]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
                component: "div",
                display: "flex",
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSlotDropdown, {
                  disabled: disableEditSlot || !sheet,
                  slotKey: slotKey,
                  onChange: slotKey => update({
                    slotKey
                  })
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
                  sx: {
                    p: 1,
                    ml: 1,
                    flexGrow: 1
                  },
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
                    fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Skeleton, {
                      width: "60%"
                    }),
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                      color: "text.secondary",
                      children: artifact && sheet != null && sheet.getSlotName(artifact.slotKey) ? (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
                        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgIcon/* default */.Z, {
                          src: (0,g_assets_src/* artifactAsset */.Hp)(artifact.setKey, artifact.slotKey)
                        }), " ", sheet == null ? void 0 : sheet.getSlotName(artifact.slotKey)]
                      }) : t(ArtifactEditor_t2 || (ArtifactEditor_t2 = ArtifactEditor_`editor.unknownPieceName`))
                    })
                  })
                })]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
                component: "div",
                display: "flex",
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, {
                  startIcon: artifact != null && artifact.mainStatKey ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* default */.C, {
                    statKey: artifact.mainStatKey
                  }) : undefined,
                  title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                    children: artifact ? app_KeyMap/* default.getArtStr */.ZP.getArtStr(artifact.mainStatKey) : t(ArtifactEditor_t3 || (ArtifactEditor_t3 = ArtifactEditor_`mainStat`))
                  }),
                  disabled: !sheet,
                  color: color,
                  children: Artifacts_Artifact/* default.slotMainStats */.ZP.slotMainStats(slotKey).map(mainStatK => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.MenuItem, {
                    selected: (artifact == null ? void 0 : artifact.mainStatKey) === mainStatK,
                    disabled: (artifact == null ? void 0 : artifact.mainStatKey) === mainStatK,
                    onClick: () => update({
                      mainStatKey: mainStatK
                    }),
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplay/* StatColoredWithUnit */._, {
                      statKey: mainStatK
                    })
                  }, mainStatK))
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
                  sx: {
                    p: 1,
                    ml: 1,
                    flexGrow: 1
                  },
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                    color: "text.secondary",
                    children: artifact ? `${(0,app_KeyMap/* cacheValueString */.qs)(Artifacts_Artifact/* default.mainStatValue */.ZP.mainStatValue(artifact.mainStatKey, rarity, level), app_KeyMap/* default.unit */.ZP.unit(artifact.mainStatKey))}${app_KeyMap/* default.unit */.ZP.unit(artifact.mainStatKey)}` : t(ArtifactEditor_t4 || (ArtifactEditor_t4 = ArtifactEditor_`mainStat`))
                  })
                })]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SubstatEfficiencyDisplayCard, {
                valid: isValid,
                efficiency: currentEfficiency,
                t: t
              }), currentEfficiency !== maxEfficiency && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SubstatEfficiencyDisplayCard, {
                max: true,
                valid: isValid,
                efficiency: maxEfficiency,
                t: t
              }), allowUpload && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
                  sx: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                  },
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(react.Suspense, {
                    fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Skeleton, {
                      width: "100%",
                      height: "100"
                    }),
                    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
                      container: true,
                      spacing: 1,
                      alignItems: "center",
                      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
                        item: true,
                        flexGrow: 1,
                        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("label", {
                          htmlFor: "contained-button-file",
                          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(InputInvis, {
                            accept: "image/*",
                            id: "contained-button-file",
                            multiple: true,
                            type: "file",
                            onChange: onUpload
                          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                            component: "span",
                            startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* PhotoCamera */.SwD, {}),
                            children: "Upload Screenshot (or Ctrl-V)"
                          })]
                        })
                      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
                        item: true,
                        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                          color: "info",
                          sx: {
                            px: 2,
                            minWidth: 0
                          },
                          onClick: () => setModalShow(true),
                          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Help["default"], {})
                        })
                      })]
                    }), image && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
                      display: "flex",
                      justifyContent: "center",
                      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
                        component: "img",
                        src: image,
                        width: "100%",
                        maxWidth: 350,
                        height: "auto",
                        alt: "Screenshot to parse for artifact values"
                      })
                    }), remaining > 0 && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
                      sx: {
                        pl: 2
                      },
                      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
                        container: true,
                        spacing: 1,
                        alignItems: "center",
                        children: [!firstProcessed && firstOutstanding && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
                          item: true,
                          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CircularProgress, {
                            size: "1em"
                          })
                        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
                          item: true,
                          flexGrow: 1,
                          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
                              children: ["Screenshots in file-queue: ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                                children: remaining
                              })]
                            })
                          })
                        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
                          item: true,
                          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                            size: "small",
                            color: "error",
                            onClick: clearQueue,
                            children: "Clear file-queue"
                          })
                        })]
                      })
                    })]
                  })
                })
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
              item: true,
              xs: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              children: [[0, 1, 2, 3].map(index => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SubstatInput, {
                index: index,
                artifact: cArtifact,
                setSubstat: setSubstat
              }, index)), texts && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
                    children: texts.slotKey
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
                    children: texts.mainStatKey
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
                    children: texts.mainStatVal
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
                    children: texts.rarity
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
                    children: texts.level
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
                    children: texts.substats
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
                    children: texts.setKey
                  })]
                })
              })]
            })]
          }), old && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
            container: true,
            sx: {
              justifyContent: "space-around"
            },
            spacing: 1,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              xs: 12,
              md: 5.5,
              lg: 4,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                  sx: {
                    textAlign: "center"
                  },
                  py: 1,
                  variant: "h6",
                  color: "text.secondary",
                  children: oldType !== "edit" ? oldType === "duplicate" ? t(ArtifactEditor_t5 || (ArtifactEditor_t5 = ArtifactEditor_`editor.dupArt`)) : t(ArtifactEditor_t6 || (ArtifactEditor_t6 = ArtifactEditor_`editor.upArt`)) : t(ArtifactEditor_t7 || (ArtifactEditor_t7 = ArtifactEditor_`editor.beforeEdit`))
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCard/* default */.Z, {
                  artifactObj: old
                })]
              })
            }), grmd && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              md: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
                sx: {
                  display: "flex"
                },
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* ChevronRight */._Qn, {
                  sx: {
                    fontSize: 40
                  }
                })
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              xs: 12,
              md: 5.5,
              lg: 4,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                  sx: {
                    textAlign: "center"
                  },
                  py: 1,
                  variant: "h6",
                  color: "text.secondary",
                  children: t(_t8 || (_t8 = ArtifactEditor_`editor.preview`))
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCard/* default */.Z, {
                  artifactObj: cArtifact
                })]
              })
            })]
          }), !isValid && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Alert, {
            variant: "filled",
            severity: "error",
            children: errors.map((e, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
              children: e
            }, i))
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
            container: true,
            spacing: 2,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              children: oldType === "edit" ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Add */.mm_, {}),
                onClick: () => {
                  database.arts.set(old.id, editorArtifact);
                  if (allowEmpty) reset();else {
                    setShow(false);
                    cancelEdit();
                  }
                },
                disabled: !editorArtifact || !isValid,
                color: "primary",
                children: t(_t9 || (_t9 = ArtifactEditor_`editor.btnSave`))
              }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Add */.mm_, {}),
                onClick: () => {
                  database.arts.new(artifact);
                  if (allowEmpty) reset();else {
                    setShow(false);
                    cancelEdit();
                  }
                },
                disabled: !artifact || !isValid,
                color: oldType === "duplicate" ? "warning" : "primary",
                children: t(_t10 || (_t10 = ArtifactEditor_`editor.btnAdd`))
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              flexGrow: 1,
              children: allowEmpty && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Replay */.UHt, {}),
                disabled: !artifact,
                onClick: () => {
                  canClearArtifact() && reset();
                },
                color: "error",
                children: t(_t11 || (_t11 = ArtifactEditor_`editor.btnClear`))
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              children:  false && 0
            }), old && oldType !== "edit" && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Update */.BNo, {}),
                onClick: () => {
                  database.arts.set(old.id, editorArtifact);
                  allowEmpty ? reset() : setShow(false);
                },
                disabled: !editorArtifact || !isValid,
                color: "success",
                children: t(_t13 || (_t13 = ArtifactEditor_`editor.btnUpdate`))
              })
            })]
          })]
        })]
      })
    })
  });
}

/***/ })

}]);