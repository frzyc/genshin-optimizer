"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[157],{

/***/ 619157:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ ArtifactFilterDisplay)
});

// EXTERNAL MODULE: ../../libs/consts/src/index.ts
var src = __webpack_require__(682799);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/index.js
var icons_material = __webpack_require__(111084);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/Block.js
var Block = __webpack_require__(738114);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/ShowChart.js
var ShowChart = __webpack_require__(296511);
// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__(202784);
// EXTERNAL MODULE: ../../node_modules/react-i18next/dist/es/index.js + 17 modules
var es = __webpack_require__(732696);
// EXTERNAL MODULE: ./src/app/Database/Database.ts + 11 modules
var Database = __webpack_require__(225870);
// EXTERNAL MODULE: ./src/app/SVGIcons/index.tsx
var SVGIcons = __webpack_require__(929063);
// EXTERNAL MODULE: ./src/app/Types/artifact.ts
var artifact = __webpack_require__(469190);
// EXTERNAL MODULE: ./src/app/Types/consts.ts
var consts = __webpack_require__(736893);
// EXTERNAL MODULE: ./src/app/Util/MultiSelect.ts
var MultiSelect = __webpack_require__(810618);
// EXTERNAL MODULE: ./src/app/Util/totalUtils.ts
var totalUtils = __webpack_require__(840775);
// EXTERNAL MODULE: ./src/app/Components/BootstrapTooltip.tsx
var BootstrapTooltip = __webpack_require__(507300);
// EXTERNAL MODULE: ./src/app/Components/SolidToggleButtonGroup.tsx
var SolidToggleButtonGroup = __webpack_require__(29432);
// EXTERNAL MODULE: ./src/app/Components/StarDisplay.tsx
var StarDisplay = __webpack_require__(871765);
// EXTERNAL MODULE: ./src/app/Components/Artifact/ArtifactLevelSlider.tsx
var ArtifactLevelSlider = __webpack_require__(932912);
// EXTERNAL MODULE: ./src/app/KeyMap/index.tsx + 1 modules
var KeyMap = __webpack_require__(419807);
// EXTERNAL MODULE: ./src/app/KeyMap/StatIcon.tsx + 11 modules
var StatIcon = __webpack_require__(943397);
// EXTERNAL MODULE: ./src/app/Components/GeneralAutocomplete.tsx
var GeneralAutocomplete = __webpack_require__(843966);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/Components/Artifact/ArtifactMainStatMultiAutocomplete.tsx








function ArtifactMainStatMultiAutocomplete({
  mainStatKeys,
  setMainStatKeys,
  totals
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("artifact");
  const options = (0,react.useMemo)(() => artifact/* allMainStatKeys.map */.r.map(key => ({
    key,
    label: KeyMap/* default.getArtStr */.ZP.getArtStr(key),
    variant: KeyMap/* default.getVariant */.ZP.getVariant(key)
  })), []);
  const toImg = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* default */.C, {
    statKey: key
  }), []);
  const toExLabel = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
    children: totals[key]
  }), [totals]);
  const toExItemLabel = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
    size: "small",
    label: totals[key]
  }), [totals]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GeneralAutocomplete/* GeneralAutocompleteMulti */.c, {
    options: options,
    valueKeys: mainStatKeys,
    onChange: setMainStatKeys,
    toImg: toImg,
    toExLabel: toExLabel,
    toExItemLabel: toExItemLabel,
    label: t("autocompleteLabels.mainStats")
  });
}
// EXTERNAL MODULE: ./src/app/Data/Artifacts/index.ts + 44 modules
var Artifacts = __webpack_require__(261420);
// EXTERNAL MODULE: ./src/app/Data/Artifacts/ArtifactSheet.tsx
var ArtifactSheet = __webpack_require__(374637);
// EXTERNAL MODULE: ./src/app/Components/Image/ImgIcon.tsx
var ImgIcon = __webpack_require__(726578);
// EXTERNAL MODULE: ./src/app/Components/Artifact/sortByRarityAndName.tsx
var sortByRarityAndName = __webpack_require__(691672);
;// CONCATENATED MODULE: ./src/app/Components/Artifact/ArtifactSetMultiAutocomplete.tsx











