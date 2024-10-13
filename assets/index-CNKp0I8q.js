import { r as reactExports, bq as generateUtilityClass, br as generateUtilityClasses, bs as styled, bt as _extends, bu as useThemeProps, bv as _objectWithoutPropertiesLoose, j as jsxRuntimeExports, bw as clsx, bx as composeClasses, by as capitalize, bz as lighten_1, bA as alpha_1, bB as darken_1, c as createSvgIcon, bC as ButtonBase, v as requireCreateSvgIcon, w as interopRequireDefaultExports, a as useDatabase, bD as useDataEntryBase, z as useTranslation, bE as allArtifactSetKeys, bF as instance, aH as useInfScroll, d as jsxs, O as CardContent, b as jsx, bb as ToggleButton, aS as ColorText, ay as default_1$1, bG as ToggleButtonGroup, bH as InputAdornment, bj as TextField, S as Skeleton, f as Box, X as ImgIcon, bI as artifactDefIcon, bJ as ArtifactSetName, ai as Translate, bf as handleMultiSelect, bK as getArtSetStat, K as useTheme, L as useMediaQuery, bL as useDBMeta, bM as getCharSheet, aA as range, bN as maxConstellationCount, M as CardHeader, bO as CharIconSide, bP as CharacterName, aj as IconButton, ak as default_1$2, G as Grid, h as CardThemed, al as ModalWrapper, bQ as NextImage, T as Typography, bR as DocumentDisplay, a$ as SillyContext, ae as useBoolState, bS as getCharStat, g as getCharEle, bT as iconAsset, V as ElementIcon, Y as imgAssets, H as allWeaponTypeKeys, bU as allCharacterKeys, aG as sortFunction, I as getWeaponStat, bV as weaponAsset, bW as WeaponDesc, bX as WeaponName, bY as getLevelString, bZ as StarsDisplay, b_ as WeaponPassiveName, b$ as WeaponPassiveDesc, c0 as uiInput, c1 as FieldDisplayList, c2 as NodeFieldDisplay, c3 as ListItem, c4 as computeUIData, c5 as getWeaponSheet, c6 as dataObjForWeapon, c7 as input, c8 as resolveInfo, c9 as getCalcDisplay, ca as allWeaponKeys, b5 as catTotal, cb as allWeaponSubstatKeys, cc as SubstatMultiAutocomplete, cd as useMatch, ce as Tab, P as Link, cf as Tabs, Z as FlowerIcon, W as AnvilIcon, U as People, N as Divider, cg as Routes, ch as Route, ci as Navigate } from "./index-B8aczfSH.js";
const TableContext = /* @__PURE__ */ reactExports.createContext();
const TableContext$1 = TableContext;
function getTableUtilityClass(slot) {
  return generateUtilityClass("MuiTable", slot);
}
generateUtilityClasses("MuiTable", ["root", "stickyHeader"]);
const _excluded$5 = ["className", "component", "padding", "size", "stickyHeader"];
const useUtilityClasses$5 = (ownerState) => {
  const {
    classes,
    stickyHeader
  } = ownerState;
  const slots = {
    root: ["root", stickyHeader && "stickyHeader"]
  };
  return composeClasses(slots, getTableUtilityClass, classes);
};
const TableRoot = styled("table", {
  name: "MuiTable",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, ownerState.stickyHeader && styles.stickyHeader];
  }
})(({
  theme,
  ownerState
}) => _extends({
  display: "table",
  width: "100%",
  borderCollapse: "collapse",
  borderSpacing: 0,
  "& caption": _extends({}, theme.typography.body2, {
    padding: theme.spacing(2),
    color: (theme.vars || theme).palette.text.secondary,
    textAlign: "left",
    captionSide: "bottom"
  })
}, ownerState.stickyHeader && {
  borderCollapse: "separate"
}));
const defaultComponent$3 = "table";
const Table = /* @__PURE__ */ reactExports.forwardRef(function Table2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiTable"
  });
  const {
    className,
    component = defaultComponent$3,
    padding = "normal",
    size = "medium",
    stickyHeader = false
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$5);
  const ownerState = _extends({}, props, {
    component,
    padding,
    size,
    stickyHeader
  });
  const classes = useUtilityClasses$5(ownerState);
  const table = reactExports.useMemo(() => ({
    padding,
    size,
    stickyHeader
  }), [padding, size, stickyHeader]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TableContext$1.Provider, {
    value: table,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRoot, _extends({
      as: component,
      role: component === defaultComponent$3 ? null : "table",
      ref,
      className: clsx(classes.root, className),
      ownerState
    }, other))
  });
});
const Table$1 = Table;
const Tablelvl2Context = /* @__PURE__ */ reactExports.createContext();
const Tablelvl2Context$1 = Tablelvl2Context;
function getTableBodyUtilityClass(slot) {
  return generateUtilityClass("MuiTableBody", slot);
}
generateUtilityClasses("MuiTableBody", ["root"]);
const _excluded$4 = ["className", "component"];
const useUtilityClasses$4 = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  return composeClasses(slots, getTableBodyUtilityClass, classes);
};
const TableBodyRoot = styled("tbody", {
  name: "MuiTableBody",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})({
  display: "table-row-group"
});
const tablelvl2$1 = {
  variant: "body"
};
const defaultComponent$2 = "tbody";
const TableBody = /* @__PURE__ */ reactExports.forwardRef(function TableBody2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiTableBody"
  });
  const {
    className,
    component = defaultComponent$2
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$4);
  const ownerState = _extends({}, props, {
    component
  });
  const classes = useUtilityClasses$4(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tablelvl2Context$1.Provider, {
    value: tablelvl2$1,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableBodyRoot, _extends({
      className: clsx(classes.root, className),
      as: component,
      ref,
      role: component === defaultComponent$2 ? null : "rowgroup",
      ownerState
    }, other))
  });
});
const TableBody$1 = TableBody;
function getTableCellUtilityClass(slot) {
  return generateUtilityClass("MuiTableCell", slot);
}
const tableCellClasses = generateUtilityClasses("MuiTableCell", ["root", "head", "body", "footer", "sizeSmall", "sizeMedium", "paddingCheckbox", "paddingNone", "alignLeft", "alignCenter", "alignRight", "alignJustify", "stickyHeader"]);
const tableCellClasses$1 = tableCellClasses;
const _excluded$3 = ["align", "className", "component", "padding", "scope", "size", "sortDirection", "variant"];
const useUtilityClasses$3 = (ownerState) => {
  const {
    classes,
    variant,
    align,
    padding,
    size,
    stickyHeader
  } = ownerState;
  const slots = {
    root: ["root", variant, stickyHeader && "stickyHeader", align !== "inherit" && `align${capitalize(align)}`, padding !== "normal" && `padding${capitalize(padding)}`, `size${capitalize(size)}`]
  };
  return composeClasses(slots, getTableCellUtilityClass, classes);
};
const TableCellRoot = styled("td", {
  name: "MuiTableCell",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, styles[ownerState.variant], styles[`size${capitalize(ownerState.size)}`], ownerState.padding !== "normal" && styles[`padding${capitalize(ownerState.padding)}`], ownerState.align !== "inherit" && styles[`align${capitalize(ownerState.align)}`], ownerState.stickyHeader && styles.stickyHeader];
  }
})(({
  theme,
  ownerState
}) => _extends({}, theme.typography.body2, {
  display: "table-cell",
  verticalAlign: "inherit",
  // Workaround for a rendering bug with spanned columns in Chrome 62.0.
  // Removes the alpha (sets it to 1), and lightens or darkens the theme color.
  borderBottom: theme.vars ? `1px solid ${theme.vars.palette.TableCell.border}` : `1px solid
    ${theme.palette.mode === "light" ? lighten_1(alpha_1(theme.palette.divider, 1), 0.88) : darken_1(alpha_1(theme.palette.divider, 1), 0.68)}`,
  textAlign: "left",
  padding: 16
}, ownerState.variant === "head" && {
  color: (theme.vars || theme).palette.text.primary,
  lineHeight: theme.typography.pxToRem(24),
  fontWeight: theme.typography.fontWeightMedium
}, ownerState.variant === "body" && {
  color: (theme.vars || theme).palette.text.primary
}, ownerState.variant === "footer" && {
  color: (theme.vars || theme).palette.text.secondary,
  lineHeight: theme.typography.pxToRem(21),
  fontSize: theme.typography.pxToRem(12)
}, ownerState.size === "small" && {
  padding: "6px 16px",
  [`&.${tableCellClasses$1.paddingCheckbox}`]: {
    width: 24,
    // prevent the checkbox column from growing
    padding: "0 12px 0 16px",
    "& > *": {
      padding: 0
    }
  }
}, ownerState.padding === "checkbox" && {
  width: 48,
  // prevent the checkbox column from growing
  padding: "0 0 0 4px"
}, ownerState.padding === "none" && {
  padding: 0
}, ownerState.align === "left" && {
  textAlign: "left"
}, ownerState.align === "center" && {
  textAlign: "center"
}, ownerState.align === "right" && {
  textAlign: "right",
  flexDirection: "row-reverse"
}, ownerState.align === "justify" && {
  textAlign: "justify"
}, ownerState.stickyHeader && {
  position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: (theme.vars || theme).palette.background.default
}));
const TableCell = /* @__PURE__ */ reactExports.forwardRef(function TableCell2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiTableCell"
  });
  const {
    align = "inherit",
    className,
    component: componentProp,
    padding: paddingProp,
    scope: scopeProp,
    size: sizeProp,
    sortDirection,
    variant: variantProp
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$3);
  const table = reactExports.useContext(TableContext$1);
  const tablelvl22 = reactExports.useContext(Tablelvl2Context$1);
  const isHeadCell = tablelvl22 && tablelvl22.variant === "head";
  let component;
  if (componentProp) {
    component = componentProp;
  } else {
    component = isHeadCell ? "th" : "td";
  }
  let scope = scopeProp;
  if (component === "td") {
    scope = void 0;
  } else if (!scope && isHeadCell) {
    scope = "col";
  }
  const variant = variantProp || tablelvl22 && tablelvl22.variant;
  const ownerState = _extends({}, props, {
    align,
    component,
    padding: paddingProp || (table && table.padding ? table.padding : "normal"),
    size: sizeProp || (table && table.size ? table.size : "medium"),
    sortDirection,
    stickyHeader: variant === "head" && table && table.stickyHeader,
    variant
  });
  const classes = useUtilityClasses$3(ownerState);
  let ariaSort = null;
  if (sortDirection) {
    ariaSort = sortDirection === "asc" ? "ascending" : "descending";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TableCellRoot, _extends({
    as: component,
    ref,
    className: clsx(classes.root, className),
    "aria-sort": ariaSort,
    scope,
    ownerState
  }, other));
});
const TableCell$1 = TableCell;
function getTableHeadUtilityClass(slot) {
  return generateUtilityClass("MuiTableHead", slot);
}
generateUtilityClasses("MuiTableHead", ["root"]);
const _excluded$2 = ["className", "component"];
const useUtilityClasses$2 = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  return composeClasses(slots, getTableHeadUtilityClass, classes);
};
const TableHeadRoot = styled("thead", {
  name: "MuiTableHead",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})({
  display: "table-header-group"
});
const tablelvl2 = {
  variant: "head"
};
const defaultComponent$1 = "thead";
const TableHead = /* @__PURE__ */ reactExports.forwardRef(function TableHead2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiTableHead"
  });
  const {
    className,
    component = defaultComponent$1
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$2);
  const ownerState = _extends({}, props, {
    component
  });
  const classes = useUtilityClasses$2(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tablelvl2Context$1.Provider, {
    value: tablelvl2,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeadRoot, _extends({
      as: component,
      className: clsx(classes.root, className),
      ref,
      role: component === defaultComponent$1 ? null : "rowgroup",
      ownerState
    }, other))
  });
});
const TableHead$1 = TableHead;
function getTableRowUtilityClass(slot) {
  return generateUtilityClass("MuiTableRow", slot);
}
const tableRowClasses = generateUtilityClasses("MuiTableRow", ["root", "selected", "hover", "head", "footer"]);
const tableRowClasses$1 = tableRowClasses;
const _excluded$1 = ["className", "component", "hover", "selected"];
const useUtilityClasses$1 = (ownerState) => {
  const {
    classes,
    selected,
    hover,
    head,
    footer
  } = ownerState;
  const slots = {
    root: ["root", selected && "selected", hover && "hover", head && "head", footer && "footer"]
  };
  return composeClasses(slots, getTableRowUtilityClass, classes);
};
const TableRowRoot = styled("tr", {
  name: "MuiTableRow",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, ownerState.head && styles.head, ownerState.footer && styles.footer];
  }
})(({
  theme
}) => ({
  color: "inherit",
  display: "table-row",
  verticalAlign: "middle",
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0,
  [`&.${tableRowClasses$1.hover}:hover`]: {
    backgroundColor: (theme.vars || theme).palette.action.hover
  },
  [`&.${tableRowClasses$1.selected}`]: {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})` : alpha_1(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    "&:hover": {
      backgroundColor: theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.hoverOpacity}))` : alpha_1(theme.palette.primary.main, theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity)
    }
  }
}));
const defaultComponent = "tr";
const TableRow = /* @__PURE__ */ reactExports.forwardRef(function TableRow2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiTableRow"
  });
  const {
    className,
    component = defaultComponent,
    hover = false,
    selected = false
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded$1);
  const tablelvl22 = reactExports.useContext(Tablelvl2Context$1);
  const ownerState = _extends({}, props, {
    component,
    hover,
    selected,
    head: tablelvl22 && tablelvl22.variant === "head",
    footer: tablelvl22 && tablelvl22.variant === "footer"
  });
  const classes = useUtilityClasses$1(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TableRowRoot, _extends({
    as: component,
    ref,
    className: clsx(classes.root, className),
    role: component === defaultComponent ? null : "row",
    ownerState
  }, other));
});
const TableRow$1 = TableRow;
const ArrowDownwardIcon = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"
}), "ArrowDownward");
function getTableSortLabelUtilityClass(slot) {
  return generateUtilityClass("MuiTableSortLabel", slot);
}
const tableSortLabelClasses = generateUtilityClasses("MuiTableSortLabel", ["root", "active", "icon", "iconDirectionDesc", "iconDirectionAsc"]);
const tableSortLabelClasses$1 = tableSortLabelClasses;
const _excluded = ["active", "children", "className", "direction", "hideSortIcon", "IconComponent"];
const useUtilityClasses = (ownerState) => {
  const {
    classes,
    direction,
    active
  } = ownerState;
  const slots = {
    root: ["root", active && "active"],
    icon: ["icon", `iconDirection${capitalize(direction)}`]
  };
  return composeClasses(slots, getTableSortLabelUtilityClass, classes);
};
const TableSortLabelRoot = styled(ButtonBase, {
  name: "MuiTableSortLabel",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, ownerState.active && styles.active];
  }
})(({
  theme
}) => ({
  cursor: "pointer",
  display: "inline-flex",
  justifyContent: "flex-start",
  flexDirection: "inherit",
  alignItems: "center",
  "&:focus": {
    color: (theme.vars || theme).palette.text.secondary
  },
  "&:hover": {
    color: (theme.vars || theme).palette.text.secondary,
    [`& .${tableSortLabelClasses$1.icon}`]: {
      opacity: 0.5
    }
  },
  [`&.${tableSortLabelClasses$1.active}`]: {
    color: (theme.vars || theme).palette.text.primary,
    [`& .${tableSortLabelClasses$1.icon}`]: {
      opacity: 1,
      color: (theme.vars || theme).palette.text.secondary
    }
  }
}));
const TableSortLabelIcon = styled("span", {
  name: "MuiTableSortLabel",
  slot: "Icon",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.icon, styles[`iconDirection${capitalize(ownerState.direction)}`]];
  }
})(({
  theme,
  ownerState
}) => _extends({
  fontSize: 18,
  marginRight: 4,
  marginLeft: 4,
  opacity: 0,
  transition: theme.transitions.create(["opacity", "transform"], {
    duration: theme.transitions.duration.shorter
  }),
  userSelect: "none"
}, ownerState.direction === "desc" && {
  transform: "rotate(0deg)"
}, ownerState.direction === "asc" && {
  transform: "rotate(180deg)"
}));
const TableSortLabel = /* @__PURE__ */ reactExports.forwardRef(function TableSortLabel2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiTableSortLabel"
  });
  const {
    active = false,
    children,
    className,
    direction = "asc",
    hideSortIcon = false,
    IconComponent = ArrowDownwardIcon
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const ownerState = _extends({}, props, {
    active,
    direction,
    hideSortIcon,
    IconComponent
  });
  const classes = useUtilityClasses(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableSortLabelRoot, _extends({
    className: clsx(classes.root, className),
    component: "span",
    disableRipple: true,
    ownerState,
    ref
  }, other, {
    children: [children, hideSortIcon && !active ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(TableSortLabelIcon, {
      as: IconComponent,
      className: clsx(classes.icon),
      ownerState
    })]
  }));
});
const TableSortLabel$1 = TableSortLabel;
var Search = {};
var _interopRequireDefault = interopRequireDefaultExports;
Object.defineProperty(Search, "__esModule", {
  value: true
});
var default_1 = Search.default = void 0;
var _createSvgIcon = _interopRequireDefault(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
var _default = (0, _createSvgIcon.default)(/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
}), "Search");
default_1 = Search.default = _default;
const maxRarities = [5, 4, 3];
function TabArtifact() {
  const database = useDatabase();
  const archive = useDataEntryBase(database.displayArchive);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const searchTermDeferred = reactExports.useDeferredValue(searchTerm);
  const handleRarity = handleMultiSelect([...maxRarities]);
  const { t } = useTranslation(
    allArtifactSetKeys.map((key) => {
      return `artifact_${key}_gen`;
    })
  );
  const { artifact } = archive;
  const artifactOptionDispatch = reactExports.useCallback(
    (option) => database.displayArchive.set({ artifact: { ...artifact, ...option } }),
    [database, artifact]
  );
  const artSetKeys = reactExports.useMemo(() => {
    return allArtifactSetKeys.filter((setKey) => {
      const { rarities: rarities2 } = getArtSetStat(setKey);
      if (!artifact.rarity.includes(
        Math.max(...rarities2)
      ))
        return false;
      const setKeyStr = instance.t(`artifactNames_gen:${setKey}`).toLocaleLowerCase();
      const set4KeyDesc = t("setEffects.4", {
        ns: `artifact_${setKey}_gen`
      }).toLocaleLowerCase();
      const set2KeyDesc = t("setEffects.2", {
        ns: `artifact_${setKey}_gen`
      }).toLocaleLowerCase();
      if (searchTermDeferred && !setKeyStr.includes(searchTermDeferred.toLocaleLowerCase()) && !set2KeyDesc.includes(searchTermDeferred.toLocaleLowerCase()) && !set4KeyDesc.includes(searchTermDeferred.toLocaleLowerCase()))
        return false;
      return true;
    });
  }, [artifact, searchTermDeferred, t]);
  const artSetKeysWithoutPrayer = reactExports.useMemo(
    () => artSetKeys.filter((sk) => !sk.startsWith("Prayers")),
    [artSetKeys]
  );
  const artSetKeysOnlyPrayer = reactExports.useMemo(
    () => artSetKeys.filter((sk) => sk.startsWith("Prayers")),
    [artSetKeys]
  );
  const { numShow, setTriggerElement } = useInfScroll(
    10,
    artSetKeysWithoutPrayer.length
  );
  const artSetKeysToShow = reactExports.useMemo(
    () => artSetKeysWithoutPrayer.slice(0, numShow),
    [artSetKeysWithoutPrayer, numShow]
  );
  return /* @__PURE__ */ jsxs(Box, { children: [
    /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", gap: 2 }, children: [
      /* @__PURE__ */ jsx(ToggleButtonGroup, { value: artifact.rarity, children: maxRarities.map((r) => /* @__PURE__ */ jsx(
        ToggleButton,
        {
          value: r,
          onClick: () => artifactOptionDispatch({
            rarity: handleRarity(artifact.rarity, r)
          }),
          children: /* @__PURE__ */ jsx(ColorText, { color: `rarity${r}`, children: /* @__PURE__ */ jsx(default_1$1, { sx: { verticalAlign: "text-top" } }) })
        },
        r
      )) }),
      /* @__PURE__ */ jsx(
        TextField,
        {
          fullWidth: true,
          variant: "outlined",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          InputProps: {
            startAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsx(default_1, {}) })
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(Table$1, { children: [
      /* @__PURE__ */ jsx(TableHead$1, { children: /* @__PURE__ */ jsxs(TableRow$1, { children: [
        /* @__PURE__ */ jsx(TableCell$1, { children: "Set" }),
        /* @__PURE__ */ jsx(TableCell$1, { children: "Rarity" }),
        /* @__PURE__ */ jsx(TableCell$1, { children: "2-piece Bonus" }),
        /* @__PURE__ */ jsx(TableCell$1, { children: "4-piece Bonus" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody$1, { children: [
        artSetKeysToShow.map((setKey) => {
          const { rarities: rarities2 } = getArtSetStat(setKey);
          return /* @__PURE__ */ jsx(
            reactExports.Suspense,
            {
              fallback: /* @__PURE__ */ jsx(TableRow$1, { children: /* @__PURE__ */ jsx(TableCell$1, { colSpan: 4, children: /* @__PURE__ */ jsx(
                Skeleton,
                {
                  sx: { borderRadius: 1 },
                  variant: "rectangular",
                  width: "100%",
                  height: 50
                }
              ) }) }),
              children: /* @__PURE__ */ jsxs(TableRow$1, { children: [
                /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsx(ImgIcon, { size: 4, src: artifactDefIcon(setKey) }),
                  /* @__PURE__ */ jsx(ArtifactSetName, { setKey })
                ] }) }),
                /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(Box, { display: "flex", children: rarities2.sort().reverse().map((r) => /* @__PURE__ */ jsx(
                  ColorText,
                  {
                    color: `rarity${r}`,
                    children: /* @__PURE__ */ jsx(default_1$1, {})
                  },
                  r
                )) }) }),
                /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(
                  Translate,
                  {
                    ns: `artifact_${setKey}_gen`,
                    key18: `setEffects.2`
                  }
                ) }),
                /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(
                  Translate,
                  {
                    ns: `artifact_${setKey}_gen`,
                    key18: `setEffects.4`
                  }
                ) })
              ] }, setKey)
            }
          );
        }),
        artSetKeysWithoutPrayer.length !== artSetKeysToShow.length && /* @__PURE__ */ jsx(TableRow$1, { children: /* @__PURE__ */ jsx(TableCell$1, { colSpan: 4, children: /* @__PURE__ */ jsx(
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
            height: 50
          }
        ) }) })
      ] })
    ] }),
    artSetKeysOnlyPrayer.length !== 0 && /* @__PURE__ */ jsxs(Table$1, { sx: { mt: 2 }, children: [
      /* @__PURE__ */ jsx(TableHead$1, { children: /* @__PURE__ */ jsxs(TableRow$1, { children: [
        /* @__PURE__ */ jsx(TableCell$1, { children: "Set" }),
        /* @__PURE__ */ jsx(TableCell$1, { children: "Rarity" }),
        /* @__PURE__ */ jsx(TableCell$1, { children: "1-piece Bonus" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody$1, { children: artSetKeysOnlyPrayer.map((setKey) => {
        const { rarities: rarities2 } = getArtSetStat(setKey);
        return /* @__PURE__ */ jsxs(TableRow$1, { children: [
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx(ImgIcon, { size: 4, src: artifactDefIcon(setKey) }),
            /* @__PURE__ */ jsx(ArtifactSetName, { setKey })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(Box, { display: "flex", children: rarities2.sort().reverse().map((r) => /* @__PURE__ */ jsx(
            ColorText,
            {
              color: `rarity${r}`,
              children: /* @__PURE__ */ jsx(default_1$1, {})
            },
            r
          )) }) }),
          /* @__PURE__ */ jsx(TableCell$1, { width: "90%", children: /* @__PURE__ */ jsx(
            Translate,
            {
              ns: `artifact_${setKey}_gen`,
              key18: `setEffects.1`
            }
          ) })
        ] }, setKey);
      }) })
    ] })
  ] });
}
const talentSpacing = {
  xs: 12,
  sm: 6,
  md: 4
};
function CharacterView({
  show,
  character,
  onClose
}) {
  const { t } = useTranslation("sheet_gen");
  const theme = useTheme();
  const grlg = useMediaQuery(theme.breakpoints.up("lg"));
  const { key: characterKey, constellation, ascension } = character;
  const { gender } = useDBMeta();
  const characterSheet = getCharSheet(characterKey, gender);
  const skillBurstList = [
    ["auto", t("talents.auto")],
    ["skill", t("talents.skill")],
    ["burst", t("talents.burst")]
  ];
  const passivesList = [
    ["passive1", t("unlockPassive1"), 1],
    ["passive2", t("unlockPassive2"), 4],
    ["passive3", t("unlockPassive3"), 0]
  ];
  const constellationCards = reactExports.useMemo(
    () => range(1, maxConstellationCount).map((i) => /* @__PURE__ */ jsx(
      SkillDisplayCard,
      {
        characterKey,
        talentKey: `constellation${i}`,
        subtitle: t("constellationLvl", { level: i })
      }
    )),
    [t, characterKey]
  );
  return /* @__PURE__ */ jsx(
    ModalWrapper,
    {
      open: show,
      onClose,
      containerProps: { maxWidth: "xl" },
      children: /* @__PURE__ */ jsxs(CardThemed, { children: [
        /* @__PURE__ */ jsx(
          CardHeader,
          {
            title: /* @__PURE__ */ jsxs(Box, { children: [
              /* @__PURE__ */ jsx(CharIconSide, { characterKey, sideMargin: true }),
              /* @__PURE__ */ jsx(Box, { sx: { pl: 1 }, component: "span", children: /* @__PURE__ */ jsx(CharacterName, { characterKey, gender }) })
            ] }),
            action: /* @__PURE__ */ jsx(IconButton, { onClick: onClose, children: /* @__PURE__ */ jsx(default_1$2, {}) })
          }
        ),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, children: [
          grlg && /* @__PURE__ */ jsx(
            Grid,
            {
              item: true,
              xs: 12,
              md: 12,
              lg: 3,
              sx: { display: "flex", flexDirection: "column", gap: 1 },
              children: constellationCards.map((c, i) => /* @__PURE__ */ jsx(
                Box,
                {
                  sx: { opacity: constellation >= i + 1 ? 1 : 0.5 },
                  children: c
                },
                i
              ))
            }
          ),
          /* @__PURE__ */ jsxs(Grid, { item: true, xs: 12, md: 12, lg: 9, container: true, spacing: 1, children: [
            skillBurstList.map(([tKey, tText]) => /* @__PURE__ */ jsx(Grid, { item: true, ...talentSpacing, children: /* @__PURE__ */ jsx(
              SkillDisplayCard,
              {
                characterKey,
                talentKey: tKey,
                subtitle: tText
              }
            ) }, tKey)),
            !!characterSheet.getTalentOfKey("sprint") && /* @__PURE__ */ jsx(Grid, { item: true, ...talentSpacing, children: /* @__PURE__ */ jsx(
              SkillDisplayCard,
              {
                characterKey,
                talentKey: "sprint",
                subtitle: t("talents.altSprint")
              }
            ) }),
            !!characterSheet.getTalentOfKey("passive") && /* @__PURE__ */ jsx(Grid, { item: true, ...talentSpacing, children: /* @__PURE__ */ jsx(
              SkillDisplayCard,
              {
                characterKey,
                talentKey: "passive",
                subtitle: "Passive"
              }
            ) }),
            passivesList.map(([tKey, tText, asc]) => {
              const enabled = ascension >= asc;
              if (!characterSheet.getTalentOfKey(tKey))
                return null;
              return /* @__PURE__ */ jsx(
                Grid,
                {
                  item: true,
                  style: { opacity: enabled ? 1 : 0.5 },
                  ...talentSpacing,
                  children: /* @__PURE__ */ jsx(
                    SkillDisplayCard,
                    {
                      characterKey,
                      talentKey: tKey,
                      subtitle: tText
                    }
                  )
                },
                tKey
              );
            })
          ] }),
          !grlg && /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 12, lg: 3, container: true, spacing: 1, children: constellationCards.map((c, i) => /* @__PURE__ */ jsx(
            Grid,
            {
              item: true,
              sx: { opacity: constellation >= i + 1 ? 1 : 0.5 },
              ...talentSpacing,
              children: c
            },
            i
          )) })
        ] }) })
      ] })
    }
  );
}
function SkillDisplayCard({
  characterKey,
  talentKey,
  subtitle
}) {
  const { gender } = useDBMeta();
  const characterSheet = getCharSheet(characterKey, gender);
  const talentSheet = characterSheet.getTalentOfKey(talentKey);
  return /* @__PURE__ */ jsx(CardThemed, { bgt: "light", sx: { height: "100%" }, children: /* @__PURE__ */ jsxs(CardContent, { children: [
    /* @__PURE__ */ jsxs(Grid, { container: true, sx: { flexWrap: "nowrap" }, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(
        Box,
        {
          component: NextImage ? NextImage : "img",
          src: talentSheet == null ? void 0 : talentSheet.img,
          sx: { width: 60, height: "auto" }
        }
      ) }),
      /* @__PURE__ */ jsxs(Grid, { item: true, flexGrow: 1, sx: { pl: 1 }, children: [
        /* @__PURE__ */ jsx(Typography, { variant: "h6", children: talentSheet == null ? void 0 : talentSheet.name }),
        /* @__PURE__ */ jsx(Typography, { variant: "subtitle1", children: subtitle })
      ] })
    ] }),
    (talentSheet == null ? void 0 : talentSheet.sections) ? /* @__PURE__ */ jsx(DocumentDisplay, { sections: talentSheet.sections, hideDesc: true }) : null
  ] }) });
}
const rarties = [5, 4];
function TabCharacter() {
  const { silly } = reactExports.useContext(SillyContext);
  const database = useDatabase();
  const archive = useDataEntryBase(database.displayArchive);
  const handleRarity = handleMultiSelect([...rarties]);
  const handleType = handleMultiSelect([...allWeaponTypeKeys]);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const searchTermDeferred = reactExports.useDeferredValue(searchTerm);
  const { character } = archive;
  const characterOptionDispatch = reactExports.useCallback(
    (option) => database.displayArchive.set({ character: { ...character, ...option } }),
    [database, character]
  );
  const charKeys = reactExports.useMemo(() => {
    return allCharacterKeys.filter((cKey) => {
      const { rarity, weaponType } = getCharStat(cKey);
      if (!character.rarity.includes(rarity))
        return false;
      if (!character.weaponType.includes(weaponType))
        return false;
      const nameStr = instance.t(`charNames_gen:${cKey}`);
      const sillyStr = silly && instance.exists(`sillyWisher_charNames:${cKey}`) ? instance.t(`sillyWisher_charNames:${cKey}`) : "";
      if (searchTermDeferred && !nameStr.toLocaleLowerCase().includes(searchTermDeferred.toLocaleLowerCase()) && !sillyStr.toLocaleLowerCase().includes(searchTermDeferred.toLocaleLowerCase()))
        return false;
      return true;
    });
  }, [character, searchTermDeferred, silly]);
  const { numShow, setTriggerElement } = useInfScroll(10, charKeys.length);
  const handleSort = (property) => {
    const isAsc = character.sortOrderBy === property && character.sortOrder === "asc";
    characterOptionDispatch({
      sortOrder: isAsc ? "desc" : "asc",
      sortOrderBy: property
    });
  };
  const sortedCharKeys = reactExports.useMemo(
    () => sortFunction([character.sortOrderBy], character.sortOrder === "asc", {
      name: (cKey) => silly && instance.exists(`sillyWisher_charNames:${cKey}`) ? instance.t(`sillyWisher_charNames:${cKey}`) : instance.t(`charNames_gen:${cKey}`),
      rarity: (cKey) => getCharStat(cKey).rarity,
      element: (cKey) => getCharEle(cKey),
      type: (cKey) => getCharStat(cKey).weaponType
    }),
    [character.sortOrder, character.sortOrderBy, silly]
  );
  const charKeysToShow = reactExports.useMemo(
    () => charKeys.sort(sortedCharKeys).slice(0, numShow),
    [charKeys, numShow, sortedCharKeys]
  );
  const columns = [
    { key: "name", label: "Name", width: 40 },
    { key: "rarity", label: "Rarity", width: 20 },
    { key: "element", label: "Element", width: 20 },
    { key: "type", label: "Type", width: 20 }
  ];
  return /* @__PURE__ */ jsxs(Box, { children: [
    /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", gap: 2 }, children: [
      /* @__PURE__ */ jsx(ToggleButtonGroup, { value: character.rarity, children: rarties.map((r) => /* @__PURE__ */ jsx(
        ToggleButton,
        {
          value: r,
          onClick: () => characterOptionDispatch({
            rarity: handleRarity(character.rarity, r)
          }),
          children: /* @__PURE__ */ jsx(ColorText, { color: `rarity${r}`, children: /* @__PURE__ */ jsx(default_1$1, { sx: { verticalAlign: "text-top" } }) })
        },
        r
      )) }),
      /* @__PURE__ */ jsx(ToggleButtonGroup, { value: character.weaponType, children: allWeaponTypeKeys.map((wt) => {
        var _a;
        return /* @__PURE__ */ jsx(
          ToggleButton,
          {
            value: wt,
            onClick: () => characterOptionDispatch({
              weaponType: handleType(character.weaponType, wt)
            }),
            children: /* @__PURE__ */ jsx(ImgIcon, { src: (_a = imgAssets.weaponTypes) == null ? void 0 : _a[wt], size: 2 })
          },
          wt
        );
      }) }),
      /* @__PURE__ */ jsx(
        TextField,
        {
          fullWidth: true,
          variant: "outlined",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          InputProps: {
            startAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsx(default_1, {}) })
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(Table$1, { children: [
      /* @__PURE__ */ jsx(TableHead$1, { children: /* @__PURE__ */ jsx(TableRow$1, { children: columns.map(({ key, label, width }) => /* @__PURE__ */ jsx(
        TableCell$1,
        {
          sortDirection: character.sortOrderBy === key ? character.sortOrder : false,
          width: `${width}%`,
          children: /* @__PURE__ */ jsx(
            TableSortLabel$1,
            {
              active: character.sortOrderBy === key,
              direction: character.sortOrderBy === key ? character.sortOrder : "asc",
              onClick: () => handleSort(key),
              children: label
            }
          )
        }
      )) }) }),
      /* @__PURE__ */ jsxs(TableBody$1, { children: [
        charKeysToShow.map((wKey) => /* @__PURE__ */ jsx(CharacterRow, { characterKey: wKey }, wKey)),
        charKeysToShow.length !== charKeys.length && /* @__PURE__ */ jsx(TableRow$1, { children: /* @__PURE__ */ jsx(TableCell$1, { colSpan: 5, children: /* @__PURE__ */ jsx(
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
            height: 50
          }
        ) }) })
      ] })
    ] })
  ] });
}
const CharacterRow = reactExports.memo(function CharacterRow2({
  characterKey: cKey
}) {
  var _a;
  const { silly } = reactExports.useContext(SillyContext);
  const { gender } = useDBMeta();
  const [show, onShow, onHide] = useBoolState();
  const { rarity, weaponType } = getCharStat(cKey);
  const element = getCharEle(cKey);
  const character = reactExports.useMemo(
    () => ({
      key: cKey,
      level: 90,
      ascension: 6,
      constellation: 6,
      talent: {
        auto: 10,
        skill: 10,
        burst: 10
      }
    }),
    [cKey]
  );
  return /* @__PURE__ */ jsxs(
    reactExports.Suspense,
    {
      fallback: /* @__PURE__ */ jsx(TableRow$1, { children: /* @__PURE__ */ jsx(TableCell$1, { colSpan: 4, children: /* @__PURE__ */ jsx(
        Skeleton,
        {
          sx: { borderRadius: 1 },
          variant: "rectangular",
          width: "100%",
          height: 50
        }
      ) }) }),
      children: [
        /* @__PURE__ */ jsx(CharacterView, { show, character, onClose: onHide }),
        /* @__PURE__ */ jsxs(TableRow$1, { hover: true, onClick: onShow, sx: { cursor: "pointer" }, children: [
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx(ImgIcon, { size: 4, src: iconAsset(cKey, gender, silly) }),
            /* @__PURE__ */ jsx(CharacterName, { characterKey: cKey, gender })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(Box, { display: "flex", children: /* @__PURE__ */ jsx(ColorText, { color: `rarity${rarity}`, children: /* @__PURE__ */ jsx(default_1$1, {}) }) }) }),
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(ElementIcon, { ele: element, iconProps: { color: element } }) }),
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(
            ImgIcon,
            {
              src: (_a = imgAssets.weaponTypes) == null ? void 0 : _a[weaponType],
              size: 3,
              sideMargin: true
            }
          ) })
        ] })
      ]
    }
  );
});
function WeaponView({
  show,
  weaponUIData,
  weapon,
  onClose
}) {
  const { key, level = 0, refinement = 1, ascension = 0 } = weapon;
  const weaponStat = key && getWeaponStat(key);
  const img = key ? weaponAsset(key, ascension >= 2) : "";
  return /* @__PURE__ */ jsx(
    ModalWrapper,
    {
      open: show,
      onClose,
      containerProps: { maxWidth: "md" },
      children: /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: weaponStat && weaponUIData && /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1.5, children: [
        /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, sm: 3, children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1.5, children: [
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 6, sm: 12, children: /* @__PURE__ */ jsx(Box, { sx: { position: "relative", display: "flex" }, children: /* @__PURE__ */ jsx(
            Box,
            {
              component: "img",
              src: img,
              className: `grad-${weaponStat.rarity}star`,
              sx: {
                maxWidth: 256,
                width: "100%",
                height: "auto",
                borderRadius: 1
              }
            }
          ) }) }),
          /* @__PURE__ */ jsx(Grid, { item: true, xs: 6, sm: 12, children: /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsx("small", { children: key && /* @__PURE__ */ jsx(WeaponDesc, { weaponKey: key }) }) }) })
        ] }) }),
        /* @__PURE__ */ jsxs(
          Grid,
          {
            item: true,
            xs: 12,
            sm: 9,
            sx: { display: "flex", flexDirection: "column", gap: 1 },
            children: [
              /* @__PURE__ */ jsxs(Box, { display: "flex", gap: 1, flexWrap: "wrap", children: [
                /* @__PURE__ */ jsx(Typography, { variant: "h5", children: /* @__PURE__ */ jsx(WeaponName, { weaponKey: key }) }),
                onClose && /* @__PURE__ */ jsx(IconButton, { onClick: onClose, sx: { marginLeft: "auto" }, children: /* @__PURE__ */ jsx(default_1$2, {}) })
              ] }),
              /* @__PURE__ */ jsxs(Typography, { children: [
                "Lv. ",
                getLevelString(level, ascension),
                " R",
                refinement
              ] }),
              /* @__PURE__ */ jsx(StarsDisplay, { stars: weaponStat.rarity }),
              /* @__PURE__ */ jsx(Typography, { variant: "subtitle1", children: /* @__PURE__ */ jsx("strong", { children: key && /* @__PURE__ */ jsx(WeaponPassiveName, { weaponKey: key }) }) }),
              /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: key && /* @__PURE__ */ jsx(
                WeaponPassiveDesc,
                {
                  weaponKey: key,
                  refineIndex: (weaponUIData.get(uiInput.weapon.refinement).value ?? 1) - 1
                }
              ) }),
              /* @__PURE__ */ jsx(Box, { display: "flex", flexDirection: "column", gap: 1, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", children: /* @__PURE__ */ jsx(FieldDisplayList, { bgt: "light", children: [
                uiInput.weapon.main,
                uiInput.weapon.sub,
                uiInput.weapon.sub2
              ].map((node) => {
                const n = weaponUIData.get(node);
                if (n.isEmpty || !n.value)
                  return null;
                return /* @__PURE__ */ jsx(
                  NodeFieldDisplay,
                  {
                    calcRes: n,
                    component: ListItem
                  },
                  JSON.stringify(n.info)
                );
              }) }) }) })
            ]
          }
        )
      ] }) }) })
    }
  );
}
const rarities = [5, 4, 3, 2, 1];
function TabWeapon() {
  const database = useDatabase();
  const archive = useDataEntryBase(database.displayArchive);
  const handleRarity = handleMultiSelect([...rarities]);
  const handleType = handleMultiSelect([...allWeaponTypeKeys]);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const searchTermDeferred = reactExports.useDeferredValue(searchTerm);
  const { weapon } = archive;
  const weaponOptionDispatch = reactExports.useCallback(
    (option) => database.displayArchive.set({ weapon: { ...weapon, ...option } }),
    [database, weapon]
  );
  const weaponKeys = reactExports.useMemo(() => {
    return allWeaponKeys.filter((wKey) => {
      const { rarity, subStat, weaponType } = getWeaponStat(wKey);
      if (!weapon.rarity.includes(rarity))
        return false;
      if (weapon.subStat.length && (!subStat || !weapon.subStat.includes(subStat.type)))
        return false;
      if (!weapon.weaponType.includes(weaponType))
        return false;
      const setKeyStr = instance.t(`weaponNames_gen:${wKey}`);
      if (searchTermDeferred && !setKeyStr.toLocaleLowerCase().includes(searchTermDeferred.toLocaleLowerCase()))
        return false;
      return true;
    });
  }, [weapon, searchTermDeferred]);
  const handleSort = (property) => {
    const isAsc = weapon.sortOrderBy === property && weapon.sortOrder === "asc";
    weaponOptionDispatch({
      sortOrder: isAsc ? "desc" : "asc",
      sortOrderBy: property
    });
  };
  const weaponDataCache = reactExports.useMemo(() => {
    const cache = /* @__PURE__ */ new Map();
    allWeaponKeys.forEach((wKey) => {
      const { rarity } = getWeaponStat(wKey);
      const weapon2 = {
        id: "invalid",
        ascension: rarity > 2 ? 6 : 4,
        key: wKey,
        level: rarity > 2 ? 90 : 70,
        refinement: 1,
        location: "",
        lock: false
      };
      const weaponUIData = computeUIData([
        getWeaponSheet(wKey).data,
        dataObjForWeapon(weapon2)
      ]);
      const mainNode = weaponUIData.get(input.weapon.main);
      const subNode = weaponUIData.get(input.weapon.sub);
      cache.set(wKey, {
        main: getCalcDisplay(mainNode).valueString,
        sub: getCalcDisplay(subNode).valueString
      });
    });
    return cache;
  }, []);
  const sortedWeaponKeys = reactExports.useMemo(
    () => sortFunction(
      weapon.sortOrderBy === "sub" ? ["subType", weapon.sortOrderBy] : [weapon.sortOrderBy],
      weapon.sortOrder === "asc",
      {
        name: (wKey) => instance.t(`weaponNames_gen:${wKey}`),
        type: (wKey) => getWeaponStat(wKey).weaponType,
        rarity: (wKey) => getWeaponStat(wKey).rarity,
        main: (wKey) => {
          var _a;
          return ((_a = weaponDataCache.get(wKey)) == null ? void 0 : _a.main) ?? "";
        },
        sub: (wKey) => {
          var _a;
          return ((_a = weaponDataCache.get(wKey)) == null ? void 0 : _a.sub) ?? "";
        },
        subType: (wKey) => {
          var _a;
          return ((_a = getWeaponStat(wKey).subStat) == null ? void 0 : _a.type) ?? "";
        }
      }
    ),
    [weapon.sortOrder, weapon.sortOrderBy, weaponDataCache]
  );
  const { numShow, setTriggerElement } = useInfScroll(10, weaponKeys.length);
  const weaponKeysToShow = reactExports.useMemo(
    () => weaponKeys.sort(sortedWeaponKeys).slice(0, numShow),
    [weaponKeys, sortedWeaponKeys, numShow]
  );
  const weaponTotals = reactExports.useMemo(
    () => catTotal(
      allWeaponSubstatKeys,
      (ct) => allWeaponKeys.forEach((wKey) => {
        const { subStat } = getWeaponStat(wKey);
        if (!subStat)
          return;
        const { type } = subStat;
        ct[type].total++;
        if (weaponKeys.includes(wKey))
          ct[type].current++;
      })
    ),
    [weaponKeys]
  );
  const columns = [
    { key: "name", label: "Name", width: 30 },
    { key: "type", label: "Type", width: 10 },
    { key: "rarity", label: "Rarity", width: 10 },
    { key: "main", label: "Main", width: 20 },
    { key: "sub", label: "Secondary", width: 30 }
  ];
  return /* @__PURE__ */ jsxs(Box, { children: [
    /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", gap: 2 }, children: [
      /* @__PURE__ */ jsx(ToggleButtonGroup, { value: weapon.rarity, children: rarities.map((r) => /* @__PURE__ */ jsx(
        ToggleButton,
        {
          value: r,
          onClick: () => weaponOptionDispatch({ rarity: handleRarity(weapon.rarity, r) }),
          children: /* @__PURE__ */ jsx(ColorText, { color: `rarity${r}`, children: /* @__PURE__ */ jsx(default_1$1, { sx: { verticalAlign: "text-top" } }) })
        },
        r
      )) }),
      /* @__PURE__ */ jsx(ToggleButtonGroup, { value: weapon.weaponType, children: allWeaponTypeKeys.map((wt) => {
        var _a;
        return /* @__PURE__ */ jsx(
          ToggleButton,
          {
            value: wt,
            onClick: () => weaponOptionDispatch({
              weaponType: handleType(weapon.weaponType, wt)
            }),
            children: /* @__PURE__ */ jsx(ImgIcon, { src: (_a = imgAssets.weaponTypes) == null ? void 0 : _a[wt], size: 2 })
          },
          wt
        );
      }) }),
      /* @__PURE__ */ jsx(
        SubstatMultiAutocomplete,
        {
          fullWidth: true,
          substatKeys: weapon.subStat,
          setSubstatKeys: (subStat) => {
            weaponOptionDispatch({ subStat });
          },
          totals: weaponTotals,
          allSubstatKeys: [...allWeaponSubstatKeys]
        }
      ),
      /* @__PURE__ */ jsx(
        TextField,
        {
          fullWidth: true,
          variant: "outlined",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          InputProps: {
            startAdornment: /* @__PURE__ */ jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsx(default_1, {}) })
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(Table$1, { children: [
      /* @__PURE__ */ jsx(TableHead$1, { children: /* @__PURE__ */ jsx(TableRow$1, { children: columns.map(({ key, label, width }) => /* @__PURE__ */ jsx(
        TableCell$1,
        {
          sortDirection: weapon.sortOrderBy === key ? weapon.sortOrder : false,
          width: `${width}%`,
          children: /* @__PURE__ */ jsx(
            TableSortLabel$1,
            {
              active: weapon.sortOrderBy === key,
              direction: weapon.sortOrderBy === key ? weapon.sortOrder : "asc",
              onClick: () => handleSort(key),
              children: label
            }
          )
        }
      )) }) }),
      /* @__PURE__ */ jsxs(TableBody$1, { children: [
        weaponKeysToShow.map((wKey) => /* @__PURE__ */ jsx(WeaponRow, { weaponKey: wKey }, wKey)),
        weaponKeys.length !== weaponKeysToShow.length && /* @__PURE__ */ jsx(TableRow$1, { children: /* @__PURE__ */ jsx(TableCell$1, { colSpan: 5, children: /* @__PURE__ */ jsx(
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
            height: 50
          }
        ) }) })
      ] })
    ] })
  ] });
}
const WeaponRow = reactExports.memo(function WeaponRow2({
  weaponKey: wKey
}) {
  var _a;
  const [show, onShow, onHide] = useBoolState();
  const { rarity, weaponType } = getWeaponStat(wKey);
  const weapon = reactExports.useMemo(
    () => ({
      id: "invalid",
      ascension: rarity > 2 ? 6 : 4,
      key: wKey,
      level: rarity > 2 ? 90 : 70,
      refinement: 1,
      location: "",
      lock: false
    }),
    [rarity, wKey]
  );
  const weaponUIData = reactExports.useMemo(
    () => computeUIData([getWeaponSheet(wKey).data, dataObjForWeapon(weapon)]),
    [wKey, weapon]
  );
  const main = weaponUIData.get(input.weapon.main);
  const sub = weaponUIData.get(input.weapon.sub);
  return /* @__PURE__ */ jsxs(
    reactExports.Suspense,
    {
      fallback: /* @__PURE__ */ jsx(TableRow$1, { children: /* @__PURE__ */ jsx(TableCell$1, { colSpan: 5, children: /* @__PURE__ */ jsx(
        Skeleton,
        {
          sx: { borderRadius: 1 },
          variant: "rectangular",
          width: "100%",
          height: 50
        }
      ) }) }),
      children: [
        /* @__PURE__ */ jsx(
          WeaponView,
          {
            show,
            weaponUIData,
            weapon,
            onClose: onHide
          }
        ),
        /* @__PURE__ */ jsxs(TableRow$1, { hover: true, onClick: onShow, sx: { cursor: "pointer" }, children: [
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx(ImgIcon, { size: 4, src: weaponAsset(wKey, true) }),
            /* @__PURE__ */ jsx(WeaponName, { weaponKey: wKey })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(
            ImgIcon,
            {
              src: (_a = imgAssets.weaponTypes) == null ? void 0 : _a[weaponType],
              size: 3,
              sideMargin: true
            }
          ) }),
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(Box, { display: "flex", children: /* @__PURE__ */ jsx(ColorText, { color: `rarity${rarity}`, children: /* @__PURE__ */ jsx(default_1$1, {}) }) }) }),
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(StatDisplay, { node: main }) }),
          /* @__PURE__ */ jsx(TableCell$1, { children: /* @__PURE__ */ jsx(StatDisplay, { node: sub }) })
        ] })
      ]
    }
  );
});
function StatDisplay({ node }) {
  const { name, icon } = resolveInfo(node.info);
  if (Number.isNaN(node.value))
    return null;
  return /* @__PURE__ */ jsxs(Box, { sx: { display: "flex" }, children: [
    /* @__PURE__ */ jsxs(Typography, { flexGrow: 1, children: [
      icon,
      " ",
      name
    ] }),
    /* @__PURE__ */ jsx(Typography, { children: getCalcDisplay(node).valueString })
  ] });
}
const artifacts = {
  i18Key: "tabs.artifacts",
  icon: /* @__PURE__ */ jsx(FlowerIcon, {}),
  value: "artifacts",
  to: "/artifacts"
};
const weapons = {
  i18Key: "tabs.weapons",
  icon: /* @__PURE__ */ jsx(AnvilIcon, {}),
  value: "weapons",
  to: "/weapons"
};
const characters = {
  i18Key: "tabs.characters",
  icon: /* @__PURE__ */ jsx(People, {}),
  value: "characters",
  to: "/characters"
};
const tabs = [artifacts, weapons, characters];
const tabValues = tabs.map(({ value }) => value);
function PageArchive() {
  const { t } = useTranslation("ui");
  const {
    params: { tab: tabRaw }
  } = useMatch({ path: "/archive/:tab", end: false }) ?? {
    params: {}
  };
  const tab = reactExports.useMemo(() => {
    const tab2 = tabValues.find((tv) => tv === tabRaw);
    return tab2 ?? "artifacts";
  }, [tabRaw]);
  return /* @__PURE__ */ jsxs(CardThemed, { children: [
    /* @__PURE__ */ jsx(
      Tabs,
      {
        variant: "fullWidth",
        value: tab,
        sx: {
          "& .MuiTab-root:hover": {
            transition: "background-color 0.25s ease",
            backgroundColor: "rgba(255,255,255,0.1)"
          },
          "& .Mui-selected": {
            color: "white !important"
          },
          "& .MuiTabs-indicator": {
            height: "4px"
          }
        },
        children: tabs.map(({ i18Key, icon, value, to }) => {
          return /* @__PURE__ */ jsx(
            Tab,
            {
              icon,
              iconPosition: "start",
              value,
              label: t(i18Key),
              component: Link,
              to: `/archive${to}`
            },
            value
          );
        })
      }
    ),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(
      reactExports.Suspense,
      {
        fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 1e3 }),
        children: /* @__PURE__ */ jsxs(Routes, { children: [
          /* @__PURE__ */ jsx(Route, { path: "artifacts", element: /* @__PURE__ */ jsx(TabArtifact, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "weapons", element: /* @__PURE__ */ jsx(TabWeapon, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "characters", element: /* @__PURE__ */ jsx(TabCharacter, {}) }),
          /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(Navigate, { to: "artifacts", replace: true }) })
        ] })
      }
    )
  ] });
}
export {
  PageArchive as default
};
