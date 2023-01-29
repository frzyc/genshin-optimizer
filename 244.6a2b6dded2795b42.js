"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[244],{

/***/ 689667:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ CharacterDisplay)
});

// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/index.js
var icons_material = __webpack_require__(111084);
// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var material_node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__(202784);
// EXTERNAL MODULE: ../../node_modules/react-i18next/dist/es/index.js + 17 modules
var es = __webpack_require__(732696);
// EXTERNAL MODULE: ../../node_modules/react-router-dom/dist/umd/react-router-dom.production.min.js
var react_router_dom_production_min = __webpack_require__(232175);
// EXTERNAL MODULE: ./src/app/Components/Card/CardDark.tsx
var CardDark = __webpack_require__(87985);
// EXTERNAL MODULE: ./src/app/Components/Card/CardLight.tsx
var CardLight = __webpack_require__(567937);
// EXTERNAL MODULE: ./src/app/Components/CloseButton.tsx
var CloseButton = __webpack_require__(672055);
// EXTERNAL MODULE: ./src/app/Components/HitModeEditor.tsx
var HitModeEditor = __webpack_require__(569360);
// EXTERNAL MODULE: ./src/app/Components/LevelSelect.tsx
var LevelSelect = __webpack_require__(497859);
// EXTERNAL MODULE: ./src/app/Components/SqBadge.tsx
var SqBadge = __webpack_require__(783673);
// EXTERNAL MODULE: ./src/app/Context/CharacterContext.tsx
var CharacterContext = __webpack_require__(353710);
// EXTERNAL MODULE: ./src/app/Context/DataContext.tsx
var DataContext = __webpack_require__(790);
// EXTERNAL MODULE: ./src/app/Context/FormulaDataContext.tsx
var FormulaDataContext = __webpack_require__(963762);
;// CONCATENATED MODULE: ./src/app/Context/GraphContext.tsx

const GraphContext = /*#__PURE__*/(0,react.createContext)({});
// EXTERNAL MODULE: ./src/app/Data/Characters/index.ts + 212 modules
var Characters = __webpack_require__(970630);
// EXTERNAL MODULE: ./src/app/Database/Database.ts + 11 modules
var Database = __webpack_require__(225870);
// EXTERNAL MODULE: ./src/app/ReactHooks/useBoolState.tsx
var useBoolState = __webpack_require__(594657);
// EXTERNAL MODULE: ./src/app/ReactHooks/useCharacter.tsx
var useCharacter = __webpack_require__(944304);
// EXTERNAL MODULE: ./src/app/ReactHooks/useCharacterReducer.tsx
var useCharacterReducer = __webpack_require__(450670);
// EXTERNAL MODULE: ./src/app/ReactHooks/useDBMeta.tsx
var useDBMeta = __webpack_require__(610002);
// EXTERNAL MODULE: ./src/app/ReactHooks/useTeamData.tsx
var useTeamData = __webpack_require__(644942);
// EXTERNAL MODULE: ./src/app/ReactHooks/useTitle.tsx
var useTitle = __webpack_require__(947165);
// EXTERNAL MODULE: ./src/app/Types/consts.ts
var consts = __webpack_require__(736893);
// EXTERNAL MODULE: ./src/app/PageCharacter/CustomMultiTarget.tsx
var CustomMultiTarget = __webpack_require__(517054);
// EXTERNAL MODULE: ../../libs/g-assets/src/index.ts + 1738 modules
var src = __webpack_require__(918676);
// EXTERNAL MODULE: ./src/app/Components/Character/ThumbSide.tsx
var ThumbSide = __webpack_require__(756748);
// EXTERNAL MODULE: ./src/app/ReactHooks/useCharSelectionCallback.tsx
var useCharSelectionCallback = __webpack_require__(897856);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/CharSelectButton.tsx











const CharacterSelectionModal = /*#__PURE__*/react.lazy(() => __webpack_require__.e(/* import() */ 592).then(__webpack_require__.bind(__webpack_require__, 701296)));
function CharSelectButton() {
  var _characterSheet$name;
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const {
    characterSheet,
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const [showModal, setshowModal] = (0,react.useState)(false);
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const setCharacter = (0,useCharSelectionCallback/* default */.Z)();
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
      fallback: false,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterSelectionModal, {
        show: showModal,
        onHide: () => setshowModal(false),
        onSelect: setCharacter
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
      color: "info",
      onClick: () => setshowModal(true),
      startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ThumbSide/* default */.Z, {
        src: (0,src/* characterAsset */.Li)(characterKey, "iconSide", gender)
      }),
      children: (_characterSheet$name = characterSheet == null ? void 0 : characterSheet.name) != null ? _characterSheet$name : t("selectCharacter")
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Components/AmpReactionModeText.tsx
var AmpReactionModeText = __webpack_require__(817447);
// EXTERNAL MODULE: ./src/app/Components/Card/CardHeaderCustom.tsx
var CardHeaderCustom = __webpack_require__(86113);
// EXTERNAL MODULE: ./src/app/Components/ColoredText.tsx
var ColoredText = __webpack_require__(402344);
// EXTERNAL MODULE: ./src/app/Components/Image/ImgIcon.tsx
var ImgIcon = __webpack_require__(726578);
// EXTERNAL MODULE: ./src/app/Components/ModalWrapper.tsx
var ModalWrapper = __webpack_require__(898927);
// EXTERNAL MODULE: ./src/app/Formula/DisplayUtil.tsx
var DisplayUtil = __webpack_require__(199625);
// EXTERNAL MODULE: ./src/app/Formula/uiData.tsx
var uiData = __webpack_require__(961278);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/FormulaModal.tsx




















function FormulaModal() {
  const {
    modalOpen
  } = (0,react.useContext)(FormulaDataContext/* FormulaDataContext */.M);
  const {
    setFormulaData
  } = (0,react.useContext)(FormulaDataContext/* FormulaDataContext */.M);
  const onCloseHandler = (0,react.useCallback)(() => setFormulaData == null ? void 0 : setFormulaData(undefined, undefined), [setFormulaData]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
    open: !!modalOpen,
    onClose: onCloseHandler,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardHeader, {
        title: "Formulas & Calculations",
        action: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
          onClick: onCloseHandler
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
        sx: {
          pt: 0
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CalculationDisplay, {})
      })]
    })
  });
}
function CalculationDisplay() {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    data: contextData
  } = (0,react.useContext)(FormulaDataContext/* FormulaDataContext */.M);
  const sections = (0,DisplayUtil/* getDisplaySections */.U)(contextData != null ? contextData : data);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
    fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
      variant: "rectangular",
      width: "100%",
      height: 1000
    }),
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
      sx: {
        mr: -1,
        mb: -1
      },
      children: sections.map(([key, Nodes]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FormulaCalc, {
        displayNs: Nodes,
        sectionKey: key
      }, key))
    })
  });
}
function FormulaCalc({
  sectionKey,
  displayNs
}) {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    data: contextData
  } = (0,react.useContext)(FormulaDataContext/* FormulaDataContext */.M);
  const header = (0,react.useMemo)(() => (0,DisplayUtil/* getDisplayHeader */.f)(contextData != null ? contextData : data, sectionKey, database), [database, contextData, data, sectionKey]);
  if (!header) return null;
  if (Object.entries(displayNs).every(([_, node]) => node.isEmpty)) return null;
  const {
    title,
    icon,
    action
  } = header;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    sx: {
      mb: 1
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardHeaderCustom/* default */.Z, {
      avatar: icon && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgIcon/* default */.Z, {
        size: 2,
        sx: {
          m: -1
        },
        src: icon
      }),
      title: title,
      action: action && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        children: action
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: Object.entries(displayNs).map(([key, node]) => !node.isEmpty && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FormulaAccordian, {
        node: node
      }, key))
    })]
  });
}
function FormulaAccordian({
  node
}) {
  const {
    node: contextNode
  } = (0,react.useContext)(FormulaDataContext/* FormulaDataContext */.M);
  const [expanded, setExpanded] = (0,react.useState)(false);
  const handleChange = (0,react.useCallback)((e, isExpanded) => setExpanded(isExpanded), []);
  const scrollRef = (0,react.useRef)();
  (0,react.useEffect)(() => {
    if (node === contextNode) setTimeout(() => {
      var _scrollRef$current;
      return scrollRef == null ? void 0 : (_scrollRef$current = scrollRef.current) == null ? void 0 : _scrollRef$current.scrollIntoView == null ? void 0 : _scrollRef$current.scrollIntoView({
        behavior: "smooth"
      });
    }, 300);
  }, [scrollRef, node, contextNode]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Accordion, {
    sx: {
      bgcolor: "contentDark.main"
    },
    expanded: node === contextNode || expanded,
    onChange: handleChange,
    ref: scrollRef,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.AccordionSummary, {
      expandIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* ExpandMore */.pb0, {}),
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
          color: node.info.variant,
          children: node.info.name
        }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: (0,uiData/* nodeVStr */.p)(node)
        })]
      }), consts/* allAmpReactions.includes */.jU.includes(node.info.variant) && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
        sx: {
          display: "inline-block",
          ml: "auto",
          mr: 2
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(AmpReactionModeText/* default */.Z, {
          reaction: node.info.variant,
          trigger: node.info.subVariant
        })
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.AccordionDetails, {
      children: node.formulas.map((subform, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
        component: "div",
        children: subform
      }, i))
    })]
  });
}
// EXTERNAL MODULE: ../../libs/consts/src/index.ts
var consts_src = __webpack_require__(682799);
// EXTERNAL MODULE: ./src/app/Formula/index.ts + 1 modules
var Formula = __webpack_require__(534958);
// EXTERNAL MODULE: ./src/app/KeyMap/index.tsx + 1 modules
var KeyMap = __webpack_require__(419807);
// EXTERNAL MODULE: ./src/app/KeyMap/StatIcon.tsx + 11 modules
var StatIcon = __webpack_require__(943397);
// EXTERNAL MODULE: ./src/app/SVGIcons/index.tsx
var SVGIcons = __webpack_require__(929063);
// EXTERNAL MODULE: ../../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
var objectWithoutPropertiesLoose = __webpack_require__(998283);
;// CONCATENATED MODULE: ./src/app/Components/ExpandButton.tsx

const _excluded = ["expand"];


const ExpandButton = (0,material_node.styled)(props => {
  const other = (0,objectWithoutPropertiesLoose/* default */.Z)(props, _excluded);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.IconButton, Object.assign({}, other));
})(({
  theme,
  expand
}) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}));
/* harmony default export */ const Components_ExpandButton = (ExpandButton);
// EXTERNAL MODULE: ./src/app/Components/CustomNumberInput.tsx
var CustomNumberInput = __webpack_require__(789343);
// EXTERNAL MODULE: ./src/app/Components/TextButton.tsx
var TextButton = __webpack_require__(787051);
;// CONCATENATED MODULE: ./src/app/Components/StatInput.tsx

const StatInput_excluded = ["name", "children", "value", "placeholder", "defaultValue", "onValueChange", "percent", "disabled", "onReset"];






const FlexButtonGroup = (0,material_node.styled)(material_node.ButtonGroup)({
  display: "flex"
});
function StatInput(_ref) {
  let {
      name,
      children,
      value,
      placeholder,
      defaultValue = 0,
      onValueChange,
      percent = false,
      disabled = false,
      onReset
    } = _ref,
    restProps = (0,objectWithoutPropertiesLoose/* default */.Z)(_ref, StatInput_excluded);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(FlexButtonGroup, Object.assign({}, restProps, {
    children: [children, (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TextButton/* default */.Z, {
      sx: {
        px: 1
      },
      children: name
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* CustomNumberInputButtonGroupWrapper */.CC, {
      sx: {
        flexBasis: "10em",
        flexGrow: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
        sx: {
          px: 1
        },
        inputProps: {
          sx: {
            textAlign: "right"
          }
        },
        float: percent,
        placeholder: placeholder,
        value: value,
        onChange: onValueChange,
        disabled: disabled,
        endAdornment: percent ? "%" : undefined
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
      sx: {
        flexShrink: 2
      },
      size: "small",
      color: "error",
      onClick: () => onReset ? onReset() : onValueChange(defaultValue),
      disabled: disabled || value === defaultValue,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Replay */.UHt, {})
    })]
  }));
}
;// CONCATENATED MODULE: ./src/app/Components/EnemyEditor.tsx
let _ = t => t,
  _t;


















function EnemyExpandCard() {
  const {
    t
  } = (0,es/* useTranslation */.$G)("ui");
  const {
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const [expanded, setexpanded] = (0,react.useState)(false);
  const toggle = (0,react.useCallback)(() => setexpanded(!expanded), [setexpanded, expanded]);
  const eLvlNode = data.get(Formula/* uiInput.enemy.level */.ri.enemy.level);
  const eDefRed = data.get(Formula/* uiInput.enemy.defRed */.ri.enemy.defRed);
  const eDefIgn = data.get(Formula/* uiInput.enemy.defIgn */.ri.enemy.defIgn);
  const onReset = (0,react.useCallback)(() => characterDispatch({
    enemyOverride: {}
  }), [characterDispatch]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
      sx: {
        display: "flex",
        gap: 1,
        alignItems: "center",
        flexWrap: "wrap"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Chip, {
        size: "small",
        color: "success",
        label: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
          children: [eLvlNode.info.name, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: eLvlNode.value
          })]
        })
      }), consts_src/* allElementsWithPhy.map */.Kj.map(element => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(EnemyResText, {
          element: element
        })
      }, element)), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
        children: ["DEF Red. ", (0,uiData/* nodeVStr */.p)(eDefRed)]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
        children: ["DEF Ignore ", (0,uiData/* nodeVStr */.p)(eDefIgn)]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        flexGrow: 1,
        display: "flex",
        justifyContent: "flex-end",
        gap: 1,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
          size: "small",
          color: "error",
          onClick: onReset,
          startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Replay */.UHt, {}),
          children: t(_t || (_t = _`reset`))
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Components_ExpandButton, {
          expand: expanded,
          onClick: toggle,
          "aria-expanded": expanded,
          "aria-label": "show more",
          size: "small",
          sx: {
            marginLeft: 0
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* ExpandMore */.pb0, {})
        })]
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Collapse, {
      in: expanded,
      timeout: "auto",
      unmountOnExit: true,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
        sx: {
          pt: 0
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(EnemyEditor, {})
      })
    })]
  });
}
function EnemyResText({
  element
}) {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const node = data.get(Formula/* uiInput.enemy */.ri.enemy[`${element}_res_`]);
  const immune = !isFinite(node.value);
  const icon = (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* ElementIcon */.Z, {
    ele: element,
    iconProps: SVGIcons/* iconInlineProps */.m
  });
  const content = immune ? (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [icon, " \u221E"]
  }) : (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: [icon, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
      children: (0,uiData/* nodeVStr */.p)(node)
    })]
  });
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
    color: element,
    children: content
  });
}
function EnemyEditor({
  bsProps = {
    xs: 12,
    md: 6
  }
}) {
  var _enemyOverride$enemyL, _enemyOverride$enemyD, _enemyOverride$enemyD2;
  const {
    character: {
      enemyOverride
    },
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const defaultVal = 10;
  const eLvl = (_enemyOverride$enemyL = enemyOverride.enemyLevel) != null ? _enemyOverride$enemyL : data.get(Formula/* uiInput.lvl */.ri.lvl).value;
  const eDefRed = (_enemyOverride$enemyD = enemyOverride.enemyDefIgn_) != null ? _enemyOverride$enemyD : 0;
  const eDefIgn = (_enemyOverride$enemyD2 = enemyOverride.enemyDefRed_) != null ? _enemyOverride$enemyD2 : 0;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
    container: true,
    spacing: 1,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
      item: true
    }, bsProps, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        fullWidth: true,
        sx: {
          height: "100%"
        },
        size: "small",
        component: "a",
        color: "warning",
        href: "https://genshin-impact.fandom.com/wiki/Resistance#Base_Enemy_Resistances",
        target: "_blank",
        rel: "noreferrer",
        children: "To get the specific resistance values of enemies, please visit the wiki."
      })
    })), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
      item: true
    }, bsProps, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatInput, {
        sx: {
          bgcolor: t => t.palette.contentLight.main,
          width: "100%"
        },
        name: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
          children: KeyMap/* default.get */.ZP.get("enemyLevel")
        }),
        value: eLvl,
        placeholder: KeyMap/* default.getStr */.ZP.getStr("enemyLevel"),
        defaultValue: data.get(Formula/* uiInput.lvl */.ri.lvl).value,
        onValueChange: value => characterDispatch({
          type: "enemyOverride",
          statKey: "enemyLevel",
          value
        }),
        onReset: () => characterDispatch({
          type: "enemyOverride",
          statKey: "enemyLevel",
          value: undefined
        })
      })
    })), consts_src/* allElementsWithPhy.map */.Kj.map(eleKey => {
      const statKey = `${eleKey}_enemyRes_`;
      const val = enemyOverride[statKey];
      const elementImmunity = val === Number.MAX_VALUE;
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
        item: true
      }, bsProps, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatInput, {
          sx: {
            bgcolor: t => t.palette.contentLight.main,
            width: "100%"
          },
          name: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
            color: eleKey,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
              children: KeyMap/* default.get */.ZP.get(statKey)
            })
          }),
          value: val !== undefined ? elementImmunity ? Infinity : val : 10,
          placeholder: elementImmunity ? "∞ " : KeyMap/* default.getStr */.ZP.getStr(statKey),
          defaultValue: defaultVal,
          onValueChange: value => characterDispatch({
            type: "enemyOverride",
            statKey,
            value
          }),
          disabled: elementImmunity,
          percent: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            color: eleKey,
            onClick: () => characterDispatch({
              type: "enemyOverride",
              statKey,
              value: elementImmunity ? defaultVal : Number.MAX_VALUE
            }),
            startIcon: elementImmunity ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}),
            children: "Immunity"
          })
        })
      }), eleKey);
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
      item: true
    }, bsProps, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatInput, {
        sx: {
          bgcolor: t => t.palette.contentLight.main,
          width: "100%"
        },
        name: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
          children: KeyMap/* default.get */.ZP.get("enemyDefIgn_")
        }),
        value: eDefRed,
        placeholder: KeyMap/* default.getStr */.ZP.getStr("enemyDefIgn_"),
        defaultValue: 0,
        onValueChange: value => characterDispatch({
          type: "enemyOverride",
          statKey: "enemyDefIgn_",
          value
        }),
        percent: true
      })
    })), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
      item: true
    }, bsProps, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatInput, {
        sx: {
          bgcolor: t => t.palette.contentLight.main,
          width: "100%"
        },
        name: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
          children: KeyMap/* default.get */.ZP.get("enemyDefRed_")
        }),
        value: eDefIgn,
        placeholder: KeyMap/* default.getStr */.ZP.getStr("enemyDefRed_"),
        defaultValue: 0,
        onValueChange: value => characterDispatch({
          type: "enemyOverride",
          statKey: "enemyDefRed_",
          value
        }),
        percent: true
      })
    })), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
      item: true,
      xs: 12,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("small", {
        children: "Note: Genshin Impact halves resistance shred values below 0%. For the sake of calculations enter the RAW value and GO will do the rest. (e.g. 10% - 20% = -10%)"
      })
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Components/FieldDisplay.tsx
var FieldDisplay = __webpack_require__(802720);
// EXTERNAL MODULE: ./src/app/Components/StatEditorList.tsx
var StatEditorList = __webpack_require__(886953);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/StatModal.tsx
let StatModal_ = t => t,
  StatModal_t;


















const cols = {
  xs: 1,
  md: 2,
  lg: 3
};
function StatModal({
  open,
  onClose
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
    open: open,
    onClose: onClose,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardHeader, {
        title: t(StatModal_t || (StatModal_t = StatModal_`addStats.title`)),
        action: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
          onClick: onClose
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
        sx: {
          pt: 0
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
          spacing: 1,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BonusStatsEditor, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(EnemyExpandCard, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(MainStatsCards, {})]
        })
      })]
    })
  });
}
const keys = [...Formula/* allInputPremodKeys */.lR];
const wrapperFunc = (e, key) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
  item: true,
  xs: 1,
  children: e
}, key);
function BonusStatsEditor() {
  const {
    character: {
      bonusStats
    },
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const setFilter = (0,react.useCallback)(bonusStats => characterDispatch({
    bonusStats
  }), [characterDispatch]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      sx: {
        display: "flex"
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        container: true,
        columns: cols,
        sx: {
          pt: 1
        },
        spacing: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatEditorList/* default */.Z, {
          statKeys: keys,
          statFilters: bonusStats,
          setStatFilters: setFilter,
          wrapperFunc: wrapperFunc
        })
      })
    })
  });
}
const mainBaseKeys = ["hp", "atk", "def"];
const mainSubKeys = ["eleMas", "critRate_", "critDMG_", "enerRech_", "heal_"];
const mainReadNodes = [...mainBaseKeys, ...mainSubKeys].map(k => Formula/* uiInput.total */.ri.total[k]);
const mainEditKeys = ["atk_", "atk", "hp_", "hp", "def_", "def", ...mainSubKeys];
const otherStatKeys = [...KeyMap/* allEleDmgKeys */.hX, ...KeyMap/* allEleResKeys */.Sx, "stamina", "incHeal_", "shield_", "cdRed_"];
const miscStatkeys = Formula/* allInputPremodKeys.filter */.lR.filter(k => !mainEditKeys.includes(k) && !otherStatKeys.includes(k));
function StatDisplayContent({
  nodes,
  extra
}) {
  const {
    data,
    oldData
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(FieldDisplay/* FieldDisplayList */.lD, {
    children: [nodes.map(rn => {
      var _oldData$get;
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* NodeFieldDisplay */.JW, {
        component: material_node.ListItem,
        node: data.get(rn),
        oldValue: oldData == null ? void 0 : (_oldData$get = oldData.get(rn)) == null ? void 0 : _oldData$get.value
      }, JSON.stringify(rn.info));
    }), extra]
  });
}
function MainStatsCards() {
  const {
    characterSheet
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const specialNode = data.get(Formula/* uiInput.special */.ri.special);
  const charEle = characterSheet.elementKey;
  const isMelee = characterSheet.isMelee();
  const otherStatReadNodes = (0,react.useMemo)(() => {
    const nodes = otherStatKeys.filter(k => {
      if (k.includes(charEle)) return false;
      if (isMelee && k.includes("physical")) return true;
      return true;
    }).map(k => Formula/* uiInput.total */.ri.total[k]);
    return nodes.filter(n => !!data.get(n).value);
  }, [data, charEle, isMelee]);
  const miscStatReadNodes = (0,react.useMemo)(() => miscStatkeys.map(k => Formula/* uiInput.total */.ri.total[k]).filter(n => data.get(n).value), [data]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        container: true,
        columns: cols,
        spacing: 1,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          xs: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplayCard, {
            title: "Main Stats",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplayContent, {
              nodes: mainReadNodes,
              extra: specialNode && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.ListItem, {
                sx: {
                  display: "flex",
                  justifyContent: "space-between"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
                    children: "Special:"
                  }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                    color: specialNode.info.variant,
                    children: [specialNode.info.icon, " ", specialNode.info.name]
                  })]
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
                  children: (0,uiData/* nodeVStr */.p)(specialNode)
                })]
              })
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          xs: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplayCard, {
            title: "Other Stats",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplayContent, {
              nodes: otherStatReadNodes
            })
          })
        }), !!miscStatReadNodes.length && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          xs: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplayCard, {
            title: "Misc Stats",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplayContent, {
              nodes: miscStatReadNodes
            })
          })
        })]
      })
    })
  });
}
function StatDisplayCard({
  title,
  children
}) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      sx: {
        py: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
        display: "flex",
        justifyContent: "space-between",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          variant: "subtitle1",
          children: title
        })
      })
    }), children]
  });
}
// EXTERNAL MODULE: ./src/app/Components/Artifact/ArtifactLevelSlider.tsx
var ArtifactLevelSlider = __webpack_require__(932912);
// EXTERNAL MODULE: ./src/app/Components/BootstrapTooltip.tsx
var BootstrapTooltip = __webpack_require__(507300);
// EXTERNAL MODULE: ./src/app/Components/Character/CharacterCard.tsx + 1 modules
var CharacterCard = __webpack_require__(450875);
// EXTERNAL MODULE: ./src/app/Components/DropdownMenu/DropdownButton.tsx
var DropdownButton = __webpack_require__(645475);
// EXTERNAL MODULE: ./src/app/Components/SolidToggleButtonGroup.tsx
var SolidToggleButtonGroup = __webpack_require__(29432);
;// CONCATENATED MODULE: ./src/app/Context/OptimizationTargetContext.tsx

const OptimizationTargetContext = /*#__PURE__*/(0,react.createContext)(undefined);
// EXTERNAL MODULE: ./src/app/Database/DataEntries/DisplayOptimizeEntry.ts
var DisplayOptimizeEntry = __webpack_require__(265469);
// EXTERNAL MODULE: ./src/app/Formula/api.tsx
var api = __webpack_require__(130507);
// EXTERNAL MODULE: ./src/app/Formula/optimization.ts
var optimization = __webpack_require__(730597);
// EXTERNAL MODULE: ./src/app/ReactHooks/useForceUpdate.tsx
var useForceUpdate = __webpack_require__(536617);
// EXTERNAL MODULE: ./src/app/ReactHooks/useMediaQueryUp.tsx
var useMediaQueryUp = __webpack_require__(682716);
// EXTERNAL MODULE: ./src/app/Util/Util.ts
var Util = __webpack_require__(41015);
// EXTERNAL MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Build.ts
var Build = __webpack_require__(460791);
// EXTERNAL MODULE: ./src/app/Formula/internal.ts
var internal = __webpack_require__(740580);
// EXTERNAL MODULE: ./src/app/Formula/utils.ts
var utils = __webpack_require__(97797);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/common.ts





