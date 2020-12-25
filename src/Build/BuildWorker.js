import ArtifactBase from "../Artifact/ArtifactBase";

//WARNING: any imports from here cannot be loading react code...
onmessage = async (e) => {
  let { splitArtifacts, artifactSetPerms, setFilters, initialStats, artifactSetEffects, maxBuildsToShow, buildFilterKey, asending } = e.data;
  let t1 = performance.now()
  let artifactPerms = generateAllPossibleArtifactPerm(splitArtifacts, artifactSetPerms, setFilters)
  let builds = artifactPerms.map(artifacts =>
    ({ builFilterVal: calculateFinalStat(initialStats, artifacts, artifactSetEffects, buildFilterKey), artifacts }));
  let t2 = performance.now()
  builds.sort((a, b) => asending ? (a.builFilterVal - b.builFilterVal) : (b.builFilterVal - a.builFilterVal))
  builds.splice(maxBuildsToShow)
  postMessage({ builds, timing: t2 - t1 })
};
const generateAllPossibleArtifactPerm = (splitArtifacts, setPerms, setFilters) => {
  let perm = [];

  let splitArtsPerSet = {}
  let setsInFilter = setFilters.filter(filter => filter.key).map(filter => filter.key)
  //count the number of arts in setfilter for each slot
  Object.entries(splitArtifacts).forEach(([key, artArr]) => {
    let artsPerSet = {}
    artArr.forEach(art => {
      if (setsInFilter.includes(art.setKey)) {
        if (artsPerSet[art.setKey]) artsPerSet[art.setKey].push(art)
        else artsPerSet[art.setKey] = [art]
      } else {
        let setKey = "Other"
        if (artsPerSet[setKey]) artsPerSet[setKey].push(art)
        else artsPerSet[setKey] = [art]
      }
    })
    splitArtsPerSet[key] = artsPerSet
  })
  let slotKeys = ["flower", "plume", "sands", "goblet", "circlet"];
  //recursion function to loop through everything.
  let slotPerm = (index, setPerm, accu) => {
    if (index >= slotKeys.length) {
      perm.push(accu)
      return;
    }
    let slotKey = slotKeys[index];
    let setKey = setPerm[slotKey];
    if (splitArtsPerSet[slotKey][setKey]) {
      splitArtsPerSet[slotKey][setKey].forEach(element => {
        accu[slotKey] = element;
        slotPerm(index + 1, setPerm, { ...accu })
      });
    }

  }
  setPerms.forEach(setPerm => slotPerm(0, setPerm, {}))
  return perm
}

//this is for build generation, where only a specific stat is concerned.
const calculateFinalStat = (charAndWeapon, artifacts, artifactSetEffects, key) => {
  let stats = charAndWeapon
  let setToSlots = ArtifactBase.setToSlots(artifacts)

  const getArtifactSetEffects = (setToSlots) => {
    let artifactSetEffect = {}
    Object.entries(setToSlots).forEach(([setKey, arr]) => {
      let numArts = arr.length;
      if (artifactSetEffects[setKey]) {
        Object.entries(artifactSetEffects[setKey]).forEach(([num, value]) => {
          if (parseInt(num) <= numArts) {
            !artifactSetEffect[setKey] && (artifactSetEffect[setKey] = {})
            artifactSetEffect[setKey][num] = value;
          }
        })
      }
    })
    return artifactSetEffect
  }
  let artifactSetEffect = getArtifactSetEffects(setToSlots)
  const AddArtifactStats = (statKey) => {
    let val = 0;
    Object.values(artifacts).forEach(art => {
      if (!art) return
      if (art.mainStatKey === statKey)
        val += (art.mainStatVal || 0)
      art.substats.forEach((substat) =>
        substat && substat.key && substat.key === statKey && (val += substat.value))
    })
    Object.values(artifactSetEffect).forEach(setEffects =>
      Object.values(setEffects).forEach(setEffect =>
        setEffect.stats && Object.entries(setEffect.stats).forEach(([key, statVal]) =>
          key === statKey && (val += statVal))))
    return (stats[statKey] || 0) + val
  }

  if (key === "hp" || key === "def" || key === "atk") {
    let base = stats[`base_${key}`] || 0
    let percent = AddArtifactStats(key + "_")
    let flat = AddArtifactStats(key)
    return base * (1 + percent / 100) + flat
  } else if (key === "crit_multi") {
    let crit_rate = AddArtifactStats("crit_rate")
    let crit_dmg = AddArtifactStats("crit_dmg")
    return (1 + (crit_rate / 100) * (1 + crit_dmg / 100))
  } else if (key === "phy_atk" || key.includes("_ele_atk")) {
    let atk = this.calculateFinalStat(charAndWeapon, artifacts, "atk")
    let crit_multi = this.calculateFinalStat(charAndWeapon, artifacts, "crit_multi")
    let val_dmg_key = key === "phy_atk" ? "phy_dmg" : (key.split("_ele_atk")[0] + "_ele_dmg")
    let val_dmg = AddArtifactStats(val_dmg_key)
    return atk * (1 + val_dmg / 100) * crit_multi
  } else
    return AddArtifactStats(key)
}