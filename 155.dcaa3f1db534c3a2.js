"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[155,334],{

/***/ 185213:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "A": () => (/* binding */ ArtifactSetTooltipContent),
/* harmony export */   "Z": () => (/* binding */ ArtifactSetTooltip)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(732696);
/* harmony import */ var _BootstrapTooltip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(507300);
/* harmony import */ var _SqBadge__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(783673);
/* harmony import */ var _Translate__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(721845);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(552903);








function ArtifactSetTooltip({
  children,
  artifactSheet,
  numInSet = 5
}) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
    placement: "top",
    title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(ArtifactSetTooltipContent, {
      artifactSheet: artifactSheet,
      numInSet: numInSet
    }),
    disableInteractive: true,
    children: children
  });
}
function ArtifactSetTooltipContent({
  artifactSheet,
  numInSet = 5
}) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, {
    fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Skeleton, {
      variant: "rectangular",
      width: 100,
      height: 100
    }),
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(SetToolTipTitle, {
      artifactSheet: artifactSheet,
      numInSet: numInSet
    })
  });
}
function SetToolTipTitle({
  artifactSheet,
  numInSet = 5
}) {
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_1__/* .useTranslation */ .$G)("sheet");
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Stack, {
    spacing: 2,
    sx: {
      p: 1
    },
    children: Object.keys(artifactSheet.setEffects).map(setKey => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Box, {
      sx: {
        opacity: parseInt(setKey) <= numInSet ? 1 : 0.5
      },
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Typography, {
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_SqBadge__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
          color: "success",
          children: t(`${setKey}set`)
        })
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Typography, {
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_Translate__WEBPACK_IMPORTED_MODULE_4__/* .Translate */ .v, {
          ns: `artifact_${artifactSheet.key}_gen`,
          key18: `setEffects.${setKey}`
        })
      })]
    }, setKey))
  });
}

/***/ }),

/***/ 612121:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ SubstatToggle)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _KeyMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(419807);
/* harmony import */ var _KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(943397);
/* harmony import */ var _SVGIcons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(929063);
/* harmony import */ var _Types_artifact__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(469190);
/* harmony import */ var _SolidToggleButtonGroup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(29432);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(552903);








function SubstatToggle({
  selectedKeys,
  onChange
}) {
  const keys1 = _Types_artifact__WEBPACK_IMPORTED_MODULE_4__/* .allSubstatKeys.slice */ ._.slice(0, 6);
  const keys2 = _Types_artifact__WEBPACK_IMPORTED_MODULE_4__/* .allSubstatKeys.slice */ ._.slice(6);
  const selKeys1 = selectedKeys.filter(k => keys1.includes(k));
  const selKeys2 = selectedKeys.filter(k => keys2.includes(k));
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Grid, {
    container: true,
    spacing: 1,
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Grid, {
      item: true,
      xs: 12,
      md: 6,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_SolidToggleButtonGroup__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
        fullWidth: true,
        value: selKeys1,
        onChange: (e, arr) => onChange([...selKeys2, ...arr]),
        sx: {
          height: "100%"
        },
        children: keys1.map(key => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.ToggleButton, {
          size: "small",
          value: key,
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Box, {
            display: "flex",
            gap: 1,
            alignItems: "center",
            children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .C, {
              statKey: key,
              iconProps: _SVGIcons__WEBPACK_IMPORTED_MODULE_2__/* .iconInlineProps */ .m
            }), _KeyMap__WEBPACK_IMPORTED_MODULE_0__/* ["default"].getArtStr */ .ZP.getArtStr(key)]
          })
        }, key))
      })
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Grid, {
      item: true,
      xs: 12,
      md: 6,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_SolidToggleButtonGroup__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
        fullWidth: true,
        value: selKeys2,
        onChange: (e, arr) => onChange([...selKeys1, ...arr]),
        sx: {
          height: "100%"
        },
        children: keys2.map(key => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.ToggleButton, {
          size: "small",
          value: key,
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Box, {
            display: "flex",
            gap: 1,
            alignItems: "center",
            children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .C, {
              statKey: key,
              iconProps: _SVGIcons__WEBPACK_IMPORTED_MODULE_2__/* .iconInlineProps */ .m
            }), _KeyMap__WEBPACK_IMPORTED_MODULE_0__/* ["default"].getArtStr */ .ZP.getArtStr(key)]
          })
        }, key))
      })
    })]
  });
}

/***/ }),

