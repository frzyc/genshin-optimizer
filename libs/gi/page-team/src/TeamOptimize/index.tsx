import { getRandomElementFromArray } from '@genshin-optimizer/common/util'
import type {
  ArtifactSlotKey,
  CharacterKey,
} from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact, LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import type { TeamData, dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  DataContext,
  StatDisplayComponent,
  getTeamDataCalc,
} from '@genshin-optimizer/gi/ui'
import { Box, Button, Grid } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { OptCharacterCard } from '../CharacterDisplay/Tabs/TabOptimize/Components/OptCharacterCard'

export default function TeamOptimize({ teamId }: { teamId: string }) {
  const database = useDatabase()
  const { gender } = useDBMeta()

  const teamData = useMemo(
    () => getFullTeamData(database, gender, teamId),
    [database, gender, teamId]
  )

  const [teamBuilds, setTeamBuilds] = useState<
    { build: TeamBuild; score?: number; hash: string; teamData?: TeamData }[]
  >([])

  const onOptimize = useCallback(() => {
    const optimizedBuilds = geneticOptimizeTeam(
      database,
      gender,
      teamId,
      0.5,
      10,
      30,
      teamData
    )
    optimizedBuilds.then((res) => {
      setTeamBuilds(res.slice(0, 5))
    })
  }, [database, gender, teamData, teamId])

  const optBtn = <Button onClick={onOptimize}>Optimize</Button>

  const teamBuildsDisplay = useMemo(
    () =>
      teamBuilds.map((build) => (
        <Box
          key={build.hash}
          sx={{ display: 'flex', flexDirection: 'column', p: 1 }}
        >
          <OptTeamCard
            teamId={teamId}
            teamData={
              build.teamData ??
              getFullTeamData(database, gender, teamId, build.build)
            }
          />
        </Box>
      )),
    [database, gender, teamBuilds, teamId]
  )

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
        <OptTeamCard teamId={teamId} teamData={teamData} />
      </Box>
      {optBtn}
      {teamBuildsDisplay}
    </>
  )
}

function crossoverTeamBuilds(parent1: TeamBuild, parent2: TeamBuild) {
  const child: TeamBuild = {}
  const arts1ByType: Partial<
    Record<CharacterKey, Partial<Record<ArtifactSlotKey, ICachedArtifact[]>>>
  > = Object.fromEntries(
    Object.keys(parent1).map((char) => [
      char,
      Object.fromEntries(
        allArtifactSlotKeys.map((slot) => [
          slot,
          parent1[char]?.art?.filter((art) => art.slotKey === slot) ?? [],
        ])
      ),
    ])
  )
  const arts2ByType: Partial<
    Record<CharacterKey, Partial<Record<ArtifactSlotKey, ICachedArtifact[]>>>
  > = Object.fromEntries(
    Object.keys(parent2).map((char) => [
      char,
      Object.fromEntries(
        allArtifactSlotKeys.map((slot) => [
          slot,
          parent2[char]?.art?.filter((art) => art.slotKey === slot) ?? [],
        ])
      ),
    ])
  )
  for (const char of Object.keys(parent1)) {
    const charArtifacts = arts1ByType[char]
    const charArtifacts2 = arts2ByType[char]
    const childArtifacts: Partial<Record<ArtifactSlotKey, ICachedArtifact[]>> =
      {}
    for (const slot of allArtifactSlotKeys) {
      const artifacts = charArtifacts?.[slot] ?? []
      const artifacts2 = charArtifacts2?.[slot] ?? []
      const midpoint = Math.floor(Math.random() * artifacts.length)
      const childArtifactsSlot: ICachedArtifact[] = []
      for (let i = 0; i < artifacts.length; i++) {
        const parent = i < midpoint ? artifacts : artifacts2
        let artifact: ICachedArtifact | undefined = parent[i]
        if (childArtifactsSlot.map((art) => art?.id).includes(artifact?.id)) {
          artifact = parent.find(
            (art) => !childArtifactsSlot.map((art) => art?.id).includes(art?.id)
          )
        }
        if (!artifact) {
          const unusedArtifacts = artifacts.filter(
            (art) => !childArtifactsSlot.map((art) => art?.id).includes(art?.id)
          )
          artifact =
            unusedArtifacts[Math.floor(Math.random() * unusedArtifacts.length)]
        }
        childArtifactsSlot.push(artifact)
      }
      childArtifacts[slot] = childArtifactsSlot
    }
    child[char] = { art: Object.values(childArtifacts).flat() }
  }
  return child
}

