"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[94,482],{

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

/***/ 157889:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ ConditionalWrapper)
/* harmony export */ });
// Wrap children with element provided by wrapper func when condition is true.
function ConditionalWrapper({
  condition,
  wrapper,
  falseWrapper,
  children
}) {
  return condition ? wrapper(children) : falseWrapper ? falseWrapper(children) : children;
}

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

/***/ 871765:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "q": () => (/* binding */ StarsDisplay)
/* harmony export */ });
/* harmony import */ var _mui_icons_material_StarRounded__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(478437);
/* harmony import */ var _ColoredText__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(402344);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(552903);



const StarsDisplay = ({
  stars: _stars = 1,
  colored: _colored = false,
  inline: _inline = false
}) => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__/* .jsx */ .tZ)(_ColoredText__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z, {
  color: _colored ? "warning" : undefined,
  children: [...Array(_stars).keys()].map((_, i) => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__/* .jsx */ .tZ)(_mui_icons_material_StarRounded__WEBPACK_IMPORTED_MODULE_2__["default"], {
    fontSize: _inline ? "inherit" : undefined,
    sx: _inline ? {
      verticalAlign: "text-top"
    } : undefined
  }, i))
});

/***/ }),

/***/ 229117:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ WeaponToggle)
/* harmony export */ });
/* harmony import */ var F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(998283);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _Assets_Assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(378547);
/* harmony import */ var _Types_consts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(736893);
/* harmony import */ var _Util_MultiSelect__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(810618);
/* harmony import */ var _Image_ImgIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(726578);
/* harmony import */ var _SolidToggleButtonGroup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(29432);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(552903);

const _excluded = ["value", "totals", "onChange"];








const weaponTypeHandler = (0,_Util_MultiSelect__WEBPACK_IMPORTED_MODULE_4__/* .handleMultiSelect */ .X)([..._Types_consts__WEBPACK_IMPORTED_MODULE_1__/* .allWeaponTypeKeys */ .yd]);
function WeaponToggle(_ref) {
  let {
      value,
      totals,
      onChange
    } = _ref,
    props = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z)(_ref, _excluded);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_SolidToggleButtonGroup__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, Object.assign({
    exclusive: true,
    value: value
  }, props, {
    children: _Types_consts__WEBPACK_IMPORTED_MODULE_1__/* .allWeaponTypeKeys.map */ .yd.map(wt => {
      var _Assets$weaponTypes;
      return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_7__.ToggleButton, {
        value: wt,
        sx: {
          minWidth: "7em"
        },
        onClick: () => onChange(weaponTypeHandler(value, wt)),
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_Image_ImgIcon__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
          src: (_Assets$weaponTypes = _Assets_Assets__WEBPACK_IMPORTED_MODULE_0__/* ["default"].weaponTypes */ .Z.weaponTypes) == null ? void 0 : _Assets$weaponTypes[wt],
          size: 2
        }), " ", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_7__.Chip, {
          label: totals[wt],
          size: "small"
        })]
      }, wt);
    })
  }));
}

/***/ }),

/***/ 661523:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PageWeapon)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(682799);
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(111084);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(202784);
/* harmony import */ var react_ga4__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(761877);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(732696);
/* harmony import */ var _Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(87985);
/* harmony import */ var _Components_SortByButton__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(346026);
/* harmony import */ var _Components_ToggleButton_RarityToggle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(62978);
/* harmony import */ var _Components_ToggleButton_WeaponToggle__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(229117);
/* harmony import */ var _Data_Weapons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(951077);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(225870);
/* harmony import */ var _ReactHooks_useForceUpdate__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(536617);
/* harmony import */ var _ReactHooks_useMediaQueryUp__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(682716);
/* harmony import */ var _Util_SortByFilters__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(601661);
/* harmony import */ var _Util_totalUtils__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(840775);
/* harmony import */ var _Util_Util__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(41015);
/* harmony import */ var _Util_WeaponSort__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(677712);
/* harmony import */ var _Util_WeaponUtil__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(564120);
/* harmony import */ var _WeaponCard__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(603694);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(552903);






