/***/ 443007:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "W": () => (/* binding */ LocationAutocomplete)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(918676);
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(111084);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(202784);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(732696);
/* harmony import */ var _Data_Characters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(970630);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(225870);
/* harmony import */ var _ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(610002);
/* harmony import */ var _Types_consts__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(736893);
/* harmony import */ var _GeneralAutocomplete__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(843966);
/* harmony import */ var _ThumbSide__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(756748);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(552903);
let _ = t => t,
  _t;












function LocationAutocomplete({
  location,
  setLocation,
  filter = () => true,
  autoCompleteProps = {}
}) {
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_2__/* .useTranslation */ .$G)(["ui", "artifact", "charNames_gen"]);
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_4__/* .DatabaseContext */ .t);
  const {
    gender
  } = (0,_ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z)();
  const toText = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(key => t(`charNames_gen:${(0,_Types_consts__WEBPACK_IMPORTED_MODULE_6__/* .charKeyToCharName */ .LP)(database.chars.LocationToCharacterKey(key), gender)}`), [database, gender, t]);
  const toImg = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(key => key === "" ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_10__/* .BusinessCenter */ .J4P, {}) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_ThumbSide__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
    src: (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__/* .characterAsset */ .Li)(database.chars.LocationToCharacterKey(key), "iconSide", gender),
    sx: {
      pr: 1
    }
  }), [database, gender]);
  const isFavorite = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(key => key === "Traveler" ? _Types_consts__WEBPACK_IMPORTED_MODULE_6__/* .travelerKeys.some */ ._0.some(key => database.charMeta.get(key).favorite) : key ? database.charMeta.get(key).favorite : false, [database]);
  const values = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => [{
    key: "",
    label: t(_t || (_t = _`artifact:filterLocation.inventory`))
  }, ...Array.from(new Set(database.chars.keys.filter(k => (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_3__/* .getCharSheet */ .m)(k, gender) ? filter((0,_Data_Characters__WEBPACK_IMPORTED_MODULE_3__/* .getCharSheet */ .m)(k, gender)) : true).map(k => (0,_Types_consts__WEBPACK_IMPORTED_MODULE_6__/* .charKeyToLocCharKey */ .V7)(k)))).map(v => ({
    key: v,
    label: toText(v),
    favorite: isFavorite(v)
  })).sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return a.label.localeCompare(b.label);
  })], [t, toText, isFavorite, database, filter, gender]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
    fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_11__.Skeleton, {
      variant: "text",
      width: 100
    }),
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_GeneralAutocomplete__WEBPACK_IMPORTED_MODULE_7__/* .GeneralAutocomplete */ ._, Object.assign({
      size: "small",
      options: values,
      valueKey: location,
      onChange: k => setLocation(k != null ? k : ""),
      toImg: toImg
    }, autoCompleteProps))
  });
}

/***/ }),

/***/ 350301:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ LocationIcon)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(918676);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _Data_Characters__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(970630);
/* harmony import */ var _ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(610002);
/* harmony import */ var _BootstrapTooltip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(507300);
/* harmony import */ var _Image_ImgIcon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(726578);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(552903);







function LocationIcon({
  characterKey
}) {
  const {
    gender
  } = (0,_ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z)();
  const characterSheet = (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_1__/* .getCharSheet */ .m)(characterKey, gender);
  if (!characterSheet) return null;
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
    placement: "right-end",
    title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_6__.Typography, {
      children: characterSheet.name
    }),
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__/* .jsx */ .tZ)(_Image_ImgIcon__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
      src: (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__/* .characterAsset */ .Li)(characterKey, "iconSide", gender),
      size: 2.5,
      sx: {
        marginTop: "-1.5em",
        marginLeft: "-0.5em"
      }
    })
  });
}

/***/ }),

/***/ 37923:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ LocationName)
/* harmony export */ });
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(111084);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(732696);
/* harmony import */ var _Data_Characters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(970630);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(225870);
/* harmony import */ var _ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(610002);
/* harmony import */ var _LocationIcon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(350301);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(552903);










function LocationName({
  location
}) {
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_1__/* .useTranslation */ .$G)("ui");
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_3__/* .DatabaseContext */ .t);
  const {
    gender
  } = (0,_ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z)();
  const characterSheet = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => location ? (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_2__/* .getCharSheet */ .m)(database.chars.LocationToCharacterKey(location), gender) : undefined, [location, gender, database]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_7__.Typography, {
    component: "span",
    children: location && characterSheet != null && characterSheet.name ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsxs */ .BX)("span", {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_LocationIcon__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
        characterKey: database.chars.LocationToCharacterKey(location)
      }), " ", characterSheet.name]
    }) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsxs */ .BX)("span", {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_8__/* .BusinessCenter */ .J4P, {
        sx: {
          verticalAlign: "text-bottom"
        }
      }), " ", t("inventory")]
    })
  });
}

