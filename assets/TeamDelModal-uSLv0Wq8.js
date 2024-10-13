import { r as reactExports, D as DataContext, a as useDatabase, dy as getDisplayHeader, dJ as objPathValue, c8 as resolveInfo, d as jsxs, f as Box, b as jsx, ap as SqBadge, T as Typography, ck as Fragment, cA as useOptConfig, o as default_1, e as default_1$1, B as BootstrapTooltip, p as default_1$3, cy as default_1$4, cC as OptimizationIcon, O as CardContent, u as useTeam, cT as notEmpty, M as CardHeader, aj as IconButton, ak as default_1$5, N as Divider, av as Alert, fG as toggleArr, ag as Button, aq as default_1$6, h as CardThemed, al as ModalWrapper, l as useCharData, C as CardActionArea, aS as ColorText } from "./index-B8aczfSH.js";
import { u as useTeamChar } from "./useTeamChar-BvbCmyyu.js";
import { d as default_1$2 } from "./Settings-ctf56yjV.js";
function OptimizationTargetDisplay({
  optimizationTarget,
  customMultiTargets
}) {
  var _a;
  const { data } = reactExports.useContext(DataContext);
  const database = useDatabase();
  const displayHeader = reactExports.useMemo(
    () => getDisplayHeader(data, optimizationTarget[0], database),
    [data, optimizationTarget, database]
  );
  const { title, icon, action } = displayHeader ?? {};
  const node = objPathValue(
    data.getDisplay(),
    optimizationTarget
  );
  const {
    textSuffix,
    icon: infoIcon,
    // Since mtargets are not passed in the character UIData, retrieve the name manually.
    name = optimizationTarget[0] === "custom" ? (_a = customMultiTargets[parseInt(optimizationTarget[1] ?? "")]) == null ? void 0 : _a.name : void 0
  } = (node && resolveInfo(node.info)) ?? {};
  const suffixDisplay = textSuffix && /* @__PURE__ */ jsxs("span", { children: [
    " ",
    textSuffix
  ] });
  const iconDisplay = icon ? icon : infoIcon;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", gap: 1, alignItems: "center" }, children: [
      iconDisplay,
      /* @__PURE__ */ jsx("span", { children: title }),
      !!action && /* @__PURE__ */ jsx(SqBadge, { color: "success", sx: { whiteSpace: "normal" }, children: action })
    ] }),
    /* @__PURE__ */ jsx(Typography, { sx: { display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsxs(SqBadge, { sx: { whiteSpace: "normal" }, children: [
      /* @__PURE__ */ jsx("strong", { children: name }),
      suffixDisplay
    ] }) })
  ] });
}
function LoadoutHeaderContent({
  teamCharId,
  showSetting = false,
  children
}) {
  const database = useDatabase();
  const {
    name,
    description,
    buildIds,
    buildTcIds,
    optConfigId,
    customMultiTargets
  } = database.teamChars.get(teamCharId);
  const { optimizationTarget } = useOptConfig(optConfigId);
  return /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
    /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", gap: 1, alignItems: "center" }, children: [
      /* @__PURE__ */ jsx(default_1, {}),
      /* @__PURE__ */ jsx(Typography, { variant: "h6", children: name }),
      !!description && /* @__PURE__ */ jsx(BootstrapTooltip, { title: /* @__PURE__ */ jsx(Typography, { children: description }), children: /* @__PURE__ */ jsx(default_1$1, {}) }),
      showSetting && /* @__PURE__ */ jsx(default_1$2, { sx: { ml: "auto" } })
    ] }),
    /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", gap: 1, justifyContent: "space-between" }, children: [
      /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", justifyItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsx(default_1$3, {}),
        /* @__PURE__ */ jsxs(Typography, { children: [
          "Builds: ",
          /* @__PURE__ */ jsx("strong", { children: buildIds.length })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", justifyItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsx(default_1$3, {}),
        /* @__PURE__ */ jsxs(Typography, { children: [
          "TC Builds: ",
          /* @__PURE__ */ jsx("strong", { children: buildTcIds.length })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", justifyItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsx(default_1$4, {}),
        /* @__PURE__ */ jsxs(Typography, { children: [
          "Custom multi-targets: ",
          /* @__PURE__ */ jsx("strong", { children: customMultiTargets.length })
        ] })
      ] })
    ] }),
    optimizationTarget && /* @__PURE__ */ jsxs(Typography, { sx: { display: "flex", gap: 1, alignItems: "center" }, children: [
      /* @__PURE__ */ jsx(OptimizationIcon, {}),
      /* @__PURE__ */ jsx(Box, { children: "Optimization Target:" }),
      /* @__PURE__ */ jsx(
        OptimizationTargetDisplay,
        {
          customMultiTargets,
          optimizationTarget
        }
      )
    ] }),
    children
  ] });
}
function TeamDelModal({
  teamId,
  show,
  onHide,
  onDel
}) {
  const database = useDatabase();
  const team = useTeam(teamId);
  const { name, description, loadoutData } = team;
  const inTeamsData = reactExports.useMemo(
    () => loadoutData.map((loadoutDatum) => {
      if (!loadoutDatum)
        return [];
      const { teamCharId } = loadoutDatum;
      return database.teams.values.filter(
        ({ loadoutData: data }) => data.find((datum) => (datum == null ? void 0 : datum.teamCharId) === teamCharId)
      );
    }),
    [database, loadoutData]
  );
  const [delArr, setDelArry] = reactExports.useState(
    () => inTeamsData.map((teams, i) => teams.length === 1 ? i : void 0).filter(notEmpty)
  );
  const onDelete = () => {
    database.teams.remove(teamId);
    loadoutData.forEach((loadoutDatum, i) => {
      if (!loadoutDatum || !delArr.includes(i))
        return;
      database.teamChars.remove(loadoutDatum.teamCharId);
    });
    onDel();
  };
  return /* @__PURE__ */ jsx(ModalWrapper, { open: show, onClose: onHide, children: /* @__PURE__ */ jsxs(CardThemed, { children: [
    /* @__PURE__ */ jsx(
      CardHeader,
      {
        title: /* @__PURE__ */ jsxs(
          Box,
          {
            sx: {
              display: "flex",
              gap: 1,
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ jsx(Box, { children: "Delete Team:" }),
              /* @__PURE__ */ jsx("strong", { children: name }),
              description && /* @__PURE__ */ jsx(BootstrapTooltip, { title: description, children: /* @__PURE__ */ jsx(default_1$1, {}) })
            ]
          }
        ),
        action: /* @__PURE__ */ jsx(IconButton, { onClick: onHide, children: /* @__PURE__ */ jsx(default_1$5, {}) })
      }
    ),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
      /* @__PURE__ */ jsx(Alert, { severity: "info", children: "Removing the team will remove: resonance buffs, and enemy configs stored in the team. Loadouts that are only in this team are also selected by default for deletion." }),
      loadoutData.map(
        (loadoutDatum, i) => loadoutDatum ? /* @__PURE__ */ jsx(
          LoadoutDisplay,
          {
            teamCharId: loadoutDatum.teamCharId,
            selected: delArr.includes(i),
            onClick: () => setDelArry((arr) => toggleArr(arr, i)),
            inTeams: inTeamsData[i]
          },
          i
        ) : null
      )
    ] }),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(CardContent, { sx: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ jsx(
      Button,
      {
        color: "error",
        startIcon: /* @__PURE__ */ jsx(default_1$6, {}),
        onClick: onDelete,
        children: "Delete"
      }
    ) })
  ] }) });
}
function LoadoutDisplay({
  teamCharId,
  selected,
  onClick,
  inTeams
}) {
  const teamChar = useTeamChar(teamCharId);
  const { key: characterKey } = teamChar;
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
  if (!dataContextValue)
    return;
  return /* @__PURE__ */ jsx(DataContext.Provider, { value: dataContextValue, children: /* @__PURE__ */ jsx(
    CardThemed,
    {
      bgt: "light",
      sx: { border: selected ? "2px red solid" : void 0 },
      children: /* @__PURE__ */ jsx(CardActionArea, { onClick, children: /* @__PURE__ */ jsx(LoadoutHeaderContent, { teamCharId, children: /* @__PURE__ */ jsx(ColorText, { color: inTeams.length === 1 ? "success" : "warning", children: /* @__PURE__ */ jsx(Typography, { children: inTeams.length === 1 ? "Only in current team" : `In ${inTeams.length} teams` }) }) }) })
    }
  ) });
}
export {
  LoadoutHeaderContent as L,
  OptimizationTargetDisplay as O,
  TeamDelModal as T
};