function pruneAll(nodes, minimum, arts, numTop, exclusion, forced) {
  let should = forced;
  /** If `key` makes progress, all operations in `value` should be performed */
  const deps = {
    pruneOrder: {
      pruneNodeRange: true
    },
    pruneArtRange: {
      pruneNodeRange: true
    },
    pruneNodeRange: {
      reaffine: true
    },
    reaffine: {
      pruneOrder: true,
      pruneArtRange: true,
      pruneNodeRange: true
    }
  };
  let count = 0;
  while (Object.values(should).some(x => x) && count++ < 20) {
    if (should.pruneOrder) {
      delete should.pruneOrder;
      const newArts = pruneOrder(arts, numTop, exclusion);
      if (arts !== newArts) {
        arts = newArts;
        should = Object.assign({}, should, deps.pruneOrder);
      }
    }
    if (should.pruneArtRange) {
      delete should.pruneArtRange;
      const newArts = pruneArtRange(nodes, arts, minimum);
      if (arts !== newArts) {
        arts = newArts;
        should = Object.assign({}, should, deps.pruneArtRange);
      }
    }
    if (should.pruneNodeRange) {
      delete should.pruneNodeRange;
      const newNodes = pruneNodeRange(nodes, arts);
      if (nodes !== newNodes) {
        nodes = newNodes;
        should = Object.assign({}, should, deps.pruneNodeRange);
      }
    }
    if (should.reaffine) {
      delete should.reaffine;
      const {
        nodes: newNodes,
        arts: newArts
      } = reaffine(nodes, arts);
      if (nodes !== newNodes || arts !== newArts) {
        nodes = newNodes;
        arts = newArts;
        should = Object.assign({}, should, deps.reaffine);
      }
    }
  }
  return {
    nodes,
    arts
  };
}
function pruneExclusion(nodes, exclusion) {
  const maxValues = {};
  for (const [key, e] of Object.entries(exclusion)) {
    if (!e.includes(4)) continue;
    maxValues[key] = e.includes(2) ? 1 : 3;
  }
  return (0,internal/* mapFormulas */.uW)(nodes, f => f, f => {
    if (f.operation !== "threshold") return f;
    const [v, t, pass, fail] = f.operands;
    if (v.operation === "read" && t.operation === "const") {
      const key = v.path[v.path.length - 1],
        thres = t.value;
      if (key in maxValues) {
        const max = maxValues[key];
        if (max < thres) return fail;
        if (thres === 2 && exclusion[key].includes(2)) return (0,utils/* threshold */.Lj)(v, 4, pass, fail);
      }
    }
    return f;
  });
}
function reaffine(nodes, arts, forceRename = false) {
  const affineNodes = new Set(),
    topLevelAffine = new Set();
  function visit(node, isAffine) {
    if (isAffine) affineNodes.add(node);else node.operands.forEach(op => affineNodes.has(op) && topLevelAffine.add(op));
  }
  const dynKeys = new Set();
  (0,internal/* forEachNodes */.aD)(nodes, _ => {}, f => {
    const {
      operation
    } = f;
    switch (operation) {
      case "read":
        dynKeys.add(f.path[1]);
        visit(f, true);
        break;
      case "add":
        visit(f, f.operands.every(op => affineNodes.has(op)));
        break;
      case "mul":
        {
          const nonConst = f.operands.filter(op => op.operation !== "const");
          visit(f, nonConst.length === 0 || nonConst.length === 1 && affineNodes.has(nonConst[0]));
          break;
        }
      case "const":
        visit(f, true);
        break;
      case "res":
      case "threshold":
      case "sum_frac":
      case "max":
      case "min":
        visit(f, false);
        break;
      default:
        (0,Util/* assertUnreachable */.UT)(operation);
    }
  });
  if ([...topLevelAffine].every(({
    operation
  }) => operation === "read" || operation === "const") && Object.keys(arts.base).length === dynKeys.size) return {
    nodes,
    arts
  };
  let current = -1;
  function nextDynKey() {
    while (dynKeys.has(`${++current}`));
    return `${current}`;
  }
  nodes.forEach(node => affineNodes.has(node) && topLevelAffine.add(node));
  const affine = [...topLevelAffine].filter(f => f.operation !== "const");
  const affineMap = new Map(affine.map(node => [node, !forceRename && node.operation === "read" && node.path[0] === "dyn" ? node : Object.assign({}, (0,utils/* customRead */.UF)(["dyn", `${nextDynKey()}`]), {
    accu: "add"
  })]));
  nodes = (0,internal/* mapFormulas */.uW)(nodes, f => {
    var _affineMap$get;
    return (_affineMap$get = affineMap.get(f)) != null ? _affineMap$get : f;
  }, f => f);
  function reaffineArt(stat) {
    const values = (0,optimization/* constantFold */.CG)([...affineMap.keys()], {
      dyn: (0,Util/* objectMap */.xh)(stat, value => (0,utils/* constant */.a9)(value))
    }, _ => true);
    return Object.fromEntries([...affineMap.values()].map((v, i) => [v.path[1], values[i].value]));
  }
  const result = {
    nodes,
    arts: {
      base: reaffineArt(arts.base),
      values: (0,Util/* objectKeyMap */.O)(consts/* allSlotKeys */.eV, slot => arts.values[slot].map(({
        id,
        set,
        values
      }) => ({
        id,
        set,
        values: reaffineArt(values)
      })))
    }
  };
  const offsets = Object.entries(reaffineArt({}));
  for (const _arts of Object.values(result.arts.values)) for (const {
    values
  } of _arts) for (const [key, baseValue] of offsets) values[key] -= baseValue;
  return result;
}
/** Remove artifacts that cannot be in top `numTop` builds */
function pruneOrder(arts, numTop, exclusion) {
  var _exclusion$rainbow;
  let progress = false;
  /**
   * Note:
   * This function assumes that every base (reaffined) stats are monotonically increasing. That is, artifacts
   * with higher stats are better. This remains true as long as the main and substats are in increasing. Set
   * effects that decrease enemy resistance (which is monotonically decreasing) does not violate this assumption
   * as set effects are not handled here.
   */
  const allowRainbow = !((_exclusion$rainbow = exclusion.rainbow) != null && _exclusion$rainbow.length),
    keys = Object.keys(arts.base);
  const noSwitchIn = new Set(Object.entries(exclusion).filter(([_, v]) => v.length).map(([k]) => k));
  const noSwitchOut = new Set(Object.entries(exclusion).filter(([_, v]) => v.includes(2) && !v.includes(4)).map(([k]) => k));
  const values = (0,Util/* objectKeyMap */.O)(consts/* allSlotKeys */.eV, slot => {
    const list = arts.values[slot];
    const newList = list.filter(art => {
      let count = 0;
      return list.every(other => {
        const otherBetterEqual = keys.every(k => {
          var _other$values$k, _art$values$k;
          return ((_other$values$k = other.values[k]) != null ? _other$values$k : 0) >= ((_art$values$k = art.values[k]) != null ? _art$values$k : 0);
        });
        const otherMaybeBetter = keys.some(k => {
          var _other$values$k2, _art$values$k2;
          return ((_other$values$k2 = other.values[k]) != null ? _other$values$k2 : 0) > ((_art$values$k2 = art.values[k]) != null ? _art$values$k2 : 0);
        });
        const otherBetter = otherBetterEqual && (otherMaybeBetter || other.id > art.id);
        const canSwitch = allowRainbow && !noSwitchIn.has(other.set) && !noSwitchOut.has(art.set) || art.set === other.set;
        if (otherBetter && canSwitch) count++;
        return count < numTop;
      });
    });
    if (newList.length !== list.length) progress = true;
    return newList;
  });
  return progress ? {
    base: arts.base,
    values
  } : arts;
}
/** Remove artifacts that cannot reach `minimum` in any build */
function pruneArtRange(nodes, arts, minimum) {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, {
    min: x,
    max: x
  }]));
  const wrap = {
    arts
  };
  while (true) {
    const artRanges = (0,Util/* objectKeyMap */.O)(consts/* allSlotKeys */.eV, slot => computeArtRange(wrap.arts.values[slot]));
    const otherArtRanges = (0,Util/* objectKeyMap */.O)(consts/* allSlotKeys */.eV, key => addArtRange(Object.entries(artRanges).map(a => a[0] === key ? baseRange : a[1]).filter(x => x)));
    let progress = false;
    const values = (0,Util/* objectKeyMap */.O)(consts/* allSlotKeys */.eV, slot => {
      const result = wrap.arts.values[slot].filter(art => {
        const read = addArtRange([computeArtRange([art]), otherArtRanges[slot]]);
        const newRange = computeNodeRange(nodes, read);
        return nodes.every((node, i) => {
          var _minimum$i;
          return newRange.get(node).max >= ((_minimum$i = minimum[i]) != null ? _minimum$i : -Infinity);
        });
      });
      if (result.length !== wrap.arts.values[slot].length) progress = true;
      return result;
    });
    if (!progress) break;
    wrap.arts = {
      base: wrap.arts.base,
      values
    };
  }
  return wrap.arts;
}
function pruneNodeRange(nodes, arts) {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, {
    min: x,
    max: x
  }]));
  const reads = addArtRange([baseRange, ...Object.values(arts.values).map(values => computeArtRange(values))]);
  const nodeRange = computeNodeRange(nodes, reads);
  return (0,internal/* mapFormulas */.uW)(nodes, f => {
    {
      const {
        min,
        max
      } = nodeRange.get(f);
      if (min === max) return (0,utils/* constant */.a9)(min);
    }
    const {
      operation
    } = f;
    const operandRanges = f.operands.map(x => nodeRange.get(x));
    switch (operation) {
      case "threshold":
        {
          const [value, threshold, pass, fail] = operandRanges;
          if (value.min >= threshold.max) return f.operands[2];else if (value.max < threshold.min) return f.operands[3];
          if (pass.max === pass.min && fail.max === fail.min && pass.min === fail.min && isFinite(pass.min)) return (0,utils/* constant */.a9)(pass.max);
          break;
        }
      case "min":
        {
          const newOperands = f.operands.filter((_, i) => {
            const op1 = operandRanges[i];
            return operandRanges.every((op2, j) => op1.min <= op2.max);
          });
          if (newOperands.length < operandRanges.length) return (0,utils/* min */.VV)(...newOperands);
          break;
        }
      case "max":
        {
          const newOperands = f.operands.filter((_, i) => {
            const op1 = operandRanges[i];
            return operandRanges.every(op2 => op1.max >= op2.min);
          });
          if (newOperands.length < operandRanges.length) return (0,utils/* max */.Fp)(...newOperands);
          break;
        }
    }
    return f;
  }, f => f);
}
function addArtRange(ranges) {
  const result = {};
  ranges.forEach(range => {
    Object.entries(range).forEach(([key, value]) => {
      if (result[key]) {
        result[key].min += value.min;
        result[key].max += value.max;
      } else result[key] = Object.assign({}, value);
    });
  });
  return result;
}
function computeArtRange(arts) {
  const result = {};
  if (arts.length) {
    Object.keys(arts[0].values).filter(key => arts.every(art => art.values[key])).forEach(key => result[key] = {
      min: arts[0].values[key],
      max: arts[0].values[key]
    });
    arts.forEach(({
      values
    }) => {
      for (const [key, value] of Object.entries(values)) {
        if (!result[key]) result[key] = {
          min: 0,
          max: value
        };else {
          if (result[key].max < value) result[key].max = value;
          if (result[key].min > value) result[key].min = value;
        }
      }
    });
  }
  return result;
}
function computeFullArtRange(arts) {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, {
    min: x,
    max: x
  }]));
  return addArtRange([baseRange, ...Object.values(arts.values).map(values => computeArtRange(values))]);
}
function computeNodeRange(nodes, reads) {
  const range = new Map();
  (0,internal/* forEachNodes */.aD)(nodes, _ => {}, f => {
    var _reads$f$path$;
    const {
      operation
    } = f;
    const operands = f.operands.map(op => range.get(op));
    let current;
    switch (operation) {
      case "read":
        if (f.path[0] !== "dyn") throw new Error(`Found non-dyn path ${f.path} while computing range`);
        current = (_reads$f$path$ = reads[f.path[1]]) != null ? _reads$f$path$ : {
          min: 0,
          max: 0
        };
        break;
      case "const":
        current = computeMinMax([f.value]);
        break;
      case "add":
      case "min":
      case "max":
        current = {
          min: optimization/* allOperations */.aj[operation](operands.map(x => x.min)),
          max: optimization/* allOperations */.aj[operation](operands.map(x => x.max))
        };
        break;
      case "res":
        current = {
          min: optimization/* allOperations */.aj[operation]([operands[0].max]),
          max: optimization/* allOperations */.aj[operation]([operands[0].min])
        };
        break;
      case "mul":
        current = operands.reduce((accu, current) => computeMinMax([accu.min * current.min, accu.min * current.max, accu.max * current.min, accu.max * current.max]));
        break;
      case "threshold":
        if (operands[0].min >= operands[1].max) current = operands[2];else if (operands[0].max < operands[1].min) current = operands[3];else current = computeMinMax([], [operands[2], operands[3]]);
        break;
      case "sum_frac":
        {
          const [x, c] = operands,
            sum = {
              min: x.min + c.min,
              max: x.max + c.max
            };
          if (sum.min <= 0 && sum.max >= 0) current = x.min <= 0 && x.max >= 0 ? {
            min: NaN,
            max: NaN
          } : {
            min: -Infinity,
            max: Infinity
          };else
            // TODO: Check this
            current = computeMinMax([x.min / sum.min, x.min / sum.max, x.max / sum.min, x.max / sum.max]);
          break;
        }
      default:
        (0,Util/* assertUnreachable */.UT)(operation);
    }
    range.set(f, current);
  });
  return range;
}
function computeMinMax(values, minMaxes = []) {
  const max = Math.max(...values, ...minMaxes.map(x => x.max));
  const min = Math.min(...values, ...minMaxes.map(x => x.min));
  return {
    min,
    max
  };
}
function filterArts(arts, filters) {
  return {
    base: arts.base,
    values: objectKeyMap(allSlotKeys, slot => {
      const filter = filters[slot];
      switch (filter.kind) {
        case "id":
          return arts.values[slot].filter(art => filter.ids.has(art.id));
        case "exclude":
          return arts.values[slot].filter(art => !filter.sets.has(art.set));
        case "required":
          return arts.values[slot].filter(art => filter.sets.has(art.set));
      }
    })
  };
}
function mergeBuilds(builds, maxNum) {
  return builds.flatMap(x => x).sort((a, b) => b.value - a.value).slice(0, maxNum);
}
function mergePlot(plots) {
  let scale = 0.01,
    reductionScaling = 2,
    maxCount = 1500;
  let keys = new Set(plots.flatMap(x => Object.values(x).map(v => Math.round(v.plot / scale))));
  while (keys.size > maxCount) {
    scale *= reductionScaling;
    keys = new Set([...keys].map(key => Math.round(key / reductionScaling)));
  }
  const result = {};
  for (const plot of plots) for (const build of Object.values(plot)) {
    const x = Math.round(build.plot / scale) * scale;
    if (!result[x] || result[x].value < build.value) result[x] = build;
  }
  return result;
}
function countBuilds(arts) {
  return allSlotKeys.reduce((_count, slot) => _count * arts.values[slot].length, 1);
}
function* filterFeasiblePerm(filters, _artSets) {
  const artSets = (0,Util/* objectMap */.xh)(_artSets.values, values => new Set(values.map(v => v.set)));
  filter_loop: for (const filter of filters) {
    for (const [slot, f] of Object.entries(filter)) {
      const available = artSets[slot];
      switch (f.kind) {
        case "required":
          if ([...f.sets].every(s => !available.has(s))) continue filter_loop;
          break;
        case "exclude":
          if ([...available].every(s => f.sets.has(s))) continue filter_loop;
          break;
        case "id":
          break;
      }
    }
    yield filter;
  }
}
function exclusionToAllowed(exclusion) {
  return new Set(exclusion != null && exclusion.includes(2) ? exclusion.includes(4) ? [0, 1] : [0, 1, 4, 5] : exclusion != null && exclusion.includes(4) ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5]);
}
/** A *disjoint* set of `RequestFilter` satisfying the exclusion rules */
function* artSetPerm(exclusion, _artSets) {
  /**
   * This generation algorithm is separated into two parts:
   * - "Shape" generation
   *   - It first generates all build "shapes", e.g., AABBC, ABBCD
   *   - It then filters the generated shapes according to the rainbow exclusion, e.g., removes ABBCD if excluding 3 rainbows
   *   - It then merges the remaining shapes into wildcards, e.g. AABAA + AABAB + AABAC => AABA*
   * - Shape filling
   *   - From the given shapes, it tries to fill in all non-rainbow slots, e.g., slots A and B of AABBC, with actual artifacts
   *   - It then fills the rainbow slots, e.g., slot C of AABBC while ensuring the exclusion rule of each sets
   */
  const artSets = [...new Set(_artSets)],
    allowedRainbows = exclusionToAllowed(exclusion.rainbow);
  let shapes = [];
  function populateShapes(current, list, rainbows) {
    if (current.length === 5) {
      if (allowedRainbows.has(rainbows.length)) shapes.push(current);
      return;
    }
    for (const i of list) populateShapes([...current, i], list, rainbows.filter(j => j !== i));
    populateShapes([...current, current.length], new Set([...list, current.length]), [...rainbows, current.length]);
  }
  populateShapes([0], new Set([0]), [0]);
  function indexOfShape(shape, replacing) {
    if ((0,Util/* range */.w6)(replacing + 1, 4).some(i => shape[i] !== 5)) return undefined;
    shape = [...shape];
    shape[replacing] = 5;
    return shape.reduce((a, b) => a * 6 + b, 0);
  }
  for (let replacing = 4; replacing >= 0; replacing--) {
    const required = new Map();
    for (const shape of shapes) {
      var _required$get;
      const id = indexOfShape(shape, replacing);
      if (id === undefined) continue;
      required.set(id, ((_required$get = required.get(id)) != null ? _required$get : new Set(shape.slice(0, replacing)).size + 1) - 1);
    }
    for (const [id, remaining] of required.entries()) {
      if (remaining === 0) {
        const shape = [...shapes.find(shape => indexOfShape(shape, replacing) === id)];
        shape[replacing] = 5;
        shapes = shapes.filter(shape => indexOfShape(shape, replacing) !== id);
        shapes.push(shape);
      }
    }
  }

  // Shapes are now calculated and merged, proceed to fill in the sets

  const noFilter = {
    kind: "exclude",
    sets: new Set()
  };
  const result = (0,Util/* objectKeyMap */.O)(consts/* allSlotKeys */.eV, _ => noFilter);
  const counts = Object.assign({}, (0,Util/* objectMap */.xh)(exclusion, _ => 0), (0,Util/* objectKeyMap */.O)(artSets, _ => 0));
  const allowedCounts = (0,Util/* objectMap */.xh)(exclusion, exclusionToAllowed);
  function* check(shape) {
    const used = new Set();
    let groupped = [],
      rainbows = [];
    for (const i of shape) {
      groupped.push([]);
      if (i === 5) rainbows.push(groupped.length - 1);else groupped[i].push(groupped.length - 1);
    }
    groupped = groupped.filter(v => v.length).sort((a, b) => b.length - a.length);
    let usableRainbows = rainbows.length;

    // Inception.. because js doesn't like functions inside a for-loop
    function* check(i) {
      if (i === groupped.length) return yield* check_free(0);
      for (const set of artSets) {
        if (used.has(set)) continue;
        const length = groupped[i].length,
          allowedSet = allowedCounts[set];
        let requiredRainbows = 0;
        if (allowedSet && !allowedSet.has(length)) {
          var _range$find;
          // Look ahead and see if we have enough rainbows to fill to the next `allowedSet` if we use the current set
          requiredRainbows = ((_range$find = (0,Util/* range */.w6)(length + 1, 5).find(l => allowedSet.has(l))) != null ? _range$find : 6) - length;
          if (requiredRainbows > usableRainbows) continue; // Not enough rainbows. Next..
        }

        used.add(set);
        counts[set] = groupped[i].length;
        groupped[i].forEach(j => result[consts/* allSlotKeys */.eV[j]] = {
          kind: "required",
          sets: new Set([set])
        });
        usableRainbows -= requiredRainbows;
        yield* check(i + 1);
        usableRainbows += requiredRainbows;
        counts[set] = 0;
        used.delete(set);
      }
    }
    // We separate filling rainbow slots from groupped slots because it has an entirely
    // different set of rules regarding what can be filled and what states to be kept.
    function* check_free(i) {
      const remaining = rainbows.length - i,
        isolated = [],
        missing = [],
        rejected = [];
      let required = 0;
      for (const set of artSets) {
        const allowedSet = allowedCounts[set],
          count = counts[set];
        if (!allowedSet) continue;
        if ((0,Util/* range */.w6)(1, remaining).every(j => !allowedSet.has(count + j))) rejected.push(set);else if (!allowedSet.has(count)) {
          required += [...allowedSet].find(x => x > count) - count;
          missing.push(set);
        } else if ((0,Util/* range */.w6)(0, remaining).some(j => !allowedSet.has(count + j))) isolated.push(set);
      }
      if (required > remaining) return;
      if (i === rainbows.length) {
        yield Object.assign({}, result);
        return;
      }
      if (required === remaining) {
        for (const set of missing) {
          counts[set]++;
          result[consts/* allSlotKeys */.eV[rainbows[i]]] = {
            kind: "required",
            sets: new Set([set])
          };
          yield* check_free(i + 1);
          counts[set]--;
        }
        return;
      }
      for (const set of [...isolated, ...missing]) {
        counts[set]++;
        result[consts/* allSlotKeys */.eV[rainbows[i]]] = {
          kind: "required",
          sets: new Set([set])
        };
        yield* check_free(i + 1);
        counts[set]--;
      }
      result[consts/* allSlotKeys */.eV[rainbows[i]]] = {
        kind: "exclude",
        sets: new Set([...missing, ...rejected, ...isolated])
      };
      yield* check_free(i + 1);
    }
    yield* check(0);
  }
  for (const shape of shapes) yield* check(shape);
}
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/Block.js
var Block = __webpack_require__(738114);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/ShowChart.js
var ShowChart = __webpack_require__(296511);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/StarRounded.js
var StarRounded = __webpack_require__(478437);
// EXTERNAL MODULE: ./src/app/Data/Artifacts/index.ts + 44 modules
var Artifacts = __webpack_require__(261420);
// EXTERNAL MODULE: ./src/app/Components/DocumentDisplay.tsx + 2 modules
var DocumentDisplay = __webpack_require__(73740);
;// CONCATENATED MODULE: ./src/app/Components/Artifact/SetEffectDisplay.tsx




function SetEffectDisplay({
  setKey,
  setNumKey,
  hideHeader = false,
  conditionalsOnly = false
}) {
  var _sheet$setEffectDocum;
  const sheet = (0,Artifacts/* getArtSheet */.Sk)(setKey);
  const document = conditionalsOnly ? (_sheet$setEffectDocum = sheet.setEffectDocument(setNumKey)) == null ? void 0 : _sheet$setEffectDocum.filter(section => "states" in section) : sheet.setEffectDocument(setNumKey);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
    display: "flex",
    flexDirection: "column",
    children: document ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DocumentDisplay/* default */.Z, {
      sections: document,
      hideHeader: hideHeader
    }) : null
  });
}
// EXTERNAL MODULE: ./src/app/Components/Artifact/SlotIcon.tsx + 3 modules
var SlotIcon = __webpack_require__(815378);
// EXTERNAL MODULE: ./src/app/Components/InfoTooltip.tsx
var InfoTooltip = __webpack_require__(282334);
// EXTERNAL MODULE: ./src/app/Components/Translate.tsx
var Translate = __webpack_require__(721845);
// EXTERNAL MODULE: ./src/app/Data/Artifacts/ArtifactSheet.tsx
var ArtifactSheet = __webpack_require__(374637);
// EXTERNAL MODULE: ./src/app/Database/DataManagers/BuildSettingData.ts
var BuildSettingData = __webpack_require__(560184);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/useBuildSetting.ts


function useBuildSetting(characterKey) {
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [buildSetting, setBuildSetting] = (0,react.useState)(() => database.buildSettings.get(characterKey));
  (0,react.useEffect)(() => setBuildSetting(database.buildSettings.get(characterKey)), [database, characterKey]);
  (0,react.useEffect)(() => database.buildSettings.follow(characterKey, (k, r, v) => r === "update" && setBuildSetting(v)), [characterKey, setBuildSetting, database]);
  const buildSettingDispatch = (0,react.useCallback)(action => characterKey && database.buildSettings.set(characterKey, action), [characterKey, database]);
  return {
    buildSetting: buildSetting,
    buildSettingDispatch
  };
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/ArtifactSetConfig.tsx
let _2 = t => t,
  ArtifactSetConfig_t,
  _t2,
  _t3,
  _t4,
  _t5,
  _t6,
  _t7,
  _t8,
  _t9,
  _t10,
  _t11,
  _t12,
  _t13,
  _t14,
  _t15,
  _t16;

































function ArtifactSetConfig({
  disabled
}) {
  var _artSetExclusion$rain, _artSetExclusion$rain2;
  const {
    t
  } = (0,es/* useTranslation */.$G)(["page_character_optimize", "sheet"]);
  const dataContext = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    character: {
      key: characterKey,
      conditional
    },
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    buildSetting: {
      artSetExclusion
    },
    buildSettingDispatch
  } = useBuildSetting(characterKey);
  const [open, setOpen] = (0,react.useState)(false);
  const onOpen = (0,react.useCallback)(() => setOpen(true), [setOpen]);
  const onClose = (0,react.useCallback)(() => setOpen(false), [setOpen]);
  const [dbDirty, forceUpdate] = (0,useForceUpdate/* default */.Z)();
  (0,react.useEffect)(() => database.arts.followAny(forceUpdate), [database, forceUpdate]);
  const artKeysByRarity = (0,react.useMemo)(() => Object.entries(Artifacts/* setKeysByRarities */.WO).reverse().flatMap(([, sets]) => sets).filter(key => !key.includes("Prayers")), []);
  const {
    artKeys,
    artSlotCount
  } = (0,react.useMemo)(() => {
    const artSlotCount = (0,Util/* objectKeyMap */.O)(artKeysByRarity, _ => (0,Util/* objectKeyMap */.O)(consts_src/* allSlotKeys */.eV, _ => 0));
    database.arts.values.forEach(art => artSlotCount[art.setKey] && artSlotCount[art.setKey][art.slotKey]++);
    const artKeys = [...artKeysByRarity].sort((a, b) => +(getNumSlots(artSlotCount[a]) < 2) - +(getNumSlots(artSlotCount[b]) < 2));
    return dbDirty && {
      artKeys,
      artSlotCount
    };
  }, [dbDirty, database, artKeysByRarity]);
  const allowRainbow2 = !((_artSetExclusion$rain = artSetExclusion.rainbow) != null && _artSetExclusion$rain.includes(2));
  const allowRainbow4 = !((_artSetExclusion$rain2 = artSetExclusion.rainbow) != null && _artSetExclusion$rain2.includes(4));
  const {
    allow2,
    allow4
  } = (0,react.useMemo)(() => ({
    allow2: artKeysByRarity.filter(k => {
      var _artSetExclusion$k;
      return !((_artSetExclusion$k = artSetExclusion[k]) != null && _artSetExclusion$k.includes(2));
    }).length,
    allow4: artKeysByRarity.filter(k => {
      var _artSetExclusion$k2;
      return !((_artSetExclusion$k2 = artSetExclusion[k]) != null && _artSetExclusion$k2.includes(4));
    }).length
  }), [artKeysByRarity, artSetExclusion]);
  const exclude2 = artKeysByRarity.length - allow2,
    exclude4 = artKeysByRarity.length - allow4;
  const artifactCondCount = (0,react.useMemo)(() => Object.keys(conditional).filter(k => consts_src/* allArtifactSets.includes */.q2.includes(k) && conditional[k]).length, [conditional]);
  const fakeDataContextObj = (0,react.useMemo)(() => Object.assign({}, dataContext, {
    data: new uiData/* UIData */.w(Object.assign({}, dataContext.data.data[0], {
      artSet: (0,Util/* objectKeyMap */.O)(consts_src/* allArtifactSets */.q2, _ => (0,utils/* constant */.a9)(4))
    }), undefined)
  }), [dataContext]);
  const resetArtConds = (0,react.useCallback)(() => {
    const tconditional = Object.fromEntries(Object.entries(conditional).filter(([k, v]) => !consts_src/* allArtifactSets.includes */.q2.includes(k)));
    characterDispatch({
      conditional: tconditional
    });
  }, [conditional, characterDispatch]);
  const setAllExclusion = (0,react.useCallback)((setnum, exclude = true) => {
    const artSetExclusion_ = (0,Util/* deepClone */.I8)(artSetExclusion);
    artKeysByRarity.forEach(k => {
      var _artSetExclusion_$k;
      if (exclude) artSetExclusion_[k] = [...((_artSetExclusion_$k = artSetExclusion_[k]) != null ? _artSetExclusion_$k : []), setnum];else if (artSetExclusion_[k]) artSetExclusion_[k] = artSetExclusion_[k].filter(n => n !== setnum);
    });
    buildSettingDispatch({
      artSetExclusion: artSetExclusion_
    });
  }, [artKeysByRarity, artSetExclusion, buildSettingDispatch]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
      sx: {
        display: "flex"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
        sx: {
          flexGrow: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: t(ArtifactSetConfig_t || (ArtifactSetConfig_t = _2`artSetConfig.title`))
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
          spacing: 1,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
            children: [t(_t2 || (_t2 = _2`artSetConfig.setEffCond`)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
              color: artifactCondCount ? "success" : "warning",
              children: [artifactCondCount, " ", t("artSetConfig.enabled")]
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
            children: [t(_t3 || (_t3 = _2`sheet:2set`)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
              color: "success",
              children: [allow2, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", t("artSetConfig.allowed")]
            }), !!exclude2 && " / ", !!exclude2 && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
              color: "secondary",
              children: [exclude2, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", t("artSetConfig.excluded")]
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
            children: [t(_t4 || (_t4 = _2`sheet:4set`)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
              color: "success",
              children: [allow4, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", t("artSetConfig.allowed")]
            }), !!exclude4 && " / ", !!exclude4 && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
              color: "secondary",
              children: [exclude4, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", t("artSetConfig.excluded")]
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
            children: [t(_t5 || (_t5 = _2`artSetConfig.2rainbow`)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
              color: allowRainbow2 ? "success" : "secondary",
              children: [allowRainbow2 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", allowRainbow2 ? t("artSetConfig.allowed") : "Excluded"]
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
            children: [t(_t6 || (_t6 = _2`artSetConfig.4rainbow`)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
              color: allowRainbow4 ? "success" : "secondary",
              children: [allowRainbow4 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", allowRainbow4 ? t("artSetConfig.allowed") : "Excluded"]
            })]
          })]
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        onClick: onOpen,
        disabled: disabled,
        color: "info",
        sx: {
          borderRadius: 0
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Settings */.Zrf, {})
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
      open: open,
      onClose: onClose,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
          sx: {
            display: "flex",
            gap: 1,
            justifyContent: "space-between"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
            variant: "h6",
            children: t(_t7 || (_t7 = _2`artSetConfig.title`))
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
            onClick: onClose
          })]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            sx: {
              mb: 1
            },
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                display: "flex",
                gap: 1,
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: t(_t8 || (_t8 = _2`artSetConfig.modal.setCond.title`))
                  })
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                  sx: {
                    flexGrow: 1
                  },
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                    color: artifactCondCount ? "success" : "warning",
                    children: [artifactCondCount, " ", t("artSetConfig.selected")]
                  })
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
                  size: "small",
                  onClick: resetArtConds,
                  color: "error",
                  startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Replay */.UHt, {}),
                  children: t(_t9 || (_t9 = _2`artSetConfig.modal.setCond.reset`))
                })]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                children: t(_t10 || (_t10 = _2`artSetConfig.modal.setCond.text`))
              })]
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            sx: {
              mb: 1
            },
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                sx: {
                  flexGrow: 1
                },
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                    t: t,
                    i18nKey: "artSetConfig.modal.ArtSetFilter.title",
                    children: ["Artifact Sets ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                      color: "success",
                      children: ["Allowed", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m))]
                    }), " / ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: ["Excluded", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m))]
                    })]
                  })
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "artSetConfig.modal.ArtSetFilter.intro",
                  children: ["You can allow/exclude which sets you want the builder to consider. In the following examples, ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: "A"
                  }), " is on-set, and ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: "R"
                  }), " is rainbow(off-set)"]
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "artSetConfig.modal.ArtSetFilter.2set",
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: ["Excluding", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " 2-Set"]
                    })
                  }), " would exclude 2-Set builds: ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
                    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: "AA"
                    }), "RRR"]
                  }), " and ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
                    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: "AAA"
                    }), "RR"]
                  }), "."]
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "artSetConfig.modal.ArtSetFilter.4set",
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: ["Excluding", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " 4-Set"]
                    })
                  }), " would exclude 4-Set builds: ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
                    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: "AAAA"
                    }), "R"]
                  }), " and ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: "AAAAA"
                    })
                  }), "."]
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "artSetConfig.modal.ArtSetFilter.2rain",
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: ["Excluding", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " 3-Rainbow"]
                    })
                  }), " would exclude 2-Set + 3-Rainbow builds: ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
                    children: ["AA", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: "RRR"
                    })]
                  }), " and ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
                    children: ["AAA", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: "RR"
                    })]
                  }), "."]
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "artSetConfig.modal.ArtSetFilter.4rain",
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: ["Excluding", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " 5-Rainbow"]
                    })
                  }), " would exclude full 5-Rainbow builds: ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
                      color: "secondary",
                      variant: "light",
                      children: "RRRRR"
                    })
                  }), "."]
                })
              })]
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
            container: true,
            columns: {
              xs: 2,
              lg: 3
            },
            sx: {
              mb: 1
            },
            spacing: 1,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              xs: 1,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(AllSetAllowExcludeCard, {
                setNum: 2,
                numAllow: allow2,
                numExclude: exclude2,
                setAllExclusion: setAllExclusion
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              xs: 1,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(AllSetAllowExcludeCard, {
                setNum: 4,
                numAllow: allow4,
                numExclude: exclude4,
                setAllExclusion: setAllExclusion
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              xs: 1,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                    gutterBottom: true,
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                        t: t,
                        i18nKey: "artSetConfig.alExRainbow",
                        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                          color: "success",
                          children: ["Allow ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m))]
                        }), " / ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                          color: "secondary",
                          variant: "light",
                          children: ["Exclude ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m))]
                        }), " Rainbow Builds"]
                      })
                    })
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                    sx: {
                      display: "flex",
                      flexDirection: "column",
                      gap: 1
                    },
                    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
                      fullWidth: true,
                      onClick: () => buildSettingDispatch({
                        artSetExclusion: (0,BuildSettingData/* handleArtSetExclusion */.s)(artSetExclusion, "rainbow", 2)
                      }),
                      color: allowRainbow2 ? "success" : "secondary",
                      startIcon: !allowRainbow2 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}),
                      endIcon: allowRainbow2 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], {}),
                      children: t(_t11 || (_t11 = _2`artSetConfig.2rainbow`))
                    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
                      fullWidth: true,
                      onClick: () => buildSettingDispatch({
                        artSetExclusion: (0,BuildSettingData/* handleArtSetExclusion */.s)(artSetExclusion, "rainbow", 4)
                      }),
                      color: allowRainbow4 ? "success" : "secondary",
                      startIcon: !allowRainbow4 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}),
                      endIcon: allowRainbow4 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], {}),
                      children: t(_t12 || (_t12 = _2`artSetConfig.4rainbow`))
                    })]
                  })]
                })
              })
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            container: true,
            spacing: 1,
            columns: {
              xs: 2,
              lg: 3
            },
            children: artKeys.map(setKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetCard, {
              setKey: setKey,
              fakeDataContextObj: fakeDataContextObj,
              slotCount: artSlotCount[setKey]
            }, setKey))
          })]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
          sx: {
            py: 1
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
            large: true,
            onClick: onClose
          })
        })]
      })
    })]
  });
}
function AllSetAllowExcludeCard({
  numAllow,
  numExclude,
  setNum,
  setAllExclusion
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["page_character_optimize", "sheet"]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
        gutterBottom: true,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: t(`sheet:${setNum}set`)
        }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
          color: "success",
          children: [numAllow, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", t("artSetConfig.allowed")]
        }), !!numExclude && " / ", !!numExclude && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
          color: "secondary",
          children: [numExclude, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", t("artSetConfig.excluded")]
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        sx: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
          fullWidth: true,
          disabled: !numExclude,
          onClick: () => setAllExclusion(setNum, false),
          color: "success",
          startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], {}),
          children: t(`artSetConfig.allowAll${setNum}set`)
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
          fullWidth: true,
          disabled: !numAllow,
          onClick: () => setAllExclusion(setNum, true),
          color: "secondary",
          startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], {}),
          children: t(`artSetConfig.excludeAll${setNum}set`)
        })]
      })]
    })
  });
}
function ArtifactSetCard({
  setKey,
  fakeDataContextObj,
  slotCount
}) {
  var _artSetExclusion$setK, _sheet$name;
  const {
    t
  } = (0,es/* useTranslation */.$G)("sheet");
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    buildSetting,
    buildSettingDispatch
  } = useBuildSetting(characterKey);
  const {
    artSetExclusion
  } = buildSetting;
  const setExclusionSet = (_artSetExclusion$setK = artSetExclusion == null ? void 0 : artSetExclusion[setKey]) != null ? _artSetExclusion$setK : [];
  const allow4 = !setExclusionSet.includes(4);
  const slots = getNumSlots(slotCount);
  const sheet = (0,Artifacts/* getArtSheet */.Sk)(setKey);
  /* Assumes that all conditionals are from 4-Set. needs to change if there are 2-Set conditionals */
  const set4CondNums = (0,react.useMemo)(() => {
    if (!allow4) return [];
    return Object.keys(sheet.setEffects).filter(setNumKey => {
      var _sheet$setEffects$set;
      return (_sheet$setEffects$set = sheet.setEffects[setNumKey]) == null ? void 0 : _sheet$setEffects$set.document.some(doc => "states" in doc);
    });
  }, [sheet.setEffects, allow4]);
  const exclude2 = setExclusionSet.includes(2);
  const exclude4 = setExclusionSet.includes(4);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
    item: true,
    xs: 1,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
      sx: {
        height: "100%",
        opacity: slots < 2 ? "50%" : undefined
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        className: `grad-${sheet.rarity[0]}star`,
        width: "100%",
        sx: {
          display: "flex"
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          component: "img",
          src: (0,ArtifactSheet/* artifactDefIcon */.jU)(setKey),
          sx: {
            height: 100,
            width: "auto",
            mx: -1
          }
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          sx: {
            flexGrow: 1,
            px: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
            variant: "h6",
            children: (_sheet$name = sheet.name) != null ? _sheet$name : ""
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
              variant: "subtitle1",
              children: [sheet.rarity.map((ns, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                component: "span",
                sx: {
                  display: "inline-flex",
                  alignItems: "center"
                },
                children: [ns, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarRounded["default"], {
                  fontSize: "inherit"
                }), " ", i < sheet.rarity.length - 1 ? "/ " : null]
              }, ns)), ' ', (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(InfoTooltip/* InfoTooltipInline */.L, {
                title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
                      color: "success",
                      children: t(_t13 || (_t13 = _2`2set`))
                    })
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Translate/* Translate */.v, {
                      ns: `artifact_${setKey}_gen`,
                      key18: "setEffects.2"
                    })
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                    paddingTop: 2,
                    sx: {
                      opacity: setExclusionSet.includes(4) ? 0.6 : 1
                    },
                    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
                        color: "success",
                        children: t(_t14 || (_t14 = _2`4set`))
                      })
                    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Translate/* Translate */.v, {
                        ns: `artifact_${setKey}_gen`,
                        key18: "setEffects.4"
                      })
                    })]
                  })]
                })
              })]
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
            sx: {
              display: "flex",
              gap: 1
            },
            children: Object.entries(slotCount).map(([slotKey, count]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              sx: {
                flexGrow: 1
              },
              variant: "subtitle2",
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  width: "100%"
                },
                color: count ? "primary" : "secondary",
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SlotIcon/* default */.Z, {
                  slotKey: slotKey,
                  iconProps: SVGIcons/* iconInlineProps */.m
                }), " ", count]
              })
            }, slotKey))
          })]
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.ButtonGroup, {
        sx: {
          ".MuiButton-root": {
            borderRadius: 0
          }
        },
        fullWidth: true,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
          startIcon: exclude2 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}),
          onClick: () => buildSettingDispatch({
            artSetExclusion: (0,BuildSettingData/* handleArtSetExclusion */.s)(artSetExclusion, setKey, 2)
          }),
          color: exclude2 ? 'secondary' : 'success',
          endIcon: exclude2 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], {}),
          children: t(_t15 || (_t15 = _2`2set`))
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
          startIcon: exclude4 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}),
          onClick: () => buildSettingDispatch({
            artSetExclusion: (0,BuildSettingData/* handleArtSetExclusion */.s)(artSetExclusion, setKey, 4)
          }),
          color: exclude4 ? 'secondary' : 'success',
          endIcon: exclude4 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], {}),
          children: t(_t16 || (_t16 = _2`4set`))
        })]
      }), !!set4CondNums.length && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
        value: fakeDataContextObj,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
          sx: {
            display: "flex",
            flexDirection: "column",
            gap: 2
          },
          children: set4CondNums.map(setNumKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SetEffectDisplay, {
            setKey: setKey,
            setNumKey: parseInt(setNumKey),
            hideHeader: true,
            conditionalsOnly: true
          }, setNumKey))
        })
      })]
    })
  }, setKey);
}
function getNumSlots(slotCount) {
  return Object.values(slotCount).reduce((tot, v) => tot + (v ? 1 : 0), 0);
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/AssumeFullLevelToggle.tsx




const levels = [0, 4, 8, 12, 16, 20];
function AssumeFullLevelToggle({
  mainStatAssumptionLevel = 0,
  setmainStatAssumptionLevel,
  disabled
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, {
    fullWidth: true,
    color: mainStatAssumptionLevel ? "success" : "primary",
    disabled: disabled,
    title: mainStatAssumptionLevel ? t("mainStat.assumptionLvl.lvl", {
      lvl: mainStatAssumptionLevel
    }) : t("mainStat.assumptionLvl.no"),
    children: levels.map(lvl => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.MenuItem, {
      onClick: () => setmainStatAssumptionLevel(lvl),
      children: lvl ? t("mainStat.assumptionLvl.lvl", {
        lvl
      }) : t("mainStat.assumptionLvl.no")
    }, lvl))
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/BonusStatsCard.tsx









function BonusStatsCard() {
  const {
    character: {
      bonusStats
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const bonusStatsKeys = Object.keys(bonusStats);
  if (!bonusStatsKeys.length) return null;
  const nodes = bonusStatsKeys.map(k => data.get(Formula/* uiInput.customBonus */.ri.customBonus[k]));
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
        children: "Bonus Stats"
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: nodes.map(n => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* NodeFieldDisplay */.JW, {
        node: n
      }, JSON.stringify(n.info)))
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Util/TimeUtil.ts
var TimeUtil = __webpack_require__(453777);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/BuildAlert.tsx





const warningBuildNumber = 10000000;
const Monospace = (0,material_node.styled)("strong")({
  fontFamily: "monospace"
});
const BorderLinearProgress = (0,material_node.styled)(material_node.LinearProgress)(({
  theme
}) => ({
  height: 10,
  borderRadius: 5
}));
function BuildAlert({
  status: {
    type,
    tested,
    failed,
    skipped,
    total,
    startTime,
    finishTime
  },
  characterName
}) {
  const hasTotal = isFinite(total);
  const generatingBuilds = type !== "inactive";
  const unskipped = total - skipped;
  const testedString = (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Monospace, {
    children: tested.toLocaleString()
  });
  const unskippedString = (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Monospace, {
    children: unskipped.toLocaleString()
  });
  const skippedText = !!skipped && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
    children: ["(", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Monospace, {
        children: skipped.toLocaleString()
      })
    }), " skipped)"]
  });
  const durationString = (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Monospace, {
    children: (0,TimeUtil/* timeStringMs */.e6)(Math.round((finishTime != null ? finishTime : performance.now()) - (startTime != null ? startTime : NaN)))
  });
  const color = "success";
  let title = "";
  let subtitle = "";
  let progress = undefined;
  if (generatingBuilds) {
    progress = tested * 100 / unskipped;
    title = (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
      children: ["Generating and testing ", testedString, hasTotal ? (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
        children: ["/", unskippedString]
      }) : undefined, " build configurations against the criteria for ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
        children: characterName
      }), ". ", skippedText]
    });
    subtitle = (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
      children: ["Time elapsed: ", durationString]
    });
  } else if (tested + skipped) {
    progress = 100;
    title = (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
      children: ["Generated and tested ", testedString, " Build configurations against the criteria for ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("b", {
        children: characterName
      }), ". ", skippedText]
    });
    subtitle = (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
      children: ["Total duration: ", durationString]
    });
  } else {
    return null;
  }
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Alert, {
    severity: color,
    variant: "filled",
    sx: {
      "& .MuiAlert-message": {
        flexGrow: 1
      }
    },
    children: [title, subtitle, progress !== undefined && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
      container: true,
      spacing: 1,
      alignItems: "center",
      children: [hasTotal && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        item: true,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          children: `${progress.toFixed(1)}%`
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        item: true,
        flexGrow: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BorderLinearProgress, {
          variant: hasTotal ? "determinate" : "indeterminate",
          value: progress,
          color: "primary"
        })
      })]
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Assets/Assets.tsx + 19 modules
var Assets = __webpack_require__(378547);
// EXTERNAL MODULE: ./src/app/Data/Artifacts/Artifact.ts + 2 modules
var Artifact = __webpack_require__(254878);
// EXTERNAL MODULE: ./src/app/ReactHooks/useArtifact.tsx
var useArtifact = __webpack_require__(153163);
// EXTERNAL MODULE: ./src/app/Components/Character/LocationIcon.tsx
var LocationIcon = __webpack_require__(350301);
// EXTERNAL MODULE: ./src/app/Components/ConditionalWrapper.tsx
var ConditionalWrapper = __webpack_require__(157889);
// EXTERNAL MODULE: ./src/app/Components/StatDisplay.tsx
var StatDisplay = __webpack_require__(534612);
// EXTERNAL MODULE: ./src/app/Components/Artifact/ArtifactTooltip.tsx
var ArtifactTooltip = __webpack_require__(809985);
;// CONCATENATED MODULE: ./src/app/Components/Artifact/ArtifactCardNano.tsx





















