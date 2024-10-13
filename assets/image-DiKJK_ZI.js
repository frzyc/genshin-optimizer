import { r as reactExports, j as jsxRuntimeExports, er as reactDomExports, x as getDefaultExportFromCjs } from "./index-B8aczfSH.js";
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
var imageExternal = {};
var _interop_require_default$1 = {};
_interop_require_default$1._ = _interop_require_default$1._interop_require_default = _interop_require_default;
function _interop_require_default(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var getImgProps = {};
var warnOnce = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "warnOnce", {
    enumerable: true,
    get: function() {
      return warnOnce2;
    }
  });
  let warnOnce2 = (_) => {
  };
})(warnOnce);
var imageBlurSvg = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "getImageBlurSvg", {
    enumerable: true,
    get: function() {
      return getImageBlurSvg;
    }
  });
  function getImageBlurSvg(param) {
    let { widthInt, heightInt, blurWidth, blurHeight, blurDataURL, objectFit } = param;
    const std = 20;
    const svgWidth = blurWidth ? blurWidth * 40 : widthInt;
    const svgHeight = blurHeight ? blurHeight * 40 : heightInt;
    const viewBox = svgWidth && svgHeight ? "viewBox='0 0 " + svgWidth + " " + svgHeight + "'" : "";
    const preserveAspectRatio = viewBox ? "none" : objectFit === "contain" ? "xMidYMid" : objectFit === "cover" ? "xMidYMid slice" : "none";
    return "%3Csvg xmlns='http://www.w3.org/2000/svg' " + viewBox + "%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='" + std + "'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='" + std + "'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='" + preserveAspectRatio + "' style='filter: url(%23b);' href='" + blurDataURL + "'/%3E%3C/svg%3E";
  }
})(imageBlurSvg);
var imageConfig = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function _export(target, all) {
    for (var name in all)
      Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
  }
  _export(exports, {
    VALID_LOADERS: function() {
      return VALID_LOADERS;
    },
    imageConfigDefault: function() {
      return imageConfigDefault;
    }
  });
  const VALID_LOADERS = [
    "default",
    "imgix",
    "cloudinary",
    "akamai",
    "custom"
  ];
  const imageConfigDefault = {
    deviceSizes: [
      640,
      750,
      828,
      1080,
      1200,
      1920,
      2048,
      3840
    ],
    imageSizes: [
      16,
      32,
      48,
      64,
      96,
      128,
      256,
      384
    ],
    path: "/_next/image",
    loader: "default",
    loaderFile: "",
    domains: [],
    disableStaticImages: false,
    minimumCacheTTL: 60,
    formats: [
      "image/webp"
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
    contentDispositionType: "inline",
    remotePatterns: [],
    unoptimized: false
  };
})(imageConfig);
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "getImgProps", {
    enumerable: true,
    get: function() {
      return getImgProps2;
    }
  });
  const _imageblursvg = imageBlurSvg;
  const _imageconfig = imageConfig;
  function isStaticRequire(src) {
    return src.default !== void 0;
  }
  function isStaticImageData(src) {
    return src.src !== void 0;
  }
  function isStaticImport(src) {
    return typeof src === "object" && (isStaticRequire(src) || isStaticImageData(src));
  }
  function getInt(x) {
    if (typeof x === "undefined") {
      return x;
    }
    if (typeof x === "number") {
      return Number.isFinite(x) ? x : NaN;
    }
    if (typeof x === "string" && /^[0-9]+$/.test(x)) {
      return parseInt(x, 10);
    }
    return NaN;
  }
  function getWidths(param, width, sizes) {
    let { deviceSizes, allSizes } = param;
    if (sizes) {
      const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;
      const percentSizes = [];
      for (let match; match = viewportWidthRe.exec(sizes); match) {
        percentSizes.push(parseInt(match[2]));
      }
      if (percentSizes.length) {
        const smallestRatio = Math.min(...percentSizes) * 0.01;
        return {
          widths: allSizes.filter((s) => s >= deviceSizes[0] * smallestRatio),
          kind: "w"
        };
      }
      return {
        widths: allSizes,
        kind: "w"
      };
    }
    if (typeof width !== "number") {
      return {
        widths: deviceSizes,
        kind: "w"
      };
    }
    const widths = [
      ...new Set(
        // > This means that most OLED screens that say they are 3x resolution,
        // > are actually 3x in the green color, but only 1.5x in the red and
        // > blue colors. Showing a 3x resolution image in the app vs a 2x
        // > resolution image will be visually the same, though the 3x image
        // > takes significantly more data. Even true 3x resolution screens are
        // > wasteful as the human eye cannot see that level of detail without
        // > something like a magnifying glass.
        // https://blog.twitter.com/engineering/en_us/topics/infrastructure/2019/capping-image-fidelity-on-ultra-high-resolution-devices.html
        [
          width,
          width * 2
          /*, width * 3*/
        ].map((w) => allSizes.find((p) => p >= w) || allSizes[allSizes.length - 1])
      )
    ];
    return {
      widths,
      kind: "x"
    };
  }
  function generateImgAttrs(param) {
    let { config, src, unoptimized, width, quality, sizes, loader } = param;
    if (unoptimized) {
      return {
        src,
        srcSet: void 0,
        sizes: void 0
      };
    }
    const { widths, kind } = getWidths(config, width, sizes);
    const last = widths.length - 1;
    return {
      sizes: !sizes && kind === "w" ? "100vw" : sizes,
      srcSet: widths.map((w, i) => loader({
        config,
        src,
        quality,
        width: w
      }) + " " + (kind === "w" ? w : i + 1) + kind).join(", "),
      // It's intended to keep `src` the last attribute because React updates
      // attributes in order. If we keep `src` the first one, Safari will
      // immediately start to fetch `src`, before `sizes` and `srcSet` are even
      // updated by React. That causes multiple unnecessary requests if `srcSet`
      // and `sizes` are defined.
      // This bug cannot be reproduced in Chrome or Firefox.
      src: loader({
        config,
        src,
        quality,
        width: widths[last]
      })
    };
  }
  function getImgProps2(param, _state) {
    let { src, sizes, unoptimized = false, priority = false, loading, className, quality, width, height, fill = false, style, overrideSrc, onLoad, onLoadingComplete, placeholder = "empty", blurDataURL, fetchPriority, layout, objectFit, objectPosition, lazyBoundary, lazyRoot, ...rest } = param;
    const { imgConf, showAltText, blurComplete, defaultLoader } = _state;
    let config;
    let c = imgConf || _imageconfig.imageConfigDefault;
    if ("allSizes" in c) {
      config = c;
    } else {
      const allSizes = [
        ...c.deviceSizes,
        ...c.imageSizes
      ].sort((a, b) => a - b);
      const deviceSizes = c.deviceSizes.sort((a, b) => a - b);
      config = {
        ...c,
        allSizes,
        deviceSizes
      };
    }
    if (typeof defaultLoader === "undefined") {
      throw new Error("images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config");
    }
    let loader = rest.loader || defaultLoader;
    delete rest.loader;
    delete rest.srcSet;
    const isDefaultLoader = "__next_img_default" in loader;
    if (isDefaultLoader) {
      if (config.loader === "custom") {
        throw new Error('Image with src "' + src + '" is missing "loader" prop.\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader');
      }
    } else {
      const customImageLoader = loader;
      loader = (obj) => {
        const { config: _, ...opts } = obj;
        return customImageLoader(opts);
      };
    }
    if (layout) {
      if (layout === "fill") {
        fill = true;
      }
      const layoutToStyle = {
        intrinsic: {
          maxWidth: "100%",
          height: "auto"
        },
        responsive: {
          width: "100%",
          height: "auto"
        }
      };
      const layoutToSizes = {
        responsive: "100vw",
        fill: "100vw"
      };
      const layoutStyle = layoutToStyle[layout];
      if (layoutStyle) {
        style = {
          ...style,
          ...layoutStyle
        };
      }
      const layoutSizes = layoutToSizes[layout];
      if (layoutSizes && !sizes) {
        sizes = layoutSizes;
      }
    }
    let staticSrc = "";
    let widthInt = getInt(width);
    let heightInt = getInt(height);
    let blurWidth;
    let blurHeight;
    if (isStaticImport(src)) {
      const staticImageData = isStaticRequire(src) ? src.default : src;
      if (!staticImageData.src) {
        throw new Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received " + JSON.stringify(staticImageData));
      }
      if (!staticImageData.height || !staticImageData.width) {
        throw new Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received " + JSON.stringify(staticImageData));
      }
      blurWidth = staticImageData.blurWidth;
      blurHeight = staticImageData.blurHeight;
      blurDataURL = blurDataURL || staticImageData.blurDataURL;
      staticSrc = staticImageData.src;
      if (!fill) {
        if (!widthInt && !heightInt) {
          widthInt = staticImageData.width;
          heightInt = staticImageData.height;
        } else if (widthInt && !heightInt) {
          const ratio = widthInt / staticImageData.width;
          heightInt = Math.round(staticImageData.height * ratio);
        } else if (!widthInt && heightInt) {
          const ratio = heightInt / staticImageData.height;
          widthInt = Math.round(staticImageData.width * ratio);
        }
      }
    }
    src = typeof src === "string" ? src : staticSrc;
    let isLazy = !priority && (loading === "lazy" || typeof loading === "undefined");
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
      unoptimized = true;
      isLazy = false;
    }
    if (config.unoptimized) {
      unoptimized = true;
    }
    if (isDefaultLoader && src.endsWith(".svg") && !config.dangerouslyAllowSVG) {
      unoptimized = true;
    }
    if (priority) {
      fetchPriority = "high";
    }
    const qualityInt = getInt(quality);
    const imgStyle = Object.assign(fill ? {
      position: "absolute",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      objectFit,
      objectPosition
    } : {}, showAltText ? {} : {
      color: "transparent"
    }, style);
    const backgroundImage = !blurComplete && placeholder !== "empty" ? placeholder === "blur" ? 'url("data:image/svg+xml;charset=utf-8,' + (0, _imageblursvg.getImageBlurSvg)({
      widthInt,
      heightInt,
      blurWidth,
      blurHeight,
      blurDataURL: blurDataURL || "",
      objectFit: imgStyle.objectFit
    }) + '")' : 'url("' + placeholder + '")' : null;
    let placeholderStyle = backgroundImage ? {
      backgroundSize: imgStyle.objectFit || "cover",
      backgroundPosition: imgStyle.objectPosition || "50% 50%",
      backgroundRepeat: "no-repeat",
      backgroundImage
    } : {};
    const imgAttributes = generateImgAttrs({
      config,
      src,
      unoptimized,
      width: widthInt,
      quality: qualityInt,
      sizes,
      loader
    });
    const props = {
      ...rest,
      loading: isLazy ? "lazy" : loading,
      fetchPriority,
      width: widthInt,
      height: heightInt,
      decoding: "async",
      className,
      style: {
        ...imgStyle,
        ...placeholderStyle
      },
      sizes: imgAttributes.sizes,
      srcSet: imgAttributes.srcSet,
      src: overrideSrc || imgAttributes.src
    };
    const meta = {
      unoptimized,
      priority,
      placeholder,
      fill
    };
    return {
      props,
      meta
    };
  }
})(getImgProps);
var imageComponent = { exports: {} };
var _interop_require_wildcard$1 = {};
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function")
    return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
