import { ae as useBoolState, r as reactExports, af as getRandomElementFromArray, d as jsxs, G as Grid, b as jsx, T as Typography, ag as Button, ah as default_1$2, ai as Translate, h as CardThemed, O as CardContent, aj as IconButton, ak as default_1$3, N as Divider, S as Skeleton, al as ModalWrapper, v as requireCreateSvgIcon, w as interopRequireDefaultExports, j as jsxRuntimeExports, z as useTranslation, a as useDatabase, am as useDisplayArtifact, ad as Trans, an as default_1$4, ao as ArtifactFilterDisplay, ap as SqBadge, aq as default_1$5, ar as default_1$6, as as default_1$7, M as CardHeader, at as useForceUpdate, f as Box, au as ArtifactCard, av as Alert, aw as Stack, ax as ImgFullwidth, ay as default_1$8, az as iconInlineProps, P as Link$1, aA as range, aB as SmolProgress, aC as useMediaQueryUp, ac as ReactGA, aD as artifactSortConfigs, aE as artifactFilterConfigs, aF as filterFunction, aG as sortFunction, aH as useInfScroll, aI as default_1$a, aJ as artifactSortMap, aK as ArtifactEditor, aL as ShowingAndSortOptionSelect, aM as artifactSortKeys } from "./index-B8aczfSH.js";
import { A as AddArtInfo } from "./AddArtInfo-CpFskg2y.js";
import { d as default_1$9 } from "./Settings-ctf56yjV.js";
import { L as Link } from "./Link-BpROEXu0.js";
function InfoComponent({
  pageKey,
  text = "",
  modalTitle = "",
  children
}) {
  const [show, onTrue, onFalse] = useBoolState(
    typeof window !== "undefined" && localStorage.getItem(`infoShown_${pageKey}`) !== "true"
  );
  const [displayText] = reactExports.useState(
    Array.isArray(text) ? getRandomElementFromArray(text) : text
  );
  const closeModal = reactExports.useCallback(() => {
    onFalse();
    localStorage.setItem(`infoShown_${pageKey}`, "true");
  }, [onFalse, pageKey]);
  return /* @__PURE__ */ jsxs(CardThemed, { children: [
    /* @__PURE__ */ jsxs(Grid, { container: true, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, flexGrow: 1, children: /* @__PURE__ */ jsx(Typography, { variant: "caption", pl: 1, children: displayText }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: "auto", children: /* @__PURE__ */ jsx(
        Button,
        {
          size: "small",
          color: "info",
          variant: "contained",
          onClick: onTrue,
          startIcon: /* @__PURE__ */ jsx(default_1$2, {}),
          children: /* @__PURE__ */ jsx(Translate, { ns: "ui", key18: "info" })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(
      ModalWrapper,
      {
        containerProps: { maxWidth: "xl" },
        open: show,
        onClose: closeModal,
        children: /* @__PURE__ */ jsxs(CardThemed, { children: [
          /* @__PURE__ */ jsxs(CardContent, { sx: { py: 1, display: "flex" }, children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h6", children: modalTitle }),
            /* @__PURE__ */ jsx(IconButton, { onClick: closeModal, sx: { ml: "auto" }, children: /* @__PURE__ */ jsx(default_1$3, {}) })
          ] }),
          /* @__PURE__ */ jsx(Divider, {}),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
            reactExports.Suspense,
            {
              fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 500 }),
              children
            }
          ) })
        ] })
      }
    )
  ] });
}
var Difference = {};
var _interopRequireDefault$1 = interopRequireDefaultExports;
Object.defineProperty(Difference, "__esModule", {
  value: true
});
var default_1$1 = Difference.default = void 0;
var _createSvgIcon$1 = _interopRequireDefault$1(requireCreateSvgIcon());
var _jsxRuntime$1 = jsxRuntimeExports;
var _default$1 = (0, _createSvgIcon$1.default)(/* @__PURE__ */ (0, _jsxRuntime$1.jsx)("path", {
  d: "M18 23H4c-1.1 0-2-.9-2-2V7h2v14h14v2zM15 1H8c-1.1 0-1.99.9-1.99 2L6 17c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V7l-6-6zm1.5 14h-6v-2h6v2zm0-6h-2v2h-2V9h-2V7h2V5h2v2h2v2z"
}), "Difference");
default_1$1 = Difference.default = _default$1;
var PersonOff = {};
var _interopRequireDefault = interopRequireDefaultExports;
Object.defineProperty(PersonOff, "__esModule", {
  value: true
});
var default_1 = PersonOff.default = void 0;
var _createSvgIcon = _interopRequireDefault(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
var _default = (0, _createSvgIcon.default)(/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M8.65 5.82C9.36 4.72 10.6 4 12 4c2.21 0 4 1.79 4 4 0 1.4-.72 2.64-1.82 3.35L8.65 5.82zM20 17.17c-.02-1.1-.63-2.11-1.61-2.62-.54-.28-1.13-.54-1.77-.76L20 17.17zm1.19 4.02L2.81 2.81 1.39 4.22l8.89 8.89c-1.81.23-3.39.79-4.67 1.45-1 .51-1.61 1.54-1.61 2.66V20h13.17l2.61 2.61 1.41-1.42z"
}), "PersonOff");
default_1 = PersonOff.default = _default;
function ArtifactFilter({
  numShowing,
  total,
  artifactIds
}) {
  const { t } = useTranslation(["artifact", "ui"]);
  const database = useDatabase();
  const { filterOption } = useDisplayArtifact();
  const filterOptionDispatch = reactExports.useCallback(
    (option) => database.displayArtifact.set({
      filterOption: { ...filterOption, ...option }
    }),
    [database, filterOption]
  );
  return /* @__PURE__ */ jsx(
    reactExports.Suspense,
    {
      fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 300 }),
      children: /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxs(Grid, { container: true, children: [
          /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(Typography, { variant: "h6", children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "artifactFilter", children: "Artifact Filter" }) }) }),
          /* @__PURE__ */ jsx(
            Grid,
            {
              item: true,
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              children: /* @__PURE__ */ jsxs(Typography, { children: [
                /* @__PURE__ */ jsx("strong", { children: numShowing }),
                " / ",
                total
              ] })
            }
          ),
          /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(
            Button,
            {
              size: "small",
              color: "error",
              onClick: () => database.displayArtifact.set({ action: "reset" }),
              startIcon: /* @__PURE__ */ jsx(default_1$4, {}),
              children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "ui:reset" })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(
          reactExports.Suspense,
          {
            fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 400 }),
            children: /* @__PURE__ */ jsx(
              ArtifactFilterDisplay,
              {
                filterOption,
                filterOptionDispatch,
                filteredIds: artifactIds
              }
            )
          }
        )
      ] }) })
    }
  );
}
function ArtifactRedButtons({ artifactIds }) {
  const { t } = useTranslation(["artifact", "ui"]);
  const database = useDatabase();
  const { numDelete, numUnequip, numUnlock, numLock } = reactExports.useMemo(() => {
    const artifacts = artifactIds.map(
      (id) => database.arts.get(id)
    );
    const numUnlock2 = artifacts.reduce((a, art) => a + (art.lock ? 0 : 1), 0);
    const numLock2 = artifacts.length - numUnlock2;
    const numDelete2 = numUnlock2;
    const numUnequip2 = artifacts.reduce(
      (a, art) => a + (art.location ? 1 : 0),
      0
    );
    return { numDelete: numDelete2, numUnequip: numUnequip2, numUnlock: numUnlock2, numLock: numLock2 };
  }, [artifactIds, database]);
  const unequipArtifacts = () => window.confirm(
    `Are you sure you want to unequip ${numUnequip} artifacts currently equipped on characters?`
  ) && artifactIds.map((id) => database.arts.set(id, { location: "" }));
  const deleteArtifacts = () => window.confirm(`Are you sure you want to delete ${numDelete} artifacts?`) && artifactIds.map(
    (id) => {
      var _a;
      return !((_a = database.arts.get(id)) == null ? void 0 : _a.lock) && database.arts.remove(id);
    }
  );
  const lockArtifacts = () => window.confirm(`Are you sure you want to lock ${numUnlock} artifacts?`) && artifactIds.map((id) => database.arts.set(id, { lock: true }));
  const unlockArtifacts = () => window.confirm(`Are you sure you want to unlock ${numLock} artifacts?`) && artifactIds.map((id) => database.arts.set(id, { lock: false }));
  return /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, alignItems: "center", children: [
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxs(
      Button,
      {
        fullWidth: true,
        color: "error",
        disabled: !numUnequip,
        onClick: unequipArtifacts,
        startIcon: /* @__PURE__ */ jsx(default_1, {}),
        children: [
          /* @__PURE__ */ jsx(Trans, { t, i18nKey: "button.unequipArtifacts", children: "Unequip Artifacts" }),
          /* @__PURE__ */ jsx(SqBadge, { sx: { ml: 1 }, color: numUnequip ? "success" : "secondary", children: numUnequip })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxs(
      Button,
      {
        fullWidth: true,
        color: "error",
        disabled: !numDelete,
        onClick: deleteArtifacts,
        startIcon: /* @__PURE__ */ jsx(default_1$5, {}),
        children: [
          /* @__PURE__ */ jsx(Trans, { t, i18nKey: "button.deleteArtifacts", children: "Delete Artifacts" }),
          /* @__PURE__ */ jsx(SqBadge, { sx: { ml: 1 }, color: numDelete ? "success" : "secondary", children: numDelete })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxs(
      Button,
      {
        fullWidth: true,
        color: "error",
        disabled: !numLock,
        onClick: unlockArtifacts,
        startIcon: /* @__PURE__ */ jsx(default_1$6, {}),
        children: [
          /* @__PURE__ */ jsx(Trans, { t, i18nKey: "button.unlockrtifacts", children: "Unlock Artifacts" }),
          /* @__PURE__ */ jsx(SqBadge, { sx: { ml: 1 }, color: numLock ? "success" : "secondary", children: numLock })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxs(
      Button,
      {
        fullWidth: true,
        color: "error",
        disabled: !numUnlock,
        onClick: lockArtifacts,
        startIcon: /* @__PURE__ */ jsx(default_1$7, {}),
        children: [
          /* @__PURE__ */ jsx(Trans, { t, i18nKey: "button.lockArtifacts", children: "Lock Artifacts" }),
          /* @__PURE__ */ jsx(SqBadge, { sx: { ml: 1 }, color: numUnlock ? "success" : "secondary", children: numUnlock })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, display: "flex", justifyContent: "space-around", children: /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "text.secondary", children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "buttonHint", children: [
      "Note: the red buttons above only apply to",
      /* @__PURE__ */ jsx("b", { children: "currently filtered artifacts" })
    ] }) }) })
  ] });
}
function DupModal({
  setArtifactIdToEdit,
  show,
  onHide
}) {
  const { t } = useTranslation("artifact");
  return /* @__PURE__ */ jsx(ModalWrapper, { open: show, onClose: onHide, children: /* @__PURE__ */ jsxs(CardThemed, { children: [
    /* @__PURE__ */ jsx(
      CardHeader,
      {
        title: /* @__PURE__ */ jsxs(
          Typography,
          {
            variant: "h6",
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            children: [
              /* @__PURE__ */ jsx(default_1$1, { sx: { verticalAlign: "text-top", mr: 1 } }),
              t`showDup`
            ]
          }
        ),
        action: /* @__PURE__ */ jsx(IconButton, { onClick: onHide, children: /* @__PURE__ */ jsx(default_1$3, {}) })
      }
    ),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(DupContent, { setArtifactIdToEdit }) })
  ] }) });
}
function DupContent({
  setArtifactIdToEdit
}) {
  const { t } = useTranslation("artifact");
  const database = useDatabase();
  const [dbDirty, setDBDirty] = useForceUpdate();
  reactExports.useEffect(() => database.arts.followAny(setDBDirty), [setDBDirty, database]);
  const dupList = reactExports.useMemo(() => {
    const dups = dbDirty && [];
    let artKeys = database.arts.keys;
    while (artKeys.length !== 0) {
      const artKey = artKeys.shift();
      if (!artKey)
        continue;
      const art = database.arts.get(artKey);
      if (!art)
        continue;
      const { duplicated } = database.arts.findDups(art, artKeys);
      if (!duplicated.length)
        continue;
      const dupKeys = duplicated.map((a) => a.id);
      dups.push(
        [artKey, ...dupKeys].sort((a) => {
          var _a;
          return ((_a = database.arts.get(a)) == null ? void 0 : _a.location) ?? "" ? -1 : 1;
        })
      );
      artKeys = artKeys.filter((id) => !dupKeys.includes(id));
    }
    return dups;
  }, [database, dbDirty]);
  return /* @__PURE__ */ jsxs(Stack, { spacing: 2, children: [
    dupList.map((dups) => /* @__PURE__ */ jsx(CardThemed, { sx: { overflowX: "scroll" }, children: /* @__PURE__ */ jsx(CardContent, { sx: { display: "flex", gap: 1 }, children: dups.map((dup) => /* @__PURE__ */ jsx(Box, { sx: { minWidth: 300 }, children: /* @__PURE__ */ jsx(
      ArtifactCard,
      {
        artifactId: dup,
        setLocation: (location) => database.arts.set(dup, { location }),
        onLockToggle: () => database.arts.set(dup, ({ lock }) => ({ lock: !lock })),
        onDelete: () => database.arts.remove(dup),
        onEdit: () => setArtifactIdToEdit(dup)
      }
    ) }, dup)) }) }, dups.join())),
    !dupList.length && /* @__PURE__ */ jsx(Alert, { variant: "filled", severity: "success", children: t`noDupAlert` })
  ] });
}
const artifactcard = "" + new URL("artifactcard-CYZmz0U0.png", import.meta.url).href;
const artifacteditor = "" + new URL("artifacteditor-BryQ3Lmm.png", import.meta.url).href;
const artifactfilter = "" + new URL("artifactfilter-DK_eMtaJ.png", import.meta.url).href;
function Colors() {
  return /* @__PURE__ */ jsx(Box, { display: "inline-flex", gap: 0.3, sx: { height: "1.5em" }, children: range(0, 5).map((s) => /* @__PURE__ */ jsx(
    SmolProgress,
    {
      color: `roll${s + 1}.main`,
      value: (s + 1) / 6 * 100
    },
    s
  )) });
}
function ArtifactInfoDisplay() {
  const { t } = useTranslation("artifact");
  return /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, children: [
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, lg: 5, xl: 4, children: /* @__PURE__ */ jsx(ImgFullwidth, { src: artifactcard }) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, lg: 7, xl: 8, children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "info.section1", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h5", children: "Substat rolls" }),
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        "The ",
        /* @__PURE__ */ jsx("b", { children: "number of rolls" }),
        " a substat has is shown to the left of the substat. As the number gets higher, the substat is more colorful:",
        /* @__PURE__ */ jsx(Colors, {}),
        "."
      ] }),
      /* @__PURE__ */ jsx(Typography, { variant: "h5", children: "Substat Roll Value" }),
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        "The Roll Value(RV) of an subtat is a percentage of the current value over the highest potential 5",
        /* @__PURE__ */ jsx(default_1$8, { ...iconInlineProps }),
        "value. From the Image, the maximum roll value of CRIT DMG is 7.8%. In RV: ",
        /* @__PURE__ */ jsx("b", { children: "5.8/7.8 = 69.2%." })
      ] }),
      /* @__PURE__ */ jsx(Typography, { variant: "h5", children: "Current Roll Value vs. Maximum Roll Value" }),
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        "When a 5",
        /* @__PURE__ */ jsx(default_1$8, { ...iconInlineProps }),
        " have 9(4+5) total rolls, with each of the rolls having the highest value, that is defined as a 900% RV artifact. However, most of the artifacts are not this lucky. The ",
        /* @__PURE__ */ jsx("b", { children: "Current RV" }),
        " of an artifact is a percentage over that 100% artifact. The ",
        /* @__PURE__ */ jsx("b", { children: "Maximum RV" }),
        " is the maximum possible RV an artifact can achieve, if the remaining artifact rolls from upgrades are the hightest possible value."
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, lg: 6, xl: 7, children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "info.section2", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h5", children: "Artifact Editor" }),
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        "A fully featured artifact editor, that can accept any 3",
        /* @__PURE__ */ jsx(default_1$8, { ...iconInlineProps }),
        " to 5",
        /* @__PURE__ */ jsx(default_1$8, { ...iconInlineProps }),
        " Artifact. When a substat is inputted, it can calculate the exact roll values. It will also make sure that you have the correct number of rolls in the artifact according to the level, along with other metrics of validation."
      ] }),
      /* @__PURE__ */ jsx(Typography, { variant: "h5", children: "Scan screenshots" }),
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        "Manual input is not your cup of tea? You can scan in your artifacts with screenshots! On the Artifact Editor, click the",
        /* @__PURE__ */ jsx(SqBadge, { color: "info", children: "Show Me How!" }),
        " button to learn more."
      ] }),
      /* @__PURE__ */ jsx(Typography, { variant: "h6", children: "Automatic Artifact Scanner" }),
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        "If you are playing Genshin on PC, you can download a tool that automatically scans all your artifacts for you, and you can then import that data in ",
        /* @__PURE__ */ jsx(default_1$9, { ...iconInlineProps }),
        " Database.",
        /* @__PURE__ */ jsx(Link, { component: Link$1, to: "/scanner", children: "Click here" }),
        "for a list of scanners that are compatible with GO."
      ] }),
      /* @__PURE__ */ jsx(Typography, { variant: "h5", children: "Duplicate/Upgrade artifact detection" }),
      /* @__PURE__ */ jsxs(Typography, { children: [
        "Did you know GO can detect if you are adding a ",
        /* @__PURE__ */ jsx("b", { children: "duplicate" }),
        "artifact that exists in the system? It can also detect if the current artifact in editor is an ",
        /* @__PURE__ */ jsx("b", { children: "upgrade" }),
        " of an existing artifact as well. Once a duplicate/upgrade is detected, a preview will allow you to compare the two artifacts in question(See Image)."
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, lg: 6, xl: 5, children: /* @__PURE__ */ jsx(ImgFullwidth, { src: artifacteditor }) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, lg: 7, xl: 6, children: /* @__PURE__ */ jsx(ImgFullwidth, { src: artifactfilter }) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, lg: 5, xl: 6, children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "info.section3", children: [
      /* @__PURE__ */ jsx(Typography, { variant: "h5", children: "Artifact Inventory" }),
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        "All your artifacts that you've added to GO are displayed here. The filters here allow you to further refine your view of your artifacts.",
        " "
      ] }),
      /* @__PURE__ */ jsx(Typography, { variant: "h5", children: "Example: Finding Fodder Artifacts" }),
      /* @__PURE__ */ jsx(Typography, { children: "By utilizing the artifact filter, and the artifact RV, you can quickly find artifacts to feed as food." }),
      /* @__PURE__ */ jsx(Typography, { children: "In this example, the filters are set thusly: " }),
      /* @__PURE__ */ jsx(Typography, { component: "div", children: /* @__PURE__ */ jsxs("ul", { children: [
        /* @__PURE__ */ jsx("li", { children: "Limit level to 0-8." }),
        /* @__PURE__ */ jsx("li", { children: "Unlocked artifacts in Inventory." }),
        /* @__PURE__ */ jsx("li", { children: "Removing the contribution of flat HP, flat DEF and Energy Recharge to RV calculations." }),
        /* @__PURE__ */ jsx("li", { children: "Sorted by Ascending Max Roll Value." })
      ] }) }),
      /* @__PURE__ */ jsx(Typography, { children: "This will filter the artifact Inventory by the lowest RV artifacts, for desired substats." })
    ] }) })
  ] });
}
const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 };
const numToShowMap = { xs: 5, sm: 6, md: 12, lg: 12, xl: 12 };
function PageArtifact() {
  const { t } = useTranslation(["artifact", "ui"]);
  const database = useDatabase();
  const artifactDisplayState = useDisplayArtifact();
  const [artifactIdToEdit, setArtifactIdToEdit] = reactExports.useState();
  const [showDup, onShowDup, onHideDup] = useBoolState(false);
  const brPt = useMediaQueryUp();
  const { sortType, effFilter, ascending } = artifactDisplayState;
  const [dbDirty, forceUpdate] = useForceUpdate();
  const dbDirtyDeferred = reactExports.useDeferredValue(dbDirty);
  const effFilterSet = reactExports.useMemo(
    () => new Set(effFilter),
    [effFilter]
  );
  reactExports.useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/artifact" });
    return database.arts.followAny(() => forceUpdate());
  }, [database, forceUpdate]);
  const noArtifact = reactExports.useMemo(() => !database.arts.values.length, [database]);
  const sortConfigs = reactExports.useMemo(
    () => artifactSortConfigs(effFilterSet),
    [effFilterSet]
  );
  const filterConfigs = reactExports.useMemo(
    () => artifactFilterConfigs({ effFilterSet }),
    [effFilterSet]
  );
  const deferredArtifactDisplayState = reactExports.useDeferredValue(artifactDisplayState);
  const { artifactIds, totalArtNum } = reactExports.useMemo(() => {
    const {
      sortType: sortType2 = artifactSortKeys[0],
      ascending: ascending2 = false,
      filterOption
    } = deferredArtifactDisplayState;
    const allArtifacts = database.arts.values;
    const artifactIds2 = allArtifacts.filter(filterFunction(filterOption, filterConfigs)).sort(
      sortFunction(artifactSortMap[sortType2] ?? [], ascending2, sortConfigs)
    ).map((art) => art.id);
    return { artifactIds: artifactIds2, totalArtNum: allArtifacts.length, ...dbDirtyDeferred };
  }, [
    deferredArtifactDisplayState,
    dbDirtyDeferred,
    database,
    sortConfigs,
    filterConfigs
  ]);
  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    artifactIds.length
  );
  const artifactIdsToShow = reactExports.useMemo(
    () => artifactIds.slice(0, numShow),
    [artifactIds, numShow]
  );
  const totalShowing = artifactIds.length !== totalArtNum ? `${artifactIds.length}/${totalArtNum}` : `${totalArtNum}`;
  const showingTextProps = {
    numShowing: artifactIdsToShow.length,
    total: totalShowing,
    t,
    namespace: "artifact"
  };
  const sortByButtonProps = {
    sortKeys: [...artifactSortKeys],
    value: sortType,
    onChange: (sortType2) => database.displayArtifact.set({ sortType: sortType2 }),
    ascending,
    onChangeAsc: (ascending2) => database.displayArtifact.set({ ascending: ascending2 })
  };
  return /* @__PURE__ */ jsxs(Box, { display: "flex", flexDirection: "column", gap: 1, children: [
    /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: false, children: /* @__PURE__ */ jsx(
      ArtifactEditor,
      {
        artifactIdToEdit,
        cancelEdit: () => setArtifactIdToEdit(void 0),
        allowUpload: true,
        allowEmpty: true
      }
    ) }),
    /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: false, children: /* @__PURE__ */ jsx(
      DupModal,
      {
        show: showDup,
        onHide: onHideDup,
        setArtifactIdToEdit
      }
    ) }),
    /* @__PURE__ */ jsx(
      InfoComponent,
      {
        pageKey: "artifactPage",
        modalTitle: t`info.title`,
        text: t("tipsOfTheDay", { returnObjects: true }),
        children: /* @__PURE__ */ jsx(ArtifactInfoDisplay, {})
      }
    ),
    noArtifact && /* @__PURE__ */ jsx(AddArtInfo, {}),
    /* @__PURE__ */ jsx(
      ArtifactFilter,
      {
        numShowing: artifactIds.length,
        total: totalArtNum,
        artifactIds
      }
    ),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsx(
        Box,
        {
          pb: 2,
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
      ),
      /* @__PURE__ */ jsx(ArtifactRedButtons, { artifactIds })
    ] }) }),
    /* @__PURE__ */ jsxs(Grid, { container: true, columns, spacing: 1, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, xs: true, children: /* @__PURE__ */ jsx(
        Button,
        {
          fullWidth: true,
          onClick: () => setArtifactIdToEdit("new"),
          color: "info",
          startIcon: /* @__PURE__ */ jsx(default_1$a, {}),
          children: t`addNew`
        }
      ) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
        Button,
        {
          fullWidth: true,
          onClick: onShowDup,
          color: "info",
          startIcon: /* @__PURE__ */ jsx(default_1$1, {}),
          children: t`showDup`
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(
      reactExports.Suspense,
      {
        fallback: /* @__PURE__ */ jsx(
          Skeleton,
          {
            variant: "rectangular",
            sx: { width: "100%", height: "100%", minHeight: 5e3 }
          }
        ),
        children: [
          /* @__PURE__ */ jsx(Grid, { container: true, spacing: 1, columns, children: artifactIdsToShow.map((artId) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
            ArtifactCard,
            {
              artifactId: artId,
              effFilter: effFilterSet,
              onDelete: () => database.arts.remove(artId),
              onEdit: () => setArtifactIdToEdit(artId),
              setLocation: (location) => database.arts.set(artId, { location }),
              onLockToggle: () => database.arts.set(artId, ({ lock }) => ({ lock: !lock }))
            }
          ) }, artId)) }),
          artifactIds.length !== artifactIdsToShow.length && /* @__PURE__ */ jsx(
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
        ]
      }
    )
  ] });
}
export {
  PageArtifact as default
};
