"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[604,482],{

/***/ 969777:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ ArtifactCardPico)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(682799);
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(918676);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _Assets_Assets__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(378547);
/* harmony import */ var _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(254878);
/* harmony import */ var _KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(943397);
/* harmony import */ var _Card_CardDark__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(87985);
/* harmony import */ var _SqBadge__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(783673);
/* harmony import */ var _ArtifactTooltip__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(809985);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(552903);











function ArtifactCardPico({
  artifactObj: art,
  slotKey: key
}) {
  // Blank artifact slot icon
  if (!art) return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_Card_CardDark__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
    sx: {
      display: "flex",
      flexDirection: "column",
      height: "100%"
    },
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_9__.Box, {
      sx: {
        width: "100%",
        pb: "100%",
        position: "relative"
      },
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_9__.Box, {
        sx: {
          position: "absolute",
          width: "70%",
          height: "70%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.7
        },
        component: "img",
        src: _Assets_Assets__WEBPACK_IMPORTED_MODULE_2__/* ["default"].slot */ .Z.slot[key]
      })
    })
  });

  // Actual artifact icon + info
  const {
    mainStatKey,
    rarity,
    level
  } = art;
  const element = _genshin_optimizer_consts__WEBPACK_IMPORTED_MODULE_0__/* .allElementsWithPhy.find */ .Kj.find(ele => art.mainStatKey.includes(ele));
  const color = element != null ? element : "secondary";
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_ArtifactTooltip__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
    art: art,
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsxs */ .BX)(_Card_CardDark__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
      sx: {
        display: "flex",
        flexDirection: "column",
        position: "relative"
      },
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_9__.Box, {
        component: "img",
        className: `grad-${rarity}star`,
        src: (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_1__/* .artifactAsset */ .Hp)(art.setKey, art.slotKey),
        maxWidth: "100%",
        maxHeight: "100%"
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_9__.Typography, {
        sx: {
          position: "absolute",
          fontSize: "0.75rem",
          lineHeight: 1,
          opacity: 0.85,
          pointerEvents: "none"
        },
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)("strong", {
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_SqBadge__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
            sx: {
              p: 0.5
            },
            color: _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_3__/* ["default"].levelVariant */ .ZP.levelVariant(level),
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsxs */ .BX)("strong", {
              children: ["+", level]
            })
          })
        })
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_9__.Typography, {
        sx: {
          position: "absolute",
          fontSize: "0.75rem",
          lineHeight: 1,
          opacity: 0.85,
          pointerEvents: "none",
          bottom: 0,
          right: 0
        },
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_SqBadge__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
          color: color,
          sx: {
            p: 0.5
          },
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__/* .jsx */ .tZ)(_KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .C, {
            statKey: mainStatKey,
            iconProps: {
              fontSize: "inherit"
            }
          })
        })
      })]
    })
  });
}

/***/ }),

/***/ 809985:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ ArtifactTooltip)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _Data_Artifacts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(261420);
/* harmony import */ var _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(254878);
/* harmony import */ var _KeyMap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(419807);
/* harmony import */ var _KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(943397);
/* harmony import */ var _SVGIcons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(929063);
/* harmony import */ var _Util_Util__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(41015);
/* harmony import */ var _BootstrapTooltip__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(507300);
/* harmony import */ var _SqBadge__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(783673);
/* harmony import */ var _StarDisplay__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(871765);
/* harmony import */ var _SlotIcon__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(815378);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(552903);














function ArtifactTooltip({
  art,
  children
}) {
  const fallback = (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.Box, {
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.Skeleton, {
      variant: "rectangular",
      width: 100,
      height: 100
    })
  });
  const title = (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, {
    fallback: fallback,
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(ArtifactData, {
      art: art
    })
  });
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
    placement: "top",
    title: title,
    disableInteractive: true,
    children: children
  });
}
function ArtifactData({
  art
}) {
  var _Artifact$mainStatVal;
  const sheet = (0,_Data_Artifacts__WEBPACK_IMPORTED_MODULE_1__/* .getArtSheet */ .Sk)(art.setKey);
  const {
    slotKey,
    level,
    rarity,
    mainStatKey,
    substats
  } = art;
  const slotName = sheet.getSlotName(slotKey);
  const mainStatUnit = _KeyMap__WEBPACK_IMPORTED_MODULE_3__/* ["default"].unit */ .ZP.unit(mainStatKey);
  const mainVariant = _KeyMap__WEBPACK_IMPORTED_MODULE_3__/* ["default"].getVariant */ .ZP.getVariant(mainStatKey);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.Box, {
    p: 1,
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.Typography, {
      variant: "h6",
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_SlotIcon__WEBPACK_IMPORTED_MODULE_11__/* ["default"] */ .Z, {
        slotKey: slotKey,
        iconProps: _SVGIcons__WEBPACK_IMPORTED_MODULE_5__/* .iconInlineProps */ .m
      }), " ", slotName]
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.Typography, {
      variant: "subtitle1",
      color: `${mainVariant}.main`,
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .C, {
        statKey: mainStatKey,
        iconProps: _SVGIcons__WEBPACK_IMPORTED_MODULE_5__/* .iconInlineProps */ .m
      }), " ", _KeyMap__WEBPACK_IMPORTED_MODULE_3__/* ["default"].get */ .ZP.get(mainStatKey), " ", (0,_KeyMap__WEBPACK_IMPORTED_MODULE_3__/* .cacheValueString */ .qs)((_Artifact$mainStatVal = _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_2__/* ["default"].mainStatValue */ .ZP.mainStatValue(mainStatKey, rarity, level)) != null ? _Artifact$mainStatVal : 0, _KeyMap__WEBPACK_IMPORTED_MODULE_3__/* ["default"].unit */ .ZP.unit(mainStatKey)), mainStatUnit]
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.Typography, {
      variant: "subtitle2",
      sx: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      },
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_StarDisplay__WEBPACK_IMPORTED_MODULE_8__/* .StarsDisplay */ .q, {
        stars: rarity
      }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsxs */ .BX)(_SqBadge__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
        color: _Data_Artifacts_Artifact__WEBPACK_IMPORTED_MODULE_2__/* ["default"].levelVariant */ .ZP.levelVariant(level),
        children: ["+", level]
      }), " "]
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.Box, {
      py: 1,
      children: substats.map(stat => !!stat.value && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.Typography, {
        color: `roll${(0,_Util_Util__WEBPACK_IMPORTED_MODULE_12__/* .clamp */ .uZ)(stat.rolls.length, 1, 6)}.main`,
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .C, {
          statKey: stat.key,
          iconProps: _SVGIcons__WEBPACK_IMPORTED_MODULE_5__/* .iconInlineProps */ .m
        }), " ", _KeyMap__WEBPACK_IMPORTED_MODULE_3__/* ["default"].getStr */ .ZP.getStr(stat.key), " ", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)("strong", {
          children: `+${(0,_KeyMap__WEBPACK_IMPORTED_MODULE_3__/* .cacheValueString */ .qs)(stat.value, _KeyMap__WEBPACK_IMPORTED_MODULE_3__/* ["default"].unit */ .ZP.unit(stat.key))}${_KeyMap__WEBPACK_IMPORTED_MODULE_3__/* ["default"].unit */ .ZP.unit(stat.key)}`
        })]
      }, stat.key))
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_10__.Typography, {
      color: "success.main",
      children: sheet.name
    })]
  });
}

/***/ }),

/***/ 815378:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ SlotIcon)
});

// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/SVGIcons/ArtifactSlot/CircletIcon.tsx