function ArtifactCardNano({
  artifactId,
  slotKey: pSlotKey,
  mainStatAssumptionLevel = 0,
  showLocation = false,
  onClick,
  BGComponent = CardDark/* default */.Z
}) {
  var _Artifact$mainStatVal;
  const art = (0,useArtifact/* default */.Z)(artifactId);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const actionWrapperFunc = (0,react.useCallback)(children => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardActionArea, {
    onClick: onClick,
    sx: {
      height: "100%"
    },
    children: children
  }), [onClick]);
  const theme = (0,material_node.useTheme)();
  if (!art) return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BGComponent, {
    sx: {
      display: "flex",
      height: "100%",
      alignItems: "center",
      justifyContent: "center"
    },
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
      component: "img",
      src: Assets/* default.slot */.Z.slot[pSlotKey],
      sx: {
        width: "25%",
        height: "auto",
        opacity: 0.7
      }
    })
  });
  const {
    slotKey,
    rarity,
    level,
    mainStatKey,
    substats,
    location
  } = art;
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level);
  const mainStatUnit = KeyMap/* default.unit */.ZP.unit(mainStatKey);
  const element = consts/* allElementsWithPhy.find */.Kj.find(ele => art.mainStatKey.includes(ele));
  const color = element ? (0,material_node.alpha)(theme.palette[element].main, 0.6) : (0,material_node.alpha)(theme.palette.secondary.main, 0.6);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BGComponent, {
    sx: {
      height: "100%"
    },
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ConditionalWrapper/* default */.Z, {
      condition: !!onClick,
      wrapper: actionWrapperFunc,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        display: "flex",
        height: "100%",
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          className: `grad-${rarity}star`,
          sx: {
            position: "relative",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactTooltip/* default */.Z, {
            art: art,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
              component: "img",
              src: (0,src/* artifactAsset */.Hp)(art.setKey, slotKey),
              sx: {
                m: -1,
                maxHeight: "110%",
                maxWidth: "110%"
              }
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
            sx: {
              position: "absolute",
              width: "100%",
              height: "100%",
              p: 0.5,
              opacity: 0.85,
              display: "flex",
              justifyContent: "space-between",
              pointerEvents: "none"
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Chip, {
              size: "small",
              label: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                children: ` +${level}`
              }),
              color: Artifact/* default.levelVariant */.ZP.levelVariant(level)
            }), showLocation && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Chip, {
              size: "small",
              label: location ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(LocationIcon/* default */.Z, {
                characterKey: location && database.chars.LocationToCharacterKey(location)
              }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* BusinessCenter */.J4P, {}),
              color: "secondary",
              sx: {
                overflow: "visible",
                ".MuiChip-label": {
                  overflow: "visible"
                }
              }
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Chip, {
            size: "small",
            sx: {
              position: "absolute",
              bottom: 0,
              mb: 1,
              backgroundColor: color
            },
            label: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
              sx: {
                display: "flex",
                gap: 0.5,
                px: 1,
                zIndex: 1
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
                placement: "top",
                title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplay/* StatColoredWithUnit */._, {
                    statKey: mainStatKey
                  })
                }),
                disableInteractive: true,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* default */.C, {
                  statKey: mainStatKey
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
                color: mainStatLevel !== level ? "warning" : undefined,
                children: [(0,KeyMap/* cacheValueString */.qs)((_Artifact$mainStatVal = Artifact/* default.mainStatValue */.ZP.mainStatValue(mainStatKey, rarity, mainStatLevel)) != null ? _Artifact$mainStatVal : 0, KeyMap/* default.unit */.ZP.unit(mainStatKey)), mainStatUnit]
              })]
            })
          })]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          sx: {
            p: 1
          },
          children: substats.map((stat, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SubstatDisplay, {
            stat: stat
          }, i + stat.key))
        })]
      })
    })
  });
}
function SubstatDisplay({
  stat
}) {
  var _stat$rolls$length, _stat$rolls;
  if (!stat.value) return null;
  const numRolls = (_stat$rolls$length = (_stat$rolls = stat.rolls) == null ? void 0 : _stat$rolls.length) != null ? _stat$rolls$length : 0;
  const rollColor = `roll${(0,Util/* clamp */.uZ)(numRolls, 1, 6)}`;
  const unit = KeyMap/* default.unit */.ZP.unit(stat.key);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
    display: "flex",
    gap: 1,
    alignContent: "center",
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
      sx: {
        flexGrow: 1,
        display: "flex",
        gap: 0.5
      },
      color: numRolls ? `${rollColor}.main` : "error.main",
      component: "span",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
        placement: "top",
        title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          children: stat.key && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplay/* StatColoredWithUnit */._, {
            statKey: stat.key
          })
        }),
        disableInteractive: true,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
          children: StatIcon/* default */.C[stat.key]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
        children: `${(0,KeyMap/* cacheValueString */.qs)(stat.value, KeyMap/* default.unit */.ZP.unit(stat.key))}${unit}`
      })]
    })
  });
}
// EXTERNAL MODULE: ../../node_modules/@mui/lab/node/index.js
var node = __webpack_require__(146397);
;// CONCATENATED MODULE: ./src/app/Components/Character/StatDisplayComponent.tsx
















function StatDisplayComponent() {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const sections = (0,react.useMemo)(() => (0,DisplayUtil/* getDisplaySections */.U)(data).filter(([, ns]) => Object.values(ns).some(n => !n.isEmpty)), [data]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
    sx: {
      mr: -1,
      mb: -1
    },
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Masonry, {
      columns: {
        xs: 1,
        sm: 2,
        md: 3,
        xl: 4
      },
      spacing: 1,
      children: sections.map(([key, Nodes]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Section, {
        displayNs: Nodes,
        sectionKey: key
      }, key))
    })
  });
}
function Section({
  displayNs,
  sectionKey
}) {
  const optimizationTarget = (0,react.useContext)(OptimizationTargetContext);
  const {
    data,
    oldData
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const header = (0,react.useMemo)(() => (0,DisplayUtil/* getDisplayHeader */.f)(data, sectionKey, database), [database, data, sectionKey]);
  const displayNsReads = (0,react.useMemo)(() => (0,Util/* objectMap */.xh)(displayNs, (n, nodeKey) => (0,utils/* customRead */.UF)(["display", sectionKey, nodeKey])), [displayNs, sectionKey]);
  if (!header) return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {});
  const {
    title,
    icon,
    action
  } = header;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardHeaderCustom/* default */.Z, {
      avatar: icon && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgIcon/* default */.Z, {
        size: 2,
        sx: {
          m: -1
        },
        src: icon
      }),
      title: title,
      action: action && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        children: action
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* FieldDisplayList */.lD, {
      sx: {
        m: 0
      },
      children: Object.entries(displayNs).map(([nodeKey, n]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* NodeFieldDisplay */.JW, {
        node: n,
        oldValue: oldData ? oldData.get(displayNsReads[nodeKey]).value : undefined,
        component: material_node.ListItem,
        emphasize: JSON.stringify(optimizationTarget) === JSON.stringify([sectionKey, nodeKey])
      }, nodeKey))
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Data/Weapons/index.ts + 309 modules
var Weapons = __webpack_require__(951077);
// EXTERNAL MODULE: ./src/app/Data/Weapons/WeaponSheet.tsx
var WeaponSheet = __webpack_require__(871026);
// EXTERNAL MODULE: ./src/app/ReactHooks/useWeapon.tsx
var useWeapon = __webpack_require__(694758);
// EXTERNAL MODULE: ./src/app/Components/Weapon/WeaponNameTooltip.tsx
var WeaponNameTooltip = __webpack_require__(402031);
;// CONCATENATED MODULE: ./src/app/Components/Weapon/WeaponCardNano.tsx


















function WeaponCardNano({
  weaponId,
  showLocation = false,
  onClick,
  BGComponent = CardDark/* default */.Z
}) {
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const weapon = (0,useWeapon/* default */.Z)(weaponId);
  const weaponSheet = (weapon == null ? void 0 : weapon.key) && (0,Weapons/* getWeaponSheet */.ub)(weapon.key);
  const actionWrapperFunc = (0,react.useCallback)(children => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardActionArea, {
    sx: {
      height: "100%"
    },
    onClick: onClick,
    children: children
  }), [onClick]);
  const UIData = (0,react.useMemo)(() => weaponSheet && weapon && (0,api/* computeUIData */.mP)([weaponSheet.data, (0,api/* dataObjForWeapon */.v0)(weapon)]), [weaponSheet, weapon]);
  if (!weapon || !weaponSheet || !UIData) return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BGComponent, {
    sx: {
      height: "100%"
    },
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
      variant: "rectangular",
      sx: {
        width: "100%",
        height: "100%"
      }
    })
  });
  const {
    refinement,
    location
  } = weapon;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BGComponent, {
    sx: {
      height: "100%"
    },
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ConditionalWrapper/* default */.Z, {
      condition: !!onClick,
      wrapper: actionWrapperFunc,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        display: "flex",
        height: "100%",
        alignItems: "stretch",
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          className: `grad-${weaponSheet.rarity}star`,
          sx: {
            height: "100%",
            position: "relative",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponNameTooltip/* default */.Z, {
            sheet: weaponSheet,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
              component: "img",
              src: (0,src/* weaponAsset */.Aq)(weapon.key, weapon.ascension >= 2),
              sx: {
                mx: -1,
                maxHeight: "100%",
                maxWidth: "100%"
              }
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
            sx: {
              position: "absolute",
              width: "100%",
              height: "100%",
              p: 0.5,
              opacity: 0.85,
              display: "flex",
              justifyContent: "space-between",
              pointerEvents: "none"
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Chip, {
              size: "small",
              label: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                children: WeaponSheet/* default.getLevelString */.Z.getLevelString(weapon)
              }),
              color: "primary"
            }), showLocation && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Chip, {
              size: "small",
              label: location ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(LocationIcon/* default */.Z, {
                characterKey: database.chars.LocationToCharacterKey(location)
              }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* BusinessCenter */.J4P, {}),
              color: "secondary",
              sx: {
                overflow: "visible",
                ".MuiChip-label": {
                  overflow: "visible"
                }
              }
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
            sx: {
              position: "absolute",
              width: "100%",
              height: "100%",
              p: 0.5,
              opacity: 0.85,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end"
            },
            children: weaponSheet.hasRefinement && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Chip, {
              size: "small",
              color: "info",
              label: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
                children: ["R", refinement]
              })
            })
          })]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          display: "flex",
          flexDirection: "column",
          sx: {
            p: 1
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponStat, {
            node: UIData.get(Formula/* input.weapon.main */.qH.weapon.main)
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponStat, {
            node: UIData.get(Formula/* input.weapon.sub */.qH.weapon.sub)
          })]
        })]
      })
    })
  });
}
function WeaponStat({
  node
}) {
  if (!node.info.name) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
    display: "flex",
    gap: 1,
    alignContent: "center",
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
      sx: {
        flexGrow: 1,
        display: "flex",
        gap: 1
      },
      component: "span",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
        placement: "top",
        title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          children: node.info.name
        }),
        disableInteractive: true,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
          children: node.info.icon
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
        children: (0,uiData/* nodeVStr */.p)(node)
      })]
    })
  });
}
// EXTERNAL MODULE: ./src/app/PageArtifact/ArtifactCard.tsx
var ArtifactCard = __webpack_require__(485563);
// EXTERNAL MODULE: ./src/app/Components/Artifact/ArtifactSetTooltip.tsx
var ArtifactSetTooltip = __webpack_require__(185213);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/ArtifactSetBadges.tsx










function ArtifactSetBadges({
  artifacts,
  currentlyEquipped = false
}) {
  const setToSlots = (0,react.useMemo)(() => artifacts.filter(arti => arti).reduce((acc, curr) => {
    acc[curr.setKey] ? acc[curr.setKey].push(curr.slotKey) : acc[curr.setKey] = [curr.slotKey];
    return acc;
  }, {}), [artifacts]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: Object.entries(setToSlots).sort(([_k1, slotarr1], [_k2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetBadge, {
      setKey: key,
      currentlyEquipped: currentlyEquipped,
      slotarr: slotarr
    }, key))
  });
}
function ArtifactSetBadge({
  setKey,
  currentlyEquipped = false,
  slotarr
}) {
  var _artifactSheet$name;
  const artifactSheet = (0,Artifacts/* getArtSheet */.Sk)(setKey);
  const numInSet = slotarr.length;
  const setActive = Object.keys(artifactSheet.setEffects).map(setKey => parseInt(setKey)).filter(setNum => setNum <= numInSet);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetTooltip/* default */.Z, {
      artifactSheet: artifactSheet,
      numInSet: numInSet,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        sx: {
          height: "100%"
        },
        color: currentlyEquipped ? "success" : "primary",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
          children: [slotarr.map(slotKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SlotIcon/* default */.Z, {
            slotKey: slotKey,
            iconProps: SVGIcons/* iconInlineProps */.m
          })), " ", (_artifactSheet$name = artifactSheet.name) != null ? _artifactSheet$name : "", setActive.map(n => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
            sx: {
              ml: 0.5
            },
            color: "success",
            children: n
          }, n))]
        })
      })
    })
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/BuildDisplayItem.tsx




















//for displaying each artifact build
function BuildDisplayItem({
  label,
  compareBuild,
  extraButtonsRight,
  extraButtonsLeft,
  disabled
}) {
  const {
    character: {
      key: characterKey,
      equippedArtifacts
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    buildSetting: {
      mainStatAssumptionLevel
    }
  } = useBuildSetting(characterKey);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const dataContext = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    data,
    oldData
  } = dataContext;
  const [newOld, setNewOld] = (0,react.useState)(undefined);
  const close = (0,react.useCallback)(() => setNewOld(undefined), [setNewOld]);
  const equipBuild = (0,react.useCallback)(() => {
    if (!window.confirm("Do you want to equip this build to this character?")) return;
    const char = database.chars.get(characterKey);
    if (!char) return;
    consts/* allSlotKeys.forEach */.eV.forEach(s => {
      const aid = data.get(Formula/* uiInput.art */.ri.art[s].id).value;
      if (aid) database.arts.set(aid, {
        location: (0,consts/* charKeyToLocCharKey */.V7)(characterKey)
      });else {
        const oldAid = char.equippedArtifacts[s];
        if (oldAid && database.arts.get(oldAid)) database.arts.set(oldAid, {
          location: ""
        });
      }
    });
    const weapon = data.get(Formula/* uiInput.weapon.id */.ri.weapon.id).value;
    if (weapon) database.weapons.set(weapon, {
      location: (0,consts/* charKeyToLocCharKey */.V7)(characterKey)
    });
  }, [characterKey, data, database]);
  const statProviderContext = (0,react.useMemo)(() => {
    const dataContext_ = Object.assign({}, dataContext);
    if (!compareBuild) dataContext_.oldData = undefined;
    return dataContext_;
  }, [dataContext, compareBuild]);
  const artifactIdsBySlot = (0,react.useMemo)(() => Object.fromEntries(consts/* allSlotKeys.map */.eV.map(slotKey => [slotKey, data.get(Formula/* uiInput.art */.ri.art[slotKey].id).value])), [data]);
  const artifacts = (0,react.useMemo)(() => artifactIdsBySlot && Object.values(artifactIdsBySlot).map(artiId => database.arts.get(artiId)).filter(arti => arti), [artifactIdsBySlot, database.arts]);

  // Memoize Arts because of its dynamic onClick
  const artNanos = (0,react.useMemo)(() => consts/* allSlotKeys.map */.eV.map(slotKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
    item: true,
    xs: 1,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCardNano, {
      showLocation: true,
      slotKey: slotKey,
      artifactId: artifactIdsBySlot[slotKey],
      mainStatAssumptionLevel: mainStatAssumptionLevel,
      onClick: () => {
        const oldId = equippedArtifacts[slotKey];
        const newId = artifactIdsBySlot[slotKey];
        setNewOld({
          oldId: oldId !== newId ? oldId : undefined,
          newId
        });
      }
    })
  }, slotKey)), [setNewOld, equippedArtifacts, mainStatAssumptionLevel, artifactIdsBySlot]);
  if (!oldData) return null;
  const currentlyEquipped = consts/* allSlotKeys.every */.eV.every(slotKey => artifactIdsBySlot[slotKey] === oldData.get(Formula/* uiInput.art */.ri.art[slotKey].id).value) && data.get(Formula/* uiInput.weapon.id */.ri.weapon.id).value === oldData.get(Formula/* uiInput.weapon.id */.ri.weapon.id).value;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(react.Suspense, {
      fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
        variant: "rectangular",
        width: "100%",
        height: 600
      }),
      children: [newOld && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CompareArtifactModal, {
        newOld: newOld,
        mainStatAssumptionLevel: mainStatAssumptionLevel,
        onClose: close
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          display: "flex",
          gap: 1,
          sx: {
            pb: 1
          },
          flexWrap: "wrap",
          children: [label !== undefined && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
            color: "info",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
                children: [label, currentlyEquipped ? " (Equipped)" : ""]
              })
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetBadges, {
            artifacts: artifacts,
            currentlyEquipped: currentlyEquipped
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
            sx: {
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-end"
            }
          }), extraButtonsLeft, (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            size: "small",
            color: "success",
            onClick: equipBuild,
            disabled: disabled || currentlyEquipped,
            startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Checkroom */.fkW, {}),
            children: "Equip Build"
          }), extraButtonsRight]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
          container: true,
          spacing: 1,
          sx: {
            pb: 1
          },
          columns: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 6
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            xs: 1,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponCardNano, {
              showLocation: true,
              weaponId: data.get(Formula/* uiInput.weapon.id */.ri.weapon.id).value
            })
          }), artNanos]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
          value: statProviderContext,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplayComponent, {})
        })]
      })]
    })
  });
}
function CompareArtifactModal({
  newOld: {
    newId,
    oldId
  },
  mainStatAssumptionLevel,
  onClose
}) {
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const onEquip = (0,react.useCallback)(() => {
    if (!window.confirm("Do you want to equip this artifact to this character?")) return;
    database.arts.set(newId, {
      location: (0,consts/* charKeyToLocCharKey */.V7)(characterKey)
    });
    onClose();
  }, [newId, database, characterKey, onClose]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
    open: !!newId,
    onClose: onClose,
    containerProps: {
      maxWidth: oldId ? "md" : "xs"
    },
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
        sx: {
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          gap: 2,
          height: "100%"
        },
        children: [oldId && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          minWidth: 320,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCard/* default */.Z, {
            artifactId: oldId,
            mainStatAssumptionLevel: mainStatAssumptionLevel,
            canExclude: true,
            canEquip: true,
            editorProps: {
              disableSet: true,
              disableSlot: true
            }
          })
        }), oldId && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          display: "flex",
          flexGrow: 1
        }), oldId && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            onClick: onEquip,
            sx: {
              display: "flex"
            },
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* ChevronRight */._Qn, {
              sx: {
                fontSize: 40
              }
            })
          })
        }), oldId && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          display: "flex",
          flexGrow: 1
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          minWidth: 320,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCard/* default */.Z, {
            artifactId: newId,
            mainStatAssumptionLevel: mainStatAssumptionLevel,
            canExclude: true,
            canEquip: true,
            editorProps: {
              disableSet: true,
              disableSlot: true
            }
          })
        })]
      })
    })
  });
}
// EXTERNAL MODULE: ../../node_modules/recharts/lib/index.js
var lib = __webpack_require__(954418);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/useBuildResult.ts


function useBuildResult(characterKey) {
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [buildResult, setBuildResult] = (0,react.useState)(() => database.buildResult.get(characterKey));
  (0,react.useEffect)(() => setBuildResult(database.buildResult.get(characterKey)), [database, characterKey]);
  (0,react.useEffect)(() => database.buildResult.follow(characterKey, (k, r, v) => r === "update" && setBuildResult(v)), [characterKey, setBuildResult, database]);
  const buildResultDispatch = (0,react.useCallback)(action => characterKey && database.buildResult.set(characterKey, action), [characterKey, database]);
  return {
    buildResult,
    buildResultDispatch
  };
}
// EXTERNAL MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/OptimizationTargetSelector.tsx
var OptimizationTargetSelector = __webpack_require__(485090);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/ChartCard/CustomDot.tsx



function CustomDot({
  cx,
  cy,
  payload,
  selectedPoint,
  radiusSelected = 6,
  radiusUnselected = 3,
  colorSelected = "red",
  colorUnselected,
  shape = "circle"
}) {
  if (!cx || !cy || !payload) {
    return null;
  }
  const isSelected = selectedPoint && selectedPoint.x === payload.x && selectedPoint.y === payload.y;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("g", {
    className: "custom-dot",
    "data-chart-x": cx,
    "data-chart-y": cy,
    "data-x-value": payload.x,
    "data-y-value": payload.y,
    "data-radius": isSelected ? radiusUnselected : radiusSelected,
    children: !isSelected ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomShape, {
      id: "customShapeUnselected",
      shape: shape,
      cx: cx,
      cy: cy,
      r: radiusUnselected,
      fill: colorUnselected
    }) : (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomShape, {
        id: "customShapeSelected",
        shape: shape,
        cx: cx,
        cy: cy,
        r: radiusSelected / 2,
        fill: colorSelected
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomShape, {
        id: "customShapeBorder",
        shape: shape,
        cx: cx,
        cy: cy,
        r: radiusSelected,
        fill: "none",
        stroke: colorSelected
      })]
    })
  });
}
function CustomShape({
  shape,
  id,
  cx,
  cy,
  r,
  fill,
  stroke
}) {
  switch (shape) {
    case "circle":
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("circle", {
        id: id,
        cx: cx,
        cy: cy,
        r: r,
        fill: fill,
        stroke: stroke
      });
    case "square":
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("rect", {
        id: id,
        x: cx - r,
        y: cy - r,
        width: r * 2,
        height: r * 2,
        fill: fill,
        stroke: stroke
      });
    case "diamond":
      return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("polygon", {
        id: id,
        points: `${cx},${cy + r * 2.5} ${cx + r * 1.5},${cy} ${cx},${cy - r * 2.5} ${cx - r * 1.5},${cy}`,
        fill: fill,
        stroke: stroke
      });
  }
}
// EXTERNAL MODULE: ./src/app/Components/Artifact/ArtifactCardPico.tsx
var ArtifactCardPico = __webpack_require__(969777);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/ChartCard/CustomTooltip.tsx

const CustomTooltip_excluded = ["xLabel", "xUnit", "yLabel", "yUnit", "selectedPoint", "setSelectedPoint", "addBuildToList"];
















