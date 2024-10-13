import { fy as usePreviousProps, br as generateUtilityClasses, bq as generateUtilityClass, bs as styled, by as capitalize, r as reactExports, bv as _objectWithoutPropertiesLoose, bt as _extends, fz as useSlotProps, bw as clsx, j as jsxRuntimeExports, d3 as createUseThemeProps, bx as composeClasses, b as jsx, bj as TextField, a as useDatabase, fA as useDataManagerBase, cm as charKeyToLocGenderedCharKey, t as CharacterContext, bL as useDBMeta, bM as getCharSheet, D as DataContext, c0 as uiInput, G as Grid, f as Box, bQ as NextImage, a$ as SillyContext, d as jsxs, bZ as StarsDisplay, bS as getCharStat, T as Typography, g as getCharEle, V as ElementIcon, bP as CharacterName, X as ImgIcon, Y as imgAssets, Q as Chip, ap as SqBadge, bY as getLevelString, ft as useCharMeta, aj as IconButton, fu as default_1$4, fv as default_1$5, aA as range, C as CardActionArea, fB as grey, v as requireCreateSvgIcon, w as interopRequireDefaultExports, cz as CardActions, fC as default_1$6, cp as Tooltip, p as default_1$7, aq as default_1$8, h as CardThemed, e as default_1$9, M as CardHeader, O as CardContent, ck as Fragment, z as useTranslation, ad as Trans, av as Alert, ae as useBoolState, eA as initialArtifactFilterOption, at as useForceUpdate, aC as useMediaQueryUp, aE as artifactFilterConfigs, aH as useInfScroll, aK as ArtifactEditor, ak as default_1$a, N as Divider, S as Skeleton, ao as ArtifactFilterDisplay, aL as ShowingAndSortOptionSelect, ag as Button, aI as default_1$b, fD as CompareBuildWrapper, au as ArtifactCard, al as ModalWrapper, aF as filterFunction, bp as WeaponEditor, bk as WeaponCard, fE as WeaponSwapModal, _ as SlotIcon, az as iconInlineProps, c7 as input, fF as talentLimits, aX as MenuItem, aY as DropdownButton } from "./index-B8aczfSH.js";
const yellow = {
  50: "#fffde7",
  100: "#fff9c4",
  200: "#fff59d",
  300: "#fff176",
  400: "#ffee58",
  500: "#ffeb3b",
  600: "#fdd835",
  700: "#fbc02d",
  800: "#f9a825",
  900: "#f57f17",
  A100: "#ffff8d",
  A200: "#ffff00",
  A400: "#ffea00",
  A700: "#ffd600"
};
const yellow$1 = yellow;
function useBadge(parameters) {
  const {
    badgeContent: badgeContentProp,
    invisible: invisibleProp = false,
    max: maxProp = 99,
    showZero = false
  } = parameters;
  const prevProps = usePreviousProps({
    badgeContent: badgeContentProp,
    max: maxProp
  });
  let invisible = invisibleProp;
  if (invisibleProp === false && badgeContentProp === 0 && !showZero) {
    invisible = true;
  }
  const {
    badgeContent,
    max = maxProp
  } = invisible ? prevProps : parameters;
  const displayValue = badgeContent && Number(badgeContent) > max ? `${max}+` : badgeContent;
  return {
    badgeContent,
    invisible,
    max,
    displayValue
  };
}
function getBadgeUtilityClass(slot) {
  return generateUtilityClass("MuiBadge", slot);
}
const badgeClasses = generateUtilityClasses("MuiBadge", [
  "root",
  "badge",
  "dot",
  "standard",
  "anchorOriginTopRight",
  "anchorOriginBottomRight",
  "anchorOriginTopLeft",
  "anchorOriginBottomLeft",
  "invisible",
  "colorError",
  "colorInfo",
  "colorPrimary",
  "colorSecondary",
  "colorSuccess",
  "colorWarning",
  "overlapRectangular",
  "overlapCircular",
  // TODO: v6 remove the overlap value from these class keys
  "anchorOriginTopLeftCircular",
  "anchorOriginTopLeftRectangular",
  "anchorOriginTopRightCircular",
  "anchorOriginTopRightRectangular",
  "anchorOriginBottomLeftCircular",
  "anchorOriginBottomLeftRectangular",
  "anchorOriginBottomRightCircular",
  "anchorOriginBottomRightRectangular"
]);
const badgeClasses$1 = badgeClasses;
const _excluded = ["anchorOrigin", "className", "classes", "component", "components", "componentsProps", "children", "overlap", "color", "invisible", "max", "badgeContent", "slots", "slotProps", "showZero", "variant"];
const RADIUS_STANDARD = 10;
const RADIUS_DOT = 4;
const useThemeProps = createUseThemeProps();
const useUtilityClasses = (ownerState) => {
  const {
    color,
    anchorOrigin,
    invisible,
    overlap,
    variant,
    classes = {}
  } = ownerState;
  const slots = {
    root: ["root"],
    badge: ["badge", variant, invisible && "invisible", `anchorOrigin${capitalize(anchorOrigin.vertical)}${capitalize(anchorOrigin.horizontal)}`, `anchorOrigin${capitalize(anchorOrigin.vertical)}${capitalize(anchorOrigin.horizontal)}${capitalize(overlap)}`, `overlap${capitalize(overlap)}`, color !== "default" && `color${capitalize(color)}`]
  };
  return composeClasses(slots, getBadgeUtilityClass, classes);
};
const BadgeRoot = styled("span", {
  name: "MuiBadge",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})({
  position: "relative",
  display: "inline-flex",
  // For correct alignment with the text.
  verticalAlign: "middle",
  flexShrink: 0
});
const BadgeBadge = styled("span", {
  name: "MuiBadge",
  slot: "Badge",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.badge, styles[ownerState.variant], styles[`anchorOrigin${capitalize(ownerState.anchorOrigin.vertical)}${capitalize(ownerState.anchorOrigin.horizontal)}${capitalize(ownerState.overlap)}`], ownerState.color !== "default" && styles[`color${capitalize(ownerState.color)}`], ownerState.invisible && styles.invisible];
  }
})(({
  theme
}) => {
  var _theme$vars;
  return {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    position: "absolute",
    boxSizing: "border-box",
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(12),
    minWidth: RADIUS_STANDARD * 2,
    lineHeight: 1,
    padding: "0 6px",
    height: RADIUS_STANDARD * 2,
    borderRadius: RADIUS_STANDARD,
    zIndex: 1,
    // Render the badge on top of potential ripples.
    transition: theme.transitions.create("transform", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    variants: [...Object.keys(((_theme$vars = theme.vars) != null ? _theme$vars : theme).palette).filter((key) => {
      var _theme$vars2, _theme$vars3;
      return ((_theme$vars2 = theme.vars) != null ? _theme$vars2 : theme).palette[key].main && ((_theme$vars3 = theme.vars) != null ? _theme$vars3 : theme).palette[key].contrastText;
    }).map((color) => ({
      props: {
        color
      },
      style: {
        backgroundColor: (theme.vars || theme).palette[color].main,
        color: (theme.vars || theme).palette[color].contrastText
      }
    })), {
      props: {
        variant: "dot"
      },
      style: {
        borderRadius: RADIUS_DOT,
        height: RADIUS_DOT * 2,
        minWidth: RADIUS_DOT * 2,
        padding: 0
      }
    }, {
      props: ({
        ownerState
      }) => ownerState.anchorOrigin.vertical === "top" && ownerState.anchorOrigin.horizontal === "right" && ownerState.overlap === "rectangular",
      style: {
        top: 0,
        right: 0,
        transform: "scale(1) translate(50%, -50%)",
        transformOrigin: "100% 0%",
        [`&.${badgeClasses$1.invisible}`]: {
          transform: "scale(0) translate(50%, -50%)"
        }
      }
    }, {
      props: ({
        ownerState
      }) => ownerState.anchorOrigin.vertical === "bottom" && ownerState.anchorOrigin.horizontal === "right" && ownerState.overlap === "rectangular",
      style: {
        bottom: 0,
        right: 0,
        transform: "scale(1) translate(50%, 50%)",
        transformOrigin: "100% 100%",
        [`&.${badgeClasses$1.invisible}`]: {
          transform: "scale(0) translate(50%, 50%)"
        }
      }
    }, {
      props: ({
        ownerState
      }) => ownerState.anchorOrigin.vertical === "top" && ownerState.anchorOrigin.horizontal === "left" && ownerState.overlap === "rectangular",
      style: {
        top: 0,
        left: 0,
        transform: "scale(1) translate(-50%, -50%)",
        transformOrigin: "0% 0%",
        [`&.${badgeClasses$1.invisible}`]: {
          transform: "scale(0) translate(-50%, -50%)"
        }
      }
    }, {
      props: ({
        ownerState
      }) => ownerState.anchorOrigin.vertical === "bottom" && ownerState.anchorOrigin.horizontal === "left" && ownerState.overlap === "rectangular",
      style: {
        bottom: 0,
        left: 0,
        transform: "scale(1) translate(-50%, 50%)",
        transformOrigin: "0% 100%",
        [`&.${badgeClasses$1.invisible}`]: {
          transform: "scale(0) translate(-50%, 50%)"
        }
      }
    }, {
      props: ({
        ownerState
      }) => ownerState.anchorOrigin.vertical === "top" && ownerState.anchorOrigin.horizontal === "right" && ownerState.overlap === "circular",
      style: {
        top: "14%",
        right: "14%",
        transform: "scale(1) translate(50%, -50%)",
        transformOrigin: "100% 0%",
        [`&.${badgeClasses$1.invisible}`]: {
          transform: "scale(0) translate(50%, -50%)"
        }
      }
    }, {
      props: ({
        ownerState
      }) => ownerState.anchorOrigin.vertical === "bottom" && ownerState.anchorOrigin.horizontal === "right" && ownerState.overlap === "circular",
      style: {
        bottom: "14%",
        right: "14%",
        transform: "scale(1) translate(50%, 50%)",
        transformOrigin: "100% 100%",
        [`&.${badgeClasses$1.invisible}`]: {
          transform: "scale(0) translate(50%, 50%)"
        }
      }
    }, {
      props: ({
        ownerState
      }) => ownerState.anchorOrigin.vertical === "top" && ownerState.anchorOrigin.horizontal === "left" && ownerState.overlap === "circular",
      style: {
        top: "14%",
        left: "14%",
        transform: "scale(1) translate(-50%, -50%)",
        transformOrigin: "0% 0%",
        [`&.${badgeClasses$1.invisible}`]: {
          transform: "scale(0) translate(-50%, -50%)"
        }
      }
    }, {
      props: ({
        ownerState
      }) => ownerState.anchorOrigin.vertical === "bottom" && ownerState.anchorOrigin.horizontal === "left" && ownerState.overlap === "circular",
      style: {
        bottom: "14%",
        left: "14%",
        transform: "scale(1) translate(-50%, 50%)",
        transformOrigin: "0% 100%",
        [`&.${badgeClasses$1.invisible}`]: {
          transform: "scale(0) translate(-50%, 50%)"
        }
      }
    }, {
      props: {
        invisible: true
      },
      style: {
        transition: theme.transitions.create("transform", {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.leavingScreen
        })
      }
    }]
  };
});
const Badge = /* @__PURE__ */ reactExports.forwardRef(function Badge2(inProps, ref) {
  var _ref, _slots$root, _ref2, _slots$badge, _slotProps$root, _slotProps$badge;
  const props = useThemeProps({
    props: inProps,
    name: "MuiBadge"
  });
  const {
    anchorOrigin: anchorOriginProp = {
      vertical: "top",
      horizontal: "right"
    },
    className,
    component,
    components = {},
    componentsProps = {},
    children,
    overlap: overlapProp = "rectangular",
    color: colorProp = "default",
    invisible: invisibleProp = false,
    max: maxProp = 99,
    badgeContent: badgeContentProp,
    slots,
    slotProps,
    showZero = false,
    variant: variantProp = "standard"
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const {
    badgeContent,
    invisible: invisibleFromHook,
    max,
    displayValue: displayValueFromHook
  } = useBadge({
    max: maxProp,
    invisible: invisibleProp,
    badgeContent: badgeContentProp,
    showZero
  });
  const prevProps = usePreviousProps({
    anchorOrigin: anchorOriginProp,
    color: colorProp,
    overlap: overlapProp,
    variant: variantProp,
    badgeContent: badgeContentProp
  });
  const invisible = invisibleFromHook || badgeContent == null && variantProp !== "dot";
  const {
    color = colorProp,
    overlap = overlapProp,
    anchorOrigin = anchorOriginProp,
    variant = variantProp
  } = invisible ? prevProps : props;
  const displayValue = variant !== "dot" ? displayValueFromHook : void 0;
  const ownerState = _extends({}, props, {
    badgeContent,
    invisible,
    max,
    displayValue,
    showZero,
    anchorOrigin,
    color,
    overlap,
    variant
  });
  const classes = useUtilityClasses(ownerState);
  const RootSlot = (_ref = (_slots$root = slots == null ? void 0 : slots.root) != null ? _slots$root : components.Root) != null ? _ref : BadgeRoot;
  const BadgeSlot = (_ref2 = (_slots$badge = slots == null ? void 0 : slots.badge) != null ? _slots$badge : components.Badge) != null ? _ref2 : BadgeBadge;
  const rootSlotProps = (_slotProps$root = slotProps == null ? void 0 : slotProps.root) != null ? _slotProps$root : componentsProps.root;
  const badgeSlotProps = (_slotProps$badge = slotProps == null ? void 0 : slotProps.badge) != null ? _slotProps$badge : componentsProps.badge;
  const rootProps = useSlotProps({
    elementType: RootSlot,
    externalSlotProps: rootSlotProps,
    externalForwardedProps: other,
    additionalProps: {
      ref,
      as: component
    },
    ownerState,
    className: clsx(rootSlotProps == null ? void 0 : rootSlotProps.className, classes.root, className)
  });
  const badgeProps = useSlotProps({
    elementType: BadgeSlot,
    externalSlotProps: badgeSlotProps,
    ownerState,
    className: clsx(classes.badge, badgeSlotProps == null ? void 0 : badgeSlotProps.className)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RootSlot, _extends({}, rootProps, {
    children: [children, /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeSlot, _extends({}, badgeProps, {
      children: displayValue
    }))]
  }));
});
const Badge$1 = Badge;
function TextFieldLazy({
  value: valueProp,
  onChange,
  ...props
}) {
  const [value, setValue] = reactExports.useState(valueProp);
  reactExports.useEffect(() => {
    setValue(valueProp);
  }, [valueProp]);
  const saveValue = () => onChange(value);
  return /* @__PURE__ */ jsx(
    TextField,
    {
      value,
      onChange: (e) => setValue(e.target.value),
      onBlur: saveValue,
      onKeyDown: (e) => e.key === "Enter" && !props.multiline && saveValue(),
      ...props
    }
  );
}
function useBuild(buildId) {
  const database = useDatabase();
  return useDataManagerBase(database.builds, buildId);
}
function useBuildTc(buildTcId) {
  const database = useDatabase();
  return useDataManagerBase(database.buildTcs, buildTcId);
}
const TravelerM$1 = "" + new URL("splash_aether-DJzOYokv.png", import.meta.url).href;
const Albedo$1 = "" + new URL("splash_albedo-C2ClDHXJ.png", import.meta.url).href;
const Alhaitham$1 = "" + new URL("splash_alhaitham-CA0sQI8X.png", import.meta.url).href;
const Amber$1 = "" + new URL("splash_amber-CMXdnMxx.png", import.meta.url).href;
const Arlecchino$1 = "" + new URL("splash_arlecchino-De11NpLa.png", import.meta.url).href;
const KamisatoAyaka$1 = "" + new URL("splash_ayaka-DPmpFfjD.png", import.meta.url).href;
const KamisatoAyato$1 = "" + new URL("splash_ayato-VOwChnnn.png", import.meta.url).href;
const Baizhu$1 = "" + new URL("splash_baizhu-DuNRm3Wc.png", import.meta.url).href;
const Barbara$1 = "" + new URL("splash_barbara-CnuuBtjx.png", import.meta.url).href;
const Beidou$1 = "" + new URL("splash_beidou-DAcc5DQf.png", import.meta.url).href;
const Bennett$1 = "" + new URL("splash_bennett-BiKbQNXU.png", import.meta.url).href;
const Candace$1 = "" + new URL("splash_candace-z-8Vs9vX.png", import.meta.url).href;
const Charlotte$1 = "" + new URL("splash_charlotte-CqI4iexi.png", import.meta.url).href;
const Chevreuse$1 = "" + new URL("splash_chevreuse-CCu9ByG0.png", import.meta.url).href;
const Chiori$1 = "" + new URL("splash_chiori-Dsv0eX76.png", import.meta.url).href;
const Chongyun$1 = "" + new URL("splash_chongyun-DuFe7QpO.png", import.meta.url).href;
const Collei$1 = "" + new URL("splash_collei-XCQMnPIQ.png", import.meta.url).href;
const Cyno$1 = "" + new URL("splash_cyno-UUip-7qe.png", import.meta.url).href;
const Dehya$1 = "" + new URL("splash_dehya-BNbalvXi.png", import.meta.url).href;
const Diluc$1 = "" + new URL("splash_diluc-B9yBooi8.png", import.meta.url).href;
const Diona$1 = "" + new URL("splash_diona-BekVqAtV.png", import.meta.url).href;
const Dori$1 = "" + new URL("splash_dori-ETbroQpt.png", import.meta.url).href;
const Eula$1 = "" + new URL("splash_eula-CWM0oOOm.png", import.meta.url).href;
const Faruzan$1 = "" + new URL("splash_faruzan-CuLPOgXv.png", import.meta.url).href;
const Fischl$1 = "" + new URL("splash_fischl-eNS_Q4Yq.png", import.meta.url).href;
const Freminet$1 = "" + new URL("splash_freminet-BK116q87.png", import.meta.url).href;
const Furina$1 = "" + new URL("splash_furina-Dl2Olj6j.png", import.meta.url).href;
const Gaming$1 = "" + new URL("splash_gaming-7Y_g9EKP.png", import.meta.url).href;
const Ganyu$1 = "" + new URL("splash_ganyu-51SeDPVZ.png", import.meta.url).href;
const Gorou$1 = "" + new URL("splash_gorou-BTgwjfbi.png", import.meta.url).href;
const ShikanoinHeizou$1 = "" + new URL("splash_heizou-B1OGXzm5.png", import.meta.url).href;
const HuTao$1 = "" + new URL("splash_hutao-BnM6ApUB.png", import.meta.url).href;
const AratakiItto$1 = "" + new URL("splash_itto-CAbBR0Zp.png", import.meta.url).href;
const Jean$1 = "" + new URL("splash_jean-Bi78jjdb.png", import.meta.url).href;
const Kaeya$1 = "" + new URL("splash_kaeya-CqZUM0lq.png", import.meta.url).href;
const Kaveh$1 = "" + new URL("splash_kaveh-Cnxi7r3d.png", import.meta.url).href;
const KaedeharaKazuha$1 = "" + new URL("splash_kazuha-CriY046g.png", import.meta.url).href;
const Keqing$1 = "" + new URL("splash_keqing-BbKPZ-gj.png", import.meta.url).href;
const Kirara$1 = "" + new URL("splash_kirara-DRMRckJo.png", import.meta.url).href;
const Klee$1 = "" + new URL("splash_klee-Bepwm4Dw.png", import.meta.url).href;
const SangonomiyaKokomi$1 = "" + new URL("splash_kokomi-TPOxgeDQ.png", import.meta.url).href;
const KukiShinobu$1 = "" + new URL("splash_kuki-Cqu89_Z8.png", import.meta.url).href;
const Layla$1 = "" + new URL("splash_layla-D2kdEiP4.png", import.meta.url).href;
const Lisa$1 = "" + new URL("splash_lisa-CWtsUH6n.png", import.meta.url).href;
const TravelerF$1 = "" + new URL("splash_lumine-DjfSEbJZ.png", import.meta.url).href;
const Lynette$1 = "" + new URL("splash_lynette-jKA0GiXg.png", import.meta.url).href;
const Lyney$1 = "" + new URL("splash_lyney-YDlwT6uD.png", import.meta.url).href;
const Mika$1 = "" + new URL("splash_mika-Bkkw9tBR.png", import.meta.url).href;
const Mona$1 = "" + new URL("splash_mona-bkAi0VbK.png", import.meta.url).href;
const Nahida$1 = "" + new URL("splash_nahida-DRhmP5Jb.png", import.meta.url).href;
const Navia$1 = "" + new URL("splash_navia-BUTPUKtD.png", import.meta.url).href;
const Neuvillette$1 = "" + new URL("splash_neuvillette-C4ZbVr1r.png", import.meta.url).href;
const Nilou$1 = "" + new URL("splash_nilou-Dx2CHYCE.png", import.meta.url).href;
const Ningguang$1 = "" + new URL("splash_ningguang-g7VYSynG.png", import.meta.url).href;
const Noelle$1 = "" + new URL("splash_noelle-D_7jmXS3.png", import.meta.url).href;
const Qiqi$1 = "" + new URL("splash_qiqi-BwAm_6rv.png", import.meta.url).href;
const RaidenShogun$1 = "" + new URL("splash_raiden-3An7aYEy.png", import.meta.url).href;
const Razor$1 = "" + new URL("splash_razor-CixKqXhp.png", import.meta.url).href;
const Rosaria$1 = "" + new URL("splash_rosaria-DjlUDP6W.png", import.meta.url).href;
const KujouSara$1 = "" + new URL("splash_sara-BXwH30mO.png", import.meta.url).href;
const Sayu$1 = "" + new URL("splash_sayu-Bc78JOFk.png", import.meta.url).href;
const Shenhe$1 = "" + new URL("splash_shenhe-GbmFj4LB.png", import.meta.url).href;
const Sucrose$1 = "" + new URL("splash_sucrose-DbpONZgF.png", import.meta.url).href;
const Tartaglia$1 = "" + new URL("splash_tartaglia-_CDK8h1z.png", import.meta.url).href;
const Thoma$1 = "" + new URL("splash_thoma-Csq2lH6Z.png", import.meta.url).href;
const Tighnari$1 = "" + new URL("splash_tighnari-Cxm5cuAN.png", import.meta.url).href;
const Venti$1 = "" + new URL("splash_venti-DZqaHXqJ.png", import.meta.url).href;
const Wanderer$1 = "" + new URL("splash_wanderer-Cgi8ZpvN.png", import.meta.url).href;
const Wriothesley$1 = "" + new URL("splash_wriothesley-unwiYGBl.png", import.meta.url).href;
const Xiangling$1 = "" + new URL("splash_xiangling-CjsfO110.png", import.meta.url).href;
const Xianyun$1 = "" + new URL("splash_xianyun-8Bq2tWSB.png", import.meta.url).href;
const Xiao$1 = "" + new URL("splash_xiao-D0mJbo-D.png", import.meta.url).href;
const Xingqiu$1 = "" + new URL("splash_xingqiu-8_rk5zS1.png", import.meta.url).href;
const Xinyan$1 = "" + new URL("splash_xinyan-npt0jwGK.png", import.meta.url).href;
const YaeMiko$1 = "" + new URL("splash_yae-c4CxAWZx.png", import.meta.url).href;
const Yanfei$1 = "" + new URL("splash_yanfei-DFGvA19Z.png", import.meta.url).href;
const Yaoyao$1 = "" + new URL("splash_yaoyao-BIHk1AkM.png", import.meta.url).href;
const Yelan$1 = "" + new URL("splash_yelan-DXvYWOYE.png", import.meta.url).href;
const Yoimiya$1 = "" + new URL("splash_yoimiya-BwV7hPT-.png", import.meta.url).href;
const YunJin$1 = "" + new URL("splash_yunjin-CogctS_D.png", import.meta.url).href;
const Zhongli$1 = "" + new URL("splash_zhongli-CAGDgoHb.png", import.meta.url).href;
const charCards$1 = {
  Albedo: Albedo$1,
  Alhaitham: Alhaitham$1,
  Amber: Amber$1,
  AratakiItto: AratakiItto$1,
  Arlecchino: Arlecchino$1,
  Baizhu: Baizhu$1,
  Barbara: Barbara$1,
  Beidou: Beidou$1,
  Bennett: Bennett$1,
  Candace: Candace$1,
  Charlotte: Charlotte$1,
  Chevreuse: Chevreuse$1,
  Chiori: Chiori$1,
  Chongyun: Chongyun$1,
  Collei: Collei$1,
  Cyno: Cyno$1,
  Dehya: Dehya$1,
  Diluc: Diluc$1,
  Diona: Diona$1,
  Dori: Dori$1,
  Eula: Eula$1,
  Faruzan: Faruzan$1,
  Fischl: Fischl$1,
  Freminet: Freminet$1,
  Furina: Furina$1,
  Gaming: Gaming$1,
  Ganyu: Ganyu$1,
  Gorou: Gorou$1,
  HuTao: HuTao$1,
  Jean: Jean$1,
  KaedeharaKazuha: KaedeharaKazuha$1,
  Kaeya: Kaeya$1,
  KamisatoAyaka: KamisatoAyaka$1,
  KamisatoAyato: KamisatoAyato$1,
  Kaveh: Kaveh$1,
  Keqing: Keqing$1,
  Kirara: Kirara$1,
  Klee: Klee$1,
  KujouSara: KujouSara$1,
  KukiShinobu: KukiShinobu$1,
  Layla: Layla$1,
  Lisa: Lisa$1,
  Lynette: Lynette$1,
  Lyney: Lyney$1,
  Mika: Mika$1,
  Mona: Mona$1,
  Nahida: Nahida$1,
  Navia: Navia$1,
  Neuvillette: Neuvillette$1,
  Nilou: Nilou$1,
  Ningguang: Ningguang$1,
  Noelle: Noelle$1,
  Qiqi: Qiqi$1,
  RaidenShogun: RaidenShogun$1,
  Razor: Razor$1,
  Rosaria: Rosaria$1,
  SangonomiyaKokomi: SangonomiyaKokomi$1,
  Sayu: Sayu$1,
  Shenhe: Shenhe$1,
  ShikanoinHeizou: ShikanoinHeizou$1,
  Sucrose: Sucrose$1,
  Tartaglia: Tartaglia$1,
  Thoma: Thoma$1,
  Tighnari: Tighnari$1,
  TravelerF: TravelerF$1,
  TravelerM: TravelerM$1,
  Venti: Venti$1,
  Wanderer: Wanderer$1,
  Wriothesley: Wriothesley$1,
  Xiangling: Xiangling$1,
  Xianyun: Xianyun$1,
  Xiao: Xiao$1,
  Xingqiu: Xingqiu$1,
  Xinyan: Xinyan$1,
  YaeMiko: YaeMiko$1,
  Yanfei: Yanfei$1,
  Yaoyao: Yaoyao$1,
  Yelan: Yelan$1,
  Yoimiya: Yoimiya$1,
  YunJin: YunJin$1,
  Zhongli: Zhongli$1
};
function splash(charKey, gender) {
  return charCards$1[charKeyToLocGenderedCharKey(charKey, gender)];
}
const Albedo = "" + new URL("Character_Albedo_Card-BpLo-Cd6.png", import.meta.url).href;
const Alhaitham = "" + new URL("Character_Alhaitham_Card-B3qI6uNs.jpg", import.meta.url).href;
const Aloy = "" + new URL("Character_Aloy_Card-BGLKJQPn.png", import.meta.url).href;
const Amber = "" + new URL("Character_Amber_Card-D7m_gRNd.jpg", import.meta.url).href;
const AratakiItto = "" + new URL("Character_Arataki_Itto_Card-wnLcJYYl.jpg", import.meta.url).href;
const Arlecchino = "" + new URL("Character_Arlecchino_Card-WX11Bm1z.jpg", import.meta.url).href;
const Baizhu = "" + new URL("Character_Baizhu_Card-u_-blciS.jpg", import.meta.url).href;
const Barbara = "" + new URL("Character_Barbara_Card-DtsJmWjO.jpg", import.meta.url).href;
const Beidou = "" + new URL("Character_Beidou_Card-BFobTRzj.jpg", import.meta.url).href;
const Bennett = "" + new URL("Character_Bennett_Card-HueXUQqB.jpg", import.meta.url).href;
const Candace = "" + new URL("Character_Candace_Card-BjYHYytN.jpg", import.meta.url).href;
const Charlotte = "" + new URL("Character_Charlotte_Card-B9Vnf_zR.jpg", import.meta.url).href;
const Chevreuse = "" + new URL("Character_Chevreuse_Card-Dlu7AwtZ.jpg", import.meta.url).href;
const Chiori = "" + new URL("Character_Chiori_Card-CIJlkKZh.jpg", import.meta.url).href;
const Chongyun = "" + new URL("Character_Chongyun_Card-LjhtWmnO.jpg", import.meta.url).href;
const Clorinde = "" + new URL("Character_Clorinde_Card-BOO0JOMp.jpg", import.meta.url).href;
const Collei = "" + new URL("Character_Collei_Card-BfO5oi4z.jpg", import.meta.url).href;
const Cyno = "" + new URL("Character_Cyno_Card-DokRZ4GX.jpg", import.meta.url).href;
const Dehya = "" + new URL("Character_Dehya_Card-DD2-q8Se.jpg", import.meta.url).href;
const Diluc = "" + new URL("Character_Diluc_Card-C6DUtV6e.jpg", import.meta.url).href;
const Diona = "" + new URL("Character_Diona_Card-LQlv9j_e.png", import.meta.url).href;
const Dori = "" + new URL("Character_Dori_Card-ECypwj3a.jpg", import.meta.url).href;
const Eula = "" + new URL("Character_Eula_Card-ByDQZguw.png", import.meta.url).href;
const Faruzan = "" + new URL("Character_Faruzan_Card-CviBKLcR.jpg", import.meta.url).href;
const Fischl = "" + new URL("Character_Fischl_Card-BfWz6Y9V.jpg", import.meta.url).href;
const Freminet = "" + new URL("Character_Freminet_Card-BM4IZ5OQ.jpg", import.meta.url).href;
const Furina = "" + new URL("Character_Furina_Card-D5fr82oX.jpg", import.meta.url).href;
const Gaming = "" + new URL("Character_Gaming_Card-BzpVaYig.jpg", import.meta.url).href;
const Ganyu = "" + new URL("Character_Ganyu_Card-B8qDR0po.png", import.meta.url).href;
const Gorou = "" + new URL("Character_Gorou_Card-CyDpw4ZN.png", import.meta.url).href;
const HuTao = "" + new URL("Character_Hu_Tao_Card-Deie4ty4.png", import.meta.url).href;
const Jean = "" + new URL("Character_Jean_Card-Bwo9uFav.jpg", import.meta.url).href;
const Kaeya = "" + new URL("Character_Kaeya_Card-DbOA5Qtf.jpg", import.meta.url).href;
const KamisatoAyaka = "" + new URL("Character_Kamisato_Ayaka_Card-96pmp9TA.png", import.meta.url).href;
const KamisatoAyato = "" + new URL("Character_Kamisato_Ayato_Card-R5TOBR-F.png", import.meta.url).href;
const Kaveh = "" + new URL("Character_Kaveh_Card-Ctz--hrg.jpg", import.meta.url).href;
const KaedeharaKazuha = "" + new URL("Character_Kazuha_Card-DGwQBbCF.png", import.meta.url).href;
const Keqing = "" + new URL("Character_Keqing_Card-DHVuslyM.jpg", import.meta.url).href;
const Kirara = "" + new URL("Character_Kirara_Card-rxmuQyvl.jpg", import.meta.url).href;
const Klee = "" + new URL("Character_Klee_Card-BQUx3KBz.jpg", import.meta.url).href;
const KujouSara = "" + new URL("Character_Kujou_Sara_Card-D4WuEcwQ.jpg", import.meta.url).href;
const KukiShinobu = "" + new URL("Character_Kuki_Shinobu_Card-C_2gpsSN.jpg", import.meta.url).href;
const Layla = "" + new URL("Character_Layla_Card-DI8fh3jW.jpeg", import.meta.url).href;
const Lisa = "" + new URL("Character_Lisa_Card-DjSa66-9.jpg", import.meta.url).href;
const Lynette = "" + new URL("Character_Lynette_Card-BB20aO3o.jpg", import.meta.url).href;
const Lyney = "" + new URL("Character_Lyney_Card-BHNEXZm0.jpg", import.meta.url).href;
const Mika = "" + new URL("Character_Mika_Card-D0Wakkqp.jpg", import.meta.url).href;
const Mona = "" + new URL("Character_Mona_Card-CvlMUYK_.jpg", import.meta.url).href;
const Nahida = "" + new URL("Character_Nahida_Card-D6s1_qrb.jpeg", import.meta.url).href;
const Navia = "" + new URL("Character_Navia_Card-DOJWwJM3.jpg", import.meta.url).href;
const Neuvillette = "" + new URL("Character_Neuvillette_Card-0KoykWPP.jpg", import.meta.url).href;
const Nilou = "" + new URL("Character_Nilou_Card-DqnQ-dSs.jpg", import.meta.url).href;
const Ningguang = "" + new URL("Character_Ningguang_Card-tAkw2zDe.jpg", import.meta.url).href;
const Noelle = "" + new URL("Character_Noelle_Card-DWubGuU2.jpg", import.meta.url).href;
const Qiqi = "" + new URL("Character_Qiqi_Card-BGeVsL5w.jpg", import.meta.url).href;
const RaidenShogun = "" + new URL("Character_Raiden_Shogun_Card-vq7qd8KO.png", import.meta.url).href;
const Razor = "" + new URL("Character_Razor_Card-CiLHXjyO.jpg", import.meta.url).href;
const Rosaria = "" + new URL("Character_Rosaria_Card-C18GJZev.png", import.meta.url).href;
const SangonomiyaKokomi = "" + new URL("Character_Sangonomiya_Kokomi_Card-VzbVrd2G.jpg", import.meta.url).href;
const Sayu = "" + new URL("Character_Sayu_Card-CI2YcBLI.png", import.meta.url).href;
const Sethos = "" + new URL("Character_Sethos_Card-4jl_270k.jpg", import.meta.url).href;
const Shenhe = "" + new URL("Character_Shenhe_Card-CfyNiGEm.jpg", import.meta.url).href;
const ShikanoinHeizou = "" + new URL("Character_Shikanoin_Heizou_Card-fbmiEsdP.png", import.meta.url).href;
const Sigewinne = "" + new URL("Character_Sigewinne_Card-qpI--enz.jpg", import.meta.url).href;
const Somnia = "" + new URL("Character_Somnia_Card-BAHIWQnu.png", import.meta.url).href;
const Sucrose = "" + new URL("Character_Sucrose_Card-gESU62rQ.jpg", import.meta.url).href;
const Tartaglia = "" + new URL("Character_Tartaglia_Card-BeeFQ-7e.png", import.meta.url).href;
const Thoma = "" + new URL("Character_Thoma_Card-D-qXE_tt.jpg", import.meta.url).href;
const Tighnari = "" + new URL("Character_Tighnari_Card-tDB04_hy.jpg", import.meta.url).href;
const Venti = "" + new URL("Character_Venti_Card-Bcd9uIho.jpg", import.meta.url).href;
const Wanderer = "" + new URL("Character_Wanderer_Card-Bl4jK4PI.jpg", import.meta.url).href;
const Wriothesley = "" + new URL("Character_Wriothesley_Card-DLF_wdog.jpg", import.meta.url).href;
const Xiangling = "" + new URL("Character_Xiangling_Card-Bi4nVpm4.jpg", import.meta.url).href;
const Xianyun = "" + new URL("Character_Xianyun_Card-B6H-tPs7.jpg", import.meta.url).href;
const Xiao = "" + new URL("Character_Xiao_Card-Il1hbs9F.jpg", import.meta.url).href;
const Xingqiu = "" + new URL("Character_Xingqiu_Card-yjOWNKdH.jpg", import.meta.url).href;
const Xinyan = "" + new URL("Character_Xinyan_Card-Cgqoz1e8.jpg", import.meta.url).href;
const YaeMiko = "" + new URL("Character_Yae_Miko_Card-DO8V8vWJ.png", import.meta.url).href;
const Yanfei = "" + new URL("Character_Yanfei_Card-BvaqEZTG.png", import.meta.url).href;
const Yaoyao = "" + new URL("Character_Yaoyao_Card-IWfs5nZN.jpg", import.meta.url).href;
const Yelan = "" + new URL("Character_Yelan_Card-BiLckvYV.jpg", import.meta.url).href;
const Yoimiya = "" + new URL("Character_Yoimiya_Card-DaaZv-Y3.png", import.meta.url).href;
const YunJin = "" + new URL("Character_Yun_Jin_Card-Cy-dHGe_.jpg", import.meta.url).href;
const Zhongli = "" + new URL("Character_Zhongli_Card-BJ13Ueck.png", import.meta.url).href;
const TravelerF = "" + new URL("Traveler_Female_Card-CpZU2Ke9.jpg", import.meta.url).href;
const TravelerM = "" + new URL("Traveler_Male_Card-DExj1wni.jpg", import.meta.url).href;
const charCards = {
  Albedo,
  Alhaitham,
  Aloy,
  Amber,
  AratakiItto,
  Arlecchino,
  Baizhu,
  Barbara,
  Beidou,
  Bennett,
  Candace,
  Charlotte,
  Chevreuse,
  Chiori,
  Chongyun,
  Clorinde,
  Collei,
  Cyno,
  Dehya,
  Diluc,
  Diona,
  Dori,
  Eula,
  Faruzan,
  Fischl,
  Freminet,
  Furina,
  Gaming,
  Ganyu,
  Gorou,
  HuTao,
  Jean,
  KaedeharaKazuha,
  Kaeya,
  KamisatoAyaka,
  KamisatoAyato,
  Kaveh,
  Keqing,
  Kirara,
  Klee,
  KujouSara,
  KukiShinobu,
  Layla,
  Lisa,
  Lyney,
  Lynette,
  Mika,
  Mona,
  Nahida,
  Navia,
  Neuvillette,
  Nilou,
  Ningguang,
  Noelle,
  Qiqi,
  RaidenShogun,
  Razor,
  Rosaria,
  SangonomiyaKokomi,
  Sayu,
  Sethos,
  Shenhe,
  ShikanoinHeizou,
  Sigewinne,
  Somnia,
  Sucrose,
  Tartaglia,
  Thoma,
  Tighnari,
  TravelerF,
  TravelerM,
  Venti,
  Wanderer,
  Wriothesley,
  Xiangling,
  Xianyun,
  Xiao,
  Xingqiu,
  Xinyan,
  YaeMiko,
  Yanfei,
  Yaoyao,
  Yelan,
  Yoimiya,
  YunJin,
  Zhongli
};
function charCard(charKey, gender) {
  switch (charKey) {
    case "TravelerAnemo":
    case "TravelerDendro":
    case "TravelerElectro":
    case "TravelerGeo":
    case "TravelerHydro":
      return charCards[`Traveler${gender}`];
    default:
      return charCards[charKey];
  }
}
function CharacterCompactTalent() {
  const {
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  const { gender } = useDBMeta();
  const characterSheet = getCharSheet(characterKey, gender);
  const { data } = reactExports.useContext(DataContext);
  const tlvl = {
    auto: data.get(uiInput.total.auto).value,
    skill: data.get(uiInput.total.skill).value,
    burst: data.get(uiInput.total.burst).value
  };
  const tBoost = {
    auto: data.get(uiInput.total.autoBoost).value,
    skill: data.get(uiInput.total.skillBoost).value,
    burst: data.get(uiInput.total.burstBoost).value
  };
  return /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Grid, { container: true, spacing: 1, children: ["auto", "skill", "burst"].map((tKey) => {
    var _a;
    const badgeContent = tlvl[tKey].toString();
    return /* @__PURE__ */ jsx(Grid, { item: true, xs: 4, children: /* @__PURE__ */ jsx(
      Badge$1,
      {
        badgeContent,
        color: tBoost[tKey] ? "info" : "secondary",
        overlap: "circular",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        },
        sx: {
          width: "100%",
          height: "100%",
          "& > .MuiBadge-badge": {
            fontSize: "1em",
            padding: badgeContent.length > 1 ? ".25em" : ".25em .4em",
            borderRadius: ".5em",
            lineHeight: 1,
            height: "1.25em",
            right: "25%"
          }
        },
        children: /* @__PURE__ */ jsx(
          Box,
          {
            component: NextImage ? NextImage : "img",
            src: (_a = characterSheet.getTalentOfKey(tKey)) == null ? void 0 : _a.img,
            width: "100%",
            height: "auto"
          }
        )
      }
    ) }, tKey);
  }) }) });
}
function CharacterCompactConstSelector({
  setConstellation,
  warning = false
}) {
  const {
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  const { data } = reactExports.useContext(DataContext);
  const constellation = data.get(uiInput.constellation).value;
  const { gender } = useDBMeta();
  const characterSheet = getCharSheet(characterKey, gender);
  return /* @__PURE__ */ jsx(Grid, { container: true, spacing: 1, children: range(1, 6).map((i) => {
    var _a;
    return /* @__PURE__ */ jsx(Grid, { item: true, xs: 4, children: /* @__PURE__ */ jsx(
      CardActionArea,
      {
        onClick: () => setConstellation(i === constellation ? i - 1 : i),
        style: {
          border: `1px solid ${warning ? yellow$1[200] : grey[200]}`,
          borderRadius: "4px",
          overflow: "hidden"
        },
        children: /* @__PURE__ */ jsx(
          Box,
          {
            component: NextImage ? NextImage : "img",
            src: (_a = characterSheet.getTalentOfKey(
              `constellation${i}`
            )) == null ? void 0 : _a.img,
            sx: {
              ...constellation >= i ? {} : { filter: "brightness(50%)" }
            },
            width: "100%",
            height: "auto"
          }
        )
      }
    ) }, i);
  }) });
}
function CharacterCoverArea() {
  const { silly } = reactExports.useContext(SillyContext);
  const {
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  const { gender } = useDBMeta();
  const { data } = reactExports.useContext(DataContext);
  const level = data.get(uiInput.lvl).value;
  const ascension = data.get(uiInput.asc).value;
  const sillySplash = splash(characterKey, gender);
  const card = charCard(characterKey, gender);
  return silly && sillySplash ? /* @__PURE__ */ jsx(SillyCoverArea, { src: sillySplash, level, ascension }) : /* @__PURE__ */ jsx(CoverArea, { src: card, level, ascension });
}
function SillyCoverArea({ src, level, ascension }) {
  const {
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  return /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", position: "relative" }, children: [
    /* @__PURE__ */ jsx(
      Box,
      {
        src,
        component: NextImage ? NextImage : "img",
        width: "100%",
        height: "auto"
      }
    ),
    /* @__PURE__ */ jsxs(Box, { sx: { width: "100%", height: "100%" }, children: [
      /* @__PURE__ */ jsx(
        Box,
        {
          sx: {
            opacity: 0.85,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            px: 1
          },
          children: /* @__PURE__ */ jsx(CharChip, {})
        }
      ),
      /* @__PURE__ */ jsx(
        Typography,
        {
          variant: "h6",
          sx: {
            width: "100%",
            opacity: 0.75,
            textAlign: "center"
          },
          children: /* @__PURE__ */ jsx(StarsDisplay, { stars: getCharStat(characterKey).rarity, colored: true })
        }
      ),
      /* @__PURE__ */ jsx(FavoriteButton, {}),
      /* @__PURE__ */ jsx(LevelBadge, { level, ascension })
    ] })
  ] });
}
function CoverArea({ src, level, ascension }) {
  const {
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  return /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", position: "relative" }, children: [
    /* @__PURE__ */ jsxs(Box, { sx: { position: "absolute", width: "100%", height: "100%" }, children: [
      /* @__PURE__ */ jsx(
        Typography,
        {
          variant: "h6",
          sx: {
            position: "absolute",
            width: "100%",
            left: "50%",
            bottom: 0,
            transform: "translate(-50%, -50%)",
            opacity: 0.75,
            textAlign: "center"
          },
          children: /* @__PURE__ */ jsx(StarsDisplay, { stars: getCharStat(characterKey).rarity, colored: true })
        }
      ),
      /* @__PURE__ */ jsx(
        Box,
        {
          sx: {
            position: "absolute",
            left: "50%",
            bottom: "7%",
            transform: "translate(-50%, -50%)",
            opacity: 0.85,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            px: 1
          },
          children: /* @__PURE__ */ jsx(CharChip, {})
        }
      ),
      /* @__PURE__ */ jsx(FavoriteButton, {}),
      /* @__PURE__ */ jsx(LevelBadge, { level, ascension })
    ] }),
    /* @__PURE__ */ jsx(
      Box,
      {
        src,
        component: NextImage ? NextImage : "img",
        width: "100%",
        height: "auto"
      }
    )
  ] });
}
function CharChip() {
  const {
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  const { gender } = useDBMeta();
  const charEle = getCharEle(characterKey);
  const weaponType = getCharStat(characterKey).weaponType;
  return /* @__PURE__ */ jsx(
    Chip,
    {
      color: charEle,
      sx: { height: "auto" },
      label: /* @__PURE__ */ jsxs(
        Typography,
        {
          variant: "h6",
          sx: { display: "flex", gap: 1, alignItems: "center" },
          children: [
            /* @__PURE__ */ jsx(ElementIcon, { ele: charEle }),
            /* @__PURE__ */ jsx(Box, { sx: { whiteSpace: "normal", textAlign: "center" }, children: /* @__PURE__ */ jsx(CharacterName, { characterKey, gender }) }),
            /* @__PURE__ */ jsx(ImgIcon, { src: imgAssets.weaponTypes[weaponType] })
          ]
        }
      )
    }
  );
}
function LevelBadge({
  level,
  ascension
}) {
  return /* @__PURE__ */ jsx(
    Typography,
    {
      sx: { p: 1, position: "absolute", right: 0, top: 0, opacity: 0.8 },
      children: /* @__PURE__ */ jsx(SqBadge, { children: getLevelString(level, ascension) })
    }
  );
}
function FavoriteButton() {
  const {
    character: { key: characterKey }
  } = reactExports.useContext(CharacterContext);
  const database = useDatabase();
  const { favorite } = useCharMeta(characterKey);
  return /* @__PURE__ */ jsx(Box, { sx: { position: "absolute", left: 0, top: 0 }, children: /* @__PURE__ */ jsx(
    IconButton,
    {
      sx: { p: 1 },
      color: "error",
      onClick: () => database.charMeta.set(characterKey, { favorite: !favorite }),
      children: favorite ? /* @__PURE__ */ jsx(default_1$4, {}) : /* @__PURE__ */ jsx(default_1$5, {})
    }
  ) });
}
var SwapHoriz = {};
var _interopRequireDefault$3 = interopRequireDefaultExports;
Object.defineProperty(SwapHoriz, "__esModule", {
  value: true
});
var default_1$3 = SwapHoriz.default = void 0;
var _createSvgIcon$3 = _interopRequireDefault$3(requireCreateSvgIcon());
var _jsxRuntime$3 = jsxRuntimeExports;
var _default$3 = (0, _createSvgIcon$3.default)(/* @__PURE__ */ (0, _jsxRuntime$3.jsx)("path", {
  d: "M6.99 11 3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"
}), "SwapHoriz");
default_1$3 = SwapHoriz.default = _default$3;
var RemoveCircle = {};
var _interopRequireDefault$2 = interopRequireDefaultExports;
Object.defineProperty(RemoveCircle, "__esModule", {
  value: true
});
var default_1$2 = RemoveCircle.default = void 0;
var _createSvgIcon$2 = _interopRequireDefault$2(requireCreateSvgIcon());
var _jsxRuntime$2 = jsxRuntimeExports;
var _default$2 = (0, _createSvgIcon$2.default)(/* @__PURE__ */ (0, _jsxRuntime$2.jsx)("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"
}), "RemoveCircle");
default_1$2 = RemoveCircle.default = _default$2;
var ContentCopy = {};
var _interopRequireDefault$1 = interopRequireDefaultExports;
Object.defineProperty(ContentCopy, "__esModule", {
  value: true
});
var default_1$1 = ContentCopy.default = void 0;
var _createSvgIcon$1 = _interopRequireDefault$1(requireCreateSvgIcon());
var _jsxRuntime$1 = jsxRuntimeExports;
var _default$1 = (0, _createSvgIcon$1.default)(/* @__PURE__ */ (0, _jsxRuntime$1.jsx)("path", {
  d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
}), "ContentCopy");
default_1$1 = ContentCopy.default = _default$1;
var Science = {};
var _interopRequireDefault = interopRequireDefaultExports;
Object.defineProperty(Science, "__esModule", {
  value: true
});
var default_1 = Science.default = void 0;
var _createSvgIcon = _interopRequireDefault(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
var _default = (0, _createSvgIcon.default)(/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M19.8 18.4 14 10.67V6.5l1.35-1.69c.26-.33.03-.81-.39-.81H9.04c-.42 0-.65.48-.39.81L10 6.5v4.17L4.2 18.4c-.49.66-.02 1.6.8 1.6h14c.82 0 1.29-.94.8-1.6z"
}), "Science");
default_1 = Science.default = _default;
function BuildCard({
  name,
  description,
  active = false,
  onActive,
  children,
  onEdit,
  onCopyToTc,
  onDupe,
  onEquip,
  onRemove,
  hideFooter = false
}) {
  const clickableAreaContent = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      CardHeader,
      {
        title: name,
        action: description && /* @__PURE__ */ jsx(Tooltip, { title: /* @__PURE__ */ jsx(Typography, { children: description }), children: /* @__PURE__ */ jsx(default_1$9, {}) })
      }
    ),
    /* @__PURE__ */ jsx(CardContent, { sx: { pt: 0, pb: 1 }, children })
  ] });
  return /* @__PURE__ */ jsxs(
    CardThemed,
    {
      bgt: "light",
      sx: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: active ? "0px 0px 0px 2px green inset" : void 0
      },
      children: [
        onActive ? /* @__PURE__ */ jsx(CardActionArea, { onClick: onActive, children: clickableAreaContent }) : clickableAreaContent,
        !hideFooter && /* @__PURE__ */ jsxs(
          CardActions,
          {
            sx: {
              display: "flex",
              justifyContent: "space-around",
              marginTop: "auto"
            },
            children: [
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  title: /* @__PURE__ */ jsx(Typography, { children: "Edit Build Settings" }),
                  placement: "top",
                  arrow: true,
                  children: /* @__PURE__ */ jsx(
                    IconButton,
                    {
                      color: "info",
                      size: "small",
                      onClick: onEdit,
                      disabled: !onEdit,
                      children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(default_1$6, {}) })
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  title: /* @__PURE__ */ jsx(Typography, { children: "Copy to TC Builds" }),
                  placement: "top",
                  arrow: true,
                  children: /* @__PURE__ */ jsx(
                    IconButton,
                    {
                      color: "info",
                      size: "small",
                      onClick: onCopyToTc,
                      disabled: !onCopyToTc,
                      children: /* @__PURE__ */ jsx(default_1, {})
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  title: /* @__PURE__ */ jsx(Typography, { children: "Duplicate Build" }),
                  placement: "top",
                  arrow: true,
                  children: /* @__PURE__ */ jsx(
                    IconButton,
                    {
                      color: "info",
                      size: "small",
                      onClick: onDupe,
                      disabled: !onDupe,
                      children: /* @__PURE__ */ jsx(default_1$1, {})
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  title: /* @__PURE__ */ jsx(Typography, { children: "Equip Build" }),
                  placement: "top",
                  arrow: true,
                  children: /* @__PURE__ */ jsx(
                    IconButton,
                    {
                      color: "info",
                      size: "small",
                      onClick: onEquip,
                      disabled: !onEquip,
                      children: /* @__PURE__ */ jsx(default_1$7, {})
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  title: /* @__PURE__ */ jsx(Typography, { children: "Delete Build" }),
                  placement: "top",
                  arrow: true,
                  children: /* @__PURE__ */ jsx(
                    IconButton,
                    {
                      color: "error",
                      size: "small",
                      onClick: onRemove,
                      disabled: !onRemove,
                      children: /* @__PURE__ */ jsx(default_1$8, {})
                    }
                  )
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function EquippedBuildInfoAlert() {
  const { t } = useTranslation("page_team");
  return /* @__PURE__ */ jsx(Alert, { severity: "info", children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "buildInfo.equipped", children: "This is the build currently equipped to your character, this represents in-game equipement and is persistent outside of the Loadout." }) });
}
function BuildInfoAlert() {
  const { t } = useTranslation("page_team");
  return /* @__PURE__ */ jsx(Alert, { severity: "info", children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "buildInfo.build", children: "This is the build currently equipped to your character, this represents in-game equipement and is persistent outside of the Loadout." }) });
}
function TCBuildInfoAlert() {
  const { t } = useTranslation("page_team");
  return /* @__PURE__ */ jsx(Alert, { severity: "info", children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "buildInfo.tcbuild", children: "This is the build currently equipped to your character, this represents in-game equipement and is persistent outside of the Loadout." }) });
}
const numToShowMap = { xs: 2 * 3, sm: 2 * 3, md: 3 * 3, lg: 4 * 3, xl: 4 * 3 };
function ArtifactSwapModal({
  onChangeId,
  slotKey,
  show,
  onClose
}) {
  const { t } = useTranslation(["page_character", "artifact"]);
  const database = useDatabase();
  const filterOptionReducer = reactExports.useCallback(
    (state, action) => ({ ...state, ...action, slotKeys: [slotKey] }),
    [slotKey]
  );
  const [showEditor, onShowEditor, onHideEditor] = useBoolState(false);
  const [filterOption, filterOptionDispatch] = reactExports.useReducer(filterOptionReducer, {
    ...initialArtifactFilterOption(),
    slotKeys: [slotKey]
  });
  const [dbDirty, forceUpdate] = useForceUpdate();
  reactExports.useEffect(() => {
    return database.arts.followAny(forceUpdate);
  }, [database, forceUpdate]);
  const brPt = useMediaQueryUp();
  const filterConfigs = reactExports.useMemo(() => artifactFilterConfigs(), []);
  const totalArtNum = database.arts.values.filter(
    (s) => s.slotKey === filterOption.slotKeys[0]
  ).length;
  const artifactIds = reactExports.useMemo(() => {
    const filterFunc = filterFunction(filterOption, filterConfigs);
    return dbDirty && database.arts.values.filter(filterFunc).map((art) => art.id);
  }, [dbDirty, database, filterConfigs, filterOption]);
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
  const [swapArtId, setSwapArtId] = reactExports.useState("");
  const clickHandler = reactExports.useCallback(() => {
    if (!swapArtId) {
      return;
    }
    onChangeId(swapArtId);
    setSwapArtId("");
    onClose();
  }, [onChangeId, onClose, swapArtId]);
  return /* @__PURE__ */ jsx(
    ModalWrapper,
    {
      open: show,
      onClose,
      containerProps: { maxWidth: "xl" },
      children: /* @__PURE__ */ jsxs(CardThemed, { children: [
        /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: false, children: /* @__PURE__ */ jsx(
          ArtifactEditor,
          {
            artifactIdToEdit: showEditor ? "new" : "",
            cancelEdit: onHideEditor,
            allowUpload: true,
            allowEmpty: true,
            fixedSlotKey: filterOption.slotKeys[0]
          }
        ) }),
        /* @__PURE__ */ jsxs(
          CardContent,
          {
            sx: {
              py: 1,
              display: "flex",
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ jsxs(Typography, { variant: "h6", children: [
                slotKey ? /* @__PURE__ */ jsx(ImgIcon, { src: imgAssets.slot[slotKey] }) : null,
                " ",
                t`tabEquip.swapArt`
              ] }),
              /* @__PURE__ */ jsx(IconButton, { onClick: onClose, sx: { ml: "auto" }, children: /* @__PURE__ */ jsx(default_1$a, {}) })
            ]
          }
        ),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
          reactExports.Suspense,
          {
            fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 200 }),
            children: /* @__PURE__ */ jsx(
              ArtifactFilterDisplay,
              {
                filterOption,
                filterOptionDispatch,
                filteredIds: artifactIds,
                disableSlotFilter: true
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx(
            Box,
            {
              pb: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              children: /* @__PURE__ */ jsx(ShowingAndSortOptionSelect, { showingTextProps })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              fullWidth: true,
              onClick: onShowEditor,
              color: "info",
              startIcon: /* @__PURE__ */ jsx(default_1$b, {}),
              children: t("artifact:addNew")
            }
          ),
          /* @__PURE__ */ jsx(Box, { mt: 1, children: /* @__PURE__ */ jsxs(
            reactExports.Suspense,
            {
              fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 300 }),
              children: [
                /* @__PURE__ */ jsx(
                  CompareBuildWrapper,
                  {
                    artId: swapArtId,
                    onHide: () => setSwapArtId(""),
                    onEquip: clickHandler
                  }
                ),
                /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, columns: { xs: 2, md: 3, lg: 4 }, children: [
                  /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
                    CardThemed,
                    {
                      bgt: "light",
                      sx: { width: "100%", height: "100%" },
                      children: /* @__PURE__ */ jsx(
                        CardActionArea,
                        {
                          sx: {
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                          },
                          onClick: () => setSwapArtId(slotKey),
                          children: /* @__PURE__ */ jsxs(
                            Box,
                            {
                              sx: {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center"
                              },
                              children: [
                                /* @__PURE__ */ jsx(default_1$2, { sx: { fontSize: "10em" } }),
                                /* @__PURE__ */ jsx(Typography, { children: t`artifact:button.unequipArtifact` })
                              ]
                            }
                          )
                        }
                      )
                    }
                  ) }),
                  artifactIdsToShow.map((id) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
                    ArtifactCard,
                    {
                      artifactId: id,
                      onClick: () => setSwapArtId(id)
                    }
                  ) }, id))
                ] })
              ]
            }
          ) }),
          artifactIds.length !== artifactIdsToShow.length && /* @__PURE__ */ jsx(
            Skeleton,
            {
              ref: (node) => {
                if (!node)
                  return;
                setTriggerElement(node);
              },
              sx: { borderRadius: 1, mt: 1 },
              variant: "rectangular",
              width: "100%",
              height: 100
            }
          )
        ] })
      ] })
    }
  );
}
const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3
};
function EquippedGrid({
  weaponTypeKey,
  weaponId,
  artifactIds,
  setWeapon,
  setArtifact
}) {
  const database = useDatabase();
  const [editorWeaponId, setEditorWeaponId] = reactExports.useState("");
  const [artifactIdToEdit, setArtifactIdToEdit] = reactExports.useState();
  reactExports.useEffect(() => {
    if (weaponId && editorWeaponId && editorWeaponId !== weaponId)
      setEditorWeaponId(weaponId);
  }, [editorWeaponId, weaponId]);
  const showWeapon = reactExports.useCallback(
    () => weaponId && setEditorWeaponId(weaponId),
    [weaponId]
  );
  const hideWeapon = reactExports.useCallback(() => setEditorWeaponId(""), []);
  return /* @__PURE__ */ jsxs(Box, { children: [
    /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: false, children: /* @__PURE__ */ jsx(
      WeaponEditor,
      {
        weaponId: editorWeaponId,
        footer: true,
        onClose: hideWeapon,
        extraButtons: /* @__PURE__ */ jsx(
          LargeWeaponSwapButton,
          {
            weaponTypeKey,
            onChangeId: setWeapon
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: false, children: /* @__PURE__ */ jsx(
      ArtifactEditor,
      {
        artifactIdToEdit,
        cancelEdit: () => setArtifactIdToEdit(void 0)
      }
    ) }),
    /* @__PURE__ */ jsxs(Grid, { item: true, columns, container: true, spacing: 1, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, display: "flex", flexDirection: "column", children: weaponId && database.weapons.keys.includes(weaponId) ? /* @__PURE__ */ jsx(
        WeaponCard,
        {
          weaponId,
          onEdit: showWeapon,
          extraButtons: /* @__PURE__ */ jsx(
            WeaponSwapButton,
            {
              weaponTypeKey,
              onChangeId: setWeapon
            }
          )
        }
      ) : /* @__PURE__ */ jsx(
        WeaponSwapCard,
        {
          weaponTypeKey,
          onChangeId: setWeapon
        }
      ) }),
      !!artifactIds && Object.entries(artifactIds).map(([slotKey, id]) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: id && database.arts.keys.includes(id) ? /* @__PURE__ */ jsx(
        ArtifactCard,
        {
          artifactId: id,
          extraButtons: /* @__PURE__ */ jsx(
            ArtifactSwapButton,
            {
              slotKey,
              onChangeId: (id2) => setArtifact(slotKey, id2)
            }
          ),
          onEdit: () => setArtifactIdToEdit(id),
          onLockToggle: () => database.arts.set(id, ({ lock }) => ({ lock: !lock }))
        }
      ) : /* @__PURE__ */ jsx(
        ArtSwapCard,
        {
          slotKey,
          onChangeId: (id2) => setArtifact(slotKey, id2)
        }
      ) }, id || slotKey))
    ] })
  ] });
}
function WeaponSwapCard({
  weaponTypeKey,
  onChangeId
}) {
  const [show, onOpen, onClose] = useBoolState();
  return /* @__PURE__ */ jsxs(
    CardThemed,
    {
      bgt: "light",
      sx: {
        height: "100%",
        width: "100%",
        minHeight: 300,
        display: "flex",
        flexDirection: "column"
      },
      children: [
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Typography, { children: [
          /* @__PURE__ */ jsx(ImgIcon, { src: imgAssets.weaponTypes[weaponTypeKey] }),
          " ",
          weaponTypeKey
        ] }) }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(
          Box,
          {
            sx: {
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ jsx(
                WeaponSwapModal,
                {
                  weaponTypeKey,
                  show,
                  onClose,
                  onChangeId
                }
              ),
              /* @__PURE__ */ jsx(Button, { onClick: onOpen, color: "info", sx: { borderRadius: "1em" }, children: /* @__PURE__ */ jsx(default_1$3, { sx: { height: 100, width: 100 } }) })
            ]
          }
        )
      ]
    }
  );
}
function ArtSwapCard({
  slotKey,
  onChangeId
}) {
  const [show, onOpen, onClose] = useBoolState();
  const { t } = useTranslation("artifact");
  return /* @__PURE__ */ jsxs(
    CardThemed,
    {
      bgt: "light",
      sx: {
        height: "100%",
        width: "100%",
        minHeight: 300,
        display: "flex",
        flexDirection: "column"
      },
      children: [
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Typography, { children: [
          /* @__PURE__ */ jsx(SlotIcon, { iconProps: iconInlineProps, slotKey }),
          " ",
          t(`slotName.${slotKey}`)
        ] }) }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(
          Box,
          {
            sx: {
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ jsx(
                ArtifactSwapModal,
                {
                  slotKey,
                  show,
                  onClose,
                  onChangeId
                }
              ),
              /* @__PURE__ */ jsx(Button, { onClick: onOpen, color: "info", sx: { borderRadius: "1em" }, children: /* @__PURE__ */ jsx(default_1$3, { sx: { height: 100, width: 100 } }) })
            ]
          }
        )
      ]
    }
  );
}
function ArtifactSwapButton({
  slotKey,
  onChangeId
}) {
  const { t } = useTranslation("page_character");
  const [show, onOpen, onClose] = useBoolState();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Tooltip,
      {
        title: /* @__PURE__ */ jsx(Typography, { children: t`tabEquip.swapArt` }),
        placement: "top",
        arrow: true,
        children: /* @__PURE__ */ jsx(Button, { color: "info", size: "small", onClick: onOpen, children: /* @__PURE__ */ jsx(default_1$3, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      ArtifactSwapModal,
      {
        slotKey,
        show,
        onClose,
        onChangeId
      }
    )
  ] });
}
function WeaponSwapButton({
  weaponTypeKey,
  onChangeId
}) {
  const { t } = useTranslation("page_character");
  const [show, onOpen, onClose] = useBoolState();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Tooltip,
      {
        title: /* @__PURE__ */ jsx(Typography, { children: t`tabEquip.swapWeapon` }),
        placement: "top",
        arrow: true,
        children: /* @__PURE__ */ jsx(Button, { color: "info", size: "small", onClick: onOpen, children: /* @__PURE__ */ jsx(default_1$3, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      WeaponSwapModal,
      {
        weaponTypeKey,
        onChangeId,
        show,
        onClose
      }
    )
  ] });
}
function LargeWeaponSwapButton({
  weaponTypeKey,
  onChangeId
}) {
  const { t } = useTranslation("page_character");
  const [show, onOpen, onClose] = useBoolState();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        color: "info",
        onClick: onOpen,
        startIcon: /* @__PURE__ */ jsx(default_1$3, {}),
        children: t`tabEquip.swapWeapon`
      }
    ),
    /* @__PURE__ */ jsx(
      WeaponSwapModal,
      {
        weaponTypeKey,
        onChangeId,
        show,
        onClose
      }
    )
  ] });
}
function TalentDropdown({
  talentKey,
  setTalent,
  dropDownButtonProps
}) {
  const { t } = useTranslation("sheet_gen");
  const {
    character: { talent }
  } = reactExports.useContext(CharacterContext);
  const { data } = reactExports.useContext(DataContext);
  const levelBoost = data.get(input.total[`${talentKey}Boost`]).value;
  const level = data.get(input.total[talentKey]).value;
  const asc = data.get(input.asc).value;
  return /* @__PURE__ */ jsx(
    DropdownButton,
    {
      fullWidth: true,
      title: t("talentLvl", { level }),
      color: levelBoost ? "info" : "primary",
      ...dropDownButtonProps,
      children: range(1, talentLimits[asc]).map((i) => /* @__PURE__ */ jsx(
        MenuItem,
        {
          selected: talent[talentKey] === i,
          disabled: talent[talentKey] === i,
          onClick: () => setTalent(i),
          children: t("talentLvl", { level: i + levelBoost })
        },
        i
      ))
    }
  );
}
function TeamInfoAlert() {
  return /* @__PURE__ */ jsxs(Alert, { severity: "info", children: [
    /* @__PURE__ */ jsx("strong", { children: "Teams" }),
    " are a container for 4 character loadouts. It provides a way for characters to apply team buffs, and configuration of enemy stats. Loadouts can be shared between teams."
  ] });
}
function LoadoutInfoAlert() {
  return /* @__PURE__ */ jsxs(Alert, { severity: "info", children: [
    /* @__PURE__ */ jsx("strong", { children: "Loadouts" }),
    " provides character context data, including bonus stats, conditionals, multi-targets, optimization config, and stores builds. A single ",
    /* @__PURE__ */ jsx("strong", { children: "Loadout" }),
    " can be used for many teams."
  ] });
}
export {
  BuildCard as B,
  CharacterCoverArea as C,
  EquippedGrid as E,
  LoadoutInfoAlert as L,
  TextFieldLazy as T,
  useBuildTc as a,
  BuildInfoAlert as b,
  TCBuildInfoAlert as c,
  default_1$1 as d,
  TeamInfoAlert as e,
  CharacterCompactConstSelector as f,
  TalentDropdown as g,
  EquippedBuildInfoAlert as h,
  CharacterCompactTalent as i,
  default_1 as j,
  useBuild as u
};
