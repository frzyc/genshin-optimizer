import { x as getDefaultExportFromCjs, fr as useRefSize, ae as useBoolState, b as jsx, fs as AdWrapper, f as Box, i as useCharacter, ft as useCharMeta, bL as useDBMeta, r as reactExports, a$ as SillyContext, C as CardActionArea, h as CardThemed, d as jsxs, bS as getCharStat, bQ as NextImage, bT as iconAsset, T as Typography, ap as SqBadge, f6 as ascensionMaxLevel, fu as default_1, fv as default_1$1, eV as ConditionalWrapper, B as BootstrapTooltip, Y as imgAssets } from "./index-B8aczfSH.js";
var propTypes = { exports: {} };
var ReactPropTypesSecret$1 = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
var ReactPropTypesSecret_1 = ReactPropTypesSecret$1;
var ReactPropTypesSecret = ReactPropTypesSecret_1;
function emptyFunction() {
}
function emptyFunctionWithReset() {
}
emptyFunctionWithReset.resetWarningCache = emptyFunction;
var factoryWithThrowingShims = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      return;
    }
    var err = new Error(
      "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
    );
    err.name = "Invariant Violation";
    throw err;
  }
  shim.isRequired = shim;
  function getShim() {
    return shim;
  }
  var ReactPropTypes = {
    array: shim,
    bigint: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,
    any: shim,
    arrayOf: getShim,
    element: shim,
    elementType: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,
    checkPropTypes: emptyFunctionWithReset,
    resetWarningCache: emptyFunction
  };
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};
{
  propTypes.exports = factoryWithThrowingShims();
}
var propTypesExports = propTypes.exports;
const PropTypes = /* @__PURE__ */ getDefaultExportFromCjs(propTypesExports);
function AdResponsive({
  dataAdSlot,
  bgt = "normal",
  maxHeight = 350
}) {
  const { width, height, ref } = useRefSize();
  const [show, _, onHide] = useBoolState(true);
  if (!show)
    return null;
  return /* @__PURE__ */ jsx(Box, { ref, sx: { height: "100%", width: "100%", maxHeight }, children: width && /* @__PURE__ */ jsx(
    AdWrapper,
    {
      bgt,
      onClose: (e) => {
        e.stopPropagation();
        onHide();
      },
      dataAdSlot,
      sx: { width, height: Math.max(height, maxHeight) }
    }
  ) });
}
function CharacterCardPico({
  characterKey,
  onClick,
  onMouseDown,
  onMouseEnter,
  hoverChild,
  hideFav
}) {
  const character = useCharacter(characterKey);
  const { favorite } = useCharMeta(characterKey);
  const { gender } = useDBMeta();
  const { silly } = reactExports.useContext(SillyContext);
  const onClickHandler = reactExports.useCallback(
    () => onClick == null ? void 0 : onClick(characterKey),
    [characterKey, onClick]
  );
  const actionWrapperFunc = reactExports.useCallback(
    (children) => /* @__PURE__ */ jsx(
      CardActionArea,
      {
        onClick: onClickHandler,
        onMouseDown,
        onMouseEnter,
        children
      }
    ),
    [onClickHandler, onMouseDown, onMouseEnter]
  );
  const [open, onTooltipOpen, onTooltipClose] = useBoolState();
  return /* @__PURE__ */ jsx(
    BootstrapTooltip,
    {
      enterNextDelay: 500,
      enterTouchDelay: 500,
      placement: "top",
      open: !!hoverChild && open,
      onClose: onTooltipClose,
      onOpen: onTooltipOpen,
      title: hoverChild,
      children: /* @__PURE__ */ jsx(
        CardThemed,
        {
          sx: {
            maxWidth: 128,
            position: "relative",
            display: "flex",
            flexDirection: "column"
          },
          children: /* @__PURE__ */ jsxs(
            ConditionalWrapper,
            {
              condition: !!onClick || !!onMouseDown || !!onMouseEnter,
              wrapper: actionWrapperFunc,
              children: [
                /* @__PURE__ */ jsx(
                  Box,
                  {
                    display: "flex",
                    className: `grad-${getCharStat(characterKey).rarity}star`,
                    children: /* @__PURE__ */ jsx(
                      Box,
                      {
                        component: NextImage ? NextImage : "img",
                        src: iconAsset(characterKey, gender, silly),
                        maxWidth: "100%",
                        maxHeight: "100%",
                        draggable: false
                      }
                    )
                  }
                ),
                character && /* @__PURE__ */ jsx(
                  Typography,
                  {
                    sx: {
                      position: "absolute",
                      fontSize: "0.75rem",
                      lineHeight: 1,
                      opacity: 0.85,
                      pointerEvents: "none",
                      top: 0
                    },
                    children: /* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsxs(SqBadge, { color: "primary", children: [
                      character.level,
                      "/",
                      ascensionMaxLevel[character.ascension]
                    ] }) })
                  }
                ),
                !hideFav && /* @__PURE__ */ jsx(Box, { sx: { position: "absolute", top: 0, right: 0 }, children: favorite ? /* @__PURE__ */ jsx(default_1, { fontSize: "small" }) : /* @__PURE__ */ jsx(default_1$1, { fontSize: "small" }) }),
                character && /* @__PURE__ */ jsx(
                  Typography,
                  {
                    sx: {
                      position: "absolute",
                      fontSize: "0.75rem",
                      lineHeight: 1,
                      opacity: 0.85,
                      pointerEvents: "none",
                      bottom: 0,
                      right: 0
                    },
                    children: /* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsxs(SqBadge, { color: "secondary", children: [
                      "C",
                      character.constellation
                    ] }) })
                  }
                )
              ]
            }
          )
        }
      )
    }
  );
}
function BlankCharacterCardPico({ index }) {
  return /* @__PURE__ */ jsx(
    CardThemed,
    {
      sx: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: "12.5%"
      },
      children: /* @__PURE__ */ jsx(
        Box,
        {
          component: NextImage ? NextImage : "img",
          src: imgAssets.team[`team${index + 1}`],
          sx: { width: "75%", height: "auto", opacity: 0.7 }
        }
      )
    }
  );
}
export {
  AdResponsive as A,
  BlankCharacterCardPico as B,
  CharacterCardPico as C,
  PropTypes as P
};