function CustomTooltip(_ref) {
  let {
      xLabel,
      xUnit,
      yLabel,
      yUnit,
      selectedPoint,
      setSelectedPoint,
      addBuildToList
    } = _ref,
    tooltipProps = (0,objectWithoutPropertiesLoose/* default */.Z)(_ref, CustomTooltip_excluded);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const artifactsBySlot = (0,react.useMemo)(() => selectedPoint && selectedPoint.artifactIds && Object.fromEntries(selectedPoint.artifactIds.map(id => {
    const artiObj = database.arts.get(id);
    return [artiObj == null ? void 0 : artiObj.slotKey, artiObj];
  }).filter(arti => arti)), [database.arts, selectedPoint]);
  const clickAwayHandler = (0,react.useCallback)(e => {
    if (!(e.target.id.includes("customShape") || e.target.id.includes("chartContainer"))) {
      setSelectedPoint(undefined);
    }
  }, [setSelectedPoint]);
  const currentlyEquipped = artifactsBySlot && consts/* allSlotKeys.every */.eV.every(slotKey => {
    var _artifactsBySlot$slot;
    return ((_artifactsBySlot$slot = artifactsBySlot[slotKey]) == null ? void 0 : _artifactsBySlot$slot.id) === data.get(Formula/* input.art */.qH.art[slotKey].id).value;
  });
  const highlightLabel = (0,react.useMemo)(() => (selectedPoint == null ? void 0 : selectedPoint.buildNumber) && (selectedPoint.highlightedType === "graph" ? (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
    t: t,
    i18nKey: "graphBuildLabel",
    count: selectedPoint == null ? void 0 : selectedPoint.buildNumber,
    children: ["Graph #", {
      count: (selectedPoint == null ? void 0 : selectedPoint.buildNumber) + 1
    }]
  }) : `#${selectedPoint == null ? void 0 : selectedPoint.buildNumber}`), [selectedPoint, t]);
  if (tooltipProps.active && selectedPoint) {
    return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.ClickAwayListener, {
      onClickAway: clickAwayHandler,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
        sx: {
          minWidth: "400px",
          maxWidth: "400px"
        },
        onClick: e => e.stopPropagation(),
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
            gap: 1,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
              direction: "row",
              alignItems: "start",
              gap: 1,
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
                spacing: 0.5,
                flexGrow: 99,
                children: [currentlyEquipped && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
                  color: "info",
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: t("currentlyEquippedBuild")
                  })
                }), !currentlyEquipped && selectedPoint.highlighted && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
                  color: "info",
                  children: highlightLabel
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
                  fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
                    width: 300,
                    height: 50
                  }),
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetBadges, {
                    artifacts: Object.values(artifactsBySlot),
                    currentlyEquipped: currentlyEquipped
                  })
                })]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
                item: true,
                flexGrow: 1
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
                onClick: () => setSelectedPoint(undefined)
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              container: true,
              direction: "row",
              spacing: 0.75,
              columns: 5,
              children: consts/* allSlotKeys.map */.eV.map(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
                item: true,
                xs: 1,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
                  fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
                    width: 75,
                    height: 75
                  }),
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCardPico/* default */.Z, {
                    artifactObj: artifactsBySlot[key],
                    slotKey: key
                  })
                })
              }, key))
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                children: xLabel
              }), ": ", (0,KeyMap/* valueString */.EC)(xUnit === "%" ? selectedPoint.x / 100 : selectedPoint.x, xUnit)]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                children: yLabel
              }), ": ", (0,KeyMap/* valueString */.EC)(yUnit === "%" ? selectedPoint.y / 100 : selectedPoint.y, yUnit)]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
              title: selectedPoint.highlighted ? t("tcGraph.buildAlreadyInList") : "",
              placement: "top",
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
                  sx: {
                    width: "100%"
                  },
                  disabled: !!selectedPoint.highlighted,
                  color: "info",
                  onClick: () => addBuildToList(selectedPoint.artifactIds),
                  children: t("addBuildToList")
                })
              })
            })]
          })
        })
      })
    });
  }
  return null;
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/ChartCard/EnhancedPoint.ts
class EnhancedPoint {
  constructor(x, y, artifactIds) {
    this.x = void 0;
    this.trueY = void 0;
    this.artifactIds = void 0;
    this.min = void 0;
    this.current = void 0;
    this.highlighted = void 0;
    this.buildNumber = void 0;
    this.highlightedType = void 0;
    this.x = x;
    this.trueY = y;
    this.artifactIds = artifactIds;
  }
  get y() {
    return this.trueY || this.current || this.highlighted;
  }
  set y(y) {
    this.trueY = y;
  }
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/ChartCard/index.tsx
let ChartCard_2 = t => t,
  ChartCard_t,
  ChartCard_t2,
  ChartCard_t3,
  ChartCard_t4,
  ChartCard_t5,
  ChartCard_t6,
  ChartCard_t7;























function ChartCard({
  plotBase,
  setPlotBase,
  disabled = false,
  showTooltip = false
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["page_character_optimize", "ui"]);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    chartData
  } = (0,react.useContext)(GraphContext);
  const [showDownload, setshowDownload] = (0,react.useState)(false);
  const [showMin, setshowMin] = (0,react.useState)(true);
  const {
    graphBuilds
  } = (0,react.useContext)(GraphContext);
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    buildResult: {
      builds: generatedBuilds
    }
  } = useBuildResult(characterKey);
  const [sliderLow, setSliderLow] = (0,react.useState)(-Infinity);
  const [sliderHigh, setSliderHigh] = (0,react.useState)(Infinity);
  const setSlider = (0,react.useCallback)((_e, value) => {
    if (typeof value === "number") throw new TypeError();
    const [l, h] = value;
    setSliderLow(l);
    setSliderHigh(h);
  }, [setSliderLow, setSliderHigh]);
  (0,react.useEffect)(() => {
    setSliderLow(-Infinity);
    setSliderHigh(Infinity);
  }, [chartData]);
  const {
    displayData,
    downloadData,
    sliderMin,
    sliderMax
  } = (0,react.useMemo)(() => {
    var _minimumData$, _points$;
    if (!chartData) return {
      displayData: null,
      downloadData: null
    };
    let sliderMin = Infinity;
    let sliderMax = -Infinity;
    const currentBuild = consts/* allSlotKeys.map */.eV.map(slotKey => {
      var _data$get$value;
      return (_data$get$value = data == null ? void 0 : data.get(Formula/* input.art */.qH.art[slotKey].id).value) != null ? _data$get$value : "";
    });
    // Shape the data so we know the current and highlighted builds
    const points = chartData.data.map(({
      value: y,
      plot: x,
      artifactIds
    }) => {
      if (x === undefined) return null;
      if (x < sliderMin) sliderMin = x;
      if (x > sliderMax) sliderMax = x;
      const enhancedDatum = new EnhancedPoint(x, y, artifactIds);
      const datumBuildMap = (0,Util/* objectKeyMap */.O)(artifactIds, _ => true);
      const isCurrentBuild = currentBuild.every(aId => datumBuildMap[aId]);
      if (isCurrentBuild) {
        enhancedDatum.current = y;
        // Remove the Y-value so there are not 2 dots displayed for these builds
        enhancedDatum.y = undefined;
        return enhancedDatum;
      }
      const generBuildIndex = generatedBuilds.findIndex(build => build.every(aId => datumBuildMap[aId]));
      if (generBuildIndex !== -1) {
        enhancedDatum.highlighted = y;
        enhancedDatum.buildNumber = generBuildIndex + 1;
        enhancedDatum.highlightedType = "generated";
        // Remove the Y-value so there are not 2 dots displayed for these builds
        enhancedDatum.y = undefined;
        return enhancedDatum;
      }
      const graphBuildIndex = graphBuilds == null ? void 0 : graphBuilds.findIndex(build => build.every(aId => datumBuildMap[aId]));
      if (graphBuildIndex !== undefined && graphBuildIndex !== -1) {
        enhancedDatum.highlighted = y;
        enhancedDatum.buildNumber = graphBuildIndex + 1;
        enhancedDatum.highlightedType = "graph";
        // Remove the Y-value so there are not 2 dots displayed for these builds
        enhancedDatum.y = undefined;
      }
      return enhancedDatum;
    }).sort((a, b) => a.x - b.x);
    const minimumData = [];
    for (const point of points) {
      let last;
      while (last = minimumData.pop()) {
        if (last.y > point.y) {
          minimumData.push(last);
          break;
        }
      }
      minimumData.push(point);
    }

    // Note:
    // We can also just use `minimumData` if the plotter supports multiple data sources.
    // It could be faster too since there're no empty entries in `minimumData`.
    // From my limited testing, using multiple data sources makes the graph behave strangely though.
    if (((_minimumData$ = minimumData[0]) == null ? void 0 : _minimumData$.x) !== ((_points$ = points[0]) == null ? void 0 : _points$.x)) points[0].min = minimumData[0].y;
    minimumData.forEach(pt => {
      pt.min = pt.y;
    });
    const downloadData = {
      minimum: minimumData.map(point => [point.x, point.y]),
      allData: points.map(point => [point.x, point.y])
    };
    return {
      displayData: points.filter(pt => pt && pt.x >= sliderLow && pt.x <= sliderHigh),
      downloadData,
      sliderMin,
      sliderMax
    };
  }, [chartData, generatedBuilds, data, graphBuilds, sliderLow, sliderHigh]);
  const plotBaseNode = plotBase && (0,Util/* objPathValue */.Hm)(data == null ? void 0 : data.getDisplay(), plotBase);
  const invalidTarget = plotBase && (!plotBaseNode || plotBaseNode.isEmpty);
  const buttonText = invalidTarget ? t("page_character_optimize:targetSelector.invalidTarget") : t("page_character_optimize:targetSelector.selectGraphTarget");
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        container: true,
        spacing: 1,
        alignItems: "center",
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
            children: t(ChartCard_t || (ChartCard_t = ChartCard_2`tcGraph.vs`))
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
            placement: "top",
            title: showTooltip ? t("page_character_optimize:selectTargetFirst") : "",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(OptimizationTargetSelector/* default */.Z, {
                optimizationTarget: plotBase,
                setTarget: target => setPlotBase(target),
                defaultText: buttonText,
                disabled: disabled
              })
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
            title: !plotBase ? "" : t("ui:reset"),
            placement: "top",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
                color: "error",
                onClick: () => setPlotBase(undefined),
                disabled: !plotBase,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Replay */.UHt, {})
              })
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          flexGrow: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(InfoTooltip/* default */.Z, {
            placement: "top",
            title: t("page_character_optimize:tcGraph.desc")
          })
        }), !!downloadData && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            size: "small",
            startIcon: showMin ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}),
            color: showMin ? "success" : "secondary",
            onClick: () => setshowMin(!showMin),
            children: t(ChartCard_t2 || (ChartCard_t2 = ChartCard_2`tcGraph.showStatThr`))
          })
        }), !!downloadData && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            size: "small",
            color: "info",
            startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Download */.UWx, {}),
            onClick: () => setshowDownload(!showDownload),
            children: t(ChartCard_t3 || (ChartCard_t3 = ChartCard_2`tcGraph.downloadData`))
          })
        })]
      })
    }), displayData && displayData.length && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), chartData && displayData && displayData.length && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Collapse, {
        in: !!downloadData && showDownload,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
          sx: {
            mb: 2
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              children: "Min Data"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataDisplay, {
              data: downloadData == null ? void 0 : downloadData.minimum
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              children: "All Data"
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataDisplay, {
              data: downloadData == null ? void 0 : downloadData.allData
            })]
          })
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Chart, {
        displayData: displayData,
        plotNode: chartData.plotNode,
        valueNode: chartData.valueNode,
        showMin: showMin
      }), displayData.length > 1 && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Slider, {
        marks: true,
        value: [sliderLow, sliderHigh],
        onChange: setSlider,
        onChangeCommitted: setSlider,
        min: sliderMin,
        max: sliderMax,
        step: (sliderMax - sliderMin) / 20,
        valueLabelDisplay: "auto",
        valueLabelFormat: n => {
          var _chartData$plotNode$i, _chartData$plotNode$i2;
          return (0,KeyMap/* valueString */.EC)(((_chartData$plotNode$i = chartData.plotNode.info) == null ? void 0 : _chartData$plotNode$i.unit) === "%" ? n / 100 : n, (_chartData$plotNode$i2 = chartData.plotNode.info) == null ? void 0 : _chartData$plotNode$i2.unit);
        },
        sx: {
          ml: "6%",
          width: "93%"
        }
      })]
    })]
  });
}
const TextArea = (0,material_node.styled)("textarea")({
  width: "100%",
  fontFamily: "monospace",
  resize: "vertical",
  minHeight: "5em"
});
function DataDisplay({
  data
}) {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TextArea, {
    readOnly: true,
    value: JSON.stringify(data),
    onClick: e => {
      const target = e.target;
      target.selectionStart = 0;
      target.selectionEnd = target.value.length;
    }
  });
}
const optTargetColor = "#8884d8";
const highlightedColor = "cyan";
const currentColor = "#46a046";
const lineColor = "#ff7300";
function Chart({
  displayData,
  plotNode,
  valueNode,
  showMin
}) {
  var _plotNode$info, _valueNode$info, _plotNode$info2, _valueNode$info2;
  const {
    graphBuilds,
    setGraphBuilds
  } = (0,react.useContext)(GraphContext);
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const [selectedPoint, setSelectedPoint] = (0,react.useState)();
  const addBuildToList = (0,react.useCallback)(build => {
    setGraphBuilds([...(graphBuilds != null ? graphBuilds : []), build]);
    setSelectedPoint(undefined);
  }, [setGraphBuilds, graphBuilds]);
  const chartOnClick = (0,react.useCallback)(props => {
    if (props && props.chartX && props.chartY) setSelectedPoint(getNearestPoint(props.chartX, props.chartY, 20, displayData));
  }, [setSelectedPoint, displayData]);

  // Below works because character translation should already be loaded
  const xLabelValue = getLabelFromNode(plotNode, t);
  const yLabelValue = getLabelFromNode(valueNode, t);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* ResponsiveContainer */.h2, {
    width: "100%",
    height: 600,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(lib/* ComposedChart */.cI, {
      id: "chartContainer",
      data: displayData,
      onClick: chartOnClick,
      style: {
        cursor: "pointer"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* CartesianGrid */.q3, {
        strokeDasharray: "3 3"
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* XAxis */.Kc, {
        dataKey: "x",
        scale: "linear",
        unit: (_plotNode$info = plotNode.info) == null ? void 0 : _plotNode$info.unit,
        domain: ["auto", "auto"],
        tick: {
          fill: 'white'
        },
        type: "number",
        tickFormatter: n => n > 10000 ? n.toFixed() : n.toFixed(1),
        label: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* Label */.__, {
          fill: "white",
          dy: 10,
          children: xLabelValue
        }),
        height: 50
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* YAxis */.B2, {
        name: "DMG",
        domain: ["auto", "auto"],
        unit: (_valueNode$info = valueNode.info) == null ? void 0 : _valueNode$info.unit,
        allowDecimals: false,
        tick: {
          fill: 'white'
        },
        type: "number",
        label: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* Label */.__, {
          fill: "white",
          angle: -90,
          dx: -40,
          children: yLabelValue
        }),
        width: 100
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* Tooltip */.u, {
        content: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomTooltip, {
          xLabel: xLabelValue,
          xUnit: (_plotNode$info2 = plotNode.info) == null ? void 0 : _plotNode$info2.unit,
          yLabel: yLabelValue,
          yUnit: (_valueNode$info2 = valueNode.info) == null ? void 0 : _valueNode$info2.unit,
          selectedPoint: selectedPoint,
          setSelectedPoint: setSelectedPoint,
          addBuildToList: addBuildToList
        }),
        trigger: "click",
        wrapperStyle: {
          pointerEvents: "auto",
          cursor: "auto"
        },
        cursor: false
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* Legend */.De, {
        payload: [...(showMin ? [{
          id: "min",
          value: t(ChartCard_t4 || (ChartCard_t4 = ChartCard_2`tcGraph.statReqThr`)),
          type: "line",
          color: lineColor
        }] : []), {
          id: "trueY",
          value: t(ChartCard_t5 || (ChartCard_t5 = ChartCard_2`tcGraph.generatedBuilds`)),
          type: "circle",
          color: optTargetColor
        }, {
          id: "highlighted",
          value: t(ChartCard_t6 || (ChartCard_t6 = ChartCard_2`tcGraph.highlightedBuilds`)),
          type: "square",
          color: highlightedColor
        }, {
          id: "current",
          value: t(ChartCard_t7 || (ChartCard_t7 = ChartCard_2`tcGraph.currentBuild`)),
          type: "diamond",
          color: currentColor
        }]
      }), showMin && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* Line */.x1, {
        dataKey: "min",
        stroke: lineColor,
        type: "stepBefore",
        connectNulls: true,
        strokeWidth: 2,
        isAnimationActive: false,
        dot: false,
        activeDot: false
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* Scatter */.bp, {
        dataKey: "trueY",
        isAnimationActive: false,
        shape: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomDot, {
          selectedPoint: selectedPoint,
          colorUnselected: optTargetColor
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* Scatter */.bp, {
        dataKey: "highlighted",
        isAnimationActive: false,
        shape: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomDot, {
          shape: "square",
          selectedPoint: selectedPoint,
          colorUnselected: highlightedColor
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(lib/* Scatter */.bp, {
        dataKey: "current",
        isAnimationActive: false,
        shape: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomDot, {
          shape: "diamond",
          selectedPoint: selectedPoint,
          colorUnselected: currentColor
        })
      })]
    })
  });
}
function getNearestPoint(clickedX, clickedY, threshold, data) {
  const nearestDomPtData = Array.from(document.querySelectorAll(".custom-dot")).reduce((domPtA, domPtB) => {
    const {
      chartX: aChartX,
      chartY: aChartY
    } = domPtA.dataset;
    const aDistance = Math.sqrt((clickedX - aChartX) ** 2 + (clickedY - aChartY) ** 2);
    const {
      chartX: bChartX,
      chartY: bChartY
    } = domPtB.dataset;
    const bDistance = Math.sqrt((clickedX - bChartX) ** 2 + (clickedY - bChartY) ** 2);
    return aDistance <= bDistance ? domPtA : domPtB;
  })["dataset"];

  // Don't select a point too far away
  const distance = Math.sqrt((clickedX - nearestDomPtData.chartX) ** 2 + (clickedY - nearestDomPtData.chartY) ** 2);
  return distance < threshold ? data.find(d => d.x === +nearestDomPtData.xValue && d.y === +nearestDomPtData.yValue) : undefined;
}
function getLabelFromNode(node, t) {
  var _node$info, _node$info2, _node$info2$name, _node$info3, _node$info3$name, _node$info4, _node$info5;
  return typeof ((_node$info = node.info) == null ? void 0 : _node$info.name) === "string" ? node.info.name : `${t(`${(_node$info2 = node.info) == null ? void 0 : (_node$info2$name = _node$info2.name) == null ? void 0 : _node$info2$name.props.ns}:${(_node$info3 = node.info) == null ? void 0 : (_node$info3$name = _node$info3.name) == null ? void 0 : _node$info3$name.props.key18}`)}${(_node$info4 = node.info) != null && _node$info4.textSuffix ? ` ${(_node$info5 = node.info) == null ? void 0 : _node$info5.textSuffix}` : ""}`;
}
// EXTERNAL MODULE: ./src/app/SVGIcons/ArtifactSlot/FlowerIcon.tsx
var FlowerIcon = __webpack_require__(311716);
// EXTERNAL MODULE: ./src/app/SVGIcons/ArtifactSlot/PlumeIcon.tsx
var PlumeIcon = __webpack_require__(792658);
// EXTERNAL MODULE: ./src/app/SVGIcons/Stats/AtkIcon.tsx
var AtkIcon = __webpack_require__(200056);
// EXTERNAL MODULE: ./src/app/SVGIcons/Stats/HpIcon.tsx
var HpIcon = __webpack_require__(735587);
// EXTERNAL MODULE: ./src/app/Util/MultiSelect.ts
var MultiSelect = __webpack_require__(810618);
// EXTERNAL MODULE: ./src/app/Util/totalUtils.ts
var totalUtils = __webpack_require__(840775);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/MainStatSelectionCard.tsx























const artifactsSlotsToSelectMainStats = ["sands", "goblet", "circlet"];
function MainStatSelectionCard({
  disabled = false,
  filteredArtIds
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("artifact");
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    buildSetting: {
      mainStatKeys
    },
    buildSettingDispatch
  } = useBuildSetting(characterKey);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const tots = (0,react.useMemo)(() => (0,Util/* objectKeyMap */.O)(consts_src/* allSlotKeys */.eV, slotKey => (0,totalUtils/* catTotal */.W)(Artifact/* default.slotMainStats */.ZP.slotMainStats(slotKey), ct => Object.entries(database.arts.data).forEach(([id, a]) => {
    const sk = a.slotKey;
    if (sk !== slotKey) return;
    const msk = a.mainStatKey;
    if (!msk || !ct[msk]) return;
    ct[msk].total++;
    if (filteredArtIds.includes(id)) ct[msk].current++;
  }))), [filteredArtIds, database]);
  const slotTots = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(artifactsSlotsToSelectMainStats, ct => Object.entries(database.arts.data).forEach(([id, a]) => {
    const sk = a.slotKey;
    if (!ct[sk]) return;
    ct[sk].total++;
    if (filteredArtIds.includes(id)) ct[sk].current++;
  })), [filteredArtIds, database]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
    display: "flex",
    flexDirection: "column",
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      display: "flex",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
        sx: {
          flexGrow: 1
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          sx: {
            display: "flex",
            gap: 1,
            alignItems: "center"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
            placement: "top",
            title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              children: t(`slotName.flower`)
            }),
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FlowerIcon/* default */.Z, {
              fontSize: "inherit"
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
            flexGrow: 1,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
              color: "info",
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HpIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", tots.flower.hp]
            })
          })]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {
        orientation: "vertical",
        flexItem: true
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
        sx: {
          flexGrow: 1
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          sx: {
            display: "flex",
            gap: 1,
            alignItems: "center"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
            placement: "top",
            title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              children: t(`slotName.plume`)
            }),
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PlumeIcon/* default */.Z, {
              fontSize: "inherit"
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
            flexGrow: 1,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
              color: "info",
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(AtkIcon/* default */.Z, Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", tots.plume.atk]
            })
          })]
        })
      })]
    }), artifactsSlotsToSelectMainStats.map(slotKey => {
      const selectedMainKeys = mainStatKeys[slotKey];
      const mainKeys = Artifact/* default.slotMainStats */.ZP.slotMainStats(slotKey);
      const mainKeysHandler = (0,MultiSelect/* handleMultiSelect */.X)([...mainKeys]);
      return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
          sx: {
            pt: 1,
            pb: 1
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
            sx: {
              display: "flex",
              gap: 1,
              alignItems: "center",
              pb: 1
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
              placement: "top",
              title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                children: t(`slotName.${slotKey}`)
              }),
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SlotIcon/* default */.Z, {
                slotKey: slotKey,
                iconProps: {
                  fontSize: 'inherit'
                }
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
              flexGrow: 1,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
                color: "info",
                children: slotTots[slotKey]
              })
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            container: true,
            spacing: 1,
            children: mainKeys.map((mainStatKey, i) => {
              const element = consts_src/* allElementsWithPhy.find */.Kj.find(ele => mainStatKey.includes(ele));
              const color = selectedMainKeys.includes(mainStatKey) ? element != null ? element : "success" : "secondary";
              return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
                item: true,
                flexGrow: 1,
                xs: i < 3 && slotKey !== "goblet" || slotKey === "goblet" ? 4 : undefined,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
                  placement: "top",
                  title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplay/* StatColoredWithUnit */._, {
                        statKey: mainStatKey
                      })
                    })
                  }),
                  disableInteractive: true,
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
                    fullWidth: true,
                    size: "small",
                    color: color,
                    sx: {
                      height: "100%",
                      pointerEvents: disabled ? "none" : undefined,
                      cursor: disabled ? "none" : undefined
                    },
                    startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* default */.C, {
                      statKey: mainStatKey
                    }),
                    onClick: () => buildSettingDispatch({
                      mainStatKeys: Object.assign({}, mainStatKeys, {
                        [slotKey]: mainKeysHandler(selectedMainKeys, mainStatKey)
                      })
                    }),
                    children: tots[slotKey][mainStatKey]
                  })
                })
              }, mainStatKey);
            })
          })]
        })]
      }, slotKey);
    })]
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/OptimizationTargetEditorList.tsx











function OptimizationTargetEditorList({
  statFilters,
  setStatFilters,
  disabled = false
}) {
  const setTarget = (0,react.useCallback)((path, oldPath, oldIndex) => {
    var _statFilters$pathStr;
    const statFilters_ = Object.assign({}, statFilters);
    const oldPathStr = JSON.stringify(oldPath);
    const oldFilterArr = oldPath ? [...statFilters[oldPathStr]] : undefined;
    const pathStr = JSON.stringify(path);
    const filterArr = [...((_statFilters$pathStr = statFilters[pathStr]) != null ? _statFilters$pathStr : [])];
    // Copy/create new setting
    if (oldIndex !== undefined && oldFilterArr) filterArr.push(oldFilterArr[oldIndex]);else filterArr.push({
      value: 0,
      disabled: false
    });
    statFilters_[pathStr] = filterArr;
    // Remove old setting
    if (oldIndex !== undefined && oldFilterArr) {
      oldFilterArr.splice(oldIndex, 1);
      if (oldFilterArr.length) statFilters_[oldPathStr] = oldFilterArr;else delete statFilters_[oldPathStr];
    }
    setStatFilters(Object.assign({}, statFilters_));
  }, [setStatFilters, statFilters]);
  const delTarget = (0,react.useCallback)((path, index) => {
    const statFilters_ = Object.assign({}, statFilters);
    const pathStr = JSON.stringify(path);
    const filterArr = [...statFilters[pathStr]];
    filterArr.splice(index, 1);
    if (filterArr.length) statFilters_[pathStr] = filterArr;else delete statFilters_[pathStr];
    setStatFilters(Object.assign({}, statFilters_));
  }, [setStatFilters, statFilters]);
  const setTargetValue = (0,react.useCallback)((path, index, value) => {
    const statFilters_ = Object.assign({}, statFilters);
    const pathStr = JSON.stringify(path);
    const filterArr = [...statFilters[pathStr]];
    filterArr[index] = Object.assign({}, filterArr[index], {
      value
    });
    statFilters_[pathStr] = filterArr;
    setStatFilters(Object.assign({}, statFilters_));
  }, [setStatFilters, statFilters]);
  const setTargetDisabled = (0,react.useCallback)((path, index, disabled) => {
    const statFilters_ = Object.assign({}, statFilters);
    const pathStr = JSON.stringify(path);
    const filterArr = [...statFilters[pathStr]];
    filterArr[index] = Object.assign({}, filterArr[index], {
      disabled
    });
    statFilters_[pathStr] = filterArr;
    setStatFilters(Object.assign({}, statFilters_));
  }, [setStatFilters, statFilters]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [Object.entries(statFilters).flatMap(([pathStr, settings]) => settings == null ? void 0 : settings.map((setting, index) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(OptimizationTargetEditorItem, {
      path: JSON.parse(pathStr),
      setting: setting,
      index: index,
      setTarget: setTarget,
      delTarget: delTarget,
      setValue: setTargetValue,
      setDisabled: setTargetDisabled,
      disabled: disabled
    }, pathStr + index))), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(OptimizationTargetEditorItem, {
      setTarget: setTarget,
      delTarget: delTarget,
      setValue: setTargetValue,
      setDisabled: setTargetDisabled,
      disabled: disabled
    })]
  });
}
function OptimizationTargetEditorItem({
  path,
  setting,
  index,
  setTarget,
  delTarget,
  setValue,
  setDisabled,
  disabled
}) {
  var _buildConstraintNode$;
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const onChange = (0,react.useCallback)(val => path && index !== undefined && setValue(path, index, val != null ? val : 0), [setValue, path, index]);
  const buttonStyle = {
    p: 1,
    flexBasis: 30,
    flexGrow: 0,
    flexShrink: 0
  };
  const buildConstraintNode = (0,Util/* objPathValue */.Hm)(data.getDisplay(), path != null ? path : []);
  const isPercent = (buildConstraintNode == null ? void 0 : (_buildConstraintNode$ = buildConstraintNode.info) == null ? void 0 : _buildConstraintNode$.unit) === "%";
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.ButtonGroup, {
    sx: {
      "& .MuiButtonGroup-grouped": {
        minWidth: 24
      },
      width: "100%"
    },
    children: [!!setting && !!path && index !== undefined && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
      sx: buttonStyle,
      color: setting.disabled ? "secondary" : "success",
      onClick: () => setDisabled(path, index, !setting.disabled),
      disabled: disabled,
      children: setting.disabled ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {})
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(OptimizationTargetSelector/* default */.Z, {
      showEmptyTargets: true,
      optimizationTarget: path,
      setTarget: target => setTarget(target, path, index),
      defaultText: t("targetSelector.selectBuildTarget")
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* CustomNumberInputButtonGroupWrapper */.CC, {
      sx: {
        flexBasis: 150,
        flexGrow: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
        float: true,
        disabled: !path || disabled,
        value: setting == null ? void 0 : setting.value,
        placeholder: "Stat Value",
        onChange: onChange,
        sx: {
          px: 1
        },
        inputProps: {
          sx: {
            textAlign: "right"
          }
        },
        endAdornment: isPercent ? "%" : undefined
      })
    }), !!path && index !== undefined && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
      sx: buttonStyle,
      color: "error",
      onClick: () => delTarget(path, index),
      disabled: disabled,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* DeleteForever */.Gnd, {
        fontSize: "small"
      })
    })]
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/StatFilterCard.tsx
let StatFilterCard_ = t => t,
  StatFilterCard_t,
  StatFilterCard_t2;










function StatFilterCard({
  disabled = false
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    buildSetting: {
      statFilters
    },
    buildSettingDispatch
  } = useBuildSetting(characterKey);
  const setStatFilters = (0,react.useCallback)(statFilters => buildSettingDispatch({
    statFilters
  }), [buildSettingDispatch]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
        sx: {
          display: "flex",
          gap: 1,
          justifyContent: "space-between"
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          children: t(StatFilterCard_t || (StatFilterCard_t = StatFilterCard_`constraintFilter.title`))
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(InfoTooltip/* default */.Z, {
          title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
            children: t(StatFilterCard_t2 || (StatFilterCard_t2 = StatFilterCard_`constraintFilter.tooltip`))
          })
        })]
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
      display: "flex",
      flexDirection: "column",
      gap: 0.5,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(OptimizationTargetEditorList, {
        statFilters: statFilters,
        setStatFilters: setStatFilters,
        disabled: disabled
      })
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Components/Character/CharacterCardPico.tsx
var CharacterCardPico = __webpack_require__(51704);
// EXTERNAL MODULE: ./src/app/Components/Weapon/WeaponCardPico.tsx
var WeaponCardPico = __webpack_require__(32240);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/UseEquipped.tsx
let UseEquipped_ = t => t,
  UseEquipped_t;























const UseEquipped_CharacterSelectionModal = /*#__PURE__*/react.lazy(() => __webpack_require__.e(/* import() */ 592).then(__webpack_require__.bind(__webpack_require__, 701296)));
function UseEquipped({
  disabled = false,
  filteredArts
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    buildSetting: {
      useEquippedArts
    },
    buildSettingDispatch
  } = useBuildSetting(characterKey);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [show, onOpen, onClose] = (0,useBoolState/* default */.Z)(false);
  const [{
    equipmentPriority: tempEquipmentPriority
  }, setTO] = (0,react.useState)(database.displayOptimize.get());
  (0,react.useEffect)(() => database.displayOptimize.follow((r, to) => setTO(to)), [database, setTO]);
  //Basic validate for the equipmentPrio list to remove dups and characters that doesnt exist.
  const equipmentPriority = (0,react.useMemo)(() => [...new Set(tempEquipmentPriority)].filter(ck => database.chars.get(ck)), [database, tempEquipmentPriority]);
  const setPrio = (0,react.useCallback)(equipmentPriority => database.displayOptimize.set({
    equipmentPriority
  }), [database]);
  const setPrioRank = (0,react.useCallback)((fromIndex, toIndex) => {
    const arr = [...equipmentPriority];
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    setPrio(arr);
  }, [equipmentPriority, setPrio]);
  const removePrio = (0,react.useCallback)(fromIndex => {
    const arr = [...equipmentPriority];
    arr.splice(fromIndex, 1);
    setPrio(arr);
  }, [equipmentPriority, setPrio]);
  const addPrio = (0,react.useCallback)(ck => setPrio([...equipmentPriority, ck]), [equipmentPriority, setPrio]);
  const resetPrio = (0,react.useCallback)(() => setPrio([]), [setPrio]);
  const numAbove = (0,react.useMemo)(() => {
    let numAbove = equipmentPriority.length;
    const index = equipmentPriority.indexOf(characterKey);
    if (index >= 0) numAbove = index;
    return numAbove;
  }, [characterKey, equipmentPriority]);
  const numUseEquippedChar = (0,react.useMemo)(() => {
    return database.chars.keys.length - 1 - numAbove;
  }, [numAbove, database]);
  const numUnlisted = (0,react.useMemo)(() => {
    return database.chars.keys.length - equipmentPriority.length;
  }, [equipmentPriority, database]);
  const totArts = (0,react.useMemo)(() => filteredArts.filter(a => a.location && a.location !== (0,consts/* charKeyToLocCharKey */.V7)(characterKey)).length, [filteredArts, characterKey]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
    display: "flex",
    gap: 1,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
      open: show,
      onClose: onClose,
      containerProps: {
        maxWidth: "sm"
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
            container: true,
            spacing: 1,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              flexGrow: 1,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                variant: "h6",
                children: t(UseEquipped_t || (UseEquipped_t = UseEquipped_`useEquipped.modal.title`))
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              sx: {
                mb: -1
              },
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
                onClick: onClose
              })
            })]
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            sx: {
              mb: 1
            },
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                gutterBottom: true,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "useEquipped.modal.desc1",
                  children: "When generating a build, the Optimizer will only consider equipped artifacts from characters below the current character or those not on the list."
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                gutterBottom: true,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "useEquipped.modal.desc2",
                  children: "If the current character is not on the list, the Optimizer will only consider equipped artifacts from others characters that are not on the list."
                })
              })]
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
            display: "flex",
            flexDirection: "column",
            gap: 2,
            children: [equipmentPriority.map((ck, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SelectItem, {
              characterKey: ck,
              rank: i + 1,
              maxRank: equipmentPriority.length,
              setRank: num => num && setPrioRank(i, num - 1),
              onRemove: () => removePrio(i),
              numAbove: numAbove
            }, ck)), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
              sx: {
                display: "flex",
                gap: 1
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(NewItem, {
                onAdd: addPrio,
                list: equipmentPriority
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
                color: "error",
                onClick: resetPrio,
                startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Replay */.UHt, {}),
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "useEquipped.modal.clearList",
                  children: "Clear List"
                })
              })]
            }), !!numUseEquippedChar && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
              color: "success",
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "useEquipped.modal.usingNum",
                  count: numUnlisted,
                  children: ["Using artifacts from ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: {
                      count: numUnlisted
                    }
                  }), " unlisted characters"]
                })
              })
            })]
          })]
        })]
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.ButtonGroup, {
      sx: {
        display: "flex",
        width: "100%"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        sx: {
          flexGrow: 1
        },
        onClick: () => buildSettingDispatch({
          useEquippedArts: !useEquippedArts
        }),
        disabled: disabled,
        startIcon: useEquippedArts ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}),
        color: useEquippedArts ? "success" : "secondary",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          sx: {
            display: "flex",
            gap: 1,
            alignItems: "center"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
              t: t,
              i18nKey: "useEquipped.title",
              children: "Use Equipped Artifacts"
            })
          }), useEquippedArts && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
            sx: {
              whiteSpace: "normal"
            },
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
              t: t,
              i18nKey: "useEquipped.usingNumTot",
              count: numUnlisted,
              arts: totArts,
              children: ["Using ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                children: {
                  arts: totArts
                }
              }), " artifacts from ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                children: {
                  count: numUnlisted
                }
              }), " characters"]
            })
          })]
        })
      }), useEquippedArts && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        sx: {
          flexShrink: 1
        },
        color: "info",
        onClick: onOpen,
        disabled: disabled,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Settings */.Zrf, {})
      })]
    })]
  });
}
const itemSize = 60;
function SelectItem({
  characterKey,
  rank,
  maxRank,
  setRank,
  onRemove,
  numAbove
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const character = (0,useCharacter/* default */.Z)(characterKey);
  const onClick = (0,useCharSelectionCallback/* default */.Z)();
  if (!character) return null;
  const {
    equippedWeapon,
    equippedArtifacts
  } = character;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    sx: {
      p: 1
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      sx: {
        pb: 1,
        display: "flex",
        justifyContent: "space-between",
        gap: 1
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        color: "info",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
          children: ["#", rank]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        sx: {
          flexGrow: 1
        },
        color: numAbove === rank - 1 ? "warning" : rank - 1 < numAbove ? "error" : "success",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          children: numAbove === rank - 1 ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
            t: t,
            i18nKey: "useEquipped.modal.status.curr",
            children: "Current character"
          }) : rank - 1 < numAbove ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
            t: t,
            i18nKey: "useEquipped.modal.status.dont",
            children: "Don't Use artifacts"
          }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
            t: t,
            i18nKey: "useEquipped.modal.status.use",
            children: "Use artifacts"
          })
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.ButtonGroup, {
          sx: {
            flexGrow: 1
          },
          size: "small",
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* CustomNumberInputButtonGroupWrapper */.CC, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
              onChange: setRank,
              value: rank
              // startAdornment="Rank:"
              ,
              inputProps: {
                min: 1,
                max: maxRank,
                sx: {
                  textAlign: "center"
                }
              },
              sx: {
                width: "100%",
                height: "100%",
                pl: 2
              }
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            disabled: rank === 1,
            onClick: () => setRank(1),
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* KeyboardDoubleArrowUp */.Tky, {})
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            disabled: rank === 1,
            onClick: () => setRank(rank - 1),
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* KeyboardArrowUp */.Q6b, {})
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            disabled: rank === maxRank,
            onClick: () => setRank(rank + 1),
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* KeyboardArrowDown */.WdC, {})
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            disabled: rank === maxRank,
            onClick: () => setRank(maxRank),
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* KeyboardDoubleArrowDown */.qb8, {})
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            color: "error",
            onClick: onRemove,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Close */.x8P, {})
          })]
        })
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
      container: true,
      columns: 7,
      spacing: 1,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        item: true,
        xs: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterCardPico/* default */.Z, {
          characterKey: characterKey,
          onClick: onClick
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        item: true,
        xs: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponCardPico/* default */.Z, {
          weaponId: equippedWeapon
        })
      }), Object.entries(equippedArtifacts).map(([slotKey, aId]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        item: true,
        xs: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCardPico/* default */.Z, {
          slotKey: slotKey,
          artifactObj: database.arts.get(aId)
        })
      }, slotKey))]
    })]
  });
}
function NewItem({
  onAdd,
  list
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const [show, onOpen, onClose] = (0,useBoolState/* default */.Z)(false);
  const filter = (0,react.useCallback)(char => {
    if (!char) return false;
    return !list.includes(char.key);
  }, [list]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
      fallback: false,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(UseEquipped_CharacterSelectionModal, {
        show: show,
        onHide: onClose,
        onSelect: onAdd,
        filter: filter
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
      fullWidth: true,
      sx: {
        height: itemSize
      },
      color: "info",
      onClick: onOpen,
      startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Add */.mm_, {}),
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
        t: t,
        i18nKey: "useEquipped.modal.add",
        children: "Add character to list"
      })
    })]
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/UseExcluded.tsx










