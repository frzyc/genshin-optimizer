onmessage = async (e) => {
  let { split, artifactSetPerms, setFilters, character, ArtifactStatsData, ArtifactSlotsData, ArtifactMainStatsData, ArtifactSetsData, maxBuildsToShow, buildFilterKey, asending } = e.data;

  let t1 = performance.now()
  let builds = []
  let artifactPerms = generateAllPossibleArtifactPerm(split, artifactSetPerms, setFilters, ArtifactSlotsData)

  builds = artifactPerms.map(artifacts => {
    let setToSlots = {};
    Object.entries(artifacts).forEach(([key, art]) => {
      if (setToSlots[art.setKey]) setToSlots[art.setKey].push(key)
      else setToSlots[art.setKey] = [key]
    })
    let artifactSetEffect = getArtifactSetEffects(setToSlots, ArtifactSetsData)
    let totalArtifactStats = calculateArtifactStats(character, artifacts, artifactSetEffect, ArtifactStatsData, ArtifactMainStatsData)
    let artifactIds = Object.fromEntries(Object.entries(artifacts).map(([key, val]) => [key, val.id]))
    return {
      artifactIds,
      totalArtifactStats,
      artifactSetEffect,
      setToSlots,
      finalStats: calculateCharacterFinalStat(totalArtifactStats, character)
    }
  });
  let t2 = performance.now()
  console.log("generateBuilds took", t2 - t1, "ms")
  builds.sort((a, b) =>
    asending ? (a.finalStats[buildFilterKey] - b.finalStats[buildFilterKey]) : (b.finalStats[buildFilterKey] - a.finalStats[buildFilterKey]))
  builds.splice(maxBuildsToShow)
  postMessage(builds)
};
const generateAllPossibleArtifactPerm = (splitArtifacts, setPerms, setFilters, ArtifactSlotsData) => {
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
  let slotKeys = Object.keys(ArtifactSlotsData);
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
  // setPerms.forEach(setPerm => slotPerm(0, setPerm, {}))

  return perm
}
const calculateCharacterFinalStat = (artStats, character) => {
  character.weaponStatKey && character.weaponStatVal && (artStats[character.weaponStatKey] += character.weaponStatVal)
  let atk = +(character.atk + character.atk * artStats.atk_ / 100 + artStats.atk).toFixed(1)
  let phy_dmg = +(artStats.phy_dmg).toFixed(1);
  let ele_dmg = +(artStats[`${character.element}_ele_dmg`]).toFixed(1);
  let crit_rate = +(character.crit_rate + artStats.crit_rate).toFixed(1);
  let crit_dmg = +(character.crit_dmg + artStats.crit_dmg).toFixed(1)
  return {
    hp: +(character.hp + character.hp * artStats.hp_ / 100 + artStats.hp).toFixed(1),
    atk,
    def: +(character.def + character.def * artStats.def_ / 100 + artStats.def).toFixed(1),
    ele_mas: +(character.ele_mas + artStats.ele_mas).toFixed(1),
    crit_rate,
    crit_dmg,
    heal_bonu: +(character.heal_bonu + artStats.heal_bonu).toFixed(1),
    ener_rech: +(character.ener_rech + artStats.ener_rech).toFixed(1),
    phy_dmg,
    [`${character.element}_ele_dmg`]: ele_dmg,
    phy_atk: +(atk * (1 + phy_dmg / 100) * (1 + (crit_rate / 100) * (1 + crit_dmg / 100))).toFixed(1),
    ele_atk: +(atk * (1 + ele_dmg / 100) * (1 + (crit_rate / 100) * (1 + crit_dmg / 100))).toFixed(1)
  }
}
const getArtifactSetEffects = (setToSlots, ArtifactSetsData) => {
  let artifactSetEffect = {}
  Object.entries(setToSlots).forEach(([setKey, arr]) => {
    let numArts = arr.length;
    if (ArtifactSetsData[setKey] && ArtifactSetsData[setKey].sets) {
      Object.entries(ArtifactSetsData[setKey].sets).forEach(([num, value]) => {
        if (parseInt(num) <= numArts) {
          !artifactSetEffect[setKey] && (artifactSetEffect[setKey] = {})
          artifactSetEffect[setKey][num] = value;
        }
      })
    }
  })
  return artifactSetEffect
}
const calculateArtifactStats = (character, artifacts, artifactSetEffect, ArtifactStatsData, ArtifactMainStatsData) => {
  //the initial onject, with all the values set to 0.
  let initialObj = Object.fromEntries([...(Object.keys(ArtifactStatsData).filter(key => key !== "ele_dmg").map((key) => [key, 0])), [character.element + "_ele_dmg", 0]])
  let totalArtifactStats = Object.values(artifacts).reduce((accu, art) => {
    accu[art.mainStatKey] = (accu[art.mainStatKey] || 0) + getMainStatValue(art.mainStatKey, art.numStars, art.level, ArtifactMainStatsData);
    art.substats.forEach((substat) => substat && substat.key && (accu[substat.key] = (accu[substat.key] || 0) + substat.value))
    return accu
  }, initialObj)
  Object.values(artifactSetEffect).forEach(setEffects =>
    Object.values(setEffects).forEach(setEffect =>
      setEffect.stats && Object.entries(setEffect.stats).forEach(([key, statVal]) =>
        totalArtifactStats[key] = (totalArtifactStats[key] || 0) + statVal
      )))
  //add specialized stat
  if (character.specialStatKey)
    totalArtifactStats[character.specialStatKey] = (totalArtifactStats[character.specialStatKey] || 0) + character.specialStatVal
  return totalArtifactStats
}

const getMainStatValue = (key, numStars, level, ArtifactMainStatsData, defVal = 0) => {
  if (key && numStars && ArtifactMainStatsData[numStars] && ArtifactMainStatsData[numStars][key] && ArtifactMainStatsData[numStars][key][level])
    return ArtifactMainStatsData[numStars][key][level]
  else {
    if (key.includes("_ele_dmg")) {
      let elementKey = "ele_dmg"
      return getMainStatValue(elementKey, numStars, level, ArtifactMainStatsData, defVal)
    }
    return defVal
  }
}


