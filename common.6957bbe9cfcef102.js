"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[592],{

/***/ 932912:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ ArtifactLevelSlider)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _Util_Util__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(41015);
/* harmony import */ var _CustomNumberInput__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(789343);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(552903);






function ArtifactLevelSlider({
  levelLow,
  levelHigh,
  setLow,
  setHigh,
  setBoth,
  dark = false,
  disabled = false,
  showLevelText = false
}) {
  const [sliderLow, setsliderLow] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(levelLow);
  const [sliderHigh, setsliderHigh] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(levelHigh);
  const setSlider = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e, value) => {
    if (typeof value == "number") throw new TypeError();
    const [l, h] = value;
    setsliderLow(l);
    setsliderHigh(h);
  }, [setsliderLow, setsliderHigh]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => setsliderLow(levelLow), [setsliderLow, levelLow]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => setsliderHigh(levelHigh), [setsliderHigh, levelHigh]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.Card, {
    sx: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      bgcolor: dark ? "contentDark.main" : "contentLight.main",
      overflow: "visible"
    },
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__/* .jsx */ .tZ)(_CustomNumberInput__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .ZP, {
      value: sliderLow,
      onChange: val => setLow((0,_Util_Util__WEBPACK_IMPORTED_MODULE_4__/* .clamp */ .uZ)(val, 0, levelHigh)),
      sx: {
        px: 1,
        pl: showLevelText ? 2 : undefined,
        width: showLevelText ? 100 : 50
      },
      inputProps: {
        sx: {
          textAlign: showLevelText ? "right" : "center"
        }
      },
      startAdornment: showLevelText ? "Level: " : undefined,
      disabled: disabled
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.Slider, {
      sx: {
        width: 100,
        flexGrow: 1,
        mx: 2
      },
      getAriaLabel: () => 'Arifact Level Range',
      value: [sliderLow, sliderHigh],
      onChange: setSlider,
      onChangeCommitted: (e, value) => setBoth(value[0], value[1]),
      valueLabelDisplay: "auto",
      min: 0,
      max: 20,
      step: 1,
      marks: true,
      disabled: disabled
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__/* .jsx */ .tZ)(_CustomNumberInput__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .ZP, {
      value: sliderHigh,
      onChange: val => setHigh((0,_Util_Util__WEBPACK_IMPORTED_MODULE_4__/* .clamp */ .uZ)(val, levelLow, 20)),
      sx: {
        px: 1,
        width: 50
      },
      inputProps: {
        sx: {
          textAlign: "center"
        }
      },
      disabled: disabled
    })]
  });
}

/***/ }),

/***/ 617206:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ ArtifactSetAutocomplete)
/* harmony export */ });
/* harmony import */ var F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(998283);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(732696);
/* harmony import */ var _Data_Artifacts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(261420);
/* harmony import */ var _Data_Artifacts_ArtifactSheet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(374637);
/* harmony import */ var _GeneralAutocomplete__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(843966);
/* harmony import */ var _Image_ImgIcon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(726578);
/* harmony import */ var _StarDisplay__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(871765);
/* harmony import */ var _sortByRarityAndName__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(691672);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(552903);

const _excluded = ["artSetKey", "setArtSetKey", "label"];











function ArtifactSetAutocomplete(_ref) {
  let {
      artSetKey,
      setArtSetKey,
      label = ""
    } = _ref,
    props = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z)(_ref, _excluded);
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_1__/* .useTranslation */ .$G)(["artifact", "artifactNames_gen"]);
  label = label ? label : t("artifact:autocompleteLabels.set");
  const options = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => Object.entries(_Data_Artifacts__WEBPACK_IMPORTED_MODULE_2__/* .setKeysByRarities */ .WO).flatMap(([rarity, sets]) => sets.map(set => ({
    key: set,
    label: t(`artifactNames_gen:${set}`),
    grouper: +rarity
  }))).sort(_sortByRarityAndName__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z), [t]);
  const toImg = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(key => key ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_Image_ImgIcon__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
    src: (0,_Data_Artifacts_ArtifactSheet__WEBPACK_IMPORTED_MODULE_3__/* .artifactDefIcon */ .jU)(key),
    sx: {
      fontSize: "1.5em"
    }
  }) : undefined, []);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_GeneralAutocomplete__WEBPACK_IMPORTED_MODULE_4__/* .GeneralAutocomplete */ ._, Object.assign({
    options: options,
    valueKey: artSetKey,
    onChange: k => setArtSetKey(k != null ? k : ""),
    toImg: toImg,
    label: label,
    groupBy: option => {
      var _option$grouper$toStr, _option$grouper;
      return (_option$grouper$toStr = (_option$grouper = option.grouper) == null ? void 0 : _option$grouper.toString()) != null ? _option$grouper$toStr : "";
    },
    renderGroup: params => params.group && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.List, {
      component: _mui_material__WEBPACK_IMPORTED_MODULE_10__.Box,
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.ListSubheader, {
        sx: {
          top: "-1em"
        },
        children: [params.group, " ", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_StarDisplay__WEBPACK_IMPORTED_MODULE_6__/* .StarsDisplay */ .q, {
          stars: +params.group,
          inline: true
        })]
      }, `${params.group}Header`), params.children]
    }, params.group)
  }, props));
}

/***/ }),

/***/ 691672:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ sortByRarityAndName)
/* harmony export */ });
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(947955);

