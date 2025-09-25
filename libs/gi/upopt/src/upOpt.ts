import type {
  ArtifactSlotKey,
  ArtifactSetKey,
  ArtifactRarity,
  MainStatKey,
  SubstatKey,
} from "@genshin-optimizer/gi/consts";
import {
  allArtifactSlotKeys,
  allSubstatKeys,
  artMaxLevel,
} from "@genshin-optimizer/gi/consts";
import type { ICachedArtifact } from "@genshin-optimizer/gi/db";
import {
  getMainStatValue,
  getRollsRemaining,
} from "@genshin-optimizer/gi/util";
import type { DynStat } from "@genshin-optimizer/gi/solver";
import type { IArtifact } from "@genshin-optimizer/gi/good";

import type { SubstatLevelNode } from "./upOpt.types";
import { makeSubstatNode } from "./expandSubstat";
import { crawlSubstats } from "./substatProbs";

/**
 * Simulates leveling up an existing artifact to its max level.
 */
export function levelUpArtifact(
  art: ICachedArtifact,
  currentBuild: Build,
): weightedNode[] {
  const base = toStats(currentBuild, art);
  const { subkeys, stats } = getSubkeys(art);
  Object.entries(stats).forEach(([k, v]) => (base[k] = (base[k] ?? 0) + v));
  const rollsLeft = getRollsRemaining(art.level, art.rarity);
  const { rarity } = art;
  const info = {
    base,
    rarity,
    subkeys: subkeys.map((key) => ({ key, baseRolls: 0 })),
    rollsLeft,
  };

  // If 4 substats, no expansion needed.
  if (subkeys.length === 4) return [{ p: 1, n: makeSubstatNode(info) }];

  // Unactivated substats - Insert and remove a remaining roll.
  if (art.unactivatedSubstats) {
    art.unactivatedSubstats.forEach(({ key, value }) => {
      if (key === "") return;
      info.base[key] = (info.base[key] ?? 0) + value;
      info.subkeys.push({ key, baseRolls: 0 });
      info.rollsLeft -= 1;
    });
    return [{ p: 1, n: makeSubstatNode(info) }];
  }

  // TODO: sum over possible 4th stat
  const subsToConsider = allSubstatKeys.filter(
    (s) => !subkeys.includes(s) && s !== art.mainStatKey,
  );
  return crawlSubstats(subkeys, subsToConsider, false).map(({ p, subs }) => {
    const info2 = {
      ...info,
      subkeys: [...info.subkeys, ...subs.map((key) => ({ key, baseRolls: 1 }))],
      rollsLeft: info.rollsLeft - subs.length,
    };
    return {
      p,
      n: makeSubstatNode(info2),
    };
  });
}

/**
 * Simulates obtaining a fresh artifact from a Domain, Boss, or Strongbox then
 * leveling it to max level.
 */
export function freshArtifact(
  info: { sets: ArtifactSetKey[]; p3sub: number },
  currentBuild: Build,
): weightedNode[] {
  return [];
}

/**
 * Artifact reshaping / rerolling using Dust of Enlightenment. We select two affixes and reroll from
 * Level 0 (or 4) and guarantee that at least `mintotal` rolls go into those affixes.
 */
export function dustReshape(
  base: IArtifact,
  affixes: SubstatKey[],
  mintotal: number,
  currentBuild: Build,
): weightedNode[] {
  base.substats[0].initialValue
  return [];
}

/**
 * Artifact definition using Sanctifying Elixir. Two affixes are guaranteed w/ two
 * reshape-style roll guarantees.
 */
export function elixirDefinition(
  info: {
    setKey: ArtifactSetKey;
    slotKey: ArtifactSlotKey;
    mainStatKey: MainStatKey;
    affixes: SubstatKey[];
  },
  currentBuild: Build,
): weightedNode[] {
  const rarity = 5 as const;
  const base = toStats(currentBuild, { ...info, rarity });
  const rollsLeft = getRollsRemaining(0, 5);

  const subsToConsider = allSubstatKeys.filter(
    (s) => !info.affixes.includes(s) && s !== info.mainStatKey,
  );
  return crawlSubstats(info.affixes, subsToConsider).map(({ p, subs }) => {
    const nodeInfo = {
      base,
      rarity,
      subkeys: subs.map((key) => ({ key, baseRolls: 1 })),
      rollsLeft,
      reshape: { affixes: info.affixes, mintotal: 2 },
    };
    return {
      p,
      n: makeSubstatNode(nodeInfo),
    };
  });
}

function artToStats(art: ICachedArtifact, mainStatMax = true) {
  const stats = {} as DynStat;
  if (mainStatMax) {
    stats[art.mainStatKey] = getMainStatValue(
      art.mainStatKey,
      art.rarity,
      mainStatMax ? artMaxLevel[art.rarity] : art.level,
    );
  } else {
    stats[art.mainStatKey] = art.mainStatVal;
  }
  art.substats.forEach(({ key, value }) => (stats[key] = value));
  stats[art.setKey] = 1;
  return stats;
}

function toStats(
  build: Build,
  {
    slotKey,
    mainStatKey,
    rarity,
  }: {
    slotKey: ArtifactSlotKey;
    mainStatKey: MainStatKey;
    rarity: ArtifactRarity;
  },
) {
  const baseStats = allArtifactSlotKeys.reduce((acc, slot) => {
    if (slot === slotKey) return acc;
    const art = build[slot];
    if (!art) return acc;

    Object.entries(artToStats(art, false)).forEach(([k, v]) => {
      acc[k] = (acc[k] ?? 0) + v;
    });
    return acc;
  }, {} as DynStat);
  baseStats[mainStatKey] = getMainStatValue(
    mainStatKey,
    rarity,
    artMaxLevel[rarity],
  );
  return baseStats;
}

function getSubkeys(art: ICachedArtifact) {
  const subkeys = art.substats
    .map(({ key }) => key)
    .filter((key) => key !== ""); // Filter out empty substats
  const stats = art.substats.reduce((acc, { key, value }) => {
    if (key === "") return acc;
    acc[key] = value;
    return acc;
  }, {} as DynStat);
  return { subkeys, stats };
}

type Build = Record<ArtifactSlotKey, ICachedArtifact | undefined>;
type weightedNode = { p: number; n: SubstatLevelNode };
