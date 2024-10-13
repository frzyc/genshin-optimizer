import { z as useTranslation, b as jsx, d as jsxs, ad as Trans, av as Alert, a as useDatabase, A as useNavigate, r as reactExports, bS as getCharStat, f as Box, G as Grid, h as CardThemed, cq as WeaponCardNano, cr as ArtifactCardNano, c5 as getWeaponSheet, cs as WeaponCardNanoObj, X as ImgIcon, ct as artifactAsset, bJ as ArtifactSetName, ap as SqBadge, _ as SlotIcon, cu as StatWithUnit, cv as artDisplayValue, cw as getUnitStr, M as CardHeader, aj as IconButton, ak as default_1$2, N as Divider, O as CardContent, T as Typography, cx as List, c3 as ListItem, cp as Tooltip, p as default_1$3, e as default_1$4, cy as default_1$5, ab as default_1$6, cz as CardActions, ag as Button, aq as default_1$7, al as ModalWrapper, ae as useBoolState, cA as useOptConfig, cB as crawlObject, o as default_1$8, cC as OptimizationIcon, aw as Stack, aI as default_1$a, cD as default_1$b, cE as KeyMap, bR as DocumentDisplay, C as CardActionArea, ck as Fragment, v as requireCreateSvgIcon, w as interopRequireDefaultExports, j as jsxRuntimeExports, t as CharacterContext, bL as useDBMeta, bM as getCharSheet, a$ as SillyContext, cm as charKeyToLocGenderedCharKey, cF as LevelSelect, cG as CharacterCardStats, cH as CharacterConstellationName, D as DataContext, c0 as uiInput, E as objKeyMap, J as allArtifactSlotKeys, cI as charKeyToLocCharKey, at as useForceUpdate, bP as CharacterName, S as Skeleton, i as useCharacter, l as useCharData, cJ as GraphContext, cd as useMatch, cK as isCharacterKey, aC as useMediaQueryUp, ac as ReactGA, aF as filterFunction, aG as sortFunction, b5 as catTotal, aH as useInfScroll, b8 as WeaponToggle, cL as ElementToggle, cM as CharacterRarityToggle, bj as TextField, aL as ShowingAndSortOptionSelect, cN as CharacterCard, cO as characterSortMap, cP as characterFilterConfigs, cQ as characterSortConfigs, I as getWeaponStat, H as allWeaponTypeKeys, g as getCharEle, F as allElementKeys, cR as allCharacterRarityKeys, cS as CharacterSelectionModal } from "./index-B8aczfSH.js";
import { u as useBuild, B as BuildCard, a as useBuildTc, L as LoadoutInfoAlert, T as TextFieldLazy, d as default_1$9, b as BuildInfoAlert, c as TCBuildInfoAlert, e as TeamInfoAlert, C as CharacterCoverArea, f as CharacterCompactConstSelector, g as TalentDropdown, E as EquippedGrid } from "./LoadoutInfoAlert-CVI2bUVf.js";
import { T as TeamCard } from "./TeamCard-KG0n7Xn9.js";
import { u as useTeamChar } from "./useTeamChar-BvbCmyyu.js";
import { O as OptimizationTargetDisplay, L as LoadoutHeaderContent } from "./TeamDelModal-uSLv0Wq8.js";
import "./Settings-ctf56yjV.js";
function AddTeamInfo() {
  const { t } = useTranslation("page_character");
  return /* @__PURE__ */ jsx(Alert, { severity: "warning", children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "noLoadout", children: [
    "Looks like you haven't added any loadout/Teams with this character yet. You need to create a loadout+team with this character to",
    " ",
    /* @__PURE__ */ jsx("strong", { children: "create builds" }),
    ", ",
    /* @__PURE__ */ jsx("strong", { children: "theorycraft" }),
    ", or",
    " ",
    /* @__PURE__ */ jsx("strong", { children: "optimize" }),
    "."
  ] }) });
}
function useCharSelectionCallback() {
  const database = useDatabase();
  const navigate = useNavigate();
  const cb = reactExports.useCallback(
    (characterKey) => {
      const character = database.chars.get(characterKey);
      if (!character) {
        database.chars.getWithInitWeapon(characterKey);
      }
      navigate(`/characters/${characterKey}`);
    },
    [navigate, database]
  );
  return cb;
}
function BuildRealSimplified({
  buildId,
  characterKey
}) {
  const { name, description, weaponId, artifactIds } = useBuild(buildId);
  const weaponTypeKey = getCharStat(characterKey).weaponType;
  return /* @__PURE__ */ jsx(BuildCard, { name, description, hideFooter: true, children: /* @__PURE__ */ jsx(
    Box,
    {
      sx: {
        display: "flex",
        flexDirection: "column",
        gap: 1,
        alignItems: "stretch"
      },
      children: /* @__PURE__ */ jsxs(
        Grid,
        {
          container: true,
          spacing: 1,
          columns: { xs: 2, sm: 2, md: 2, lg: 3, xl: 3 },
          children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(CardThemed, { sx: { height: "100%", maxHeight: "8em" }, children: /* @__PURE__ */ jsx(
              WeaponCardNano,
              {
                weaponId,
                weaponTypeKey
              }
            ) }) }),
            Object.entries(artifactIds).map(([slotKey, id]) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(CardThemed, { sx: { height: "100%", maxHeight: "8em" }, children: /* @__PURE__ */ jsx(ArtifactCardNano, { artifactId: id, slotKey }) }) }, id || slotKey))
          ]
        }
      )
    }
  ) });
}
function BuildTcSimplified({ buildTcId }) {
  const buildTc = useBuildTc(buildTcId);
  const { name, description } = buildTc;
  return /* @__PURE__ */ jsx(BuildCard, { name, description, hideFooter: true, children: /* @__PURE__ */ jsx(TcEquip, { buildTcId }) });
}
function TcEquip({ buildTcId }) {
  const {
    weapon,
    artifact: {
      slots,
      substats: { stats: substats },
      sets
    }
  } = useBuildTc(buildTcId);
  const weaponSheet = getWeaponSheet(weapon.key);
  const substatsArr = Object.entries(substats);
  const substatsArr1 = substatsArr.slice(0, 5);
  const substatsArr2 = substatsArr.slice(5);
  return /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsxs(
    Grid,
    {
      container: true,
      spacing: 1,
      columns: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
      children: [
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
          /* @__PURE__ */ jsx(
            WeaponCardNanoObj,
            {
              weapon,
              weaponSheet
            }
          ),
          !!Object.keys(sets).length && /* @__PURE__ */ jsx(CardThemed, { sx: { flexGrow: 1 }, children: /* @__PURE__ */ jsx(
            Box,
            {
              sx: {
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1
              },
              children: Object.entries(sets).map(([setKey, number]) => /* @__PURE__ */ jsxs(
                Box,
                {
                  sx: { display: "flex", alignItems: "center", gap: 1 },
                  children: [
                    /* @__PURE__ */ jsx(ImgIcon, { size: 2, src: artifactAsset(setKey, "flower") }),
                    /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(ArtifactSetName, { setKey }) }),
                    /* @__PURE__ */ jsxs(SqBadge, { children: [
                      "x",
                      number
                    ] })
                  ]
                },
                setKey
              ))
            }
          ) })
        ] }) }),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
          CardThemed,
          {
            sx: {
              flexGrow: 1,
              height: "100%",
              p: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              justifyContent: "space-between"
            },
            children: Object.entries(slots).map(([sk, { level, statKey }]) => /* @__PURE__ */ jsxs(
              Box,
              {
                sx: { display: "flex", alignItems: "center", gap: 1 },
                children: [
                  /* @__PURE__ */ jsx(SlotIcon, { slotKey: sk }),
                  /* @__PURE__ */ jsxs(SqBadge, { children: [
                    "+",
                    level
                  ] }),
                  /* @__PURE__ */ jsx(StatWithUnit, { statKey })
                ]
              },
              sk
            ))
          }
        ) }),
        [substatsArr1, substatsArr2].map((arr, i) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(CardThemed, { sx: { flexGrow: 1, height: "100%" }, children: /* @__PURE__ */ jsx(
          Box,
          {
            sx: {
              p: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 1
            },
            children: arr.map(([sk, number]) => /* @__PURE__ */ jsxs(
              Box,
              {
                sx: {
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "space-between"
                },
                children: [
                  /* @__PURE__ */ jsx(StatWithUnit, { statKey: sk }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    artDisplayValue(number, getUnitStr(sk)),
                    getUnitStr(sk)
                  ] })
                ]
              },
              sk
            ))
          }
        ) }) }, i))
      ]
    }
  ) });
}
function RemoveLoadout({
  show,
  onHide,
  teamCharId,
  onDelete,
  teamIds,
  conditionalCount
}) {
  const database = useDatabase();
  const {
    name,
    description,
    buildIds,
    buildTcIds,
    customMultiTargets,
    bonusStats
  } = database.teamChars.get(teamCharId);
  const onDeleteLoadout = reactExports.useCallback(() => {
    onHide();
    onDelete();
  }, [onDelete, onHide]);
  return /* @__PURE__ */ jsx(
    ModalWrapper,
    {
      open: show,
      onClose: onHide,
      containerProps: { maxWidth: "md" },
      children: /* @__PURE__ */ jsxs(CardThemed, { children: [
        /* @__PURE__ */ jsx(
          CardHeader,
          {
            title: /* @__PURE__ */ jsxs("span", { children: [
              "Delete Loadout: ",
              /* @__PURE__ */ jsx("strong", { children: name }),
              "?"
            ] }),
            action: /* @__PURE__ */ jsx(IconButton, { onClick: onHide, children: /* @__PURE__ */ jsx(default_1$2, {}) })
          }
        ),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          description && /* @__PURE__ */ jsx(CardThemed, { bgt: "dark", sx: { mb: 2 }, children: /* @__PURE__ */ jsx(CardContent, { children: description }) }),
          /* @__PURE__ */ jsx(Typography, { children: "Deleting the Loadout will also delete the following data:" }),
          /* @__PURE__ */ jsxs(List, { sx: { listStyleType: "disc", pl: 4 }, children: [
            !!buildIds.length && /* @__PURE__ */ jsx(ListItem, { sx: { display: "list-item" }, children: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              "All saved builds: ",
              buildIds.length,
              " ",
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  title: /* @__PURE__ */ jsx(Box, { children: buildIds.map((bId) => {
                    var _a;
                    return /* @__PURE__ */ jsxs(
                      Typography,
                      {
                        sx: {
                          display: "flex",
                          alignItems: "center",
                          gap: 1
                        },
                        children: [
                          /* @__PURE__ */ jsx(default_1$3, {}),
                          /* @__PURE__ */ jsx("span", { children: (_a = database.builds.get(bId)) == null ? void 0 : _a.name })
                        ]
                      },
                      bId
                    );
                  }) }),
                  children: /* @__PURE__ */ jsx(default_1$4, {})
                }
              )
            ] }) }),
            !!buildTcIds.length && /* @__PURE__ */ jsx(ListItem, { sx: { display: "list-item" }, children: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              "All saved TC builds: ",
              buildTcIds.length,
              " ",
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  title: /* @__PURE__ */ jsx(Box, { children: buildTcIds.map((bId) => {
                    var _a;
                    return /* @__PURE__ */ jsxs(
                      Typography,
                      {
                        sx: {
                          display: "flex",
                          alignItems: "center",
                          gap: 1
                        },
                        children: [
                          /* @__PURE__ */ jsx(default_1$3, {}),
                          /* @__PURE__ */ jsx("span", { children: (_a = database.buildTcs.get(bId)) == null ? void 0 : _a.name })
                        ]
                      },
                      bId
                    );
                  }) }),
                  children: /* @__PURE__ */ jsx(default_1$4, {})
                }
              )
            ] }) }),
            !!customMultiTargets.length && /* @__PURE__ */ jsx(ListItem, { sx: { display: "list-item" }, children: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              "All Custom Multi-targets: ",
              customMultiTargets.length,
              " ",
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  title: /* @__PURE__ */ jsx(Box, { children: customMultiTargets.map((target, i) => /* @__PURE__ */ jsxs(
                    Typography,
                    {
                      sx: {
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      },
                      children: [
                        /* @__PURE__ */ jsx(default_1$5, {}),
                        /* @__PURE__ */ jsx("span", { children: target.name })
                      ]
                    },
                    i
                  )) }),
                  children: /* @__PURE__ */ jsx(default_1$4, {})
                }
              )
            ] }) }),
            !!Object.keys(bonusStats).length && /* @__PURE__ */ jsxs(ListItem, { sx: { display: "list-item" }, children: [
              "Bonus stats: ",
              Object.keys(bonusStats).length
            ] }),
            !!conditionalCount && /* @__PURE__ */ jsxs(ListItem, { sx: { display: "list-item" }, children: [
              "Conditionals: ",
              conditionalCount
            ] }),
            /* @__PURE__ */ jsx(ListItem, { sx: { display: "list-item" }, children: "Optimization Configuration" }),
            !!teamIds.length && /* @__PURE__ */ jsx(ListItem, { sx: { display: "list-item" }, children: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Any teams with this loadout will have this loadout removed from the team. Teams will not be deleted. Teams affected:",
                " ",
                teamIds.length
              ] }),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  title: /* @__PURE__ */ jsx(Box, { children: teamIds.map((teamId) => {
                    var _a;
                    return /* @__PURE__ */ jsxs(
                      Typography,
                      {
                        sx: {
                          display: "flex",
                          alignItems: "center",
                          gap: 1
                        },
                        children: [
                          /* @__PURE__ */ jsx(default_1$6, {}),
                          /* @__PURE__ */ jsx("span", { children: (_a = database.teams.get(teamId)) == null ? void 0 : _a.name })
                        ]
                      },
                      teamId
                    );
                  }) }),
                  children: /* @__PURE__ */ jsx(default_1$4, {})
                }
              )
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardActions, { sx: { float: "right" }, children: [
          /* @__PURE__ */ jsx(Button, { startIcon: /* @__PURE__ */ jsx(default_1$2, {}), color: "secondary", onClick: onHide, children: "Cancel" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              startIcon: /* @__PURE__ */ jsx(default_1$7, {}),
              color: "error",
              onClick: onDeleteLoadout,
              children: "Delete"
            }
          )
        ] })
      ] })
    }
  );
}
function LoadoutEditor({
  show,
  onHide,
  teamCharId,
  teamIds
}) {
  const [showRemoval, onShowRemoval, onHideRemoval] = useBoolState();
  const navigate = useNavigate();
  const database = useDatabase();
  const {
    key: characterKey,
    name,
    description,
    buildIds,
    buildTcIds,
    customMultiTargets,
    bonusStats,
    optConfigId,
    conditional
  } = useTeamChar(teamCharId);
  const { optimizationTarget } = useOptConfig(optConfigId);
  const onDelete = () => {
    onHide();
    database.teamChars.remove(teamCharId);
  };
  const onDup = () => {
    const newTeamCharId = database.teamChars.duplicate(teamCharId);
    if (!newTeamCharId)
      return;
    onHide();
  };
  const onAddTeam = (teamCharId2) => {
    const teamId = database.teams.new();
    database.teams.set(teamId, (team) => {
      team.loadoutData[0] = { teamCharId: teamCharId2 };
    });
    navigate(`/teams/${teamId}`);
  };
  const conditionalCount = reactExports.useMemo(() => {
    let count = 0;
    crawlObject(
      conditional,
      [],
      (o) => typeof o !== "object",
      () => count++
    );
    return count;
  }, [conditional]);
  return /* @__PURE__ */ jsx(
    ModalWrapper,
    {
      open: show,
      onClose: onHide,
      containerProps: { maxWidth: "lg" },
      children: /* @__PURE__ */ jsxs(CardThemed, { children: [
        /* @__PURE__ */ jsx(
          CardHeader,
          {
            title: /* @__PURE__ */ jsxs(Box, { display: "flex", gap: 1, alignItems: "center", children: [
              /* @__PURE__ */ jsx(default_1$8, {}),
              /* @__PURE__ */ jsx("strong", { children: name })
            ] }),
            action: /* @__PURE__ */ jsx(IconButton, { onClick: onHide, children: /* @__PURE__ */ jsx(default_1$2, {}) })
          }
        ),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ jsx(LoadoutInfoAlert, {}),
          /* @__PURE__ */ jsx(
            TextFieldLazy,
            {
              fullWidth: true,
              label: "Loadout Name",
              placeholder: "Loadout Name",
              value: name,
              onChange: (name2) => database.teamChars.set(teamCharId, { name: name2 })
            }
          ),
          /* @__PURE__ */ jsx(
            TextFieldLazy,
            {
              fullWidth: true,
              label: "Loadout Description",
              value: description,
              onChange: (description2) => database.teamChars.set(teamCharId, { description: description2 }),
              multiline: true,
              minRows: 2
            }
          ),
          /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsxs(Grid, { container: true, columns: { xs: 1, md: 2 }, spacing: 2, children: [
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
              Button,
              {
                color: "info",
                onClick: () => onDup(),
                fullWidth: true,
                startIcon: /* @__PURE__ */ jsx(default_1$9, {}),
                children: "Duplicate Loadout"
              }
            ) }),
            /* @__PURE__ */ jsxs(Grid, { item: true, xs: 1, children: [
              /* @__PURE__ */ jsx(
                RemoveLoadout,
                {
                  show: showRemoval,
                  onHide: onHideRemoval,
                  onDelete,
                  teamCharId,
                  teamIds,
                  conditionalCount
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  fullWidth: true,
                  startIcon: /* @__PURE__ */ jsx(default_1$7, {}),
                  color: "error",
                  onClick: onShowRemoval,
                  children: "Delete Loadout"
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsxs(Grid, { container: true, columns: { xs: 1, md: 2 }, spacing: 2, children: [
            !!Object.keys(bonusStats).length && /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(BonusStatsCard, { bonusStats }) }),
            !!optimizationTarget && /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsxs(CardThemed, { bgt: "light", children: [
              /* @__PURE__ */ jsx(
                CardHeader,
                {
                  title: /* @__PURE__ */ jsxs(
                    Box,
                    {
                      sx: {
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      },
                      children: [
                        /* @__PURE__ */ jsx(OptimizationIcon, {}),
                        /* @__PURE__ */ jsx("span", { children: "Optimization Target" })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(Divider, {}),
              /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
                Stack,
                {
                  divider: /* @__PURE__ */ jsx(Divider, { orientation: "vertical", flexItem: true }),
                  spacing: 1,
                  children: /* @__PURE__ */ jsx(
                    OptimizationTargetDisplay,
                    {
                      optimizationTarget,
                      customMultiTargets
                    }
                  )
                }
              ) })
            ] }) }),
            !!customMultiTargets.length && /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(MultiTargetCard, { customMultiTargets }) }),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Typography, { variant: "h6", children: [
              "Conditionals: ",
              /* @__PURE__ */ jsx("strong", { children: conditionalCount })
            ] }) }) }) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(
          CardHeader,
          {
            title: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", gap: 1, alignItems: "center" }, children: [
              /* @__PURE__ */ jsx(default_1$3, {}),
              /* @__PURE__ */ jsx("span", { children: "Builds" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ jsx(BuildInfoAlert, {}),
          /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Grid, { container: true, columns: { xs: 1, md: 2 }, spacing: 2, children: buildIds.map((id) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
            BuildRealSimplified,
            {
              buildId: id,
              characterKey
            }
          ) }, id)) }) }),
          /* @__PURE__ */ jsx(TCBuildInfoAlert, {}),
          /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Grid, { container: true, columns: { xs: 1, md: 2 }, spacing: 2, children: buildTcIds.map((id) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(BuildTcSimplified, { buildTcId: id }) }, id)) }) })
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(
          CardHeader,
          {
            title: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", gap: 1, alignItems: "center" }, children: [
              /* @__PURE__ */ jsx(default_1$3, {}),
              /* @__PURE__ */ jsx("span", { children: "Teams" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
          /* @__PURE__ */ jsx(TeamInfoAlert, {}),
          /* @__PURE__ */ jsxs(Grid, { container: true, columns: { xs: 1, md: 2 }, spacing: 2, children: [
            teamIds.map((teamId) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
              TeamCard,
              {
                bgt: "light",
                teamId,
                onClick: (cid) => navigate(`/teams/${teamId}${cid ? `/${cid}` : ""}`)
              }
            ) }, teamId)),
            /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
              Button,
              {
                fullWidth: true,
                sx: { height: "100%", backgroundColor: "contentLight.main" },
                variant: "outlined",
                onClick: () => onAddTeam(teamCharId),
                color: "info",
                startIcon: /* @__PURE__ */ jsx(default_1$a, {}),
                children: "Add new Team"
              }
            ) })
          ] })
        ] })
      ] })
    }
  );
}
function BonusStatsCard({
  bonusStats
}) {
  return /* @__PURE__ */ jsxs(CardThemed, { bgt: "light", children: [
    /* @__PURE__ */ jsx(
      CardHeader,
      {
        title: /* @__PURE__ */ jsxs(
          Box,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              gap: 1
            },
            children: [
              /* @__PURE__ */ jsx(default_1$b, {}),
              /* @__PURE__ */ jsx("span", { children: "Bonus Stats" })
            ]
          }
        ),
        titleTypographyProps: { variant: "h6" }
      }
    ),
    /* @__PURE__ */ jsx(
      DocumentDisplay,
      {
        bgt: "light",
        sections: [
          {
            fields: Object.entries(bonusStats).map(([key, value]) => ({
              text: KeyMap.getStr(key) ?? key,
              value,
              unit: getUnitStr(key)
            }))
          }
        ]
      }
    )
  ] });
}
function MultiTargetCard({
  customMultiTargets
}) {
  return /* @__PURE__ */ jsxs(CardThemed, { bgt: "light", children: [
    /* @__PURE__ */ jsx(
      CardHeader,
      {
        title: /* @__PURE__ */ jsxs(
          Box,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              gap: 1
            },
            children: [
              /* @__PURE__ */ jsx(default_1$5, {}),
              /* @__PURE__ */ jsx("span", { children: "Custom multi-targets" })
            ]
          }
        ),
        titleTypographyProps: { variant: "h6" }
      }
    ),
    /* @__PURE__ */ jsx(
      DocumentDisplay,
      {
        bgt: "light",
        sections: [
          {
            fields: customMultiTargets.map(({ name, description }) => ({
              text: name,
              value: description ? /* @__PURE__ */ jsx(Tooltip, { title: description, children: /* @__PURE__ */ jsx(default_1$4, {}) }) : void 0
            }))
          }
        ]
      }
    )
  ] });
}
const columns$1 = {
  xs: 1,
  md: 2
};
function LoadoutCard({
  teamCharId,
  teamIds
}) {
  const navigate = useNavigate();
  const database = useDatabase();
  const onAddTeam = (teamCharId2) => {
    const teamId = database.teams.new();
    database.teams.set(teamId, (team) => {
      team.loadoutData[0] = { teamCharId: teamCharId2 };
    });
    navigate(`/teams/${teamId}`);
  };
  const [show, onShow, onHide] = useBoolState();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      LoadoutEditor,
      {
        show,
        onHide,
        teamCharId,
        teamIds
      }
    ),
    /* @__PURE__ */ jsxs(CardThemed, { bgt: "light", children: [
      /* @__PURE__ */ jsx(CardActionArea, { onClick: onShow, children: /* @__PURE__ */ jsx(LoadoutHeaderContent, { teamCharId, showSetting: true }) }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(CardContent, { sx: { p: 1 }, children: /* @__PURE__ */ jsxs(Grid, { container: true, columns: columns$1, spacing: 1, children: [
        teamIds.map((teamId) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
          TeamCard,
          {
            teamId,
            onClick: (cid) => navigate(`/teams/${teamId}${cid ? `/${cid}` : ""}`)
          }
        ) }, teamId)),
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
          Button,
          {
            fullWidth: true,
            sx: { height: "100%", backgroundColor: "contentNormal.main" },
            variant: "outlined",
            onClick: () => onAddTeam(teamCharId),
            color: "info",
            startIcon: /* @__PURE__ */ jsx(default_1$a, {}),
            children: "Add new Team"
          }
        ) })
      ] }) })
    ] }, teamCharId)
  ] });
}
var Female = {};
var _interopRequireDefault$1 = interopRequireDefaultExports;
Object.defineProperty(Female, "__esModule", {
  value: true
});
var default_1$1 = Female.default = void 0;
var _createSvgIcon$1 = _interopRequireDefault$1(requireCreateSvgIcon());
var _jsxRuntime$1 = jsxRuntimeExports;
var _default$1 = (0, _createSvgIcon$1.default)(/* @__PURE__ */ (0, _jsxRuntime$1.jsx)("path", {
  d: "M17.5 9.5C17.5 6.46 15.04 4 12 4S6.5 6.46 6.5 9.5c0 2.7 1.94 4.93 4.5 5.4V17H9v2h2v2h2v-2h2v-2h-2v-2.1c2.56-.47 4.5-2.7 4.5-5.4zm-9 0C8.5 7.57 10.07 6 12 6s3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5z"
}), "Female");
default_1$1 = Female.default = _default$1;
var Male = {};
var _interopRequireDefault = interopRequireDefaultExports;
Object.defineProperty(Male, "__esModule", {
  value: true
});
var default_1 = Male.default = void 0;
var _createSvgIcon = _interopRequireDefault(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
var _default = (0, _createSvgIcon.default)(/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M9.5 11c1.93 0 3.5 1.57 3.5 3.5S11.43 18 9.5 18 6 16.43 6 14.5 7.57 11 9.5 11zm0-2C6.46 9 4 11.46 4 14.5S6.46 20 9.5 20s5.5-2.46 5.5-5.5c0-1.16-.36-2.23-.97-3.12L18 7.42V10h2V4h-6v2h2.58l-3.97 3.97C11.73 9.36 10.66 9 9.5 9z"
}), "Male");
default_1 = Male.default = _default;
function TravelerGenderSelect() {
  const { t } = useTranslation("ui");
  const database = useDatabase();
  const { character } = reactExports.useContext(CharacterContext);
  const { key } = character;
  const { gender } = useDBMeta();
  const toggleGender = reactExports.useCallback(
    () => database.dbMeta.set({ gender: gender === "F" ? "M" : "F" }),
    [gender, database]
  );
  if (!key.startsWith("Traveler"))
    return null;
  return /* @__PURE__ */ jsxs(
    Button,
    {
      onClick: toggleGender,
      startIcon: gender === "F" ? /* @__PURE__ */ jsx(default_1$1, {}) : /* @__PURE__ */ jsx(default_1, {}),
      children: [
        /* @__PURE__ */ jsx("strong", { children: t(`gender.${gender}`) }),
        " "
      ]
    }
  );
}
function Content({ onClose }) {
  const { t } = useTranslation([
    "page_character",
    // Always load these 2 so character names are loaded for searching/sorting
    "sillyWisher_charNames",
    "charNames_gen"
  ]);
  const navigate = useNavigate();
  const database = useDatabase();
  const {
    character,
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  const { gender } = useDBMeta();
  const characterSheet = getCharSheet(characterKey, gender);
  const { silly } = reactExports.useContext(SillyContext);
  const deleteCharacter = reactExports.useCallback(async () => {
    const name = t(
      `${silly ? "sillyWisher_charNames" : "charNames_gen"}:${charKeyToLocGenderedCharKey(characterKey, gender)}`
    );
    if (!window.confirm(t("removeCharacter", { value: name })))
      return;
    database.chars.remove(characterKey);
    navigate("/characters");
  }, [database, navigate, characterKey, gender, silly, t]);
  return /* @__PURE__ */ jsxs(Box, { display: "flex", flexDirection: "column", gap: 1, children: [
    /* @__PURE__ */ jsxs(Box, { display: "flex", gap: 1, children: [
      /* @__PURE__ */ jsx(TravelerGenderSelect, {}),
      /* @__PURE__ */ jsx(
        Button,
        {
          color: "error",
          onClick: () => deleteCharacter(),
          startIcon: /* @__PURE__ */ jsx(default_1$7, {}),
          sx: { marginLeft: "auto" },
          children: t("delete")
        }
      ),
      !!onClose && /* @__PURE__ */ jsx(IconButton, { onClick: onClose, children: /* @__PURE__ */ jsx(default_1$2, {}) })
    ] }),
    /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, sx: { justifyContent: "center" }, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 8, sm: 5, md: 4, lg: 3, children: /* @__PURE__ */ jsxs(
        CardThemed,
        {
          bgt: "light",
          sx: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1
          },
          children: [
            /* @__PURE__ */ jsx(CharacterCoverArea, {}),
            /* @__PURE__ */ jsx(Box, { sx: { px: 1 }, children: /* @__PURE__ */ jsx(
              LevelSelect,
              {
                level: character.level,
                ascension: character.ascension,
                setBoth: (data) => database.chars.set(characterKey, data)
              }
            ) }),
            /* @__PURE__ */ jsx(CharacterCardStats, { bgt: "light" }),
            /* @__PURE__ */ jsx(Typography, { sx: { textAlign: "center", pb: -1 }, variant: "h6", children: /* @__PURE__ */ jsx(
              CharacterConstellationName,
              {
                characterKey,
                gender
              }
            ) }),
            /* @__PURE__ */ jsx(Box, { sx: { px: 1 }, children: /* @__PURE__ */ jsx(
              CharacterCompactConstSelector,
              {
                setConstellation: (constellation) => database.chars.set(characterKey, {
                  constellation
                })
              }
            ) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs(
        Grid,
        {
          item: true,
          xs: 12,
          sm: 7,
          md: 8,
          lg: 9,
          sx: { display: "flex", flexDirection: "column", gap: 1 },
          children: [
            /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Grid, { container: true, columns: 3, spacing: 1, children: ["auto", "skill", "burst"].map((talentKey) => {
              var _a;
              return /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
                TalentDropdown,
                {
                  talentKey,
                  dropDownButtonProps: {
                    startIcon: /* @__PURE__ */ jsx(
                      ImgIcon,
                      {
                        src: (_a = characterSheet.getTalentOfKey(talentKey)) == null ? void 0 : _a.img,
                        size: 1.75,
                        sideMargin: true
                      }
                    )
                  },
                  setTalent: (talent) => database.chars.set(characterKey, (char) => {
                    char.talent[talentKey] = talent;
                  })
                },
                talentKey
              ) }, talentKey);
            }) }) }),
            /* @__PURE__ */ jsx(EquipmentSection, {}),
            /* @__PURE__ */ jsx(InTeam, {})
          ]
        }
      )
    ] }) })
  ] });
}
function EquipmentSection() {
  const {
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  const { data } = reactExports.useContext(DataContext);
  const database = useDatabase();
  const weaponTypeKey = getCharStat(characterKey).weaponType;
  const weaponId = data.get(uiInput.weapon.id).value;
  const artifactIds = reactExports.useMemo(
    () => objKeyMap(
      allArtifactSlotKeys,
      (slotKey) => data.get(uiInput.art[slotKey].id).value
    ),
    [data]
  );
  return /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(
    EquippedGrid,
    {
      weaponTypeKey,
      weaponId,
      artifactIds,
      setWeapon: (id) => {
        database.weapons.set(id, {
          location: charKeyToLocCharKey(characterKey)
        });
      },
      setArtifact: (_, id) => {
        database.arts.set(id, {
          location: charKeyToLocCharKey(characterKey)
        });
      }
    }
  ) });
}
function InTeam() {
  const navigate = useNavigate();
  const {
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  const database = useDatabase();
  const { gender } = useDBMeta();
  const [dbDirty, setDbDirty] = useForceUpdate();
  const loadoutTeamMap = reactExports.useMemo(() => {
    const loadoutTeamMap2 = {};
    database.teamChars.entries.map(([teamCharId, teamChar]) => {
      if (teamChar.key !== characterKey)
        return;
      if (!loadoutTeamMap2[teamCharId])
        loadoutTeamMap2[teamCharId] = [];
    });
    database.teams.entries.forEach(([teamId, team]) => {
      const teamCharIdWithCKey = team.loadoutData.find(
        (loadoutDatum) => {
          var _a;
          return loadoutDatum && ((_a = database.teamChars.get(loadoutDatum == null ? void 0 : loadoutDatum.teamCharId)) == null ? void 0 : _a.key) === characterKey;
        }
      );
      if (teamCharIdWithCKey)
        loadoutTeamMap2[teamCharIdWithCKey == null ? void 0 : teamCharIdWithCKey.teamCharId].push(teamId);
    });
    return dbDirty && loadoutTeamMap2;
  }, [dbDirty, characterKey, database]);
  reactExports.useEffect(
    () => database.teams.followAny(() => setDbDirty()),
    [database, setDbDirty]
  );
  reactExports.useEffect(
    () => database.teamChars.followAny(() => setDbDirty()),
    [database, setDbDirty]
  );
  const onAddNewTeam = () => {
    const teamId = database.teams.new();
    const teamCharId = database.teamChars.new(characterKey);
    database.teams.set(teamId, (team) => {
      team.loadoutData[0] = { teamCharId };
    });
    navigate(`/teams/${teamId}`);
  };
  return /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
    /* @__PURE__ */ jsxs(Typography, { variant: "h6", children: [
      "Team Loadouts with",
      " ",
      /* @__PURE__ */ jsx(CharacterName, { characterKey, gender })
    ] }),
    !Object.values(loadoutTeamMap).length && /* @__PURE__ */ jsx(AddTeamInfo, {}),
    Object.entries(loadoutTeamMap).map(([teamCharId, teamIds]) => /* @__PURE__ */ jsx(
      LoadoutCard,
      {
        teamCharId,
        teamIds
      },
      teamCharId
    )),
    /* @__PURE__ */ jsx(
      Button,
      {
        fullWidth: true,
        onClick: () => onAddNewTeam(),
        color: "info",
        startIcon: /* @__PURE__ */ jsx(default_1$a, {}),
        variant: "outlined",
        sx: { backgroundColor: "contentLight.main" },
        children: "Add new Loadout+Team"
      }
    ),
    /* @__PURE__ */ jsx(CardThemed, { bgt: "light" })
  ] });
}
function CharacterEditor({
  characterKey,
  onClose
}) {
  return /* @__PURE__ */ jsx(ModalWrapper, { open: !!characterKey, onClose, children: /* @__PURE__ */ jsx(
    reactExports.Suspense,
    {
      fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 1e3 }),
      children: characterKey && /* @__PURE__ */ jsx(
        CharacterEditorContent,
        {
          characterKey,
          onClose
        },
        characterKey
      )
    }
  ) });
}
function CharacterEditorContent({
  characterKey,
  onClose
}) {
  const character = useCharacter(characterKey);
  const teamData = useCharData(characterKey);
  const { target: charUIData } = (teamData == null ? void 0 : teamData[characterKey]) ?? {};
  const dataContextValue = reactExports.useMemo(() => {
    if (!teamData || !charUIData)
      return void 0;
    return {
      data: charUIData,
      teamData,
      compareData: void 0
    };
  }, [charUIData, teamData]);
  const characterContextValue = reactExports.useMemo(
    () => character && {
      character
    },
    [character]
  );
  const [chartData, setChartData] = reactExports.useState();
  const [graphBuilds, setGraphBuilds] = reactExports.useState();
  const graphContextValue = reactExports.useMemo(() => {
    return {
      chartData,
      setChartData,
      graphBuilds,
      setGraphBuilds
    };
  }, [chartData, graphBuilds]);
  reactExports.useEffect(() => {
    setChartData(void 0);
    setGraphBuilds(void 0);
  }, [characterKey]);
  return /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: /* @__PURE__ */ jsx(
    reactExports.Suspense,
    {
      fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 1e3 }),
      children: dataContextValue && characterContextValue && graphContextValue ? /* @__PURE__ */ jsx(CharacterContext.Provider, { value: characterContextValue, children: /* @__PURE__ */ jsx(DataContext.Provider, { value: dataContextValue, children: /* @__PURE__ */ jsx(GraphContext.Provider, { value: graphContextValue, children: /* @__PURE__ */ jsx(Content, { onClose }) }) }) }) : /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 1e3 })
    }
  ) }) });
}
const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 };
const numToShowMap = { xs: 5, sm: 8, md: 9, lg: 12, xl: 12 };
const sortKeys = Object.keys(characterSortMap);
function PageCharacter() {
  const database = useDatabase();
  const navigate = useNavigate();
  const {
    params: { characterKey: characterKeyRaw }
  } = useMatch({ path: "/characters/:characterKey", end: false }) ?? {
    params: {}
  };
  const characterKey = reactExports.useMemo(() => {
    if (!characterKeyRaw)
      return null;
    if (!isCharacterKey(characterKeyRaw)) {
      navigate("/characters");
      return null;
    }
    const character = database.chars.get(characterKeyRaw);
    if (!character)
      database.chars.getWithInitWeapon(characterKeyRaw);
    return characterKeyRaw;
  }, [characterKeyRaw, navigate, database]);
  const { t } = useTranslation([
    "page_character",
    // Always load these 2 so character names are loaded for searching/sorting
    "sillyWisher_charNames",
    "charNames_gen"
  ]);
  const { silly } = reactExports.useContext(SillyContext);
  const [displayCharacter, setDisplayCharacter] = reactExports.useState(
    () => database.displayCharacter.get()
  );
  reactExports.useEffect(
    () => database.displayCharacter.follow((r, s) => setDisplayCharacter(s)),
    [database, setDisplayCharacter]
  );
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const deferredSearchTerm = reactExports.useDeferredValue(searchTerm);
  const brPt = useMediaQueryUp();
  const [newCharacter, setnewCharacter] = reactExports.useState(false);
  const [dbDirty, forceUpdate] = useForceUpdate();
  reactExports.useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/characters" });
    return database.chars.followAny(
      (k, r) => (r === "new" || r === "remove") && forceUpdate()
    );
  }, [forceUpdate, database]);
  reactExports.useEffect(
    () => database.charMeta.followAny((_s) => forceUpdate()),
    [forceUpdate, database]
  );
  const editCharacter = useCharSelectionCallback();
  const deferredState = reactExports.useDeferredValue(displayCharacter);
  const deferredDbDirty = reactExports.useDeferredValue(dbDirty);
  const { charKeys, totalCharNum } = reactExports.useMemo(() => {
    const chars = database.chars.keys;
    const totalCharNum2 = chars.length;
    const { element: element2, weaponType: weaponType2, rarity: rarity2, sortType: sortType2, ascending: ascending2 } = deferredState;
    const charKeys2 = database.chars.keys.filter(
      filterFunction(
        { element: element2, weaponType: weaponType2, rarity: rarity2, name: deferredSearchTerm },
        characterFilterConfigs(database, silly)
      )
    ).sort(
      sortFunction(
        characterSortMap[sortType2] ?? [],
        ascending2,
        characterSortConfigs(database, silly),
        ["new", "favorite"]
      )
    );
    return deferredDbDirty && { charKeys: charKeys2, totalCharNum: totalCharNum2 };
  }, [database, deferredState, deferredSearchTerm, silly, deferredDbDirty]);
  const { weaponType, element, rarity, sortType, ascending } = displayCharacter;
  const weaponTotals = reactExports.useMemo(
    () => catTotal(
      allWeaponTypeKeys,
      (ct) => Object.entries(database.chars.data).forEach(([ck, char]) => {
        const weapon = database.weapons.get(char.equippedWeapon);
        if (!weapon)
          return;
        const wtk = getWeaponStat(weapon.key).weaponType;
        ct[wtk].total++;
        if (charKeys.includes(ck))
          ct[wtk].current++;
      })
    ),
    [database, charKeys]
  );
  const elementTotals = reactExports.useMemo(
    () => catTotal(
      allElementKeys,
      (ct) => Object.entries(database.chars.data).forEach(([ck, char]) => {
        const eleKey = getCharEle(char.key);
        ct[eleKey].total++;
        if (charKeys.includes(ck))
          ct[eleKey].current++;
      })
    ),
    [database, charKeys]
  );
  const rarityTotals = reactExports.useMemo(
    () => catTotal(
      allCharacterRarityKeys,
      (ct) => Object.entries(database.chars.data).forEach(([ck, char]) => {
        const key = getCharStat(char.key).rarity;
        ct[key].total++;
        if (charKeys.includes(ck))
          ct[key].current++;
      })
    ),
    [database, charKeys]
  );
  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    charKeys.length
  );
  const charKeysToShow = reactExports.useMemo(
    () => charKeys.slice(0, numShow),
    [charKeys, numShow]
  );
  const totalShowing = charKeys.length !== totalCharNum ? `${charKeys.length}/${totalCharNum}` : `${totalCharNum}`;
  const showingTextProps = {
    numShowing: charKeysToShow.length,
    total: totalShowing,
    t,
    namespace: "page_character"
  };
  const sortByButtonProps = {
    sortKeys: [...sortKeys],
    value: sortType,
    onChange: (sortType2) => database.displayCharacter.set({ sortType: sortType2 }),
    ascending,
    onChangeAsc: (ascending2) => database.displayCharacter.set({ ascending: ascending2 })
  };
  return /* @__PURE__ */ jsxs(Box, { display: "flex", flexDirection: "column", gap: 1, children: [
    characterKey && /* @__PURE__ */ jsx(
      CharacterEditor,
      {
        characterKey,
        onClose: () => navigate("/characters")
      }
    ),
    /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: false, children: /* @__PURE__ */ jsx(
      CharacterSelectionModal,
      {
        newFirst: true,
        show: newCharacter,
        onHide: () => setnewCharacter(false),
        onSelect: editCharacter
      }
    ) }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
      /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, children: [
        /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(
          WeaponToggle,
          {
            sx: { height: "100%" },
            onChange: (weaponType2) => database.displayCharacter.set({ weaponType: weaponType2 }),
            value: weaponType,
            totals: weaponTotals,
            size: "small"
          }
        ) }),
        /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(
          ElementToggle,
          {
            sx: { height: "100%" },
            onChange: (element2) => database.displayCharacter.set({ element: element2 }),
            value: element,
            totals: elementTotals,
            size: "small"
          }
        ) }),
        /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(
          CharacterRarityToggle,
          {
            sx: { height: "100%" },
            onChange: (rarity2) => database.displayCharacter.set({ rarity: rarity2 }),
            value: rarity,
            totals: rarityTotals,
            size: "small"
          }
        ) }),
        /* @__PURE__ */ jsx(Grid, { item: true, flexGrow: 1 }),
        /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(
          TextField,
          {
            autoFocus: true,
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            label: t("characterName"),
            size: "small",
            sx: { height: "100%" },
            InputProps: {
              sx: { height: "100%" }
            }
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(
        Box,
        {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          children: /* @__PURE__ */ jsx(
            ShowingAndSortOptionSelect,
            {
              showingTextProps,
              sortByButtonProps
            }
          )
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(
      Button,
      {
        fullWidth: true,
        onClick: () => setnewCharacter(true),
        color: "info",
        startIcon: /* @__PURE__ */ jsx(default_1$a, {}),
        children: t`addNew`
      }
    ),
    /* @__PURE__ */ jsx(
      reactExports.Suspense,
      {
        fallback: /* @__PURE__ */ jsx(
          Skeleton,
          {
            variant: "rectangular",
            sx: { width: "100%", height: "100%", minHeight: 5e3 }
          }
        ),
        children: /* @__PURE__ */ jsx(Grid, { container: true, spacing: 1, columns, children: charKeysToShow.map((charKey) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
          CharacterCard,
          {
            characterKey: charKey,
            onClick: () => navigate(`${charKey}`),
            hideStats: true
          }
        ) }, charKey)) })
      }
    ),
    charKeys.length !== charKeysToShow.length && /* @__PURE__ */ jsx(
      Skeleton,
      {
        ref: (node) => {
          if (!node)
            return;
          setTriggerElement(node);
        },
        sx: { borderRadius: 1 },
        variant: "rectangular",
        width: "100%",
        height: 100
      }
    )
  ] });
}
export {
  PageCharacter as default
};