function CircletIcon(props) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.SvgIcon, Object.assign({}, props, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("path", {
      d: "M 21.929688 8.652344 L 22.390625 9.113281 L 18 12.234375 L 12.460938 5.765625 L 13.847656 4.378906 L 12 2.066406 L 10.152344 4.378906 L 11.539062 5.765625 L 6 12.234375 L 1.609375 9.113281 L 2.070312 8.652344 L 0 7.148438 L 5.070312 19.164062 L 12 21.933594 L 18.929688 19.164062 L 24 7.148438 Z M 14.96875 15.546875 L 13.441406 15.804688 C 12.988281 15.878906 12.621094 16.214844 12.507812 16.660156 L 12.082031 18.375 C 12.074219 18.414062 12.039062 18.441406 12 18.441406 C 11.960938 18.441406 11.925781 18.414062 11.917969 18.375 L 11.492188 16.660156 C 11.378906 16.214844 11.011719 15.878906 10.558594 15.804688 L 9.03125 15.546875 C 8.984375 15.546875 8.945312 15.511719 8.945312 15.460938 C 8.945312 15.414062 8.984375 15.378906 9.03125 15.378906 L 10.558594 15.121094 C 11.011719 15.046875 11.378906 14.710938 11.492188 14.265625 L 11.917969 12.550781 C 11.925781 12.511719 11.960938 12.484375 12 12.484375 C 12.039062 12.484375 12.074219 12.511719 12.082031 12.550781 L 12.507812 14.265625 C 12.621094 14.710938 12.988281 15.046875 13.441406 15.121094 L 14.96875 15.378906 C 15.015625 15.378906 15.054688 15.414062 15.054688 15.460938 C 15.054688 15.511719 15.015625 15.546875 14.96875 15.546875 Z M 14.96875 15.546875 "
    })
  }));
}
// EXTERNAL MODULE: ./src/app/SVGIcons/ArtifactSlot/FlowerIcon.tsx
var FlowerIcon = __webpack_require__(311716);
;// CONCATENATED MODULE: ./src/app/SVGIcons/ArtifactSlot/GobletIcon.tsx


function GobletIcon(props) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.SvgIcon, Object.assign({}, props, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("path", {
      d: "M 16.363281 14.921875 C 23.429688 10.980469 23.429688 8.828125 23.425781 3.105469 L 0.734375 3.105469 C 0.734375 8.828125 0.734375 10.972656 7.796875 14.921875 C 7.796875 17.921875 10.777344 17.117188 10.777344 18.671875 C 10.90625 19.984375 10.449219 20.742188 9.804688 20.859375 C 7.730469 21.144531 4.03125 22.46875 4.007812 23.882812 L 20.15625 23.882812 C 20.128906 22.46875 16.429688 21.140625 14.355469 20.859375 C 13.714844 20.742188 13.25 19.984375 13.382812 18.671875 C 13.382812 17.117188 16.363281 17.921875 16.363281 14.921875 Z M 12.789062 9.925781 L 12.195312 12.316406 C 12.183594 12.367188 12.136719 12.40625 12.082031 12.40625 C 12.027344 12.40625 11.980469 12.367188 11.96875 12.316406 L 11.371094 9.925781 C 11.214844 9.304688 10.707031 8.832031 10.074219 8.726562 L 7.9375 8.375 C 7.878906 8.367188 7.835938 8.316406 7.835938 8.257812 C 7.835938 8.199219 7.878906 8.148438 7.9375 8.144531 L 10.074219 7.789062 C 10.707031 7.683594 11.214844 7.210938 11.371094 6.589844 L 11.96875 4.199219 C 11.980469 4.148438 12.027344 4.109375 12.082031 4.113281 C 12.132812 4.113281 12.179688 4.148438 12.195312 4.199219 L 12.789062 6.589844 C 12.945312 7.210938 13.453125 7.683594 14.089844 7.789062 L 16.222656 8.144531 C 16.28125 8.148438 16.324219 8.199219 16.324219 8.257812 C 16.324219 8.316406 16.28125 8.367188 16.222656 8.375 L 14.089844 8.730469 C 13.457031 8.835938 12.945312 9.304688 12.789062 9.925781 Z M 22.871094 2.371094 L 1.128906 2.371094 C 0.828125 2.371094 0.542969 2.253906 0.332031 2.042969 C 0.117188 1.832031 0 1.542969 0 1.246094 C 0 0.945312 0.117188 0.65625 0.328125 0.445312 C 0.542969 0.234375 0.828125 0.117188 1.128906 0.117188 L 22.871094 0.117188 C 23.171875 0.117188 23.457031 0.234375 23.671875 0.445312 C 23.882812 0.65625 24 0.945312 24 1.246094 C 24 1.542969 23.882812 1.832031 23.667969 2.042969 C 23.457031 2.253906 23.171875 2.371094 22.871094 2.371094 Z M 22.871094 2.371094 "
    })
  }));
}
// EXTERNAL MODULE: ./src/app/SVGIcons/ArtifactSlot/PlumeIcon.tsx
var PlumeIcon = __webpack_require__(792658);
;// CONCATENATED MODULE: ./src/app/SVGIcons/ArtifactSlot/SandsIcon.tsx


function SandsIcon(props) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.SvgIcon, Object.assign({}, props, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("path", {
      d: "M 20.046875 21.785156 L 18.644531 21.785156 L 18.644531 20.167969 C 18.644531 14.105469 13.035156 13.808594 13.035156 11.742188 L 13.035156 11.621094 C 13.03125 11.121094 13.285156 10.65625 13.707031 10.386719 C 15.195312 9.425781 18.460938 8.136719 18.636719 3.707031 C 18.640625 3.609375 18.605469 3.507812 18.535156 3.4375 C 18.464844 3.363281 18.371094 3.324219 18.269531 3.324219 L 5.730469 3.324219 C 5.628906 3.324219 5.535156 3.363281 5.464844 3.4375 C 5.394531 3.507812 5.355469 3.605469 5.359375 3.707031 C 5.53125 8.136719 8.804688 9.425781 10.292969 10.394531 C 10.710938 10.664062 10.964844 11.128906 10.964844 11.628906 L 10.964844 11.75 C 10.964844 13.816406 5.355469 14.113281 5.355469 20.175781 L 5.355469 21.792969 L 3.949219 21.792969 C 3.75 21.792969 3.585938 21.953125 3.582031 22.152344 L 3.582031 23.632812 C 3.582031 23.835938 3.746094 24 3.949219 24 L 20.046875 24 C 20.253906 24 20.417969 23.835938 20.417969 23.632812 L 20.417969 22.152344 C 20.417969 21.949219 20.253906 21.785156 20.046875 21.785156 Z M 12 21.785156 L 6.6875 21.785156 C 6.6875 17.058594 11.410156 18.09375 11.410156 16.171875 L 11.410156 10.265625 C 11.410156 10.265625 8.601562 8.640625 8.601562 7.457031 L 15.394531 7.457031 C 15.394531 8.640625 12.589844 10.265625 12.589844 10.265625 L 12.589844 16.171875 C 12.589844 18.09375 17.316406 17.058594 17.316406 21.785156 Z M 20.417969 0.367188 L 20.417969 1.847656 C 20.417969 2.050781 20.253906 2.214844 20.046875 2.214844 L 3.949219 2.214844 C 3.746094 2.214844 3.582031 2.050781 3.582031 1.847656 L 3.582031 0.367188 C 3.582031 0.164062 3.746094 0 3.949219 0 L 20.046875 0 C 20.253906 0 20.417969 0.164062 20.417969 0.367188 Z M 20.417969 0.367188 "
    })
  }));
}
;// CONCATENATED MODULE: ./src/app/Components/Artifact/SlotIcon.tsx






function SlotIcon({
  slotKey,
  iconProps = {}
}) {
  switch (slotKey) {
    case "flower":
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FlowerIcon/* default */.Z, Object.assign({}, iconProps));
    case "plume":
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PlumeIcon/* default */.Z, Object.assign({}, iconProps));
    case "sands":
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SandsIcon, Object.assign({}, iconProps));
    case "goblet":
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GobletIcon, Object.assign({}, iconProps));
    case "circlet":
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CircletIcon, Object.assign({}, iconProps));
  }
}

/***/ }),

/***/ 450875:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ CharacterCard)
});

