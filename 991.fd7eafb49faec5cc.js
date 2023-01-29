"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[991],{

/***/ 824991:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PageCharacter)
/* harmony export */ });
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(111084);
/* harmony import */ var _mui_icons_material_Add__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(293553);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(206963);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(_mui_material__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(202784);
/* harmony import */ var react_ga4__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(761877);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(732696);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(232175);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var _Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(507300);
/* harmony import */ var _Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(87985);
/* harmony import */ var _Components_Character_CharacterCard__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(450875);
/* harmony import */ var _Components_SortByButton__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(346026);
/* harmony import */ var _Components_ToggleButton_ElementToggle__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(959236);
/* harmony import */ var _Components_ToggleButton_WeaponToggle__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(229117);
/* harmony import */ var _Data_Characters__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(970630);
/* harmony import */ var _Data_Weapons__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(951077);
/* harmony import */ var _Database_Database__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(225870);
/* harmony import */ var _ReactHooks_useCharSelectionCallback__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(897856);
/* harmony import */ var _ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(610002);
/* harmony import */ var _ReactHooks_useForceUpdate__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(536617);
/* harmony import */ var _ReactHooks_useMediaQueryUp__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(682716);
/* harmony import */ var _Types_consts__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(736893);
/* harmony import */ var _Util_CharacterSort__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(945069);
/* harmony import */ var _Util_SortByFilters__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(601661);
/* harmony import */ var _Util_totalUtils__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(840775);
/* harmony import */ var _Util_Util__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(41015);
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(552903);
let _2 = t => t,
  _t;




























const CharacterSelectionModal = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.lazy(() => __webpack_require__.e(/* import() */ 592).then(__webpack_require__.bind(__webpack_require__, 701296)));
const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 4
};
const numToShowMap = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 16
};
const sortKeys = Object.keys(_Util_CharacterSort__WEBPACK_IMPORTED_MODULE_16__/* .characterSortMap */ .V3);
function PageCharacter() {
  const {
    t
  } = (0,react_i18next__WEBPACK_IMPORTED_MODULE_2__/* .useTranslation */ .$G)(["page_character", "charNames_gen"]);
  const {
    database
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_Database_Database__WEBPACK_IMPORTED_MODULE_11__/* .DatabaseContext */ .t);
  const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => database.displayCharacter.get());
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => database.displayCharacter.follow((r, s) => setState(s)), [database, setState]);
  const [searchTerm, setSearchTerm] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
  const deferredSearchTerm = (0,react__WEBPACK_IMPORTED_MODULE_0__.useDeferredValue)(searchTerm);
  const invScrollRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const setPage = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((_, value) => {
    var _invScrollRef$current;
    (_invScrollRef$current = invScrollRef.current) == null ? void 0 : _invScrollRef$current.scrollIntoView({
      behavior: "smooth"
    });
    database.displayCharacter.set({
      pageIndex: value - 1
    });
  }, [database, invScrollRef]);
  const brPt = (0,_ReactHooks_useMediaQueryUp__WEBPACK_IMPORTED_MODULE_17__/* ["default"] */ .Z)();
  const maxNumToDisplay = numToShowMap[brPt];
  const [newCharacter, setnewCharacter] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [dbDirty, forceUpdate] = (0,_ReactHooks_useForceUpdate__WEBPACK_IMPORTED_MODULE_14__/* ["default"] */ .Z)();
  // Set follow, should run only once
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    react_ga4__WEBPACK_IMPORTED_MODULE_1__/* ["default"].send */ .ZP.send({
      hitType: "pageview",
      page: '/characters'
    });
    return database.chars.followAny((k, r) => (r === "new" || r === "remove") && forceUpdate());
  }, [forceUpdate, database]);

  // character favorite updater
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => database.charMeta.followAny(s => forceUpdate()), [forceUpdate, database]);
  const {
    gender
  } = (0,_ReactHooks_useDBMeta__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .Z)();
  const deleteCharacter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async cKey => {
    const chararcterSheet = await (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_9__/* .getCharSheet */ .m)(cKey, gender);
    let name = chararcterSheet == null ? void 0 : chararcterSheet.name;
    // Use translated string
    if (typeof name === "object") name = t(`charNames_gen:${(0,_Types_consts__WEBPACK_IMPORTED_MODULE_15__/* .charKeyToCharName */ .LP)(cKey, gender)}`);
    if (!window.confirm(t("removeCharacter", {
      value: name
    }))) return;
    database.chars.remove(cKey);
  }, [database, gender, t]);
  const editCharacter = (0,_ReactHooks_useCharSelectionCallback__WEBPACK_IMPORTED_MODULE_12__/* ["default"] */ .Z)();
  const navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_18__.useNavigate)();
  const deferredState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useDeferredValue)(state);
  const deferredDbDirty = (0,react__WEBPACK_IMPORTED_MODULE_0__.useDeferredValue)(dbDirty);
  const {
    charKeyList,
    totalCharNum
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    var _characterSortMap$sor;
    const chars = database.chars.keys;
    const totalCharNum = chars.length;
    const {
      element,
      weaponType,
      sortType,
      ascending
    } = deferredState;
    const charKeyList = database.chars.keys.filter((0,_Util_SortByFilters__WEBPACK_IMPORTED_MODULE_19__/* .filterFunction */ .C)({
      element,
      weaponType,
      name: deferredSearchTerm
    }, (0,_Util_CharacterSort__WEBPACK_IMPORTED_MODULE_16__/* .characterFilterConfigs */ .zU)(database))).sort((0,_Util_SortByFilters__WEBPACK_IMPORTED_MODULE_19__/* .sortFunction */ .e)((_characterSortMap$sor = _Util_CharacterSort__WEBPACK_IMPORTED_MODULE_16__/* .characterSortMap */ .V3[sortType]) != null ? _characterSortMap$sor : [], ascending, (0,_Util_CharacterSort__WEBPACK_IMPORTED_MODULE_16__/* .characterSortConfigs */ ._L)(database), ["new", "favorite"]));
    return deferredDbDirty && {
      charKeyList,
      totalCharNum
    };
  }, [deferredDbDirty, database, deferredState, deferredSearchTerm]);
  const {
    weaponType,
    element,
    sortType,
    ascending,
    pageIndex = 0
  } = state;
  const {
    charKeyListToShow,
    numPages,
    currentPageIndex
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const numPages = Math.ceil(charKeyList.length / maxNumToDisplay);
    const currentPageIndex = (0,_Util_Util__WEBPACK_IMPORTED_MODULE_20__/* .clamp */ .uZ)(pageIndex, 0, numPages - 1);
    return {
      charKeyListToShow: charKeyList.slice(currentPageIndex * maxNumToDisplay, (currentPageIndex + 1) * maxNumToDisplay),
      numPages,
      currentPageIndex
    };
  }, [charKeyList, pageIndex, maxNumToDisplay]);
  const totalShowing = charKeyList.length !== totalCharNum ? `${charKeyList.length}/${totalCharNum}` : `${totalCharNum}`;
  const weaponTotals = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_Util_totalUtils__WEBPACK_IMPORTED_MODULE_21__/* .catTotal */ .W)(_Types_consts__WEBPACK_IMPORTED_MODULE_15__/* .allWeaponTypeKeys */ .yd, ct => Object.entries(database.chars.data).forEach(([ck, char]) => {
    const weapon = database.weapons.get(char.equippedWeapon);
    if (!weapon) return;
    const wtk = (0,_Data_Weapons__WEBPACK_IMPORTED_MODULE_10__/* .getWeaponSheet */ .ub)(weapon.key).weaponType;
    ct[wtk].total++;
    if (charKeyList.includes(ck)) ct[wtk].current++;
  })), [database, charKeyList]);
  const elementTotals = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_Util_totalUtils__WEBPACK_IMPORTED_MODULE_21__/* .catTotal */ .W)(_Types_consts__WEBPACK_IMPORTED_MODULE_15__/* .allElements */ .N, ct => Object.entries(database.chars.data).forEach(([ck, char]) => {
    const eleKey = (0,_Data_Characters__WEBPACK_IMPORTED_MODULE_9__/* .getCharSheet */ .m)(char.key, database.gender).elementKey;
    ct[eleKey].total++;
    if (charKeyList.includes(ck)) ct[eleKey].current++;
  })), [database, charKeyList]);
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Box, {
    my: 1,
    display: "flex",
    flexDirection: "column",
    gap: 1,
    children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, {
      fallback: false,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(CharacterSelectionModal, {
        newFirst: true,
        show: newCharacter,
        onHide: () => setnewCharacter(false),
        onSelect: editCharacter
      })
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
      ref: invScrollRef,
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.CardContent, {
        sx: {
          display: "flex",
          flexDirection: "column",
          gap: 1
        },
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
          container: true,
          spacing: 1,
          children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_ToggleButton_WeaponToggle__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .Z, {
              sx: {
                height: "100%"
              },
              onChange: weaponType => database.displayCharacter.set({
                weaponType
              }),
              value: weaponType,
              totals: weaponTotals,
              size: "small"
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_ToggleButton_ElementToggle__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .Z, {
              sx: {
                height: "100%"
              },
              onChange: element => database.displayCharacter.set({
                element
              }),
              value: element,
              totals: elementTotals,
              size: "small"
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            flexGrow: 1
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.TextField, {
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
          })]
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Box, {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Pagination, {
            count: numPages,
            page: currentPageIndex + 1,
            onChange: setPage
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(ShowingCharacter, {
            numShowing: charKeyListToShow.length,
            total: totalShowing,
            t: t
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_SortByButton__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z, {
            sortKeys: sortKeys,
            value: sortType,
            onChange: sortType => database.displayCharacter.set({
              sortType
            }),
            ascending: ascending,
            onChangeAsc: ascending => database.displayCharacter.set({
              ascending
            })
          })]
        })]
      })
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Button, {
      fullWidth: true,
      onClick: () => setnewCharacter(true),
      color: "info",
      startIcon: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_icons_material_Add__WEBPACK_IMPORTED_MODULE_24__["default"], {}),
      children: t(_t || (_t = _2`addNew`))
    }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, {
      fallback: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Skeleton, {
        variant: "rectangular",
        sx: {
          width: "100%",
          height: "100%",
          minHeight: 5000
        }
      }),
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
        container: true,
        spacing: 1,
        columns: columns,
        children: charKeyListToShow.map(charKey => (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
          item: true,
          xs: 1,
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_Character_CharacterCard__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
            characterKey: charKey,
            onClick: () => navigate(`${charKey}`),
            footer: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .Fragment */ .HY, {
              children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Divider, {}), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Box, {
                sx: {
                  py: 1,
                  px: 2,
                  display: "flex",
                  gap: 1,
                  justifyContent: "space-between"
                },
                children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                  placement: "top",
                  title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Typography, {
                    children: t("tabs.talent")
                  }),
                  children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.IconButton, {
                    onClick: () => navigate(`${charKey}/talent`),
                    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_25__/* .FactCheck */ .WIv, {})
                  })
                }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                  placement: "top",
                  title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Typography, {
                    children: t("tabs.teambuffs")
                  }),
                  children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.IconButton, {
                    onClick: () => navigate(`${charKey}/teambuffs`),
                    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_25__/* .Groups */ .Fly, {})
                  })
                }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                  placement: "top",
                  title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Typography, {
                    children: t("tabs.optimize")
                  }),
                  children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.IconButton, {
                    onClick: () => navigate(`${charKey}/optimize`),
                    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_25__/* .TrendingUp */ .klz, {})
                  })
                }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                  placement: "top",
                  title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Typography, {
                    children: t("tabs.theorycraft")
                  }),
                  children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.IconButton, {
                    onClick: () => navigate(`${charKey}/theorycraft`),
                    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_25__/* .Science */ .MVg, {})
                  })
                }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Divider, {
                  orientation: "vertical"
                }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_BootstrapTooltip__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                  placement: "top",
                  title: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Typography, {
                    children: t("delete")
                  }),
                  children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.IconButton, {
                    color: "error",
                    onClick: () => deleteCharacter(charKey),
                    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_icons_material__WEBPACK_IMPORTED_MODULE_25__/* .DeleteForever */ .Gnd, {})
                  })
                })]
              })]
            })
          })
        }, charKey))
      })
    }), numPages > 1 && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_Components_Card_CardDark__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
      children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.CardContent, {
        sx: {
          display: "flex",
          gap: 1
        },
        children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Button, {
          onClick: () => setnewCharacter(true),
          color: "info",
          sx: {
            minWidth: 0
          },
          children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_icons_material_Add__WEBPACK_IMPORTED_MODULE_24__["default"], {})
        }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
          container: true,
          alignItems: "flex-end",
          sx: {
            flexGrow: 1
          },
          children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            flexGrow: 1,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Pagination, {
              count: numPages,
              page: currentPageIndex + 1,
              onChange: setPage
            })
          }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Grid, {
            item: true,
            children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(ShowingCharacter, {
              numShowing: charKeyListToShow.length,
              total: totalShowing,
              t: t
            })
          })]
        })]
      })
    })]
  });
}
function ShowingCharacter({
  numShowing,
  total,
  t
}) {
  return (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)(_mui_material__WEBPACK_IMPORTED_MODULE_23__.Typography, {
    color: "text.secondary",
    children: (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsxs */ .BX)(react_i18next__WEBPACK_IMPORTED_MODULE_2__/* .Trans */ .cC, {
      t: t,
      i18nKey: "showingNum",
      count: numShowing,
      value: total,
      children: ["Showing ", (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__/* .jsx */ .tZ)("b", {
        children: {
          count: numShowing
        }
      }), " out of ", {
        value: total
      }, " Characters"]
    })
  });
}

/***/ })

}]);