function mutateTeamBuild(
  teamBuild: TeamBuild,
  mutationRate: number,
  database: ReturnType<typeof useDatabase>
) {
  const mutated: TeamBuild = {}
  for (const char of Object.keys(teamBuild)) {
    const charArtifacts = teamBuild[char]?.art ?? []
    const mutatedArtifacts = charArtifacts.map((art) =>
      Math.random() < mutationRate
        ? getRandomArtifact(
            database.arts.values,
            new Set(charArtifacts.map((art) => art.id)),
            art.slotKey
          )
        : art
    )
    mutated[char] = { art: mutatedArtifacts }
  }
  return mutated
}

function teamBuildHash(teamBuild: TeamBuild) {
  return Object.values(teamBuild)
    .map((char) => char.art?.map((art) => art.id).join(''))
    .join('')
}

async function geneticOptimizeTeam(
  database: ReturnType<typeof useDatabase>,
  gender: ReturnType<typeof useDBMeta>['gender'],
  teamId: string,
  mutationRate: number,
  generations: number,
  populationSize: number,
  teamData?: TeamData
) {
  let population: {
    build: TeamBuild
    score?: number
    hash: string
    teamData?: TeamData
  }[] = []
  if (!teamData) teamData = getFullTeamData(database, gender, teamId)
  for (let i = 0; i < populationSize; i++) {
    const build = generateRandomTeamBuild(database, Object.keys(teamData))
    const hash = teamBuildHash(build)
    population.push({ build, hash })
  }

  let gen = 0
  while (gen < generations) {
    gen++
    const fitnessScores = await Promise.all(
      population.map(async (individual) => {
        const teamData =
          individual.teamData ??
          getFullTeamData(database, gender, teamId, individual.build)
        return {
          build: individual.build,
          score: individual.score ?? getTargetValue(teamData),
          hash: individual.hash,
          teamData,
        }
      })
    )
    fitnessScores.sort((a, b) => b.score - a.score)

    if (gen > generations) {
      return fitnessScores
    }

    const bestIndividuals = fitnessScores.slice(
      0,
      Math.max(populationSize / 5, 10)
    )

    population = bestIndividuals
    while (population.length < populationSize) {
      // Select two random parents
      const parent1 = getRandomElementFromArray(bestIndividuals)
      const parent2 = getRandomElementFromArray(
        bestIndividuals.filter((ind) => ind.hash !== parent1.hash)
      )
      const child = crossoverTeamBuilds(parent1.build, parent2.build)
      population.push({ build: child, hash: teamBuildHash(child) })

      // Mutate random individual
      let randomBuild = getRandomElementFromArray(bestIndividuals).build
      randomBuild = mutateTeamBuild(randomBuild, mutationRate, database)
      population.push({ build: randomBuild, hash: teamBuildHash(randomBuild) })

      // Mutate best individual
      const bestBuild = mutateTeamBuild(
        bestIndividuals[0].build,
        mutationRate,
        database
      )
      population.push({ build: bestBuild, hash: teamBuildHash(bestBuild) })

      // Add random individual
      const randomBuild2 = generateRandomTeamBuild(
        database,
        Object.keys(teamData)
      )
      population.push({
        build: randomBuild2,
        hash: teamBuildHash(randomBuild2),
      })

      population = population.filter(
        (ind, indIndex, self) =>
          indIndex === self.findIndex((t) => t.hash === ind.hash)
      )
    }

    console.log(`Generation ${gen}: ${fitnessScores[0].score}`)
  }

  return population
}