// EXTERNAL MODULE: ../../libs/g-assets/src/index.ts + 1738 modules
var src = __webpack_require__(918676);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/index.js
var icons_material = __webpack_require__(111084);
// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__(202784);
// EXTERNAL MODULE: ./src/app/Context/CharacterContext.tsx
var CharacterContext = __webpack_require__(353710);
// EXTERNAL MODULE: ./src/app/Context/DataContext.tsx
var DataContext = __webpack_require__(790);
// EXTERNAL MODULE: ./src/app/Data/Characters/index.ts + 212 modules
var Characters = __webpack_require__(970630);
// EXTERNAL MODULE: ./src/app/Data/LevelData.ts
var LevelData = __webpack_require__(821626);
// EXTERNAL MODULE: ./src/app/Database/Database.ts + 11 modules
var Database = __webpack_require__(225870);
// EXTERNAL MODULE: ./src/app/Formula/index.ts + 1 modules
var Formula = __webpack_require__(534958);
// EXTERNAL MODULE: ./src/app/ReactHooks/useCharacter.tsx
var useCharacter = __webpack_require__(944304);
// EXTERNAL MODULE: ./src/app/ReactHooks/useCharacterReducer.tsx
var useCharacterReducer = __webpack_require__(450670);
// EXTERNAL MODULE: ./src/app/ReactHooks/useCharMeta.tsx
var useCharMeta = __webpack_require__(132560);
// EXTERNAL MODULE: ./src/app/ReactHooks/useDBMeta.tsx
var useDBMeta = __webpack_require__(610002);
// EXTERNAL MODULE: ./src/app/ReactHooks/useTeamData.tsx
var useTeamData = __webpack_require__(644942);
// EXTERNAL MODULE: ../../libs/consts/src/index.ts
var consts_src = __webpack_require__(682799);
// EXTERNAL MODULE: ./src/app/Util/Util.ts
var Util = __webpack_require__(41015);
// EXTERNAL MODULE: ./src/app/Components/Artifact/ArtifactCardPico.tsx
var ArtifactCardPico = __webpack_require__(969777);
// EXTERNAL MODULE: ./src/app/Components/Card/CardLight.tsx
var CardLight = __webpack_require__(567937);
// EXTERNAL MODULE: ./src/app/Components/ConditionalWrapper.tsx
var ConditionalWrapper = __webpack_require__(157889);
// EXTERNAL MODULE: ./src/app/Components/FieldDisplay.tsx
var FieldDisplay = __webpack_require__(802720);
// EXTERNAL MODULE: ./src/app/Components/SqBadge.tsx
var SqBadge = __webpack_require__(783673);
// EXTERNAL MODULE: ./src/app/Components/StarDisplay.tsx
var StarDisplay = __webpack_require__(871765);
// EXTERNAL MODULE: ./src/app/Components/Weapon/WeaponCardPico.tsx
var WeaponCardPico = __webpack_require__(32240);
// EXTERNAL MODULE: ./src/app/Data/Weapons/index.ts + 309 modules
var Weapons = __webpack_require__(951077);
// EXTERNAL MODULE: ./src/app/Data/Weapons/WeaponSheet.tsx
var WeaponSheet = __webpack_require__(871026);
// EXTERNAL MODULE: ./src/app/Formula/api.tsx
var api = __webpack_require__(130507);
// EXTERNAL MODULE: ./src/app/Formula/uiData.tsx
var uiData = __webpack_require__(961278);
// EXTERNAL MODULE: ./src/app/ReactHooks/useWeapon.tsx
var useWeapon = __webpack_require__(694758);
// EXTERNAL MODULE: ./src/app/Components/Card/CardDark.tsx
var CardDark = __webpack_require__(87985);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/Components/Weapon/WeaponFullCard.tsx













function WeaponFullCard({
  weaponId
}) {
  const weapon = (0,useWeapon/* default */.Z)(weaponId);
  const weaponSheet = (weapon == null ? void 0 : weapon.key) && (0,Weapons/* getWeaponSheet */.ub)(weapon.key);
  const UIData = (0,react.useMemo)(() => weaponSheet && weapon && (0,api/* computeUIData */.mP)([weaponSheet.data, (0,api/* dataObjForWeapon */.v0)(weapon)]), [weaponSheet, weapon]);
  if (!weapon || !weaponSheet || !UIData) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
      display: "flex",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
        flexShrink: 1,
        maxWidth: "35%",
        display: "flex",
        flexDirection: "column",
        alignContent: "flex-end",
        className: `grad-${weaponSheet.rarity}star`,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
          component: "img",
          src: (0,src/* weaponAsset */.Aq)(weapon.key, weapon.ascension >= 2),
          width: "100%",
          height: "auto",
          sx: {
            mt: "auto"
          }
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
        flexGrow: 1,
        sx: {
          p: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "body2",
          gutterBottom: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: weaponSheet == null ? void 0 : weaponSheet.name
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          variant: "subtitle1",
          sx: {
            display: "flex",
            gap: 1
          },
          gutterBottom: true,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
            color: "primary",
            children: ["Lv. ", WeaponSheet/* default.getLevelString */.Z.getLevelString(weapon)]
          }), weaponSheet.hasRefinement && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
            color: "info",
            children: ["R", weapon.refinement]
          })]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          variant: "subtitle1",
          sx: {
            display: "flex",
            gap: 1
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponStat, {
            node: UIData.get(Formula/* uiInput.weapon.main */.ri.weapon.main)
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponStat, {
            node: UIData.get(Formula/* uiInput.weapon.sub */.ri.weapon.sub)
          })]
        })]
      })]
    })
  });
}
function WeaponStat({
  node
}) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
    color: "secondary",
    children: [node.info.icon, " ", (0,uiData/* nodeVStr */.p)(node)]
  });
}
// EXTERNAL MODULE: ./src/app/Components/Character/CharacterCardPico.tsx
var CharacterCardPico = __webpack_require__(51704);
;// CONCATENATED MODULE: ./src/app/Components/Character/CharacterCard.tsx





