function sortByRarityAndName(a, b) {
  if (a.grouper > b.grouper) {
    return -1;
  }
  if (a.grouper < b.grouper) {
    return 1;
  }
  const aName = _i18n__WEBPACK_IMPORTED_MODULE_0__/* ["default"].t */ .Z.t(`artifactNames_gen:${a.key}`);
  const bName = _i18n__WEBPACK_IMPORTED_MODULE_0__/* ["default"].t */ .Z.t(`artifactNames_gen:${b.key}`);
  if (aName < bName) {
    return -1;
  }
  if (aName > bName) {
    return 1;
  }
  return 0;
}

/***/ }),

/***/ 352757:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_0__);

const ImgFullwidth = (0,_mui_material__WEBPACK_IMPORTED_MODULE_0__.styled)("img")({
  width: "100%",
  height: "auto"
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ImgFullwidth);

/***/ }),

/***/ 346026:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ SortByButton)
/* harmony export */ });
/* harmony import */ var F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(998283);
/* harmony import */ var _mui_icons_material_Sort__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(497053);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(732696);
/* harmony import */ var _DropdownMenu_DropdownButton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(645475);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(552903);

const _excluded = ["sortKeys", "value", "onChange", "ascending", "onChangeAsc"];





// Assumes that all the sortKeys has corresponding translations in ui.json sortMap


function SortByButton(_ref) {
  let {
      sortKeys,
      value,
      onChange,
      ascending,
      onChangeAsc
    } = _ref,
    props = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z)(_ref, _excluded);
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_0__/* .useTranslation */ .$G)("ui");
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_4__.Box, {
    display: "flex",
    alignItems: "center",
    gap: 1,
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(react_i18next__WEBPACK_IMPORTED_MODULE_0__/* .Trans */ .cC, {
      t: t,
      i18nKey: "sortBy",
      children: "Sort by: "
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_4__.ButtonGroup, Object.assign({}, props, {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(_DropdownMenu_DropdownButton__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z, {
        title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(react_i18next__WEBPACK_IMPORTED_MODULE_0__/* .Trans */ .cC, {
          t: t,
          i18nKey: `sortMap.${value}`,
          children: {
            value: t(`sortMap.${value}`)
          }
        }),
        children: sortKeys.map(key => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_4__.MenuItem, {
          selected: value === key,
          disabled: value === key,
          onClick: () => onChange(key),
          children: t(`sortMap.${key}`)
        }, key))
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_4__.Button, {
        onClick: () => onChangeAsc(!ascending),
        startIcon: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(_mui_icons_material_Sort__WEBPACK_IMPORTED_MODULE_5__["default"], {
          sx: {
            transform: ascending ? "scale(1, -1)" : "scale(1)"
          }
        }),
        children: ascending ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(react_i18next__WEBPACK_IMPORTED_MODULE_0__/* .Trans */ .cC, {
          t: t,
          i18nKey: "ascending",
          children: "Ascending"
        }) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__/* .jsx */ .tZ)(react_i18next__WEBPACK_IMPORTED_MODULE_0__/* .Trans */ .cC, {
          t: t,
          i18nKey: "descending",
          children: "Descending"
        })
      })]
    }))]
  });
}

/***/ }),

/***/ 787051:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ TextButton)
/* harmony export */ });
/* harmony import */ var F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(998283);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(552903);

const _excluded = ["children", "disabled"];


const DisabledButton = (0,_mui_material__WEBPACK_IMPORTED_MODULE_0__.styled)(_mui_material__WEBPACK_IMPORTED_MODULE_0__.Button)(({
  theme
}) => ({
  "&.Mui-disabled": {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.text.secondary
  }
}));
function TextButton(_ref) {
  let {
      children
    } = _ref,
    props = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(_ref, _excluded);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__/* .jsx */ .tZ)(DisabledButton, Object.assign({}, props, {
    disabled: true,
    children: children
  }));
}

/***/ }),

/***/ 959236:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ ElementToggle)
});

// EXTERNAL MODULE: ../../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
var objectWithoutPropertiesLoose = __webpack_require__(998283);
// EXTERNAL MODULE: ../../libs/consts/src/index.ts
var src = __webpack_require__(682799);
// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ./src/app/KeyMap/StatIcon.tsx + 11 modules
var StatIcon = __webpack_require__(943397);
// EXTERNAL MODULE: ./src/app/Util/MultiSelect.ts
var MultiSelect = __webpack_require__(810618);
;// CONCATENATED MODULE: ./src/app/Components/SolidColoredToggleButton.tsx

const SolidColoredToggleButton = (0,node.styled)(node.ToggleButton, {
  shouldForwardProp: prop => prop !== "baseColor" && prop !== "selectedColor"
})(({
  theme,
  baseColor: _baseColor = "secondary",
  selectedColor: _selectedColor = "success"
}) => ({
  '&': {
    backgroundColor: theme.palette[_baseColor].main,
    color: theme.palette[_baseColor].contrastText
  },
  '&:hover': {
    backgroundColor: theme.palette[_baseColor].dark
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette[_selectedColor].main,
    color: theme.palette[_selectedColor].contrastText
  },
  '&.Mui-selected:hover': {
    backgroundColor: theme.palette[_selectedColor].dark
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette[_baseColor].dark
  },
  '&.Mui-selected.Mui-disabled': {
    backgroundColor: theme.palette[_selectedColor].dark
  }
}));
/* harmony default export */ const Components_SolidColoredToggleButton = (SolidColoredToggleButton);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/Components/ToggleButton/ElementToggle.tsx