function ArtifactSetMultiAutocomplete({
  artSetKeys,
  setArtSetKeys,
  totals
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["artifact", "artifactNames_gen"]);
  const toImg = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ImgIcon/* default */.Z, {
    src: (0,ArtifactSheet/* artifactDefIcon */.jU)(key),
    sx: {
      fontSize: "1.5em"
    }
  }), []);
  const toExLabel = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
    children: totals[key]
  }), [totals]);
  const toExItemLabel = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
    size: "small",
    label: totals[key]
  }), [totals]);
  const allArtifactSetsAndRarities = (0,react.useMemo)(() => Object.entries(Artifacts/* setKeysByRarities */.WO).flatMap(([rarity, sets]) => sets.map(set => ({
    key: set,
    grouper: +rarity,
    label: t(`artifactNames_gen:${set}`)
  }))).sort(sortByRarityAndName/* default */.Z), [t]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GeneralAutocomplete/* GeneralAutocompleteMulti */.c, {
    options: allArtifactSetsAndRarities,
    valueKeys: artSetKeys,
    label: t("artifact:autocompleteLabels.sets"),
    toImg: toImg,
    toExLabel: toExLabel,
    toExItemLabel: toExItemLabel,
    onChange: setArtSetKeys,
    groupBy: option => {
      var _option$grouper$toStr, _option$grouper;
      return (_option$grouper$toStr = (_option$grouper = option.grouper) == null ? void 0 : _option$grouper.toString()) != null ? _option$grouper$toStr : "";
    },
    renderGroup: params => params.group && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.List, {
      component: node.Box,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ListSubheader, {
        sx: {
          top: "-1em"
        },
        children: [params.group, " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarDisplay/* StarsDisplay */.q, {
          stars: +params.group,
          inline: true
        })]
      }, `${params.group}Header`), params.children]
    }, params.group)
  });
}
;// CONCATENATED MODULE: ./src/app/Components/Artifact/ArtifactSubstatMultiAutocomplete.tsx








function ArtifactSubstatMultiAutocomplete({
  substatKeys,
  setSubstatKeys,
  totals
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("artifact");
  const options = (0,react.useMemo)(() => artifact/* allSubstatKeys.map */._.map(key => ({
    key,
    label: KeyMap/* default.getArtStr */.ZP.getArtStr(key)
  })), []);
  const toImg = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StatIcon/* default */.C, {
    statKey: key
  }), []);
  const toExLabel = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
    children: totals[key]
  }), [totals]);
  const toExItemLabel = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
    size: "small",
    label: totals[key]
  }), [totals]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GeneralAutocomplete/* GeneralAutocompleteMulti */.c, {
    options: options,
    toImg: toImg,
    toExLabel: toExLabel,
    toExItemLabel: toExItemLabel,
    valueKeys: substatKeys,
    onChange: setSubstatKeys,
    label: t("autocompleteLabels.substats")
  });
}
// EXTERNAL MODULE: ../../libs/g-assets/src/index.ts + 1738 modules
var g_assets_src = __webpack_require__(918676);
// EXTERNAL MODULE: ./src/app/Data/Characters/index.ts + 212 modules
var Characters = __webpack_require__(970630);
// EXTERNAL MODULE: ./src/app/ReactHooks/useDBMeta.tsx
var useDBMeta = __webpack_require__(610002);
;// CONCATENATED MODULE: ./src/app/Components/Artifact/LocationFilterMultiAutocomplete.tsx
let _ = t => t,
  _t;










function LocationFilterMultiAutocomplete({
  locations,
  setLocations,
  totals,
  disabled
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["ui", "artifact", "charNames_gen"]);
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const {
    gender
  } = (0,useDBMeta/* default */.Z)();
  const toText = (0,react.useCallback)(key => t(`charNames_gen:${(0,consts/* charKeyToCharName */.LP)(database.chars.LocationToCharacterKey(key), gender)}`), [database, gender, t]);
  const toImg = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
      component: "img",
      src: (0,g_assets_src/* characterAsset */.Li)(database.chars.LocationToCharacterKey(key), "iconSide", gender),
      sx: {
        display: "inline-block",
        width: "auto",
        height: `3em`,
        lineHeight: 1,
        verticalAlign: "text-bottom",
        mt: -2,
        mb: -0.5,
        mr: -0.5,
        ml: -1
      }
    })
  }), [database, gender]);
  const toExLabel = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
    children: totals[key]
  }), [totals]);
  const toExItemLabel = (0,react.useCallback)(key => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
    size: "small",
    label: totals[key]
  }), [totals]);
  const isFavorite = (0,react.useCallback)(key => key === "Traveler" ? consts/* travelerKeys.some */._0.some(key => database.charMeta.get(key).favorite) : key ? database.charMeta.get(key).favorite : false, [database]);
  const toVariant = (0,react.useCallback)(key => {
    var _getCharSheet$element;
    return (_getCharSheet$element = (0,Characters/* getCharSheet */.m)(database.chars.LocationToCharacterKey(key), gender).elementKey) != null ? _getCharSheet$element : undefined;
  }, [database, gender]);
  const values = (0,react.useMemo)(() => consts/* locationCharacterKeys.filter */.xB.filter(lck => database.chars.get(database.chars.LocationToCharacterKey(lck))).map(v => ({
    key: v,
    label: toText(v),
    favorite: isFavorite(v),
    variant: toVariant(v)
  })).sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return a.label.localeCompare(b.label);
  }), [toText, isFavorite, toVariant, database]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
    fallback: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Skeleton, {
      variant: "text",
      width: 100
    }),
    children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GeneralAutocomplete/* GeneralAutocompleteMulti */.c, {
      disabled: disabled,
      options: values,
      valueKeys: locations,
      onChange: k => setLocations(k),
      toImg: toImg,
      toExLabel: toExLabel,
      toExItemLabel: toExItemLabel,
      label: t(_t || (_t = _`artifact:filterLocation.location`)),
      chipProps: {
        variant: "outlined"
      }
    })
  });
}
// EXTERNAL MODULE: ./src/app/Util/Util.ts
var Util = __webpack_require__(41015);
// EXTERNAL MODULE: ./src/app/Components/CustomNumberInput.tsx
var CustomNumberInput = __webpack_require__(789343);
;// CONCATENATED MODULE: ./src/app/Components/Artifact/RVSlide.tsx