function CharacterCard({
  characterKey,
  artifactChildren,
  weaponChildren,
  characterChildren,
  onClick,
  onClickHeader,
  onClickTeammate,
  footer,
  hideStats,
  isTeammateCard
}) {
  var _useTeamData, _teamData$characterKe;
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    teamData: teamDataContext
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const teamData = (_useTeamData = (0,useTeamData/* default */.Z)(teamDataContext ? "" : characterKey)) != null ? _useTeamData : teamDataContext;
  const character = (0,useCharacter/* default */.Z)(characterKey);
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const characterSheet = (0,Characters/* getCharSheet */.m)(characterKey, gender);
  const characterDispatch = (0,useCharacterReducer/* default */.Z)(characterKey);
  const data = teamData == null ? void 0 : (_teamData$characterKe = teamData[characterKey]) == null ? void 0 : _teamData$characterKe.target;
  const onClickHandler = (0,react.useCallback)(() => characterKey && (onClick == null ? void 0 : onClick(characterKey)), [characterKey, onClick]);
  const actionWrapperFunc = (0,react.useCallback)(children => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardActionArea, {
    onClick: onClickHandler,
    sx: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column"
    },
    children: children
  }), [onClickHandler]);
  const characterContextObj = (0,react.useMemo)(() => character && characterSheet && {
    character,
    characterSheet,
    characterDispatch
  }, [character, characterSheet, characterDispatch]);
  const dataContextObj = (0,react.useMemo)(() => data && teamData && {
    data,
    teamData
  }, [data, teamData]);
  const {
    favorite
  } = (0,useCharMeta/* default */.Z)(characterKey);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
    fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Skeleton, {
      variant: "rectangular",
      width: "100%",
      height: 600
    }),
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
      sx: {
        height: "100%",
        display: "flex",
        flexDirection: "column"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
        sx: {
          display: "flex",
          position: "absolute",
          zIndex: 2,
          opacity: 0.7
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.IconButton, {
          sx: {
            p: 0.5
          },
          onClick: _ => database.charMeta.set(characterKey, {
            favorite: !favorite
          }),
          children: favorite ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Favorite */.rFe, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* FavoriteBorder */.Ieo, {})
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ConditionalWrapper/* default */.Z, {
        condition: !!onClick,
        wrapper: actionWrapperFunc,
        children: character && dataContextObj && characterContextObj ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ExistingCharacterCardContent, {
          characterContextObj: characterContextObj,
          dataContextObj: dataContextObj,
          characterKey: characterKey,
          onClick: onClick,
          onClickHeader: onClickHeader,
          isTeammateCard: isTeammateCard,
          character: character,
          onClickTeammate: onClickTeammate,
          hideStats: hideStats,
          weaponChildren: weaponChildren,
          artifactChildren: artifactChildren,
          characterChildren: characterChildren
        }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(NewCharacterCardContent, {
          characterKey: characterKey
        })
      }), footer]
    })
  });
}
function ExistingCharacterCardContent({
  characterContextObj,
  dataContextObj,
  characterKey,
  onClick,
  onClickHeader,
  isTeammateCard,
  character,
  onClickTeammate,
  hideStats,
  weaponChildren,
  artifactChildren,
  characterChildren
}) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterContext/* CharacterContext.Provider */.K.Provider, {
    value: characterContextObj,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(DataContext/* DataContext.Provider */.R.Provider, {
      value: dataContextObj,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Header, {
        characterKey: characterKey,
        onClick: !onClick ? onClickHeader : undefined,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HeaderContent, {})
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
        sx: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flexGrow: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Artifacts, {}), !isTeammateCard && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
          container: true,
          columns: 4,
          spacing: 0.75,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
            item: true,
            xs: 1,
            height: "100%",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponCardPico/* default */.Z, {
              weaponId: character.equippedWeapon
            })
          }), (0,Util/* range */.w6)(0, 2).map(i => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
            item: true,
            xs: 1,
            height: "100%",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterCardPico/* default */.Z, {
              characterKey: character.team[i],
              onClick: !onClick ? onClickTeammate : undefined,
              index: i
            })
          }, i))]
        }), isTeammateCard && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponFullCard, {
          weaponId: character.equippedWeapon
        }), !isTeammateCard && !hideStats && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Stats, {}), weaponChildren, artifactChildren, characterChildren]
      })]
    })
  });
}
function NewCharacterCardContent({
  characterKey
}) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Header, {
      characterKey: characterKey,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HeaderContentNew, {
        characterKey: characterKey
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        flexGrow: 1,
        height: "100%"
      }
    })]
  });
}
function Header({
  children,
  characterKey,
  onClick
}) {
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const characterSheet = (0,Characters/* getCharSheet */.m)(characterKey, gender);
  const actionWrapperFunc = (0,react.useCallback)(children => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardActionArea, {
    onClick: () => characterKey && (onClick == null ? void 0 : onClick(characterKey)),
    sx: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column"
    },
    children: children
  }), [onClick, characterKey]);
  if (!characterSheet) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ConditionalWrapper/* default */.Z, {
    condition: !!onClick,
    wrapper: actionWrapperFunc,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
      display: "flex",
      position: "relative",
      className: `grad-${characterSheet.rarity}star`,
      sx: {
        "&::before": {
          content: '""',
          display: "block",
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          opacity: 0.7,
          backgroundImage: `url(${(0,src/* characterAsset */.Li)(characterKey, "banner", gender)})`,
          backgroundPosition: "center",
          backgroundSize: "cover"
        }
      },
      width: "100%",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
        flexShrink: 1,
        sx: {
          maxWidth: {
            xs: "40%",
            lg: "40%"
          }
        },
        alignSelf: "flex-end",
        display: "flex",
        flexDirection: "column",
        zIndex: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
          component: "img",
          src: (0,src/* characterAsset */.Li)(characterKey, "icon", gender),
          width: "100%",
          height: "auto",
          maxWidth: 256,
          sx: {
            mt: "auto"
          }
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
        flexGrow: 1,
        sx: {
          py: 1,
          pr: 1
        },
        display: "flex",
        flexDirection: "column",
        zIndex: 1,
        children: children
      })]
    })
  });
}
function HeaderContent() {
  const {
    characterSheet
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const characterEle = data.get(Formula/* uiInput.charEle */.ri.charEle).value;
  const characterLevel = data.get(Formula/* uiInput.lvl */.ri.lvl).value;
  const constellation = data.get(Formula/* uiInput.constellation */.ri.constellation).value;
  const ascension = data.get(Formula/* uiInput.asc */.ri.asc).value;
  const autoBoost = data.get(Formula/* uiInput.bonus.auto */.ri.bonus.auto).value;
  const skillBoost = data.get(Formula/* uiInput.bonus.skill */.ri.bonus.skill).value;
  const burstBoost = data.get(Formula/* uiInput.bonus.burst */.ri.bonus.burst).value;
  const tAuto = data.get(Formula/* uiInput.total.auto */.ri.total.auto).value;
  const tSkill = data.get(Formula/* uiInput.total.skill */.ri.total.skill).value;
  const tBurst = data.get(Formula/* uiInput.total.burst */.ri.total.burst).value;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
      label: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        variant: "subtitle1",
        children: characterSheet.name
      }),
      size: "small",
      color: characterEle,
      sx: {
        opacity: 0.85
      }
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
      container: true,
      spacing: 1,
      flexWrap: "nowrap",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
        item: true,
        sx: {
          textShadow: "0 0 5px gray"
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          component: "span",
          variant: "h6",
          whiteSpace: "nowrap",
          children: ["Lv. ", characterLevel]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          component: "span",
          variant: "h6",
          color: "text.secondary",
          children: ["/", LevelData/* ascensionMaxLevel */.SJ[ascension]]
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h6",
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
            children: ["C", constellation]
          })
        })
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
      container: true,
      spacing: 1,
      flexWrap: "nowrap",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
          color: autoBoost ? "info" : "secondary",
          label: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: tAuto
          })
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
          color: skillBoost ? "info" : "secondary",
          label: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: tSkill
          })
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
          color: burstBoost ? "info" : "secondary",
          label: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: tBurst
          })
        })
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
      mt: 1,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarDisplay/* StarsDisplay */.q, {
        stars: characterSheet.rarity,
        colored: true
      })
    })]
  });
}
function HeaderContentNew({
  characterKey
}) {
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const sheet = (0,Characters/* getCharSheet */.m)(characterKey, gender);
  if (!sheet) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
      label: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        variant: "subtitle1",
        children: sheet.name
      }),
      size: "small",
      color: sheet.elementKey,
      sx: {
        opacity: 0.85
      }
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
      mt: 1,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        variant: "h4",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
          children: "NEW"
        })
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
      mt: 1.5,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarDisplay/* StarsDisplay */.q, {
        stars: sheet.rarity,
        colored: true
      })
    })]
  });
}
function Artifacts() {
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const artifacts = (0,react.useMemo)(() => consts_src/* allSlotKeys.map */.eV.map(k => {
    var _data$get$value;
    return [k, database.arts.get((_data$get$value = data.get(Formula/* uiInput.art */.ri.art[k].id).value) != null ? _data$get$value : "")];
  }), [data, database]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
    direction: "row",
    container: true,
    spacing: 0.75,
    columns: 5,
    children: artifacts.map(([key, art]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
      item: true,
      xs: 1,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCardPico/* default */.Z, {
        artifactObj: art,
        slotKey: key
      })
    }, key))
  });
}
function Stats() {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
    sx: {
      width: "100%"
    },
    children: [Object.values(data.getDisplay().basic).map(n => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* NodeFieldDisplay */.JW, {
      node: n
    }, JSON.stringify(n.info))), data.get(Formula/* uiInput.special */.ri.special).info.name && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
      sx: {
        display: "flex",
        gap: 1,
        alignItems: "center"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        flexGrow: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: "Specialized:"
        })
      }), data.get(Formula/* uiInput.special */.ri.special).info.icon, (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        children: data.get(Formula/* uiInput.special */.ri.special).info.name
      })]
    })]
  });
}

/***/ }),

/***/ 51704:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ CharacterCardPico)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(918676);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(202784);
/* harmony import */ var _Assets_Assets__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(378547);
/* harmony import */ var _Data_Characters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(970630);
/* harmony import */ var _Data_LevelData__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(821626);
/* harmony import */ var _KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(943397);
/* harmony import */ var _ReactHooks_useCharacter__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(944304);
/* harmony import */ var _ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(610002);
/* harmony import */ var _BootstrapTooltip__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(507300);
/* harmony import */ var _Card_CardDark__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(87985);
/* harmony import */ var _ConditionalWrapper__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(157889);
/* harmony import */ var _SqBadge__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(783673);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(552903);















function CharacterCardPico({
  characterKey = "",
  index = -1,
  onClick
}) {
  const {
    gender
  } = (0,_ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z)();
  const teammateSheet = characterKey ? (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_3__/* .getCharSheet */ .m)(characterKey, gender) : undefined;
  const character = (0,_ReactHooks_useCharacter__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z)(characterKey);
  const onClickHandler = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => characterKey && (onClick == null ? void 0 : onClick(characterKey)), [characterKey, onClick]);
  const actionWrapperFunc = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(children => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.CardActionArea, {
    onClick: onClickHandler,
    children: children
  }), [onClickHandler]);
  if (teammateSheet && character) {
    const title = (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_1__.Suspense, {
      fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Skeleton, {
        variant: "text",
        width: 100
      }),
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Typography, {
        children: [teammateSheet.elementKey && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_KeyMap_StatIcon__WEBPACK_IMPORTED_MODULE_5__/* .ElementIcon */ .Z, {
          ele: teammateSheet.elementKey,
          iconProps: {
            fontSize: "inherit",
            sx: {
              verticalAlign: "-10%",
              color: `${teammateSheet.elementKey}.main`
            }
          }
        }), " ", teammateSheet.name]
      })
    });
    return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_Card_CardDark__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
      sx: {
        maxWidth: 128,
        position: "relative",
        display: "flex",
        flexDirection: "column"
      },
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsxs */ .BX)(_ConditionalWrapper__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .Z, {
        condition: !!onClick,
        wrapper: actionWrapperFunc,
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
          placement: "top",
          title: title,
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Box, {
            display: "flex",
            className: `grad-${teammateSheet.rarity}star`,
            children: characterKey && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Box, {
              component: "img",
              src: (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__/* .characterAsset */ .Li)(characterKey, "iconSide", gender),
              maxWidth: "100%",
              maxHeight: "100%",
              sx: {
                transform: "scale(1.4)",
                transformOrigin: "bottom"
              }
            })
          })
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Typography, {
          sx: {
            position: "absolute",
            fontSize: "0.75rem",
            lineHeight: 1,
            opacity: 0.85,
            pointerEvents: "none",
            top: 0
          },
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)("strong", {
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsxs */ .BX)(_SqBadge__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
              color: "primary",
              children: [character.level, "/", _Data_LevelData__WEBPACK_IMPORTED_MODULE_4__/* .ascensionMaxLevel */ .SJ[character.ascension]]
            })
          })
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Typography, {
          sx: {
            position: "absolute",
            fontSize: "0.75rem",
            lineHeight: 1,
            opacity: 0.85,
            pointerEvents: "none",
            bottom: 0,
            right: 0
          },
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)("strong", {
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsxs */ .BX)(_SqBadge__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
              color: "secondary",
              children: ["C", character.constellation]
            })
          })
        })]
      })
    });
  } else {
    return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_Card_CardDark__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
      sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: "12.5%"
      },
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Box, {
        component: "img",
        src: _Assets_Assets__WEBPACK_IMPORTED_MODULE_2__/* ["default"].team */ .Z.team[`team${index + 2}`],
        sx: {
          width: "75%",
          height: "auto",
          opacity: 0.7
        }
      })
    });
  }
}

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

