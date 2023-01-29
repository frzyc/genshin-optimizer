"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[878],{

/***/ 86113:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ CardHeaderCustom)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(552903);



function CardHeaderCustom({
  avatar,
  title,
  action
}) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_1__.Box, {
    display: "flex",
    gap: 1,
    p: 2,
    alignItems: "center",
    children: [avatar, (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_1__.Typography, {
      variant: "subtitle1",
      sx: {
        flexGrow: 1
      },
      children: title
    }), action && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_1__.Typography, {
      variant: "caption",
      children: action
    })]
  });
}

/***/ }),

/***/ 73740:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "X": () => (/* binding */ HeaderDisplay),
  "Z": () => (/* binding */ DocumentDisplay)
});

// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__(202784);
// EXTERNAL MODULE: ./src/app/Context/DataContext.tsx
var DataContext = __webpack_require__(790);
// EXTERNAL MODULE: ./src/app/Util/Util.ts
var Util = __webpack_require__(41015);
// EXTERNAL MODULE: ./src/app/Components/Card/CardDark.tsx
var CardDark = __webpack_require__(87985);
// EXTERNAL MODULE: ./src/app/Components/Card/CardHeaderCustom.tsx
var CardHeaderCustom = __webpack_require__(86113);
// EXTERNAL MODULE: ./src/app/Components/FieldDisplay.tsx
var FieldDisplay = __webpack_require__(802720);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/index.js
var icons_material = __webpack_require__(111084);
// EXTERNAL MODULE: ./src/app/Context/CharacterContext.tsx
var CharacterContext = __webpack_require__(353710);
// EXTERNAL MODULE: ./src/app/Components/DropdownMenu/DropdownButton.tsx
var DropdownButton = __webpack_require__(645475);
// EXTERNAL MODULE: ./src/app/Components/SqBadge.tsx
var SqBadge = __webpack_require__(783673);
// EXTERNAL MODULE: ./src/app/Components/Translate.tsx
var Translate = __webpack_require__(721845);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/Components/Conditional/ConditionalSelector.tsx











