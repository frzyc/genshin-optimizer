import { v as requireCreateSvgIcon, w as interopRequireDefaultExports, j as jsxRuntimeExports, ac as ReactGA, cd as useMatch, d as jsxs, G as Grid, b as jsx, T as Typography, ap as SqBadge, N as Divider, h as CardThemed, cf as Tabs, ce as Tab, P as Link, O as CardContent, r as reactExports, S as Skeleton, cg as Routes, ch as Route, cj as CodeBlock, ck as Fragment, z as useTranslation, cl as statPercent, bE as allArtifactSetKeys, a as useDatabase, bL as useDBMeta, bh as allLocationCharacterKeys, cm as charKeyToLocGenderedCharKey, ca as allWeaponKeys, cn as allStats, f as Box } from "./index-B8aczfSH.js";
import { L as Link$1 } from "./Link-BpROEXu0.js";
var ArrowRightAlt = {};
var _interopRequireDefault = interopRequireDefaultExports;
Object.defineProperty(ArrowRightAlt, "__esModule", {
  value: true
});
var default_1 = ArrowRightAlt.default = void 0;
var _createSvgIcon = _interopRequireDefault(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
var _default = (0, _createSvgIcon.default)(/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M16.01 11H4v2h12.01v3L20 12l-3.99-4z"
}), "ArrowRightAlt");
default_1 = ArrowRightAlt.default = _default;
function PageDocumentation() {
  ReactGA.send({ hitType: "pageview", page: "/doc" });
  const {
    params: { currentTab }
  } = useMatch("/doc/:currentTab") ?? { params: { currentTab: "" } };
  return /* @__PURE__ */ jsxs(CardThemed, { children: [
    /* @__PURE__ */ jsxs(Grid, { container: true, sx: { px: 2, py: 1 }, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, flexGrow: 1, children: /* @__PURE__ */ jsx(Typography, { variant: "h6", children: "Documentation" }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(Typography, { variant: "h6", children: /* @__PURE__ */ jsx(SqBadge, { color: "info", children: "Version. 2" }) }) })
    ] }),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 2, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", sx: { height: "100%" }, children: /* @__PURE__ */ jsxs(
        Tabs,
        {
          orientation: "vertical",
          value: currentTab,
          "aria-label": "Documentation Navigation",
          sx: { borderRight: 1, borderColor: "divider" },
          children: [
            /* @__PURE__ */ jsx(Tab, { label: "Overview", value: "", component: Link, to: "" }),
            /* @__PURE__ */ jsx(
              Tab,
              {
                label: "Key naming convention",
                value: "KeyNaming",
                component: Link,
                to: "KeyNaming"
              }
            ),
            /* @__PURE__ */ jsx(
              Tab,
              {
                label: /* @__PURE__ */ jsx("code", { children: "StatKey" }),
                value: "StatKey",
                component: Link,
                to: "StatKey"
              }
            ),
            /* @__PURE__ */ jsx(
              Tab,
              {
                label: /* @__PURE__ */ jsx("code", { children: "ArtifactSetKey" }),
                value: "ArtifactSetKey",
                component: Link,
                to: "ArtifactSetKey"
              }
            ),
            /* @__PURE__ */ jsx(
              Tab,
              {
                label: /* @__PURE__ */ jsx("code", { children: "CharacterKey" }),
                value: "CharacterKey",
                component: Link,
                to: "CharacterKey"
              }
            ),
            /* @__PURE__ */ jsx(
              Tab,
              {
                label: /* @__PURE__ */ jsx("code", { children: "WeaponKey" }),
                value: "WeaponKey",
                component: Link,
                to: "WeaponKey"
              }
            ),
            /* @__PURE__ */ jsx(
              Tab,
              {
                label: /* @__PURE__ */ jsx("code", { children: "MaterialKey" }),
                value: "MaterialKey",
                component: Link,
                to: "MaterialKey"
              }
            ),
            /* @__PURE__ */ jsx(
              Tab,
              {
                label: "Version History",
                value: "VersionHistory",
                component: Link,
                to: "VersionHistory"
              }
            )
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, md: 10, children: /* @__PURE__ */ jsx(CardThemed, { bgt: "light", sx: { height: "100%" }, children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
        reactExports.Suspense,
        {
          fallback: /* @__PURE__ */ jsx(Skeleton, { variant: "rectangular", width: "100%", height: 600 }),
          children: /* @__PURE__ */ jsxs(Routes, { children: [
            /* @__PURE__ */ jsx(Route, { index: true, element: /* @__PURE__ */ jsx(Overview, {}) }),
            /* @__PURE__ */ jsx(
              Route,
              {
                path: "/VersionHistory",
                element: /* @__PURE__ */ jsx(VersionHistoryPane, {})
              }
            ),
            /* @__PURE__ */ jsx(Route, { path: "/MaterialKey", element: /* @__PURE__ */ jsx(MaterialKeyPane, {}) }),
            /* @__PURE__ */ jsx(
              Route,
              {
                path: "/ArtifactSetKey",
                element: /* @__PURE__ */ jsx(ArtifactSetKeyPane, {})
              }
            ),
            /* @__PURE__ */ jsx(Route, { path: "/WeaponKey", element: /* @__PURE__ */ jsx(WeaponKeyPane, {}) }),
            /* @__PURE__ */ jsx(
              Route,
              {
                path: "/CharacterKey",
                element: /* @__PURE__ */ jsx(CharacterKeyPane, {})
              }
            ),
            /* @__PURE__ */ jsx(Route, { path: "/StatKey", element: /* @__PURE__ */ jsx(StatKeyPane, {}) }),
            /* @__PURE__ */ jsx(Route, { path: "/KeyNaming", element: /* @__PURE__ */ jsx(KeyNamingPane, {}) })
          ] })
        }
      ) }) }) })
    ] }) })
  ] });
}
const goodCode = `interface IGOOD {
  format: "GOOD" // A way for people to recognize this format.
  version: number // GOOD API version.
  source: string // The app that generates this data.
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
  materials?: { // Added in version 2
    [key:MaterialKey]: number
  }
}`;
const artifactCode = `interface IArtifact {
  setKey: SetKey //e.g. "GladiatorsFinale"
  slotKey: SlotKey //e.g. "plume"
  level: number //0-20 inclusive
  rarity: number //1-5 inclusive
  mainStatKey: StatKey
  location: CharacterKey|"" //where "" means not equipped.
  lock: boolean //Whether the artifact is locked in game.
  substats: ISubstat[]
}

interface ISubstat {
  key: StatKey //e.g. "critDMG_"
  value: number //e.g. 19.4
}

type SlotKey = "flower" | "plume" | "sands" | "goblet" | "circlet"`;
const weaponCode = `interface IWeapon {
  key: WeaponKey //"CrescentPike"
  level: number //1-90 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: number //1-5 inclusive
  location: CharacterKey | "" //where "" means not equipped.
  lock: boolean //Whether the weapon is locked in game.
}`;
const characterCode = `interface ICharacter {
  key: CharacterKey //e.g. "Rosaria"
  level: number //1-90 inclusive
  constellation: number //0-6 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  talent: { //does not include boost from constellations. 1-15 inclusive
    auto: number
    skill: number
    burst: number
  }
}`;
function Overview() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "Genshin Open Object Description (GOOD)" }),
    /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
      /* @__PURE__ */ jsx("strong", { children: "GOOD" }),
      " is a data format description to map Genshin Data into a parsable JSON. This is intended to be a standardized format to allow Genshin developers/programmers to transfer data without needing manual conversion."
    ] }),
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, children: "As of version 6.0.0, Genshin Optimizer's database export conforms to this format." }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(CodeBlock, { text: goodCode }) }) }),
    /* @__PURE__ */ jsx("br", {}),
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "Artifact data representation" }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(CodeBlock, { text: artifactCode }) }) }),
    /* @__PURE__ */ jsx("br", {}),
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "Weapon data representation" }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(CodeBlock, { text: weaponCode }) }) }),
    /* @__PURE__ */ jsx("br", {}),
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "Character data representation" }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(CodeBlock, { text: characterCode }) }) })
  ] });
}
function KeyNamingPane() {
  return /* @__PURE__ */ jsxs(CardThemed, { children: [
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Typography, { children: "Key Naming Convention" }) }),
    /* @__PURE__ */ jsx(Divider, {}),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        "The keys in the GOOD format, like Artifact sets, weapon keys, character keys, are all in ",
        /* @__PURE__ */ jsx("strong", { children: "PascalCase" }),
        ". This makes the name easy to derive from the in-game text, assuming no renames occur. If a rename is needed, then the standard will have to increment versions. (Last change was in 1.2 when the Prototype weapons were renamed)"
      ] }),
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        " ",
        "To derive the PascalKey from a specific name, remove all symbols from the name, and Capitalize each word:"
      ] }),
      /* @__PURE__ */ jsxs(Typography, { children: [
        /* @__PURE__ */ jsx("code", { children: "Gladiator's Finale" }),
        " ",
        /* @__PURE__ */ jsx(default_1, { sx: { verticalAlign: "bottom" } }),
        " ",
        /* @__PURE__ */ jsx("code", { children: "GladiatorsFinale" })
      ] }),
      /* @__PURE__ */ jsxs(Typography, { children: [
        /* @__PURE__ */ jsx("code", { children: "Spirit Locket of Boreas" }),
        " ",
        /* @__PURE__ */ jsx(default_1, { sx: { verticalAlign: "bottom" } }),
        " ",
        /* @__PURE__ */ jsx("code", { children: "SpiritLocketOfBoreas" })
      ] }),
      /* @__PURE__ */ jsxs(Typography, { children: [
        /* @__PURE__ */ jsx("code", { children: '"The Catch"' }),
        " ",
        /* @__PURE__ */ jsx(default_1, { sx: { verticalAlign: "bottom" } }),
        " ",
        /* @__PURE__ */ jsx("code", { children: "TheCatch" })
      ] })
    ] })
  ] });
}
function StatKeyPane() {
  const { t: tk } = useTranslation("statKey_gen");
  const statKeys = [
    "hp",
    "hp_",
    "atk",
    "atk_",
    "def",
    "def_",
    "eleMas",
    "enerRech_",
    "heal_",
    "critRate_",
    "critDMG_",
    "physical_dmg_",
    "anemo_dmg_",
    "geo_dmg_",
    "electro_dmg_",
    "hydro_dmg_",
    "pyro_dmg_",
    "cryo_dmg_",
    "dendro_dmg_"
  ];
  const statKeysCode = `type StatKey
  = ${statKeys.map((k) => `"${k}" //${tk(k)}${statPercent(k)}`).join(`
  | `)}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "StatKey" }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(CodeBlock, { text: statKeysCode }) }) })
  ] });
}
function ArtifactSetKeyPane() {
  const { t } = useTranslation("artifactNames_gen");
  const artSetKeysCode = `type ArtifactSetKey
  = ${[
    ...new Set(allArtifactSetKeys)
  ].sort().map((k) => `"${k}" //${t(`artifactNames_gen:${k}`)}`).join(`
  | `)}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "ArtifactSetKey" }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(CodeBlock, { text: artSetKeysCode }) }) })
  ] });
}
function CharacterKeyPane() {
  const { t } = useTranslation("charNames_gen");
  const database = useDatabase();
  const { gender } = useDBMeta();
  const charKeysCode = `type CharacterKey
  = ${[
    ...new Set(allLocationCharacterKeys)
  ].sort().map(
    (k) => `"${k}" //${t(
      `charNames_gen:${charKeyToLocGenderedCharKey(
        database.chars.LocationToCharacterKey(k),
        gender
      )}`
    )}`
  ).join(`
  | `)}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "CharacterKey" }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(CodeBlock, { text: charKeysCode }) }) })
  ] });
}
function WeaponKeyPane() {
  const { t } = useTranslation("weaponNames_gen");
  const weaponKeysCode = `type WeaponKey
  = ${[...new Set(allWeaponKeys)].sort().map((k) => `"${k}" //${t(`weaponNames_gen:${k}`)}`).join(`
  | `)}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "WeaponKey" }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(CodeBlock, { text: weaponKeysCode }) }) })
  ] });
}
function MaterialKeyPane() {
  const { t } = useTranslation("material_gen");
  const weaponKeysCode = `type MaterialKey
  = ${Object.keys(allStats.material).sort().map((k) => `"${k}" // ${t(`${k}.name`)}`).join(`
  | `)}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "MaterialKey" }),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxs(Typography, { gutterBottom: true, children: [
        "The item names are taken from the english translation, and then converted into",
        " ",
        /* @__PURE__ */ jsx(Link$1, { component: Link, to: "KeyNaming", children: /* @__PURE__ */ jsx("code", { children: "PascalCase" }) }),
        "."
      ] }),
      /* @__PURE__ */ jsx(CodeBlock, { text: weaponKeysCode })
    ] }) })
  ] });
}
function VersionHistoryPane() {
  return /* @__PURE__ */ jsxs(Box, { display: "flex", flexDirection: "column", gap: 2, children: [
    /* @__PURE__ */ jsx(Typography, { gutterBottom: true, variant: "h4", children: "Version History" }),
    /* @__PURE__ */ jsxs(CardThemed, { children: [
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Typography, { children: "Version 1" }) }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Typography, { children: [
        "Created general ",
        /* @__PURE__ */ jsx("code", { children: "IGOOD" }),
        " format with character, weapon, artifact fields."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(CardThemed, { children: [
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Typography, { children: "Version 2" }) }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Typography, { children: [
        "Adds ",
        /* @__PURE__ */ jsx("code", { children: "materials" }),
        " field to ",
        /* @__PURE__ */ jsx("code", { children: "IGOOD" }),
        ". All other fields remain the same. V2 is backwards compatible with V1."
      ] }) })
    ] })
  ] });
}
export {
  PageDocumentation as default
};