/***/ 32240:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ WeaponCardPico)
/* harmony export */ });
/* harmony import */ var _genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(918676);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(202784);
/* harmony import */ var _Data_Weapons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(951077);
/* harmony import */ var _Data_Weapons_WeaponSheet__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(871026);
/* harmony import */ var _Formula__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(534958);
/* harmony import */ var _Formula_api__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(130507);
/* harmony import */ var _Formula_uiData__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(961278);
/* harmony import */ var _ReactHooks_useWeapon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(694758);
/* harmony import */ var _Card_CardDark__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(87985);
/* harmony import */ var _SqBadge__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(783673);
/* harmony import */ var _WeaponNameTooltip__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(402031);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(552903);














function WeaponCardPico({
  weaponId
}) {
  const weapon = (0,_ReactHooks_useWeapon__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z)(weaponId);
  const weaponSheet = (weapon == null ? void 0 : weapon.key) && (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_2__/* .getWeaponSheet */ .ub)(weapon.key);
  const UIData = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => weaponSheet && weapon && (0,_Formula_api__WEBPACK_IMPORTED_MODULE_5__/* .computeUIData */ .mP)([weaponSheet.data, (0,_Formula_api__WEBPACK_IMPORTED_MODULE_5__/* .dataObjForWeapon */ .v0)(weapon)]), [weaponSheet, weapon]);
  if (!weapon || !weaponSheet || !UIData) return null;
  const tooltipAddl = (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Box, {
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(WeaponStatPico, {
      node: UIData.get(_Formula__WEBPACK_IMPORTED_MODULE_4__/* .uiInput.weapon.main */ .ri.weapon.main)
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(WeaponStatPico, {
      node: UIData.get(_Formula__WEBPACK_IMPORTED_MODULE_4__/* .uiInput.weapon.sub */ .ri.weapon.sub)
    })]
  });
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsxs */ .BX)(_Card_CardDark__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
    sx: {
      height: "100%",
      maxWidth: 128,
      position: "relative",
      display: "flex",
      flexDirection: "column"
    },
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Box, {
      display: "flex",
      flexDirection: "column",
      alignContent: "flex-end",
      className: `grad-${weaponSheet.rarity}star`,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_WeaponNameTooltip__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z, {
        sheet: weaponSheet,
        addlText: tooltipAddl,
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Box, {
          component: "img",
          src: (0,_genshin_optimizer_g_assets__WEBPACK_IMPORTED_MODULE_0__/* .weaponAsset */ .Aq)(weapon.key, weapon.ascension >= 2),
          maxWidth: "100%",
          maxHeight: "100%",
          sx: {
            mt: "auto"
          }
        })
      })
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Typography, {
      sx: {
        position: "absolute",
        fontSize: "0.75rem",
        lineHeight: 1,
        opacity: 0.85,
        pointerEvents: "none"
      },
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)("strong", {
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_SqBadge__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
          color: "primary",
          children: _Data_Weapons_WeaponSheet__WEBPACK_IMPORTED_MODULE_3__/* ["default"].getLevelString */ .Z.getLevelString(weapon)
        })
      })
    }), weaponSheet.hasRefinement && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Typography, {
      sx: {
        position: "absolute",
        fontSize: "0.75rem",
        lineHeight: 1,
        opacity: 0.85,
        pointerEvents: "none",
        bottom: 0,
        right: 0
      },
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsx */ .tZ)("strong", {
        children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsxs */ .BX)(_SqBadge__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z, {
          color: "secondary",
          children: ["R", weapon.refinement]
        })
      })
    })]
  });
}
function WeaponStatPico({
  node
}) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_12__.Typography, {
    children: [node.info.icon, " ", (0,_Formula_uiData__WEBPACK_IMPORTED_MODULE_6__/* .nodeVStr */ .p)(node)]
  });
}

/***/ }),

/***/ 402031:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ WeaponNameTooltip)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _Assets_Assets__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(378547);
/* harmony import */ var _BootstrapTooltip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(507300);
/* harmony import */ var _Image_ImgIcon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(726578);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(552903);







function WeaponNameTooltip({
  sheet,
  addlText,
  children
}) {
  const title = (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsxs */ .BX)(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, {
    fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_5__.Skeleton, {
      variant: "text",
      width: 100
    }),
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_5__.Typography, {
      children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_Image_ImgIcon__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
        src: _Assets_Assets__WEBPACK_IMPORTED_MODULE_1__/* ["default"].weaponTypes */ .Z.weaponTypes[sheet.weaponType]
      }), " ", sheet.name]
    }), addlText]
  });
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__/* .jsx */ .tZ)(_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
    placement: "top",
    title: title,
    disableInteractive: true,
    children: children
  });
}

/***/ }),

/***/ 243210:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Y": () => (/* binding */ resonanceData),
  "J": () => (/* binding */ resonanceSheets)
});

// EXTERNAL MODULE: ../../libs/consts/src/index.ts
var src = __webpack_require__(682799);
// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__(202784);
// EXTERNAL MODULE: ./src/app/KeyMap/StatIcon.tsx + 11 modules
var StatIcon = __webpack_require__(943397);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/Components/ElementCycle.tsx




function ElementCycle({
  iconProps
}) {
  const [counter, setcounter] = (0,react.useState)(0);
  (0,react.useEffect)(() => {
    const timer = setInterval(() => setcounter(c => c + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* ElementIcon */.Z, {
    ele: src/* allElements */.N[counter % src/* allElements.length */.N.length],
    iconProps: iconProps
  });
}
// EXTERNAL MODULE: ./src/app/Components/Translate.tsx
var Translate = __webpack_require__(721845);
// EXTERNAL MODULE: ./src/app/Formula/index.ts + 1 modules
var Formula = __webpack_require__(534958);
// EXTERNAL MODULE: ./src/app/Formula/api.tsx
var api = __webpack_require__(130507);
// EXTERNAL MODULE: ./src/app/Formula/utils.ts
var utils = __webpack_require__(97797);
// EXTERNAL MODULE: ./src/app/KeyMap/index.tsx + 1 modules
var KeyMap = __webpack_require__(419807);
// EXTERNAL MODULE: ./src/app/SVGIcons/index.tsx
var SVGIcons = __webpack_require__(929063);
// EXTERNAL MODULE: ./src/app/SVGIcons/Element/AnemoIcon.tsx
var AnemoIcon = __webpack_require__(298944);
// EXTERNAL MODULE: ./src/app/SVGIcons/Element/CryoIcon.tsx
var CryoIcon = __webpack_require__(818460);
// EXTERNAL MODULE: ./src/app/SVGIcons/Element/DendroIcon.tsx
var DendroIcon = __webpack_require__(151793);
// EXTERNAL MODULE: ./src/app/SVGIcons/Element/ElectroIcon.tsx
var ElectroIcon = __webpack_require__(631048);
// EXTERNAL MODULE: ./src/app/SVGIcons/Element/GeoIcon.tsx
var GeoIcon = __webpack_require__(897783);
// EXTERNAL MODULE: ./src/app/SVGIcons/Element/HydroIcon.tsx
var HydroIcon = __webpack_require__(627109);
// EXTERNAL MODULE: ./src/app/SVGIcons/Element/PyroIcon.tsx
var PyroIcon = __webpack_require__(822035);
// EXTERNAL MODULE: ./src/app/Util/Util.ts
var Util = __webpack_require__(41015);
// EXTERNAL MODULE: ./src/app/Data/SheetUtil.tsx
var SheetUtil = __webpack_require__(162173);
;// CONCATENATED MODULE: ./src/app/Data/Resonance.tsx



















const tr = strKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Translate/* Translate */.v, {
  ns: "elementalResonance_gen",
  key18: strKey
});
const trm = strKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Translate/* Translate */.v, {
  ns: "elementalResonance",
  key18: strKey
});
const teamSize = (0,utils/* sum */.Sm)(...src/* allElements.map */.N.map(ele => Formula/* tally */.uK[ele]));

// Protective Canopy
const pcNodes = (0,Util/* objectKeyValueMap */.Uq)(src/* allElementsWithPhy */.Kj, e => [`${e}_res_`, (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(Formula/* tally.ele */.uK.ele, 4, (0,utils/* percent */.aQ)(0.15)))]);
const protectiveCanopy = {
  name: tr("ProtectiveCanopy.name"),
  desc: tr("ProtectiveCanopy.desc"),
  icon: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ElementCycle, {
      iconProps: SVGIcons/* iconInlineProps */.m
    }), " x4"]
  }),
  canShow: data => src/* allElements.filter */.N.filter(e => data.get(Formula/* tally */.uK[e]).value >= 1).length === 4,
  sections: [{
    teamBuff: true,
    fields: Object.values(pcNodes).map(node => ({
      node
    }))
  }]
};