const _excluded = ["value", "totals", "onChange"];







const elementHandler = (0,MultiSelect/* handleMultiSelect */.X)([...src/* allElements */.N]);
function ElementToggle(_ref) {
  let {
      value,
      totals,
      onChange
    } = _ref,
    props = (0,objectWithoutPropertiesLoose/* default */.Z)(_ref, _excluded);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.ToggleButtonGroup, Object.assign({
    exclusive: true,
    value: value
  }, props, {
    children: src/* allElements.map */.N.map(ele => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(Components_SolidColoredToggleButton, {
      value: ele,
      sx: {
        minWidth: "7em"
      },
      selectedColor: ele,
      onClick: () => onChange(elementHandler(value, ele)),
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* ElementIcon */.Z, {
        ele: ele
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
        sx: {
          ml: 0.5
        },
        label: totals[ele],
        size: "small"
      })]
    }, ele))
  }));
}

/***/ }),

/***/ 62978:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ RarityToggle)
/* harmony export */ });
/* harmony import */ var F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(998283);
/* harmony import */ var _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(682799);
/* harmony import */ var _mui_icons_material_StarRounded__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(478437);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _Util_MultiSelect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(810618);
/* harmony import */ var _SolidToggleButtonGroup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(29432);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(552903);

const _excluded = ["value", "totals", "onChange"];







const rarityHandler = (0,_Util_MultiSelect__WEBPACK_IMPORTED_MODULE_2__/* .handleMultiSelect */ .X)([..._genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allRarities */ .wC]);
function RarityToggle(_ref) {
  let {
      value,
      totals,
      onChange
    } = _ref,
    props = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z)(_ref, _excluded);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_SolidToggleButtonGroup__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z, Object.assign({
    exclusive: true,
    value: value
  }, props, {
    children: _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allRarities.map */ .wC.map(star => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_5__.ToggleButton, {
      value: star,
      sx: {
        minWidth: "7em"
      },
      onClick: () => onChange(rarityHandler(value, star)),
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_5__.Box, {
        display: "flex",
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)("strong", {
          children: star
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_icons_material_StarRounded__WEBPACK_IMPORTED_MODULE_6__["default"], {}), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_5__.Chip, {
          label: totals[star],
          size: "small"
        })]
      })
    }, star))
  }));
}

/***/ }),

/***/ 489431:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WeaponSelectionModal)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(682799);
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(918676);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(202784);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(732696);
/* harmony import */ var _Assets_Assets__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(378547);
/* harmony import */ var _Data_Weapons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(951077);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(225870);
/* harmony import */ var _Util_totalUtils__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(840775);
/* harmony import */ var _Card_CardDark__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(87985);
/* harmony import */ var _Card_CardLight__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(567937);
/* harmony import */ var _CloseButton__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(672055);
/* harmony import */ var _Image_ImgIcon__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(726578);
/* harmony import */ var _ModalWrapper__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(898927);
/* harmony import */ var _StarDisplay__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(871765);
/* harmony import */ var _ToggleButton_RarityToggle__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(62978);
/* harmony import */ var _ToggleButton_WeaponToggle__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(229117);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(552903);



