function ConditionalSelector({
  conditional,
  disabled = false
}) {
  if (Object.keys(conditional.states).length === 1 && "path" in conditional) {
    return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SimpleConditionalSelector, {
      conditional: conditional,
      disabled: disabled
    });
  } else if ("path" in conditional) {
    return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ExclusiveConditionalSelector, {
      conditional: conditional,
      disabled: disabled
    });
  } else /*if ("path" in Object.entries(conditional.states)[0]) */{
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(MultipleConditionalSelector, {
        conditional: conditional,
        disabled: disabled
      });
    }
}
function SimpleConditionalSelector({
  conditional,
  disabled
}) {
  const {
    character,
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const setConditional = (0,react.useCallback)(v => {
    const conditionalValues = (0,Util/* deepClone */.I8)(character.conditional);
    if (v) {
      (0,Util/* layeredAssignment */.SR)(conditionalValues, conditional.path, v);
    } else {
      (0,Util/* deletePropPath */.uH)(conditionalValues, conditional.path);
    }
    characterDispatch({
      conditional: conditionalValues
    });
  }, [conditional, character, characterDispatch]);
  const conditionalValue = data.get(conditional.value).value;
  const [stateKey, st] = Object.entries(conditional.states)[0];
  const badge = getStateBadge(st.name);
  const condName = getCondName(conditional.name);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Button, {
    fullWidth: true,
    size: "small",
    sx: {
      borderRadius: 0
    },
    color: conditionalValue ? "success" : "primary",
    onClick: () => setConditional(conditionalValue ? undefined : stateKey),
    disabled: disabled,
    startIcon: conditionalValue ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}),
    children: [condName, " ", badge]
  });
}
function ExclusiveConditionalSelector({
  conditional,
  disabled
}) {
  const {
    character,
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const setConditional = (0,react.useCallback)(v => {
    const conditionalValues = (0,Util/* deepClone */.I8)(character.conditional);
    if (v) {
      (0,Util/* layeredAssignment */.SR)(conditionalValues, conditional.path, v);
    } else {
      (0,Util/* deletePropPath */.uH)(conditionalValues, conditional.path);
    }
    characterDispatch({
      conditional: conditionalValues
    });
  }, [conditional, character, characterDispatch]);
  const conditionalValue = data.get(conditional.value).value;
  const state = conditionalValue ? conditional.states[conditionalValue] : undefined;
  const badge = state ? getStateBadge(state.name) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
    color: "secondary",
    children: "Not Active"
  });
  const condName = getCondName(conditional.name);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(DropdownButton/* default */.Z, {
    fullWidth: true,
    size: "small",
    sx: {
      borderRadius: 0
    },
    color: conditionalValue ? "success" : "primary",
    title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
      children: [condName, " ", badge]
    }),
    disabled: disabled,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.MenuItem, {
      onClick: () => setConditional(),
      selected: !state,
      disabled: !state,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
        children: "Not Active"
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), Object.entries(conditional.states).map(([stateKey, st]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.MenuItem, {
      onClick: () => setConditional(stateKey),
      selected: conditionalValue === stateKey,
      disabled: conditionalValue === stateKey,
      children: st.name
    }, stateKey))]
  });
}
function MultipleConditionalSelector({
  conditional,
  disabled
}) {
  const {
    character,
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const setConditional = (0,react.useCallback)((path, v) => {
    const conditionalValues = (0,Util/* deepClone */.I8)(character.conditional);
    if (v) {
      (0,Util/* layeredAssignment */.SR)(conditionalValues, path, v);
    } else {
      (0,Util/* deletePropPath */.uH)(conditionalValues, path);
    }
    characterDispatch({
      conditional: conditionalValues
    });
  }, [character, characterDispatch]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.ButtonGroup, {
    fullWidth: true,
    orientation: "vertical",
    disableElevation: true,
    color: "secondary",
    children: Object.entries(conditional.states).map(([stateKey, st]) => {
      const conditionalValue = data.get(st.value).value;
      const isSelected = conditionalValue === stateKey;
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
        color: isSelected ? "success" : "primary",
        disabled: disabled,
        fullWidth: true,
        onClick: () => setConditional(st.path, conditionalValue ? undefined : stateKey),
        size: "small",
        startIcon: isSelected ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}),
        sx: {
          borderRadius: 0
        },
        children: getCondName(st.name)
      }, stateKey);
    })
  });
}
function isElement(disp) {
  return typeof disp !== "string";
}

// Use colored badges instead of colored text inside these buttons
function getStateBadge(stateName) {
  if (!stateName) return "";
  let badgeColor = "primary";
  let badgeText = stateName;
  if (stateName && isElement(stateName)) {
    if (stateName.props.color) {
      badgeColor = stateName.props.color;
      badgeText = (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
        children: stateName.props.children
      });
    }
  }
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
    sx: {
      ml: 0.5
    },
    color: badgeColor,
    children: badgeText
  });
}

// Use colored badges instead of colored text inside these buttons
function getCondName(condName) {
  if (isElement(condName)) {
    const key = condName.props.key18;
    const ns = condName.props.ns;
    const values = condName.props.values;
    return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Translate/* Translate */.v, {
      ns: ns,
      key18: key,
      values: values,
      useBadge: true
    });
  }
  return condName;
}
;// CONCATENATED MODULE: ./src/app/Components/Conditional/ConditionalDisplay.tsx