_interop_require_wildcard$1._ = _interop_require_wildcard$1._interop_require_wildcard = _interop_require_wildcard;
function _interop_require_wildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule)
    return obj;
  if (obj === null || typeof obj !== "object" && typeof obj !== "function")
    return { default: obj };
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj))
    return cache.get(obj);
  var newObj = { __proto__: null };
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set))
        Object.defineProperty(newObj, key, desc);
      else
        newObj[key] = obj[key];
    }
  }
  newObj.default = obj;
  if (cache)
    cache.set(obj, newObj);
  return newObj;
}
var head = { exports: {} };
var sideEffect = {};
var hasRequiredSideEffect;
function requireSideEffect() {
  if (hasRequiredSideEffect)
    return sideEffect;
  hasRequiredSideEffect = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "default", {
      enumerable: true,
      get: function() {
        return SideEffect;
      }
    });
    const _react = reactExports;
    const isServer = typeof window === "undefined";
    const useClientOnlyLayoutEffect = isServer ? () => {
    } : _react.useLayoutEffect;
    const useClientOnlyEffect = isServer ? () => {
    } : _react.useEffect;
    function SideEffect(props) {
      const { headManager, reduceComponentsToState } = props;
      function emitChange() {
        if (headManager && headManager.mountedInstances) {
          const headElements = _react.Children.toArray(Array.from(headManager.mountedInstances).filter(Boolean));
          headManager.updateHead(reduceComponentsToState(headElements, props));
        }
      }
      if (isServer) {
        var _headManager_mountedInstances;
        headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.add(props.children);
        emitChange();
      }
      useClientOnlyLayoutEffect(() => {
        var _headManager_mountedInstances2;
        headManager == null ? void 0 : (_headManager_mountedInstances2 = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances2.add(props.children);
        return () => {
          var _headManager_mountedInstances3;
          headManager == null ? void 0 : (_headManager_mountedInstances3 = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances3.delete(props.children);
        };
      });
      useClientOnlyLayoutEffect(() => {
        if (headManager) {
          headManager._pendingUpdate = emitChange;
        }
        return () => {
          if (headManager) {
            headManager._pendingUpdate = emitChange;
          }
        };
      });
      useClientOnlyEffect(() => {
        if (headManager && headManager._pendingUpdate) {
          headManager._pendingUpdate();
          headManager._pendingUpdate = null;
        }
        return () => {
          if (headManager && headManager._pendingUpdate) {
            headManager._pendingUpdate();
            headManager._pendingUpdate = null;
          }
        };
      });
      return null;
    }
  })(sideEffect);
  return sideEffect;
}
var ampContext_sharedRuntime = {};
var hasRequiredAmpContext_sharedRuntime;
function requireAmpContext_sharedRuntime() {
  if (hasRequiredAmpContext_sharedRuntime)
    return ampContext_sharedRuntime;
  hasRequiredAmpContext_sharedRuntime = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "AmpStateContext", {
      enumerable: true,
      get: function() {
        return AmpStateContext;
      }
    });
    const _interop_require_default2 = _interop_require_default$1;
    const _react = /* @__PURE__ */ _interop_require_default2._(reactExports);
    const AmpStateContext = _react.default.createContext({});
  })(ampContext_sharedRuntime);
  return ampContext_sharedRuntime;
}
var headManagerContext_sharedRuntime = {};
var hasRequiredHeadManagerContext_sharedRuntime;
function requireHeadManagerContext_sharedRuntime() {
  if (hasRequiredHeadManagerContext_sharedRuntime)
    return headManagerContext_sharedRuntime;
  hasRequiredHeadManagerContext_sharedRuntime = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "HeadManagerContext", {
      enumerable: true,
      get: function() {
        return HeadManagerContext;
      }
    });
    const _interop_require_default2 = _interop_require_default$1;
    const _react = /* @__PURE__ */ _interop_require_default2._(reactExports);
    const HeadManagerContext = _react.default.createContext({});
  })(headManagerContext_sharedRuntime);
  return headManagerContext_sharedRuntime;
}
var ampMode = {};
var hasRequiredAmpMode;
function requireAmpMode() {
  if (hasRequiredAmpMode)
    return ampMode;
  hasRequiredAmpMode = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "isInAmpMode", {
      enumerable: true,
      get: function() {
        return isInAmpMode;
      }
    });
    function isInAmpMode(param) {
      let { ampFirst = false, hybrid = false, hasQuery = false } = param === void 0 ? {} : param;
      return ampFirst || hybrid && hasQuery;
    }
  })(ampMode);
  return ampMode;
}
var hasRequiredHead;
function requireHead() {
  if (hasRequiredHead)
    return head.exports;
  hasRequiredHead = 1;
  (function(module, exports) {
    "use client";
    var define_process_env_default = { ACLOCAL_PATH: "/mingw64/share/aclocal:/usr/share/aclocal", ALLUSERSPROFILE: "C:\\ProgramData", APPDATA: "C:\\Users\\nguye\\AppData\\Roaming", BERRY_BIN_FOLDER: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df", CHROME_CRASHPAD_PIPE_NAME: "\\\\.\\pipe\\crashpad_17588_OUJZIQANJWJSIJPB", COLORTERM: "truecolor", COMMONPROGRAMFILES: "C:\\Program Files\\Common Files", "CommonProgramFiles(x86)": "C:\\Program Files (x86)\\Common Files", CommonProgramW6432: "C:\\Program Files\\Common Files", COMPUTERNAME: "VANPC", COMSPEC: "C:\\WINDOWS\\system32\\cmd.exe", CONFIG_SITE: "/etc/config.site", DISPLAY: "needs-to-be-defined", DriverData: "C:\\Windows\\System32\\Drivers\\DriverData", EXEPATH: "C:\\Program Files\\Git\\bin", FORCE_COLOR: "true", GIT_ASKPASS: "c:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\extensions\\git\\dist\\askpass.sh", HOME: "C:\\Users\\nguye", HOMEDRIVE: "C:", HOMEPATH: "\\Users\\nguye", HOSTNAME: "VanPC", INFOPATH: "/mingw64/local/info:/mingw64/share/info:/usr/local/info:/usr/share/info:/usr/info:/share/info", INIT_CWD: "D:\\GithubProjects\\genshin-optimizer", LANG: "en_US.UTF-8", LERNA_PACKAGE_NAME: "frontend", LOCALAPPDATA: "C:\\Users\\nguye\\AppData\\Local", LOGONSERVER: "\\\\VANPC", MANPATH: "/mingw64/local/man:/mingw64/share/man:/usr/local/man:/usr/share/man:/usr/man:/share/man", MINGW_CHOST: "x86_64-w64-mingw32", MINGW_PACKAGE_PREFIX: "mingw-w64-x86_64", MINGW_PREFIX: "/mingw64", MSYS: "disable_pcon", MSYSTEM: "MINGW64", MSYSTEM_CARCH: "x86_64", MSYSTEM_CHOST: "x86_64-w64-mingw32", MSYSTEM_PREFIX: "/mingw64", NODE_ENV: "production", npm_config_user_agent: "yarn/3.4.1 npm/? node/v21.6.1 win32 x64", npm_execpath: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df\\yarn", npm_node_execpath: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df\\node", npm_package_json: "D:\\GithubProjects\\genshin-optimizer\\package.json", npm_package_name: "genshin-optimizer", npm_package_version: "10.10.1", NUMBER_OF_PROCESSORS: "12", NX_CLI_SET: "true", NX_GA_TRACKINGID: "UA-000000-01", NX_LOAD_DOT_ENV_FILES: "true", NX_TASK_HASH: "14845748941812439306", NX_TASK_TARGET_PROJECT: "frontend", NX_TASK_TARGET_TARGET: "build", NX_URLS_GUIDES: "[]", NX_URL_DISCORD_GDEV: "https://discord.com/", NX_URL_DISCORD_GO: "https://discord.com/", NX_URL_GITHUB_API_GO_RELEASES: "https://api.github.com/repos///releases/tags/", NX_URL_GITHUB_FRZYC: "https://github.com/", NX_URL_GITHUB_GO: "https://github.com/", NX_URL_GITHUB_GO_CURRENT_VERSION: "", NX_URL_GITHUB_LANTUA: "https://github.com/", NX_URL_GITHUB_VAN: "https://github.com/", NX_URL_KQM_MULTI_GUIDE: "https://keqingmains.com/misc/multi-optimization/", NX_URL_PATREON_FRZYC: "https://www.patreon.com/", NX_URL_PAYPAL_FRZYC: "https://www.paypal.com/", NX_URL_TWITCH_FRZYC: "https://www.twitch.tv/", NX_URL_TWITTER_FRZYC: "https://twitter.com/frzyc", NX_URL_WEBSITE_KQM: "https://keqingmains.com/", NX_URL_YOUTUBE_TUTPL: "https://www.youtube.com/", NX_WORKSPACE_ROOT: "D:\\GithubProjects\\genshin-optimizer", OLDPWD: "/d/GithubProjects/genshin-optimizer/dist/apps/somnia", OneDrive: "C:\\Users\\nguye\\OneDrive", OneDriveConsumer: "C:\\Users\\nguye\\OneDrive", ORIGINAL_PATH: "C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Users\\nguye\\bin;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0;C:\\WINDOWS\\System32\\OpenSSH;C:\\Program Files\\nodejs;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet;C:\\Program Files\\PowerShell\\7;C:\\Users\\nguye\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\nguye\\AppData\\Roaming\\npm;C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Users\\nguye\\.dotnet\\tools", ORIGINAL_TEMP: "/tmp", ORIGINAL_TMP: "/tmp", ORIGINAL_XDG_CURRENT_DESKTOP: "undefined", OS: "Windows_NT", PATH: "D:\\GithubProjects\\genshin-optimizer\\apps\\frontend\\node_modules\\.bin;D:\\GithubProjects\\genshin-optimizer\\apps\\node_modules\\.bin;D:\\GithubProjects\\genshin-optimizer\\node_modules\\.bin;D:\\GithubProjects\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\Program Files\\nodejs;C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df;C:\\Users\\nguye\\.yarn\\bin;C:\\Users\\nguye\\.config\\yarn\\global\\node_modules\\.bin;C:\\Users\\nguye\\bin;C:\\Users\\nguye\\bin;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\local\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Users\\nguye\\bin;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0;C:\\WINDOWS\\System32\\OpenSSH;C:\\Program Files\\nodejs;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet;C:\\Program Files\\PowerShell\\7;C:\\Users\\nguye\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\nguye\\AppData\\Roaming\\npm;C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Users\\nguye\\.dotnet\\tools;C:\\Program Files\\Git\\usr\\bin\\vendor_perl;C:\\Program Files\\Git\\usr\\bin\\core_perl", PATHEXT: ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JSE;.WSF;.WSH;.MSC", PKG_CONFIG_PATH: "/mingw64/lib/pkgconfig:/mingw64/share/pkgconfig", PKG_CONFIG_SYSTEM_INCLUDE_PATH: "/mingw64/include", PKG_CONFIG_SYSTEM_LIBRARY_PATH: "/mingw64/lib", PLINK_PROTOCOL: "ssh", POWERSHELL_DISTRIBUTION_CHANNEL: "MSI:Windows 10 Pro", PROCESSOR_ARCHITECTURE: "AMD64", PROCESSOR_IDENTIFIER: "AMD64 Family 23 Model 8 Stepping 2, AuthenticAMD", PROCESSOR_LEVEL: "23", PROCESSOR_REVISION: "0802", ProgramData: "C:\\ProgramData", PROGRAMFILES: "C:\\Program Files", "ProgramFiles(x86)": "C:\\Program Files (x86)", ProgramW6432: "C:\\Program Files", PROJECT_CWD: "D:\\GithubProjects\\genshin-optimizer", PROMPT: "$P$G", PSModulePath: "C:\\Program Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules", PUBLIC: "C:\\Users\\Public", PWD: "D:\\GithubProjects\\genshin-optimizer", SESSIONNAME: "Console", SHELL: "C:\\Program Files\\Git\\usr\\bin\\bash.exe", SHLVL: "2", SSH_ASKPASS: "/mingw64/bin/git-askpass.exe", SYSTEMDRIVE: "C:", SYSTEMROOT: "C:\\WINDOWS", TEMP: "C:\\Users\\nguye\\AppData\\Local\\Temp", TERM_PROGRAM: "vscode", TERM_PROGRAM_VERSION: "1.91.1", TMP: "C:\\Users\\nguye\\AppData\\Local\\Temp", TMPDIR: "C:\\Users\\nguye\\AppData\\Local\\Temp", USERDOMAIN: "VANPC", USERDOMAIN_ROAMINGPROFILE: "VANPC", USERNAME: "nguye", USERPROFILE: "C:\\Users\\nguye", VSCODE_GIT_ASKPASS_EXTRA_ARGS: "", VSCODE_GIT_ASKPASS_MAIN: "c:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\extensions\\git\\dist\\askpass-main.js", VSCODE_GIT_ASKPASS_NODE: "C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe", VSCODE_GIT_IPC_HANDLE: "\\\\.\\pipe\\vscode-git-2726f81895-sock", WINDIR: "C:\\WINDOWS", _: "/usr/bin/winpty" };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _export(target, all) {
      for (var name in all)
        Object.defineProperty(target, name, {
          enumerable: true,
          get: all[name]
        });
    }
    _export(exports, {
      default: function() {
        return _default;
      },
      defaultHead: function() {
        return defaultHead;
      }
    });
    const _interop_require_default2 = _interop_require_default$1;
    const _interop_require_wildcard2 = _interop_require_wildcard$1;
    const _jsxruntime = jsxRuntimeExports;
    const _react = /* @__PURE__ */ _interop_require_wildcard2._(reactExports);
    const _sideeffect = /* @__PURE__ */ _interop_require_default2._(requireSideEffect());
    const _ampcontextsharedruntime = requireAmpContext_sharedRuntime();
    const _headmanagercontextsharedruntime = requireHeadManagerContext_sharedRuntime();
    const _ampmode = requireAmpMode();
    function defaultHead(inAmpMode) {
      if (inAmpMode === void 0)
        inAmpMode = false;
      const head2 = [
        /* @__PURE__ */ (0, _jsxruntime.jsx)("meta", {
          charSet: "utf-8"
        })
      ];
      if (!inAmpMode) {
        head2.push(/* @__PURE__ */ (0, _jsxruntime.jsx)("meta", {
          name: "viewport",
          content: "width=device-width"
        }));
      }
      return head2;
    }
    function onlyReactElement(list, child) {
      if (typeof child === "string" || typeof child === "number") {
        return list;
      }
      if (child.type === _react.default.Fragment) {
        return list.concat(
          // @ts-expect-error @types/react does not remove fragments but this could also return ReactPortal[]
          _react.default.Children.toArray(child.props.children).reduce(
            // @ts-expect-error @types/react does not remove fragments but this could also return ReactPortal[]
            (fragmentList, fragmentChild) => {
              if (typeof fragmentChild === "string" || typeof fragmentChild === "number") {
                return fragmentList;
              }
              return fragmentList.concat(fragmentChild);
            },
            []
          )
        );
      }
      return list.concat(child);
    }
    const METATYPES = [
      "name",
      "httpEquiv",
      "charSet",
      "itemProp"
    ];
    function unique() {
      const keys = /* @__PURE__ */ new Set();
      const tags = /* @__PURE__ */ new Set();
      const metaTypes = /* @__PURE__ */ new Set();
      const metaCategories = {};
      return (h) => {
        let isUnique = true;
        let hasKey = false;
        if (h.key && typeof h.key !== "number" && h.key.indexOf("$") > 0) {
          hasKey = true;
          const key = h.key.slice(h.key.indexOf("$") + 1);
          if (keys.has(key)) {
            isUnique = false;
          } else {
            keys.add(key);
          }
        }
        switch (h.type) {
          case "title":
          case "base":
            if (tags.has(h.type)) {
              isUnique = false;
            } else {
              tags.add(h.type);
            }
            break;
          case "meta":
            for (let i = 0, len = METATYPES.length; i < len; i++) {
              const metatype = METATYPES[i];
              if (!h.props.hasOwnProperty(metatype))
                continue;
              if (metatype === "charSet") {
                if (metaTypes.has(metatype)) {
                  isUnique = false;
                } else {
                  metaTypes.add(metatype);
                }
              } else {
                const category = h.props[metatype];
                const categories = metaCategories[metatype] || /* @__PURE__ */ new Set();
                if ((metatype !== "name" || !hasKey) && categories.has(category)) {
                  isUnique = false;
                } else {
                  categories.add(category);
                  metaCategories[metatype] = categories;
                }
              }
            }
            break;
        }
        return isUnique;
      };
    }
    function reduceComponents(headChildrenElements, props) {
      const { inAmpMode } = props;
      return headChildrenElements.reduce(onlyReactElement, []).reverse().concat(defaultHead(inAmpMode).reverse()).filter(unique()).reverse().map((c, i) => {
        const key = c.key || i;
        if (define_process_env_default.__NEXT_OPTIMIZE_FONTS && !inAmpMode) {
          if (c.type === "link" && c.props["href"] && // TODO(prateekbh@): Replace this with const from `constants` when the tree shaking works.
          [
            "https://fonts.googleapis.com/css",
            "https://use.typekit.net/"
          ].some((url) => c.props["href"].startsWith(url))) {
            const newProps = {
              ...c.props || {}
            };
            newProps["data-href"] = newProps["href"];
            newProps["href"] = void 0;
            newProps["data-optimized-fonts"] = true;
            return /* @__PURE__ */ _react.default.cloneElement(c, newProps);
          }
        }
        return /* @__PURE__ */ _react.default.cloneElement(c, {
          key
        });
      });
    }
    function Head(param) {
      let { children } = param;
      const ampState = (0, _react.useContext)(_ampcontextsharedruntime.AmpStateContext);
      const headManager = (0, _react.useContext)(_headmanagercontextsharedruntime.HeadManagerContext);
      return /* @__PURE__ */ (0, _jsxruntime.jsx)(_sideeffect.default, {
        reduceComponentsToState: reduceComponents,
        headManager,
        inAmpMode: (0, _ampmode.isInAmpMode)(ampState),
        children
      });
    }
    const _default = Head;
    if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
      Object.defineProperty(exports.default, "__esModule", { value: true });
      Object.assign(exports.default, exports);
      module.exports = exports.default;
    }
  })(head, head.exports);
  return head.exports;
}
var imageConfigContext_sharedRuntime = {};
var hasRequiredImageConfigContext_sharedRuntime;
function requireImageConfigContext_sharedRuntime() {
  if (hasRequiredImageConfigContext_sharedRuntime)
    return imageConfigContext_sharedRuntime;
  hasRequiredImageConfigContext_sharedRuntime = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "ImageConfigContext", {
      enumerable: true,
      get: function() {
        return ImageConfigContext;
      }
    });
    const _interop_require_default2 = _interop_require_default$1;
    const _react = /* @__PURE__ */ _interop_require_default2._(reactExports);
    const _imageconfig = imageConfig;
    const ImageConfigContext = _react.default.createContext(_imageconfig.imageConfigDefault);
  })(imageConfigContext_sharedRuntime);
  return imageConfigContext_sharedRuntime;
}
var routerContext_sharedRuntime = {};
var hasRequiredRouterContext_sharedRuntime;
function requireRouterContext_sharedRuntime() {
  if (hasRequiredRouterContext_sharedRuntime)
    return routerContext_sharedRuntime;
  hasRequiredRouterContext_sharedRuntime = 1;
  (function(exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "RouterContext", {
      enumerable: true,
      get: function() {
        return RouterContext;
      }
    });
    const _interop_require_default2 = _interop_require_default$1;
    const _react = /* @__PURE__ */ _interop_require_default2._(reactExports);
    const RouterContext = _react.default.createContext(null);
  })(routerContext_sharedRuntime);
  return routerContext_sharedRuntime;
}
var imageLoader = {};
var hasRequiredImageLoader;
function requireImageLoader() {
  if (hasRequiredImageLoader)
    return imageLoader;
  hasRequiredImageLoader = 1;
  (function(exports) {
    var define_process_env_default = { ACLOCAL_PATH: "/mingw64/share/aclocal:/usr/share/aclocal", ALLUSERSPROFILE: "C:\\ProgramData", APPDATA: "C:\\Users\\nguye\\AppData\\Roaming", BERRY_BIN_FOLDER: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df", CHROME_CRASHPAD_PIPE_NAME: "\\\\.\\pipe\\crashpad_17588_OUJZIQANJWJSIJPB", COLORTERM: "truecolor", COMMONPROGRAMFILES: "C:\\Program Files\\Common Files", "CommonProgramFiles(x86)": "C:\\Program Files (x86)\\Common Files", CommonProgramW6432: "C:\\Program Files\\Common Files", COMPUTERNAME: "VANPC", COMSPEC: "C:\\WINDOWS\\system32\\cmd.exe", CONFIG_SITE: "/etc/config.site", DISPLAY: "needs-to-be-defined", DriverData: "C:\\Windows\\System32\\Drivers\\DriverData", EXEPATH: "C:\\Program Files\\Git\\bin", FORCE_COLOR: "true", GIT_ASKPASS: "c:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\extensions\\git\\dist\\askpass.sh", HOME: "C:\\Users\\nguye", HOMEDRIVE: "C:", HOMEPATH: "\\Users\\nguye", HOSTNAME: "VanPC", INFOPATH: "/mingw64/local/info:/mingw64/share/info:/usr/local/info:/usr/share/info:/usr/info:/share/info", INIT_CWD: "D:\\GithubProjects\\genshin-optimizer", LANG: "en_US.UTF-8", LERNA_PACKAGE_NAME: "frontend", LOCALAPPDATA: "C:\\Users\\nguye\\AppData\\Local", LOGONSERVER: "\\\\VANPC", MANPATH: "/mingw64/local/man:/mingw64/share/man:/usr/local/man:/usr/share/man:/usr/man:/share/man", MINGW_CHOST: "x86_64-w64-mingw32", MINGW_PACKAGE_PREFIX: "mingw-w64-x86_64", MINGW_PREFIX: "/mingw64", MSYS: "disable_pcon", MSYSTEM: "MINGW64", MSYSTEM_CARCH: "x86_64", MSYSTEM_CHOST: "x86_64-w64-mingw32", MSYSTEM_PREFIX: "/mingw64", NODE_ENV: "production", npm_config_user_agent: "yarn/3.4.1 npm/? node/v21.6.1 win32 x64", npm_execpath: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df\\yarn", npm_node_execpath: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df\\node", npm_package_json: "D:\\GithubProjects\\genshin-optimizer\\package.json", npm_package_name: "genshin-optimizer", npm_package_version: "10.10.1", NUMBER_OF_PROCESSORS: "12", NX_CLI_SET: "true", NX_GA_TRACKINGID: "UA-000000-01", NX_LOAD_DOT_ENV_FILES: "true", NX_TASK_HASH: "14845748941812439306", NX_TASK_TARGET_PROJECT: "frontend", NX_TASK_TARGET_TARGET: "build", NX_URLS_GUIDES: "[]", NX_URL_DISCORD_GDEV: "https://discord.com/", NX_URL_DISCORD_GO: "https://discord.com/", NX_URL_GITHUB_API_GO_RELEASES: "https://api.github.com/repos///releases/tags/", NX_URL_GITHUB_FRZYC: "https://github.com/", NX_URL_GITHUB_GO: "https://github.com/", NX_URL_GITHUB_GO_CURRENT_VERSION: "", NX_URL_GITHUB_LANTUA: "https://github.com/", NX_URL_GITHUB_VAN: "https://github.com/", NX_URL_KQM_MULTI_GUIDE: "https://keqingmains.com/misc/multi-optimization/", NX_URL_PATREON_FRZYC: "https://www.patreon.com/", NX_URL_PAYPAL_FRZYC: "https://www.paypal.com/", NX_URL_TWITCH_FRZYC: "https://www.twitch.tv/", NX_URL_TWITTER_FRZYC: "https://twitter.com/frzyc", NX_URL_WEBSITE_KQM: "https://keqingmains.com/", NX_URL_YOUTUBE_TUTPL: "https://www.youtube.com/", NX_WORKSPACE_ROOT: "D:\\GithubProjects\\genshin-optimizer", OLDPWD: "/d/GithubProjects/genshin-optimizer/dist/apps/somnia", OneDrive: "C:\\Users\\nguye\\OneDrive", OneDriveConsumer: "C:\\Users\\nguye\\OneDrive", ORIGINAL_PATH: "C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Users\\nguye\\bin;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0;C:\\WINDOWS\\System32\\OpenSSH;C:\\Program Files\\nodejs;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet;C:\\Program Files\\PowerShell\\7;C:\\Users\\nguye\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\nguye\\AppData\\Roaming\\npm;C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Users\\nguye\\.dotnet\\tools", ORIGINAL_TEMP: "/tmp", ORIGINAL_TMP: "/tmp", ORIGINAL_XDG_CURRENT_DESKTOP: "undefined", OS: "Windows_NT", PATH: "D:\\GithubProjects\\genshin-optimizer\\apps\\frontend\\node_modules\\.bin;D:\\GithubProjects\\genshin-optimizer\\apps\\node_modules\\.bin;D:\\GithubProjects\\genshin-optimizer\\node_modules\\.bin;D:\\GithubProjects\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\Program Files\\nodejs;C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df;C:\\Users\\nguye\\.yarn\\bin;C:\\Users\\nguye\\.config\\yarn\\global\\node_modules\\.bin;C:\\Users\\nguye\\bin;C:\\Users\\nguye\\bin;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\local\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Users\\nguye\\bin;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0;C:\\WINDOWS\\System32\\OpenSSH;C:\\Program Files\\nodejs;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet;C:\\Program Files\\PowerShell\\7;C:\\Users\\nguye\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\nguye\\AppData\\Roaming\\npm;C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Users\\nguye\\.dotnet\\tools;C:\\Program Files\\Git\\usr\\bin\\vendor_perl;C:\\Program Files\\Git\\usr\\bin\\core_perl", PATHEXT: ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JSE;.WSF;.WSH;.MSC", PKG_CONFIG_PATH: "/mingw64/lib/pkgconfig:/mingw64/share/pkgconfig", PKG_CONFIG_SYSTEM_INCLUDE_PATH: "/mingw64/include", PKG_CONFIG_SYSTEM_LIBRARY_PATH: "/mingw64/lib", PLINK_PROTOCOL: "ssh", POWERSHELL_DISTRIBUTION_CHANNEL: "MSI:Windows 10 Pro", PROCESSOR_ARCHITECTURE: "AMD64", PROCESSOR_IDENTIFIER: "AMD64 Family 23 Model 8 Stepping 2, AuthenticAMD", PROCESSOR_LEVEL: "23", PROCESSOR_REVISION: "0802", ProgramData: "C:\\ProgramData", PROGRAMFILES: "C:\\Program Files", "ProgramFiles(x86)": "C:\\Program Files (x86)", ProgramW6432: "C:\\Program Files", PROJECT_CWD: "D:\\GithubProjects\\genshin-optimizer", PROMPT: "$P$G", PSModulePath: "C:\\Program Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules", PUBLIC: "C:\\Users\\Public", PWD: "D:\\GithubProjects\\genshin-optimizer", SESSIONNAME: "Console", SHELL: "C:\\Program Files\\Git\\usr\\bin\\bash.exe", SHLVL: "2", SSH_ASKPASS: "/mingw64/bin/git-askpass.exe", SYSTEMDRIVE: "C:", SYSTEMROOT: "C:\\WINDOWS", TEMP: "C:\\Users\\nguye\\AppData\\Local\\Temp", TERM_PROGRAM: "vscode", TERM_PROGRAM_VERSION: "1.91.1", TMP: "C:\\Users\\nguye\\AppData\\Local\\Temp", TMPDIR: "C:\\Users\\nguye\\AppData\\Local\\Temp", USERDOMAIN: "VANPC", USERDOMAIN_ROAMINGPROFILE: "VANPC", USERNAME: "nguye", USERPROFILE: "C:\\Users\\nguye", VSCODE_GIT_ASKPASS_EXTRA_ARGS: "", VSCODE_GIT_ASKPASS_MAIN: "c:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\extensions\\git\\dist\\askpass-main.js", VSCODE_GIT_ASKPASS_NODE: "C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe", VSCODE_GIT_IPC_HANDLE: "\\\\.\\pipe\\vscode-git-2726f81895-sock", WINDIR: "C:\\WINDOWS", _: "/usr/bin/winpty" };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "default", {
      enumerable: true,
      get: function() {
        return _default;
      }
    });
    function defaultLoader(param) {
      let { config, src, width, quality } = param;
      return config.path + "?url=" + encodeURIComponent(src) + "&w=" + width + "&q=" + (quality || 75) + (define_process_env_default.NEXT_DEPLOYMENT_ID ? "&dpl=" + define_process_env_default.NEXT_DEPLOYMENT_ID : "");
    }
    defaultLoader.__next_img_default = true;
    const _default = defaultLoader;
  })(imageLoader);
  return imageLoader;
}
(function(module, exports) {
  "use client";
  var define_process_env_default = { ACLOCAL_PATH: "/mingw64/share/aclocal:/usr/share/aclocal", ALLUSERSPROFILE: "C:\\ProgramData", APPDATA: "C:\\Users\\nguye\\AppData\\Roaming", BERRY_BIN_FOLDER: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df", CHROME_CRASHPAD_PIPE_NAME: "\\\\.\\pipe\\crashpad_17588_OUJZIQANJWJSIJPB", COLORTERM: "truecolor", COMMONPROGRAMFILES: "C:\\Program Files\\Common Files", "CommonProgramFiles(x86)": "C:\\Program Files (x86)\\Common Files", CommonProgramW6432: "C:\\Program Files\\Common Files", COMPUTERNAME: "VANPC", COMSPEC: "C:\\WINDOWS\\system32\\cmd.exe", CONFIG_SITE: "/etc/config.site", DISPLAY: "needs-to-be-defined", DriverData: "C:\\Windows\\System32\\Drivers\\DriverData", EXEPATH: "C:\\Program Files\\Git\\bin", FORCE_COLOR: "true", GIT_ASKPASS: "c:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\extensions\\git\\dist\\askpass.sh", HOME: "C:\\Users\\nguye", HOMEDRIVE: "C:", HOMEPATH: "\\Users\\nguye", HOSTNAME: "VanPC", INFOPATH: "/mingw64/local/info:/mingw64/share/info:/usr/local/info:/usr/share/info:/usr/info:/share/info", INIT_CWD: "D:\\GithubProjects\\genshin-optimizer", LANG: "en_US.UTF-8", LERNA_PACKAGE_NAME: "frontend", LOCALAPPDATA: "C:\\Users\\nguye\\AppData\\Local", LOGONSERVER: "\\\\VANPC", MANPATH: "/mingw64/local/man:/mingw64/share/man:/usr/local/man:/usr/share/man:/usr/man:/share/man", MINGW_CHOST: "x86_64-w64-mingw32", MINGW_PACKAGE_PREFIX: "mingw-w64-x86_64", MINGW_PREFIX: "/mingw64", MSYS: "disable_pcon", MSYSTEM: "MINGW64", MSYSTEM_CARCH: "x86_64", MSYSTEM_CHOST: "x86_64-w64-mingw32", MSYSTEM_PREFIX: "/mingw64", NODE_ENV: "production", npm_config_user_agent: "yarn/3.4.1 npm/? node/v21.6.1 win32 x64", npm_execpath: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df\\yarn", npm_node_execpath: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df\\node", npm_package_json: "D:\\GithubProjects\\genshin-optimizer\\package.json", npm_package_name: "genshin-optimizer", npm_package_version: "10.10.1", NUMBER_OF_PROCESSORS: "12", NX_CLI_SET: "true", NX_GA_TRACKINGID: "UA-000000-01", NX_LOAD_DOT_ENV_FILES: "true", NX_TASK_HASH: "14845748941812439306", NX_TASK_TARGET_PROJECT: "frontend", NX_TASK_TARGET_TARGET: "build", NX_URLS_GUIDES: "[]", NX_URL_DISCORD_GDEV: "https://discord.com/", NX_URL_DISCORD_GO: "https://discord.com/", NX_URL_GITHUB_API_GO_RELEASES: "https://api.github.com/repos///releases/tags/", NX_URL_GITHUB_FRZYC: "https://github.com/", NX_URL_GITHUB_GO: "https://github.com/", NX_URL_GITHUB_GO_CURRENT_VERSION: "", NX_URL_GITHUB_LANTUA: "https://github.com/", NX_URL_GITHUB_VAN: "https://github.com/", NX_URL_KQM_MULTI_GUIDE: "https://keqingmains.com/misc/multi-optimization/", NX_URL_PATREON_FRZYC: "https://www.patreon.com/", NX_URL_PAYPAL_FRZYC: "https://www.paypal.com/", NX_URL_TWITCH_FRZYC: "https://www.twitch.tv/", NX_URL_TWITTER_FRZYC: "https://twitter.com/frzyc", NX_URL_WEBSITE_KQM: "https://keqingmains.com/", NX_URL_YOUTUBE_TUTPL: "https://www.youtube.com/", NX_WORKSPACE_ROOT: "D:\\GithubProjects\\genshin-optimizer", OLDPWD: "/d/GithubProjects/genshin-optimizer/dist/apps/somnia", OneDrive: "C:\\Users\\nguye\\OneDrive", OneDriveConsumer: "C:\\Users\\nguye\\OneDrive", ORIGINAL_PATH: "C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Users\\nguye\\bin;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0;C:\\WINDOWS\\System32\\OpenSSH;C:\\Program Files\\nodejs;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet;C:\\Program Files\\PowerShell\\7;C:\\Users\\nguye\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\nguye\\AppData\\Roaming\\npm;C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Users\\nguye\\.dotnet\\tools", ORIGINAL_TEMP: "/tmp", ORIGINAL_TMP: "/tmp", ORIGINAL_XDG_CURRENT_DESKTOP: "undefined", OS: "Windows_NT", PATH: "D:\\GithubProjects\\genshin-optimizer\\apps\\frontend\\node_modules\\.bin;D:\\GithubProjects\\genshin-optimizer\\apps\\node_modules\\.bin;D:\\GithubProjects\\genshin-optimizer\\node_modules\\.bin;D:\\GithubProjects\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\Program Files\\nodejs;C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df;C:\\Users\\nguye\\.yarn\\bin;C:\\Users\\nguye\\.config\\yarn\\global\\node_modules\\.bin;C:\\Users\\nguye\\bin;C:\\Users\\nguye\\bin;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\local\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Users\\nguye\\bin;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0;C:\\WINDOWS\\System32\\OpenSSH;C:\\Program Files\\nodejs;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet;C:\\Program Files\\PowerShell\\7;C:\\Users\\nguye\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\nguye\\AppData\\Roaming\\npm;C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Users\\nguye\\.dotnet\\tools;C:\\Program Files\\Git\\usr\\bin\\vendor_perl;C:\\Program Files\\Git\\usr\\bin\\core_perl", PATHEXT: ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JSE;.WSF;.WSH;.MSC", PKG_CONFIG_PATH: "/mingw64/lib/pkgconfig:/mingw64/share/pkgconfig", PKG_CONFIG_SYSTEM_INCLUDE_PATH: "/mingw64/include", PKG_CONFIG_SYSTEM_LIBRARY_PATH: "/mingw64/lib", PLINK_PROTOCOL: "ssh", POWERSHELL_DISTRIBUTION_CHANNEL: "MSI:Windows 10 Pro", PROCESSOR_ARCHITECTURE: "AMD64", PROCESSOR_IDENTIFIER: "AMD64 Family 23 Model 8 Stepping 2, AuthenticAMD", PROCESSOR_LEVEL: "23", PROCESSOR_REVISION: "0802", ProgramData: "C:\\ProgramData", PROGRAMFILES: "C:\\Program Files", "ProgramFiles(x86)": "C:\\Program Files (x86)", ProgramW6432: "C:\\Program Files", PROJECT_CWD: "D:\\GithubProjects\\genshin-optimizer", PROMPT: "$P$G", PSModulePath: "C:\\Program Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules", PUBLIC: "C:\\Users\\Public", PWD: "D:\\GithubProjects\\genshin-optimizer", SESSIONNAME: "Console", SHELL: "C:\\Program Files\\Git\\usr\\bin\\bash.exe", SHLVL: "2", SSH_ASKPASS: "/mingw64/bin/git-askpass.exe", SYSTEMDRIVE: "C:", SYSTEMROOT: "C:\\WINDOWS", TEMP: "C:\\Users\\nguye\\AppData\\Local\\Temp", TERM_PROGRAM: "vscode", TERM_PROGRAM_VERSION: "1.91.1", TMP: "C:\\Users\\nguye\\AppData\\Local\\Temp", TMPDIR: "C:\\Users\\nguye\\AppData\\Local\\Temp", USERDOMAIN: "VANPC", USERDOMAIN_ROAMINGPROFILE: "VANPC", USERNAME: "nguye", USERPROFILE: "C:\\Users\\nguye", VSCODE_GIT_ASKPASS_EXTRA_ARGS: "", VSCODE_GIT_ASKPASS_MAIN: "c:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\extensions\\git\\dist\\askpass-main.js", VSCODE_GIT_ASKPASS_NODE: "C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe", VSCODE_GIT_IPC_HANDLE: "\\\\.\\pipe\\vscode-git-2726f81895-sock", WINDIR: "C:\\WINDOWS", _: "/usr/bin/winpty" };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "Image", {
    enumerable: true,
    get: function() {
      return Image;
    }
  });
  const _interop_require_default2 = _interop_require_default$1;
  const _interop_require_wildcard2 = _interop_require_wildcard$1;
  const _jsxruntime = jsxRuntimeExports;
  const _react = /* @__PURE__ */ _interop_require_wildcard2._(reactExports);
  const _reactdom = /* @__PURE__ */ _interop_require_default2._(reactDomExports);
  const _head = /* @__PURE__ */ _interop_require_default2._(requireHead());
  const _getimgprops = getImgProps;
  const _imageconfig = imageConfig;
  const _imageconfigcontextsharedruntime = requireImageConfigContext_sharedRuntime();
  const _routercontextsharedruntime = requireRouterContext_sharedRuntime();
  const _imageloader = /* @__PURE__ */ _interop_require_default2._(requireImageLoader());
  const configEnv = define_process_env_default.__NEXT_IMAGE_OPTS;
  if (typeof window === "undefined") {
    globalThis.__NEXT_IMAGE_IMPORTED = true;
  }
  function handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput) {
    const src = img == null ? void 0 : img.src;
    if (!img || img["data-loaded-src"] === src) {
      return;
    }
    img["data-loaded-src"] = src;
    const p = "decode" in img ? img.decode() : Promise.resolve();
    p.catch(() => {
    }).then(() => {
      if (!img.parentElement || !img.isConnected) {
        return;
      }
      if (placeholder !== "empty") {
        setBlurComplete(true);
      }
      if (onLoadRef == null ? void 0 : onLoadRef.current) {
        const event = new Event("load");
        Object.defineProperty(event, "target", {
          writable: false,
          value: img
        });
        let prevented = false;
        let stopped = false;
        onLoadRef.current({
          ...event,
          nativeEvent: event,
          currentTarget: img,
          target: img,
          isDefaultPrevented: () => prevented,
          isPropagationStopped: () => stopped,
          persist: () => {
          },
          preventDefault: () => {
            prevented = true;
            event.preventDefault();
          },
          stopPropagation: () => {
            stopped = true;
            event.stopPropagation();
          }
        });
      }
      if (onLoadingCompleteRef == null ? void 0 : onLoadingCompleteRef.current) {
        onLoadingCompleteRef.current(img);
      }
    });
  }
  function getDynamicProps(fetchPriority) {
    const [majorStr, minorStr] = _react.version.split(".", 2);
    const major = parseInt(majorStr, 10);
    const minor = parseInt(minorStr, 10);
    if (major > 18 || major === 18 && minor >= 3) {
      return {
        fetchPriority
      };
    }
    return {
      fetchpriority: fetchPriority
    };
  }
  const ImageElement = /* @__PURE__ */ (0, _react.forwardRef)((param, forwardedRef) => {
    let { src, srcSet, sizes, height, width, decoding, className, style, fetchPriority, placeholder, loading, unoptimized, fill, onLoadRef, onLoadingCompleteRef, setBlurComplete, setShowAltText, sizesInput, onLoad, onError, ...rest } = param;
    return /* @__PURE__ */ (0, _jsxruntime.jsx)("img", {
      ...rest,
      ...getDynamicProps(fetchPriority),
      // It's intended to keep `loading` before `src` because React updates
      // props in order which causes Safari/Firefox to not lazy load properly.
      // See https://github.com/facebook/react/issues/25883
      loading,
      width,
      height,
      decoding,
      "data-nimg": fill ? "fill" : "1",
      className,
      style,
      // It's intended to keep `src` the last attribute because React updates
      // attributes in order. If we keep `src` the first one, Safari will
      // immediately start to fetch `src`, before `sizes` and `srcSet` are even
      // updated by React. That causes multiple unnecessary requests if `srcSet`
      // and `sizes` are defined.
      // This bug cannot be reproduced in Chrome or Firefox.
      sizes,
      srcSet,
      src,
      ref: (0, _react.useCallback)((img) => {
        if (forwardedRef) {
          if (typeof forwardedRef === "function")
            forwardedRef(img);
          else if (typeof forwardedRef === "object") {
            forwardedRef.current = img;
          }
        }
        if (!img) {
          return;
        }
        if (onError) {
          img.src = img.src;
        }
        if (img.complete) {
          handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete);
        }
      }, [
        src,
        placeholder,
        onLoadRef,
        onLoadingCompleteRef,
        setBlurComplete,
        onError,
        unoptimized,
        sizesInput,
        forwardedRef
      ]),
      onLoad: (event) => {
        const img = event.currentTarget;
        handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete);
      },
      onError: (event) => {
        setShowAltText(true);
        if (placeholder !== "empty") {
          setBlurComplete(true);
        }
        if (onError) {
          onError(event);
        }
      }
    });
  });
  function ImagePreload(param) {
    let { isAppRouter, imgAttributes } = param;
    const opts = {
      as: "image",
      imageSrcSet: imgAttributes.srcSet,
      imageSizes: imgAttributes.sizes,
      crossOrigin: imgAttributes.crossOrigin,
      referrerPolicy: imgAttributes.referrerPolicy,
      ...getDynamicProps(imgAttributes.fetchPriority)
    };
    if (isAppRouter && _reactdom.default.preload) {
      _reactdom.default.preload(
        imgAttributes.src,
        // @ts-expect-error TODO: upgrade to `@types/react-dom@18.3.x`
        opts
      );
      return null;
    }
    return /* @__PURE__ */ (0, _jsxruntime.jsx)(_head.default, {
      children: /* @__PURE__ */ (0, _jsxruntime.jsx)("link", {
        rel: "preload",
        // Note how we omit the `href` attribute, as it would only be relevant
        // for browsers that do not support `imagesrcset`, and in those cases
        // it would cause the incorrect image to be preloaded.
        //
        // https://html.spec.whatwg.org/multipage/semantics.html#attr-link-imagesrcset
        href: imgAttributes.srcSet ? void 0 : imgAttributes.src,
        ...opts
      }, "__nimg-" + imgAttributes.src + imgAttributes.srcSet + imgAttributes.sizes)
    });
  }
  const Image = /* @__PURE__ */ (0, _react.forwardRef)((props, forwardedRef) => {
    const pagesRouter = (0, _react.useContext)(_routercontextsharedruntime.RouterContext);
    const isAppRouter = !pagesRouter;
    const configContext = (0, _react.useContext)(_imageconfigcontextsharedruntime.ImageConfigContext);
    const config = (0, _react.useMemo)(() => {
      const c = configEnv || configContext || _imageconfig.imageConfigDefault;
      const allSizes = [
        ...c.deviceSizes,
        ...c.imageSizes
      ].sort((a, b) => a - b);
      const deviceSizes = c.deviceSizes.sort((a, b) => a - b);
      return {
        ...c,
        allSizes,
        deviceSizes
      };
    }, [
      configContext
    ]);
    const { onLoad, onLoadingComplete } = props;
    const onLoadRef = (0, _react.useRef)(onLoad);
    (0, _react.useEffect)(() => {
      onLoadRef.current = onLoad;
    }, [
      onLoad
    ]);
    const onLoadingCompleteRef = (0, _react.useRef)(onLoadingComplete);
    (0, _react.useEffect)(() => {
      onLoadingCompleteRef.current = onLoadingComplete;
    }, [
      onLoadingComplete
    ]);
    const [blurComplete, setBlurComplete] = (0, _react.useState)(false);
    const [showAltText, setShowAltText] = (0, _react.useState)(false);
    const { props: imgAttributes, meta: imgMeta } = (0, _getimgprops.getImgProps)(props, {
      defaultLoader: _imageloader.default,
      imgConf: config,
      blurComplete,
      showAltText
    });
    return /* @__PURE__ */ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
      children: [
        /* @__PURE__ */ (0, _jsxruntime.jsx)(ImageElement, {
          ...imgAttributes,
          unoptimized: imgMeta.unoptimized,
          placeholder: imgMeta.placeholder,
          fill: imgMeta.fill,
          onLoadRef,
          onLoadingCompleteRef,
          setBlurComplete,
          setShowAltText,
          sizesInput: props.sizes,
          ref: forwardedRef
        }),
        imgMeta.priority ? /* @__PURE__ */ (0, _jsxruntime.jsx)(ImagePreload, {
          isAppRouter,
          imgAttributes
        }) : null
      ]
    });
  });
  if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", { value: true });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
  }
})(imageComponent, imageComponent.exports);
var imageComponentExports = imageComponent.exports;
(function(exports) {
  var define_process_env_default = { ACLOCAL_PATH: "/mingw64/share/aclocal:/usr/share/aclocal", ALLUSERSPROFILE: "C:\\ProgramData", APPDATA: "C:\\Users\\nguye\\AppData\\Roaming", BERRY_BIN_FOLDER: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df", CHROME_CRASHPAD_PIPE_NAME: "\\\\.\\pipe\\crashpad_17588_OUJZIQANJWJSIJPB", COLORTERM: "truecolor", COMMONPROGRAMFILES: "C:\\Program Files\\Common Files", "CommonProgramFiles(x86)": "C:\\Program Files (x86)\\Common Files", CommonProgramW6432: "C:\\Program Files\\Common Files", COMPUTERNAME: "VANPC", COMSPEC: "C:\\WINDOWS\\system32\\cmd.exe", CONFIG_SITE: "/etc/config.site", DISPLAY: "needs-to-be-defined", DriverData: "C:\\Windows\\System32\\Drivers\\DriverData", EXEPATH: "C:\\Program Files\\Git\\bin", FORCE_COLOR: "true", GIT_ASKPASS: "c:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\extensions\\git\\dist\\askpass.sh", HOME: "C:\\Users\\nguye", HOMEDRIVE: "C:", HOMEPATH: "\\Users\\nguye", HOSTNAME: "VanPC", INFOPATH: "/mingw64/local/info:/mingw64/share/info:/usr/local/info:/usr/share/info:/usr/info:/share/info", INIT_CWD: "D:\\GithubProjects\\genshin-optimizer", LANG: "en_US.UTF-8", LERNA_PACKAGE_NAME: "frontend", LOCALAPPDATA: "C:\\Users\\nguye\\AppData\\Local", LOGONSERVER: "\\\\VANPC", MANPATH: "/mingw64/local/man:/mingw64/share/man:/usr/local/man:/usr/share/man:/usr/man:/share/man", MINGW_CHOST: "x86_64-w64-mingw32", MINGW_PACKAGE_PREFIX: "mingw-w64-x86_64", MINGW_PREFIX: "/mingw64", MSYS: "disable_pcon", MSYSTEM: "MINGW64", MSYSTEM_CARCH: "x86_64", MSYSTEM_CHOST: "x86_64-w64-mingw32", MSYSTEM_PREFIX: "/mingw64", NODE_ENV: "production", npm_config_user_agent: "yarn/3.4.1 npm/? node/v21.6.1 win32 x64", npm_execpath: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df\\yarn", npm_node_execpath: "C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df\\node", npm_package_json: "D:\\GithubProjects\\genshin-optimizer\\package.json", npm_package_name: "genshin-optimizer", npm_package_version: "10.10.1", NUMBER_OF_PROCESSORS: "12", NX_CLI_SET: "true", NX_GA_TRACKINGID: "UA-000000-01", NX_LOAD_DOT_ENV_FILES: "true", NX_TASK_HASH: "14845748941812439306", NX_TASK_TARGET_PROJECT: "frontend", NX_TASK_TARGET_TARGET: "build", NX_URLS_GUIDES: "[]", NX_URL_DISCORD_GDEV: "https://discord.com/", NX_URL_DISCORD_GO: "https://discord.com/", NX_URL_GITHUB_API_GO_RELEASES: "https://api.github.com/repos///releases/tags/", NX_URL_GITHUB_FRZYC: "https://github.com/", NX_URL_GITHUB_GO: "https://github.com/", NX_URL_GITHUB_GO_CURRENT_VERSION: "", NX_URL_GITHUB_LANTUA: "https://github.com/", NX_URL_GITHUB_VAN: "https://github.com/", NX_URL_KQM_MULTI_GUIDE: "https://keqingmains.com/misc/multi-optimization/", NX_URL_PATREON_FRZYC: "https://www.patreon.com/", NX_URL_PAYPAL_FRZYC: "https://www.paypal.com/", NX_URL_TWITCH_FRZYC: "https://www.twitch.tv/", NX_URL_TWITTER_FRZYC: "https://twitter.com/frzyc", NX_URL_WEBSITE_KQM: "https://keqingmains.com/", NX_URL_YOUTUBE_TUTPL: "https://www.youtube.com/", NX_WORKSPACE_ROOT: "D:\\GithubProjects\\genshin-optimizer", OLDPWD: "/d/GithubProjects/genshin-optimizer/dist/apps/somnia", OneDrive: "C:\\Users\\nguye\\OneDrive", OneDriveConsumer: "C:\\Users\\nguye\\OneDrive", ORIGINAL_PATH: "C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Users\\nguye\\bin;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0;C:\\WINDOWS\\System32\\OpenSSH;C:\\Program Files\\nodejs;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet;C:\\Program Files\\PowerShell\\7;C:\\Users\\nguye\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\nguye\\AppData\\Roaming\\npm;C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Users\\nguye\\.dotnet\\tools", ORIGINAL_TEMP: "/tmp", ORIGINAL_TMP: "/tmp", ORIGINAL_XDG_CURRENT_DESKTOP: "undefined", OS: "Windows_NT", PATH: "D:\\GithubProjects\\genshin-optimizer\\apps\\frontend\\node_modules\\.bin;D:\\GithubProjects\\genshin-optimizer\\apps\\node_modules\\.bin;D:\\GithubProjects\\genshin-optimizer\\node_modules\\.bin;D:\\GithubProjects\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\Program Files\\nodejs;C:\\Users\\nguye\\AppData\\Local\\Temp\\xfs-784063df;C:\\Users\\nguye\\.yarn\\bin;C:\\Users\\nguye\\.config\\yarn\\global\\node_modules\\.bin;C:\\Users\\nguye\\bin;C:\\Users\\nguye\\bin;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\local\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Program Files\\Git\\mingw64\\bin;C:\\Program Files\\Git\\usr\\bin;C:\\Users\\nguye\\bin;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0;C:\\WINDOWS\\System32\\OpenSSH;C:\\Program Files\\nodejs;C:\\Program Files\\Git\\cmd;C:\\Program Files\\dotnet;C:\\Program Files\\PowerShell\\7;C:\\Users\\nguye\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\nguye\\AppData\\Roaming\\npm;C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\bin;C:\\Users\\nguye\\.dotnet\\tools;C:\\Program Files\\Git\\usr\\bin\\vendor_perl;C:\\Program Files\\Git\\usr\\bin\\core_perl", PATHEXT: ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JSE;.WSF;.WSH;.MSC", PKG_CONFIG_PATH: "/mingw64/lib/pkgconfig:/mingw64/share/pkgconfig", PKG_CONFIG_SYSTEM_INCLUDE_PATH: "/mingw64/include", PKG_CONFIG_SYSTEM_LIBRARY_PATH: "/mingw64/lib", PLINK_PROTOCOL: "ssh", POWERSHELL_DISTRIBUTION_CHANNEL: "MSI:Windows 10 Pro", PROCESSOR_ARCHITECTURE: "AMD64", PROCESSOR_IDENTIFIER: "AMD64 Family 23 Model 8 Stepping 2, AuthenticAMD", PROCESSOR_LEVEL: "23", PROCESSOR_REVISION: "0802", ProgramData: "C:\\ProgramData", PROGRAMFILES: "C:\\Program Files", "ProgramFiles(x86)": "C:\\Program Files (x86)", ProgramW6432: "C:\\Program Files", PROJECT_CWD: "D:\\GithubProjects\\genshin-optimizer", PROMPT: "$P$G", PSModulePath: "C:\\Program Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules", PUBLIC: "C:\\Users\\Public", PWD: "D:\\GithubProjects\\genshin-optimizer", SESSIONNAME: "Console", SHELL: "C:\\Program Files\\Git\\usr\\bin\\bash.exe", SHLVL: "2", SSH_ASKPASS: "/mingw64/bin/git-askpass.exe", SYSTEMDRIVE: "C:", SYSTEMROOT: "C:\\WINDOWS", TEMP: "C:\\Users\\nguye\\AppData\\Local\\Temp", TERM_PROGRAM: "vscode", TERM_PROGRAM_VERSION: "1.91.1", TMP: "C:\\Users\\nguye\\AppData\\Local\\Temp", TMPDIR: "C:\\Users\\nguye\\AppData\\Local\\Temp", USERDOMAIN: "VANPC", USERDOMAIN_ROAMINGPROFILE: "VANPC", USERNAME: "nguye", USERPROFILE: "C:\\Users\\nguye", VSCODE_GIT_ASKPASS_EXTRA_ARGS: "", VSCODE_GIT_ASKPASS_MAIN: "c:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\extensions\\git\\dist\\askpass-main.js", VSCODE_GIT_ASKPASS_NODE: "C:\\Users\\nguye\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe", VSCODE_GIT_IPC_HANDLE: "\\\\.\\pipe\\vscode-git-2726f81895-sock", WINDIR: "C:\\WINDOWS", _: "/usr/bin/winpty" };
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function _export(target, all) {
    for (var name in all)
      Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
      });
  }
  _export(exports, {
    default: function() {
      return _default;
    },
    getImageProps: function() {
      return getImageProps;
    }
  });
  const _interop_require_default2 = _interop_require_default$1;
  const _getimgprops = getImgProps;
  const _imagecomponent = imageComponentExports;
  const _imageloader = /* @__PURE__ */ _interop_require_default2._(requireImageLoader());
  function getImageProps(imgProps) {
    const { props } = (0, _getimgprops.getImgProps)(imgProps, {
      defaultLoader: _imageloader.default,
      // This is replaced by webpack define plugin
      imgConf: define_process_env_default.__NEXT_IMAGE_OPTS
    });
    for (const [key, value] of Object.entries(props)) {
      if (value === void 0) {
        delete props[key];
      }
    }
    return {
      props
    };
  }
  const _default = _imagecomponent.Image;
})(imageExternal);
var image = imageExternal;
const image$1 = /* @__PURE__ */ getDefaultExportFromCjs(image);
const image$2 = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: image$1
}, [image]);
export {
  image$2 as i
};
