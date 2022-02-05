import { database } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import { importGOOD } from '../Database/exim/good';
import { uiDataForTeam, mergeData } from '../Formula/api';
import { optimize } from '../Formula/optimization';
import { customRead } from '../Formula/utils';
import { getTeamData } from '../ReactHooks/useTeamData';
import { compactArtifacts, dynamicData } from './foreground';
import { reaffine } from './common';
import { finalize, request, setup } from './background';
import * as data1 from "./background.perf.test.json"

describe("Worker Perf", () => {
  test("Test", async () => {
    dbStorage.copyFrom(importGOOD(data1 as any, database)!.storage)
    database.reloadStorage()

    const teamData = (await getTeamData(database, "Sucrose"))!.teamData
    // Get a new `Data` for `workerData` (and not reuse the old ones) because we are mutating it later
    const workerData = uiDataForTeam(teamData).Sucrose!.target.data[0]
    const optimizationTargetNode = customRead(["display", "charged", "dmg"])
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic

    let nodes = optimize([optimizationTargetNode], workerData, ({ path: [p] }) => p !== "dyn")
    let arts = compactArtifacts(database._getArts(), 0)
    const minimum = [-Infinity];
    ({ nodes, arts } = reaffine(nodes, arts))

    setup({
      command: "setup",
      id: `0`,
      arts,
      optimizationTarget: nodes[0],
      plotBase: undefined,
      maxBuilds: 2,
      filters: []
    }, () => { })

    const date1 = new Date().getTime();

    const { total } = request({
      command: "request",
      threshold: -Infinity, filter: {
        "flower": { kind: "exclude", sets: new Set() },
        "goblet": { kind: "exclude", sets: new Set() },
        "circlet": { kind: "exclude", sets: new Set() },
        "plume": { kind: "exclude", sets: new Set() },
        "sands": { kind: "exclude", sets: new Set() },
      }
    })

    const date2 = new Date().getTime()
    const diff = (date2 - date1) / 1000 // total time in seconds
    console.log(`Build speed: ${total / diff} builds/s (${total} builds over ${diff} seconds)`)
    console.log(finalize().builds.map(build => build.value))
  })
})