function WeaponSelectionModal({
  show,
  ascension = 0,
  onHide,
  onSelect,
  filter = () => true,
  weaponTypeFilter
}) {
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_3__/* .useTranslation */ .$G)(["page_weapon", "weaponNames_gen"]);
  const [weaponFilter, setWeaponfilter] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(weaponTypeFilter ? [weaponTypeFilter] : [..._genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allWeaponTypeKeys */ .yd]);
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_2__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_6__/* .DatabaseContext */ .t);
  const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(database.displayWeapon.get());
  (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => database.displayWeapon.follow((r, dbMeta) => setState(dbMeta)), [database]);
  (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => weaponTypeFilter && setWeaponfilter([weaponTypeFilter]), [weaponTypeFilter]);
  const [searchTerm, setSearchTerm] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)("");
  const deferredSearchTerm = (0,react__WEBPACK_IMPORTED_MODULE_2__.useDeferredValue)(searchTerm);
  const {
    rarity
  } = state;
  const weaponIdList = (0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allWeaponKeys.filter */ .fG.filter(wKey => filter((0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_5__/* .getWeaponSheet */ .ub)(wKey))).filter(wKey => weaponFilter.includes((0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_5__/* .getWeaponSheet */ .ub)(wKey).weaponType)).filter(wKey => !deferredSearchTerm || t(`weaponNames_gen:${wKey}`).toLowerCase().includes(deferredSearchTerm.toLowerCase())).filter(wKey => rarity.includes((0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_5__/* .getWeaponSheet */ .ub)(wKey).rarity)).sort((a, b) => (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_5__/* .getWeaponSheet */ .ub)(b).rarity - (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_5__/* .getWeaponSheet */ .ub)(a).rarity), [deferredSearchTerm, filter, rarity, t, weaponFilter]);
  const weaponTotals = (0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => (0,_Util_totalUtils__WEBPACK_IMPORTED_MODULE_15__/* .catTotal */ .W)(_genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allWeaponTypeKeys */ .yd, ct => _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allWeaponKeys.forEach */ .fG.forEach(wk => {
    const wtk = (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_5__/* .getWeaponSheet */ .ub)(wk).weaponType;
    ct[wtk].total++;
    if (weaponIdList.includes(wk)) ct[wtk].current++;
  })), [weaponIdList]);
  const weaponRarityTotals = (0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => (0,_Util_totalUtils__WEBPACK_IMPORTED_MODULE_15__/* .catTotal */ .W)(_genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allRarities */ .wC, ct => _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allWeaponKeys.forEach */ .fG.forEach(wk => {
    const wr = (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_5__/* .getWeaponSheet */ .ub)(wk).rarity;
    ct[wr].total++;
    if (weaponIdList.includes(wk)) ct[wr].current++;
  })), [weaponIdList]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_ModalWrapper__WEBPACK_IMPORTED_MODULE_11__/* ["default"] */ .Z, {
    open: show,
    onClose: onHide,
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_Card_CardDark__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.CardContent, {
        sx: {
          py: 1
        },
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Grid, {
          container: true,
          spacing: 1,
          children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_ToggleButton_WeaponToggle__WEBPACK_IMPORTED_MODULE_14__/* ["default"] */ .Z, {
              value: weaponFilter,
              totals: weaponTotals,
              onChange: setWeaponfilter,
              disabled: !!weaponTypeFilter,
              size: "small"
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_ToggleButton_RarityToggle__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .Z, {
              sx: {
                height: "100%"
              },
              onChange: rarity => database.displayWeapon.set({
                rarity
              }),
              value: rarity,
              totals: weaponRarityTotals,
              size: "small"
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Grid, {
            item: true,
            flexGrow: 1,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.TextField, {
              autoFocus: true,
              size: "small",
              value: searchTerm,
              onChange: e => setSearchTerm(e.target.value),
              label: t("weaponName"),
              sx: {
                height: "100%"
              },
              InputProps: {
                sx: {
                  height: "100%"
                }
              }
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_CloseButton__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
              onClick: onHide
            })
          })]
        })
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Divider, {}), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.CardContent, {
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Grid, {
          container: true,
          spacing: 1,
          children: weaponIdList.map(weaponKey => {
            var _Assets$weaponTypes;
            const weaponSheet = (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_5__/* .getWeaponSheet */ .ub)(weaponKey);
            return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Grid, {
              item: true,
              lg: 3,
              md: 4,
              children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_Card_CardLight__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
                sx: {
                  height: "100%"
                },
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.CardActionArea, {
                  onClick: () => {
                    onHide();
                    onSelect(weaponKey);
                  },
                  sx: {
                    display: "flex"
                  },
                  children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
                    component: "img",
                    src: (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_1__/* .weaponAsset */ .Aq)(weaponKey, ascension >= 2),
                    sx: {
                      width: 100,
                      height: "auto"
                    },
                    className: ` grad-${weaponSheet.rarity}star`
                  }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
                    sx: {
                      flexGrow: 1,
                      px: 1
                    },
                    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Typography, {
                      variant: "subtitle1",
                      children: weaponSheet.name
                    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Typography, {
                      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_Image_ImgIcon__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
                        size: 1.5,
                        src: (_Assets$weaponTypes = _Assets_Assets__WEBPACK_IMPORTED_MODULE_4__/* ["default"].weaponTypes */ .Z.weaponTypes) == null ? void 0 : _Assets$weaponTypes[weaponSheet.weaponType]
                      }), " ", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_StarDisplay__WEBPACK_IMPORTED_MODULE_12__/* .StarsDisplay */ .q, {
                        stars: weaponSheet.rarity,
                        colored: true
                      })]
                    })]
                  })]
                })
              })
            }, weaponKey);
          })
        })
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Divider, {}), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.CardContent, {
        sx: {
          py: 1
        },
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_CloseButton__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
          large: true,
          onClick: onHide
        })
      })]
    })
  });
}

/***/ }),

/***/ 701296:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CharacterSelectionModal)
/* harmony export */ });
/* harmony import */ var F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(998283);
/* harmony import */ var _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(682799);
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(918676);
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(111084);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(202784);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(732696);
/* harmony import */ var _Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(87985);
/* harmony import */ var _Components_Card_CardLight__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(567937);
/* harmony import */ var _Components_Character_CharacterCard__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(450875);
/* harmony import */ var _Components_CloseButton__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(672055);
/* harmony import */ var _Components_ModalWrapper__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(898927);
/* harmony import */ var _Components_SortByButton__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(346026);
/* harmony import */ var _Components_SqBadge__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(783673);
/* harmony import */ var _Components_StarDisplay__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(871765);
/* harmony import */ var _Components_ToggleButton_ElementToggle__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(959236);
/* harmony import */ var _Components_ToggleButton_WeaponToggle__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(229117);
/* harmony import */ var _Context_DataContext__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(790);
/* harmony import */ var _Data_Characters__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(970630);
/* harmony import */ var _Data_LevelData__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(821626);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(225870);
/* harmony import */ var _ReactHooks_useCharacter__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(944304);
/* harmony import */ var _ReactHooks_useCharMeta__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(132560);
/* harmony import */ var _ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(610002);
/* harmony import */ var _ReactHooks_useForceUpdate__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(536617);
/* harmony import */ var _Util_CharacterSort__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(945069);
/* harmony import */ var _Util_SortByFilters__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(601661);
/* harmony import */ var _Util_totalUtils__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(840775);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(552903);

const _excluded = ["className"];





