const WeaponSelectionModal = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.lazy(() => __webpack_require__.e(/* import() */ 592).then(__webpack_require__.bind(__webpack_require__, 489431)));
// Lazy load the weapon display
const WeaponEditor = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_1__.lazy)(() => Promise.all(/* import() */[__webpack_require__.e(878), __webpack_require__.e(334)]).then(__webpack_require__.bind(__webpack_require__, 215878)));
const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 4
};
const numToShowMap = {
  xs: 10,
  sm: 12,
  md: 24,
  lg: 24,
  xl: 24
};
const sortKeys = Object.keys(_Util_WeaponSort__WEBPACK_IMPORTED_MODULE_11__/* .weaponSortMap */ .gd);
function PageWeapon() {
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_3__/* .useTranslation */ .$G)(["page_weapon", "ui", "weaponNames_gen"]);
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_9__/* .DatabaseContext */ .t);
  const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(database.displayWeapon.get());
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => database.displayWeapon.follow((r, dbMeta) => setState(dbMeta)), [database]);
  const [newWeaponModalShow, setnewWeaponModalShow] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [dbDirty, forceUpdate] = (0,_ReactHooks_useForceUpdate__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z)();
  const invScrollRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const [pageIndex, setPageIndex] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(0);
  //set follow, should run only once
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    react_ga4__WEBPACK_IMPORTED_MODULE_2__/* ["default"].send */ .ZP.send({
      hitType: "pageview",
      page: '/weapon'
    });
    return database.weapons.followAny((k, r) => (r === "new" || r === "remove") && forceUpdate());
  }, [forceUpdate, database]);
  const brPt = (0,_ReactHooks_useMediaQueryUp__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .Z)();
  const maxNumToDisplay = numToShowMap[brPt];
  const deleteWeapon = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async key => {
    const weapon = database.weapons.get(key);
    if (!weapon) return;
    const name = t(`weaponNames_gen:${weapon.key}`);
    if (!window.confirm(t("removeWeapon", {
      value: name
    }))) return;
    database.weapons.remove(key);
    if (state.editWeaponId === key) database.displayWeapon.set({
      editWeaponId: ""
    });
  }, [state.editWeaponId, database, t]);
  const editWeapon = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(key => {
    database.displayWeapon.set({
      editWeaponId: key
    });
  }, [database]);
  const newWeapon = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(weaponKey => {
    editWeapon(database.weapons.new((0,_Util_WeaponUtil__WEBPACK_IMPORTED_MODULE_14__/* .initialWeapon */ .xg)(weaponKey)));
  }, [database, editWeapon]);
  const [searchTerm, setSearchTerm] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
  const deferredSearchTerm = (0,react__WEBPACK_IMPORTED_MODULE_1__.useDeferredValue)(searchTerm);
  const {
    sortType,
    ascending,
    weaponType,
    rarity
  } = state;
  const {
    weaponIdList,
    totalWeaponNum
  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    var _weaponSortMap$sortTy;
    const weapons = database.weapons.values;
    const totalWeaponNum = weapons.length;
    const weaponIdList = weapons.filter((0,_Util_SortByFilters__WEBPACK_IMPORTED_MODULE_15__/* .filterFunction */ .C)({
      weaponType,
      rarity,
      name: deferredSearchTerm
    }, (0,_Util_WeaponSort__WEBPACK_IMPORTED_MODULE_11__/* .weaponFilterConfigs */ .Xg)())).sort((0,_Util_SortByFilters__WEBPACK_IMPORTED_MODULE_15__/* .sortFunction */ .e)((_weaponSortMap$sortTy = _Util_WeaponSort__WEBPACK_IMPORTED_MODULE_11__/* .weaponSortMap */ .gd[sortType]) != null ? _weaponSortMap$sortTy : [], ascending, (0,_Util_WeaponSort__WEBPACK_IMPORTED_MODULE_11__/* .weaponSortConfigs */ .Sn)())).map(weapon => weapon.id);
    return dbDirty && {
      weaponIdList,
      totalWeaponNum
    };
  }, [dbDirty, database, sortType, ascending, rarity, weaponType, deferredSearchTerm]);
  const {
    weaponIdsToShow,
    numPages,
    currentPageIndex
  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    const numPages = Math.ceil(weaponIdList.length / maxNumToDisplay);
    const currentPageIndex = (0,_Util_Util__WEBPACK_IMPORTED_MODULE_16__/* .clamp */ .uZ)(pageIndex, 0, numPages - 1);
    return {
      weaponIdsToShow: weaponIdList.slice(currentPageIndex * maxNumToDisplay, (currentPageIndex + 1) * maxNumToDisplay),
      numPages,
      currentPageIndex
    };
  }, [weaponIdList, pageIndex, maxNumToDisplay]);

  // Pagination
  const totalShowing = weaponIdList.length !== totalWeaponNum ? `${weaponIdList.length}/${totalWeaponNum}` : `${totalWeaponNum}`;
  const setPage = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((_, value) => {
    var _invScrollRef$current;
    (_invScrollRef$current = invScrollRef.current) == null ? void 0 : _invScrollRef$current.scrollIntoView({
      behavior: "smooth"
    });
    setPageIndex(value - 1);
  }, [setPageIndex, invScrollRef]);
  const resetEditWeapon = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => database.displayWeapon.set({
    editWeaponId: ""
  }), [database]);
  const {
    editWeaponId
  } = state;

  // Validate weaponId to be an actual weapon
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!editWeaponId) return;
    if (!database.weapons.get(editWeaponId)) resetEditWeapon();
  }, [database, editWeaponId, resetEditWeapon]);
  const weaponTotals = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => (0,_Util_totalUtils__WEBPACK_IMPORTED_MODULE_17__/* .catTotal */ .W)(_genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allWeaponTypeKeys */ .yd, ct => Object.entries(database.weapons.data).forEach(([id, weapon]) => {
    const wtk = (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_8__/* .getWeaponSheet */ .ub)(weapon.key).weaponType;
    ct[wtk].total++;
    if (weaponIdList.includes(id)) ct[wtk].current++;
  })), [database, weaponIdList]);
  const weaponRarityTotals = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => (0,_Util_totalUtils__WEBPACK_IMPORTED_MODULE_17__/* .catTotal */ .W)(_genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allRarities */ .wC, ct => Object.entries(database.weapons.data).forEach(([id, weapon]) => {
    const wr = (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_8__/* .getWeaponSheet */ .ub)(weapon.key).rarity;
    ct[wr].total++;
    if (weaponIdList.includes(id)) ct[wr].current++;
  })), [database, weaponIdList]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Box, {
    my: 1,
    display: "flex",
    flexDirection: "column",
    gap: 1,
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
      fallback: false,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(WeaponSelectionModal, {
        show: newWeaponModalShow,
        onHide: () => setnewWeaponModalShow(false),
        onSelect: newWeapon
      })
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
      fallback: false,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(WeaponEditor, {
        weaponId: editWeaponId,
        footer: true,
        onClose: resetEditWeapon
      })
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
      ref: invScrollRef,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.CardContent, {
        sx: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        },
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
          container: true,
          spacing: 1,
          children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_Components_ToggleButton_WeaponToggle__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
              onChange: weaponType => database.displayWeapon.set({
                weaponType
              }),
              value: weaponType,
              totals: weaponTotals,
              size: "small"
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_Components_ToggleButton_RarityToggle__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
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
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
            item: true,
            flexGrow: 1
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.TextField, {
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
          })]
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Box, {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Pagination, {
            count: numPages,
            page: currentPageIndex + 1,
            onChange: setPage
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(ShowingWeapon, {
            numShowing: weaponIdsToShow.length,
            total: totalShowing,
            t: t
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_Components_SortByButton__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
            sx: {
              height: "100%"
            },
            sortKeys: sortKeys,
            value: sortType,
            onChange: sortType => database.displayWeapon.set({
              sortType
            }),
            ascending: ascending,
            onChangeAsc: ascending => database.displayWeapon.set({
              ascending
            })
          })]
        })]
      })
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsxs */ .BX)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
      fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Skeleton, {
        variant: "rectangular",
        sx: {
          width: "100%",
          height: "100%",
          minHeight: 500
        }
      }),
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Button, {
        fullWidth: true,
        onClick: () => setnewWeaponModalShow(true),
        color: "info",
        startIcon: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_20__/* .Add */ .mm_, {}),
        children: t("page_weapon:addWeapon")
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
        container: true,
        spacing: 1,
        columns: columns,
        children: weaponIdsToShow.map(weaponId => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
          item: true,
          xs: 1,
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_WeaponCard__WEBPACK_IMPORTED_MODULE_12__/* ["default"] */ .Z, {
            weaponId: weaponId,
            onDelete: deleteWeapon,
            onEdit: editWeapon,
            canEquip: true
          })
        }, weaponId))
      })]
    }), numPages > 1 && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.CardContent, {
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
          container: true,
          alignItems: "flex-end",
          children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
            item: true,
            flexGrow: 1,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Pagination, {
              count: numPages,
              page: currentPageIndex + 1,
              onChange: setPage
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(ShowingWeapon, {
              numShowing: weaponIdsToShow.length,
              total: totalShowing,
              t: t
            })
          })]
        })
      })
    })]
  });
}
function ShowingWeapon({
  numShowing,
  total,
  t
}) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_19__.Typography, {
    color: "text.secondary",
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsxs */ .BX)(react_i18next__WEBPACK_IMPORTED_MODULE_3__/* .Trans */ .cC, {
      t: t,
      i18nKey: "showingNum",
      count: numShowing,
      value: total,
      children: ["Showing ", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__/* .jsx */ .tZ)("b", {
        children: {
          count: numShowing
        }
      }), " out of ", {
        value: total
      }, " Weapons"]
    })
  });
}

