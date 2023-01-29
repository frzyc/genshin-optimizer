"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([[482],{

/***/ 810618:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "X": () => (/* binding */ handleMultiSelect)
/* harmony export */ });
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(41015);

function handleMultiSelect(allKeys) {
  return (arr, v) => {
    const len = arr.length;
    if (len === allKeys.length) return [v];
    if (len === 1 && arr[0] === v) return [...allKeys];
    return [...new Set((0,_Util__WEBPACK_IMPORTED_MODULE_0__/* .toggleArr */ .nh)(arr, v))];
  };
}

/***/ }),

/***/ 840775:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "W": () => (/* binding */ catTotal)
/* harmony export */ });
/* harmony import */ var _Util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(41015);

// A helper function to generate a `current/total` formated string object with categories
function catTotal(keys, cb) {
  const ct = catTotalObj(keys);
  cb(ct);
  return catTotalToStringObj(ct);
}
function catTotalObj(keys) {
  return Object.fromEntries(keys.map(k => [k, {
    total: 0,
    current: 0
  }]));
}
function catTotalToStringObj(tot) {
  return (0,_Util__WEBPACK_IMPORTED_MODULE_0__/* .objectMap */ .xh)(tot, ({
    total,
    current
  }) => current === total ? `${total}` : `${current}/${total}`);
}

/***/ })

}]);