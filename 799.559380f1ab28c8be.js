"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[799],{

/***/ 446799:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ PageScanner)
});

// EXTERNAL MODULE: ../../node_modules/@mui/icons-material/index.js
var icons_material = __webpack_require__(111084);
// EXTERNAL MODULE: ../../node_modules/@mui/material/node/index.js
var node = __webpack_require__(206963);
// EXTERNAL MODULE: ../../node_modules/react-ga4/dist/index.js
var dist = __webpack_require__(761877);
// EXTERNAL MODULE: ../../node_modules/react-i18next/dist/es/index.js + 17 modules
var es = __webpack_require__(732696);
// EXTERNAL MODULE: ../../node_modules/react-router-dom/dist/umd/react-router-dom.production.min.js
var react_router_dom_production_min = __webpack_require__(232175);
// EXTERNAL MODULE: ./src/app/Components/Card/CardDark.tsx
var CardDark = __webpack_require__(87985);
// EXTERNAL MODULE: ./src/app/Components/SqBadge.tsx
var SqBadge = __webpack_require__(783673);
// EXTERNAL MODULE: ./src/app/SVGIcons/DiscordIcon.tsx
var DiscordIcon = __webpack_require__(607380);
;// CONCATENATED MODULE: ./src/app/PageScanner/AdeptiScanner.png
/* harmony default export */ const AdeptiScanner = (__webpack_require__.p + "AdeptiScanner.f5ff38954cfeb5f480c5.png");
;// CONCATENATED MODULE: ./src/app/PageScanner/Amenoma.png
/* harmony default export */ const Amenoma = (__webpack_require__.p + "Amenoma.9c8e5ee618afb8d6ccfa.png");
;// CONCATENATED MODULE: ./src/app/PageScanner/artiscan.png
/* harmony default export */ const artiscan = (__webpack_require__.p + "artiscan.6529d93b5a4e6666af46.png");
;// CONCATENATED MODULE: ./src/app/PageScanner/GIScanner.png
/* harmony default export */ const GIScanner = (__webpack_require__.p + "GIScanner.e91feac86697230f39e3.png");
// EXTERNAL MODULE: ../../node_modules/@emotion/react/jsx-runtime/dist/emotion-react-jsx-runtime.browser.esm.js
var emotion_react_jsx_runtime_browser_esm = __webpack_require__(552903);
;// CONCATENATED MODULE: ./src/app/PageScanner/index.tsx














