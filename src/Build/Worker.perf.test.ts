import { database } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import { importGOOD } from '../Database/exim/good';
import { dynamicData } from '../Formula';
import { dataObjForTeam, mergeData } from '../Formula/api';
import { optimize } from '../Formula/optimization';
import { customRead } from '../Formula/utils';
import { getTeamData } from '../ReactHooks/useTeamData';
import { compactArtifacts, compactNodes } from './Build_WR';
import { request, setup } from './Worker';
import * as data1 from "./Worker.perf.test.json"

describe.skip("Worker Perf", () => {
    test("Test", async () => {
        dbStorage.copyFrom(importGOOD(data1 as any, database)!.storage)
        database.reloadStorage()

        const teamData = (await getTeamData(database, "Sucrose"))!.teamData
        const workerData = dataObjForTeam(teamData).Sucrose!.target.data[0]
        const optimizationTargetNode = customRead(["display", "charged", "dmg"])
        Object.entries(mergeData([workerData, dynamicData])).forEach(([key, value]) =>
            workerData[key] = value as any) // Mark art fields as dynamic

        const { nodes, affine } = compactNodes(optimize([optimizationTargetNode], workerData, ({ path: [p] }) => p !== "dyn"))
        let { artifactsBySlot, base } = compactArtifacts(database, affine, workerData, 0)
        const minimum = [-Infinity]

        setup({
            command: "setup",
            id: `0`,
            affineBase: base,
            artifactsBySlot,
            optimizationTarget: nodes[0],
            plotBase: undefined,
            maxBuildsToShow: 0,
            filters: nodes
                .map((value, i) => ({ value, min: minimum[i] }))
                .filter(x => x.min > -Infinity)
        }, () => { })

        const date1 = new Date().getTime();

        request({
            command: "request",
            threshold: -Infinity, filter: {
                "flower": { kind: "exclude", sets: new Set() },
                "goblet": { kind: "exclude", sets: new Set() },
                "circlet": { kind: "exclude", sets: new Set() },
                "plume": { kind: "exclude", sets: new Set() },
                "sands": { kind: "exclude", sets: new Set() },
            }
        })

        const total = Object.values(artifactsBySlot).map(x => x.length).reduce((a, b) => a * b, 1)
        const date2 = new Date().getTime()
        const diff = (date2 - date1) / 1000 // total time in seconds
        console.log(`Build speed: ${total / diff} builds/s (${total} builds over ${diff} seconds)`)
    })
})
