import { z as useTranslation, b as jsx, d as jsxs, P as Link$1, ad as Trans, av as Alert } from "./index-B8aczfSH.js";
import { L as Link } from "./Link-BpROEXu0.js";
function AddArtInfo() {
  const { t } = useTranslation("artifact");
  return /* @__PURE__ */ jsx(Alert, { severity: "info", variant: "filled", children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "noArtifacts", children: [
    "Looks like you haven't added any artifacts yet. If you want, there are ",
    /* @__PURE__ */ jsx(
      Link,
      {
        color: "warning.main",
        component: Link$1,
        to: "/scanner",
        fontFamily: "inherit",
        children: "automatic scanners"
      }
    ),
    " that can speed up the import process!"
  ] }) });
}
export {
  AddArtInfo as A
};