function ConditionalDisplay({
  conditional,
  hideHeader = false,
  hideDesc = false
}) {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  let fields;
  if ("path" in conditional) {
    var _conditional$states$c;
    const condVal = data.get(conditional.value).value;
    fields = condVal && ((_conditional$states$c = conditional.states[condVal]) == null ? void 0 : _conditional$states$c.fields);
  } else /* if ("path" in Object.entries(conditional.states)[0]) */{
      fields = Object.values(conditional.states).flatMap(state => {
        const stateVal = data.get(state.value).value;
        return stateVal ? state.fields : [];
      });
    }
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
    children: [!(0,Util/* evalIfFunc */.mY)(hideHeader, conditional) && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HeaderDisplay, {
      header: conditional.header,
      hideDesc: hideDesc
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        p: 0,
        "&:last-child": {
          pb: 0
        }
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ConditionalSelector, {
        conditional: conditional
      })
    }), fields && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* default */.ZP, {
      fields: fields
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Components/InfoTooltip.tsx
var InfoTooltip = __webpack_require__(282334);
;// CONCATENATED MODULE: ./src/app/Components/DocumentDisplay.tsx












function DocumentDisplay({
  sections,
  teamBuffOnly,
  hideDesc = false,
  hideHeader = false
}) {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  if (!sections.length) return null;
  const sectionDisplays = sections.map((s, i) => {
    // If we can't show this section, return null
    if (s.canShow && !data.get(s.canShow).value) return null;
    // If we are showing only teambuffs, and this section is not a teambuff, return null
    if (teamBuffOnly && !s.teamBuff) return null;
    return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SectionDisplay, {
      section: s,
      hideDesc: hideDesc,
      hideHeader: hideHeader
    }, i);
  }).filter(s => s);
  if (!sectionDisplays.length) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    children: sectionDisplays
  });
}
function SectionDisplay({
  section,
  hideDesc = false,
  hideHeader = false
}) {
  if ("fields" in section) {
    return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldsSectionDisplay, {
      section: section,
      hideDesc: hideDesc,
      hideHeader: hideHeader
    });
  } else if ("states" in section) {
    return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ConditionalDisplay, {
      conditional: section,
      hideDesc: hideDesc,
      hideHeader: hideHeader
    });
  } else /* if ("text" in section) */{
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TextSectionDisplay, {
        section: section
      });
    }
}
function FieldsSectionDisplay({
  section,
  hideDesc,
  hideHeader
}) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
    children: [!(0,Util/* evalIfFunc */.mY)(hideHeader, section) && section.header && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HeaderDisplay, {
      header: section.header,
      hideDesc: hideDesc,
      hideDivider: section.fields.length === 0
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* default */.ZP, {
      fields: section.fields
    })]
  });
}
function TextSectionDisplay({
  section
}) {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("div", {
    children: (0,Util/* evalIfFunc */.mY)(section.text, data)
  });
}
function HeaderDisplay({
  header,
  hideDesc,
  hideDivider
}) {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    icon: preicon,
    title,
    action
  } = header;
  const icon = (0,Util/* evalIfFunc */.mY)(preicon, data);
  const description = !hideDesc && (0,Util/* evalIfFunc */.mY)(header.description, data);
  const displayTitle = hideDesc ? title : (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [title, (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(InfoTooltip/* InfoTooltipInline */.L, {
      title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        children: description
      })
    })]
  });
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardHeaderCustom/* default */.Z, {
      avatar: icon,
      title: displayTitle,
      action: action
    }), !hideDivider && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {})]
  });
}

/***/ }),

/***/ 497859:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ LevelSelect)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(732696);
/* harmony import */ var _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(821626);
/* harmony import */ var _Util_Util__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(41015);
/* harmony import */ var _CustomNumberInput__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(789343);
/* harmony import */ var _DropdownMenu_DropdownButton__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(645475);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(552903);