/***/ }),

/***/ 682716:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ useMediaQueryUp)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_0__);

function useMediaQueryUp() {
  const theme = (0,_mui_material__WEBPACK_IMPORTED_MODULE_0__.useTheme)();
  const sm = (0,_mui_material__WEBPACK_IMPORTED_MODULE_0__.useMediaQuery)(theme.breakpoints.up('sm'));
  const md = (0,_mui_material__WEBPACK_IMPORTED_MODULE_0__.useMediaQuery)(theme.breakpoints.up('md'));
  const lg = (0,_mui_material__WEBPACK_IMPORTED_MODULE_0__.useMediaQuery)(theme.breakpoints.up('lg'));
  const xl = (0,_mui_material__WEBPACK_IMPORTED_MODULE_0__.useMediaQuery)(theme.breakpoints.up('xl'));
  if (xl) return "xl";
  if (lg) return "lg";
  if (md) return "md";
  if (sm) return "sm";
  return "xs";
}

/***/ }),

/***/ 694758:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ useWeapon)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(225870);


function useWeapon(weaponID = "") {
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_1__/* .DatabaseContext */ .t);
  const [weapon, setWeapon] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(database.weapons.get(weaponID));
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => setWeapon(database.weapons.get(weaponID)), [database, weaponID]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => weaponID ? database.weapons.follow(weaponID, (k, r, v) => r === "update" && setWeapon(v)) : undefined, [weaponID, setWeapon, database]);
  return weapon;
}

