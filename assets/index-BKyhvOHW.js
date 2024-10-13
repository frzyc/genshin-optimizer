import { z as useTranslation, a as useDatabase, r as reactExports, b5 as catTotal, b6 as bulkCatTotal, b as jsx, d as jsxs, G as Grid, T as Typography, ad as Trans, ag as Button, an as default_1, f as Box, aw as Stack, N as Divider, b7 as theme, b8 as WeaponToggle, b9 as WeaponRarityToggle, ba as SolidToggleButtonGroup, bb as ToggleButton, ar as default_1$1, as as default_1$2, Q as Chip, bc as default_1$3, bd as default_1$4, B as BootstrapTooltip, be as LocationFilterMultiAutocomplete, O as CardContent, h as CardThemed, bf as handleMultiSelect, I as getWeaponStat, H as allWeaponTypeKeys, bg as allRarityKeys, aq as default_1$5, ap as SqBadge, bh as allLocationCharacterKeys, at as useForceUpdate, ac as ReactGA, aC as useMediaQueryUp, bi as initialWeapon, aF as filterFunction, aG as sortFunction, aH as useInfScroll, bj as TextField, aL as ShowingAndSortOptionSelect, aI as default_1$6, bk as WeaponCard, bl as weaponSortMap, bm as weaponFilterConfigs, bn as weaponSortConfigs, bo as WeaponSelectionModal, bp as WeaponEditor, S as Skeleton } from "./index-B8aczfSH.js";
const lockedValues = ["locked", "unlocked"];
const lockedHandler = handleMultiSelect([...lockedValues]);
function WeaponFilter({
  numShowing,
  total,
  weaponIds
}) {
  const { t } = useTranslation(["page_weapon", "ui"]);
  const database = useDatabase();
  const [state, setState] = reactExports.useState(database.displayWeapon.get());
  reactExports.useEffect(() => {
    database.displayWeapon.follow((r, dbMeta) => setState(dbMeta));
  }, [database]);
  const { weaponType, rarity, locked, showEquipped, showInventory, locations } = state;
  const weaponTotals = reactExports.useMemo(
    () => catTotal(
      allWeaponTypeKeys,
      (ct) => database.weapons.entries.forEach(([id, weapon]) => {
        const wtk = getWeaponStat(weapon.key).weaponType;
        ct[wtk].total++;
        if (weaponIds.includes(id))
          ct[wtk].current++;
      })
    ),
    [database, weaponIds]
  );
  const weaponRarityTotals = reactExports.useMemo(
    () => catTotal(
      allRarityKeys,
      (ct) => database.weapons.entries.forEach(([id, weapon]) => {
        const wr = getWeaponStat(weapon.key).rarity;
        ct[wr].total++;
        if (weaponIds.includes(id))
          ct[wr].current++;
      })
    ),
    [database, weaponIds]
  );
  const { lockedTotal, equippedTotal, locationTotal } = reactExports.useMemo(() => {
    const catKeys = {
      lockedTotal: ["locked", "unlocked"],
      equippedTotal: ["equipped", "unequipped"],
      locationTotal: [...allLocationCharacterKeys, ""]
    };
    return bulkCatTotal(
      catKeys,
      (ctMap) => database.weapons.entries.forEach(([id, weapon]) => {
        const location = weapon.location;
        const lock = weapon.lock ? "locked" : "unlocked";
        const equipped = location ? "equipped" : "unequipped";
        ctMap["lockedTotal"][lock].total++;
        ctMap["equippedTotal"][equipped].total++;
        ctMap["locationTotal"][location].total++;
        if (weaponIds.includes(id)) {
          ctMap["lockedTotal"][lock].current++;
          ctMap["equippedTotal"][equipped].current++;
          ctMap["locationTotal"][location].current++;
        }
      })
    );
  }, [database, weaponIds]);
  return /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
    /* @__PURE__ */ jsxs(Grid, { container: true, children: [
      /* @__PURE__ */ jsx(Grid, { item: true, children: /* @__PURE__ */ jsx(Typography, { variant: "h6", children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "weaponFilter", children: "Weapon Filter" }) }) }),
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
          onClick: () => database.displayWeapon.set({ action: "reset" }),
          startIcon: /* @__PURE__ */ jsx(default_1, {}),
          children: /* @__PURE__ */ jsx(Trans, { t, i18nKey: "ui:reset" })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, children: [
      /* @__PURE__ */ jsxs(Grid, { item: true, xs: 12, md: 6, display: "flex", flexDirection: "column", children: [
        /* @__PURE__ */ jsx(Trans, { t, i18nKey: "subheadings.general" }),
        /* @__PURE__ */ jsxs(Stack, { spacing: 1, children: [
          /* @__PURE__ */ jsx(Divider, { sx: { bgcolor: theme.palette.contentNormal.light } }),
          /* @__PURE__ */ jsx(
            WeaponToggle,
            {
              fullWidth: true,
              onChange: (weaponType2) => database.displayWeapon.set({ weaponType: weaponType2 }),
              value: weaponType,
              totals: weaponTotals,
              size: "small"
            }
          ),
          /* @__PURE__ */ jsx(
            WeaponRarityToggle,
            {
              sx: { height: "100%" },
              fullWidth: true,
              onChange: (rarity2) => database.displayWeapon.set({ rarity: rarity2 }),
              value: rarity,
              totals: weaponRarityTotals,
              size: "small"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Grid,
        {
          item: true,
          xs: 12,
          md: 6,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          children: /* @__PURE__ */ jsxs(Box, { children: [
            /* @__PURE__ */ jsx(Trans, { t, i18nKey: "subheadings.inventory" }),
            /* @__PURE__ */ jsxs(Stack, { spacing: 1, children: [
              /* @__PURE__ */ jsx(
                Divider,
                {
                  sx: { bgcolor: theme.palette.contentNormal.light }
                }
              ),
              /* @__PURE__ */ jsx(SolidToggleButtonGroup, { fullWidth: true, value: locked, size: "small", children: lockedValues.map((v, i) => /* @__PURE__ */ jsxs(
                ToggleButton,
                {
                  value: v,
                  sx: { display: "flex", gap: 1 },
                  onClick: () => database.displayWeapon.set({
                    locked: lockedHandler(locked, v)
                  }),
                  children: [
                    i ? /* @__PURE__ */ jsx(default_1$1, {}) : /* @__PURE__ */ jsx(default_1$2, {}),
                    /* @__PURE__ */ jsx(Trans, { t, i18nKey: `ui:${v}` }),
                    /* @__PURE__ */ jsx(
                      Chip,
                      {
                        label: lockedTotal[i ? "unlocked" : "locked"],
                        size: "small"
                      }
                    )
                  ]
                },
                v
              )) }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  startIcon: /* @__PURE__ */ jsx(default_1$3, {}),
                  color: showInventory ? "success" : "secondary",
                  onClick: () => database.displayWeapon.set({
                    showInventory: !showInventory
                  }),
                  children: [
                    t`weaponInInv`,
                    " ",
                    /* @__PURE__ */ jsx(
                      Chip,
                      {
                        sx: { ml: 1 },
                        label: equippedTotal["unequipped"],
                        size: "small"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  startIcon: /* @__PURE__ */ jsx(default_1$4, {}),
                  color: showEquipped ? "success" : "secondary",
                  onClick: () => database.displayWeapon.set({
                    showEquipped: !showEquipped
                  }),
                  children: [
                    t`equippedWeapon`,
                    " ",
                    /* @__PURE__ */ jsx(
                      Chip,
                      {
                        sx: { ml: 1 },
                        label: equippedTotal["equipped"],
                        size: "small"
                      }
                    )
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx(Stack, { spacing: 1.5, pt: 1.5, children: /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsx(
              BootstrapTooltip,
              {
                title: showEquipped ? t`locationsTooltip` : "",
                placement: "top",
                children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                  LocationFilterMultiAutocomplete,
                  {
                    totals: locationTotal,
                    locations: showEquipped ? [] : locations,
                    setLocations: (locations2) => database.displayWeapon.set({ locations: locations2 }),
                    disabled: showEquipped
                  }
                ) })
              }
            ) }) })
          ] })
        }
      )
    ] }) })
  ] }) });
}
function WeaponRedButtons({ weaponIds }) {
  const { t } = useTranslation(["page_weapon", "ui"]);
  const database = useDatabase();
  const { numDelete, numUnlock, numLock } = reactExports.useMemo(() => {
    const weapons = weaponIds.map(
      (id) => database.weapons.get(id)
    );
    const numUnlock2 = weapons.reduce(
      (w, weapon) => w + (weapon.lock ? 0 : 1),
      0
    );
    const numLock2 = weapons.length - numUnlock2;
    const numDelete2 = weapons.reduce(
      (w, weapon) => w + (weapon.lock || weapon.location ? 0 : 1),
      0
    );
    return { numDelete: numDelete2, numUnlock: numUnlock2, numLock: numLock2 };
  }, [weaponIds, database]);
  const deleteWeapons = () => window.confirm(`Are you sure you want to delete ${numDelete} weapons?`) && weaponIds.map((id) => {
    const weapon = database.weapons.get(id);
    if (!(weapon == null ? void 0 : weapon.lock) && !(weapon == null ? void 0 : weapon.location))
      database.weapons.remove(id);
  });
  const lockWeapons = () => window.confirm(`Are you sure you want to lock ${numUnlock} weapons ?`) && weaponIds.map((id) => database.weapons.set(id, { lock: true }));
  const unlockWeapons = () => window.confirm(`Are you sure you want to unlock ${numLock} weapons ?`) && weaponIds.map((id) => database.weapons.set(id, { lock: false }));
  return /* @__PURE__ */ jsxs(Grid, { container: true, spacing: 1, alignItems: "center", children: [
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 16, sm: 8, md: 4, children: /* @__PURE__ */ jsxs(
      Button,
      {
        fullWidth: true,
        color: "error",
        disabled: !numDelete,
        onClick: deleteWeapons,
        startIcon: /* @__PURE__ */ jsx(default_1$5, {}),
        children: [
          /* @__PURE__ */ jsx(Trans, { t, i18nKey: "button.deleteWeapons", children: "Delete Weapons" }),
          /* @__PURE__ */ jsx(SqBadge, { sx: { ml: 1 }, color: numDelete ? "success" : "secondary", children: numDelete })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 16, sm: 8, md: 4, children: /* @__PURE__ */ jsxs(
      Button,
      {
        fullWidth: true,
        color: "error",
        disabled: !numLock,
        onClick: unlockWeapons,
        startIcon: /* @__PURE__ */ jsx(default_1$1, {}),
        children: [
          /* @__PURE__ */ jsx(Trans, { t, i18nKey: "button.unlockWeapons", children: "Unlock Weapons" }),
          /* @__PURE__ */ jsx(SqBadge, { sx: { ml: 1 }, color: numLock ? "success" : "secondary", children: numLock })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 16, sm: 8, md: 4, children: /* @__PURE__ */ jsxs(
      Button,
      {
        fullWidth: true,
        color: "error",
        disabled: !numUnlock,
        onClick: lockWeapons,
        startIcon: /* @__PURE__ */ jsx(default_1$2, {}),
        children: [
          /* @__PURE__ */ jsx(Trans, { t, i18nKey: "button.lockWeapons", children: "Lock Weapons" }),
          /* @__PURE__ */ jsx(SqBadge, { sx: { ml: 1 }, color: numUnlock ? "success" : "secondary", children: numUnlock })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(Grid, { item: true, xs: 12, display: "flex", justifyContent: "space-around", children: /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "text.secondary", children: /* @__PURE__ */ jsxs(Trans, { t, i18nKey: "buttonHint", children: [
      "Note: the red buttons above only apply to",
      /* @__PURE__ */ jsx("b", { children: "currently filtered weapons" })
    ] }) }) })
  ] });
}
const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 };
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 };
const sortKeys = Object.keys(weaponSortMap);
function PageWeapon() {
  const { t } = useTranslation(["page_weapon", "ui", "weaponNames_gen"]);
  const database = useDatabase();
  const [state, setState] = reactExports.useState(database.displayWeapon.get());
  reactExports.useEffect(
    () => database.displayWeapon.follow((r, dbMeta) => setState(dbMeta)),
    [database]
  );
  const [newWeaponModalShow, setnewWeaponModalShow] = reactExports.useState(false);
  const [dbDirty, forceUpdate] = useForceUpdate();
  reactExports.useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/weapon" });
    return database.weapons.followAny(
      (k, r) => (r === "new" || r === "remove" || r === "update") && forceUpdate()
    );
  }, [forceUpdate, database]);
  const brPt = useMediaQueryUp();
  const deleteWeapon = reactExports.useCallback(
    async (key) => {
      const weapon = database.weapons.get(key);
      if (!weapon)
        return;
      const name = t(`weaponNames_gen:${weapon.key}`);
      if (!window.confirm(t("removeWeapon", { value: name })))
        return;
      database.weapons.remove(key);
      if (state.editWeaponId === key)
        database.displayWeapon.set({ editWeaponId: "" });
    },
    [state.editWeaponId, database, t]
  );
  const editWeapon = reactExports.useCallback(
    (key) => {
      database.displayWeapon.set({ editWeaponId: key });
    },
    [database]
  );
  const newWeapon = reactExports.useCallback(
    (weaponKey) => {
      editWeapon(database.weapons.new(initialWeapon(weaponKey)));
    },
    [database, editWeapon]
  );
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const deferredSearchTerm = reactExports.useDeferredValue(searchTerm);
  const {
    sortType,
    ascending,
    weaponType,
    rarity,
    locked,
    showEquipped,
    showInventory,
    locations
  } = state;
  const { weaponIds, totalWeaponNum } = reactExports.useMemo(() => {
    const weapons = database.weapons.values;
    const totalWeaponNum2 = weapons.length;
    const weaponIds2 = weapons.filter(
      filterFunction(
        {
          weaponType,
          rarity,
          name: deferredSearchTerm,
          locked,
          showInventory,
          showEquipped,
          locations
        },
        weaponFilterConfigs()
      )
    ).sort(
      sortFunction(
        weaponSortMap[sortType] ?? [],
        ascending,
        weaponSortConfigs()
      )
    ).map((weapon) => weapon.id);
    return dbDirty && { weaponIds: weaponIds2, totalWeaponNum: totalWeaponNum2 };
  }, [
    dbDirty,
    database,
    sortType,
    ascending,
    rarity,
    weaponType,
    locked,
    showInventory,
    showEquipped,
    locations,
    deferredSearchTerm
  ]);
  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    weaponIds.length
  );
  const weaponIdsToShow = reactExports.useMemo(
    () => weaponIds.slice(0, numShow),
    [weaponIds, numShow]
  );
  const totalShowing = weaponIds.length !== totalWeaponNum ? `${weaponIds.length}/${totalWeaponNum}` : `${totalWeaponNum}`;
  const resetEditWeapon = reactExports.useCallback(
    () => database.displayWeapon.set({ editWeaponId: "" }),
    [database]
  );
  const { editWeaponId } = state;
  reactExports.useEffect(() => {
    if (!editWeaponId)
      return;
    if (!database.weapons.get(editWeaponId))
      resetEditWeapon();
  }, [database, editWeaponId, resetEditWeapon]);
  const showingTextProps = {
    numShowing: weaponIdsToShow.length,
    total: totalShowing,
    t,
    namespace: "page_weapon"
  };
  const sortByButtonProps = {
    sortKeys: [...sortKeys],
    value: sortType,
    onChange: (sortType2) => database.displayWeapon.set({ sortType: sortType2 }),
    ascending,
    onChangeAsc: (ascending2) => database.displayWeapon.set({ ascending: ascending2 })
  };
  return /* @__PURE__ */ jsxs(Box, { display: "flex", flexDirection: "column", gap: 1, children: [
    /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: false, children: /* @__PURE__ */ jsx(
      WeaponSelectionModal,
      {
        show: newWeaponModalShow,
        onHide: () => setnewWeaponModalShow(false),
        onSelect: newWeapon
      }
    ) }),
    /* @__PURE__ */ jsx(reactExports.Suspense, { fallback: false, children: /* @__PURE__ */ jsx(
      WeaponEditor,
      {
        weaponId: editWeaponId,
        footer: true,
        onClose: resetEditWeapon
      }
    ) }),
    /* @__PURE__ */ jsx(
      WeaponFilter,
      {
        numShowing: weaponIds.length,
        total: totalWeaponNum,
        weaponIds
      }
    ),
    /* @__PURE__ */ jsx(CardThemed, { children: /* @__PURE__ */ jsxs(CardContent, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
      /* @__PURE__ */ jsxs(
        Box,
        {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          children: [
            /* @__PURE__ */ jsx(
              TextField,
              {
                autoFocus: true,
                size: "small",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                label: t("weaponName"),
                sx: { height: "100%" },
                InputProps: { sx: { height: "100%" } }
              }
            ),
            /* @__PURE__ */ jsx(
              ShowingAndSortOptionSelect,
              {
                showingTextProps,
                sortByButtonProps
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(WeaponRedButtons, { weaponIds })
    ] }) }),
    /* @__PURE__ */ jsxs(
      reactExports.Suspense,
      {
        fallback: /* @__PURE__ */ jsx(
          Skeleton,
          {
            variant: "rectangular",
            sx: { width: "100%", height: "100%", minHeight: 500 }
          }
        ),
        children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              fullWidth: true,
              onClick: () => setnewWeaponModalShow(true),
              color: "info",
              startIcon: /* @__PURE__ */ jsx(default_1$6, {}),
              children: t("page_weapon:addWeapon")
            }
          ),
          /* @__PURE__ */ jsx(Grid, { container: true, spacing: 1, columns, children: weaponIdsToShow.map((weaponId) => /* @__PURE__ */ jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsx(
            WeaponCard,
            {
              weaponId,
              onDelete: deleteWeapon,
              onEdit: editWeapon,
              canEquip: true
            }
          ) }, weaponId)) })
        ]
      }
    ),
    weaponIds.length !== weaponIdsToShow.length && /* @__PURE__ */ jsx(
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
  PageWeapon as default
};