function getTargetValue(teamData: TeamData): number {
  const node =
    teamData[Object.keys(teamData)[0]]?.target.data[0]?.display?.['custom']?.[0]
  if (!node) return 0
  return teamData[Object.keys(teamData)[0]]!.target.get(node).value
}

type TeamBuild = Partial<Record<CharacterKey, { art?: ICachedArtifact[] }>>

function generateRandomTeamBuild(
  database: ReturnType<typeof useDatabase>,
  characterKeys: CharacterKey[]
) {
  const allArtifacts = database.arts.values
  const usedArtifacts = new Set<string>()
  const build: TeamBuild = {}
  for (const char of characterKeys) {
    const charArts: ICachedArtifact[] = []
    for (const slot of allArtifactSlotKeys) {
      const artifact = getRandomArtifact(allArtifacts, usedArtifacts, slot)
      charArts.push(artifact)
      usedArtifacts.add(artifact.id)
    }
    build[char] = { art: charArts }
  }
  return build
}

function getRandomArtifact(
  allArtifacts: ICachedArtifact[],
  exclude: Set<string>,
  slot: ArtifactSlotKey
) {
  const artifacts = allArtifacts.filter(
    (art) => art.slotKey === slot && !exclude.has(art.id)
  )
  return getRandomElementFromArray(artifacts)
}

function getFullTeamData(
  database: ReturnType<typeof useDatabase>,
  gender: ReturnType<typeof useDBMeta>['gender'],
  teamId: string,
  override?: TeamBuild
) {
  const { loadoutData } = database.teams.get(teamId) ?? { loadoutData: [] }
  const teamData: ReturnType<typeof getTeamDataCalc> = {}
  for (const loadoutDatum of loadoutData) {
    if (!loadoutDatum) continue
    const characterKey = database.teamChars.get(loadoutDatum.teamCharId)?.key
    if (!characterKey) continue
    const charTeamData = getTeamDataCalc(
      database,
      teamId,
      gender,
      loadoutDatum.teamCharId,
      0,
      override
    )
    if (!charTeamData) continue
    teamData[characterKey] = charTeamData[characterKey]
  }
  return teamData
}

function OptTeamCard({
  teamId,
  teamData,
}: {
  teamId: string
  teamData: TeamData
}) {
  const team = useTeam(teamId)!
  const loadoutData = team.loadoutData

  return (
    <Grid container columns={{ xs: 1, md: 2, lg: 4 }} spacing={2}>
      {loadoutData.map((loadoutDatum, ind) => (
        <Grid item xs={1} key={loadoutDatum?.teamCharId ?? ind}>
          {loadoutDatum ? (
            <TeammateMiniDisplay
              loadoutDatum={loadoutDatum}
              teamData={teamData}
            />
          ) : null}
        </Grid>
      ))}
    </Grid>
  )
}

function TeammateMiniDisplay({
  loadoutDatum,
  teamData,
}: {
  loadoutDatum: LoadoutDatum
  teamData: TeamData
}) {
  const database = useDatabase()
  const { teamCharId } = loadoutDatum
  const characterKey = database.teamChars.get(teamCharId)?.key
  const { target: charUIData } =
    (characterKey && teamData?.[characterKey]) ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      compareData: undefined,
    }
  }, [charUIData, teamData])
  if (!dataContextValue || !characterKey) return null
  return (
    <DataContext.Provider value={dataContextValue}>
      <OptCharacterCard characterKey={characterKey} hideStats />
      <StatDisplayComponent
        columns={{ md: 1 }}
      />
    </DataContext.Provider>
  )
}