/***/ }),

/***/ 810618:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "X": () => (/* binding */ handleMultiSelect)
/* harmony export */ });
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(41015);

function handleMultiSelect(allKeys) {
  return (arr, v) => {
    const len = arr.length;
    if (len === allKeys.length) return [v];
    if (len === 1 && arr[0] === v) return [...allKeys];
    return [...new Set((0,_Util__WEBPACK_IMPORTED_MODULE_0__/* .toggleArr */ .nh)(arr, v))];
  };
}

/***/ }),

/***/ 601661:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "C": () => (/* binding */ filterFunction),
/* harmony export */   "e": () => (/* binding */ sortFunction)
/* harmony export */ });
function sortFunction(sortbyKeys, ascending, configs, ascendingBypass = []) {
  return (a, b) => {
    for (const sortby of sortbyKeys) {
      let diff = 0;
      const config = configs[sortby];
      const aV = config(a);
      const bV = config(b);
      if (typeof aV === "string" && typeof bV === "string") diff = aV.localeCompare(bV);else diff = bV - aV;
      if (diff !== 0) return ascendingBypass.includes(sortby) ? diff : (ascending ? -1 : 1) * diff;
    }
    return 0;
  };
}
function filterFunction(filterOptions, filterConfigs) {
  return obj => Object.entries(filterOptions).every(([optionKey, optionVal]) => filterConfigs[optionKey] && filterConfigs[optionKey](obj, optionVal, filterOptions));
}

/***/ }),

/***/ 840775:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "W": () => (/* binding */ catTotal)
/* harmony export */ });
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(41015);

// A helper function to generate a `current/total` formated string object with categories
function catTotal(keys, cb) {
  const ct = catTotalObj(keys);
  cb(ct);
  return catTotalToStringObj(ct);
}
function catTotalObj(keys) {
  return Object.fromEntries(keys.map(k => [k, {
    total: 0,
    current: 0
  }]));
}
function catTotalToStringObj(tot) {
  return (0,_Util__WEBPACK_IMPORTED_MODULE_0__/* .objectMap */ .xh)(tot, ({
    total,
    current
  }) => current === total ? `${total}` : `${current}/${total}`);
}

/***/ })

}]);