/***/ }),

/***/ 756748:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_0__);

const ThumbSide = (0,_mui_material__WEBPACK_IMPORTED_MODULE_0__.styled)("img")(({
  theme
}) => ({
  display: "inline-block",
  width: "auto",
  height: `2.3em`,
  lineHeight: 1,
  verticalAlign: "text-bottom",
  marginTop: theme.spacing(-3),
  marginLeft: theme.spacing(-1.25),
  marginRight: theme.spacing(-1),
  marginBottom: theme.spacing(-1)
}));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ThumbSide);

/***/ }),

/***/ 843966:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "_": () => (/* binding */ GeneralAutocomplete),
/* harmony export */   "c": () => (/* binding */ GeneralAutocompleteMulti)
/* harmony export */ });
/* harmony import */ var F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(998283);
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(111084);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _ColoredText__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(402344);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(552903);
/* harmony import */ var _emotion_react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(728165);

const _excluded = ["options", "valueKey", "label", "onChange", "toImg", "toExItemLabel", "toExLabel"],
  _excluded2 = ["options", "valueKeys", "label", "onChange", "toImg", "toExItemLabel", "toExLabel", "chipProps"];




/**
 * NOTE: the rationale behind toImg/toExlabel/toExItemLabel, is because `options` needs to be serializable, and having JSX in there will disrupt seralizability.
 */



function GeneralAutocomplete(_ref) {
  let {
      options,
      valueKey: key,
      label,
      onChange,
      toImg,
      toExItemLabel
    } = _ref,
    acProps = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z)(_ref, _excluded);
  const value = options.find(o => o.key === key);
  const theme = (0,_mui_material__WEBPACK_IMPORTED_MODULE_3__.useTheme)();
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.Autocomplete, Object.assign({
    autoHighlight: true,
    options: options,
    value: value,
    onChange: (event, newValue, reason) => onChange(newValue == null ? void 0 : newValue.key),
    isOptionEqualToValue: (option, value) => option.key === (value == null ? void 0 : value.key),
    renderInput: params => {
      var _theme$palette$varian;
      const variant = value == null ? void 0 : value.variant;
      const color = variant ? (_theme$palette$varian = theme.palette[variant]) == null ? void 0 : _theme$palette$varian.main : undefined;
      return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.TextField, Object.assign({}, params, {
        label: label,
        InputProps: Object.assign({}, params.InputProps, {
          startAdornment: value !== undefined ? toImg(value.key) : undefined
        }),
        inputProps: Object.assign({}, params.inputProps, {
          autoComplete: 'new-password',
          // disable autocomplete and autofill
          style: {
            color
          }
        }),
        color: key ? "success" : "primary"
      }));
    },
    renderOption: (props, option) => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.MenuItem, Object.assign({
      value: option.key
    }, props, {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.ListItemIcon, {
        children: toImg(option.key)
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.ListItemText, {
        color: option.variant,
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, {
          fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.Skeleton, {
            variant: "text",
            width: 100
          }),
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsxs */ .BX)(_ColoredText__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z, {
            color: option.variant,
            sx: {
              display: "flex",
              gap: 1
            },
            children: [option.key === (value == null ? void 0 : value.key) ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)("strong", {
              children: option.label
            }) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)("span", {
              children: option.label
            }), toExItemLabel == null ? void 0 : toExItemLabel(option.key)]
          })
        })
      }), !!option.favorite && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_5__/* .Favorite */ .rFe, {})]
    }))
  }, acProps));
}
function GeneralAutocompleteMulti(_ref2) {
  let {
      options,
      valueKeys: keys,
      label,
      onChange,
      toImg,
      toExItemLabel,
      toExLabel,
      chipProps
    } = _ref2,
    acProps = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z)(_ref2, _excluded2);
  const value = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => keys.map(k => options.find(o => o.key === k)).filter(o => o), [options, keys]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.Autocomplete, Object.assign({
    autoHighlight: true,
    options: options,
    multiple: true,
    disableCloseOnSelect: true,
    value: value,
    onChange: (event, newValue, reason) => {
      if (reason === "clear") return onChange([]);
      return newValue !== null && onChange(newValue.map(v => v.key));
    },
    isOptionEqualToValue: (option, value) => option.key === value.key,
    renderInput: params => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.TextField, Object.assign({}, params, {
      label: label,
      inputProps: Object.assign({}, params.inputProps, {
        autoComplete: 'new-password' // disable autocomplete and autofill
      }),

      color: keys.length ? "success" : "primary"
    })),
    renderOption: (props, option) => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.MenuItem, Object.assign({
      value: option.key
    }, props, {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.ListItemIcon, {
        children: toImg(option.key)
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.ListItemText, {
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, {
          fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.Skeleton, {
            variant: "text",
            width: 100
          }),
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsxs */ .BX)(_ColoredText__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z, {
            color: option.variant,
            sx: {
              display: "flex",
              gap: 1
            },
            children: [keys.includes(option.key) ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)("strong", {
              children: option.label
            }) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)("span", {
              children: option.label
            }), toExItemLabel == null ? void 0 : toExItemLabel(option.key)]
          })
        })
      }), !!option.favorite && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_5__/* .Favorite */ .rFe, {})]
    })),
    renderTags: (selected, getTagProps) => selected.map(({
      key,
      label,
      variant
    }, index) => (0,_emotion_react__WEBPACK_IMPORTED_MODULE_6__.createElement)(_mui_material__WEBPACK_IMPORTED_MODULE_3__.Chip, Object.assign({}, chipProps, getTagProps({
      index
    }), {
      key: `${index}${key}${label}`,
      icon: toImg(key),
      label: toExLabel ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsxs */ .BX)("span", {
        children: [label, " ", toExLabel(key)]
      }) : label,
      color: variant
    })))
  }, acProps));
}