function PageScanner() {
  const {
    t
  } = (0,es/* useTranslation */.$G)('page_scanner');
  dist/* default.send */.ZP.send({
    hitType: "pageview",
    page: '/scanner'
  });
  return (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    my: 1,
    children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(CardDark/* default */.Z, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardContent, {
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
          t: t,
          i18nKey: "intro",
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
            variant: "h5",
            children: "Scanners"
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
            gutterBottom: true,
            children: "Scanners are Genshin tools that can automatically scan game data from screenshots or directly from the game."
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
            gutterBottom: true,
            children: "Below are several scanners that have been tested with GO."
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
            variant: "subtitle2",
            children: ["To upload the exported file, go to ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Link, {
              component: react_router_dom_production_min.Link,
              to: "/setting",
              children: "Settings"
            }), " page, and upload your file in the ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("strong", {
              children: "Database Upload"
            }), " section."]
          })]
        })
      })
    }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Grid, {
      container: true,
      columns: {
        xs: 1,
        md: 2,
        lg: 3
      },
      spacing: 2,
      children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        xs: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
          sx: {
            height: "100%"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardActionArea, {
            href: "https://artiscan.ninjabay.org/",
            target: "_blank",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardMedia, {
              component: "img",
              image: artiscan
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              display: "flex",
              gap: 1,
              alignItems: "center",
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                variant: "h5",
                flexGrow: 1,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "nb.title",
                  children: "Artiscan"
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.IconButton, {
                href: "https://artiscan.ninjabay.org/",
                target: "_blank",
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* InsertLink */.cxZ, {})
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.IconButton, {
                href: "https://youtu.be/_qzzunuef4Y",
                target: "_blank",
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* YouTube */._F3, {})
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              variant: "subtitle2",
              sx: {
                display: "flex",
                gap: 1,
                py: 1,
                flexWrap: "wrap"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                color: "success",
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Gamepad */.nJg, {
                  sx: {
                    pr: 0.5
                  }
                }), "3.4"]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Computer */.ar$, {
                  sx: {
                    pr: 0.5
                  }
                }), t("tags.pc")]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* SendToMobile */.aS5, {
                  sx: {
                    pr: 0.5
                  }
                }), t("tags.mobile")]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* SportsEsports */.MA2, {
                  sx: {
                    pr: 0.5
                  }
                }), t("tags.ps")]
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: t("nb.p1")
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: t("nb.p2")
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: t("nb.p3")
            })]
          })]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        xs: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
          sx: {
            height: "100%"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardActionArea, {
            href: "https://github.com/Andrewthe13th/Inventory_Kamera",
            target: "_blank",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardMedia, {
              component: "img",
              image: GIScanner
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              display: "flex",
              gap: 1,
              alignItems: "center",
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                variant: "h5",
                flexGrow: 1,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "ik.title",
                  children: "Inventory Kamera"
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.IconButton, {
                href: "https://discord.gg/zh56aVWe3U",
                target: "_blank",
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DiscordIcon/* default */.Z, {})
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.IconButton, {
                href: "https://github.com/Andrewthe13th/Inventory_Kamera",
                target: "_blank",
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Download */.UWx, {})
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              variant: "subtitle2",
              sx: {
                display: "flex",
                gap: 1,
                py: 1,
                flexWrap: "wrap"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                color: "success",
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Gamepad */.nJg, {
                  sx: {
                    pr: 0.5
                  }
                }), "3.4"]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Computer */.ar$, {
                  sx: {
                    pr: 0.5
                  }
                }), t("tags.pc")]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Backpack */.jw9, {
                  sx: {
                    pr: 0.5
                  }
                }), t("tags.materials")]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* PersonSearch */.YlR, {
                  sx: {
                    pr: 0.5
                  }
                }), t("tags.characters")]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WarningWrapper, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                  color: "warning",
                  sx: {
                    display: "flex",
                    alignItems: "center"
                  },
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Warning */.v3j, {
                    sx: {
                      pr: 0.5
                    }
                  }), t("tags.gameMani")]
                })
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                t: t,
                i18nKey: "ik.p1",
                children: "This light-weight app will scan all your characters + weapons + artifacts in your inventory. Follow the instrutions in the app to set it up."
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                t: t,
                i18nKey: "ik.p2",
                children: ["This scanner can also scan materials for ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Link, {
                  href: "https://seelie.me/",
                  target: "_blank",
                  rel: "noreferrer",
                  children: "Seelie.me"
                })]
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                t: t,
                i18nKey: "goodeng",
                children: "This scanner only scans in english, and exports to GOOD format."
              })
            })]
          })]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        xs: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
          sx: {
            height: "100%"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardActionArea, {
            href: "https://github.com/D1firehail/AdeptiScanner-GI",
            target: "_blank",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardMedia, {
              component: "img",
              image: AdeptiScanner
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              display: "flex",
              gap: 1,
              alignItems: "center",
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                variant: "h5",
                flexGrow: 1,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "as.title",
                  children: "AdeptiScanner"
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.IconButton, {
                href: "https://github.com/D1firehail/AdeptiScanner-GI",
                target: "_blank",
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Download */.UWx, {})
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              variant: "subtitle2",
              sx: {
                display: "flex",
                gap: 1,
                py: 1,
                flexWrap: "wrap"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                color: "success",
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Gamepad */.nJg, {
                  sx: {
                    pr: 0.5
                  }
                }), "3.4"]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Computer */.ar$, {
                  sx: {
                    pr: 0.5
                  }
                }), t("tags.pc")]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WarningWrapper, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                  color: "warning",
                  sx: {
                    display: "flex",
                    alignItems: "center"
                  },
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Warning */.v3j, {
                    sx: {
                      pr: 0.5
                    }
                  }), t("tags.gameMani")]
                })
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                t: t,
                i18nKey: "as.p1",
                children: "Scans all artifacts in your inventory. Has a manual scanning mode."
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                t: t,
                i18nKey: "as.p2",
                children: "This scanner can also be configured for new artifacts in new game versions without needing an update."
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                t: t,
                i18nKey: "goodeng",
                children: "This scanner only scans in english, and exports to GOOD format."
              })
            })]
          })]
        })
      }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Grid, {
        item: true,
        xs: 1,
        children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(CardDark/* default */.Z, {
          sx: {
            height: "100%"
          },
          children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardActionArea, {
            href: "https://github.com/daydreaming666/Amenoma",
            target: "_blank",
            children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.CardMedia, {
              component: "img",
              image: Amenoma
            })
          }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.CardContent, {
            children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Box, {
              display: "flex",
              gap: 1,
              alignItems: "center",
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
                variant: "h5",
                flexGrow: 1,
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(es/* Trans */.cC, {
                  t: t,
                  i18nKey: "am.title",
                  children: "\u300C\u5929\u76EE\u300D-- Amenoma"
                })
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.IconButton, {
                href: "https://discord.gg/BTrCYgVGFP",
                target: "_blank",
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(DiscordIcon/* default */.Z, {})
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.IconButton, {
                href: "https://github.com/daydreaming666/Amenoma",
                target: "_blank",
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Download */.UWx, {})
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(node.Typography, {
              variant: "subtitle2",
              sx: {
                display: "flex",
                gap: 1,
                py: 1,
                flexWrap: "wrap"
              },
              children: [(0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                color: "warning",
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Gamepad */.nJg, {
                  sx: {
                    pr: 0.5
                  }
                }), "3.0"]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Computer */.ar$, {
                  sx: {
                    pr: 0.5
                  }
                }), t("tags.pc")]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                sx: {
                  display: "flex",
                  alignItems: "center"
                },
                children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Backpack */.jw9, {
                  sx: {
                    pr: 0.5
                  }
                }), t("tags.materials")]
              }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(WarningWrapper, {
                children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(SqBadge/* default */.Z, {
                  color: "warning",
                  sx: {
                    display: "flex",
                    alignItems: "center"
                  },
                  children: [(0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(icons_material/* Warning */.v3j, {
                    sx: {
                      pr: 0.5
                    }
                  }), t("tags.gameMani")]
                })
              })]
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                t: t,
                i18nKey: "am.p1",
                children: ["Scans all you artifacts in your inventory. Follow the instruction to capture the window and scan. Has both Chinese and English versions. (Download the ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("code", {
                  children: "_EN.exe"
                }), " version to scan in english). Only the", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)("code", {
                  children: "GOOD"
                }), " format is accepted in GO."]
              })
            }), (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
              gutterBottom: true,
              children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
                t: t,
                i18nKey: "am.p2",
                children: ["This scanner can also scan materials for ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Link, {
                  href: "https://seelie.me/",
                  target: "_blank",
                  rel: "noreferrer",
                  children: "Seelie.me"
                })]
              })
            })]
          })]
        })
      })]
    })]
  });
}
function WarningWrapper({
  children
}) {
  const {
    t
  } = (0,es/* useTranslation */.$G)('page_scanner');
  return (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Tooltip, {
    placement: "top",
    title: (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Typography, {
      children: (0,emotion_react_jsx_runtime_browser_esm/* jsxs */.BX)(es/* Trans */.cC, {
        t: t,
        i18nKey: "tosWarn",
        children: ["As any tools that indirectly interact with the game, although their usage is virtually undetectable, ", (0,emotion_react_jsx_runtime_browser_esm/* jsx */.tZ)(node.Link, {
          color: "inherit",
          href: "https://genshin.mihoyo.com/en/news/detail/5763",
          target: "_blank",
          rel: "noreferrer",
          children: "there could still be risk with using them."
        }), " Users discretion is advised."]
      })
    }),
    children: children
  });
}

/***/ })

}]);