function UseExcluded({
  disabled = false,
  artsDirty
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    buildSetting: {
      useExcludedArts
    },
    buildSettingDispatch
  } = useBuildSetting(characterKey);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const numExcludedArt = (0,react.useMemo)(() => artsDirty && database.arts.values.reduce((a, art) => a + (art.exclude ? 1 : 0), 0), [database, artsDirty]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
    fullWidth: true,
    onClick: () => buildSettingDispatch({
      useExcludedArts: !useExcludedArts
    }),
    disabled: !numExcludedArt || disabled,
    startIcon: useExcludedArts ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}),
    color: useExcludedArts ? "success" : "secondary",
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      sx: {
        display: "flex",
        gap: 1
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "useExcluded.title",
          count: numExcludedArt,
          children: "Use Excluded Artifacts"
        })
      }), useExcludedArts ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
          t: t,
          i18nKey: "useExcluded.usingNum",
          count: numExcludedArt,
          children: ["Using ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: {
              count: numExcludedArt
            }
          }), " excluded artifacts"]
        })
      }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        color: "error",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
          t: t,
          i18nKey: "useExcluded.excNum",
          count: numExcludedArt,
          children: ["Excluded ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: {
              count: numExcludedArt
            }
          }), " artifacts"]
        })
      })]
    })
  });
}
// EXTERNAL MODULE: ../../node_modules/@mui/material/node/Alert/index.js
var Alert = __webpack_require__(951876);
var Alert_default = /*#__PURE__*/__webpack_require__.n(Alert);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/WorkerErr.tsx
let WorkerErr_ = t => t,
  WorkerErr_t;



function WorkerErr() {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)((Alert_default()), {
    severity: "error",
    variant: "filled",
    onClick: () => window.location.reload(),
    sx: {
      "& .MuiAlert-message": {
        flexGrow: 1,
        cursor: "pointer"
      }
    },
    children: t(WorkerErr_t || (WorkerErr_t = WorkerErr_`workerLoadFailed`))
  });
}
// EXTERNAL MODULE: ./src/app/Types/artifact.ts
var artifact = __webpack_require__(469190);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/foreground.ts







const dynamic = (0,utils/* setReadNodeKeys */.yY)((0,Util/* deepClone */.I8)({
  dyn: Object.assign({}, Formula/* input.art */.qH.art, Formula/* input.artSet */.qH.artSet)
}));
const dynamicData = {
  art: (0,Util/* objectKeyMap */.O)([...artifact/* allMainStatKeys */.r, ...artifact/* allSubstatKeys */._], key => dynamic.dyn[key]),
  artSet: (0,Util/* objectMap */.xh)(Formula/* input.artSet */.qH.artSet, (_, key) => dynamic.dyn[key])
};
function compactArtifacts(arts, mainStatAssumptionLevel, allowPartial) {
  const result = {
    base: {},
    values: {
      flower: [],
      plume: [],
      goblet: [],
      circlet: [],
      sands: []
    }
  };
  const keys = new Set();
  for (const art of arts) {
    const mainStatVal = Artifact/* default.mainStatValue */.ZP.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level));
    const data = {
      id: art.id,
      set: art.setKey,
      values: Object.assign({
        [art.setKey]: 1,
        [art.mainStatKey]: art.mainStatKey.endsWith('_') ? mainStatVal / 100 : mainStatVal
      }, Object.fromEntries(art.substats.map(substat => [substat.key, substat.key.endsWith('_') ? substat.accurateValue / 100 : substat.accurateValue])))
    };
    delete data.values[""];
    result.values[art.slotKey].push(data);
    Object.keys(data.values).forEach(x => keys.add(x));
  }
  result.base = (0,Util/* objectKeyMap */.O)([...keys], _ => 0);
  if (allowPartial) for (const value of Object.values(result.values)) value.push({
    id: "",
    values: {}
  });
  return result;
}
function debugCompute(nodes, base, arts) {
  const stats = Object.assign({}, base);
  for (const art of arts) {
    for (const [key, value] of Object.entries(art.values)) {
      var _stats$key;
      stats[key] = ((_stats$key = stats[key]) != null ? _stats$key : 0) + value;
    }
  }
  const data = {
    dyn: Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, constant(value)]))
  };
  const uiData = computeUIData([data]);
  return {
    base,
    arts,
    stats,
    data,
    uiData,
    nodes: nodes.map(formulaString),
    results: nodes.map(node => uiData.get(node))
  };
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/index.tsx
let TabOptimize_2 = t => t,
  TabOptimize_t,
  TabOptimize_t2,
  TabOptimize_t3,
  TabOptimize_t4;

















