const sortKeys = Object.keys(_Util_CharacterSort__WEBPACK_IMPORTED_MODULE_22__/* .characterSortMap */ .V3);
function CharacterSelectionModal({
  show,
  onHide,
  onSelect,
  filter = () => true,
  newFirst = false
}) {
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_3__/* .useTranslation */ .$G)(["page_character", "charNames_gen"]);
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_2__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_17__/* .DatabaseContext */ .t);
  const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(() => database.displayCharacter.get());
  (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => database.displayCharacter.follow((r, s) => setState(s)), [database, setState]);
  const {
    gender
  } = (0,_ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_20__/* ["default"] */ .Z)();
  const [dbDirty, forceUpdate] = (0,_ReactHooks_useForceUpdate__WEBPACK_IMPORTED_MODULE_21__/* ["default"] */ .Z)();

  // character favorite updater
  (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => database.charMeta.followAny(s => forceUpdate()), [forceUpdate, database]);
  const [searchTerm, setSearchTerm] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)("");
  const deferredSearchTerm = (0,react__WEBPACK_IMPORTED_MODULE_2__.useDeferredValue)(searchTerm);
  const deferredState = (0,react__WEBPACK_IMPORTED_MODULE_2__.useDeferredValue)(state);
  const deferredDbDirty = (0,react__WEBPACK_IMPORTED_MODULE_2__.useDeferredValue)(dbDirty);
  const characterKeyList = (0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => {
    var _characterSortMap$sor;
    const {
      element,
      weaponType,
      sortType,
      ascending
    } = deferredState;
    const sortByKeys = [...(newFirst ? ["new"] : []), ...((_characterSortMap$sor = _Util_CharacterSort__WEBPACK_IMPORTED_MODULE_22__/* .characterSortMap */ .V3[sortType]) != null ? _characterSortMap$sor : [])];
    return deferredDbDirty && _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allCharacterKeys.filter */ .IV.filter(key => filter(database.chars.get(key), (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_15__/* .getCharSheet */ .m)(key, gender))).filter((0,_Util_SortByFilters__WEBPACK_IMPORTED_MODULE_23__/* .filterFunction */ .C)({
      element,
      weaponType,
      name: deferredSearchTerm
    }, (0,_Util_CharacterSort__WEBPACK_IMPORTED_MODULE_22__/* .characterFilterConfigs */ .zU)(database))).sort((0,_Util_SortByFilters__WEBPACK_IMPORTED_MODULE_23__/* .sortFunction */ .e)(sortByKeys, ascending, (0,_Util_CharacterSort__WEBPACK_IMPORTED_MODULE_22__/* .characterSortConfigs */ ._L)(database), ["new", "favorite"]));
  }, [database, newFirst, deferredState, deferredDbDirty, deferredSearchTerm, gender, filter]);
  const weaponTotals = (0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => (0,_Util_totalUtils__WEBPACK_IMPORTED_MODULE_24__/* .catTotal */ .W)(_genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allWeaponTypeKeys */ .yd, ct => _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allCharacterKeys.forEach */ .IV.forEach(ck => {
    const wtk = (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_15__/* .getCharSheet */ .m)(ck, database.gender).weaponTypeKey;
    ct[wtk].total++;
    if (characterKeyList.includes(ck)) ct[wtk].current++;
  })), [characterKeyList, database]);
  const elementTotals = (0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)(() => (0,_Util_totalUtils__WEBPACK_IMPORTED_MODULE_24__/* .catTotal */ .W)(_genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allElements */ .N, ct => _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allCharacterKeys.forEach */ .IV.forEach(ck => {
    const ele = (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_15__/* .getCharSheet */ .m)(ck, database.gender).elementKey;
    ct[ele].total++;
    if (characterKeyList.includes(ck)) ct[ele].current++;
  })), [characterKeyList, database]);
  const {
    weaponType,
    element,
    sortType,
    ascending
  } = state;
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Components_ModalWrapper__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
    open: show,
    onClose: onHide,
    sx: {
      "& .MuiContainer-root": {
        justifyContent: "normal"
      }
    },
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.CardContent, {
        sx: {
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap"
        },
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Components_ToggleButton_WeaponToggle__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .Z, {
          sx: {
            height: "100%"
          },
          onChange: weaponType => database.displayCharacter.set({
            weaponType
          }),
          value: weaponType,
          totals: weaponTotals,
          size: "small"
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Components_ToggleButton_ElementToggle__WEBPACK_IMPORTED_MODULE_12__/* ["default"] */ .Z, {
          sx: {
            height: "100%"
          },
          onChange: element => database.displayCharacter.set({
            element
          }),
          value: element,
          totals: elementTotals,
          size: "small"
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
          flexGrow: 1,
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.TextField, {
            autoFocus: true,
            value: searchTerm,
            onChange: e => setSearchTerm(e.target.value),
            label: t("characterName"),
            size: "small",
            sx: {
              height: "100%"
            },
            InputProps: {
              sx: {
                height: "100%"
              }
            }
          })
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Components_SortByButton__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
          sx: {
            height: "100%"
          },
          sortKeys: sortKeys,
          value: sortType,
          onChange: sortType => database.displayCharacter.set({
            sortType
          }),
          ascending: ascending,
          onChangeAsc: ascending => database.displayCharacter.set({
            ascending
          })
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Components_CloseButton__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
          onClick: onHide
        })]
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Divider, {}), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Context_DataContext__WEBPACK_IMPORTED_MODULE_14__/* .DataContext.Provider */ .R.Provider, {
        value: {
          teamData: undefined
        },
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.CardContent, {
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Grid, {
            container: true,
            spacing: 1,
            columns: {
              xs: 2,
              sm: 3,
              md: 4,
              lg: 5
            },
            children: characterKeyList.map(characterKey => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Grid, {
              item: true,
              xs: 1,
              children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(SelectionCard, {
                characterKey: characterKey,
                onClick: () => {
                  onHide();
                  onSelect == null ? void 0 : onSelect(characterKey);
                }
              })
            }, characterKey))
          })
        })
      })]
    })
  });
}
const CustomTooltip = (0,_mui_material__WEBPACK_IMPORTED_MODULE_26__.styled)(_ref => {
  let {
      className
    } = _ref,
    props = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_27__/* ["default"] */ .Z)(_ref, _excluded);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Tooltip, Object.assign({}, props, {
    classes: {
      popper: className
    }
  }));
})({
  [`& .${_mui_material__WEBPACK_IMPORTED_MODULE_26__.tooltipClasses.tooltip}`]: {
    padding: 0
  }
});
function SelectionCard({
  characterKey,
  onClick
}) {
  var _characterSheet$rarit;
  const {
    gender
  } = (0,_ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_20__/* ["default"] */ .Z)();
  const characterSheet = (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_15__/* .getCharSheet */ .m)(characterKey, gender);
  const character = (0,_ReactHooks_useCharacter__WEBPACK_IMPORTED_MODULE_18__/* ["default"] */ .Z)(characterKey);
  const {
    favorite
  } = (0,_ReactHooks_useCharMeta__WEBPACK_IMPORTED_MODULE_19__/* ["default"] */ .Z)(characterKey);
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_2__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_17__/* .DatabaseContext */ .t);
  const [open, setOpen] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const handleClose = (0,react__WEBPACK_IMPORTED_MODULE_2__.useCallback)(() => setOpen(false), []);
  const handleOpen = (0,react__WEBPACK_IMPORTED_MODULE_2__.useCallback)(() => setOpen(true), []);
  const {
    level = 1,
    ascension = 0,
    constellation = 0
  } = character != null ? character : {};
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(CustomTooltip, {
    enterDelay: 300,
    enterNextDelay: 300,
    arrow: true,
    placement: "bottom",
    open: open,
    onClose: handleClose,
    onOpen: handleOpen,
    title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
      sx: {
        width: 300
      },
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Components_Character_CharacterCard__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
        hideStats: true,
        characterKey: characterKey
      })
    }),
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_Components_Card_CardLight__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
        sx: {
          flexGrow: 1,
          display: "flex",
          flexDirection: "column"
        },
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
          sx: {
            position: "absolute",
            opacity: 0.7,
            zIndex: 2
          },
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.IconButton, {
            sx: {
              p: 0.25
            },
            onClick: _ => {
              setOpen(false);
              database.charMeta.set(characterKey, {
                favorite: !favorite
              });
            },
            children: favorite ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_28__/* .Favorite */ .rFe, {}) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_28__/* .FavoriteBorder */ .Ieo, {})
          })
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.CardActionArea, {
          onClick: onClick,
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
            display: "flex",
            position: "relative",
            className: `grad-${characterSheet == null ? void 0 : characterSheet.rarity}star`,
            sx: {
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                opacity: 0.5,
                backgroundImage: `url(${(0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_1__/* .characterAsset */ .Li)(characterKey, "banner", gender)})`,
                backgroundPosition: "center",
                backgroundSize: "cover"
              }
            },
            width: "100%",
            children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
              flexShrink: 1,
              sx: {
                maxWidth: {
                  xs: "33%",
                  lg: "30%"
                }
              },
              alignSelf: "flex-end",
              display: "flex",
              flexDirection: "column",
              zIndex: 1,
              children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
                component: "img",
                src: (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_1__/* .characterAsset */ .Li)(characterKey, "icon", gender),
                width: "100%",
                height: "auto",
                maxWidth: 256,
                sx: {
                  mt: "auto"
                }
              })
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
              flexGrow: 1,
              sx: {
                pr: 1,
                pt: 1
              },
              display: "flex",
              flexDirection: "column",
              zIndex: 1,
              justifyContent: "space-evenly",
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Typography, {
                variant: "body2",
                sx: {
                  flexGrow: 1
                },
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Components_SqBadge__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
                  color: characterSheet == null ? void 0 : characterSheet.elementKey,
                  sx: {
                    opacity: 0.85,
                    textShadow: "0 0 5px gray"
                  },
                  children: characterSheet == null ? void 0 : characterSheet.name
                })
              }), character ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
                sx: {
                  display: "flex",
                  gap: 1,
                  alignItems: "center"
                },
                children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Box, {
                  sx: {
                    textShadow: "0 0 5px gray"
                  },
                  children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Typography, {
                    variant: "body2",
                    component: "span",
                    whiteSpace: "nowrap",
                    children: ["Lv. ", level]
                  }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Typography, {
                    variant: "body2",
                    component: "span",
                    color: "text.secondary",
                    children: ["/", _Data_LevelData__WEBPACK_IMPORTED_MODULE_16__/* .ascensionMaxLevel */ .SJ[ascension]]
                  })]
                }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Typography, {
                  variant: "body2",
                  children: ["C", constellation]
                })]
              }) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_26__.Typography, {
                component: "span",
                variant: "body2",
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Components_SqBadge__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
                  children: "NEW"
                })
              }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__/* .jsx */ .tZ)(_Components_StarDisplay__WEBPACK_IMPORTED_MODULE_11__/* .StarsDisplay */ .q, {
                stars: (_characterSheet$rarit = characterSheet == null ? void 0 : characterSheet.rarity) != null ? _characterSheet$rarit : 1,
                colored: true
              })]
            })]
          })
        })]
      })
    })
  });
}