/***/ }),

/***/ 282334:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "L": () => (/* binding */ InfoTooltipInline),
/* harmony export */   "Z": () => (/* binding */ InfoTooltip)
/* harmony export */ });
/* harmony import */ var _mui_icons_material_Info__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(669208);
/* harmony import */ var _BootstrapTooltip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(507300);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(552903);



function InfoTooltip(props) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__/* .jsx */ .tZ)(_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z, Object.assign({
    placement: "top"
  }, props, {
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__/* .jsx */ .tZ)(_mui_icons_material_Info__WEBPACK_IMPORTED_MODULE_2__["default"], {
      sx: {
        cursor: "help"
      }
    })
  }));
}
function InfoTooltipInline(props) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__/* .jsx */ .tZ)(_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z, Object.assign({
    placement: "top"
  }, props, {
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__/* .jsx */ .tZ)(_mui_icons_material_Info__WEBPACK_IMPORTED_MODULE_2__["default"], {
      fontSize: "inherit",
      sx: {
        cursor: "help",
        verticalAlign: "-10%"
      }
    })
  }));
}

/***/ }),

/***/ 945220:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ PercentBadge)
/* harmony export */ });
/* harmony import */ var _SqBadge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(783673);
/* harmony import */ var _Util_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(41015);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(552903);



function PercentBadge({
  value,
  max = 1,
  valid
}) {
  const [badgeColor, text] = typeof value === 'number' ? [`roll${(0,_Util_Util__WEBPACK_IMPORTED_MODULE_1__/* .clamp */ .uZ)(Math.floor(value / max * 10) - 4, 1, 6)}`, value.toFixed() + "%"] : ["secondary", value];
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__/* .jsx */ .tZ)(_SqBadge__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z, {
    color: valid ? badgeColor : "error",
    children: text
  });
}

/***/ }),

/***/ 485563:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "N": () => (/* binding */ SmolProgress),
/* harmony export */   "Z": () => (/* binding */ ArtifactCard)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(918676);
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(111084);
/* harmony import */ var _mui_icons_material_Block__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(738114);
/* harmony import */ var _mui_icons_material_DeleteForever__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(222698);
/* harmony import */ var _mui_icons_material_Edit__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(429754);
/* harmony import */ var _mui_icons_material_ShowChart__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(296511);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(202784);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(732696);
/* harmony import */ var _Components_Artifact_ArtifactSetTooltip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(185213);
/* harmony import */ var _Components_Artifact_SlotIcon__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(815378);
/* harmony import */ var _Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(507300);
/* harmony import */ var _Components_Card_CardLight__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(567937);
/* harmony import */ var _Components_Character_LocationAutocomplete__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(443007);
/* harmony import */ var _Components_Character_LocationName__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(37923);
/* harmony import */ var _Components_ColoredText__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(402344);
/* harmony import */ var _Components_ConditionalWrapper__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(157889);
/* harmony import */ var _Components_InfoTooltip__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(282334);
/* harmony import */ var _Components_PercentBadge__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(945220);
/* harmony import */ var _Components_StarDisplay__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(871765);
/* harmony import */ var _Data_Artifacts__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(261420);
/* harmony import */ var _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(254878);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(225870);
/* harmony import */ var _KeyMap__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(419807);
/* harmony import */ var _KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(943397);
/* harmony import */ var _ReactHooks_useArtifact__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(153163);
/* harmony import */ var _SVGIcons__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(929063);
/* harmony import */ var _Types_artifact__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(469190);
/* harmony import */ var _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(682799);
/* harmony import */ var _Util_Util__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(41015);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(552903);
let _ = t => t,
  _t,
  _t2,
  _t3,
  _t4;
