// Fervent Flames
const ffNode = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.pyro */.uK.pyro, 2, (0,utils/* percent */.aQ)(0.25))));
const ferventFlames = {
  name: tr("FerventFlames.name"),
  desc: tr("FerventFlames.desc"),
  icon: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PyroIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PyroIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m))]
  }),
  canShow: data => data.get(Formula/* tally.pyro */.uK.pyro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      text: (0,SheetUtil.st)("effectDuration.cryo"),
      value: -40,
      unit: "%"
    }, {
      node: ffNode
    }]
  }]
};

// Soothing Waters
const swNode = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.hydro */.uK.hydro, 2, (0,utils/* percent */.aQ)(0.25))));
const soothingWaters = {
  name: tr("SoothingWater.name"),
  desc: tr("SoothingWater.desc"),
  icon: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HydroIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HydroIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m))]
  }),
  canShow: data => data.get(Formula/* tally.hydro */.uK.hydro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      text: (0,SheetUtil.st)("effectDuration.pyro"),
      value: -40,
      unit: "%"
    }, {
      node: swNode
    }]
  }]
};

//ShatteringIce
const condSIPath = ["resonance", "ShatteringIce"];
const condSI = (0,SheetUtil/* condReadNode */.v9)(condSIPath);
const siNode = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.cryo */.uK.cryo, 2, (0,utils/* equal */.Dg)(condSI, "on", (0,utils/* percent */.aQ)(0.15)))));
const shatteringIce = {
  name: tr("ShatteringIce.name"),
  desc: tr("ShatteringIce.desc"),
  icon: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CryoIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CryoIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m))]
  }),
  canShow: data => data.get(Formula/* tally.cryo */.uK.cryo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      text: (0,SheetUtil.st)("effectDuration.electro"),
      value: -40,
      unit: "%"
    }]
  }, {
    teamBuff: true,
    path: condSIPath,
    value: condSI,
    name: trm("ShatteringIce.cond"),
    header: {
      title: tr("ShatteringIce.name"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CryoIcon/* default */.Z, {})
    },
    states: {
      on: {
        fields: [{
          node: siNode
        }]
      }
    }
  }]
};

// High Voltage
const highVoltage = {
  name: tr("HighVoltage.name"),
  desc: tr("HighVoltage.desc"),
  icon: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ElectroIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ElectroIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m))]
  }),
  canShow: data => data.get(Formula/* tally.electro */.uK.electro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      text: (0,SheetUtil.st)("effectDuration.hydro"),
      value: -40,
      unit: "%"
    }]
  }]
};

// Impetuous Winds
const iwNodeStam = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.anemo */.uK.anemo, 2, (0,utils/* percent */.aQ)(-0.15))));
const iwNodeMove = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.anemo */.uK.anemo, 2, (0,utils/* percent */.aQ)(0.1))));
const iwNodeCD = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.anemo */.uK.anemo, 2, (0,utils/* percent */.aQ)(-0.05))));
const impetuousWinds = {
  name: tr("ImpetuousWinds.name"),
  desc: tr("ImpetuousWinds.desc"),
  icon: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(AnemoIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(AnemoIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m))]
  }),
  canShow: data => data.get(Formula/* tally.anemo */.uK.anemo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    fields: [{
      node: iwNodeStam
    }, {
      node: iwNodeMove
    }, {
      node: iwNodeCD
    }]
  }]
};

// Enduring Rock
const condERShieldPath = ["resonance", "EnduringRock"];
const condERShield = (0,SheetUtil/* condReadNode */.v9)(condERShieldPath);
const condERHitPath = ["resonance", "EnduringRockHit"];
const condERHit = (0,SheetUtil/* condReadNode */.v9)(condERHitPath);
const erNodeshield_ = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.geo */.uK.geo, 2, (0,utils/* percent */.aQ)(0.15))));
const erNodeDMG_ = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.geo */.uK.geo, 2, (0,utils/* equal */.Dg)(condERShield, "on", (0,utils/* percent */.aQ)(0.15)))));
const erNodeRes_ = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.geo */.uK.geo, 2, (0,utils/* equal */.Dg)(condERHit, "on", (0,utils/* percent */.aQ)(-0.2)))));
const enduringRock = {
  name: tr("EnduringRock.name"),
  desc: tr("EnduringRock.desc"),
  icon: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GeoIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GeoIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m))]
  }),
  canShow: data => data.get(Formula/* tally.geo */.uK.geo).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    text: tr("EnduringRock.desc"),
    fields: [{
      node: erNodeshield_
    }]
  }, {
    teamBuff: true,
    path: condERShieldPath,
    value: condERShield,
    header: {
      title: tr("EnduringRock.name"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GeoIcon/* default */.Z, {})
    },
    name: (0,SheetUtil.st)("protectedByShield"),
    states: {
      on: {
        fields: [{
          node: erNodeDMG_
        }]
      }
    }
  }, {
    teamBuff: true,
    path: condERHitPath,
    value: condERHit,
    header: {
      title: tr("EnduringRock.name"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GeoIcon/* default */.Z, {})
    },
    name: trm("EnduringRock.hitCond"),
    states: {
      on: {
        fields: [{
          node: erNodeRes_
        }, {
          text: (0,SheetUtil/* stg */.el)("duration"),
          value: 15,
          unit: "s"
        }]
      }
    }
  }]
};