/***/ }),

/***/ 603694:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ WeaponCard)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(918676);
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(111084);
/* harmony import */ var _mui_icons_material_DeleteForever__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(222698);
/* harmony import */ var _mui_icons_material_Edit__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(429754);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(202784);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(732696);
/* harmony import */ var _Assets_Assets__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(378547);
/* harmony import */ var _Components_Card_CardLight__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(567937);
/* harmony import */ var _Components_Character_LocationAutocomplete__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(443007);
/* harmony import */ var _Components_Character_LocationName__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(37923);
/* harmony import */ var _Components_ConditionalWrapper__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(157889);
/* harmony import */ var _Components_Image_ImgIcon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(726578);
/* harmony import */ var _Components_StarDisplay__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(871765);
/* harmony import */ var _Data_LevelData__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(821626);
/* harmony import */ var _Data_Weapons__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(951077);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(225870);
/* harmony import */ var _Formula__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(534958);
/* harmony import */ var _Formula_api__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(130507);
/* harmony import */ var _Formula_uiData__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(961278);
/* harmony import */ var _ReactHooks_useWeapon__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(694758);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(552903);
let _ = t => t,
  _t;























function WeaponCard({
  weaponId,
  onClick,
  onEdit,
  onDelete,
  canEquip = false,
  extraButtons
}) {
  var _Assets$weaponTypes;
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_2__/* .useTranslation */ .$G)(["page_weapon", "ui"]);
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_11__/* .DatabaseContext */ .t);
  const databaseWeapon = (0,_ReactHooks_useWeapon__WEBPACK_IMPORTED_MODULE_15__/* ["default"] */ .Z)(weaponId);
  const weapon = databaseWeapon;
  const weaponSheet = weapon != null && weapon.key ? (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_10__/* .getWeaponSheet */ .ub)(weapon.key) : undefined;
  const filter = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(cs => cs.weaponTypeKey === (weaponSheet == null ? void 0 : weaponSheet.weaponType), [weaponSheet]);
  const wrapperFunc = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(children => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.CardActionArea, {
    onClick: () => onClick == null ? void 0 : onClick(weaponId),
    children: children
  }), [onClick, weaponId]);
  const falseWrapperFunc = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(children => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
    children: children
  }), []);
  const setLocation = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(k => weaponId && database.weapons.set(weaponId, {
    location: k
  }), [database, weaponId]);
  const UIData = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => weaponSheet && weapon && (0,_Formula_api__WEBPACK_IMPORTED_MODULE_13__/* .computeUIData */ .mP)([weaponSheet.data, (0,_Formula_api__WEBPACK_IMPORTED_MODULE_13__/* .dataObjForWeapon */ .v0)(weapon)]), [weaponSheet, weapon]);
  if (!weapon || !weaponSheet || !UIData) return null;
  const {
    level,
    ascension,
    refinement,
    id,
    location = "",
    lock
  } = weapon;
  const weaponTypeKey = UIData.get(_Formula__WEBPACK_IMPORTED_MODULE_12__/* .uiInput.weapon.type */ .ri.weapon.type).value;
  const stats = [_Formula__WEBPACK_IMPORTED_MODULE_12__/* .uiInput.weapon.main */ .ri.weapon.main, _Formula__WEBPACK_IMPORTED_MODULE_12__/* .uiInput.weapon.sub */ .ri.weapon.sub, _Formula__WEBPACK_IMPORTED_MODULE_12__/* .uiInput.weapon.sub2 */ .ri.weapon.sub2].map(x => UIData.get(x));
  const img = (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__/* .weaponAsset */ .Aq)(weapon.key, ascension >= 2);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
    fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Skeleton, {
      variant: "rectangular",
      sx: {
        width: "100%",
        height: "100%",
        minHeight: 300
      }
    }),
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_Components_Card_CardLight__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
      sx: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      },
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_Components_ConditionalWrapper__WEBPACK_IMPORTED_MODULE_18__/* ["default"] */ .Z, {
        condition: !!onClick,
        wrapper: wrapperFunc,
        falseWrapper: falseWrapperFunc,
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
          className: `grad-${weaponSheet.rarity}star`,
          sx: {
            position: "relative",
            pt: 2,
            px: 2
          },
          children: [!onClick && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.IconButton, {
            color: "primary",
            onClick: () => database.weapons.set(id, {
              lock: !lock
            }),
            sx: {
              position: "absolute",
              right: 0,
              bottom: 0,
              zIndex: 2
            },
            children: lock ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_19__/* .Lock */ .HEZ, {}) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_19__/* .LockOpen */ .M0f, {})
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
            sx: {
              position: "relative",
              zIndex: 1
            },
            children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
              component: "div",
              sx: {
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1
              },
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_Components_Image_ImgIcon__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
                sx: {
                  fontSize: "1.5em"
                },
                src: (_Assets$weaponTypes = _Assets_Assets__WEBPACK_IMPORTED_MODULE_3__/* ["default"].weaponTypes */ .Z.weaponTypes) == null ? void 0 : _Assets$weaponTypes[weaponTypeKey]
              }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Typography, {
                noWrap: true,
                sx: {
                  textAlign: "center",
                  backgroundColor: "rgba(100,100,100,0.35)",
                  borderRadius: "1em",
                  px: 1
                },
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)("strong", {
                  children: weaponSheet.name
                })
              })]
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Typography, {
              component: "span",
              variant: "h5",
              children: ["Lv. ", level]
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Typography, {
              component: "span",
              variant: "h5",
              color: "text.secondary",
              children: ["/", _Data_LevelData__WEBPACK_IMPORTED_MODULE_9__/* .ascensionMaxLevel */ .SJ[ascension]]
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Typography, {
              variant: "h6",
              children: ["Refinement ", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)("strong", {
                children: refinement
              })]
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_Components_StarDisplay__WEBPACK_IMPORTED_MODULE_8__/* .StarsDisplay */ .q, {
              stars: weaponSheet.rarity,
              colored: true
            })]
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
            sx: {
              height: "100%",
              position: "absolute",
              right: 0,
              top: 0
            },
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
              component: "img",
              src: img != null ? img : "",
              width: "auto",
              height: "100%",
              sx: {
                float: "right"
              }
            })
          })]
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.CardContent, {
          children: stats.map(node => {
            if (!node.info.name) return null;
            return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
              sx: {
                display: "flex"
              },
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Typography, {
                flexGrow: 1,
                children: [node.info.icon, " ", node.info.name]
              }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Typography, {
                children: (0,_Formula_uiData__WEBPACK_IMPORTED_MODULE_14__/* .nodeVStr */ .p)(node)
              })]
            }, JSON.stringify(node.info));
          })
        })]
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
        sx: {
          p: 1,
          display: "flex",
          gap: 1,
          justifyContent: "space-between",
          alignItems: "center"
        },
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Box, {
          sx: {
            flexGrow: 1
          },
          children: canEquip ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_Components_Character_LocationAutocomplete__WEBPACK_IMPORTED_MODULE_5__/* .LocationAutocomplete */ .W, {
            location: location,
            setLocation: setLocation,
            filter: filter,
            autoCompleteProps: {
              getOptionDisabled: t => !t.key,
              disableClearable: true
            }
          }) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_Components_Character_LocationName__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
            location: location
          })
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.ButtonGroup, {
          sx: {
            height: "100%"
          },
          children: [!!onEdit && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Tooltip, {
            title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Typography, {
              children: t(_t || (_t = _`page_weapon:edit`))
            }),
            placement: "top",
            arrow: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Button, {
              color: "info",
              onClick: () => onEdit(id),
              children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_icons_material_Edit__WEBPACK_IMPORTED_MODULE_20__["default"], {})
            })
          }), !!onDelete && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_17__.Button, {
            color: "error",
            onClick: () => onDelete(id),
            disabled: !!location || lock,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_16__/* .jsx */ .tZ)(_mui_icons_material_DeleteForever__WEBPACK_IMPORTED_MODULE_21__["default"], {})
          }), extraButtons]
        })]
      })]
    })
  });
}