function TabBuild() {
  var _teamData, _characterSheet$name;
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const {
    character: {
      key: characterKey,
      compareData
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    setChartData,
    graphBuilds,
    setGraphBuilds
  } = (0,react.useContext)(GraphContext);
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const [buildStatus, setBuildStatus] = (0,react.useState)({
    type: "inactive",
    tested: 0,
    failed: 0,
    skipped: 0,
    total: 0
  });
  const generatingBuilds = buildStatus.type !== "inactive";
  const [artsDirty, setArtsDirty] = (0,useForceUpdate/* default */.Z)();
  const [{
    equipmentPriority,
    threads = DisplayOptimizeEntry/* defThreads */.g
  }, setDisplayOptimize] = (0,react.useState)(database.displayOptimize.get());
  (0,react.useEffect)(() => database.displayOptimize.follow((r, to) => setDisplayOptimize(to)), [database, setDisplayOptimize]);
  const maxWorkers = threads > DisplayOptimizeEntry/* defThreads */.g ? DisplayOptimizeEntry/* defThreads */.g : threads;
  const setMaxWorkers = (0,react.useCallback)(threads => database.displayOptimize.set({
    threads
  }), [database]);
  const characterDispatch = (0,useCharacterReducer/* default */.Z)(characterKey);
  const onClickTeammate = (0,useCharSelectionCallback/* default */.Z)();

  // Clear state when changing characters
  (0,react.useEffect)(() => {
    setBuildStatus({
      type: "inactive",
      tested: 0,
      failed: 0,
      skipped: 0,
      total: 0
    });
  }, [characterKey]);
  const noArtifact = (0,react.useMemo)(() => !database.arts.values.length, [database]);
  const {
    buildSetting,
    buildSettingDispatch
  } = useBuildSetting(characterKey);
  const {
    plotBase,
    optimizationTarget,
    mainStatAssumptionLevel,
    allowPartial,
    maxBuildsToShow,
    levelLow,
    levelHigh
  } = buildSetting;
  const {
    buildResult: {
      builds,
      buildDate
    },
    buildResultDispatch
  } = useBuildResult(characterKey);
  const teamData = (0,useTeamData/* default */.Z)(characterKey, mainStatAssumptionLevel);
  const {
    characterSheet,
    target: data
  } = (_teamData = teamData == null ? void 0 : teamData[characterKey]) != null ? _teamData : {};
  const optimizationTargetNode = optimizationTarget && (0,Util/* objPathValue */.Hm)(data == null ? void 0 : data.getDisplay(), optimizationTarget);
  const isSM = ["xs", "sm"].includes((0,useMediaQueryUp/* default */.Z)());

  //register changes in artifact database
  (0,react.useEffect)(() => database.arts.followAny(setArtsDirty), [setArtsDirty, database]);
  const deferredArtsDirty = (0,react.useDeferredValue)(artsDirty);
  const deferredBuildSetting = (0,react.useDeferredValue)(buildSetting);
  const filteredArts = (0,react.useMemo)(() => {
    const {
      mainStatKeys,
      useExcludedArts,
      useEquippedArts,
      levelLow,
      levelHigh
    } = deferredArtsDirty && deferredBuildSetting;
    const cantTakeList = new Set();
    if (useEquippedArts) {
      const index = equipmentPriority.indexOf(characterKey);
      if (index < 0) equipmentPriority.forEach(ek => cantTakeList.add((0,consts/* charKeyToLocCharKey */.V7)(ek)));else equipmentPriority.slice(0, index).forEach(ek => cantTakeList.add((0,consts/* charKeyToLocCharKey */.V7)(ek)));
    }
    return database.arts.values.filter(art => {
      if (art.level < levelLow) return false;
      if (art.level > levelHigh) return false;
      const mainStats = mainStatKeys[art.slotKey];
      if (mainStats != null && mainStats.length && !mainStats.includes(art.mainStatKey)) return false;
      if (art.exclude && !useExcludedArts) return false;

      // If its equipped on the selected character, bypass the check
      if (art.location === (0,consts/* charKeyToLocCharKey */.V7)(characterKey)) return true;
      if (art.location && !useEquippedArts) return false;
      if (art.location && useEquippedArts && cantTakeList.has(art.location)) return false;
      return true;
    });
  }, [database, characterKey, equipmentPriority, deferredArtsDirty, deferredBuildSetting]);
  const filteredArtIds = (0,react.useMemo)(() => filteredArts.map(a => a.id), [filteredArts]);
  const levelTotal = (0,react.useMemo)(() => {
    const {
      levelLow,
      levelHigh
    } = deferredBuildSetting;
    let total = 0,
      current = 0;
    Object.entries(database.arts.data).forEach(([id, art]) => {
      if (art.level >= levelLow && art.level <= levelHigh) {
        total++;
        if (filteredArtIds.includes(id)) current++;
      }
    });
    return `${current}/${total}`;
  }, [deferredBuildSetting, filteredArtIds, database]);

  // Provides a function to cancel the work
  const cancelToken = (0,react.useRef)(() => {});
  //terminate worker when component unmounts
  (0,react.useEffect)(() => () => cancelToken.current(), []);
  const [workerErr, setWorkerErr] = (0,react.useState)(false);
  const generateBuilds = (0,react.useCallback)(async () => {
    var _uiDataForTeam$charac, _workerData$display, _workerData$display3;
    const {
      artSetExclusion,
      plotBase,
      statFilters,
      optimizationTarget,
      mainStatAssumptionLevel,
      allowPartial,
      maxBuildsToShow
    } = buildSetting;
    if (!characterKey || !optimizationTarget) return;
    const split = compactArtifacts(filteredArts, mainStatAssumptionLevel, allowPartial);
    const teamData = (0,useTeamData/* getTeamData */.V)(database, characterKey, mainStatAssumptionLevel, []);
    if (!teamData) return;
    const workerData = (_uiDataForTeam$charac = (0,api/* uiDataForTeam */.Qo)(teamData.teamData, gender, characterKey)[characterKey]) == null ? void 0 : _uiDataForTeam$charac.target.data[0];
    if (!workerData) return;
    Object.assign(workerData, (0,api/* mergeData */.b3)([workerData, dynamicData])); // Mark art fields as dynamic
    const unoptimizedOptimizationTargetNode = (0,Util/* objPathValue */.Hm)((_workerData$display = workerData.display) != null ? _workerData$display : {}, optimizationTarget);
    if (!unoptimizedOptimizationTargetNode) return;
    const targetNode = unoptimizedOptimizationTargetNode;
    const valueFilter = Object.entries(statFilters).flatMap(([pathStr, settings]) => settings.filter(setting => !setting.disabled).map(setting => {
      var _workerData$display2, _filterNode$info;
      const filterNode = (0,Util/* objPathValue */.Hm)((_workerData$display2 = workerData.display) != null ? _workerData$display2 : {}, JSON.parse(pathStr));
      const minimum = ((_filterNode$info = filterNode.info) == null ? void 0 : _filterNode$info.unit) === "%" ? setting.value / 100 : setting.value; // TODO: Conversion
      return {
        value: filterNode,
        minimum: minimum
      };
    })).filter(x => x.value && x.minimum > -Infinity);
    setChartData(undefined);
    const cancelled = new Promise(r => cancelToken.current = r);
    const unoptimizedNodes = [...valueFilter.map(x => x.value), unoptimizedOptimizationTargetNode];
    let arts = split;
    const setPerms = filterFeasiblePerm(artSetPerm(artSetExclusion, Object.values(split.values).flatMap(x => x.map(x => x.set))), split);
    const minimum = [...valueFilter.map(x => x.minimum), -Infinity];
    const status = {
      tested: 0,
      failed: 0,
      skipped: 0,
      total: NaN,
      startTime: performance.now()
    };
    const plotBaseNumNode = plotBase && (0,Util/* objPathValue */.Hm)((_workerData$display3 = workerData.display) != null ? _workerData$display3 : {}, plotBase);
    if (plotBaseNumNode) {
      unoptimizedNodes.push(plotBaseNumNode);
      minimum.push(-Infinity);
    }
    const prepruneArts = arts;
    let nodes = (0,optimization/* optimize */.tL)(unoptimizedNodes, workerData, ({
      path: [p]
    }) => p !== "dyn");
    nodes = pruneExclusion(nodes, artSetExclusion);
    ({
      nodes,
      arts
    } = pruneAll(nodes, minimum, arts, maxBuildsToShow, artSetExclusion, {
      reaffine: true,
      pruneArtRange: true,
      pruneNodeRange: true,
      pruneOrder: true
    }));
    nodes = (0,optimization/* optimize */.tL)(nodes, {}, _ => false);
    const plotBaseNode = plotBaseNumNode ? nodes.pop() : undefined;
    const optimizationTargetNode = nodes.pop();
    const wrap = {
      buildValues: Array(maxBuildsToShow).fill(0).map(_ => ({
        src: "",
        val: -Infinity
      }))
    };
    const minFilterCount = 16000000,
      maxRequestFilterInFlight = maxWorkers * 16;
    const unprunedFilters = setPerms[Symbol.iterator](),
      requestFilters = [];
    const idleWorkers = [],
      splittingWorkers = new Set();
    const workers = [];
    function getThreshold() {
      return wrap.buildValues[maxBuildsToShow - 1].val;
    }
    function fetchContinueWork() {
      return {
        command: "split",
        filter: undefined,
        minCount: minFilterCount,
        threshold: getThreshold()
      };
    }
    function fetchPruningWork() {
      const {
        done,
        value
      } = unprunedFilters.next();
      return done ? undefined : {
        command: "split",
        minCount: minFilterCount,
        threshold: getThreshold(),
        filter: value
      };
    }
    function fetchRequestWork() {
      const filter = requestFilters.pop();
      return !filter ? undefined : {
        command: "iterate",
        threshold: getThreshold(),
        filter
      };
    }
    const filters = nodes.map((value, i) => ({
      value,
      min: minimum[i]
    })).filter(x => x.min > -Infinity);
    const finalizedList = [];
    for (let i = 0; i < maxWorkers; i++) {
      const worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(337), __webpack_require__.b));
      worker.addEventListener("error", _ => {
        console.error("Failed to load worker");
        setWorkerErr(true);
        cancelToken.current();
      });
      const setup = {
        command: "setup",
        id: i,
        arts,
        optimizationTarget: optimizationTargetNode,
        plotBase: plotBaseNode,
        maxBuilds: maxBuildsToShow,
        filters
      };
      worker.postMessage(setup, undefined);
      if (i === 0) {
        const countCommand = {
          command: "count",
          exclusion: artSetExclusion,
          arts: [arts, prepruneArts]
        };
        worker.postMessage(countCommand, undefined);
      }
      let finalize;
      const finalized = new Promise(r => finalize = r);
      worker.onmessage = async ({
        data
      }) => {
        setWorkerErr(false);
        switch (data.command) {
          case "interim":
            status.tested += data.tested;
            status.failed += data.failed;
            status.skipped += data.skipped;
            if (data.buildValues) {
              wrap.buildValues = wrap.buildValues.filter(({
                src
              }) => src !== data.source);
              wrap.buildValues.push(...data.buildValues.map(val => ({
                src: data.source,
                val
              })));
              wrap.buildValues.sort((a, b) => b.val - a.val).splice(maxBuildsToShow);
            }
            break;
          case "split":
            if (data.filter) {
              requestFilters.push(data.filter);
              splittingWorkers.add(data.id);
            } else splittingWorkers.delete(data.id);
            idleWorkers.push(data.id);
            break;
          case "iterate":
            idleWorkers.push(data.id);
            break;
          case "finalize":
            worker.terminate();
            finalize(data);
            return;
          case "count":
            const [pruned, prepruned] = data.counts;
            status.total = prepruned;
            status.skipped += prepruned - pruned;
            return;
          default:
            console.log("DEBUG", data);
        }
        while (idleWorkers.length) {
          const id = idleWorkers.pop(),
            worker = workers[id];
          let work;
          if (requestFilters.length < maxRequestFilterInFlight) {
            work = fetchPruningWork();
            if (!work && splittingWorkers.has(id)) work = fetchContinueWork();
          }
          if (!work) work = fetchRequestWork();
          if (work) worker.postMessage(work);else {
            idleWorkers.push(id);
            if (idleWorkers.length === 4 * maxWorkers) {
              const command = {
                command: "finalize"
              };
              workers.forEach(worker => worker.postMessage(command));
            }
            break;
          }
        }
      };
      workers.push(worker);
      cancelled.then(() => worker.terminate());
      finalizedList.push(finalized);
    }
    for (let i = 0; i < 3; i++) idleWorkers.push(...(0,Util/* range */.w6)(0, maxWorkers - 1));
    const buildTimer = setInterval(() => setBuildStatus(Object.assign({
      type: "active"
    }, status)), 100);
    const results = await Promise.any([Promise.all(finalizedList), cancelled]);
    clearInterval(buildTimer);
    cancelToken.current = () => {};
    if (!results) {
      status.tested = 0;
      status.failed = 0;
      status.skipped = 0;
      status.total = 0;
    } else {
      if (plotBaseNumNode) {
        var _targetNode$info, _plotBaseNumNode$info;
        const plotData = mergePlot(results.map(x => x.plotData));
        let data = Object.values(plotData);
        if (((_targetNode$info = targetNode.info) == null ? void 0 : _targetNode$info.unit) === "%") data = data.map(({
          value,
          plot,
          artifactIds
        }) => ({
          value: value * 100,
          plot,
          artifactIds
        }));
        if (((_plotBaseNumNode$info = plotBaseNumNode.info) == null ? void 0 : _plotBaseNumNode$info.unit) === "%") data = data.map(({
          value,
          plot,
          artifactIds
        }) => ({
          value,
          plot: (plot != null ? plot : 0) * 100,
          artifactIds
        }));
        setChartData({
          valueNode: targetNode,
          plotNode: plotBaseNumNode,
          data
        });
      }
      const builds = mergeBuilds(results.map(x => x.builds), maxBuildsToShow);
      if (false) {}
      buildResultDispatch({
        builds: builds.map(build => build.artifactIds),
        buildDate: Date.now()
      });
    }
    setBuildStatus(Object.assign({}, status, {
      type: "inactive",
      finishTime: performance.now()
    }));
  }, [characterKey, filteredArts, database, buildResultDispatch, maxWorkers, buildSetting, setChartData]);
  const characterName = (_characterSheet$name = characterSheet == null ? void 0 : characterSheet.name) != null ? _characterSheet$name : "Character Name";
  const setPlotBase = (0,react.useCallback)(plotBase => {
    buildSettingDispatch({
      plotBase
    });
    setChartData(undefined);
  }, [buildSettingDispatch, setChartData]);
  const dataContext = (0,react.useMemo)(() => {
    return data && teamData && {
      data,
      teamData
    };
  }, [data, teamData]);
  const targetSelector = (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(OptimizationTargetSelector/* default */.Z, {
    optimizationTarget: optimizationTarget,
    setTarget: target => buildSettingDispatch({
      optimizationTarget: target
    }),
    disabled: !!generatingBuilds
  });
  const getLabel0 = (0,react.useCallback)(index => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
    t: t,
    i18nKey: "graphBuildLabel",
    count: index + 1,
    children: ["Graph #", {
      count: index + 1
    }]
  }), [t]);
  const getLabel1 = (0,react.useCallback)(index => `#${index + 1}`, []);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    children: [noArtifact && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Alert, {
      severity: "warning",
      variant: "filled",
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
        t: t,
        i18nKey: "noArtis",
        children: ["Oops! It looks like you haven't added any artifacts to GO yet! You should go to the ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Link, {
          component: react_router_dom_production_min.Link,
          to: "/artifacts",
          children: "Artifacts"
        }), " page and add some!"]
      })
    }), dataContext && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(DataContext/* DataContext.Provider */.R.Provider, {
      value: dataContext,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        container: true,
        spacing: 1,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          xs: 12,
          sm: 6,
          lg: 3,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterCard/* default */.Z, {
              characterKey: characterKey,
              onClickTeammate: onClickTeammate
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
          item: true,
          xs: 12,
          sm: 6,
          lg: 4,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
                placement: "top",
                title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                    variant: "h6",
                    children: t(TabOptimize_t || (TabOptimize_t = TabOptimize_2`mainStat.levelAssTooltip.title`))
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
                    children: t(TabOptimize_t2 || (TabOptimize_t2 = TabOptimize_2`mainStat.levelAssTooltip.desc`))
                  })]
                }),
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
                  children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(AssumeFullLevelToggle, {
                    mainStatAssumptionLevel: mainStatAssumptionLevel,
                    setmainStatAssumptionLevel: mainStatAssumptionLevel => buildSettingDispatch({
                      mainStatAssumptionLevel
                    }),
                    disabled: generatingBuilds
                  })
                })
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(MainStatSelectionCard, {
              disabled: generatingBuilds,
              filteredArtIds: filteredArtIds
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BonusStatsCard, {})]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
          item: true,
          xs: 12,
          sm: 6,
          lg: 5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetConfig, {
            disabled: generatingBuilds
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(UseExcluded, {
            disabled: generatingBuilds,
            artsDirty: artsDirty
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(UseEquipped, {
            disabled: generatingBuilds,
            filteredArts: filteredArts
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            fullWidth: true,
            startIcon: allowPartial ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}),
            color: allowPartial ? "success" : "secondary",
            onClick: () => buildSettingDispatch({
              allowPartial: !allowPartial
            }),
            disabled: generatingBuilds,
            children: t(TabOptimize_t3 || (TabOptimize_t3 = TabOptimize_2`allowPartial`))
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
              children: [t(TabOptimize_t4 || (TabOptimize_t4 = TabOptimize_2`levelFilter`)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
                color: "info",
                children: levelTotal
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactLevelSlider/* default */.Z, {
              levelLow: levelLow,
              levelHigh: levelHigh,
              setLow: levelLow => buildSettingDispatch({
                levelLow
              }),
              setHigh: levelHigh => buildSettingDispatch({
                levelHigh
              }),
              setBoth: (levelLow, levelHigh) => buildSettingDispatch({
                levelLow,
                levelHigh
              }),
              disabled: generatingBuilds
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatFilterCard, {
            disabled: generatingBuilds
          })]
        })]
      }), isSM && targetSelector, (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.ButtonGroup, {
        children: [!isSM && targetSelector, (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(DropdownButton/* default */.Z, {
          disabled: generatingBuilds || !characterKey,
          title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
            t: t,
            i18nKey: "build",
            count: maxBuildsToShow,
            children: [{
              count: maxBuildsToShow
            }, " Builds"]
          }),
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.MenuItem, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              variant: "caption",
              color: "info.main",
              children: t("buildDropdownDesc")
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), Build/* maxBuildsToShowList.map */.s.map(v => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.MenuItem, {
            onClick: () => buildSettingDispatch({
              maxBuildsToShow: v
            }),
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
              t: t,
              i18nKey: "build",
              count: v,
              children: [{
                count: v
              }, " Builds"]
            })
          }, v))]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(DropdownButton/* default */.Z, {
          disabled: generatingBuilds || !characterKey,
          sx: {
            borderRadius: "4px 0px 0px 4px"
          },
          title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
            t: t,
            i18nKey: "thread",
            count: maxWorkers,
            children: [{
              count: maxWorkers
            }, " Threads"]
          }),
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.MenuItem, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              variant: "caption",
              color: "info.main",
              children: t("threadDropdownDesc")
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,Util/* range */.w6)(1, DisplayOptimizeEntry/* defThreads */.g).reverse().map(v => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.MenuItem, {
            onClick: () => setMaxWorkers(v),
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
              t: t,
              i18nKey: "thread",
              count: v,
              children: [{
                count: v
              }, " Threads"]
            })
          }, v))]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
          placement: "top",
          title: !optimizationTarget ? t("selectTargetFirst") : "",
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
              disabled: !characterKey || !optimizationTarget || !optimizationTargetNode || optimizationTargetNode.isEmpty,
              color: generatingBuilds ? "error" : "success",
              onClick: generatingBuilds ? () => cancelToken.current() : generateBuilds,
              startIcon: generatingBuilds ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Close */.x8P, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* TrendingUp */.klz, {}),
              sx: {
                borderRadius: "0px 4px 4px 0px"
              },
              children: generatingBuilds ? t("generateButton.cancel") : t("generateButton.generateBuilds")
            })
          })
        })]
      }), workerErr && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WorkerErr, {}), !!characterKey && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BuildAlert, {
        status: buildStatus,
        characterName,
        maxBuildsToShow
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ChartCard, {
          disabled: generatingBuilds || !optimizationTarget,
          plotBase: plotBase,
          setPlotBase: setPlotBase,
          showTooltip: !optimizationTarget
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              sx: {
                flexGrow: 1
              },
              children: builds ? (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
                children: ["Showing ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                  children: builds.length + (graphBuilds ? graphBuilds.length : 0)
                }), " build generated for ", characterName, ". ", !!buildDate && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
                  children: ["Build generated on: ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: new Date(buildDate).toLocaleString()
                  })]
                })]
              }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
                children: "Select a character to generate builds."
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
              disabled: !builds.length,
              color: "error",
              onClick: () => {
                setGraphBuilds(undefined);
                buildResultDispatch({
                  builds: [],
                  buildDate: 0
                });
              },
              children: "Clear Builds"
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
            container: true,
            display: "flex",
            spacing: 1,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HitModeEditor/* HitModeToggle */.Hn, {
                size: "small"
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HitModeEditor/* ReactionToggle */.oX, {
                size: "small"
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              flexGrow: 1
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SolidToggleButtonGroup/* default */.Z, {
                exclusive: true,
                value: compareData,
                onChange: (_e, v) => characterDispatch({
                  compareData: v
                }),
                size: "small",
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.ToggleButton, {
                  value: false,
                  disabled: !compareData,
                  children: "Show new builds"
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.ToggleButton, {
                  value: true,
                  disabled: compareData,
                  children: "Compare vs. equipped"
                })]
              })
            })]
          })]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(OptimizationTargetContext.Provider, {
        value: optimizationTarget,
        children: [graphBuilds && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BuildList, {
          builds: graphBuilds,
          characterKey: characterKey,
          data: data,
          compareData: compareData,
          disabled: !!generatingBuilds,
          getLabel: getLabel0,
          setBuilds: setGraphBuilds
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BuildList, {
          builds: builds,
          characterKey: characterKey,
          data: data,
          compareData: compareData,
          disabled: !!generatingBuilds,
          getLabel: getLabel1
        })]
      })]
    })]
  });
}
function BuildList({
  builds,
  setBuilds,
  characterKey,
  data,
  compareData,
  disabled,
  getLabel
}) {
  const deleteBuild = (0,react.useCallback)(index => {
    if (setBuilds) {
      const builds_ = [...builds];
      builds_.splice(index, 1);
      setBuilds(builds_);
    }
  }, [builds, setBuilds]);
  // Memoize the build list because calculating/rendering the build list is actually very expensive, which will cause longer optimization times.
  const list = (0,react.useMemo)(() => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
    fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
      variant: "rectangular",
      width: "100%",
      height: 600
    }),
    children: builds == null ? void 0 : builds.map((build, index) => characterKey && data && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContextWrapper, {
      characterKey: characterKey,
      build: build,
      oldData: data,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BuildItemWrapper, {
        index: index,
        label: getLabel(index),
        build: build,
        compareData: compareData,
        disabled: disabled,
        deleteBuild: setBuilds ? deleteBuild : undefined
      })
    }, index + build.join()))
  }), [builds, characterKey, data, compareData, disabled, getLabel, deleteBuild, setBuilds]);
  return list;
}
function BuildItemWrapper({
  index,
  label,
  build,
  compareData,
  disabled,
  deleteBuild
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character_optimize");
  const location = (0,react_router_dom_production_min.useLocation)();
  const navigate = (0,react_router_dom_production_min.useNavigate)();
  const toTC = (0,react.useCallback)(() => {
    const paths = location.pathname.split("/");
    paths.pop();
    navigate(`${paths.join("/")}/theorycraft`, {
      state: {
        build
      }
    });
  }, [navigate, build, location.pathname]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BuildDisplayItem, {
    label: label,
    compareBuild: compareData,
    disabled: disabled,
    extraButtonsLeft: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        color: "info",
        size: "small",
        startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Science */.MVg, {}),
        onClick: toTC,
        children: t("theorycraftButton")
      }), deleteBuild && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        color: "error",
        size: "small",
        startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* DeleteForever */.Gnd, {}),
        onClick: () => deleteBuild(index),
        children: t("removeBuildButton")
      })]
    })
  });
}
function DataContextWrapper({
  children,
  characterKey,
  build,
  oldData
}) {
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    buildSetting: {
      mainStatAssumptionLevel
    }
  } = useBuildSetting(characterKey);
  // Update the build when the build artifacts are changed.
  const [dirty, setDirty] = (0,useForceUpdate/* default */.Z)();
  (0,react.useEffect)(() => database.arts.followAny(id => build.includes(id) && setDirty()), [database, build, setDirty]);
  const buildsArts = (0,react.useMemo)(() => dirty && build.map(i => database.arts.get(i)), [dirty, build, database]);
  const teamData = (0,useTeamData/* default */.Z)(characterKey, mainStatAssumptionLevel, buildsArts);
  const providerValue = (0,react.useMemo)(() => teamData && {
    data: teamData[characterKey].target,
    teamData,
    oldData
  }, [teamData, oldData, characterKey]);
  if (!providerValue) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
    value: providerValue,
    children: children
  });
}
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Albedo_Card.png
/* harmony default export */ const Character_Albedo_Card = (__webpack_require__.p + "Character_Albedo_Card.33ed548538c83bb0d573.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Alhaitham_Card.jpg
/* harmony default export */ const Character_Alhaitham_Card = (__webpack_require__.p + "Character_Alhaitham_Card.9507f3595b00169ee260.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Aloy_Card.png
/* harmony default export */ const Character_Aloy_Card = (__webpack_require__.p + "Character_Aloy_Card.b3c74f3135dd92774142.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Amber_Card.jpg
/* harmony default export */ const Character_Amber_Card = (__webpack_require__.p + "Character_Amber_Card.d17ffc294114c2a1f025.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Arataki_Itto_Card.jpg
/* harmony default export */ const Character_Arataki_Itto_Card = (__webpack_require__.p + "Character_Arataki_Itto_Card.fc4d216cc566d5528007.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Barbara_Card.jpg
/* harmony default export */ const Character_Barbara_Card = (__webpack_require__.p + "Character_Barbara_Card.7acacdaa14dd1e970a5b.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Beidou_Card.jpg
/* harmony default export */ const Character_Beidou_Card = (__webpack_require__.p + "Character_Beidou_Card.fe206e4250c56e9cc107.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Bennett_Card.jpg
/* harmony default export */ const Character_Bennett_Card = (__webpack_require__.p + "Character_Bennett_Card.88d7ad1d6a0808c396d9.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Candace_Card.jpg
/* harmony default export */ const Character_Candace_Card = (__webpack_require__.p + "Character_Candace_Card.746fe685318df498d10b.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Chongyun_Card.jpg
/* harmony default export */ const Character_Chongyun_Card = (__webpack_require__.p + "Character_Chongyun_Card.5c6a3b9f95eee98b3da9.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Collei_Card.jpg
/* harmony default export */ const Character_Collei_Card = (__webpack_require__.p + "Character_Collei_Card.e73fe22221e197d15c08.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Cyno_Card.jpg
/* harmony default export */ const Character_Cyno_Card = (__webpack_require__.p + "Character_Cyno_Card.a0578c9e452ac732f3dd.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Diluc_Card.jpg
/* harmony default export */ const Character_Diluc_Card = (__webpack_require__.p + "Character_Diluc_Card.d2358b684eda63db3a90.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Diona_Card.png
/* harmony default export */ const Character_Diona_Card = (__webpack_require__.p + "Character_Diona_Card.0c68591f25f9f8f4e875.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Dori_Card.jpg
/* harmony default export */ const Character_Dori_Card = (__webpack_require__.p + "Character_Dori_Card.dc565c0a3fc96c41e70c.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Eula_Card.png
/* harmony default export */ const Character_Eula_Card = (__webpack_require__.p + "Character_Eula_Card.0ffc72fe7639b4c883ff.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Faruzan_Card.jpg
/* harmony default export */ const Character_Faruzan_Card = (__webpack_require__.p + "Character_Faruzan_Card.1ab88af1d128816e2e04.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Fischl_Card.jpg
/* harmony default export */ const Character_Fischl_Card = (__webpack_require__.p + "Character_Fischl_Card.10be47a2a7fd4a728f27.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Ganyu_Card.png
/* harmony default export */ const Character_Ganyu_Card = (__webpack_require__.p + "Character_Ganyu_Card.7fed6f9d6c8be82255cb.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Gorou_Card.jpg
/* harmony default export */ const Character_Gorou_Card = (__webpack_require__.p + "Character_Gorou_Card.4e926de2861121615142.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Hu_Tao_Card.jpg
/* harmony default export */ const Character_Hu_Tao_Card = (__webpack_require__.p + "Character_Hu_Tao_Card.917148e1a83fba916420.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Jean_Card.jpg
/* harmony default export */ const Character_Jean_Card = (__webpack_require__.p + "Character_Jean_Card.0020d1f9a96b16c99fa2.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Kaeya_Card.jpg
/* harmony default export */ const Character_Kaeya_Card = (__webpack_require__.p + "Character_Kaeya_Card.32e9801f204c800b9a8f.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Kamisato_Ayaka_Card.png
/* harmony default export */ const Character_Kamisato_Ayaka_Card = (__webpack_require__.p + "Character_Kamisato_Ayaka_Card.41ee4451722233d999ce.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Kamisato_Ayato_Card.png
/* harmony default export */ const Character_Kamisato_Ayato_Card = (__webpack_require__.p + "Character_Kamisato_Ayato_Card.be5c038385d9ba03d66a.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Kazuha_Card.png
/* harmony default export */ const Character_Kazuha_Card = (__webpack_require__.p + "Character_Kazuha_Card.0dd97246688cccd4fd7d.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Keqing_Card.jpg
/* harmony default export */ const Character_Keqing_Card = (__webpack_require__.p + "Character_Keqing_Card.4bb17ff4c53446e8ce6e.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Klee_Card.jpg
/* harmony default export */ const Character_Klee_Card = (__webpack_require__.p + "Character_Klee_Card.755947b3d8deab8ddccd.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Kujou_Sara_Card.jpg
/* harmony default export */ const Character_Kujou_Sara_Card = (__webpack_require__.p + "Character_Kujou_Sara_Card.99f1067991e53dd6a0f6.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Kuki_Shinobu_Card.jpg
/* harmony default export */ const Character_Kuki_Shinobu_Card = (__webpack_require__.p + "Character_Kuki_Shinobu_Card.1800eb32ed5107d10ad1.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Layla_Card.jpeg
const Character_Layla_Card_namespaceObject = __webpack_require__.p + "b27d8af3c869a1a0.jpeg";
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Lisa_Card.jpg
/* harmony default export */ const Character_Lisa_Card = (__webpack_require__.p + "Character_Lisa_Card.295ea04caf63e75d5d56.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Mona_Card.jpg
/* harmony default export */ const Character_Mona_Card = (__webpack_require__.p + "Character_Mona_Card.7ef44015d51872469a10.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Nahida_Card.jpeg
const Character_Nahida_Card_namespaceObject = __webpack_require__.p + "039230426b6241f2.jpeg";
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Nilou_Card.jpg
/* harmony default export */ const Character_Nilou_Card = (__webpack_require__.p + "Character_Nilou_Card.d1081df93c2ec412529c.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Ningguang_Card.jpg
/* harmony default export */ const Character_Ningguang_Card = (__webpack_require__.p + "Character_Ningguang_Card.28dbe4862cb3c6459b19.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Noelle_Card.jpg
/* harmony default export */ const Character_Noelle_Card = (__webpack_require__.p + "Character_Noelle_Card.951911c13159b988b9e2.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Qiqi_Card.jpg
/* harmony default export */ const Character_Qiqi_Card = (__webpack_require__.p + "Character_Qiqi_Card.70653a4d5d639e1017e2.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Raiden_Shogun_Card.png
/* harmony default export */ const Character_Raiden_Shogun_Card = (__webpack_require__.p + "Character_Raiden_Shogun_Card.42d3c9bfc75bb4ce492b.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Razor_Card.jpg
/* harmony default export */ const Character_Razor_Card = (__webpack_require__.p + "Character_Razor_Card.21fbdbf11c3db6b0d23f.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Rosaria_Card.png
/* harmony default export */ const Character_Rosaria_Card = (__webpack_require__.p + "Character_Rosaria_Card.fa74eef60e992eb5a79c.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Sangonomiya_Kokomi_Card.jpg
/* harmony default export */ const Character_Sangonomiya_Kokomi_Card = (__webpack_require__.p + "Character_Sangonomiya_Kokomi_Card.9677564db61e1f838a28.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Sayu_Card.png
/* harmony default export */ const Character_Sayu_Card = (__webpack_require__.p + "Character_Sayu_Card.bc8a0e3b4362c44093d9.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Shenhe_Card.jpg
/* harmony default export */ const Character_Shenhe_Card = (__webpack_require__.p + "Character_Shenhe_Card.2bf306351d9a7f04785b.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Shikanoin_Heizou_Card.png
/* harmony default export */ const Character_Shikanoin_Heizou_Card = (__webpack_require__.p + "Character_Shikanoin_Heizou_Card.c1bf30fa920cd541f41e.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Sucrose_Card.jpg
/* harmony default export */ const Character_Sucrose_Card = (__webpack_require__.p + "Character_Sucrose_Card.ef1bd7db1c136495e002.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Tartaglia_Card.png
/* harmony default export */ const Character_Tartaglia_Card = (__webpack_require__.p + "Character_Tartaglia_Card.f38435b0837f70fe4f72.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Thoma_Card.jpg
/* harmony default export */ const Character_Thoma_Card = (__webpack_require__.p + "Character_Thoma_Card.881aaf517f797ab6ec63.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Tighnari_Card.jpg
/* harmony default export */ const Character_Tighnari_Card = (__webpack_require__.p + "Character_Tighnari_Card.d91d2730d0eb271288f0.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Venti_Card.jpg
/* harmony default export */ const Character_Venti_Card = (__webpack_require__.p + "Character_Venti_Card.3ce9339f6a5e4de685b2.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Wanderer_Card.jpg
/* harmony default export */ const Character_Wanderer_Card = (__webpack_require__.p + "Character_Wanderer_Card.48ef9b3aabef421c72e9.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Xiangling_Card.jpg
/* harmony default export */ const Character_Xiangling_Card = (__webpack_require__.p + "Character_Xiangling_Card.a45a73bab5bf1143963e.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Xiao_Card.jpg
/* harmony default export */ const Character_Xiao_Card = (__webpack_require__.p + "Character_Xiao_Card.7a80506627eca44de9d5.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Xingqiu_Card.jpg
/* harmony default export */ const Character_Xingqiu_Card = (__webpack_require__.p + "Character_Xingqiu_Card.7ee8f08dc0778523ef81.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Xinyan_Card.jpg
/* harmony default export */ const Character_Xinyan_Card = (__webpack_require__.p + "Character_Xinyan_Card.c909dbfe1ebab8035af7.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Yae_Miko_Card.png
/* harmony default export */ const Character_Yae_Miko_Card = (__webpack_require__.p + "Character_Yae_Miko_Card.5f49f3f2b51e2d738859.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Yanfei_Card.png
/* harmony default export */ const Character_Yanfei_Card = (__webpack_require__.p + "Character_Yanfei_Card.41eeebc2762bf462571a.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Yaoyao_Card.jpg
/* harmony default export */ const Character_Yaoyao_Card = (__webpack_require__.p + "Character_Yaoyao_Card.1b85965cdd90334639ec.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Yelan_Card.jpg
/* harmony default export */ const Character_Yelan_Card = (__webpack_require__.p + "Character_Yelan_Card.a98f32ce8b80e1677135.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Yoimiya_Card.png
/* harmony default export */ const Character_Yoimiya_Card = (__webpack_require__.p + "Character_Yoimiya_Card.0fe41c6abd865388ef6e.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Yun_Jin_Card.jpg
/* harmony default export */ const Character_Yun_Jin_Card = (__webpack_require__.p + "Character_Yun_Jin_Card.4a1e2bd3043c9a9065b2.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Character_Zhongli_Card.png
/* harmony default export */ const Character_Zhongli_Card = (__webpack_require__.p + "Character_Zhongli_Card.2e5f8839d21a4ef16aca.png");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Traveler_Female_Card.jpg
/* harmony default export */ const Traveler_Female_Card = (__webpack_require__.p + "Traveler_Female_Card.6a60cbcc22c5461d9762.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/Traveler_Male_Card.jpg
/* harmony default export */ const Traveler_Male_Card = (__webpack_require__.p + "Traveler_Male_Card.f04efe5b62c464233160.jpg");
;// CONCATENATED MODULE: ../../libs/char-cards/src/index.ts
































































const charCards = {
  Albedo: Character_Albedo_Card,
  Alhaitham: Character_Alhaitham_Card,
  Aloy: Character_Aloy_Card,
  Amber: Character_Amber_Card,
  AratakiItto: Character_Arataki_Itto_Card,
  Barbara: Character_Barbara_Card,
  Beidou: Character_Beidou_Card,
  Bennett: Character_Bennett_Card,
  Candace: Character_Candace_Card,
  Chongyun: Character_Chongyun_Card,
  Collei: Character_Collei_Card,
  Cyno: Character_Cyno_Card,
  Diluc: Character_Diluc_Card,
  Diona: Character_Diona_Card,
  Dori: Character_Dori_Card,
  Eula: Character_Eula_Card,
  Faruzan: Character_Faruzan_Card,
  Fischl: Character_Fischl_Card,
  Ganyu: Character_Ganyu_Card,
  Gorou: Character_Gorou_Card,
  HuTao: Character_Hu_Tao_Card,
  Jean: Character_Jean_Card,
  KaedeharaKazuha: Character_Kazuha_Card,
  Kaeya: Character_Kaeya_Card,
  KamisatoAyaka: Character_Kamisato_Ayaka_Card,
  KamisatoAyato: Character_Kamisato_Ayato_Card,
  Keqing: Character_Keqing_Card,
  Klee: Character_Klee_Card,
  KujouSara: Character_Kujou_Sara_Card,
  KukiShinobu: Character_Kuki_Shinobu_Card,
  Layla: Character_Layla_Card_namespaceObject,
  Lisa: Character_Lisa_Card,
  Mona: Character_Mona_Card,
  Nahida: Character_Nahida_Card_namespaceObject,
  Nilou: Character_Nilou_Card,
  Ningguang: Character_Ningguang_Card,
  Noelle: Character_Noelle_Card,
  Qiqi: Character_Qiqi_Card,
  RaidenShogun: Character_Raiden_Shogun_Card,
  Razor: Character_Razor_Card,
  Rosaria: Character_Rosaria_Card,
  SangonomiyaKokomi: Character_Sangonomiya_Kokomi_Card,
  Sayu: Character_Sayu_Card,
  Shenhe: Character_Shenhe_Card,
  ShikanoinHeizou: Character_Shikanoin_Heizou_Card,
  Sucrose: Character_Sucrose_Card,
  Tartaglia: Character_Tartaglia_Card,
  Thoma: Character_Thoma_Card,
  Tighnari: Character_Tighnari_Card,
  TravelerF: Traveler_Female_Card,
  TravelerM: Traveler_Male_Card,
  Venti: Character_Venti_Card,
  Wanderer: Character_Wanderer_Card,
  Xiangling: Character_Xiangling_Card,
  Xiao: Character_Xiao_Card,
  Xingqiu: Character_Xingqiu_Card,
  Xinyan: Character_Xinyan_Card,
  YaeMiko: Character_Yae_Miko_Card,
  Yanfei: Character_Yanfei_Card,
  Yaoyao: Character_Yaoyao_Card,
  Yelan: Character_Yelan_Card,
  Yoimiya: Character_Yoimiya_Card,
  YunJin: Character_Yun_Jin_Card,
  Zhongli: Character_Zhongli_Card
};
function charCard(charKey, gender) {
  var _charCards, _charCards$charKey;
  switch (charKey) {
    case "TravelerAnemo":
    case "TravelerDendro":
    case "TravelerElectro":
    case "TravelerGeo":
      return (_charCards = charCards[`Traveler${gender}`]) != null ? _charCards : "";
    default:
      return (_charCards$charKey = charCards[charKey]) != null ? _charCards$charKey : "";
  }
}
// EXTERNAL MODULE: ./src/app/Components/StarDisplay.tsx
var StarDisplay = __webpack_require__(871765);
// EXTERNAL MODULE: ./src/app/Data/LevelData.ts
var LevelData = __webpack_require__(821626);
// EXTERNAL MODULE: ./src/app/ReactHooks/useCharMeta.tsx
var useCharMeta = __webpack_require__(132560);
// EXTERNAL MODULE: ./src/app/Components/Artifact/SubstatToggle.tsx
var SubstatToggle = __webpack_require__(612121);
// EXTERNAL MODULE: ./src/app/Components/PercentBadge.tsx
var PercentBadge = __webpack_require__(945220);
// EXTERNAL MODULE: ./src/app/PageWeapon/WeaponCard.tsx
var WeaponCard = __webpack_require__(603694);
// EXTERNAL MODULE: ./src/app/PageArtifact/ArtifactSort.ts
var ArtifactSort = __webpack_require__(671957);
// EXTERNAL MODULE: ./src/app/Util/SortByFilters.ts
var SortByFilters = __webpack_require__(601661);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOverview/CompareBuildButton.tsx
let CompareBuildButton_ = t => t,
  CompareBuildButton_t;

















function CompareBuildButton({
  artId,
  weaponId
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const [show, onShow, onHide] = (0,useBoolState/* default */.Z)(false);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
      open: show,
      onClose: onHide,
      containerProps: {
        maxWidth: "xl"
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CompareContent, {
        artId: artId,
        weaponId: weaponId,
        onHide: onHide
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Tooltip, {
      title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
        children: t(CompareBuildButton_t || (CompareBuildButton_t = CompareBuildButton_`tabEquip.compare`))
      }),
      placement: "top",
      arrow: true,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        color: "info",
        size: "small",
        onClick: onShow,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Difference */.agI, {})
      })
    })]
  });
}
function CompareContent({
  artId,
  weaponId,
  onHide
}) {
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    character: {
      key: characterKey,
      equippedArtifacts
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    buildSetting: {
      mainStatAssumptionLevel
    }
  } = useBuildSetting(characterKey);
  const {
    data: oldData
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const build = (0,react.useMemo)(() => {
    const newArt = database.arts.get(artId != null ? artId : "");
    const artmap = (0,Util/* objectMap */.xh)(equippedArtifacts, (id, slot) => slot === (newArt == null ? void 0 : newArt.slotKey) ? newArt : database.arts.get(id));
    return Object.values(artmap).filter(a => a);
  }, [database, equippedArtifacts, artId]);
  const teamData = (0,useTeamData/* default */.Z)(characterKey, mainStatAssumptionLevel, build, weaponId ? database.weapons.get(weaponId) : undefined);
  const dataProviderValue = (0,react.useMemo)(() => teamData && {
    data: teamData[characterKey].target,
    teamData,
    oldData
  }, [characterKey, teamData, oldData]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
    fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
      variant: "rectangular",
      width: "100%",
      height: 600
    }),
    children: dataProviderValue && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
      value: dataProviderValue,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BuildDisplayItem, {
        compareBuild: true,
        extraButtonsLeft: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HitModeEditor/* HitModeToggle */.Hn, {
            size: "small"
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HitModeEditor/* ReactionToggle */.oX, {
            size: "small"
          })]
        }),
        extraButtonsRight: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
          size: "small",
          color: "error",
          onClick: onHide,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Close */.x8P, {})
        })
      })
    })
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOverview/ArtifactSwapModal.tsx
let ArtifactSwapModal_ = t => t,
  ArtifactSwapModal_t;

















const numToShowMap = {
  xs: 6,
  sm: 6,
  md: 9,
  lg: 12,
  xl: 12
};
const ArtifactFilterDisplay = /*#__PURE__*/(0,react.lazy)(() => __webpack_require__.e(/* import() */ 157).then(__webpack_require__.bind(__webpack_require__, 619157)));
function ArtifactSwapModal({
  onChangeId,
  slotKey,
  show,
  onClose
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const clickHandler = (0,react.useCallback)(id => {
    onChangeId(id);
    onClose();
  }, [onChangeId, onClose]);
  const filterOptionReducer = (0,react.useCallback)((state, action) => Object.assign({}, state, action, {
    slotKeys: [slotKey]
  }), [slotKey]);
  const [filterOption, filterOptionDispatch] = (0,react.useReducer)(filterOptionReducer, Object.assign({}, (0,ArtifactSort/* initialFilterOption */.Af)(), {
    slotKeys: [slotKey]
  }));
  const [dbDirty, forceUpdate] = (0,useForceUpdate/* default */.Z)();
  (0,react.useEffect)(() => {
    return database.arts.followAny(forceUpdate);
  }, [database, forceUpdate]);
  const brPt = (0,useMediaQueryUp/* default */.Z)();
  const filterConfigs = (0,react.useMemo)(() => (0,ArtifactSort/* artifactFilterConfigs */.EM)(), []);
  const artIdList = (0,react.useMemo)(() => {
    const filterFunc = (0,SortByFilters/* filterFunction */.C)(filterOption, filterConfigs);
    return dbDirty && database.arts.values.filter(filterFunc).map(art => art.id).slice(0, numToShowMap[brPt]);
  }, [dbDirty, database, filterConfigs, filterOption, brPt]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
    open: show,
    onClose: onClose,
    containerProps: {
      maxWidth: "xl"
    },
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
        sx: {
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
          variant: "h6",
          children: [slotKey ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgIcon/* default */.Z, {
            src: Assets/* default.slot */.Z.slot[slotKey]
          }) : null, " ", t(ArtifactSwapModal_t || (ArtifactSwapModal_t = ArtifactSwapModal_`tabEquip.swapArt`))]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
          onClick: onClose
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
          fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
            variant: "rectangular",
            width: "100%",
            height: 200
          }),
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactFilterDisplay, {
            filterOption: filterOption,
            filterOptionDispatch: filterOptionDispatch,
            filteredIds: artIdList,
            disableSlotFilter: true
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          mt: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
            fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
              variant: "rectangular",
              width: "100%",
              height: 300
            }),
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              container: true,
              spacing: 1,
              columns: {
                xs: 2,
                md: 3,
                lg: 4
              },
              children: artIdList.map(id => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
                item: true,
                xs: 1,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCard/* default */.Z, {
                  artifactId: id,
                  extraButtons: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CompareBuildButton, {
                    artId: id
                  }),
                  onClick: clickHandler
                })
              }, id))
            })
          })
        })]
      })]
    })
  });
}
// EXTERNAL MODULE: ./src/app/Components/Weapon/WeaponSelectionModal.tsx
var WeaponSelectionModal = __webpack_require__(489431);
// EXTERNAL MODULE: ./src/app/PageWeapon/WeaponEditor.tsx
var WeaponEditor = __webpack_require__(215878);
// EXTERNAL MODULE: ./src/app/Util/WeaponSort.ts
var WeaponSort = __webpack_require__(677712);
// EXTERNAL MODULE: ./src/app/Util/WeaponUtil.ts
var WeaponUtil = __webpack_require__(564120);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOverview/WeaponSwapModal.tsx
let WeaponSwapModal_ = t => t,
  WeaponSwapModal_t;
























const rarityHandler = (0,MultiSelect/* handleMultiSelect */.X)([...consts_src/* allRarities */.wC]);
function WeaponSwapModal({
  onChangeId,
  weaponTypeKey,
  show,
  onClose
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["page_character", "page_weapon", "weaponNames_gen"]);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [newWeaponModalShow, setnewWeaponModalShow] = (0,react.useState)(false);
  const clickHandler = (0,react.useCallback)(id => {
    onChangeId(id);
    onClose();
  }, [onChangeId, onClose]);
  const [editWeaponId, setEditWeaponId] = (0,react.useState)("");
  const newWeapon = (0,react.useCallback)(weaponKey => {
    setEditWeaponId(database.weapons.new((0,WeaponUtil/* initialWeapon */.xg)(weaponKey)));
  }, [database, setEditWeaponId]);
  const resetEditWeapon = (0,react.useCallback)(() => setEditWeaponId(""), []);
  const [dbDirty, forceUpdate] = (0,useForceUpdate/* default */.Z)();
  (0,react.useEffect)(() => database.weapons.followAny(forceUpdate), [forceUpdate, database]);
  const [rarity, setRarity] = (0,react.useState)([5, 4, 3]);
  const [searchTerm, setSearchTerm] = (0,react.useState)("");
  const deferredSearchTerm = (0,react.useDeferredValue)(searchTerm);
  const weaponIdList = (0,react.useMemo)(() => {
    var _ref, _weaponSortMap$level;
    return (_ref = dbDirty && database.weapons.values.filter((0,SortByFilters/* filterFunction */.C)({
      weaponType: weaponTypeKey,
      rarity,
      name: deferredSearchTerm
    }, (0,WeaponSort/* weaponFilterConfigs */.Xg)())).sort((0,SortByFilters/* sortFunction */.e)((_weaponSortMap$level = WeaponSort/* weaponSortMap.level */.gd.level) != null ? _weaponSortMap$level : [], false, (0,WeaponSort/* weaponSortConfigs */.Sn)())).map(weapon => weapon.id)) != null ? _ref : [];
  }, [dbDirty, database, rarity, weaponTypeKey, deferredSearchTerm]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
    open: show,
    onClose: onClose,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
        fallback: false,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponSelectionModal["default"], {
          show: newWeaponModalShow,
          onHide: () => setnewWeaponModalShow(false),
          onSelect: newWeapon,
          weaponTypeFilter: weaponTypeKey
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
        fallback: false,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponEditor["default"], {
          weaponId: editWeaponId,
          footer: true,
          onClose: resetEditWeapon
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
        sx: {
          py: 1
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
          container: true,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            flexGrow: 1,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
              variant: "h6",
              children: [weaponTypeKey ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgIcon/* default */.Z, {
                src: Assets/* default.weaponTypes */.Z.weaponTypes[weaponTypeKey]
              }) : null, " ", t(WeaponSwapModal_t || (WeaponSwapModal_t = WeaponSwapModal_`page_character:tabEquip.swapWeapon`))]
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
              onClick: onClose
            })
          })]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
        sx: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
          container: true,
          spacing: 1,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SolidToggleButtonGroup/* default */.Z, {
              sx: {
                height: "100%"
              },
              value: rarity,
              size: "small",
              children: consts_src/* allRarities.map */.wC.map(star => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.ToggleButton, {
                value: star,
                onClick: () => setRarity(rarityHandler(rarity, star)),
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                  display: "flex",
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
                    children: star
                  }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarRounded["default"], {})]
                })
              }, star))
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            flexGrow: 1,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.TextField, {
              autoFocus: true,
              size: "small",
              value: searchTerm,
              onChange: e => setSearchTerm(e.target.value),
              label: t("page_weapon:weaponName"),
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
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
          fullWidth: true,
          onClick: () => setnewWeaponModalShow(true),
          color: "info",
          startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Add */.mm_, {}),
          children: t("page_weapon:addWeapon")
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          container: true,
          spacing: 1,
          children: weaponIdList.map(weaponId => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            xs: 6,
            sm: 6,
            md: 4,
            lg: 3,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponCard/* default */.Z, {
              weaponId: weaponId,
              onClick: clickHandler,
              extraButtons: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CompareBuildButton, {
                weaponId: weaponId
              })
            })
          }, weaponId))
        })]
      })]
    })
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOverview/EquipmentSection.tsx
let EquipmentSection_ = t => t,
  EquipmentSection_t,
  EquipmentSection_t2,
  EquipmentSection_t3,
  EquipmentSection_t4,
  EquipmentSection_t5,
  EquipmentSection_t6;































const EquipmentSection_WeaponEditor = /*#__PURE__*/(0,react.lazy)(() => Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 215878)));
function EquipmentSection() {
  var _teamData$characterKe;
  const {
    character: {
      equippedWeapon,
      key: characterKey
    },
    characterSheet
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    teamData,
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const weaponSheet = (_teamData$characterKe = teamData[characterKey]) == null ? void 0 : _teamData$characterKe.weaponSheet;
  const [weaponId, setweaponId] = (0,react.useState)("");
  const showWeapon = (0,react.useCallback)(() => setweaponId(equippedWeapon), [equippedWeapon]);
  const hideWeapon = (0,react.useCallback)(() => setweaponId(""), []);

  //triggers when character swap weapons
  (0,react.useEffect)(() => {
    if (weaponId && weaponId !== equippedWeapon) setweaponId(equippedWeapon);
  }, [weaponId, equippedWeapon]);
  const theme = (0,material_node.useTheme)();
  const breakpoint = (0,material_node.useMediaQuery)(theme.breakpoints.up('lg'));
  const weaponDoc = (0,react.useMemo)(() => weaponSheet && weaponSheet.document.length > 0 && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DocumentDisplay/* default */.Z, {
        sections: weaponSheet.document
      })
    })
  }), [weaponSheet]);
  const {
    rvFilter
  } = (0,useCharMeta/* default */.Z)(characterKey);
  const deferredRvFilter = (0,react.useDeferredValue)(rvFilter);
  const deferredRvSet = (0,react.useMemo)(() => new Set(deferredRvFilter), [deferredRvFilter]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
      fallback: false,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(EquipmentSection_WeaponEditor, {
        weaponId: weaponId,
        footer: true,
        onClose: hideWeapon,
        extraButtons: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(LargeWeaponSwapButton, {
          weaponTypeKey: characterSheet.weaponTypeKey
        })
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
      container: true,
      spacing: 1,
      children: [breakpoint && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        item: true,
        xs: 12,
        md: 12,
        lg: 3,
        xl: 3,
        sx: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        },
        children: [weaponDoc && weaponDoc, (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSectionCard, {})]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        item: true,
        xs: 12,
        md: 12,
        lg: 9,
        xl: 9,
        container: true,
        spacing: 1,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          xs: 12,
          sm: 6,
          md: 4,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponCard/* default */.Z, {
            weaponId: equippedWeapon,
            onEdit: showWeapon,
            canEquip: true,
            extraButtons: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponSwapButton, {
              weaponTypeKey: characterSheet.weaponTypeKey
            })
          })
        }), consts/* allSlotKeys.map */.eV.map(slotKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          xs: 12,
          sm: 6,
          md: 4,
          children: data.get(Formula/* uiInput.art */.ri.art[slotKey].id).value ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCard/* default */.Z, {
            artifactId: data.get(Formula/* uiInput.art */.ri.art[slotKey].id).value,
            effFilter: deferredRvSet,
            extraButtons: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSwapButton, {
              slotKey: slotKey
            }),
            editorProps: {},
            canExclude: true,
            canEquip: true
          }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtSwapCard, {
            slotKey: slotKey
          })
        }, slotKey))]
      }), !breakpoint && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        item: true,
        xs: 12,
        md: 12,
        xl: 3,
        container: true,
        spacing: 1,
        children: [weaponDoc && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          xs: 12,
          md: 6,
          lg: 4,
          children: weaponDoc
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          xs: 12,
          md: 6,
          lg: 4,
          sx: {
            display: "flex",
            flexDirection: "column",
            gap: 1
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSectionCard, {})
        })]
      })]
    })]
  });
}
function ArtSwapCard({
  slotKey
}) {
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [show, onOpen, onClose] = (0,useBoolState/* default */.Z)();
  const {
    t
  } = (0,es/* useTranslation */.$G)("artifact");
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    sx: {
      height: "100%",
      width: "100%",
      minHeight: 300,
      display: "flex",
      flexDirection: "column"
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SlotIcon/* default */.Z, {
          iconProps: SVGIcons/* iconInlineProps */.m,
          slotKey: slotKey
        }), " ", t(`slotName.${slotKey}`)]
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      sx: {
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSwapModal, {
        slotKey: slotKey,
        show: show,
        onClose: onClose,
        onChangeId: id => database.arts.set(id, {
          location: (0,consts/* charKeyToLocCharKey */.V7)(characterKey)
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        onClick: onOpen,
        color: "info",
        sx: {
          borderRadius: "1em"
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* SwapHoriz */.VNj, {
          sx: {
            height: 100,
            width: 100
          }
        })
      })]
    })]
  });
}
function WeaponSwapButton({
  weaponTypeKey
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [show, onOpen, onClose] = (0,useBoolState/* default */.Z)();
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Tooltip, {
      title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
        children: t(EquipmentSection_t || (EquipmentSection_t = EquipmentSection_`tabEquip.swapWeapon`))
      }),
      placement: "top",
      arrow: true,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        color: "info",
        size: "small",
        onClick: onOpen,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* SwapHoriz */.VNj, {})
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponSwapModal, {
      weaponTypeKey: weaponTypeKey,
      onChangeId: id => database.weapons.set(id, {
        location: (0,consts/* charKeyToLocCharKey */.V7)(characterKey)
      }),
      show: show,
      onClose: onClose
    })]
  });
}
function LargeWeaponSwapButton({
  weaponTypeKey
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [show, onOpen, onClose] = (0,useBoolState/* default */.Z)();
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
      color: "info",
      onClick: onOpen,
      startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* SwapHoriz */.VNj, {}),
      children: t(EquipmentSection_t2 || (EquipmentSection_t2 = EquipmentSection_`tabEquip.swapWeapon`))
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponSwapModal, {
      weaponTypeKey: weaponTypeKey,
      onChangeId: id => database.weapons.set(id, {
        location: (0,consts/* charKeyToLocCharKey */.V7)(characterKey)
      }),
      show: show,
      onClose: onClose
    })]
  });
}
function ArtifactSwapButton({
  slotKey
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const {
    character: {
      key: characterKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [show, onOpen, onClose] = (0,useBoolState/* default */.Z)();
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Tooltip, {
      title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
        children: t(EquipmentSection_t3 || (EquipmentSection_t3 = EquipmentSection_`tabEquip.swapArt`))
      }),
      placement: "top",
      arrow: true,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
        color: "info",
        size: "small",
        onClick: onOpen,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* SwapHoriz */.VNj, {})
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSwapModal, {
      slotKey: slotKey,
      show: show,
      onClose: onClose,
      onChangeId: id => database.arts.set(id, {
        location: (0,consts/* charKeyToLocCharKey */.V7)(characterKey)
      })
    })]
  });
}
function ArtifactSectionCard() {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["page_character", "artifact"]);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    character,
    character: {
      key: characterKey,
      equippedArtifacts
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const hasEquipped = (0,react.useMemo)(() => !!Object.values(equippedArtifacts).filter(i => i).length, [equippedArtifacts]);
  const unequipArts = (0,react.useCallback)(() => {
    if (!character) return;
    if (!window.confirm("Do you want to move all currently equipped artifacts to inventory?")) return;
    Object.values(equippedArtifacts).forEach(aid => database.arts.set(aid, {
      location: ""
    }));
  }, [character, database, equippedArtifacts]);
  const setEffects = (0,react.useMemo)(() => (0,Artifacts/* dataSetEffects */.ND)(data), [data]);
  const {
    rvFilter
  } = (0,useCharMeta/* default */.Z)(characterKey);
  const setRVFilter = (0,react.useCallback)(rvFilter => database.charMeta.set(characterKey, {
    rvFilter
  }), [database, characterKey]);
  const [show, onShow, onHide] = (0,useBoolState/* default */.Z)();
  const deferredrvFilter = (0,react.useDeferredValue)(rvFilter);
  const {
    rvField,
    rvmField
  } = (0,react.useMemo)(() => {
    const {
      currentEfficiency,
      currentEfficiency_,
      maxEfficiency,
      maxEfficiency_
    } = Object.values(equippedArtifacts).reduce((a, artid) => {
      const art = database.arts.get(artid);
      if (art) {
        const {
          currentEfficiency,
          maxEfficiency
        } = Artifact/* default.getArtifactEfficiency */.ZP.getArtifactEfficiency(art, new Set(deferredrvFilter));
        const {
          currentEfficiency: currentEfficiency_,
          maxEfficiency: maxEfficiency_
        } = Artifact/* default.getArtifactEfficiency */.ZP.getArtifactEfficiency(art, new Set(artifact/* allSubstatKeys */._));
        a.currentEfficiency = a.currentEfficiency + currentEfficiency;
        a.maxEfficiency = a.maxEfficiency + maxEfficiency;
        a.currentEfficiency_ = a.currentEfficiency_ + currentEfficiency_;
        a.maxEfficiency_ = a.maxEfficiency_ + maxEfficiency_;
      }
      return a;
    }, {
      currentEfficiency: 0,
      currentEfficiency_: 0,
      maxEfficiency: 0,
      maxEfficiency_: 0
    });
    const rvField = {
      text: t(EquipmentSection_t4 || (EquipmentSection_t4 = EquipmentSection_`artifact:editor.curSubEff`)),
      value: !(currentEfficiency - currentEfficiency_) ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PercentBadge/* default */.Z, {
        value: currentEfficiency,
        max: 4500,
        valid: true
      }) : (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PercentBadge/* default */.Z, {
          value: currentEfficiency,
          max: 4500,
          valid: true
        }), " / ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PercentBadge/* default */.Z, {
          value: currentEfficiency_,
          max: 4500,
          valid: true
        })]
      })
    };
    const rvmField = {
      text: t(EquipmentSection_t5 || (EquipmentSection_t5 = EquipmentSection_`artifact:editor.maxSubEff`)),
      canShow: () => !!(currentEfficiency_ - maxEfficiency_),
      value: !(maxEfficiency - maxEfficiency_) ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PercentBadge/* default */.Z, {
        value: maxEfficiency,
        max: 4500,
        valid: true
      }) : (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PercentBadge/* default */.Z, {
          value: maxEfficiency,
          max: 4500,
          valid: true
        }), " / ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(PercentBadge/* default */.Z, {
          value: maxEfficiency_,
          max: 4500,
          valid: true
        })]
      })
    };
    return {
      rvField,
      rvmField
    };
  }, [t, deferredrvFilter, equippedArtifacts, database]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [hasEquipped && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
      color: "error",
      onClick: unequipArts,
      fullWidth: true,
      sx: {
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0
      },
      children: t(EquipmentSection_t6 || (EquipmentSection_t6 = EquipmentSection_`tabEquip.unequipArts`))
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
        spacing: 1,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            fullWidth: true,
            color: "info",
            startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Settings */.Zrf, {}),
            sx: {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            },
            onClick: onShow,
            children: "RV Filter"
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
            open: show,
            onClose: onHide,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SubstatToggle/* default */.Z, {
                  selectedKeys: rvFilter,
                  onChange: setRVFilter
                })
              })
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(FieldDisplay/* FieldDisplayList */.lD, {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* BasicFieldDisplay */.ms, {
              field: rvField,
              component: material_node.ListItem
            }), (rvmField == null ? void 0 : rvmField.canShow == null ? void 0 : rvmField.canShow(data)) && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* BasicFieldDisplay */.ms, {
              field: rvmField,
              component: material_node.ListItem
            })]
          })]
        }), setEffects && Object.entries(setEffects).flatMap(([setKey, setNumKeyArr]) => setNumKeyArr.map(setNumKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
          sx: {
            display: "flex",
            flexDirection: "column",
            gap: 2
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SetEffectDisplay, {
            setKey: setKey,
            setNumKey: setNumKey
          }, setKey + setNumKey)
        }, setKey + setNumKey)))]
      })
    })]
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOverview/index.tsx




























