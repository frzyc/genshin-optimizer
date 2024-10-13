import { bq as generateUtilityClass, br as generateUtilityClasses, bs as styled, bt as _extends, r as reactExports, bu as useThemeProps, bv as _objectWithoutPropertiesLoose, j as jsxRuntimeExports, bw as clsx, bx as composeClasses, c as createSvgIcon, z as useTranslation, ac as ReactGA, d as jsxs, b as jsx, G as Grid, h as CardThemed, C as CardActionArea, O as CardContent, f as Box, T as Typography, ad as Trans, aj as IconButton, ap as SqBadge, a2 as DiscordIcon, co as Download, W as AnvilIcon, P as Link$1, cp as Tooltip } from "./index-B8aczfSH.js";
import { I as InsertLink, Y as YouTube } from "./YouTube-DN0shfnT.js";
import { L as Link } from "./Link-BpROEXu0.js";
function getCardMediaUtilityClass(slot) {
  return generateUtilityClass("MuiCardMedia", slot);
}
generateUtilityClasses("MuiCardMedia", ["root", "media", "img"]);
const _excluded = ["children", "className", "component", "image", "src", "style"];
const useUtilityClasses = (ownerState) => {
  const {
    classes,
    isMediaComponent,
    isImageComponent
  } = ownerState;
  const slots = {
    root: ["root", isMediaComponent && "media", isImageComponent && "img"]
  };
  return composeClasses(slots, getCardMediaUtilityClass, classes);
};
const CardMediaRoot = styled("div", {
  name: "MuiCardMedia",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    const {
      isMediaComponent,
      isImageComponent
    } = ownerState;
    return [styles.root, isMediaComponent && styles.media, isImageComponent && styles.img];
  }
})(({
  ownerState
}) => _extends({
  display: "block",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center"
}, ownerState.isMediaComponent && {
  width: "100%"
}, ownerState.isImageComponent && {
  // ⚠️ object-fit is not supported by IE11.
  objectFit: "cover"
}));
const MEDIA_COMPONENTS = ["video", "audio", "picture", "iframe", "img"];
const IMAGE_COMPONENTS = ["picture", "img"];
const CardMedia = /* @__PURE__ */ reactExports.forwardRef(function CardMedia2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiCardMedia"
  });
  const {
    children,
    className,
    component = "div",
    image,
    src,
    style
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const isMediaComponent = MEDIA_COMPONENTS.indexOf(component) !== -1;
  const composedStyle = !isMediaComponent && image ? _extends({
    backgroundImage: `url("${image}")`
  }, style) : style;
  const ownerState = _extends({}, props, {
    component,
    isMediaComponent,
    isImageComponent: IMAGE_COMPONENTS.indexOf(component) !== -1
  });
  const classes = useUtilityClasses(ownerState);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CardMediaRoot, _extends({
    className: clsx(classes.root, className),
    as: component,
    role: !isMediaComponent && image ? "img" : void 0,
    ref,
    style: composedStyle,
    ownerState,
    src: isMediaComponent ? image || src : void 0
  }, other, {
    children
  }));
});
const CardMedia$1 = CardMedia;
const Backpack = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M20 8v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8c0-1.86 1.28-3.41 3-3.86V2h3v2h4V2h3v2.14c1.72.45 3 2 3 3.86zM6 12v2h10v2h2v-4H6z"
}), "Backpack");
const Computer = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"
}), "Computer");
const PersonSearch = createSvgIcon([/* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
  cx: "10",
  cy: "8",
  r: "4"
}, "0"), /* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M10.35 14.01C7.62 13.91 2 15.27 2 18v2h9.54c-2.47-2.76-1.23-5.89-1.19-5.99zm9.08 4.01c.36-.59.57-1.28.57-2.02 0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4c.74 0 1.43-.22 2.02-.57L20.59 22 22 20.59l-2.57-2.57zM16 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
}, "1")], "PersonSearch");
const SendToMobile = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M17 17h2v4c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V3c0-1.1.9-1.99 2-1.99L17 1c1.1 0 2 .9 2 2v4h-2V6H7v12h10v-1zm5-5-4-4v3h-5v2h5v3l4-4z"
}), "SendToMobile");
const SportsEsports = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "m21.58 16.09-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
}), "SportsEsports");
const Warning = createSvgIcon(/* @__PURE__ */ jsxRuntimeExports.jsx("path", {
  d: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
}), "Warning");
const AdScanner = "" + new URL("AdeptiScanner-Cm5P-1Hg.png", import.meta.url).href;
const GIScanner = "" + new URL("GIScanner-BYjmmrQH.png", import.meta.url).href;
const Artiscan = "" + new URL("artiscan-Csrg4vXS.png", import.meta.url).href;
function PageScanner() {
  const { t } = useTranslation("page_scanner");
  ReactGA.send({ hitType: "pageview", page: "/scanner" });
  return /* @__PURE__ */ jsxs(Box, { display: "flex", flexDirection: "column", gap: 2, children: [
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "intro", children: [
      /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h5", children: "Scanners" }),
      /* @__PURE__ */ jsx(Typography, { children: "Scanners are Genshin tools that can automatically scan game data from screenshots or directly from the game." }),
      /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: "Below are several scanners that have been tested with GO." }),
      /* @__PURE__ */ jsxs(Typography, { variant: "subtitle2", children: [
        "To upload the exported file, go to the",
        /* @__PURE__ */ jsx(Link, { component: Link$1, to: "/setting", children: "Settings" }),
        "page, and upload your file in the",
        "<strong>Database Upload</strong>",
        "section."
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs(Grid, { container: true, columns: { xs: 1, md: 2, lg: 4 }, spacing: 2, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsxs(CardThemed, { sx: { height: "100%" }, children: [
        /* @__PURE__ */ jsx(
          CardActionArea,
          {
            href: "https://artiscan.ninjabay.org/",
            target: "_blank",
            children: /* @__PURE__ */ jsx(CardMedia$1, { component: "img", image: Artiscan })
          }
        ),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs(Box, { display: "flex", gap: 1, alignItems: "center", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h5", flexGrow: 1, children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "nb.title", children: "Artiscan" }) }),
            /* @__PURE__ */ jsx(
              IconButton,
              {
                href: "https://artiscan.ninjabay.org/",
                target: "_blank",
                children: /* @__PURE__ */ jsx(InsertLink, {})
              }
            ),
            /* @__PURE__ */ jsx(IconButton, { href: "https://youtu.be/_qzzunuef4Y", target: "_blank", children: /* @__PURE__ */ jsx(YouTube, {}) })
          ] }),
          /* @__PURE__ */ jsxs(
            Typography,
            {
              variant: "subtitle2",
              sx: { display: "flex", gap: 1, py: 1, flexWrap: "wrap" },
              children: [
                /* @__PURE__ */ jsxs(SqBadge, { sx: { display: "flex", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsx(Computer, { sx: { pr: 0.5 } }),
                  t("tags.pc")
                ] }),
                /* @__PURE__ */ jsxs(SqBadge, { sx: { display: "flex", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsx(SendToMobile, { sx: { pr: 0.5 } }),
                  t("tags.mobile")
                ] }),
                /* @__PURE__ */ jsxs(SqBadge, { sx: { display: "flex", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsx(SportsEsports, { sx: { pr: 0.5 } }),
                  t("tags.ps")
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: t("nb.p1") }),
          /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: t("nb.p2") })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsxs(CardThemed, { sx: { height: "100%" }, children: [
        /* @__PURE__ */ jsx(
          CardActionArea,
          {
            href: "https://github.com/Andrewthe13th/Inventory_Kamera",
            target: "_blank",
            children: /* @__PURE__ */ jsx(CardMedia$1, { component: "img", image: GIScanner })
          }
        ),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs(Box, { display: "flex", gap: 1, alignItems: "center", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h5", flexGrow: 1, children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "ik.title", children: "Inventory Kamera" }) }),
            /* @__PURE__ */ jsx(
              IconButton,
              {
                href: "https://discord.gg/zh56aVWe3U",
                target: "_blank",
                children: /* @__PURE__ */ jsx(DiscordIcon, {})
              }
            ),
            /* @__PURE__ */ jsx(
              IconButton,
              {
                href: "https://github.com/Andrewthe13th/Inventory_Kamera",
                target: "_blank",
                children: /* @__PURE__ */ jsx(Download, {})
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            Typography,
            {
              variant: "subtitle2",
              sx: { display: "flex", gap: 1, py: 1, flexWrap: "wrap" },
              children: [
                /* @__PURE__ */ jsxs(SqBadge, { sx: { display: "flex", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsx(Computer, { sx: { pr: 0.5 } }),
                  t("tags.pc")
                ] }),
                /* @__PURE__ */ jsxs(SqBadge, { sx: { display: "flex", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsx(PersonSearch, { sx: { pr: 0.5 } }),
                  t("tags.characters")
                ] }),
                /* @__PURE__ */ jsxs(
                  SqBadge,
                  {
                    sx: { display: "flex", alignItems: "center", gap: 0.5 },
                    children: [
                      /* @__PURE__ */ jsx(AnvilIcon, {}),
                      t("tags.weapons")
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(SqBadge, { sx: { display: "flex", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsx(Backpack, { sx: { pr: 0.5 } }),
                  t("tags.materials")
                ] }),
                /* @__PURE__ */ jsx(WarningWrapper, { children: /* @__PURE__ */ jsxs(
                  SqBadge,
                  {
                    color: "warning",
                    sx: { display: "flex", alignItems: "center" },
                    children: [
                      /* @__PURE__ */ jsx(Warning, { sx: { pr: 0.5 } }),
                      t("tags.gameMani")
                    ]
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "ik.p1" }) }),
          /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "seelieme", children: [
            "This app can also scan materials for",
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "https://seelie.me/",
                target: "_blank",
                rel: "noreferrer",
                children: "Seelie.me"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "goodeng", children: [
            "This app only scans in English and exports to",
            /* @__PURE__ */ jsx("code", { children: "GOOD" }),
            "format."
          ] }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsxs(CardThemed, { sx: { height: "100%" }, children: [
        /* @__PURE__ */ jsx(
          CardActionArea,
          {
            href: "https://github.com/D1firehail/AdeptiScanner-GI",
            target: "_blank",
            children: /* @__PURE__ */ jsx(CardMedia$1, { component: "img", image: AdScanner })
          }
        ),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs(Box, { display: "flex", gap: 1, alignItems: "center", children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h5", flexGrow: 1, children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "as.title", children: "AdeptiScanner" }) }),
            /* @__PURE__ */ jsx(
              IconButton,
              {
                href: "https://github.com/D1firehail/AdeptiScanner-GI",
                target: "_blank",
                children: /* @__PURE__ */ jsx(Download, {})
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            Typography,
            {
              variant: "subtitle2",
              sx: { display: "flex", gap: 1, py: 1, flexWrap: "wrap" },
              children: [
                /* @__PURE__ */ jsxs(SqBadge, { sx: { display: "flex", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsx(Computer, { sx: { pr: 0.5 } }),
                  t("tags.pc")
                ] }),
                /* @__PURE__ */ jsxs(
                  SqBadge,
                  {
                    sx: { display: "flex", alignItems: "center", gap: 0.5 },
                    children: [
                      /* @__PURE__ */ jsx(AnvilIcon, {}),
                      t("tags.weapons")
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(WarningWrapper, { children: /* @__PURE__ */ jsxs(
                  SqBadge,
                  {
                    color: "warning",
                    sx: { display: "flex", alignItems: "center" },
                    children: [
                      /* @__PURE__ */ jsx(Warning, { sx: { pr: 0.5 } }),
                      t("tags.gameMani")
                    ]
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "as.p1", children: [
            "Scans all artifacts and weapons in your inventory. Has a manual scanning mode and can also import via",
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "https://enka.network/",
                target: "_blank",
                rel: "noreferrer",
                children: "Enka.Network"
              }
            ),
            "."
          ] }) }),
          /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "as.p2", children: "This scanner can also be configured for new artifacts in new game versions without needing an update." }) }),
          /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "goodeng", children: [
            "This app only scans in English and exports to",
            /* @__PURE__ */ jsx("code", { children: "GOOD" }),
            "format."
          ] }) })
        ] })
      ] }) })
    ] })
  ] });
}
function WarningWrapper({ children }) {
  const { t } = useTranslation("page_scanner");
  return /* @__PURE__ */ jsx(
    Tooltip,
    {
      placement: "top",
      title: /* @__PURE__ */ jsx(Typography, { children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "tosWarn", children: [
        "As any tools that indirectly interact with the game, although their usage is virtually undetectable,",
        /* @__PURE__ */ jsx(
          Link,
          {
            color: "inherit",
            href: "https://genshin.mihoyo.com/en/news/detail/5763",
            target: "_blank",
            rel: "noreferrer",
            children: "there could still be risk with using them."
          }
        ),
        "Users discretion is advised."
      ] }) }),
      children
    }
  );
}
export {
  PageScanner as default
};