function LevelSelect({
  level,
  ascension,
  setBoth,
  useLow = false
}) {
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_1__/* .useTranslation */ .$G)("ui");
  const ascensionMaxLevels = useLow ? _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__/* .ascensionMaxLevelLow */ .sU : _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__/* .ascensionMaxLevel */ .SJ;
  const setLevel = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((level = 1) => {
    level = (0,_Util_Util__WEBPACK_IMPORTED_MODULE_5__/* .clamp */ .uZ)(level, 1, useLow ? _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__/* .maxLevelLow */ .d8 : _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__/* .maxLevel */ .Qq);
    const ascension = ascensionMaxLevels.findIndex(ascenML => level <= ascenML);
    setBoth({
      level,
      ascension
    });
  }, [setBoth, ascensionMaxLevels, useLow]);
  const setAscension = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    const lowerAscension = ascensionMaxLevels.findIndex(ascenML => level !== 90 && level === ascenML);
    if (ascension === lowerAscension) setBoth({
      ascension: ascension + 1
    });else setBoth({
      ascension: lowerAscension
    });
  }, [setBoth, ascensionMaxLevels, ascension, level]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_7__.ButtonGroup, {
    sx: {
      bgcolor: t => t.palette.contentDark.main
    },
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_CustomNumberInput__WEBPACK_IMPORTED_MODULE_3__/* .CustomNumberInputButtonGroupWrapper */ .CC, {
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_CustomNumberInput__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .ZP, {
        onChange: setLevel,
        value: level,
        startAdornment: "Lv. ",
        inputProps: {
          min: 1,
          max: 90,
          sx: {
            textAlign: "center",
            width: "3em"
          }
        },
        sx: {
          height: "100%",
          pl: 2
        }
      })
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_7__.Button, {
      sx: {
        pl: 1,
        whiteSpace: 'nowrap'
      },
      disabled: !(useLow ? _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__/* .ambiguousLevelLow */ .nB : _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__/* .ambiguousLevel */ .ek)(level),
      onClick: setAscension,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsxs */ .BX)("strong", {
        children: ["/ ", _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__/* .ascensionMaxLevel */ .SJ[ascension]]
      })
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_DropdownMenu_DropdownButton__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
      title: t("selectlevel"),
      sx: {
        flexGrow: 1
      },
      children: [...(useLow ? _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__/* .milestoneLevelsLow */ .vF : _Data_LevelData__WEBPACK_IMPORTED_MODULE_2__/* .milestoneLevels */ .D4)].map(([lv, as]) => {
        const selected = lv === level && as === ascension;
        return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_7__.MenuItem, {
          selected: selected,
          disabled: selected,
          onClick: () => setBoth({
            level: lv,
            ascension: as
          }),
          children: lv === ascensionMaxLevels[as] ? `Lv. ${lv}` : `Lv. ${lv}/${ascensionMaxLevels[as]}`
        }, `${lv}/${as}`);
      })
    })]
  });
}

/***/ }),

/***/ 414520:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ RefinementDropdown)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(732696);
/* harmony import */ var _Types_consts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(736893);
/* harmony import */ var _DropdownMenu_DropdownButton__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(645475);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(552903);





function RefinementDropdown({
  refinement,
  setRefinement
}) {
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_0__/* .useTranslation */ .$G)("ui");
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(_DropdownMenu_DropdownButton__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
    title: t("refinement", {
      value: refinement
    }),
    children: _Types_consts__WEBPACK_IMPORTED_MODULE_1__/* .allRefinement.map */ .a.map(r => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_4__.MenuItem, {
      onClick: () => setRefinement(r),
      selected: refinement === r,
      disabled: refinement === r,
      children: t("refinement", {
        value: r
      })
    }, r))
  });
}

/***/ }),

/***/ 215878:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WeaponEditor)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(918676);
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(111084);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(202784);
/* harmony import */ var _Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(87985);
/* harmony import */ var _Components_Card_CardLight__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(567937);
/* harmony import */ var _Components_Character_LocationAutocomplete__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(443007);
/* harmony import */ var _Components_CloseButton__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(672055);
/* harmony import */ var _Components_DocumentDisplay__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(73740);
/* harmony import */ var _Components_FieldDisplay__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(802720);
/* harmony import */ var _Components_LevelSelect__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(497859);
/* harmony import */ var _Components_ModalWrapper__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(898927);
/* harmony import */ var _Components_RefinementDropdown__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(414520);
/* harmony import */ var _Components_StarDisplay__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(871765);
/* harmony import */ var _Context_DataContext__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(790);
/* harmony import */ var _Data_Characters__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(970630);
/* harmony import */ var _Data_LevelData__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(821626);
/* harmony import */ var _Data_Weapons__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(951077);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(225870);
/* harmony import */ var _Formula__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(534958);
/* harmony import */ var _Formula_api__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(130507);
/* harmony import */ var _ReactHooks_useBoolState__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(594657);
/* harmony import */ var _ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(610002);
/* harmony import */ var _ReactHooks_useWeapon__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(694758);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(552903);


