function TabOverview() {
  const scrollRef = (0,react.useRef)();
  const onScroll = (0,react.useCallback)(() => {
    var _scrollRef$current;
    return scrollRef == null ? void 0 : (_scrollRef$current = scrollRef.current) == null ? void 0 : _scrollRef$current.scrollIntoView == null ? void 0 : _scrollRef$current.scrollIntoView({
      behavior: "smooth"
    });
  }, [scrollRef]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
    spacing: 1,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
      container: true,
      spacing: 1,
      sx: {
        justifyContent: "center"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        item: true,
        xs: 8,
        sm: 5,
        md: 4,
        lg: 2.3,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterProfileCard, {})
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        item: true,
        xs: 12,
        sm: 7,
        md: 8,
        lg: 9.7,
        sx: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(EquipmentRow, {
          onClick: onScroll
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
          sx: {
            flexGrow: 1,
            p: 1
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplayComponent, {})
        })]
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
      ref: scrollRef,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(EquipmentSection, {})
    })]
  });
}
function EquipmentRow({
  onClick
}) {
  const {
    character: {
      equippedWeapon
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
    container: true,
    spacing: 1,
    columns: {
      xs: 2,
      sm: 2,
      md: 3,
      lg: 6,
      xl: 6
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
      item: true,
      xs: 1,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponCardNano, {
        weaponId: equippedWeapon,
        BGComponent: CardLight/* default */.Z,
        onClick: onClick
      })
    }), consts/* allSlotKeys.map */.eV.map(slotKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
      item: true,
      xs: 1,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactCardNano, {
        artifactId: data.get(Formula/* uiInput.art */.ri.art[slotKey].id).value,
        slotKey: slotKey,
        BGComponent: CardLight/* default */.Z,
        onClick: onClick
      })
    }, slotKey))]
  });
}
/* Image card with star and name and level */
function CharacterProfileCard() {
  var _Assets$weaponTypes;
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    characterSheet,
    character: {
      key: characterKey,
      team
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const characterDispatch = (0,useCharacterReducer/* default */.Z)(characterKey);
  const navigate = (0,react_router_dom_production_min.useNavigate)();
  const charEle = data.get(Formula/* uiInput.charEle */.ri.charEle).value;
  const weaponTypeKey = characterSheet.weaponTypeKey;
  const level = data.get(Formula/* uiInput.lvl */.ri.lvl).value;
  const ascension = data.get(Formula/* uiInput.asc */.ri.asc).value;
  const constellation = data.get(Formula/* uiInput.constellation */.ri.constellation).value;
  const tlvl = {
    auto: data.get(Formula/* uiInput.total.auto */.ri.total.auto).value,
    skill: data.get(Formula/* uiInput.total.skill */.ri.total.skill).value,
    burst: data.get(Formula/* uiInput.total.burst */.ri.total.burst).value
  };
  const tBoost = {
    auto: data.get(Formula/* uiInput.bonus.auto */.ri.bonus.auto).value,
    skill: data.get(Formula/* uiInput.bonus.skill */.ri.bonus.skill).value,
    burst: data.get(Formula/* uiInput.bonus.burst */.ri.bonus.burst).value
  };
  const {
    favorite
  } = (0,useCharMeta/* default */.Z)(characterKey);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    sx: {
      height: "100%"
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      sx: {
        position: "relative"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        sx: {
          position: "absolute",
          width: "100%",
          height: "100%"
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          variant: "h6",
          sx: {
            position: "absolute",
            width: "100%",
            left: "50%",
            bottom: 0,
            transform: "translate(-50%, -50%)",
            opacity: 0.75,
            textAlign: "center"
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarDisplay/* StarsDisplay */.q, {
            stars: characterSheet.rarity,
            colored: true
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          sx: {
            position: "absolute",
            left: "50%",
            bottom: "7%",
            transform: "translate(-50%, -50%)",
            opacity: 0.85,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            px: 1
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Chip, {
            color: charEle,
            sx: {
              height: "auto"
            },
            label: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
              variant: "h6",
              sx: {
                display: "flex",
                gap: 1,
                alignItems: "center"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* ElementIcon */.Z, {
                ele: charEle
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
                sx: {
                  whiteSpace: "normal",
                  textAlign: "center"
                },
                children: characterSheet.name
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgIcon/* default */.Z, {
                src: (_Assets$weaponTypes = Assets/* default.weaponTypes */.Z.weaponTypes) == null ? void 0 : _Assets$weaponTypes[weaponTypeKey]
              })]
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          sx: {
            position: "absolute",
            left: 0,
            top: 0
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.IconButton, {
            sx: {
              p: 1
            },
            color: "error",
            onClick: () => database.charMeta.set(characterKey, {
              favorite: !favorite
            }),
            children: favorite ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Favorite */.rFe, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* FavoriteBorder */.Ieo, {})
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          sx: {
            p: 1,
            position: "absolute",
            right: 0,
            top: 0,
            opacity: 0.8
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
            children: (0,LevelData/* getLevelString */.wQ)(level, ascension)
          })
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
        src: charCard(characterKey, gender),
        component: "img",
        width: "100%",
        height: "auto"
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardActionArea, {
        sx: {
          p: 1
        },
        onClick: () => navigate("talent"),
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          container: true,
          spacing: 1,
          mt: -1,
          children: ["auto", "skill", "burst"].map(tKey => {
            var _characterSheet$getTa;
            return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
              item: true,
              xs: 4,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Badge, {
                badgeContent: tlvl[tKey],
                color: tBoost[tKey] ? "info" : "secondary",
                overlap: "circular",
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right'
                },
                sx: {
                  width: "100%",
                  height: "100%",
                  "& > .MuiBadge-badge": {
                    fontSize: "1.25em",
                    padding: ".25em .4em",
                    borderRadius: ".5em",
                    lineHeight: 1,
                    height: "1.25em"
                  }
                },
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
                  component: "img",
                  src: (_characterSheet$getTa = characterSheet.getTalentOfKey(tKey)) == null ? void 0 : _characterSheet$getTa.img,
                  width: "100%",
                  height: "auto"
                })
              })
            }, tKey);
          })
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
        sx: {
          textAlign: "center",
          mt: 1
        },
        variant: "h6",
        children: characterSheet.constellationName
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        container: true,
        spacing: 1,
        children: (0,Util/* range */.w6)(1, 6).map(i => {
          var _characterSheet$getTa2;
          return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            xs: 4,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardActionArea, {
              onClick: () => characterDispatch({
                constellation: i === constellation ? i - 1 : i
              }),
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
                component: "img",
                src: (_characterSheet$getTa2 = characterSheet.getTalentOfKey(`constellation${i}`)) == null ? void 0 : _characterSheet$getTa2.img,
                sx: Object.assign({}, constellation >= i ? {} : {
                  filter: "brightness(50%)"
                }),
                width: "100%",
                height: "auto"
              })
            })
          }, i);
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardActionArea, {
        sx: {
          p: 1
        },
        onClick: () => navigate("teambuffs"),
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          container: true,
          columns: 3,
          spacing: 1,
          children: (0,Util/* range */.w6)(0, 2).map(i => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            xs: 1,
            height: "100%",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterCardPico/* default */.Z, {
              characterKey: team[i],
              index: i
            })
          }, i))
        })
      })]
    })]
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabTalent.tsx
















const talentSpacing = {
  xs: 12,
  sm: 6,
  md: 4
};
function CharacterTalentPane() {
  const {
    character,
    characterSheet
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const characterDispatch = (0,useCharacterReducer/* default */.Z)(character.key);
  const skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]];
  const passivesList = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]];
  const ascension = data.get(Formula/* uiInput.asc */.ri.asc).value;
  const constellation = data.get(Formula/* uiInput.constellation */.ri.constellation).value;
  const theme = (0,material_node.useTheme)();
  const grlg = (0,material_node.useMediaQuery)(theme.breakpoints.up('lg'));
  const constellationCards = (0,react.useMemo)(() => (0,Util/* range */.w6)(1, 6).map(i => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SkillDisplayCard, {
    talentKey: `constellation${i}`,
    subtitle: `Constellation Lv. ${i}`,
    onClickTitle: () => characterDispatch({
      constellation: i === constellation ? i - 1 : i
    })
  })), [constellation, characterDispatch]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ReactionDisplay, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
      container: true,
      spacing: 1,
      children: [grlg && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        item: true,
        xs: 12,
        md: 12,
        lg: 3,
        sx: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
              variant: "h6",
              sx: {
                textAlign: "center"
              },
              children: ["Constellation Lv. ", constellation]
            })
          })
        }), constellationCards.map((c, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          sx: {
            opacity: constellation >= i + 1 ? 1 : 0.5
          },
          children: c
        }, i))]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        item: true,
        xs: 12,
        md: 12,
        lg: 9,
        container: true,
        spacing: 1,
        children: [skillBurstList.map(([tKey, tText]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
          item: true
        }, talentSpacing, {
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SkillDisplayCard, {
            talentKey: tKey,
            subtitle: tText
          })
        }), tKey)), !!characterSheet.getTalentOfKey("sprint") && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
          item: true
        }, talentSpacing, {
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SkillDisplayCard, {
            talentKey: "sprint",
            subtitle: "Alternative Sprint"
          })
        })), !!characterSheet.getTalentOfKey("passive") && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
          item: true
        }, talentSpacing, {
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SkillDisplayCard, {
            talentKey: "passive",
            subtitle: "Passive"
          })
        })), passivesList.map(([tKey, tText, asc]) => {
          const enabled = ascension >= asc;
          if (!characterSheet.getTalentOfKey(tKey)) return null;
          return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
            item: true,
            style: {
              opacity: enabled ? 1 : 0.5
            }
          }, talentSpacing, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SkillDisplayCard, {
              talentKey: tKey,
              subtitle: tText
            })
          }), tKey);
        })]
      }), !grlg && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        item: true,
        xs: 12,
        md: 12,
        lg: 3,
        container: true,
        spacing: 1,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          xs: 12,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Typography, {
                variant: "h6",
                sx: {
                  textAlign: "center"
                },
                children: ["Constellation Lv. ", constellation]
              })
            })
          })
        }), constellationCards.map((c, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, Object.assign({
          item: true,
          sx: {
            opacity: constellation >= i + 1 ? 1 : 0.5
          }
        }, talentSpacing, {
          children: c
        }), i))]
      })]
    })]
  });
}
function ReactionDisplay() {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const reaction = data.getDisplay().reaction;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        container: true,
        spacing: 1,
        children: Object.entries(reaction).filter(([_, node]) => !node.isEmpty).map(([key, node]) => {
          return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
                sx: {
                  p: 1,
                  "&:last-child": {
                    pb: 1
                  }
                },
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* NodeFieldDisplay */.JW, {
                  node: node
                })
              })
            })
          }, key);
        })
      })
    })
  });
}
const talentLimits = [1, 1, 2, 4, 6, 8, 10];
function SkillDisplayCard({
  talentKey,
  subtitle,
  onClickTitle
}) {
  const {
    character: {
      talent
    },
    characterSheet,
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const actionWrapeprFunc = (0,react.useCallback)(children => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardActionArea, {
    onClick: onClickTitle,
    children: children
  }), [onClickTitle]);
  const setTalentLevel = (0,react.useCallback)((tKey, newTalentLevelKey) => characterDispatch({
    talent: Object.assign({}, talent, {
      [tKey]: newTalentLevelKey
    })
  }), [talent, characterDispatch]);
  let header = null;
  if (talentKey in talent) {
    const levelBoost = data.get(Formula/* uiInput.bonus */.ri.bonus[talentKey]).value;
    const level = data.get(Formula/* uiInput.total */.ri.total[talentKey]).value;
    const asc = data.get(Formula/* uiInput.asc */.ri.asc).value;
    header = (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, {
      fullWidth: true,
      title: `Talent Lv. ${level}`,
      color: levelBoost ? "info" : "primary",
      sx: {
        borderRadius: 0
      },
      children: (0,Util/* range */.w6)(1, talentLimits[asc]).map(i => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.MenuItem, {
        selected: talent[talentKey] === i,
        disabled: talent[talentKey] === i,
        onClick: () => setTalentLevel(talentKey, i),
        children: ["Talent Lv. ", i + levelBoost]
      }, i))
    });
  }
  const talentSheet = characterSheet.getTalentOfKey(talentKey);

  // Hide header if the header matches the current talent
  const hideHeader = section => {
    var _section$header;
    const headerAction = (_section$header = section.header) == null ? void 0 : _section$header.action;
    if (headerAction && typeof headerAction !== "string") {
      const key = headerAction.props.children.props.key18;
      return key.includes(talentKey);
    }
    return false;
  };
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    sx: {
      height: "100%"
    },
    children: [header, (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ConditionalWrapper/* default */.Z, {
        condition: !!onClickTitle,
        wrapper: actionWrapeprFunc,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
          container: true,
          sx: {
            flexWrap: "nowrap"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
              component: "img",
              src: talentSheet == null ? void 0 : talentSheet.img,
              sx: {
                width: 60,
                height: "auto"
              }
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
            item: true,
            flexGrow: 1,
            sx: {
              pl: 1
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              variant: "h6",
              children: talentSheet == null ? void 0 : talentSheet.name
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              variant: "subtitle1",
              children: subtitle
            })]
          })]
        })
      }), talentSheet != null && talentSheet.sections ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DocumentDisplay/* default */.Z, {
        sections: talentSheet.sections,
        hideDesc: true,
        hideHeader: hideHeader
      }) : null]
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Components/GeneralAutocomplete.tsx
var GeneralAutocomplete = __webpack_require__(843966);
// EXTERNAL MODULE: ./src/app/Data/Resonance.tsx + 1 modules
var Resonance = __webpack_require__(243210);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabTeambuffs.tsx
let TabTeambuffs_ = t => t,
  TabTeambuffs_t;


























function TabTeambuffs() {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    alignItems: "stretch",
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
      container: true,
      spacing: 1,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        item: true,
        xs: 12,
        md: 6,
        lg: 3,
        sx: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TeamBuffDisplay, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ResonanceDisplay, {})]
      }), (0,Util/* range */.w6)(0, 2).map(i => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        item: true,
        xs: 12,
        md: 6,
        lg: 3,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TeammateDisplay, {
          index: i
        })
      }, i))]
    })
  });
}
function TeamBuffDisplay() {
  var _teamBuffs$total, _teamBuffs$premod, _teamBuffs$enemy;
  const {
    data,
    oldData
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const teamBuffs = data.getTeamBuff();
  const nodes = [];
  Object.entries((_teamBuffs$total = teamBuffs.total) != null ? _teamBuffs$total : {}).forEach(([key, node]) => !node.isEmpty && node.value !== 0 && nodes.push([["total", key], node]));
  Object.entries((_teamBuffs$premod = teamBuffs.premod) != null ? _teamBuffs$premod : {}).forEach(([key, node]) => !node.isEmpty && node.value !== 0 && nodes.push([["premod", key], node]));
  Object.entries((_teamBuffs$enemy = teamBuffs.enemy) != null ? _teamBuffs$enemy : {}).forEach(([key, node]) => !node.isEmpty && typeof node.value === "number" && node.value !== 0 && nodes.push([["enemy", key], node]));
  if (!nodes.length) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
        children: "Team Buffs"
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
        container: true,
        children: nodes.map(([path, n]) => {
          var _objPathValue;
          return n && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
            item: true,
            xs: 12,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* NodeFieldDisplay */.JW, {
              node: n,
              oldValue: (_objPathValue = (0,Util/* objPathValue */.Hm)(oldData == null ? void 0 : oldData.getTeamBuff(), path)) == null ? void 0 : _objPathValue.value
            })
          }, JSON.stringify(n.info));
        })
      })
    })]
  });
}
function ResonanceDisplay() {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    character: {
      team
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const teamCount = team.reduce((a, t) => a + (t ? 1 : 0), 1);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardHeader, {
        title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
          children: [t("tabTeambuff.team_reso"), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
              color: teamCount >= 4 ? "success" : "warning",
              children: ["(", teamCount, "/4)"]
            })
          }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(InfoTooltip/* InfoTooltipInline */.L, {
            title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              children: t(TabTeambuffs_t || (TabTeambuffs_t = TabTeambuffs_`tabTeambuff.resonance_tip`))
            })
          })]
        }),
        titleTypographyProps: {
          variant: "subtitle2"
        }
      })
    }), Resonance/* resonanceSheets.map */.J.map((res, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
      sx: {
        opacity: res.canShow(data) ? 1 : 0.5
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardHeader, {
        title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
          children: [res.name, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(InfoTooltip/* InfoTooltipInline */.L, {
            title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
              children: res.desc
            })
          })]
        }),
        action: res.icon,
        titleTypographyProps: {
          variant: "subtitle2"
        }
      }), res.canShow(data) && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), res.canShow(data) && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardContent, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DocumentDisplay/* default */.Z, {
          sections: res.sections,
          teamBuffOnly: true,
          hideDesc: true
        })
      })]
    }, i))]
  });
}
function TeammateDisplay({
  index
}) {
  const {
    teamData
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const {
    character: active,
    character: {
      key: activeCharacterKey
    },
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const teamMateKey = active.team[index];
  const team = (0,react.useMemo)(() => [activeCharacterKey, ...active.team].filter((t, i) => i - 1 !== index), [active.team, activeCharacterKey, index]);
  const onClickHandler = (0,useCharSelectionCallback/* default */.Z)();
  const setTeammate = (0,react.useCallback)(charKey => characterDispatch({
    type: "team",
    index,
    charKey
  }), [index, characterDispatch]);
  const dataBundle = teamData[teamMateKey];
  const teammateCharacterContext = (0,react.useMemo)(() => {
    var _active$teamCondition;
    return dataBundle && {
      character: Object.assign({}, dataBundle.character, {
        conditional: (_active$teamCondition = active.teamConditional[teamMateKey]) != null ? _active$teamCondition : {}
      }),
      characterSheet: dataBundle.characterSheet,
      characterDispatch: state => {
        if (!teamMateKey) return;
        if (!("conditional" in state)) return;
        const {
          conditional
        } = state;
        if (!conditional) return;
        characterDispatch({
          type: "teamConditional",
          teamMateKey: teamMateKey,
          conditional
        });
      }
    };
  }, [active, teamMateKey, dataBundle, characterDispatch]);
  const teamMateDataContext = (0,react.useMemo)(() => dataBundle && {
    data: dataBundle.target,
    teamData: teamData
  }, [dataBundle, teamData]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    sx: {
      overflow: "visible"
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TeammateAutocomplete, {
      characterKey: teamMateKey,
      team: team,
      setChar: setTeammate,
      label: t("teammate", {
        count: index + 1
      })
    }), teamMateKey && teammateCharacterContext && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterContext/* CharacterContext.Provider */.K.Provider, {
      value: teammateCharacterContext,
      children: teamMateDataContext && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
        value: teamMateDataContext,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterCard/* default */.Z, {
          characterKey: teamMateKey,
          onClickHeader: onClickHandler
          // Need to wrap these elements with the providers for them to use the correct functions.
          ,
          artifactChildren: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterContext/* CharacterContext.Provider */.K.Provider, {
            value: teammateCharacterContext,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
              value: teamMateDataContext,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharArtifactCondDisplay, {})
            })
          }),
          weaponChildren: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterContext/* CharacterContext.Provider */.K.Provider, {
            value: teammateCharacterContext,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
              value: teamMateDataContext,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharWeaponCondDisplay, {})
            })
          }),
          characterChildren: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterContext/* CharacterContext.Provider */.K.Provider, {
            value: teammateCharacterContext,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
              value: teamMateDataContext,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharTalentCondDisplay, {})
            })
          }),
          isTeammateCard: true
        })
      })
    })]
  });
}
function CharArtifactCondDisplay() {
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const sections = (0,react.useMemo)(() => Object.entries((0,Artifacts/* dataSetEffects */.ND)(data)).flatMap(([setKey, setNums]) => setNums.flatMap(sn => {
    var _getArtSheet$setEffec;
    return (_getArtSheet$setEffec = (0,Artifacts/* getArtSheet */.Sk)(setKey).setEffectDocument(sn)) != null ? _getArtSheet$setEffec : [];
  })), [data]);
  if (!sections) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DocumentDisplay/* default */.Z, {
    sections: sections,
    teamBuffOnly: true
  });
}
function CharWeaponCondDisplay() {
  const {
    character: {
      key: charKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    teamData
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const weaponSheet = teamData[charKey].weaponSheet;
  if (!weaponSheet.document) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DocumentDisplay/* default */.Z, {
    sections: weaponSheet.document,
    teamBuffOnly: true
  });
}
function CharTalentCondDisplay() {
  const {
    character: {
      key: charKey
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    teamData
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const characterSheet = teamData[charKey].characterSheet;
  const sections = Object.values(characterSheet.talent).flatMap(sts => sts.sections);
  if (!sections) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DocumentDisplay/* default */.Z, {
    sections: sections,
    teamBuffOnly: true
  });
}
function TeammateAutocomplete({
  characterKey,
  team,
  label,
  setChar,
  autoCompleteProps = {}
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["charNames_gen", "page_character", "sheet_gen"]);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const toText = (0,react.useCallback)(key => {
    var _getCharSheet;
    return key.startsWith("Traveler") ? `${t(`charNames_gen:${(0,consts/* charKeyToCharName */.LP)(key, gender)}`)} (${t(`sheet_gen:element.${(_getCharSheet = (0,Characters/* getCharSheet */.m)(key, gender)) == null ? void 0 : _getCharSheet.elementKey}`)})` : t(`charNames_gen:${key}`);
  }, [t, gender]);
  const toImg = (0,react.useCallback)(key => key ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ThumbSide/* default */.Z, {
    src: (0,src/* characterAsset */.Li)(key, "iconSide", gender),
    sx: {
      pr: 1
    }
  }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* PersonAdd */.qjs, {}), [gender]); //
  const isFavorite = (0,react.useCallback)(key => database.charMeta.get(key).favorite, [database]);
  const onDisable = (0,react.useCallback)(({
    key
  }) => team.filter(t => t && t !== characterKey).includes(key) || key.startsWith("Traveler") && team.some((t, i) => t.startsWith("Traveler")), [team, characterKey]);
  const values = (0,react.useMemo)(() => database.chars.keys.map(v => ({
    key: v,
    label: toText(v),
    favorite: isFavorite(v)
  })).sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return a.label.localeCompare(b.label);
  }), [toText, isFavorite, database]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
    fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
      variant: "text",
      width: 100
    }),
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GeneralAutocomplete/* GeneralAutocomplete */._, Object.assign({
      size: "small",
      label: label,
      options: values,
      valueKey: characterKey,
      onChange: k => setChar(k != null ? k : ""),
      getOptionDisabled: onDisable,
      toImg: toImg
    }, autoCompleteProps))
  });
}
// EXTERNAL MODULE: ./src/app/Components/Artifact/ArtifactSetAutocomplete.tsx
var ArtifactSetAutocomplete = __webpack_require__(617206);
// EXTERNAL MODULE: ./src/app/Components/RefinementDropdown.tsx
var RefinementDropdown = __webpack_require__(414520);
// EXTERNAL MODULE: ./src/app/Database/DataManagers/CharacterTCData.ts
var CharacterTCData = __webpack_require__(269278);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabTheorycraft/useCharTC.tsx


