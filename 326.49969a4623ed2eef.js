"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[326],{

/***/ 260326:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ PageSettings)
});

// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/react-ga4/dist/index.js
var dist = __webpack_require__(761877);
// EXTERNAL MODULE: ../../node_modules/react-i18next/dist/es/index.js + 17 modules
var es = __webpack_require__(732696);
// EXTERNAL MODULE: ./src/app/Components/Card/CardDark.tsx
var CardDark = __webpack_require__(87985);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/index.js
var icons_material = __webpack_require__(111084);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/ContentPaste.js
var ContentPaste = __webpack_require__(301811);
// EXTERNAL MODULE: ../../node_modules/react/index.js
var react = __webpack_require__(202784);
// EXTERNAL MODULE: ./src/app/Components/Card/CardLight.tsx
var CardLight = __webpack_require__(567937);
// EXTERNAL MODULE: ./src/app/Components/CustomNumberInput.tsx
var CustomNumberInput = __webpack_require__(789343);
// EXTERNAL MODULE: ./src/app/Components/ModalWrapper.tsx
var ModalWrapper = __webpack_require__(898927);
// EXTERNAL MODULE: ./src/app/Database/Database.ts + 11 modules
var Database = __webpack_require__(225870);
// EXTERNAL MODULE: ./src/app/ReactHooks/useBoolState.tsx
var useBoolState = __webpack_require__(594657);
// EXTERNAL MODULE: ./src/app/Util/Util.ts
var Util = __webpack_require__(41015);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/ArrowBack.js
var ArrowBack = __webpack_require__(728504);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/TextSnippet.js
var TextSnippet = __webpack_require__(22905);
// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/UploadFile.js
var UploadFile = __webpack_require__(63236);
// EXTERNAL MODULE: ./src/app/Database/DBStorage.ts
var DBStorage = __webpack_require__(76068);
// EXTERNAL MODULE: ./src/app/SVGIcons/index.tsx
var SVGIcons = __webpack_require__(929063);
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/PageSettings/UploadCard.tsx
let _ = t => t,
  _t,
  _t2,
  _t3,
  _t4,
  _t5,
  _t6,
  _t7;