const ArtifactEditor = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_1__.lazy)(() => Promise.all(/* import() */[__webpack_require__.e(592), __webpack_require__.e(370), __webpack_require__.e(834)]).then(__webpack_require__.bind(__webpack_require__, 631834)));
const allSubstatFilter = new Set(_Types_artifact__WEBPACK_IMPORTED_MODULE_20__/* .allSubstatKeys */ ._);
function ArtifactCard({
  artifactId,
  artifactObj,
  onClick,
  onDelete,
  mainStatAssumptionLevel = 0,
  effFilter = allSubstatFilter,
  editorProps,
  canExclude = false,
  canEquip = false,
  extraButtons
}) {
  var _ref, _Artifact$mainStatVal, _sheet$name;
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_2__/* .useTranslation */ .$G)(["artifact", "ui"]);
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_14__/* .DatabaseContext */ .t);
  const databaseArtifact = (0,_ReactHooks_useArtifact__WEBPACK_IMPORTED_MODULE_17__/* ["default"] */ .Z)(artifactId);
  const artSetKey = (_ref = artifactObj != null ? artifactObj : databaseArtifact) == null ? void 0 : _ref.setKey;
  const sheet = artSetKey && (0,_Data_Artifacts__WEBPACK_IMPORTED_MODULE_12__/* .getArtSheet */ .Sk)(artSetKey);
  const setLocation = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(k => artifactId && database.arts.set(artifactId, {
    location: k
  }), [database, artifactId]);
  const editable = !artifactObj;
  const [showEditor, setshowEditor] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const onHideEditor = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => setshowEditor(false), [setshowEditor]);
  const onShowEditor = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => editable && setshowEditor(true), [editable, setshowEditor]);
  const wrapperFunc = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(children => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.CardActionArea, {
    onClick: () => artifactId && (onClick == null ? void 0 : onClick(artifactId)),
    sx: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column"
    },
    children: children
  }), [onClick, artifactId]);
  const falseWrapperFunc = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(children => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
    sx: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column"
    },
    children: children
  }), []);
  const art = artifactObj != null ? artifactObj : databaseArtifact;
  const {
    currentEfficiency,
    maxEfficiency,
    currentEfficiency_,
    maxEfficiency_
  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    if (!art) return {
      currentEfficiency: 0,
      maxEfficiency: 0,
      currentEfficiency_: 0,
      maxEfficiency_: 0
    };
    const {
      currentEfficiency,
      maxEfficiency
    } = _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_13__/* ["default"].getArtifactEfficiency */ .ZP.getArtifactEfficiency(art, effFilter);
    const {
      currentEfficiency: currentEfficiency_,
      maxEfficiency: maxEfficiency_
    } = _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_13__/* ["default"].getArtifactEfficiency */ .ZP.getArtifactEfficiency(art, new Set(_Types_artifact__WEBPACK_IMPORTED_MODULE_20__/* .allSubstatKeys */ ._));
    return {
      currentEfficiency,
      maxEfficiency,
      currentEfficiency_,
      maxEfficiency_
    };
  }, [art, effFilter]);
  if (!art) return null;
  const {
    id,
    lock,
    slotKey,
    setKey,
    rarity,
    level,
    mainStatKey,
    substats,
    exclude,
    location = ""
  } = art;
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level);
  const mainStatUnit = _KeyMap__WEBPACK_IMPORTED_MODULE_15__/* ["default"].unit */ .ZP.unit(mainStatKey);
  const artifactValid = maxEfficiency !== 0;
  const slotName = sheet == null ? void 0 : sheet.getSlotName(slotKey);
  const slotDesc = sheet == null ? void 0 : sheet.getSlotDesc(slotKey);
  const slotDescTooltip = slotDesc && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_InfoTooltip__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
    title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
        fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Skeleton, {
          variant: "text",
          width: 100
        }),
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
          variant: "h6",
          children: slotName
        })
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
        children: slotDesc
      })]
    })
  });
  const ele = _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_19__/* .allElementsWithPhy.find */ .Kj.find(e => mainStatKey.startsWith(e));
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
    fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Skeleton, {
      variant: "rectangular",
      sx: {
        width: "100%",
        height: "100%",
        minHeight: 350
      }
    }),
    children: [editorProps && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
      fallback: false,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(ArtifactEditor, Object.assign({
        artifactIdToEdit: showEditor ? artifactId : "",
        cancelEdit: onHideEditor
      }, editorProps))
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_Components_Card_CardLight__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
      sx: {
        height: "100%",
        display: "flex",
        flexDirection: "column"
      },
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_Components_ConditionalWrapper__WEBPACK_IMPORTED_MODULE_23__/* ["default"] */ .Z, {
        condition: !!onClick,
        wrapper: wrapperFunc,
        falseWrapper: falseWrapperFunc,
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
          className: `grad-${rarity}star`,
          sx: {
            position: "relative",
            width: "100%"
          },
          children: [!onClick && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.IconButton, {
            color: "primary",
            disabled: !editable,
            onClick: () => database.arts.set(id, {
              lock: !lock
            }),
            sx: {
              position: "absolute",
              right: 0,
              bottom: 0,
              zIndex: 2
            },
            children: lock ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_24__/* .Lock */ .HEZ, {}) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_24__/* .LockOpen */ .M0f, {})
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
            sx: {
              pt: 2,
              px: 2,
              position: "relative",
              zIndex: 1
            },
            children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
              component: "div",
              sx: {
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                mb: 1
              },
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Chip, {
                size: "small",
                label: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)("strong", {
                  children: ` +${level}`
                }),
                color: _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_13__/* ["default"].levelVariant */ .ZP.levelVariant(level)
              }), !slotName && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Skeleton, {
                variant: "text",
                width: 100
              }), slotName && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
                noWrap: true,
                sx: {
                  textAlign: "center",
                  backgroundColor: "rgba(100,100,100,0.35)",
                  borderRadius: "1em",
                  px: 1.5
                },
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)("strong", {
                  children: slotName
                })
              }), !slotDescTooltip ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Skeleton, {
                width: 10
              }) : slotDescTooltip]
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
              paddingBottom: 1,
              color: "text.secondary",
              variant: "body2",
              sx: {
                display: "flex",
                gap: 0.5,
                alignItems: "center"
              },
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_Artifact_SlotIcon__WEBPACK_IMPORTED_MODULE_25__/* ["default"] */ .Z, {
                iconProps: {
                  fontSize: "inherit"
                },
                slotKey: slotKey
              }), t(`slotName.${slotKey}`)]
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
              variant: "h6",
              sx: {
                display: "flex",
                alignItems: "center",
                gap: 1
              },
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_16__/* ["default"] */ .C, {
                statKey: mainStatKey,
                iconProps: {
                  sx: {
                    color: `${ele}.main`
                  }
                }
              }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)("span", {
                children: _KeyMap__WEBPACK_IMPORTED_MODULE_15__/* ["default"].get */ .ZP.get(mainStatKey)
              })]
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
              variant: "h5",
              children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)("strong", {
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_Components_ColoredText__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
                  color: mainStatLevel !== level ? "warning" : undefined,
                  children: [(0,_KeyMap__WEBPACK_IMPORTED_MODULE_15__/* .cacheValueString */ .qs)((_Artifact$mainStatVal = _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_13__/* ["default"].mainStatValue */ .ZP.mainStatValue(mainStatKey, rarity, mainStatLevel)) != null ? _Artifact$mainStatVal : 0, _KeyMap__WEBPACK_IMPORTED_MODULE_15__/* ["default"].unit */ .ZP.unit(mainStatKey)), mainStatUnit]
                })
              })
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_StarDisplay__WEBPACK_IMPORTED_MODULE_11__/* .StarsDisplay */ .q, {
              stars: rarity,
              colored: true
            })]
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
            sx: {
              height: "100%",
              position: "absolute",
              right: 0,
              top: 0
            },
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
              component: "img",
              src: (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__/* .artifactAsset */ .Hp)(setKey, slotKey),
              width: "auto",
              height: "100%",
              sx: {
                float: "right"
              }
            })
          })]
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.CardContent, {
          sx: {
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            pt: 1,
            pb: 0,
            width: "100%"
          },
          children: [substats.map(stat => !!stat.value && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(SubstatDisplay, {
            stat: stat,
            effFilter: effFilter,
            rarity: rarity
          }, stat.key)), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
            variant: "caption",
            sx: {
              display: "flex",
              gap: 1,
              my: 1
            },
            children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_ColoredText__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
              color: "secondary",
              sx: {
                flexGrow: 1
              },
              children: t(_t || (_t = _`artifact:editor.curSubEff`))
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_PercentBadge__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
              value: currentEfficiency,
              max: 900,
              valid: artifactValid
            }), currentEfficiency !== currentEfficiency_ && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)("span", {
              children: "/"
            }), currentEfficiency !== currentEfficiency_ && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_PercentBadge__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
              value: currentEfficiency_,
              max: 900,
              valid: artifactValid
            })]
          }), currentEfficiency !== maxEfficiency && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
            variant: "caption",
            sx: {
              display: "flex",
              gap: 1
            },
            children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_ColoredText__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
              color: "secondary",
              sx: {
                flexGrow: 1
              },
              children: t(_t2 || (_t2 = _`artifact:editor.maxSubEff`))
            }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_PercentBadge__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
              value: maxEfficiency,
              max: 900,
              valid: artifactValid
            }), maxEfficiency !== maxEfficiency_ && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)("span", {
              children: "/"
            }), maxEfficiency !== maxEfficiency_ && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_PercentBadge__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
              value: maxEfficiency_,
              max: 900,
              valid: artifactValid
            })]
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
            flexGrow: 1
          }), art.probability !== undefined && art.probability >= 0 && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)("strong", {
            children: ["Probability: ", (art.probability * 100).toFixed(2), "%"]
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
            color: "success.main",
            children: [(_sheet$name = sheet == null ? void 0 : sheet.name) != null ? _sheet$name : "Artifact Set", " ", sheet && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_InfoTooltip__WEBPACK_IMPORTED_MODULE_9__/* .InfoTooltipInline */ .L, {
              title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_Artifact_ArtifactSetTooltip__WEBPACK_IMPORTED_MODULE_3__/* .ArtifactSetTooltipContent */ .A, {
                artifactSheet: sheet
              })
            })]
          })]
        })]
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
        sx: {
          p: 1,
          display: "flex",
          gap: 1,
          justifyContent: "space-between",
          alignItems: "center"
        },
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
          sx: {
            flexGrow: 1
          },
          children: editable && canEquip ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_Character_LocationAutocomplete__WEBPACK_IMPORTED_MODULE_6__/* .LocationAutocomplete */ .W, {
            location: location,
            setLocation: setLocation
          }) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_Character_LocationName__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
            location: location
          })
        }), editable && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.ButtonGroup, {
          sx: {
            height: "100%"
          },
          children: [editorProps && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
            title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
              children: t(_t3 || (_t3 = _`artifact:edit`))
            }),
            placement: "top",
            arrow: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Button, {
              color: "info",
              size: "small",
              onClick: onShowEditor,
              sx: {
                borderRadius: "4px 0px 0px 4px"
              },
              children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_icons_material_Edit__WEBPACK_IMPORTED_MODULE_26__["default"], {})
            })
          }), canExclude && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
            title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
                children: t(_t4 || (_t4 = _`artifact:excludeArtifactTip`))
              }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_ColoredText__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
                  color: exclude ? "error" : "success",
                  children: t(`artifact:${exclude ? "excluded" : "included"}`)
                })
              })]
            }),
            placement: "top",
            arrow: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Button, {
              onClick: () => database.arts.set(id, {
                exclude: !exclude
              }),
              color: exclude ? "error" : "success",
              size: "small",
              sx: {
                borderRadius: "4px 0px 0px 4px"
              },
              children: exclude ? (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_icons_material_Block__WEBPACK_IMPORTED_MODULE_27__["default"], {}) : (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_icons_material_ShowChart__WEBPACK_IMPORTED_MODULE_28__["default"], {})
            })
          }), !!onDelete && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
            title: lock ? t("artifact:cantDeleteLock") : "",
            placement: "top",
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)("span", {
              children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Button, {
                color: "error",
                size: "small",
                sx: {
                  height: "100%",
                  borderRadius: "0px 4px 4px 0px"
                },
                onClick: () => onDelete(id),
                disabled: lock,
                children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_icons_material_DeleteForever__WEBPACK_IMPORTED_MODULE_29__["default"], {})
              })
            })
          }), extraButtons]
        })]
      })]
    })]
  });
}
function SubstatDisplay({
  stat,
  effFilter,
  rarity
}) {
  var _stat$rolls$length, _stat$rolls, _stat$efficiency;
  const numRolls = (_stat$rolls$length = (_stat$rolls = stat.rolls) == null ? void 0 : _stat$rolls.length) != null ? _stat$rolls$length : 0;
  const maxRoll = stat.key ? _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_13__/* ["default"].substatValue */ .ZP.substatValue(stat.key) : 0;
  const rollData = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => stat.key ? _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_13__/* ["default"].getSubstatRollData */ .ZP.getSubstatRollData(stat.key, rarity) : [], [stat.key, rarity]);
  const rollOffset = 7 - rollData.length;
  const rollColor = `roll${(0,_Util_Util__WEBPACK_IMPORTED_MODULE_30__/* .clamp */ .uZ)(numRolls, 1, 6)}`;
  const efficiency = (_stat$efficiency = stat.efficiency) != null ? _stat$efficiency : 0;
  const inFilter = stat.key && effFilter.has(stat.key);
  const effOpacity = (0,_Util_Util__WEBPACK_IMPORTED_MODULE_30__/* .clamp01 */ .V2)(0.5 + efficiency / (100 * 5) * 0.5); //divide by 6 because an substat can have max 6 rolls
  const statName = _KeyMap__WEBPACK_IMPORTED_MODULE_15__/* ["default"].getStr */ .ZP.getStr(stat.key);
  const unit = _KeyMap__WEBPACK_IMPORTED_MODULE_15__/* ["default"].unit */ .ZP.unit(stat.key);
  const progresses = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
    display: "flex",
    gap: 0.25,
    height: "1.3em",
    sx: {
      opacity: inFilter ? 1 : 0.3
    },
    children: [...stat.rolls].sort().map((v, i) => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(SmolProgress, {
      value: 100 * v / maxRoll,
      color: `roll${(0,_Util_Util__WEBPACK_IMPORTED_MODULE_30__/* .clamp */ .uZ)(rollOffset + rollData.indexOf(v), 1, 6)}.main`
    }, `${i}${v}`))
  }), [inFilter, stat.rolls, maxRoll, rollData, rollOffset]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
    display: "flex",
    gap: 1,
    alignContent: "center",
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
      sx: {
        flexGrow: 1
      },
      color: numRolls ? `${rollColor}.main` : "error.main",
      component: "span",
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_16__/* ["default"] */ .C, {
        statKey: stat.key,
        iconProps: _SVGIcons__WEBPACK_IMPORTED_MODULE_18__/* .iconInlineProps */ .m
      }), " ", statName, `+${(0,_KeyMap__WEBPACK_IMPORTED_MODULE_15__/* .cacheValueString */ .qs)(stat.value, _KeyMap__WEBPACK_IMPORTED_MODULE_15__/* ["default"].unit */ .ZP.unit(stat.key))}${unit}`]
    }), progresses, (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Typography, {
      sx: {
        opacity: effOpacity,
        minWidth: 40,
        textAlign: "right"
      },
      children: [efficiency.toFixed(), "%"]
    })]
  });
}
function SmolProgress({
  color = "red",
  value = 50
}) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
    sx: {
      width: 7,
      height: "100%",
      bgcolor: color,
      overflow: "hidden",
      borderRadius: 1,
      display: "inline-block"
    },
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_21__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_22__.Box, {
      sx: {
        width: 10,
        height: `${100 - (0,_Util_Util__WEBPACK_IMPORTED_MODULE_30__/* .clamp */ .uZ)(value, 0, 100)}%`,
        bgcolor: "gray"
      }
    })
  });
}

/***/ }),

/***/ 153163:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ useArtifact)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(225870);


function useArtifact(artifactID = "") {
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_1__/* .DatabaseContext */ .t);
  const [artifact, setArtifact] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(database.arts.get(artifactID));
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => setArtifact(database.arts.get(artifactID)), [database, artifactID]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => artifactID ? database.arts.follow(artifactID, (k, r, v) => r === "update" && setArtifact(v)) : undefined, [artifactID, setArtifact, database]);
  return artifact;
}

/***/ })

}]);