// Sprawling Greenery
const condSG2elePath = ["resonance", "SprawlingCanopy2ele"];
const condSG2ele = (0,SheetUtil/* condReadNode */.v9)(condSG2elePath);
const condSG3elePath = ["resonance", "SprawlingCanopy3ele"];
const condSG3ele = (0,SheetUtil/* condReadNode */.v9)(condSG3elePath);
const sgBase_eleMas = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.dendro */.uK.dendro, 2, 50, Object.assign({}, KeyMap/* default.info */.ZP.info("eleMas"), {
  isTeamBuff: true
}))));
const sg2ele_eleMas = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.dendro */.uK.dendro, 2, (0,utils/* equal */.Dg)(condSG2ele, "on", 30, Object.assign({}, KeyMap/* default.info */.ZP.info("eleMas"), {
  isTeamBuff: true
})))));
const sg3ele_eleMas = (0,utils/* equal */.Dg)(Formula/* input.activeCharKey */.qH.activeCharKey, Formula/* input.charKey */.qH.charKey, (0,utils/* greaterEq */.ew)(teamSize, 4, (0,utils/* greaterEq */.ew)(Formula/* tally.dendro */.uK.dendro, 2, (0,utils/* equal */.Dg)(condSG3ele, "on", 20, Object.assign({}, KeyMap/* default.info */.ZP.info("eleMas"), {
  isTeamBuff: true
})))));
const sprawlingGreenery = {
  name: tr("SprawlingGreenery.name"),
  desc: tr("SprawlingGreenery.desc"),
  icon: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DendroIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DendroIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m))]
  }),
  canShow: data => data.get(Formula/* tally.dendro */.uK.dendro).value >= 2 && data.get(teamSize).value >= 4,
  sections: [{
    teamBuff: true,
    text: tr("SprawlingGreenery.desc"),
    fields: [{
      node: sgBase_eleMas
    }]
  }, {
    teamBuff: true,
    path: condSG2elePath,
    value: condSG2ele,
    header: {
      title: tr("SprawlingGreenery.name"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DendroIcon/* default */.Z, {})
    },
    name: trm("SprawlingGreenery.cond2ele"),
    states: {
      on: {
        fields: [{
          node: sg2ele_eleMas
        }, {
          text: (0,SheetUtil/* stg */.el)("duration"),
          value: 6,
          unit: "s"
        }]
      }
    }
  }, {
    teamBuff: true,
    path: condSG3elePath,
    value: condSG3ele,
    header: {
      title: tr("SprawlingGreenery.name"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DendroIcon/* default */.Z, {})
    },
    name: trm("SprawlingGreenery.cond3ele"),
    states: {
      on: {
        fields: [{
          node: sg3ele_eleMas
        }, {
          text: (0,SheetUtil/* stg */.el)("duration"),
          value: 6,
          unit: "s"
        }]
      }
    }
  }]
};
const resonanceSheets = [protectiveCanopy, ferventFlames, soothingWaters, shatteringIce, highVoltage, impetuousWinds, enduringRock, sprawlingGreenery];
const resonanceData = (0,api/* inferInfoMut */.d1)({
  teamBuff: {
    premod: Object.assign({}, pcNodes, {
      atk_: ffNode,
      hp_: swNode,
      staminaDec_: iwNodeStam,
      moveSPD_: iwNodeMove,
      cdRed_: iwNodeCD,
      shield_: erNodeshield_,
      all_dmg_: erNodeDMG_,
      geo_enemyRes_: erNodeRes_,
      eleMas: (0,utils/* infoMut */.ce)((0,utils/* sum */.Sm)(sgBase_eleMas, sg2ele_eleMas, sg3ele_eleMas), {
        pivot: true
      })
    }),
    total: {
      // TODO: this crit rate is on-hit. Might put it in a `hit.critRate_` namespace later.
      critRate_: siNode
    }
  }
});

/***/ }),

/***/ 132560:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ useCharMeta)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(225870);


function useCharMeta(key) {
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_1__/* .DatabaseContext */ .t);
  const [charMeta, setCharMetaState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => database.charMeta.get(key));
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => database.charMeta.follow(key, (k, r, dbMeta) => setCharMetaState(dbMeta)), [key, database]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => setCharMetaState(database.charMeta.get(key)), [database, key]);
  return charMeta;
}

/***/ }),

/***/ 897856:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ useCharSelectionCallback)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(232175);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(225870);
/* harmony import */ var _Types_consts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(736893);





/**
 * Basically a history hook to go to the dedicated character page. Will create the character if it doesn't exist.
 * @returns
 */
function useCharSelectionCallback() {
  var _useMatch;
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_1__/* .DatabaseContext */ .t);
  const navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.useNavigate)();
  // Used to maintain the previous tab, if there is one
  const {
    params: {
      tab = ""
    }
  } = (_useMatch = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.useMatch)({
    path: "/characters/:charKey/:tab",
    end: false
  })) != null ? _useMatch : {
    params: {
      tab: ""
    }
  };
  const cb = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(characterKey => {
    const character = database.chars.get(characterKey);
    let navTab = tab;
    // Create a new character + weapon, with linking if char isnt in db.
    if (!character) {
      database.chars.getWithInitWeapon((0,_Types_consts__WEBPACK_IMPORTED_MODULE_2__/* .charKeyToLocCharKey */ .V7)(characterKey));
      // If we are navigating to a new character,
      // redirect to Overview, regardless of previous tab.
      // Trying to enforce a certain UI flow when building new characters
      navTab = "";
    }
    navigate(`/characters/${characterKey}/${navTab}`);
  }, [navigate, database, tab]);
  return cb;
}

/***/ }),

/***/ 944304:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ useCharacter)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(225870);


function useCharacter(characterKey = "") {
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_1__/* .DatabaseContext */ .t);
  const [character, updateCharacter] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(database.chars.get(characterKey));
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => updateCharacter(database.chars.get(characterKey)), [database, characterKey]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => characterKey ? database.chars.follow(characterKey, (k, r, v) => r === "update" && updateCharacter(v)) : undefined, [characterKey, updateCharacter, database]);
  return character;
}

/***/ }),

/***/ 450670:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ useCharacterReducer)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(225870);
/* harmony import */ var _Util_Util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(41015);



function useCharacterReducer(characterKey) {
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_1__/* .DatabaseContext */ .t);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(action => {
    if (!characterKey) return;
    const character = database.chars.get(characterKey);
    if (!character) return;
    if ("type" in action) switch (action.type) {
      case "enemyOverride":
        {
          const enemyOverride = character.enemyOverride;
          const {
            statKey,
            value
          } = action;
          if (enemyOverride[statKey] === value) break;
          database.chars.set(characterKey, Object.assign({}, character, {
            enemyOverride: Object.assign({}, enemyOverride, {
              [statKey]: value
            })
          }));
          break;
        }
      case "editStats":
        {
          const {
            statKey,
            value
          } = action;
          const bonusStats = (0,_Util_Util__WEBPACK_IMPORTED_MODULE_2__/* .deepClone */ .I8)(character.bonusStats);
          if (bonusStats[statKey] === value) break;
          if (!value) delete bonusStats[statKey];else bonusStats[statKey] = value;
          database.chars.set(characterKey, Object.assign({}, character, {
            bonusStats
          }));
          break;
        }
      case "resetStats":
        {
          const {
            statKey
          } = action;
          const bonusStats = character.bonusStats;
          delete bonusStats[statKey];
          database.chars.set(characterKey, Object.assign({}, character, {
            bonusStats
          }));
          break;
        }
      case "teamConditional":
        {
          const {
            teamMateKey,
            conditional
          } = action;
          const teamConditional = (0,_Util_Util__WEBPACK_IMPORTED_MODULE_2__/* .deepClone */ .I8)(character.teamConditional);
          teamConditional[teamMateKey] = conditional;
          database.chars.set(characterKey, Object.assign({}, character, {
            teamConditional
          }));
          break;
        }
      case "team":
        {
          const {
            team: team_
          } = character;
          const team = [...team_];
          const {
            index,
            charKey
          } = action;
          team[index] = charKey;
          // update src character
          database.chars.set(characterKey, Object.assign({}, character, {
            team
          }));
        }
    } else database.chars.set(characterKey, Object.assign({}, character, action));
  }, [characterKey, database]);
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

/***/ 644942:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "V": () => (/* binding */ getTeamData),
/* harmony export */   "Z": () => (/* binding */ useTeamData)
/* harmony export */ });
/* harmony import */ var F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(998283);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var _Data_Artifacts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(261420);
/* harmony import */ var _Data_Characters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(970630);
/* harmony import */ var _Data_Resonance__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(243210);
/* harmony import */ var _Data_Weapons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(951077);
/* harmony import */ var _Data_Weapons_WeaponSheet__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(871026);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(225870);
/* harmony import */ var _Formula__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(534958);
/* harmony import */ var _Formula_api__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(130507);
/* harmony import */ var _Util_Util__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(41015);
/* harmony import */ var _Util_WeaponUtil__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(564120);
/* harmony import */ var _useDBMeta__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(610002);
/* harmony import */ var _useForceUpdate__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(536617);

const _excluded = ["data"],
  _excluded2 = ["display"];













