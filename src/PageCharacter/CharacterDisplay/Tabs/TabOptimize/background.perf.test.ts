import { ArtCharDatabase } from '../../../../Database/Database';
import { DBLocalStorage } from '../../../../Database/DBStorage';
import { importGOOD } from '../../../../Database/imports/good';
import { mergeData, uiDataForTeam } from '../../../../Formula/api';
import { optimize } from '../../../../Formula/optimization';
import { customRead } from '../../../../Formula/utils';
import { getTeamData } from '../../../../ReactHooks/useTeamData';
import * as data1 from "./background.perf.test.json";
import { countBuilds, pruneAll } from './common';
import { ComputeWorker } from './ComputeWorker';
import { compactArtifacts, dynamicData } from './foreground';

describe.skip("Worker Perf", () => {
  test("Test", async () => {

    const database = new ArtCharDatabase(new DBLocalStorage(localStorage))
    importGOOD(data1 as any, database, false, false)!

    const teamData = (await getTeamData(database, "Sucrose"))!.teamData
    // Get a new `Data` for `workerData` (and not reuse the old ones) because we are mutating it later
    const workerData = uiDataForTeam(teamData).Sucrose!.target.data[0]
    const optimizationTargetNode = customRead(["display", "charged", "dmg"])
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic

    let nodes = optimize([optimizationTargetNode], workerData, ({ path: [p] }) => p !== "dyn")
    let arts = compactArtifacts(database.arts.values, 0, true)
    const minimum = [-Infinity];
    ({ nodes, arts } = pruneAll(nodes, minimum, arts, 10, {}, { reaffine: true }))

    const worker = new ComputeWorker({
      command: "setup",
      id: 0,
      arts,
      optimizationTarget: nodes[0],
      plotBase: undefined,
      maxBuilds: 2,
      filters: []
    }, () => { })
    const total = countBuilds(arts)

    const date1 = new Date().getTime();

    worker.compute(-Infinity, {
      "flower": { kind: "exclude", sets: new Set() },
      "goblet": { kind: "exclude", sets: new Set() },
      "circlet": { kind: "exclude", sets: new Set() },
      "plume": { kind: "exclude", sets: new Set() },
      "sands": { kind: "exclude", sets: new Set() },
    })

    const date2 = new Date().getTime()
    const diff = (date2 - date1) / 1000 // total time in seconds

    worker.refresh(true)
    console.log(`Build speed: ${total / diff} builds/s (${total} builds over ${diff} seconds)`)
    console.log(worker.builds.map(build => build.value))
  })
})