const InvisInput = (0,node.styled)('input')({
  display: 'none'
});
function UploadCard({
  index,
  onReplace
}) {
  var _useMemo;
  const {
    databases
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const database = databases[index];
  const {
    t
  } = (0,es/* useTranslation */.$G)("settings");
  const [data, setdata] = (0,react.useState)("");
  const [filename, setfilename] = (0,react.useState)("");
  const [errorMsg, setErrorMsg] = (0,react.useState)(""); // TODO localize error msg
  const [keepNotInImport, setKeepNotInImport] = (0,react.useState)(false);
  const [ignoreDups, setIgnoreDups] = (0,react.useState)(false);
  const {
    importResult,
    importedDatabase
  } = (_useMemo = (0,react.useMemo)(() => {
    if (!data) return;
    let parsed;
    try {
      parsed = JSON.parse(data);
      if (typeof parsed !== "object") {
        setErrorMsg("uploadCard.error.jsonParse");
        return;
      }
    } catch (e) {
      setErrorMsg("uploadCard.error.jsonParse");
      return;
    }
    // Figure out the file format
    if (parsed.format === "GOOD") {
      // Parse as GOOD format
      const copyStorage = new DBStorage/* SandboxStorage */.N();
      copyStorage.copyFrom(database.storage);
      const importedDatabase = new Database/* ArtCharDatabase */.M(index + 1, copyStorage);
      const importResult = importedDatabase.importGOOD(parsed, keepNotInImport, ignoreDups);
      if (!importResult) {
        setErrorMsg("uploadCard.error.goInvalid");
        return;
      }
      return {
        importResult,
        importedDatabase
      };
    }
    setErrorMsg("uploadCard.error.unknown");
    return;
  }, [data, database, keepNotInImport, ignoreDups, index])) != null ? _useMemo : {};
  const reset = () => {
    setdata("");
    setfilename("");
    onReplace();
  };
  const onUpload = async e => {
    const file = e.target.files[0];
    e.target.value = null; // reset the value so the same file can be uploaded again...
    if (file) setfilename(file.name);
    const reader = new FileReader();
    reader.onload = () => setdata(reader.result);
    reader.readAsText(file);
  };
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        py: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
        t: t,
        i18nKey: "settings:uploadCard.title"
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
        container: true,
        spacing: 2,
        sx: {
          mb: 1
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("label", {
            htmlFor: "icon-button-file",
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(InvisInput, {
              accept: ".json",
              id: "icon-button-file",
              type: "file",
              onChange: onUpload
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
              component: "span",
              color: "info",
              startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* FileOpen */.lGp, {}),
              children: t(_t || (_t = _`uploadCard.buttons.open`))
            })]
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          flexGrow: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
            sx: {
              px: 2,
              py: 1
            },
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              children: filename ? (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(TextSnippet["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", filename]
              }) : (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("span", {
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ArrowBack["default"], Object.assign({}, SVGIcons/* iconInlineProps */.m)), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "settings:uploadCard.hint"
                })]
              })
            })
          })
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
        sx: {
          display: "flex",
          gap: 2,
          flexWrap: "wrap"
        },
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Tooltip, {
          title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
            children: ignoreDups ? t(_t2 || (_t2 = _`uploadCard.tooltip.ignoreDup`)) : t(_t3 || (_t3 = _`uploadCard.tooltip.detectdup`))
          }),
          placement: "top",
          arrow: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
            sx: {
              flexGrow: 1,
              flexBasis: "10em"
            },
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
              fullWidth: true,
              disabled: !data,
              color: ignoreDups ? "primary" : "success",
              onClick: () => setIgnoreDups(!ignoreDups),
              startIcon: ignoreDups ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}),
              children: t(_t4 || (_t4 = _`uploadCard.buttons.detectDups`))
            })
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Tooltip, {
          title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
            children: keepNotInImport ? t(_t5 || (_t5 = _`uploadCard.tooltip.keepNotInImport`)) : t(_t6 || (_t6 = _`uploadCard.tooltip.delNotInImport`))
          }),
          placement: "top",
          arrow: true,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
            sx: {
              flexGrow: 1,
              flexBasis: "10em"
            },
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
              fullWidth: true,
              disabled: !data,
              color: keepNotInImport ? "primary" : "success",
              onClick: () => setKeepNotInImport(!keepNotInImport),
              startIcon: keepNotInImport ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBoxOutlineBlank */.kXL, {}) : (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* CheckBox */.JgP, {}),
              children: t(_t7 || (_t7 = _`uploadCard.buttons.delNotInImport`))
            })
          })
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        gutterBottom: true,
        variant: "caption",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "settings:uploadCard.hintPaste"
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
        component: "textarea",
        sx: {
          width: "100%",
          fontFamily: "monospace",
          minHeight: "10em",
          mb: 2,
          resize: "vertical"
        },
        value: data,
        onChange: e => setdata(e.target.value)
      }), importResult && importedDatabase ? (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GOODUploadInfo, {
        importResult: importResult,
        importedDatabase: importedDatabase
      }) : t(errorMsg)]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(GOUploadAction, {
      index: index,
      importedDatabase: importedDatabase,
      reset: reset
    })]
  });
}
function GOODUploadInfo({
  importResult: {
    source,
    artifacts,
    characters,
    weapons
  },
  importedDatabase
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)("settings");
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        py: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "uploadCard.dbSource"
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("strong", {
          children: [" ", source]
        })]
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
        container: true,
        spacing: 2,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          flexGrow: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(MergeResult, {
            result: artifacts,
            dbTotal: importedDatabase.arts.values.length,
            type: "arts"
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          flexGrow: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(MergeResult, {
            result: weapons,
            dbTotal: importedDatabase.weapons.values.length,
            type: "weapons"
          })
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          flexGrow: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(MergeResult, {
            result: characters,
            dbTotal: importedDatabase.chars.values.length,
            type: "chars"
          })
        })]
      })
    })]
  });
}
function MergeResult({
  result,
  dbTotal,
  type
}) {
  var _result$invalid;
  const {
    t
  } = (0,es/* useTranslation */.$G)("settings");
  const total = result.import;
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        py: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: `count.${type}`
        }), " ", total]
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "count.new"
        }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: result.new.length
        }), " / ", total]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "count.unchanged"
        }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: result.unchanged.length
        }), " / ", total]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "count.upgraded"
        }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: result.upgraded.length
        }), " / ", total]
      }), !!result.remove.length && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
        color: "warning.main",
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "count.removed"
        }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: result.remove.length
        })]
      }), !!result.notInImport && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "count.notInImport"
        }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: result.notInImport
        })]
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "count.dbTotal"
        }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: result.beforeMerge
        }), " -> ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
          children: dbTotal
        })]
      }), !!((_result$invalid = result.invalid) != null && _result$invalid.length) && (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)("div", {
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
          color: "error.main",
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
            t: t,
            i18nKey: "count.invalid"
          }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
            children: result.invalid.length
          }), " / ", total]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
          component: "textarea",
          sx: {
            width: "100%",
            fontFamily: "monospace",
            minHeight: "10em",
            resize: "vertical"
          },
          value: JSON.stringify(result.invalid, undefined, 2),
          disabled: true
        })]
      })]
    })]
  });
}
function GOUploadAction({
  index,
  importedDatabase,
  reset
}) {
  const {
    databases,
    setDatabase
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const database = databases[index];
  const {
    t
  } = (0,es/* useTranslation */.$G)("settings");
  const replaceDB = (0,react.useCallback)(() => {
    if (!importedDatabase) return;
    importedDatabase.swapStorage(database);
    setDatabase(index, importedDatabase);
    importedDatabase.toExtraLocalDB();
    reset();
  }, [database, index, importedDatabase, reset, setDatabase]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(emotion_react_jsx_runtime_browser_esm/* Fragment */.HY, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        py: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
        color: importedDatabase ? "success" : "error",
        disabled: !importedDatabase,
        onClick: replaceDB,
        startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(UploadFile["default"], {}),
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "settings:uploadCard.replaceDatabase"
        })
      })
    })]
  });
}
;// CONCATENATED MODULE: ./src/app/PageSettings/DatabaseCard.tsx
let DatabaseCard_ = t => t,
  DatabaseCard_t,
  DatabaseCard_t2,
  DatabaseCard_t3,
  DatabaseCard_t4,
  DatabaseCard_t5,
  DatabaseCard_t6,
  DatabaseCard_t7;















