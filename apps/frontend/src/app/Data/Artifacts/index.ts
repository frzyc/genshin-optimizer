import { allArtifactSets, ArtifactSetKey } from '@genshin-optimizer/consts'
import { mergeData, UIData } from '../../Formula/api'
import { allArtifactRarities, ArtifactRarity, SetNum } from '../../Types/consts'
import { ArtifactSheet } from './ArtifactSheet'

import Adventurer from './Adventurer'
import ArchaicPetra from './ArchaicPetra'
import Berserker from './Berserker'
import BlizzardStrayer from './BlizzardStrayer'
import BloodstainedChivalry from './BloodstainedChivalry'
import BraveHeart from './BraveHeart'
import CrimsonWitchOfFlames from './CrimsonWitchOfFlames'
import DeepwoodMemories from './DeepwoodMemories'
import DefendersWill from './DefendersWill'
import DesertPavilionChronicle from './DesertPavilionChronicle'
import EchoesOfAnOffering from './EchoesOfAnOffering'
import EmblemOfSeveredFate from './EmblemOfSeveredFate'
import FlowerOfParadiseLost from './FlowerOfParadiseLost'
import Gambler from './Gambler'
import GildedDreams from './GildedDreams'
import GladiatorsFinale from './GladiatorsFinale'
import HeartOfDepth from './HeartOfDepth'
import HuskOfOpulentDreams from './HuskOfOpulentDreams'
import Instructor from './Instructor'
import Lavawalker from './Lavawalker'
import LuckyDog from './LuckyDog'
import MaidenBeloved from './MaidenBeloved'
import MartialArtist from './MartialArtist'
import NoblesseOblige from './NoblesseOblige'
import OceanHuedClam from './OceanHuedClam'
import PaleFlame from './PaleFlame'
import PrayersForDestiny from './PrayersForDestiny'
import PrayersForIllumination from './PrayersForIllumination'
import PrayersForWisdom from './PrayersForWisdom'
import PrayersToSpringtime from './PrayersToSpringtime'
import ResolutionOfSojourner from './ResolutionOfSojourner'
import RetracingBolide from './RetracingBolide'
import Scholar from './Scholar'
import ShimenawasReminiscence from './ShimenawasReminiscence'
import TenacityOfTheMillelith from './TenacityOfTheMillelith'
import TheExile from './TheExile'
import ThunderingFury from './ThunderingFury'
import Thundersoother from './Thundersoother'
import TinyMiracle from './TinyMiracle'
import TravelingDoctor from './TravelingDoctor'
import VermillionHereafter from './VermillionHereafter'
import ViridescentVenerer from './ViridescentVenerer'
import WanderersTroupe from './WanderersTroupe'

const artifacts: Record<ArtifactSetKey, ArtifactSheet> = {
  Adventurer,
  ArchaicPetra,
  Berserker,
  BlizzardStrayer,
  BloodstainedChivalry,
  BraveHeart,
  CrimsonWitchOfFlames,
  DeepwoodMemories,
  DefendersWill,
  DesertPavilionChronicle,
  EchoesOfAnOffering,
  EmblemOfSeveredFate,
  FlowerOfParadiseLost,
  Gambler,
  GildedDreams,
  GladiatorsFinale,
  HeartOfDepth,
  HuskOfOpulentDreams,
  Instructor,
  Lavawalker,
  LuckyDog,
  MaidenBeloved,
  MartialArtist,
  NoblesseOblige,
  OceanHuedClam,
  PaleFlame,
  PrayersForDestiny,
  PrayersForIllumination,
  PrayersForWisdom,
  PrayersToSpringtime,
  ResolutionOfSojourner,
  RetracingBolide,
  Scholar,
  ShimenawasReminiscence,
  TenacityOfTheMillelith,
  TheExile,
  ThunderingFury,
  Thundersoother,
  TinyMiracle,
  TravelingDoctor,
  VermillionHereafter,
  ViridescentVenerer,
  WanderersTroupe,
} as const

export function getArtSheet(sKey: ArtifactSetKey) {
  return artifacts[sKey]
}

export const setKeysByRarities = Object.fromEntries(allArtifactRarities.map(r => [r, ([] as ArtifactSetKey[])])) as Record<ArtifactRarity, ArtifactSetKey[]>
allArtifactSets.forEach(setKey => {
  const sheet = getArtSheet(setKey)
  const rarity = Math.max(...sheet.rarity) as ArtifactRarity
  setKeysByRarities[rarity].push(setKey)
})

export const allArtifactData = mergeData(Object.values(artifacts).map(s => s.data))
export function dataSetEffects(data: UIData) {
  const artifactSetEffect: Partial<Record<ArtifactSetKey, SetNum[]>> = {}
  allArtifactSets.forEach(setKey => {
    const sheet = getArtSheet(setKey)
    const setNums = (Object.keys(sheet.setEffects).map(k => parseInt(k)) as SetNum[]).filter(sn => sheet.hasEnough(sn, data))
    if (setNums.length) artifactSetEffect[setKey] = setNums
  })
  return artifactSetEffect
}
export default artifacts
