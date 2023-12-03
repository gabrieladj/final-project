import { prisma } from "../server/db/client";

export  async function getAllCampStats(courseSectionId) {
    const stats = await prisma.DeployableRegion.findMany({
        where: {courseSectionId}
    });

    // parse it into object with key being the camp id
    // that way we dont have to search for the right one on the client
    let data = {};
    if (stats) {
        for (const camp of stats) {
            data[camp.jsonId] = {
                food: camp.food,
                healthcare: camp.healthcare,
                housing: camp.housing,
                admin: camp.admin,
                refugeesPresent: camp.refugeesPresent
            }
        }
    }
    return data;
}

export async function getAllRoutes(courseSectionId) {
    const routes = await prisma.Route.findMany({
        where: {courseSectionId}
    });
    let data = {};
    if (routes) {
        for (const route of routes) {
            data[route.jsonId] = {
                isOpen: route.isOpen,
                supplyCap: route.supplyCap
            }
        }
    }
    return data;
}

export async function getAllGens(courseSectionId) {
    const gens = await prisma.RefugeeGen.findMany({
        where: {
            courseSectionId
        }
    });
    let data = {};
    if (gens) {
        for (const gen of gens) {
            data[gen.jsonId] = {
                genType: gen.genType,
                totalRefugees: gen.totalRefugees,
                newRefugees: gen.newRefugees,
                food: gen.food,
                healthcare: gen.healthcare,
                admin: gen.admin
            }
        }
    }
    return data;
}


export async function getGen(courseSectionId, jsonId) {
    const gen = await prisma.RefugeeGen.findFirst({
        where: {
            jsonId: jsonId,
            courseSectionId: courseSectionId,
        }
    });
    return gen;
}

export async function updateGen(data, genId) {
    await prisma.RefugeeGen.update({
        where: {
          id: genId,
        },
        data: {
          totalRefugees: parseInt(data.totalRefugees),
          newRefugees: parseInt(data.newRefugees),
          food: parseInt(data.food),
          healthcare: parseInt(data.healthcare),
          admin: parseInt(data.admin),
          genType: data.genType,
        },
      });
}