function useCharTC(characterKey, defWeapon) {
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const [charTC, setCharTC] = (0,react.useState)(() => database.charTCs.getWithInit(characterKey, defWeapon));
  (0,react.useEffect)(() => setCharTC(database.charTCs.getWithInit(characterKey, defWeapon)), [database, characterKey, defWeapon]);
  (0,react.useEffect)(() => characterKey ? database.charTCs.follow(characterKey, (k, r, v) => r === "update" && setCharTC(v)) : undefined, [characterKey, setCharTC, database]);
  return charTC;
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabTheorycraft/index.tsx

let TabTheorycraft_2 = t => t,
  TabTheorycraft_t;
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
















































const TabTheorycraft_WeaponSelectionModal = /*#__PURE__*/react.lazy(() => Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 489431)));
function TabTheorycraft() {
  var _ref, _teamData$characterKe;
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    data: oldData
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const {
    character,
    character: {
      key: characterKey,
      compareData
    },
    characterSheet,
    characterDispatch
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const data = useCharTC(characterKey, (0,WeaponUtil/* defaultInitialWeaponKey */.mT)(characterSheet.weaponTypeKey));
  const setData = (0,react.useCallback)(data => database.charTCs.set(characterKey, data), [characterKey, database]);
  const resetData = (0,react.useCallback)(() => {
    setData((0,CharacterTCData/* initCharTC */.O)((0,WeaponUtil/* defaultInitialWeaponKey */.mT)(characterSheet.weaponTypeKey)));
  }, [setData, characterSheet]);
  const setWeapon = (0,react.useCallback)(action => {
    setData(Object.assign({}, data, {
      weapon: Object.assign({}, data.weapon, action)
    }));
  }, [setData, data]);
  const copyFrom = (0,react.useCallback)((eWeapon, build) => {
    const newData = (0,CharacterTCData/* initCharTC */.O)(eWeapon.key);
    newData.artifact.substats.type = data.artifact.substats.type;
    newData.weapon.level = eWeapon.level;
    newData.weapon.ascension = eWeapon.ascension;
    newData.weapon.refinement = eWeapon.refinement;
    const sets = {};
    build.forEach(art => {
      var _sets$setKey;
      if (!art) return;
      const {
        slotKey,
        setKey,
        substats,
        mainStatKey,
        level,
        rarity
      } = art;
      newData.artifact.slots[slotKey].level = level;
      newData.artifact.slots[slotKey].statKey = mainStatKey;
      newData.artifact.slots[slotKey].rarity = rarity;
      sets[setKey] = ((_sets$setKey = sets[setKey]) != null ? _sets$setKey : 0) + 1;
      substats.forEach(substat => {
        var _newData$artifact$sub;
        if (substat.key) newData.artifact.substats.stats[substat.key] = ((_newData$artifact$sub = newData.artifact.substats.stats[substat.key]) != null ? _newData$artifact$sub : 0) + substat.accurateValue;
      });
    });
    newData.artifact.sets = Object.fromEntries(Object.entries(sets).map(([key, value]) => [key, value === 3 ? 2 : value === 5 ? 4 : value === 1 && !key.startsWith("PrayersFor") ? 0 : value]).filter(([key, value]) => value));
    setData(newData);
  }, [data, setData]);
  const location = (0,react_router_dom_production_min.useLocation)();
  const {
    build: locBuild
  } = (_ref = location.state) != null ? _ref : {
    build: undefined
  };
  (0,react.useEffect)(() => {
    if (!locBuild) return;
    const eWeapon = database.weapons.get(character.equippedWeapon);
    copyFrom(eWeapon, locBuild.map(i => database.arts.get(i)));
    // WARNING: if copyFrom is included, it will cause a render loop due to its setData <---> data
    // eslint-disable-next-line
  }, [locBuild, database]);
  const copyFromEquipped = (0,react.useCallback)(() => {
    const eWeapon = database.weapons.get(character.equippedWeapon);
    copyFrom(eWeapon, Object.values(character.equippedArtifacts).map(a => database.arts.get(a)).filter(a => a));
  }, [database, character.equippedArtifacts, character.equippedWeapon, copyFrom]);
  const weapon = (0,react.useMemo)(() => {
    return Object.assign({}, data.weapon, {
      location: "",
      lock: false,
      id: ""
    });
  }, [data]);
  const setArtifact = (0,react.useCallback)(artifact => {
    const data_ = (0,Util/* deepClone */.I8)(data);
    data_.artifact = artifact;
    setData(data_);
  }, [data, setData]);
  const setSubstatsType = (0,react.useCallback)(t => {
    const data_ = (0,Util/* deepClone */.I8)(data);
    data_.artifact.substats.type = t;
    setData(data_);
  }, [data, setData]);
  const setSubstats = (0,react.useCallback)(setSubstats => {
    const data_ = (0,Util/* deepClone */.I8)(data);
    data_.artifact.substats.stats = setSubstats;
    setData(data_);
  }, [data, setData]);
  const deferredData = (0,react.useDeferredValue)(data);
  const overriderArtData = (0,react.useMemo)(() => {
    const stats = Object.assign({}, deferredData.artifact.substats.stats);
    Object.values(deferredData.artifact.slots).forEach(({
      statKey,
      rarity,
      level
    }) => {
      var _stats$statKey;
      return stats[statKey] = ((_stats$statKey = stats[statKey]) != null ? _stats$statKey : 0) + Artifact/* default.mainStatValue */.ZP.mainStatValue(statKey, rarity, level);
    });
    return {
      art: (0,Util/* objectMap */.xh)(stats, (v, k) => k.endsWith("_") ? (0,utils/* percent */.aQ)(v / 100) : (0,utils/* constant */.a9)(v)),
      artSet: (0,Util/* objectMap */.xh)(deferredData.artifact.sets, v => (0,utils/* constant */.a9)(v))
    };
  }, [deferredData]);
  const overrideWeapon = (0,react.useMemo)(() => ({
    id: "",
    location: "",
    key: data.weapon.key,
    level: data.weapon.level,
    ascension: data.weapon.ascension,
    refinement: data.weapon.refinement,
    lock: false
  }), [data]);
  const teamData = (0,useTeamData/* default */.Z)(characterKey, 0, overriderArtData, overrideWeapon);
  const {
    target: charUIData
  } = (_teamData$characterKe = teamData == null ? void 0 : teamData[characterKey]) != null ? _teamData$characterKe : {};
  const dataContextValue = (0,react.useMemo)(() => {
    if (!teamData || !charUIData) return undefined;
    return {
      data: charUIData,
      teamData
    };
  }, [charUIData, teamData]);
  const dataContextValueWithOld = (0,react.useMemo)(() => {
    if (!dataContextValue) return undefined;
    return Object.assign({}, dataContextValue, {
      oldData: compareData ? oldData : undefined
    });
  }, [dataContextValue, compareData, oldData]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
    spacing: 1,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        sx: {
          display: "flex",
          gap: 1,
          p: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          sx: {
            flexGrow: 1,
            display: "flex",
            gap: 1
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            color: "info",
            onClick: copyFromEquipped,
            startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CopyAll */.Gd6, {}),
            children: "Copy from equipped"
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            color: "error",
            onClick: resetData,
            startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Refresh */.hYj, {}),
            children: "Reset"
          })]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SolidToggleButtonGroup/* default */.Z, {
          exclusive: true,
          value: compareData,
          onChange: (e, v) => characterDispatch({
            compareData: v
          }),
          size: "small",
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.ToggleButton, {
            value: false,
            disabled: !compareData,
            children: "Show TC stats"
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.ToggleButton, {
            value: true,
            disabled: compareData,
            children: "Compare vs. equipped"
          })]
        })]
      })
    }), dataContextValue ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
      value: dataContextValue,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
        container: true,
        spacing: 1,
        sx: {
          justifyContent: "center"
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Grid, {
          item: true,
          sx: {
            flexGrow: -1
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WeaponEditorCard, {
            weapon: weapon,
            setWeapon: setWeapon,
            weaponTypeKey: characterSheet.weaponTypeKey
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactMainLevelCard, {
            artifactData: data.artifact,
            setArtifactData: setArtifact
          })]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Grid, {
          item: true,
          sx: {
            flexGrow: 1
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSubCard, {
            substats: data.artifact.substats.stats,
            setSubstats: setSubstats,
            substatsType: data.artifact.substats.type,
            setSubstatsType: setSubstatsType,
            mainStatKeys: Object.values(data.artifact.slots).map(s => s.statKey)
          })
        })]
      })
    }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
      variant: "rectangular",
      width: "100%",
      height: 500
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
      sx: {
        flexGrow: 1,
        p: 1
      },
      children: dataContextValueWithOld ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
        value: dataContextValueWithOld,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplayComponent, {})
      }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
        variant: "rectangular",
        width: "100%",
        height: 500
      })
    })]
  });
}
function WeaponEditorCard({
  weapon,
  setWeapon,
  weaponTypeKey
}) {
  const {
    key,
    level = 0,
    refinement = 1,
    ascension = 0
  } = weapon;
  const weaponSheet = (0,Weapons/* getWeaponSheet */.ub)(key);
  const [show, onShow, onHide] = (0,useBoolState/* default */.Z)();
  const {
    data
  } = (0,react.useContext)(DataContext/* DataContext */.R);
  const weaponUIData = (0,react.useMemo)(() => weapon && (0,api/* computeUIData */.mP)([weaponSheet.data, (0,api/* dataObjForWeapon */.v0)(weapon)]), [weaponSheet, weapon]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    sx: {
      p: 1,
      mb: 1
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TabTheorycraft_WeaponSelectionModal, {
      ascension: ascension,
      show: show,
      onHide: onHide,
      onSelect: k => setWeapon({
        key: k
      }),
      weaponTypeFilter: weaponTypeKey
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        display: "flex",
        gap: 1,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          className: `grad-${weaponSheet.rarity}star`,
          component: "img",
          src: (0,src/* weaponAsset */.Aq)(weapon.key, ascension >= 2),
          sx: {
            flexshrink: 1,
            flexBasis: 0,
            maxWidth: "30%",
            borderRadius: 1
          }
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
          spacing: 1,
          flexGrow: 1,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
            fullWidth: true,
            color: "info",
            sx: {
              flexGrow: 1
            },
            onClick: onShow,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
              sx: {
                maxWidth: "10em"
              },
              children: weaponSheet == null ? void 0 : weaponSheet.name
            })
          }), weaponSheet.hasRefinement && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(RefinementDropdown/* default */.Z, {
            refinement: refinement,
            setRefinement: r => setWeapon({
              refinement: r
            })
          })]
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(LevelSelect/* default */.Z, {
        level: level,
        ascension: ascension,
        setBoth: setWeapon,
        useLow: !weaponSheet.hasRefinement
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.CardHeader, {
          title: "Main Stats",
          titleTypographyProps: {
            variant: "subtitle2"
          }
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Divider, {}), weaponUIData && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* FieldDisplayList */.lD, {
          children: [Formula/* uiInput.weapon.main */.ri.weapon.main, Formula/* uiInput.weapon.sub */.ri.weapon.sub, Formula/* uiInput.weapon.sub2 */.ri.weapon.sub2].map((node, i) => {
            const n = weaponUIData.get(node);
            if (n.isEmpty || !n.value) return null;
            return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FieldDisplay/* NodeFieldDisplay */.JW, {
              node: n,
              component: material_node.ListItem
            }, JSON.stringify(n.info));
          })
        })]
      }), data && (weaponSheet == null ? void 0 : weaponSheet.document) && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DocumentDisplay/* default */.Z, {
        sections: weaponSheet.document
      })]
    })]
  });
}
function ArtifactMainLevelCard({
  artifactData,
  setArtifactData
}) {
  const setSlot = (0,react.useCallback)(slotKey => slot => {
    const artifactData_ = (0,Util/* deepClone */.I8)(artifactData);
    artifactData_.slots[slotKey] = slot;
    setArtifactData(artifactData_);
  }, [artifactData, setArtifactData]);
  const setArtSet = (0,react.useCallback)(artSet => {
    const artifactData_ = (0,Util/* deepClone */.I8)(artifactData);
    artifactData_.sets = artSet;
    setArtifactData(artifactData_);
  }, [artifactData, setArtifactData]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
    spacing: 1,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
      sx: {
        p: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Stack, {
        spacing: 1,
        children: consts_src/* allSlotKeys.map */.eV.map(s => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactMainLevelSlot, {
          slotKey: s,
          slot: artifactData.slots[s],
          setSlot: setSlot(s)
        }, s))
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
      fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
        variant: "rectangular",
        width: "100%",
        height: 200
      }),
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetsEditor, {
        artSet: artifactData.sets,
        setArtSet: setArtSet
      })
    })]
  });
}
function ArtifactMainLevelSlot({
  slotKey,
  slot,
  setSlot: setSlotProp
}) {
  var _KeyMap$getVariant;
  const {
    level,
    statKey,
    rarity
  } = slot;
  const keys = Artifact/* default.slotMainStats */.ZP.slotMainStats(slotKey);
  const setSlot = (0,react.useCallback)(action => {
    setSlotProp(Object.assign({}, slot, action));
  }, [slot, setSlotProp]);
  const setRarity = (0,react.useCallback)(r => {
    var _maxArtifactLevel$r;
    const mLvl = (_maxArtifactLevel$r = Artifact/* maxArtifactLevel */.P4[r]) != null ? _maxArtifactLevel$r : 0;
    if (level > mLvl) setSlot({
      rarity: r,
      level: mLvl
    });else setSlot({
      rarity: r
    });
  }, [level, setSlot]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
    display: "flex",
    gap: 1,
    justifyContent: "space-between",
    alignItems: "center",
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SlotIcon/* default */.Z, {
      slotKey: slotKey
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
      sx: {
        height: "100%",
        minWidth: "5em",
        flexGrow: 1,
        display: "flex"
      },
      children: keys.length === 1 ? (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        p: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        display: "flex",
        gap: 1,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* default */.C, {
          statKey: keys[0],
          iconProps: SVGIcons/* iconInlineProps */.m
        }), " ", KeyMap/* default.getStr */.ZP.getStr(keys[0])]
      }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, {
        sx: {
          px: 0
        },
        fullWidth: true,
        title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplay/* StatWithUnit */.x, {
          statKey: statKey
        }),
        color: (_KeyMap$getVariant = KeyMap/* default.getVariant */.ZP.getVariant(statKey)) != null ? _KeyMap$getVariant : "success",
        children: keys.map(msk => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.MenuItem, {
          disabled: statKey === msk,
          onClick: () => setSlot({
            statKey: msk
          }),
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatDisplay/* StatColoredWithUnit */._, {
            statKey: msk
          })
        }, msk))
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, {
      sx: {
        px: 0
      },
      title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
        sx: {
          display: "flex",
          alignItems: "center"
        },
        children: [rarity, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarRounded["default"], {
          fontSize: "inherit"
        })]
      }),
      children: [5, 4, 3].map(r => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.MenuItem, {
        disabled: rarity === r,
        onClick: () => setRarity(r),
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          sx: {
            display: "flex",
            alignItems: "center"
          },
          children: [r, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarRounded["default"], {
            fontSize: "inherit"
          })]
        })
      }, r))
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
      startAdornment: "+",
      value: level,
      color: Artifact/* default.levelVariant */.ZP.levelVariant(level),
      onChange: l => l !== undefined && setSlot({
        level: l
      }),
      sx: {
        borderRadius: 1,
        pl: 1,
        my: 0,
        height: "100%"
      },
      inputProps: {
        sx: {
          pl: 0.5,
          width: "2em"
        },
        max: 20,
        min: 0
      }
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
      sx: {
        height: "100%",
        minWidth: "4em"
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
        p: 1,
        textAlign: "center",
        children: `${(0,KeyMap/* cacheValueString */.qs)(Artifact/* default.mainStatValue */.ZP.mainStatValue(statKey, rarity, level), KeyMap/* default.unit */.ZP.unit(statKey))}${KeyMap/* default.unit */.ZP.unit(statKey)}`
      })
    })]
  });
}
function ArtifactSetsEditor({
  artSet,
  setArtSet
}) {
  const setSet = (0,react.useCallback)(setKey => {
    if (!setKey) return;
    setArtSet(Object.assign({}, artSet, {
      [setKey]: parseInt(Object.keys((0,Artifacts/* getArtSheet */.Sk)(setKey).setEffects)[0])
    }));
  }, [artSet, setArtSet]);
  const setValue = (0,react.useCallback)(setKey => value => setArtSet(Object.assign({}, artSet, {
    [setKey]: value
  })), [artSet, setArtSet]);
  const deleteValue = (0,react.useCallback)(setKey => () => {
    const rest = (0,objectWithoutPropertiesLoose/* default */.Z)(artSet, [setKey].map(_toPropertyKey));
    setArtSet(Object.assign({}, rest));
  }, [artSet, setArtSet]);
  const remaining = 5 - Object.values(artSet).reduce((a, b) => a + b, 0);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
    spacing: 1,
    sx: {
      flexGrow: 1
    },
    children: [Object.entries(artSet).map(([setKey, value]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetEditor, {
      setKey: setKey,
      value: value,
      setValue: setValue(setKey),
      deleteValue: deleteValue(setKey),
      remaining: remaining
    }, setKey)), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
      sx: {
        flexGrow: 1,
        overflow: "visible"
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetAutocomplete/* default */.Z, {
        disableClearable: true,
        artSetKey: "",
        setArtSetKey: setSet,
        label: "New Artifact Set",
        getOptionDisabled: ({
          key
        }) => Object.keys(artSet).includes(key) || !key || Object.keys((0,Artifacts/* getArtSheet */.Sk)(key).setEffects).every(n => parseInt(n) > remaining)
      })
    })]
  });
}
function ArtifactSetEditor({
  setKey,
  value,
  setValue,
  deleteValue,
  remaining
}) {
  const artifactSheet = (0,Artifacts/* getArtSheet */.Sk)(setKey);

  /* Assumes that all conditionals are from 4-Set. needs to change if there are 2-Set conditionals */
  const set4CondNums = (0,react.useMemo)(() => {
    if (value < 4) return [];
    return Object.keys(artifactSheet.setEffects).filter(setNumKey => {
      var _artifactSheet$setEff;
      return (_artifactSheet$setEff = artifactSheet.setEffects[setNumKey]) == null ? void 0 : _artifactSheet$setEff.document.some(doc => "states" in doc);
    });
  }, [artifactSheet, value]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      display: "flex",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetTooltip/* default */.Z, {
        artifactSheet: artifactSheet,
        numInSet: value,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          flexGrow: 1,
          p: 1,
          display: "flex",
          gap: 1,
          alignItems: "center",
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgIcon/* default */.Z, {
            size: 2,
            sx: {
              m: -1
            },
            src: (0,ArtifactSheet/* artifactDefIcon */.jU)(setKey)
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
            children: artifactSheet.setName
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Info */.kIV, {})]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.ButtonGroup, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, {
          size: "small",
          title: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
            whiteSpace: "nowrap",
            children: [value, "-set"]
          }),
          children: Object.keys(artifactSheet.setEffects).map(setKey => parseInt(setKey)).map(setKey => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.MenuItem, {
            disabled: value === setKey || setKey > remaining + value,
            onClick: () => setValue(setKey),
            children: [setKey, "-set"]
          }, setKey))
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Button, {
          color: "error",
          size: "small",
          onClick: deleteValue,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* DeleteForever */.Gnd, {})
        })]
      })]
    }), !!set4CondNums.length && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Stack, {
      spacing: 1,
      sx: {
        p: 1
      },
      children: set4CondNums.map(setNumKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SetEffectDisplay, {
        setKey: setKey,
        setNumKey: parseInt(setNumKey),
        hideHeader: true,
        conditionalsOnly: true
      }, setNumKey))
    })]
  });
}
function ArtifactSubCard({
  substats,
  setSubstats,
  substatsType,
  setSubstatsType,
  mainStatKeys
}) {
  const setValue = (0,react.useCallback)(key => v => setSubstats(Object.assign({}, substats, {
    [key]: v
  })), [substats, setSubstats]);
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const rv = Object.entries(substats).reduce((t, [k, v]) => t + v / Artifact/* default.substatValue */.ZP.substatValue(k), 0) * 100;
  const rolls = Object.entries(substats).reduce((t, [k, v]) => t + v / Artifact/* default.substatValue */.ZP.substatValue(k, undefined, substatsType), 0);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    sx: {
      p: 1,
      height: "100%"
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      sx: {
        mb: 1,
        display: "flex",
        gap: 1
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, {
        fullWidth: true,
        title: t(`tabTheorycraft.substatType.${substatsType}`),
        children: consts/* substatType.map */.Q7.map(st => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.MenuItem, {
          disabled: substatsType === st,
          onClick: () => setSubstatsType(st),
          children: t(`tabTheorycraft.substatType.${st}`)
        }, st))
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
        title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          children: t(TabTheorycraft_t || (TabTheorycraft_t = TabTheorycraft_2`tabTheorycraft.maxTotalRolls`))
        }),
        placement: "top",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
          sx: {
            textAlign: "center",
            py: 0.5,
            px: 1,
            minWidth: "15em",
            whiteSpace: "nowrap",
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            alignItems: "center"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
            color: rolls > 45 ? "warning" : undefined,
            children: ["Rolls: ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
              children: rolls.toFixed(0)
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
            color: rolls > 45 ? "warning" : undefined,
            children: ["RV: ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
              children: [rv.toFixed(1), "%"]
            })]
          })]
        })
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Stack, {
      spacing: 1,
      children: Object.entries(substats).map(([k, v]) => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSubstatEditor, {
        statKey: k,
        value: v,
        setValue: setValue(k),
        substatsType: substatsType,
        mainStatKeys: mainStatKeys
      }, k))
    })]
  });
}
function ArtifactSubstatEditor({
  statKey,
  value,
  setValue,
  substatsType,
  mainStatKeys
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const substatValue = Artifact/* default.substatValue */.ZP.substatValue(statKey, 5, substatsType);
  const [rolls, setRolls] = (0,react.useState)(() => value / substatValue);
  (0,react.useEffect)(() => setRolls(value / substatValue), [value, substatValue]);
  const unit = KeyMap/* default.unit */.ZP.unit(statKey);
  const displayValue = rolls * substatValue;
  const rv = rolls * substatValue / Artifact/* default.substatValue */.ZP.substatValue(statKey) * 100;
  const numMains = mainStatKeys.reduce((t, ms) => t + (ms === statKey ? 1 : 0), 0);
  const maxRolls = (5 - numMains) * 6;
  // 0.0001 to nudge float comparasion
  const invalid = rolls - 0.0001 > maxRolls;
  const setRValue = (0,react.useCallback)(r => setValue(r * substatValue), [setValue, substatValue]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Stack, {
    spacing: 0.5,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      display: "flex",
      gap: 1,
      justifyContent: "space-between",
      alignItems: "center",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
        sx: {
          p: 0.5,
          minWidth: "11em",
          flexGrow: 1,
          display: "flex",
          gap: 1,
          alignItems: "center",
          justifyContent: "center"
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* default */.C, {
          statKey: statKey,
          iconProps: {
            fontSize: "inherit"
          }
        }), KeyMap/* default.getStr */.ZP.getStr(statKey), KeyMap/* default.unit */.ZP.unit(statKey)]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
        title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Typography, {
          children: t(numMains ? `tabTheorycraft.maxRollsMain` : `tabTheorycraft.maxRolls`, {
            value: maxRolls
          })
        }),
        placement: "top",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
          sx: {
            textAlign: "center",
            p: 0.5,
            minWidth: "8em"
          },
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(ColoredText/* default */.Z, {
            color: invalid ? "warning" : undefined,
            children: ["RV: ", (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
              children: [rv.toFixed(1), "%"]
            })]
          })
        })
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
      display: "flex",
      gap: 1,
      justifyContent: "space-between",
      alignItems: "center",
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
        color: displayValue ? "success" : "primary",
        float: KeyMap/* default.unit */.ZP.unit(statKey) === "%",
        endAdornment: KeyMap/* default.unit */.ZP.unit(statKey) || (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
          width: "1em",
          component: "span"
        }),
        value: parseFloat(displayValue.toFixed(2)),
        onChange: v => v !== undefined && setValue(v),
        sx: {
          borderRadius: 1,
          px: 1,
          height: "100%",
          width: "6em"
        },
        inputProps: {
          sx: {
            textAlign: "right"
          },
          min: 0
        }
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
        sx: {
          px: 2,
          flexGrow: 1,
          display: "flex",
          gap: 1,
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible"
        },
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Slider, {
          size: "small",
          value: rolls,
          max: maxRolls,
          min: 0,
          step: 1,
          marks: true,
          valueLabelDisplay: "auto",
          onChange: (e, v) => setRolls(v),
          onChangeCommitted: (e, v) => setRValue(v)
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
        color: value ? invalid ? "warning" : "success" : "primary",
        float: true,
        startAdornment: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
          sx: {
            whiteSpace: "nowrap",
            width: "7em",
            display: "flex",
            justifyContent: "space-between"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
            children: [(0,KeyMap/* cacheValueString */.qs)(substatValue, unit), unit]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
            children: "x"
          })]
        }),
        value: parseFloat(rolls.toFixed(2)),
        onChange: v => v !== undefined && setValue(v * substatValue),
        sx: {
          borderRadius: 1,
          px: 1,
          my: 0,
          height: "100%",
          width: "7em"
        },
        inputProps: {
          sx: {
            textAlign: "right",
            pr: 0.5
          },
          min: 0,
          step: 1
        }
      })]
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Data/SheetUtil.tsx
var SheetUtil = __webpack_require__(162173);
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/TravelerElementSelect.tsx









function TravelerElementSelect() {
  const {
    character
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    key
  } = character;
  const setCharacter = (0,useCharSelectionCallback/* default */.Z)();
  if (!key.startsWith("Traveler")) return null;
  const elementKey = consts/* allElements.find */.N.find(e => key.toLowerCase().includes(e));
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, {
    color: elementKey,
    title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
      children: (0,SheetUtil/* stg */.el)(`element.${elementKey}`)
    }),
    children: consts/* travelerElements.map */.DZ.map(eleKey => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.MenuItem, {
      selected: elementKey === eleKey,
      disabled: elementKey === eleKey,
      onClick: () => setCharacter((0,consts/* TravelerToElement */.rq)(key, eleKey)),
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ColoredText/* default */.Z, {
          color: eleKey,
          children: (0,SheetUtil/* stg */.el)(`element.${eleKey}`)
        })
      })
    }, eleKey))
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/TravelerGenderSelect.tsx









function TravelerGenderSelect() {
  const {
    t
  } = (0,es/* useTranslation */.$G)("ui");
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    character
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const {
    key
  } = character;
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const toggleGender = (0,react.useCallback)(() => database.dbMeta.set({
    gender: gender === "F" ? "M" : "F"
  }), [gender, database]);
  if (!key.startsWith("Traveler")) return null;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Button, {
    onClick: toggleGender,
    startIcon: gender === "F" ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Female */._u1, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Male */.HCl, {}),
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
      children: t(`gender.${gender}`)
    }), "  "]
  });
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/index.tsx
let CharacterDisplay_ = t => t,
  CharacterDisplay_t;






































function CharacterDisplay() {
  const navigate = (0,react_router_dom_production_min.useNavigate)();
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const onClose = (0,react.useCallback)(() => navigate("/characters"), [navigate]);
  const {
    characterKey
  } = (0,react_router_dom_production_min.useParams)();
  const invalidKey = !database.chars.keys.includes(characterKey);
  if (invalidKey) return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react_router_dom_production_min.Navigate, {
    to: "/characters"
  });
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Box, {
    my: 1,
    display: "flex",
    flexDirection: "column",
    gap: 1,
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
      fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
        variant: "rectangular",
        width: "100%",
        height: 1000
      }),
      children: characterKey && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterDisplayCard, {
        characterKey: characterKey,
        onClose: onClose
      })
    })
  });
}
function CharacterDisplayCard({
  characterKey,
  onClose
}) {
  var _teamData$characterKe, _useMatch, _character$key;
  const character = (0,useCharacter/* default */.Z)(characterKey);
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const characterSheet = (0,Characters/* getCharSheet */.m)(characterKey, gender);
  const teamData = (0,useTeamData/* default */.Z)(characterKey);
  const {
    target: charUIData
  } = (_teamData$characterKe = teamData == null ? void 0 : teamData[characterKey]) != null ? _teamData$characterKe : {};
  const {
    params: {
      tab = "overview"
    }
  } = (_useMatch = (0,react_router_dom_production_min.useMatch)({
    path: "/characters/:charKey/:tab",
    end: false
  })) != null ? _useMatch : {
    params: {
      tab: "overview"
    }
  };
  const {
    t
  } = (0,es/* useTranslation */.$G)(["charNames_gen", "page_character"]);
  (0,useTitle/* default */.Z)((0,react.useMemo)(() => `${t(`charNames_gen:${(0,consts/* charKeyToCharName */.LP)(characterKey, gender)}`)} - ${t(`page_character:tabs.${tab}`)}`, [t, characterKey, gender, tab]));
  const characterDispatch = (0,useCharacterReducer/* default */.Z)((_character$key = character == null ? void 0 : character.key) != null ? _character$key : "");
  const dataContextValue = (0,react.useMemo)(() => {
    if (!teamData || !charUIData) return undefined;
    return {
      data: charUIData,
      teamData,
      oldData: undefined
    };
  }, [charUIData, teamData]);
  const characterContextValue = (0,react.useMemo)(() => {
    if (!character || !characterSheet) return undefined;
    return {
      character,
      characterSheet,
      characterDispatch
    };
  }, [character, characterSheet, characterDispatch]);
  const [chartData, setChartData] = (0,react.useState)(undefined);
  const [graphBuilds, setGraphBuilds] = (0,react.useState)();
  const graphContextValue = (0,react.useMemo)(() => {
    return {
      chartData,
      setChartData,
      graphBuilds,
      setGraphBuilds
    };
  }, [chartData, graphBuilds]);

  // Clear state when switching characters
  (0,react.useEffect)(() => {
    setChartData(undefined);
    setGraphBuilds(undefined);
  }, [characterKey]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
    children: dataContextValue && characterContextValue && graphContextValue ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterContext/* CharacterContext.Provider */.K.Provider, {
      value: characterContextValue,
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataContext/* DataContext.Provider */.R.Provider, {
        value: dataContextValue,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GraphContext.Provider, {
          value: graphContextValue,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FormulaDataContext/* FormulaDataWrapper */.B, {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.CardContent, {
              sx: {
                display: "flex",
                flexDirection: "column",
                gap: 1
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                display: "flex",
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  flexGrow: 1,
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharSelectButton, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TravelerElementSelect, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TravelerGenderSelect, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DetailStatButton, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomMultiTarget/* CustomMultiTargetButton */.J, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FormulasButton, {})]
                }), !!onClose && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CloseButton/* default */.Z, {
                  onClick: onClose
                })]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Box, {
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                children: [character && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(LevelSelect/* default */.Z, {
                  level: character.level,
                  ascension: character.ascension,
                  setBoth: characterDispatch
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HitModeEditor/* HitModeToggle */.Hn, {
                  size: "small"
                }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HitModeEditor/* InfusionAuraDropdown */.pg, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(HitModeEditor/* ReactionToggle */.oX, {
                  size: "small"
                })]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TabNav, {
                  tab: tab
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterPanel, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardLight/* default */.Z, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TabNav, {
                  tab: tab
                })
              })]
            })
          })
        })
      })
    }) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
      variant: "rectangular",
      width: "100%",
      height: 1000
    })
  });
}
function CharacterPanel() {
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
    fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Skeleton, {
      variant: "rectangular",
      width: "100%",
      height: 500
    }),
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(react_router_dom_production_min.Routes, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react_router_dom_production_min.Route, {
        index: true,
        element: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TabOverview, {})
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react_router_dom_production_min.Route, {
        path: "/talent",
        element: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CharacterTalentPane, {})
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react_router_dom_production_min.Route, {
        path: "/teambuffs",
        element: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TabTeambuffs, {})
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react_router_dom_production_min.Route, {
        path: "/optimize",
        element: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TabBuild, {})
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react_router_dom_production_min.Route, {
        path: "/theorycraft",
        element: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TabTheorycraft, {})
      })]
    })
  });
}
function TabNav({
  tab
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Tabs, {
    value: tab,
    variant: "scrollable",
    allowScrollButtonsMobile: true,
    sx: {
      "& .MuiTab-root:hover": {
        transition: "background-color 0.25s ease",
        backgroundColor: "rgba(255,255,255,0.1)"
      }
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Tab, {
      sx: {
        minWidth: "20%"
      },
      value: "overview",
      label: t("tabs.overview"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Person */.Fc0, {}),
      component: react_router_dom_production_min.Link,
      to: ""
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Tab, {
      sx: {
        minWidth: "20%"
      },
      value: "talent",
      label: t("tabs.talent"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* FactCheck */.WIv, {}),
      component: react_router_dom_production_min.Link,
      to: "talent"
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Tab, {
      sx: {
        minWidth: "20%"
      },
      value: "teambuffs",
      label: t("tabs.teambuffs"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Groups */.Fly, {}),
      component: react_router_dom_production_min.Link,
      to: "teambuffs"
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Tab, {
      sx: {
        minWidth: "20%"
      },
      value: "optimize",
      label: t("tabs.optimize"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* TrendingUp */.klz, {}),
      component: react_router_dom_production_min.Link,
      to: "optimize"
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(material_node.Tab, {
      sx: {
        minWidth: "20%"
      },
      value: "theorycraft",
      label: t("tabs.theorycraft"),
      icon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Science */.MVg, {}),
      component: react_router_dom_production_min.Link,
      to: "theorycraft"
    })]
  });
}
function DetailStatButton() {
  const {
    t
  } = (0,es/* useTranslation */.$G)("page_character");
  const [open, onOpen, onClose] = (0,useBoolState/* default */.Z)();
  const {
    character: {
      bonusStats
    }
  } = (0,react.useContext)(CharacterContext/* CharacterContext */.K);
  const bStatsNum = Object.keys(bonusStats).length;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Button, {
      color: "info",
      startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* BarChart */.vz2, {}),
      onClick: onOpen,
      children: [t(CharacterDisplay_t || (CharacterDisplay_t = CharacterDisplay_`addStats.title`)), !!bStatsNum && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        sx: {
          ml: 1
        },
        color: "success",
        children: bStatsNum
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatModal, {
      open: open,
      onClose: onClose
    })]
  });
}
function FormulasButton() {
  const {
    onModalOpen
  } = (0,react.useContext)(FormulaDataContext/* FormulaDataContext */.M);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(material_node.Button, {
      color: "info",
      startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Calculate */.Pzm, {}),
      onClick: onModalOpen,
      children: ["Formulas ", "&", " Calcs"]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(FormulaModal, {})]
  });
}

/***/ })

}]);