/***/ }),

/***/ 607380:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(552903);


const DiscordIcon = (0,_mui_material__WEBPACK_IMPORTED_MODULE_0__.createSvgIcon)((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__/* .jsx */ .tZ)("path", {
  d: "M 20.332031 4.226562 C 18.777344 3.5 17.117188 2.972656 15.378906 2.671875 C 15.164062 3.058594 14.917969 3.574219 14.746094 3.988281 C 12.898438 3.710938 11.070312 3.710938 9.257812 3.988281 C 9.085938 3.574219 8.832031 3.058594 8.617188 2.671875 C 6.875 2.972656 5.214844 3.503906 3.660156 4.230469 C 0.527344 8.96875 -0.324219 13.585938 0.101562 18.136719 C 2.179688 19.6875 4.195312 20.632812 6.175781 21.25 C 6.664062 20.574219 7.097656 19.859375 7.476562 19.105469 C 6.757812 18.835938 6.074219 18.5 5.425781 18.109375 C 5.597656 17.980469 5.765625 17.847656 5.929688 17.710938 C 9.878906 19.558594 14.167969 19.558594 18.070312 17.710938 C 18.234375 17.847656 18.402344 17.980469 18.574219 18.109375 C 17.921875 18.5 17.238281 18.835938 16.519531 19.109375 C 16.898438 19.859375 17.332031 20.578125 17.820312 21.25 C 19.804688 20.632812 21.820312 19.691406 23.898438 18.136719 C 24.394531 12.859375 23.046875 8.285156 20.332031 4.226562 Z M 8.011719 15.335938 C 6.828125 15.335938 5.855469 14.230469 5.855469 12.882812 C 5.855469 11.535156 6.808594 10.425781 8.011719 10.425781 C 9.21875 10.425781 10.191406 11.53125 10.171875 12.882812 C 10.171875 14.230469 9.21875 15.335938 8.011719 15.335938 Z M 15.988281 15.335938 C 14.800781 15.335938 13.828125 14.230469 13.828125 12.882812 C 13.828125 11.535156 14.78125 10.425781 15.988281 10.425781 C 17.191406 10.425781 18.164062 11.53125 18.144531 12.882812 C 18.144531 14.230469 17.191406 15.335938 15.988281 15.335938 Z M 15.988281 15.335938 "
}), "Discord");
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DiscordIcon);

/***/ })

}]);