function DatabaseCard() {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["settings"]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        py: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        variant: "subtitle1",
        children: t(DatabaseCard_t || (DatabaseCard_t = DatabaseCard_`DatabaseCard.title`))
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        display: "flex",
        flexDirection: "column",
        gap: 2
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        container: true,
        spacing: 2,
        columns: {
          xs: 1,
          md: 2
        },
        children: (0,Util/* range */.w6)(0, 3).map(i => (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
          item: true,
          xs: 1,
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DataCard, {
            index: i
          })
        }, i))
      })
    })]
  });
}
function DataCard({
  index
}) {
  const {
    databases,
    database: mainDB,
    setDatabase
  } = (0,react.useContext)(Database/* DatabaseContext */.t);
  const database = databases[index];
  const [{
    name,
    lastEdit
  }, setDBMeta] = (0,react.useState)(database.dbMeta.get());
  (0,react.useEffect)(() => database.dbMeta.follow((r, dbMeta) => setDBMeta(dbMeta)), [database]);
  // Need to update the dbMeta when database changes
  (0,react.useEffect)(() => setDBMeta(database.dbMeta.get()), [database]);
  const current = mainDB === database;
  const [uploadOpen, onOpen, onClose] = (0,useBoolState/* default */.Z)();
  const {
    t
  } = (0,es/* useTranslation */.$G)(["settings"]);
  const numChar = database.chars.keys.length;
  const numArt = database.arts.values.length;
  const numWeapon = database.weapons.values.length;
  const hasData = Boolean(numChar || numArt || numWeapon);
  const copyToClipboard = (0,react.useCallback)(() => navigator.clipboard.writeText(JSON.stringify(database.exportGOOD())).then(() => alert("Copied database to clipboard.")).catch(console.error), [database]);
  const onDelete = (0,react.useCallback)(() => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    database.clear();
    database.toExtraLocalDB();
  }, [database, name]);
  const download = (0,react.useCallback)(() => {
    const date = new Date();
    const dateStr = date.toISOString().split(".")[0].replace("T", "_").replaceAll(":", "-");
    const JSONStr = JSON.stringify(database.exportGOOD());
    const filename = `${name.trim().replaceAll(" ", "_")}_${dateStr}.json`;
    const contentType = "application/json;charset=utf-8";
    const a = document.createElement('a');
    a.download = filename;
    a.href = `data:${contentType},${encodeURIComponent(JSONStr)}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [database, name]);
  const onSwap = (0,react.useCallback)(() => {
    if (current) return;
    mainDB.toExtraLocalDB();
    database.swapStorage(mainDB);
    setDatabase(index, database);
  }, [index, setDatabase, mainDB, current, database]);
  const [tempName, setTempName] = (0,react.useState)(name);
  (0,react.useEffect)(() => setTempName(name), [name]);
  const onBlur = (0,react.useCallback)(() => {
    database.dbMeta.set({
      name: tempName
    });
    database.toExtraLocalDB();
  }, [tempName, database]);
  const onKeyDOwn = (0,react.useCallback)(e => e.key === "Enter" && onBlur(), [onBlur]);
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
    sx: {
      height: "100%",
      boxShadow: current ? "0px 0px 0px 2px green inset" : undefined
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
      sx: {
        display: "flex",
        gap: 1,
        justifyContent: "space-between"
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CustomNumberInput/* StyledInputBase */.el, {
        value: tempName,
        sx: {
          borderRadius: 1,
          px: 1,
          flexGrow: 1
        },
        onChange: e => setTempName(e.target.value),
        onBlur: onBlur,
        onKeyDown: onKeyDOwn
      }), !current && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
        startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* ImportExport */.nIC, {}),
        onClick: onSwap,
        color: "warning",
        children: t(DatabaseCard_t2 || (DatabaseCard_t2 = DatabaseCard_`DatabaseCard.button.swap`))
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Chip, {
        color: current ? "success" : "secondary",
        label: current ? t(DatabaseCard_t3 || (DatabaseCard_t3 = DatabaseCard_`DatabaseCard.currentDB`)) : `${t(DatabaseCard_t4 || (DatabaseCard_t4 = DatabaseCard_`DatabaseCard.title`))} ${database.dbIndex}`
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
        display: "flex",
        gap: 2,
        children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
          flexGrow: 1,
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
            noWrap: true,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
              t: t,
              i18nKey: "count.chars"
            }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
              children: numChar
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
            noWrap: true,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
              t: t,
              i18nKey: "count.arts"
            }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
              children: numArt
            })]
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
            noWrap: true,
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
              t: t,
              i18nKey: "count.weapons"
            }), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
              children: numWeapon
            })]
          }), !!lastEdit && (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
            noWrap: true,
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
              children: new Date(lastEdit).toLocaleString()
            })
          })]
        }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Box, {
          children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
            container: true,
            spacing: 1,
            columns: {
              xs: 2
            },
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              xs: 1,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                fullWidth: true,
                disabled: !hasData,
                color: "info",
                onClick: copyToClipboard,
                startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ContentPaste["default"], {}),
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "DatabaseCard.button.copy"
                })
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
              item: true,
              xs: 1,
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(ModalWrapper/* default */.Z, {
                open: uploadOpen,
                onClose: onClose,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(UploadCard, {
                  index: index,
                  onReplace: onClose
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                fullWidth: true,
                component: "span",
                color: "info",
                startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Upload */.gqx, {}),
                onClick: onOpen,
                children: t(DatabaseCard_t5 || (DatabaseCard_t5 = DatabaseCard_`DatabaseCard.button.upload`))
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              xs: 1,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                fullWidth: true,
                disabled: !hasData,
                onClick: download,
                startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Download */.UWx, {}),
                children: t(DatabaseCard_t6 || (DatabaseCard_t6 = DatabaseCard_`DatabaseCard.button.download`))
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
              item: true,
              xs: 1,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Button, {
                fullWidth: true,
                disabled: !hasData,
                color: "error",
                onClick: onDelete,
                startIcon: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Delete */.HG3, {}),
                children: t(DatabaseCard_t7 || (DatabaseCard_t7 = DatabaseCard_`DatabaseCard.button.delete`))
              })
            })]
          })
        })]
      })
    })]
  });
}
// EXTERNAL MODULE: ./src/app/Components/DropdownMenu/DropdownButton.tsx
var DropdownButton = __webpack_require__(645475);
// EXTERNAL MODULE: ./src/app/Components/SqBadge.tsx
var SqBadge = __webpack_require__(783673);
// EXTERNAL MODULE: ./src/app/i18n.ts + 12 modules
var app_i18n = __webpack_require__(947955);
;// CONCATENATED MODULE: ./src/app/PageSettings/LanguageCard.tsx








function LanguageCard() {
  const {
    t
  } = (0,es/* useTranslation */.$G)();
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardLight/* default */.Z, {
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
      sx: {
        py: 1
      },
      children: [t("settings:languageCard.selectLanguage"), " ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(SqBadge/* default */.Z, {
        color: "warning",
        children: t("ui:underConstruction")
      })]
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(LanguageDropdown, {})
    })]
  });
}
const nativeLanguages = {
  "chs": "简体中文",
  "cht": "繁體中文",
  "de": "Deutsch",
  "en": "English",
  "es": "Español",
  "fr": "Français",
  "id": "Bahasa Indonesia",
  "it": "Italiano",
  "ja": "日本語",
  "ko": "한국어",
  "pt": "Português",
  "ru": "Русский язык",
  "th": "ภาษาไทย",
  "tr": "Türkçe",
  "vi": "Tiếng Việt"
};
function LanguageDropdown() {
  const {
    t,
    i18n
  } = (0,es/* useTranslation */.$G)(["ui", "settings"]);
  const onSetLanguage = lang => () => i18n.changeLanguage(lang);
  const currentLang = i18n.languages[0];
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DropdownButton/* default */.Z, {
    fullWidth: true,
    title: t('settings:languageCard.languageFormat', {
      language: t(`languages:${currentLang}`)
    }),
    children: app_i18n/* languageCodeList.map */.C.map(lang => (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.MenuItem, {
      selected: currentLang === lang,
      disabled: currentLang === lang,
      onClick: onSetLanguage(lang),
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
        i18nKey: `languages:${lang}`
      }), lang !== currentLang ? ` (${nativeLanguages[lang]})` : ""]
    }, lang))
  });
}
;// CONCATENATED MODULE: ./src/app/PageSettings/index.tsx








function PageSettings() {
  const {
    t
  } = (0,es/* useTranslation */.$G)(["settings"]);
  dist/* default.send */.ZP.send({
    hitType: "pageview",
    page: '/setting'
  });
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
    sx: {
      my: 1
    },
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
      sx: {
        py: 1
      },
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
        variant: "subtitle1",
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
          t: t,
          i18nKey: "title"
        })
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Divider, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
      sx: {
        display: "flex",
        flexDirection: "column",
        gap: 2
      },
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(LanguageCard, {}), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DatabaseCard, {})]
    })]
  });
}

/***/ })

}]);