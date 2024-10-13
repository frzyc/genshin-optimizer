import { u as useTeam, a as useDatabase, ae as useBoolState, b as jsx, d as jsxs, f as Box, C as CardActionArea, T as Typography, B as BootstrapTooltip, e as default_1, aj as IconButton, aq as default_1$1, R as React, N as Divider, bQ as NextImage, Y as imgAssets, h as CardThemed, i as useCharacter, bL as useDBMeta, r as reactExports, a$ as SillyContext, bS as getCharStat, k as getBuildTcArtifactData, l as useCharData, cX as characterAsset, g as getCharEle, D as DataContext, S as Skeleton, bY as getLevelString, aS as ColorText, V as ElementIcon, bT as iconAsset, o as default_1$2, p as default_1$3, t as CharacterContext, bV as weaponAsset, cY as weaponHasRefinement, z as useTranslation, cZ as ArtifactSlotName, ct as artifactAsset, ck as Fragment, _ as SlotIcon, c_ as StatIcon } from "./index-B8aczfSH.js";
import { u as useTeamChar, c as colorToRgbaString, h as hexToColor } from "./useTeamChar-BvbCmyyu.js";
import { T as TeamDelModal } from "./TeamDelModal-uSLv0Wq8.js";
function TeamCard({
  teamId,
  onClick,
  bgt
}) {
  const team = useTeam(teamId);
  const { name, description, loadoutData } = team;
  const database = useDatabase();
  const [showDel, onShowDel, onHideDel] = useBoolState();
  return /* @__PURE__ */ jsx(
    CardThemed,
    {
      bgt,
      sx: {
        height: "100%",
        border: "1px rgba(200,200,200,0.4) solid"
      },
      children: /* @__PURE__ */ jsxs(
        Box,
        {
          sx: {
            height: "100%",
            display: "flex",
            flexDirection: "column"
          },
          children: [
            /* @__PURE__ */ jsxs(
              Box,
              {
                sx: {
                  display: "flex",
                  flexDirection: "row"
                },
                children: [
                  /* @__PURE__ */ jsx(CardActionArea, { onClick: () => onClick(), sx: { p: 1 }, children: /* @__PURE__ */ jsxs(Typography, { sx: { display: "flex", gap: 1 }, variant: "h6", children: [
                    /* @__PURE__ */ jsx("span", { children: name }),
                    " ",
                    description && /* @__PURE__ */ jsx(
                      BootstrapTooltip,
                      {
                        title: /* @__PURE__ */ jsx(Typography, { children: description }),
                        children: /* @__PURE__ */ jsx(default_1, {})
                      }
                    )
                  ] }) }),
                  /* @__PURE__ */ jsx(
                    TeamDelModal,
                    {
                      teamId,
                      show: showDel,
                      onHide: onHideDel,
                      onDel: function() {
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(IconButton, { onClick: onShowDel, color: "error", children: /* @__PURE__ */ jsx(default_1$1, {}) })
                ]
              }
            ),
            /* @__PURE__ */ jsx(Box, { sx: { marginTop: "auto" }, children: loadoutData.map((loadoutDatum, i) => {
              var _a;
              const teamCharId = loadoutDatum == null ? void 0 : loadoutDatum.teamCharId;
              const characterKey = teamCharId && ((_a = database.teamChars.get(teamCharId)) == null ? void 0 : _a.key);
              return /* @__PURE__ */ jsxs(React.Fragment, { children: [
                /* @__PURE__ */ jsx(Divider, {}),
                characterKey ? /* @__PURE__ */ jsx(CardActionArea, { onClick: () => onClick(characterKey), children: /* @__PURE__ */ jsx(
                  CharacterArea,
                  {
                    characterKey,
                    teamId,
                    teamCharId
                  }
                ) }) : /* @__PURE__ */ jsx(
                  CardActionArea,
                  {
                    onClick: () => onClick(),
                    sx: { height: 120, position: "relative" },
                    children: /* @__PURE__ */ jsx(
                      Box,
                      {
                        sx: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          // py: '12.5%',
                          height: 120,
                          backgroundColor: "neutral600.main"
                        },
                        children: /* @__PURE__ */ jsx(
                          Box,
                          {
                            component: NextImage ? NextImage : "img",
                            src: imgAssets.team[`team${i + 1}`],
                            sx: {
                              width: "auto",
                              my: "15px",
                              height: 90,
                              opacity: 0.7,
                              mx: "auto"
                            }
                          }
                        )
                      }
                    )
                  }
                )
              ] }, i);
            }) })
          ]
        }
      )
    }
  );
}
const zVals = {
  banner: 0,
  bannerFilter: 1,
  characterIcon: 2,
  darkDRop: 3,
  other: 4
};
function CharacterArea({
  characterKey,
  teamId,
  teamCharId
}) {
  var _a;
  const database = useDatabase();
  const character = useCharacter(characterKey);
  const { gender } = useDBMeta();
  const { silly } = reactExports.useContext(SillyContext);
  const charStat = getCharStat(characterKey);
  const { name } = useTeamChar(teamCharId);
  const loadoutDatum = database.teams.getLoadoutDatum(teamId, teamCharId);
  const buildname = database.teams.getActiveBuildName(loadoutDatum);
  const weapon = reactExports.useMemo(
    () => database.teams.getLoadoutWeapon(loadoutDatum),
    [loadoutDatum, database]
  );
  const arts = (() => {
    const { buildType, buildTcId } = loadoutDatum;
    if (buildType === "tc" && buildTcId)
      return getBuildTcArtifactData(database.buildTcs.get(buildTcId));
    return Object.values(
      database.teams.getLoadoutArtifacts(loadoutDatum)
    ).filter((a) => a);
  })();
  const artifactData = reactExports.useMemo(
    () => database.teams.getLoadoutArtifactData(loadoutDatum),
    [database, loadoutDatum]
  );
  const teamData = useCharData(characterKey, void 0, arts, weapon);
  const data = (_a = teamData == null ? void 0 : teamData[characterKey]) == null ? void 0 : _a.target;
  const characterContextObj = reactExports.useMemo(
    () => character && {
      character
    },
    [character]
  );
  const dataContextObj = reactExports.useMemo(
    () => data && teamData && {
      data,
      teamData
    },
    [data, teamData]
  );
  const banner = characterAsset(characterKey, "banner", gender);
  const element = getCharEle(characterKey);
  if (!characterContextObj || !dataContextObj)
    return null;
  return /* @__PURE__ */ jsx(CharacterContext.Provider, { value: characterContextObj, children: /* @__PURE__ */ jsx(DataContext.Provider, { value: dataContextObj, children: /* @__PURE__ */ jsx(
    reactExports.Suspense,
    {
      fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 300 }),
      children: /* @__PURE__ */ jsxs(
        Box,
        {
          className: !banner ? `grad-${charStat.rarity}star` : void 0,
          sx: {
            display: "flex",
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              opacity: 0.5,
              backgroundImage: `url(${banner})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              zIndex: zVals.banner
            }
          },
          children: [
            /* @__PURE__ */ jsx(
              Box,
              {
                sx: (theme) => ({
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  zIndex: zVals.bannerFilter,
                  backdropFilter: "blur(3px)",
                  background: `linear-gradient(to right, ${colorToRgbaString(
                    hexToColor(theme.palette.neutral600.main),
                    0.8
                  )}, ${colorToRgbaString(
                    hexToColor(theme.palette.neutral600.main),
                    0.4
                  )} 100% )`
                })
              }
            ),
            /* @__PURE__ */ jsx(
              Box,
              {
                sx: (theme) => ({
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  zIndex: zVals.darkDRop,
                  // dark gradient
                  background: `linear-gradient(to top, ${colorToRgbaString(
                    hexToColor(theme.palette.neutral600.main),
                    0.9
                  )}, rgba(0,0,0,0) 25% )`
                })
              }
            ),
            /* @__PURE__ */ jsxs(
              Box,
              {
                sx: {
                  height: 120,
                  width: 120,
                  position: "absolute",
                  zIndex: zVals.other
                },
                children: [
                  character && /* @__PURE__ */ jsx(
                    Typography,
                    {
                      sx: {
                        position: "absolute",
                        lineHeight: 1,
                        bottom: 0,
                        p: 0.5,
                        textShadow: "0 0 5px black"
                      },
                      children: getLevelString(character.level, character.ascension)
                    }
                  ),
                  character && /* @__PURE__ */ jsxs(
                    Typography,
                    {
                      sx: {
                        position: "absolute",
                        lineHeight: 1,
                        bottom: 0,
                        right: 0,
                        p: 0.5,
                        textShadow: "0 0 5px black"
                      },
                      children: [
                        "C",
                        character.constellation
                      ]
                    }
                  ),
                  characterKey.startsWith("Traveler") && /* @__PURE__ */ jsx(
                    Typography,
                    {
                      sx: {
                        position: "absolute",
                        lineHeight: 1,
                        top: 0,
                        left: 0,
                        p: 0.5,
                        textShadow: "0 0 5px black"
                      },
                      children: /* @__PURE__ */ jsx(ColorText, { color: element, children: /* @__PURE__ */ jsx(ElementIcon, { ele: element }) })
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Box,
              {
                component: NextImage ? NextImage : "img",
                src: iconAsset(characterKey, gender, silly),
                sx: {
                  height: 120,
                  width: 120,
                  zIndex: zVals.characterIcon
                }
              }
            ),
            /* @__PURE__ */ jsxs(
              Box,
              {
                sx: {
                  pr: 0.5,
                  pl: 0.5,
                  py: 0.5,
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  width: "100%",
                  minWidth: 0,
                  justifyContent: "space-between",
                  zIndex: zVals.other
                },
                children: [
                  /* @__PURE__ */ jsxs(
                    Typography,
                    {
                      noWrap: true,
                      sx: {
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        textShadow: "0 0 5px black"
                      },
                      children: [
                        /* @__PURE__ */ jsx(default_1$2, {}),
                        /* @__PURE__ */ jsx("span", { children: name })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    Typography,
                    {
                      noWrap: true,
                      sx: {
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        textShadow: "0 0 5px black"
                      },
                      children: [
                        /* @__PURE__ */ jsx(default_1$3, {}),
                        /* @__PURE__ */ jsx("span", { children: buildname })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", mb: 0.5, gap: 1 }, children: [
                    /* @__PURE__ */ jsx(WeaponCard, { weapon }),
                    /* @__PURE__ */ jsx(ArtifactCard, { artifactData })
                  ] })
                ]
              }
            )
          ]
        }
      )
    }
  ) }) });
}
function WeaponCard({ weapon }) {
  return /* @__PURE__ */ jsxs(
    CardThemed,
    {
      bgt: "neutral600",
      sx: {
        height: "100%",
        maxHeight: "50px",
        display: "flex",
        flexDirection: "horizontal",
        boxShadow: `0 0 10px rgba(0,0,0,0.4)`
      },
      children: [
        /* @__PURE__ */ jsx(
          Box,
          {
            component: NextImage ? NextImage : "img",
            src: weaponAsset(weapon.key, weapon.ascension >= 2),
            maxWidth: "100%",
            maxHeight: "100%",
            sx: { mt: "auto" }
          }
        ),
        /* @__PURE__ */ jsxs(
          Box,
          {
            sx: {
              pr: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              color: "neutral200.main"
            },
            children: [
              /* @__PURE__ */ jsx(Typography, { sx: {}, children: getLevelString(weapon.level, weapon.ascension) }),
              weaponHasRefinement(weapon.key) && /* @__PURE__ */ jsxs(Typography, { children: [
                "R",
                weapon.refinement
              ] })
            ]
          }
        )
      ]
    }
  );
}
function ArtifactCard({ artifactData }) {
  const { setNum = {}, mains = {} } = artifactData;
  const { t } = useTranslation("statKey_gen");
  const processedSetNum = Object.entries(setNum).filter(
    ([, num]) => num === 2 || num === 4
  );
  return /* @__PURE__ */ jsxs(
    CardThemed,
    {
      bgt: "neutral600",
      sx: {
        height: "100%",
        maxHeight: "50px",
        display: "flex",
        flexDirection: "horizontal",
        boxShadow: `0 0 10px rgba(0,0,0,0.4)`,
        flexGrow: 1
      },
      children: [
        /* @__PURE__ */ jsx(
          Box,
          {
            sx: {
              Width: "50px",
              minWidth: "50px",
              height: "50px",
              position: "relative"
            },
            children: processedSetNum.length === 2 ? /* @__PURE__ */ jsx(Set22, { sets: processedSetNum.map(([set]) => set) }) : processedSetNum.length === 1 ? /* @__PURE__ */ jsx(Set4, { set: processedSetNum[0][0], num: processedSetNum[0][1] }) : false
          }
        ),
        /* @__PURE__ */ jsx(
          Box,
          {
            sx: {
              display: "flex",
              flexGrow: 1,
              position: "relative",
              justifyContent: "space-around",
              alignItems: "center"
            },
            children: Object.entries(mains).filter(([, statKey]) => statKey).map(([slotKey, statKey]) => {
              const slotIcon = /* @__PURE__ */ jsx(
                SlotIcon,
                {
                  slotKey,
                  iconProps: { sx: { fontSize: "inherit" } }
                }
              );
              const statIcon = /* @__PURE__ */ jsx(
                StatIcon,
                {
                  statKey,
                  iconProps: { sx: { fontSize: "inherit" } }
                }
              );
              return /* @__PURE__ */ jsx(
                BootstrapTooltip,
                {
                  title: /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsxs(reactExports.Suspense, { fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "text" }), children: [
                    /* @__PURE__ */ jsxs(
                      Typography,
                      {
                        sx: {
                          display: "flex",
                          gap: 1,
                          alignItems: "center"
                        },
                        children: [
                          slotIcon,
                          /* @__PURE__ */ jsx(ArtifactSlotName, { slotKey })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Typography,
                      {
                        sx: {
                          display: "flex",
                          gap: 1,
                          alignItems: "center"
                        },
                        children: [
                          statIcon,
                          t(statKey)
                        ]
                      }
                    )
                  ] }) }),
                  children: /* @__PURE__ */ jsxs(Typography, { sx: { lineHeight: 0 }, children: [
                    slotIcon,
                    statIcon
                  ] })
                },
                slotKey + statKey
              );
            })
          }
        )
      ]
    }
  );
}
function Set22({ sets }) {
  const set1 = sets[0];
  const set2 = sets[1];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Box,
      {
        component: NextImage ? NextImage : "img",
        sx: {
          position: "absolute",
          top: 0,
          left: 0,
          Width: "50px",
          height: "50px",
          clipPath: `polygon(0 0, 0 100%, 100% 0)`
        },
        src: artifactAsset(set1, "flower")
      }
    ),
    /* @__PURE__ */ jsx(
      Box,
      {
        component: NextImage ? NextImage : "img",
        sx: {
          position: "absolute",
          top: 0,
          left: 0,
          Width: "50px",
          height: "50px",
          clipPath: `polygon(100% 100%, 0 100%, 100% 0)`
        },
        src: artifactAsset(set2, "flower")
      }
    ),
    /* @__PURE__ */ jsx(
      Box,
      {
        className: "botright",
        sx: (theme) => ({
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "1.4em",
          padding: "0.2em",
          textAlign: "center",
          backgroundColor: colorToRgbaString(
            hexToColor(theme.palette.primary.main),
            0.4
          ),
          borderRadius: "100%"
        }),
        children: "2"
      }
    ),
    /* @__PURE__ */ jsx(
      Box,
      {
        sx: (theme) => ({
          position: "absolute",
          top: 0,
          left: 0,
          width: "1.4em",
          padding: "0.2em",
          textAlign: "center",
          backgroundColor: colorToRgbaString(
            hexToColor(theme.palette.primary.main),
            0.4
          ),
          borderRadius: "100%"
        }),
        children: "2"
      }
    )
  ] });
}
function Set4({ set, num }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Box,
      {
        sx: (theme) => ({
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "1.4em",
          padding: "0.2em",
          textAlign: "center",
          backgroundColor: colorToRgbaString(
            hexToColor(theme.palette.primary.main),
            0.4
          ),
          borderRadius: "100%"
        }),
        children: num
      }
    ),
    /* @__PURE__ */ jsx(
      Box,
      {
        component: NextImage ? NextImage : "img",
        src: artifactAsset(set, "flower"),
        sx: { Width: "50px", height: "50px" }
      }
    )
  ] });
}
export {
  TeamCard as T
};