function useTeamData(characterKey, mainStatAssumptionLevel = 0, overrideArt, overrideWeapon) {
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_6__/* .DatabaseContext */ .t);
  const [dbDirty, setDbDirty] = (0,_useForceUpdate__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .Z)();
  const dbDirtyDeferred = (0,react__WEBPACK_IMPORTED_MODULE_0__.useDeferredValue)(dbDirty);
  const {
    gender
  } = (0,_useDBMeta__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .Z)();
  const data = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => dbDirtyDeferred && getTeamDataCalc(database, characterKey, mainStatAssumptionLevel, gender, overrideArt, overrideWeapon), [dbDirtyDeferred, gender, characterKey, database, mainStatAssumptionLevel, overrideArt, overrideWeapon]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => characterKey ? database.chars.follow(characterKey, setDbDirty) : undefined, [characterKey, setDbDirty, database]);
  return data;
}
function getTeamDataCalc(database, characterKey, mainStatAssumptionLevel = 0, gender, overrideArt, overrideWeapon) {
  var _getTeamData;
  if (!characterKey) return;

  // Retrive from cache
  if (!mainStatAssumptionLevel && !overrideArt && !overrideWeapon) {
    const cache = database._getTeamData(characterKey);
    if (cache) return cache;
  }
  const {
    teamData,
    teamBundle
  } = (_getTeamData = getTeamData(database, characterKey, mainStatAssumptionLevel, overrideArt, overrideWeapon)) != null ? _getTeamData : {};
  if (!teamData || !teamBundle) return;
  const calcData = (0,_Formula_api__WEBPACK_IMPORTED_MODULE_8__/* .uiDataForTeam */ .Qo)(teamData, gender, characterKey);
  const data = (0,_Util_Util__WEBPACK_IMPORTED_MODULE_11__/* .objectMap */ .xh)(calcData, (obj, ck) => {
    const _ref = teamBundle[ck],
      rest = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_12__/* ["default"] */ .Z)(_ref, _excluded);
    return Object.assign({}, obj, rest);
  });
  if (!mainStatAssumptionLevel && !overrideArt && !overrideWeapon) database.cacheTeamData(characterKey, data);
  return data;
}
function getTeamData(database, characterKey, mainStatAssumptionLevel = 0, overrideArt, overrideWeapon) {
  var _database$weapons$get;
  if (!characterKey) return;
  const character = database.chars.get(characterKey);
  if (!character) return;
  const char1DataBundle = getCharDataBundle(database, true, mainStatAssumptionLevel, character, overrideWeapon ? overrideWeapon : (_database$weapons$get = database.weapons.get(character.equippedWeapon)) != null ? _database$weapons$get : (0,_Util_WeaponUtil__WEBPACK_IMPORTED_MODULE_13__/* .defaultInitialWeapon */ .Qu)(), overrideArt != null ? overrideArt : Object.values(character.equippedArtifacts).map(a => database.arts.get(a)).filter(a => a));
  if (!char1DataBundle) return;
  const teamBundle = {
    [characterKey]: char1DataBundle
  };
  const teamData = {
    [characterKey]: char1DataBundle.data
  };
  char1DataBundle.character.team.forEach(ck => {
    var _character$teamCondit, _database$weapons$get2;
    if (!ck) return;
    const tchar = database.chars.get(ck);
    if (!tchar) return;
    const databundle = getCharDataBundle(database, false, 0, Object.assign({}, tchar, {
      conditional: (_character$teamCondit = character.teamConditional[ck]) != null ? _character$teamCondit : {}
    }), (_database$weapons$get2 = database.weapons.get(tchar.equippedWeapon)) != null ? _database$weapons$get2 : (0,_Util_WeaponUtil__WEBPACK_IMPORTED_MODULE_13__/* .defaultInitialWeapon */ .Qu)(), Object.values(tchar.equippedArtifacts).map(a => database.arts.get(a)).filter(a => a));
    if (!databundle) return;
    teamBundle[ck] = databundle;
    teamData[ck] = databundle.data;
  });
  return {
    teamData,
    teamBundle
  };
}
function getCharDataBundle(database, useCustom = false, mainStatAssumptionLevel, character, weapon, artifacts) {
  const characterSheet = (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_2__/* .getCharSheet */ .m)(character.key, database.gender);
  if (!characterSheet) return;
  const weaponSheet = (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_4__/* .getWeaponSheet */ .ub)(weapon.key);
  if (!weaponSheet) return;
  const weaponSheetsDataOfType = _Data_Weapons_WeaponSheet__WEBPACK_IMPORTED_MODULE_5__/* ["default"].getAllDataOfType */ .Z.getAllDataOfType(characterSheet.weaponTypeKey);
  const weaponSheetsData = useCustom ? (() => {
    // display is included in WeaponSheet.getAllDataOfType
    const _weaponSheet$data = weaponSheet.data,
      restWeaponSheetData = (0,F_Project_genshin_optimizer_monorepo_node_modules_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_12__/* ["default"] */ .Z)(_weaponSheet$data, _excluded2);
    return (0,_Formula_api__WEBPACK_IMPORTED_MODULE_8__/* .mergeData */ .b3)([restWeaponSheetData, weaponSheetsDataOfType]);
  })() : weaponSheet.data;
  const sheetData = (0,_Formula_api__WEBPACK_IMPORTED_MODULE_8__/* .mergeData */ .b3)([characterSheet.data, weaponSheetsData, _Data_Artifacts__WEBPACK_IMPORTED_MODULE_1__/* .allArtifactData */ .d5]);
  const artifactData = Array.isArray(artifacts) ? artifacts.map(a => (0,_Formula_api__WEBPACK_IMPORTED_MODULE_8__/* .dataObjForArtifact */ .n3)(a, mainStatAssumptionLevel)) : [artifacts];
  const data = [...artifactData, (0,_Formula_api__WEBPACK_IMPORTED_MODULE_8__/* .dataObjForCharacter */ .vn)(character, useCustom ? sheetData : undefined), (0,_Formula_api__WEBPACK_IMPORTED_MODULE_8__/* .dataObjForWeapon */ .v0)(weapon), sheetData, _Formula__WEBPACK_IMPORTED_MODULE_7__/* .common */ .y0,
  // NEED TO PUT THIS AT THE END
  _Data_Resonance__WEBPACK_IMPORTED_MODULE_3__/* .resonanceData */ .Y];
  return {
    character,
    weapon,
    characterSheet,
    weaponSheet,
    data
  };
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

/***/ 792658:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ PlumeIcon)
/* harmony export */ });
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(552903);


function PlumeIcon(props) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_1__.SvgIcon, Object.assign({}, props, {
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__/* .jsx */ .tZ)("path", {
      d: "M 21.160156 0 C 20.578125 0.0429688 20.003906 0.148438 19.445312 0.320312 C 18.546875 0.507812 17.6875 0.855469 16.910156 1.347656 C 16.507812 1.585938 16.5 1.902344 16.375 1.816406 C 16.125 1.710938 15.839844 1.6875 15.574219 1.761719 C 9.6875 6.40625 9.558594 6.671875 6.546875 11.132812 C 6.351562 11.210938 6.058594 10.945312 6.058594 10.945312 C 5.957031 11.878906 5.691406 11.878906 5.160156 12.945312 C 4.5 13.980469 4.269531 15.234375 4.515625 16.4375 C 4.085938 16.359375 3.667969 16.21875 3.277344 16.015625 L 4.078125 16.683594 C 3.554688 16.824219 3.015625 16.867188 2.476562 16.820312 L 3.546875 17.621094 C 3.546875 17.621094 2.875 18.285156 2.609375 18.285156 L 3.5 18.414062 C 2.460938 20.15625 1.59375 21.996094 0.917969 23.910156 C 0.910156 23.933594 0.914062 23.960938 0.929688 23.976562 C 0.945312 23.996094 0.96875 24.003906 0.996094 24 L 2.011719 23.484375 C 2.027344 23.476562 2.039062 23.460938 2.046875 23.441406 C 2.511719 21.625 3.546875 20.003906 4.996094 18.8125 L 5.816406 19.753906 C 5.636719 19.335938 5.546875 18.878906 5.550781 18.421875 L 7.019531 18.6875 C 6.351562 18.019531 6.421875 17.726562 6.421875 17.726562 C 7.328125 17.890625 8.261719 17.871094 9.164062 17.667969 C 10.191406 17.289062 11.171875 16.792969 12.085938 16.1875 C 12.230469 16.117188 11.835938 16.046875 11.972656 15.972656 C 12.109375 15.902344 12.535156 15.8125 12.679688 15.726562 C 14.230469 14.6875 15.695312 13.523438 17.058594 12.253906 C 18.636719 10.925781 20.007812 9.363281 21.113281 7.625 C 21.1875 7.496094 20.496094 7.28125 20.214844 7.226562 C 20.515625 7.261719 21.269531 7.433594 21.335938 7.308594 C 22.089844 6.085938 22.589844 4.722656 22.808594 3.296875 C 22.90625 2.132812 23.972656 -0.136719 21.160156 0 Z M 5.285156 16.417969 C 8.632812 9.210938 18.230469 3.335938 18.230469 3.335938 C 21.265625 0.960938 11.441406 7.515625 5.285156 16.550781 Z M 5.285156 16.417969 "
    })
  }));
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