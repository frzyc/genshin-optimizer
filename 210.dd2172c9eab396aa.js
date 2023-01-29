"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[210],{

/***/ 862210:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ ArtifactInfoDisplay)
});

// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/Block.js
var Block = __webpack_require__(738114);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/Settings.js
var Settings = __webpack_require__(313264);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/StarRounded.js
var StarRounded = __webpack_require__(478437);
// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/react-i18next/dist/es/index.js + 17 modules
var es = __webpack_require__(732696);
// EXTERNAL MODULE: ../../node_modules/react-router-dom/dist/umd/react-router-dom.production.min.js
var react_router_dom_production_min = __webpack_require__(232175);
// EXTERNAL MODULE: ./src/app/Components/Image/ImgFullwidth.tsx
var ImgFullwidth = __webpack_require__(352757);
// EXTERNAL MODULE: ./src/app/Components/SqBadge.tsx
var SqBadge = __webpack_require__(783673);
// EXTERNAL MODULE: ./src/app/SVGIcons/index.tsx
var SVGIcons = __webpack_require__(929063);
// EXTERNAL MODULE: ./src/app/Util/Util.ts
var Util = __webpack_require__(41015);
// EXTERNAL MODULE: ./src/app/PageArtifact/ArtifactCard.tsx
var ArtifactCard = __webpack_require__(485563);
;// CONCATENATED MODULE: ./src/app/PageArtifact/InfoDisplay/artifactcard.png
/* harmony default export */ const artifactcard = (__webpack_require__.p + "artifactcard.519b74246d697fdab787.png");
;// CONCATENATED MODULE: ./src/app/PageArtifact/InfoDisplay/artifacteditor.png
/* harmony default export */ const artifacteditor = (__webpack_require__.p + "artifacteditor.1f3de27c743d18844d6e.png");
;// CONCATENATED MODULE: ./src/app/PageArtifact/InfoDisplay/artifactfilter.png
/* harmony default export */ const artifactfilter = (__webpack_require__.p + "artifactfilter.dd6c46f09ca8bf2bbc11.png");
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/PageArtifact/InfoDisplay/index.tsx
















function Colors() {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
    display: "inline-flex",
    gap: 0.3,
    sx: {
      height: "1.5em"
    },
    children: (0,Util/* range */.w6)(0, 5).map(s => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCard/* SmolProgress */.N, {
      color: `roll${s + 1}.main`,
      value: (s + 1) / 6 * 100
    }, s))
  });
}
function ArtifactInfoDisplay() {
  const {
    t
  } = (0,es/* useTranslation */.$G)("artifact");
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
    container: true,
    spacing: 1,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
      item: true,
      xs: 12,
      lg: 5,
      xl: 4,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgFullwidth/* default */.Z, {
        src: artifactcard
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
      item: true,
      xs: 12,
      lg: 7,
      xl: 8,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
        t: t,
        i18nKey: "info.section1",
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h5",
          children: "Substat rolls"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          gutterBottom: true,
          children: ["The ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
            children: "number of rolls"
          }), " a substat has is shown to the left of the substat. As the number gets higher, the substat is more colorful:", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Colors, {}), "."]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h5",
          children: "Substat Roll Value"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          gutterBottom: true,
          children: ["The Roll Value(RV) of an subtat is a percentage of the current value over the highest potential 5", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarRounded["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " value. From the Image, the maximum roll value of CRIT DMG is 7.8%. In RV: ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
            children: "5.8/7.8 = 69.2%."
          })]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h5",
          children: "Current Roll Value vs. Maximum Roll Value"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          gutterBottom: true,
          children: ["When a 5", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarRounded["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " have 9(4+5) total rolls, with each of the rolls having the highest value, that is defined as a 900% RV artifact. However, most of the artifacts are not this lucky. The ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
            children: "Current RV"
          }), " of an artifact is a percentage over that 100% artifact. The ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
            children: "Maximum RV"
          }), " is the maximum possible RV an artifact can achieve, if the remaining artifact rolls from upgrades are the hightest possible value."]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h5",
          children: "Excluding an artifact"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          children: ["By locking an artifact ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), ", This artifact will not be picked up by the build generator for optimization. An equipped artifact is locked by default."]
        })]
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
      item: true,
      xs: 12,
      lg: 6,
      xl: 7,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
        t: t,
        i18nKey: "info.section2",
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h5",
          children: "Artifact Editor"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          gutterBottom: true,
          children: ["A fully featured artifact editor, that can accept any 3", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarRounded["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " to 5", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarRounded["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " Artifact. When a substat is inputted, it can calculate the exact roll values. It will also make sure that you have the correct number of rolls in the artifact according to the level, along with other metrics of validation."]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h5",
          children: "Scan screenshots"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          gutterBottom: true,
          children: ["Manual input is not your cup of tea? You can scan in your artifacts with screenshots! On the Artifact Editor, click the ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
            color: "info",
            children: "Show Me How!"
          }), " button to learn more."]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h6",
          children: "Automatic Artifact Scanner"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          gutterBottom: true,
          children: ["If you are playing Genshin on PC, you can download a tool that automatically scans all your artifacts for you, and you can then import that data in ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Settings["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " Database. ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Link, {
            component: react_router_dom_production_min.Link,
            to: "/scanner",
            children: "Click here"
          }), " for a list of scanners that are compatible with GO."]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h5",
          children: "Duplicate/Upgrade artifact detection"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          children: ["Did you know GO can detect if you are adding a ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
            children: "duplicate"
          }), " artifact that exists in the system? It can also detect if the current artifact in editor is an ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
            children: "upgrade"
          }), " of an existing artifact as well. Once a duplicate/upgrade is detected, a preview will allow you to compare the two artifacts in question(See Image)."]
        })]
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
      item: true,
      xs: 12,
      lg: 6,
      xl: 5,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgFullwidth/* default */.Z, {
        src: artifacteditor
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
      item: true,
      xs: 12,
      lg: 7,
      xl: 6,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgFullwidth/* default */.Z, {
        src: artifactfilter
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
      item: true,
      xs: 12,
      lg: 5,
      xl: 6,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
        t: t,
        i18nKey: "info.section3",
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h5",
          children: "Artifact Inventory"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          gutterBottom: true,
          children: "All your artifacts that you've added to GO is displayed here. The filters here allow you to further refine your view of your artifacts. "
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          variant: "h5",
          children: "Example: Finding Fodder Artifacts"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          children: "By utilizing the artifact filter, and the artifact RV, you can quickly find artifacts to feed as food."
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          children: "In this example, the filters are set thusly: "
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          component: "div",
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("ul", {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("li", {
              children: "Limit level to 0-8."
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("li", {
              children: "Unlocked artifacts in Inventory."
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("li", {
              children: "Removing the contribution of flat HP, flat DEF and Energy Recharge to RV calculations."
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("li", {
              children: "Sorted by Ascending Max Roll Value."
            })]
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
          children: "This will filter the artifact Inventory by the lowest RV artifacts, for desired substats."
        })]
      })
    })]
  });
}

/***/ })

}]);