const WeaponSelectionModal = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.lazy(() => __webpack_require__.e(/* import() */ 592).then(__webpack_require__.bind(__webpack_require__, 489431)));
function WeaponEditor({
  weaponId: propWeaponId,
  footer = false,
  onClose,
  extraButtons
}) {
  var _weaponSheet$name;
  const {
    data
  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_Context_DataContext__WEBPACK_IMPORTED_MODULE_12__/* .DataContext */ .R);
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_16__/* .DatabaseContext */ .t);
  const weapon = (0,_ReactHooks_useWeapon__WEBPACK_IMPORTED_MODULE_21__/* ["default"] */ .Z)(propWeaponId);
  const {
    key = "",
    level = 0,
    refinement = 1,
    ascension = 0,
    lock,
    location = "",
    id
  } = weapon != null ? weapon : {};
  const weaponSheet = key ? (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_15__/* .getWeaponSheet */ .ub)(key) : undefined;
  const weaponDispatch = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(newWeapon => {
    database.weapons.set(propWeaponId, newWeapon);
  }, [propWeaponId, database]);
  const {
    gender
  } = (0,_ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_20__/* ["default"] */ .Z)();
  const characterSheet = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => location ? (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_13__/* .getCharSheet */ .m)(database.chars.LocationToCharacterKey(location), gender) : undefined, [database, gender, location]);
  const initialWeaponFilter = characterSheet && characterSheet.weaponTypeKey;
  const setLocation = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(k => id && database.weapons.set(id, {
    location: k
  }), [database, id]);
  const filter = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(cs => cs.weaponTypeKey === (weaponSheet == null ? void 0 : weaponSheet.weaponType), [weaponSheet]);
  const [showModal, onShowModal, onHideModal] = (0,_ReactHooks_useBoolState__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .Z)();
  const img = key ? (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__/* .weaponAsset */ .Aq)(key, ascension >= 2) : "";

  //check the levels when switching from a 5* to a 1*, for example.
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!weaponSheet || !weaponDispatch || weaponSheet.key !== (weapon == null ? void 0 : weapon.key)) return;
    if (weaponSheet.rarity <= 2 && (level > 70 || ascension > 4)) {
      const [level, ascension] = _Data_LevelData__WEBPACK_IMPORTED_MODULE_14__/* .milestoneLevelsLow[0] */ .vF[0];
      weaponDispatch({
        level,
        ascension
      });
    }
  }, [weaponSheet, weapon, weaponDispatch, level, ascension]);
  const weaponUIData = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => weaponSheet && weapon && (0,_Formula_api__WEBPACK_IMPORTED_MODULE_18__/* .computeUIData */ .mP)([weaponSheet.data, (0,_Formula_api__WEBPACK_IMPORTED_MODULE_18__/* .dataObjForWeapon */ .v0)(weapon)]), [weaponSheet, weapon]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_ModalWrapper__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
    open: !!propWeaponId,
    onClose: onClose,
    containerProps: {
      maxWidth: "md"
    },
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_Components_Card_CardLight__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(WeaponSelectionModal, {
        ascension: ascension,
        show: showModal,
        onHide: onHideModal,
        onSelect: k => weaponDispatch({
          key: k
        }),
        weaponTypeFilter: initialWeaponFilter
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.CardContent, {
        children: weaponSheet && weaponUIData && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
          container: true,
          spacing: 1.5,
          children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            xs: 12,
            sm: 3,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
              container: true,
              spacing: 1.5,
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
                item: true,
                xs: 6,
                sm: 12,
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Box, {
                  component: "img",
                  src: img,
                  className: `grad-${weaponSheet.rarity}star`,
                  sx: {
                    maxWidth: 256,
                    width: "100%",
                    height: "auto",
                    borderRadius: 1
                  }
                })
              }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
                item: true,
                xs: 6,
                sm: 12,
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Typography, {
                  children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)("small", {
                    children: weaponSheet.description
                  })
                })
              })]
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            xs: 12,
            sm: 9,
            sx: {
              display: "flex",
              flexDirection: "column",
              gap: 1
            },
            children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Box, {
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "space-between",
              children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.ButtonGroup, {
                children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Button, {
                  color: "info",
                  onClick: onShowModal,
                  children: (_weaponSheet$name = weaponSheet == null ? void 0 : weaponSheet.name) != null ? _weaponSheet$name : "Select a Weapon"
                }), (weaponSheet == null ? void 0 : weaponSheet.hasRefinement) && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_RefinementDropdown__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
                  refinement: refinement,
                  setRefinement: r => weaponDispatch({
                    refinement: r
                  })
                }), extraButtons]
              })
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Box, {
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "space-between",
              children: [weaponSheet && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_LevelSelect__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
                level: level,
                ascension: ascension,
                setBoth: weaponDispatch,
                useLow: !weaponSheet.hasRefinement
              }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Button, {
                color: "error",
                onClick: () => id && database.weapons.set(id, {
                  lock: !lock
                }),
                startIcon: lock ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_24__/* .Lock */ .HEZ, {}) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_24__/* .LockOpen */ .M0f, {}),
                children: lock ? "Locked" : "Unlocked"
              })]
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_StarDisplay__WEBPACK_IMPORTED_MODULE_11__/* .StarsDisplay */ .q, {
              stars: weaponSheet.rarity
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Typography, {
              variant: "subtitle1",
              children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)("strong", {
                children: weaponSheet.passiveName
              })
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Typography, {
              gutterBottom: true,
              children: weaponSheet.passiveName && weaponSheet.passiveDescription(weaponUIData.get(_Formula__WEBPACK_IMPORTED_MODULE_17__/* .uiInput.weapon.refineIndex */ .ri.weapon.refineIndex).value)
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Box, {
              display: "flex",
              flexDirection: "column",
              gap: 1,
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.CardHeader, {
                  title: "Main Stats",
                  titleTypographyProps: {
                    variant: "subtitle2"
                  }
                }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Divider, {}), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_FieldDisplay__WEBPACK_IMPORTED_MODULE_7__/* .FieldDisplayList */ .lD, {
                  children: [_Formula__WEBPACK_IMPORTED_MODULE_17__/* .uiInput.weapon.main */ .ri.weapon.main, _Formula__WEBPACK_IMPORTED_MODULE_17__/* .uiInput.weapon.sub */ .ri.weapon.sub, _Formula__WEBPACK_IMPORTED_MODULE_17__/* .uiInput.weapon.sub2 */ .ri.weapon.sub2].map(node => {
                    const n = weaponUIData.get(node);
                    if (n.isEmpty || !n.value) return null;
                    return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_FieldDisplay__WEBPACK_IMPORTED_MODULE_7__/* .NodeFieldDisplay */ .JW, {
                      node: n,
                      component: _mui_material__WEBPACK_IMPORTED_MODULE_23__.ListItem
                    }, JSON.stringify(n.info));
                  })
                })]
              }), data && weaponSheet.document && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_DocumentDisplay__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
                sections: weaponSheet.document
              })]
            })]
          })]
        })
      }), footer && id && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.CardContent, {
        sx: {
          py: 1
        },
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
          container: true,
          spacing: 1,
          children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            flexGrow: 1,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_Character_LocationAutocomplete__WEBPACK_IMPORTED_MODULE_4__/* .LocationAutocomplete */ .W, {
              location: location,
              setLocation: setLocation,
              filter: filter,
              autoCompleteProps: {
                getOptionDisabled: t => !t.key,
                disableClearable: true
              }
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            flexGrow: 2
          }), !!onClose && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_CloseButton__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
              sx: {
                height: "100%"
              },
              large: true,
              onClick: onClose
            })
          })]
        })
      })]
    })
  });
}

/***/ })

}]);