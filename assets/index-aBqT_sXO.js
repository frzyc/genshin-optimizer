import { z as useTranslation, r as reactExports, a$ as SillyContext, a as useDatabase, bL as useDBMeta, b as jsx, bO as CharIconSide, cm as charKeyToLocGenderedCharKey, at as useForceUpdate, b6 as bulkCatTotal, cT as notEmpty, Q as Chip, S as Skeleton, cU as GeneralAutocompleteMulti, g as getCharEle, A as useNavigate, cV as useTitle, ae as useBoolState, bD as useDataEntryBase, aF as filterFunction, aG as sortFunction, aC as useMediaQueryUp, aH as useInfScroll, d as jsxs, f as Box, G as Grid, O as CardContent, bj as TextField, aL as ShowingAndSortOptionSelect, h as CardThemed, aI as default_1, ag as Button, M as CardHeader, N as Divider, T as Typography, al as ModalWrapper, cW as teamSortKeys } from "./index-B8aczfSH.js";
import { T as TeamCard } from "./TeamCard-KG0n7Xn9.js";
import { d as default_1$1 } from "./Upload-DM5I2lC5.js";
import "./useTeamChar-BvbCmyyu.js";
import "./TeamDelModal-uSLv0Wq8.js";
import "./Settings-ctf56yjV.js";
function CharacterMultiAutocomplete({
  teamIds,
  charKeys,
  setCharKey,
  acProps
}) {
  const { t } = useTranslation(["sillyWisher_charNames", "charNames_gen"]);
  const { silly } = reactExports.useContext(SillyContext);
  const database = useDatabase();
  const { gender } = useDBMeta();
  const charIsFavorite = reactExports.useCallback(
    (charKey) => database.charMeta.get(charKey).favorite,
    [database.charMeta]
  );
  const toImg = reactExports.useCallback(
    (key) => /* @__PURE__ */ jsx(CharIconSide, { characterKey: key }),
    []
  );
  const toLabel = reactExports.useCallback(
    (key, silly2) => t(
      `${silly2 ? "sillyWisher_charNames" : "charNames_gen"}:${charKeyToLocGenderedCharKey(key, gender)}`
    ),
    [gender, t]
  );
  const toVariant = getCharEle;
  const [dbDirty, setDirty] = useForceUpdate();
  reactExports.useEffect(
    () => database.chars.followAny(
      (_, r) => ["new", "remove"].includes(r) && setDirty()
    ),
    [database.chars, setDirty]
  );
  const allCharKeys = reactExports.useMemo(
    () => dbDirty && database.chars.keys,
    [database, dbDirty]
  );
  const { characterTeamTotal } = reactExports.useMemo(() => {
    const catKeys = {
      characterTeamTotal: allCharKeys
    };
    return bulkCatTotal(catKeys, (ctMap) => {
      database.teams.values.forEach((team) => {
        const { loadoutData } = team;
        loadoutData.filter(notEmpty).forEach(({ teamCharId }) => {
          const teamChar = database.teamChars.get(teamCharId);
          if (!teamChar)
            return;
          const ck = teamChar.key;
          ctMap["characterTeamTotal"][ck].total++;
        });
      });
      teamIds.forEach((teamId) => {
        const team = database.teams.get(teamId);
        if (!team)
          return;
        const { loadoutData } = team;
        loadoutData.filter(notEmpty).forEach(({ teamCharId }) => {
          const teamChar = database.teamChars.get(teamCharId);
          if (!teamChar)
            return;
          const ck = teamChar.key;
          ctMap["characterTeamTotal"][ck].current++;
        });
      });
    });
  }, [database, allCharKeys, teamIds]);
  const toExLabel = reactExports.useCallback(
    (key) => /* @__PURE__ */ jsx("strong", { children: characterTeamTotal[key] }),
    [characterTeamTotal]
  );
  const toExItemLabel = reactExports.useCallback(
    (key) => /* @__PURE__ */ jsx(Chip, { size: "small", label: characterTeamTotal[key] }),
    [characterTeamTotal]
  );
  const options = reactExports.useMemo(
    () => allCharKeys.map(
      (ck) => ({
        key: ck,
        label: toLabel(ck, silly),
        alternateNames: silly ? [toLabel(ck, !silly)] : void 0,
        favorite: charIsFavorite(ck),
        color: toVariant(ck)
      })
    ).sort((a, b) => {
      if (a.favorite && !b.favorite)
        return -1;
      if (!a.favorite && b.favorite)
        return 1;
      return a.label.localeCompare(b.label);
    }),
    [silly, toLabel, toVariant, charIsFavorite, allCharKeys]
  );
  return /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "text", width: 100 }), children: /* @__PURE__ */ jsx(
    GeneralAutocompleteMulti,
    {
      label: "Characters",
      options,
      toImg,
      valueKeys: charKeys,
      onChange: (k) => setCharKey(k),
      toExLabel,
      toExItemLabel,
      chipProps: { variant: "outlined" },
      ...acProps
    }
  ) });
}
function teamSortConfigs() {
  return {
    name: (team) => team.name ?? "",
    lastEdit: (team) => team.lastEdit ?? 0
  };
}
const teamSortMap = {
  name: ["name", "lastEdit"],
  lastEdit: ["lastEdit"]
};
function teamFilterConfigs(database) {
  return {
    charKeys: (teamId, filter) => {
      var _a;
      if (!filter.length)
        return true;
      const nonEmptyLoadoutData = (_a = database.teams.get(teamId)) == null ? void 0 : _a.loadoutData.filter(notEmpty);
      const characters = nonEmptyLoadoutData == null ? void 0 : nonEmptyLoadoutData.map(({ teamCharId }) => {
        var _a2;
        return (_a2 = database.teamChars.get(teamCharId)) == null ? void 0 : _a2.key;
      }).filter(notEmpty);
      const allFilteredCharInTeam = filter.every(
        (charKey) => characters == null ? void 0 : characters.includes(charKey)
      );
      return allFilteredCharInTeam;
    },
    name: (teamId, filter) => {
      var _a;
      return !filter || !!((_a = database.teams.get(teamId)) == null ? void 0 : _a.name.toLowerCase().includes(filter.toLowerCase()));
    }
  };
}
const columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 3 };
const numToShowMap = { xs: 6, sm: 12, md: 18, lg: 24, xl: 24 };
function PageTeams() {
  const { t } = useTranslation([
    "page_teams",
    // Always load these 2 so character names are loaded for searching/sorting
    "sillyWisher_charNames",
    "charNames_gen"
  ]);
  const database = useDatabase();
  const [dbDirty, forceUpdate] = useForceUpdate();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    return database.teams.followAny(
      (k, r) => (r === "new" || r === "remove" || r === "update") && forceUpdate()
    );
  }, [forceUpdate, database]);
  useTitle();
  const onAdd = () => {
    const newid = database.teams.new();
    navigate(newid);
  };
  const [showImport, onShowImport, onHideImport] = useBoolState();
  const [data, setData] = reactExports.useState("");
  const importData = () => {
    try {
      const dataObj = JSON.parse(data);
      if (!database.teams.import(dataObj))
        window.alert(`Data verification failed.`);
      onHideImport();
    } catch (e) {
      window.alert(`Data Import failed. ${e}`);
      return;
    }
  };
  const displayTeam = useDataEntryBase(database.displayTeam);
  const { sortType, ascending, charKeys } = displayTeam;
  const [searchTerm, setSearchTerm] = reactExports.useState(displayTeam.searchTerm);
  const deferredSearchTerm = reactExports.useDeferredValue(searchTerm);
  reactExports.useEffect(() => {
    database.displayTeam.set({ searchTerm: deferredSearchTerm });
  }, [database, deferredSearchTerm]);
  const { teamIds, totalTeamNum } = reactExports.useMemo(() => {
    const totalTeamNum2 = database.teams.keys.length;
    const teamIds2 = database.teams.keys.filter(
      filterFunction(
        { charKeys, name: deferredSearchTerm },
        teamFilterConfigs(database)
      )
    ).sort((k1, k2) => {
      return sortFunction(
        teamSortMap[sortType],
        ascending,
        teamSortConfigs()
      )(database.teams.get(k1), database.teams.get(k2));
    });
    return dbDirty && { teamIds: teamIds2, totalTeamNum: totalTeamNum2 };
  }, [dbDirty, database, charKeys, deferredSearchTerm, sortType, ascending]);
  const brPt = useMediaQueryUp();
  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    teamIds.length
  );
  const TeamIdsToShow = reactExports.useMemo(
    () => teamIds.slice(0, numShow),
    [teamIds, numShow]
  );
  const totalShowing = teamIds.length !== totalTeamNum ? `${teamIds.length}/${totalTeamNum}` : `${totalTeamNum}`;
  const showingTextProps = {
    numShowing: TeamIdsToShow.length,
    total: totalShowing,
    t,
    namespace: "page_teams"
  };
  const sortByButtonProps = {
    sortKeys: [...teamSortKeys],
    value: sortType,
    onChange: (sortType2) => database.displayTeam.set({ sortType: sortType2 }),
    ascending,
    onChangeAsc: (ascending2) => database.displayTeam.set({ ascending: ascending2 })
  };
  return /* @__PURE__ */ jsxs(Box, { display: "flex", flexDirection: "column", gap: 1, children: [
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
      /* @__PURE__ */ jsxs(Box, { display: "flex", gap: 1, alignItems: "stretch", children: [
        /* @__PURE__ */ jsx(
          CharacterMultiAutocomplete,
          {
            teamIds,
            charKeys,
            setCharKey: (charKeys2) => database.displayTeam.set({ charKeys: charKeys2 }),
            acProps: { sx: { flexGrow: 1 } }
          }
        ),
        /* @__PURE__ */ jsx(
          TextField,
          {
            autoFocus: true,
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            label: "Team Name",
            sx: { height: "100%", flexGrow: 1 },
            InputProps: {
              sx: { height: "100%" }
            }
          }
        )
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
    /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
      /* @__PURE__ */ jsx(Button, { fullWidth: true, onClick: onAdd, color: "info", startIcon: /* @__PURE__ */ jsx(default_1, {}), children: "Add Team" }),
      /* @__PURE__ */ jsx(ModalWrapper, { open: showImport, onClose: onHideImport, children: /* @__PURE__ */ jsxs(CardThemed, { children: [
        /* @__PURE__ */ jsx(CardHeader, { title: "Import Team" }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(
          CardContent,
          {
            sx: { display: "flex", flexDirection: "column", gap: 2 },
            children: [
              /* @__PURE__ */ jsx(Typography, { children: "Import a team in JSON form below." }),
              /* @__PURE__ */ jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "JSON Data",
                  placeholder: "Paste your Team JSON here",
                  value: data,
                  onChange: (e) => setData(e.target.value),
                  multiline: true,
                  rows: 4
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  startIcon: /* @__PURE__ */ jsx(default_1$1, {}),
                  disabled: !data,
                  onClick: importData,
                  children: "Import"
                }
              )
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(
        Button,
        {
          fullWidth: true,
          onClick: onShowImport,
          color: "info",
          startIcon: /* @__PURE__ */ jsx(default_1$1, {}),
          children: "Import Team"
        }
      )
    ] }),
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
        children: /* @__PURE__ */ jsx(Grid, { container: true, spacing: 2, columns, children: TeamIdsToShow.map((tid) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
          reactExports.Suspense,
          {
            fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 150 }),
            children: /* @__PURE__ */ jsx(
              TeamCard,
              {
                teamId: tid,
                bgt: "light",
                onClick: (cid) => navigate(`${tid}${cid ? `/${cid}` : ""}`)
              }
            )
          }
        ) }, tid)) })
      }
    ),
    teamIds.length !== TeamIdsToShow.length && /* @__PURE__ */ jsx(
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
  PageTeams as default
};