function RVSlide({
  levelLow,
  levelHigh,
  setLow,
  setHigh,
  setBoth,
  dark = false,
  disabled = false
}) {
  const [sliderLow, setsliderLow] = (0,react.useState)(levelLow);
  const [sliderHigh, setsliderHigh] = (0,react.useState)(levelHigh);
  const setSlider = (0,react.useCallback)((e, value) => {
    if (typeof value == "number") throw new TypeError();
    const [l, h] = value;
    setsliderLow(l);
    setsliderHigh(h);
  }, [setsliderLow, setsliderHigh]);
  (0,react.useEffect)(() => setsliderLow(levelLow), [setsliderLow, levelLow]);
  (0,react.useEffect)(() => setsliderHigh(levelHigh), [setsliderHigh, levelHigh]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Card, {
    sx: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      bgcolor: dark ? "contentDark.main" : "contentLight.main",
      overflow: "visible"
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
      value: sliderLow,
      onChange: val => setLow((0,Util/* clamp */.uZ)(val, 0, levelHigh)),
      sx: {
        px: 1,
        pl: 2,
        width: 100
      },
      inputProps: {
        sx: {
          textAlign: "right"
        }
      },
      startAdornment: "RV: ",
      disabled: disabled
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Slider, {
      sx: {
        width: 100,
        flexGrow: 1,
        mx: 2
      },
      getAriaLabel: () => 'Arifact RV Range',
      value: [sliderLow, sliderHigh],
      onChange: setSlider,
      onChangeCommitted: (e, value) => setBoth(value[0], value[1]),
      valueLabelDisplay: "auto",
      min: 0,
      max: 900,
      disabled: disabled
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* default */.ZP, {
      value: sliderHigh,
      onChange: val => setHigh((0,Util/* clamp */.uZ)(val, levelLow, 900)),
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
// EXTERNAL MODULE: ./src/app/Components/Artifact/SlotIcon.tsx + 3 modules
var SlotIcon = __webpack_require__(815378);
;// CONCATENATED MODULE: ./src/app/Components/Artifact/ArtifactFilterDisplay.tsx
let ArtifactFilterDisplay_ = t => t,
  ArtifactFilterDisplay_t,
  _t2,
  _t3;

























const exclusionValues = ["excluded", "included"];
const lockedValues = ["locked", "unlocked"];
const rarityHandler = (0,MultiSelect/* handleMultiSelect */.X)([...consts/* allArtifactRarities */.En]);
const slotHandler = (0,MultiSelect/* handleMultiSelect */.X)([...src/* allSlotKeys */.eV]);
const exclusionHandler = (0,MultiSelect/* handleMultiSelect */.X)([...exclusionValues]);
const lockedHandler = (0,MultiSelect/* handleMultiSelect */.X)([...lockedValues]);
const lineHandler = (0,MultiSelect/* handleMultiSelect */.X)([1, 2, 3, 4]);
function ArtifactFilterDisplay({
  filterOption,
  filterOptionDispatch,
  filteredIds,
  disableSlotFilter = false
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["artifact", "ui"]);
  const {
    artSetKeys = [],
    mainStatKeys = [],
    rarity = [],
    slotKeys = [],
    levelLow = 0,
    levelHigh = 20,
    substats = [],
    locations,
    showEquipped,
    showInventory,
    exclusion = [...exclusionValues],
    locked = [...lockedValues],
    rvLow = 0,
    rvHigh = 900,
    lines = []
  } = filterOption;
  const {
    database
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const rarityTotal = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(consts/* allArtifactRarities */.En, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const rarity = art.rarity;
    ct[rarity].total++;
    if (filteredIds.includes(id)) ct[rarity].current++;
  })), [database, filteredIds]);
  const slotTotal = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(src/* allSlotKeys */.eV, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const sk = art.slotKey;
    ct[sk].total++;
    if (filteredIds.includes(id)) ct[sk].current++;
  })), [database, filteredIds]);
  const excludedTotal = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(["excluded", "included"], ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const sk = art.exclude ? "excluded" : "included";
    ct[sk].total++;
    if (filteredIds.includes(id)) ct[sk].current++;
  })), [database, filteredIds]);
  const lockedTotal = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(["locked", "unlocked"], ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const sk = art.lock ? "locked" : "unlocked";
    ct[sk].total++;
    if (filteredIds.includes(id)) ct[sk].current++;
  })), [database, filteredIds]);
  const linesTotal = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(["1", "2", "3", "4"], ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const lns = art.substats.filter(s => s.value).length;
    ct[lns].total++;
    if (filteredIds.includes(id)) ct[lns].current++;
  })), [database, filteredIds]);
  const equippedTotal = (0,react.useMemo)(() => {
    let total = 0,
      current = 0;
    Object.entries(database.arts.data).forEach(([id, art]) => {
      if (!art.location) return;
      total++;
      if (filteredIds.includes(id)) current++;
    });
    return `${current}/${total}`;
  }, [database, filteredIds]);
  const unequippedTotal = (0,react.useMemo)(() => {
    let total = 0,
      current = 0;
    Object.entries(database.arts.data).forEach(([id, art]) => {
      if (art.location) return;
      total++;
      if (filteredIds.includes(id)) current++;
    });
    return `${current}/${total}`;
  }, [database, filteredIds]);
  const artSetTotal = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(src/* allArtifactSets */.q2, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const sk = art.setKey;
    ct[sk].total++;
    if (filteredIds.includes(id)) ct[sk].current++;
  })), [database, filteredIds]);
  const artMainTotal = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(artifact/* allMainStatKeys */.r, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const mk = art.mainStatKey;
    ct[mk].total++;
    if (filteredIds.includes(id)) ct[mk].current++;
  })), [database, filteredIds]);
  const artSubTotal = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(artifact/* allSubstatKeys */._, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    Object.values(art.substats).forEach(sub => {
      if (typeof sub !== "object") return;
      const key = sub.key;
      if (!key) return;
      ct[key].total++;
      if (filteredIds.includes(id)) ct[key].current++;
    });
  })), [database, filteredIds]);
  const locationTotal = (0,react.useMemo)(() => (0,totalUtils/* catTotal */.W)(consts/* locationCharacterKeys */.xB, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    if (!art.location) return;
    const lk = art.location;
    ct[lk].total++;
    if (filteredIds.includes(id)) ct[lk].current++;
  })), [database, filteredIds]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
    container: true,
    spacing: 1,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
      item: true,
      xs: 12,
      md: 6,
      display: "flex",
      flexDirection: "column",
      gap: 1,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SolidToggleButtonGroup/* default */.Z, {
        fullWidth: true,
        value: rarity,
        size: "small",
        children: consts/* allArtifactRarities.map */.En.map(star => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ToggleButton, {
          sx: {
            display: "flex",
            gap: 1
          },
          value: star,
          onClick: () => filterOptionDispatch({
            rarity: rarityHandler(rarity, star)
          }),
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(StarDisplay/* StarsDisplay */.q, {
            stars: star
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
            label: rarityTotal[star],
            size: "small"
          })]
        }, star))
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SolidToggleButtonGroup/* default */.Z, {
        fullWidth: true,
        value: slotKeys,
        size: "small",
        disabled: disableSlotFilter,
        children: src/* allSlotKeys.map */.eV.map(slotKey => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ToggleButton, {
          sx: {
            display: "flex",
            gap: 1
          },
          value: slotKey,
          onClick: () => filterOptionDispatch({
            slotKeys: slotHandler(slotKeys, slotKey)
          }),
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SlotIcon/* default */.Z, {
            iconProps: SVGIcons/* iconInlineProps */.m,
            slotKey: slotKey
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
            label: slotTotal[slotKey],
            size: "small"
          })]
        }, slotKey))
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
        display: "flex",
        gap: 1,
        flexWrap: "wrap",
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SolidToggleButtonGroup/* default */.Z, {
          fullWidth: true,
          value: exclusion,
          size: "small",
          children: exclusionValues.map((v, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ToggleButton, {
            value: v,
            sx: {
              display: "flex",
              gap: 1
            },
            onClick: () => filterOptionDispatch({
              exclusion: exclusionHandler(exclusion, v)
            }),
            children: [i ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ShowChart["default"], {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(Block["default"], {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
              i18nKey: `exclusion.${v}`,
              t: t
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
              label: excludedTotal[i ? "included" : "excluded"],
              size: "small"
            })]
          }, v))
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SolidToggleButtonGroup/* default */.Z, {
          fullWidth: true,
          value: locked,
          size: "small",
          children: lockedValues.map((v, i) => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ToggleButton, {
            value: v,
            sx: {
              display: "flex",
              gap: 1
            },
            onClick: () => filterOptionDispatch({
              locked: lockedHandler(locked, v)
            }),
            children: [i ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* LockOpen */.M0f, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Lock */.HEZ, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
              i18nKey: `ui:${v}`,
              t: t
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
              label: lockedTotal[i ? "unlocked" : "locked"],
              size: "small"
            })]
          }, v))
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SolidToggleButtonGroup/* default */.Z, {
        fullWidth: true,
        value: lines,
        size: "small",
        children: [1, 2, 3, 4].map(line => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.ToggleButton, {
          value: line,
          onClick: () => filterOptionDispatch({
            lines: lineHandler(lines, line)
          }),
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
            mr: 1,
            whiteSpace: "nowrap",
            children: t("sub", {
              count: line
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
            label: linesTotal[line],
            size: "small"
          })]
        }, line))
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Button, {
        startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* PersonSearch */.YlR, {}),
        color: showEquipped ? "success" : "secondary",
        onClick: () => filterOptionDispatch({
          showEquipped: !showEquipped
        }),
        children: [t(ArtifactFilterDisplay_t || (ArtifactFilterDisplay_t = ArtifactFilterDisplay_`equippedArt`)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
          sx: {
            ml: 1
          },
          label: equippedTotal,
          size: "small"
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Button, {
        startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* BusinessCenter */.J4P, {}),
        color: showInventory ? "success" : "secondary",
        onClick: () => filterOptionDispatch({
          showInventory: !showInventory
        }),
        children: [t(_t2 || (_t2 = ArtifactFilterDisplay_`artInInv`)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
          sx: {
            ml: 1
          },
          label: unequippedTotal,
          size: "small"
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactLevelSlider/* default */.Z, {
        showLevelText: true,
        levelLow: levelLow,
        levelHigh: levelHigh,
        setLow: levelLow => filterOptionDispatch({
          levelLow
        }),
        setHigh: levelHigh => filterOptionDispatch({
          levelHigh
        }),
        setBoth: (levelLow, levelHigh) => filterOptionDispatch({
          levelLow,
          levelHigh
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(RVSlide, {
        showLevelText: true,
        levelLow: rvLow,
        levelHigh: rvHigh,
        setLow: rvLow => filterOptionDispatch({
          rvLow
        }),
        setHigh: rvHigh => filterOptionDispatch({
          rvHigh
        }),
        setBoth: (rvLow, rvHigh) => filterOptionDispatch({
          rvLow,
          rvHigh
        })
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
      item: true,
      xs: 12,
      md: 6,
      display: "flex",
      flexDirection: "column",
      gap: 1,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSetMultiAutocomplete, {
        totals: artSetTotal,
        artSetKeys: artSetKeys,
        setArtSetKeys: artSetKeys => filterOptionDispatch({
          artSetKeys
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactMainStatMultiAutocomplete, {
        totals: artMainTotal,
        mainStatKeys: mainStatKeys,
        setMainStatKeys: mainStatKeys => filterOptionDispatch({
          mainStatKeys
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArtifactSubstatMultiAutocomplete, {
        totals: artSubTotal,
        substatKeys: substats,
        setSubstatKeys: substats => filterOptionDispatch({
          substats
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(react.Suspense, {
        fallback: null,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(BootstrapTooltip/* default */.Z, {
          title: showEquipped ? t(_t3 || (_t3 = ArtifactFilterDisplay_`locationsTooltip`)) : "",
          placement: "top",
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("span", {
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(LocationFilterMultiAutocomplete, {
              totals: locationTotal,
              locations: showEquipped ? [] : locations,
              setLocations: locations => filterOptionDispatch({
                locations
              }),
              disabled: showEquipped
            })
          })
        })
      })]
    })]
  });
}

/***/ })

}]);