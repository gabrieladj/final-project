import { prisma } from "../server/db/client";

export  async function getAllCampStats() {
    const stats = await prisma.DeployableRegion.findMany();

    // parse it into object with key being the camp id
    // that way we dont have to search for the right one on the client
    let data = {};
    if (stats) {
        for (const camp of stats) {
            data[camp.id] = {
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

export async function getAllRoutes() {
    const routes = await prisma.Route.findMany();
    let data = {};
    if (routes) {
        for (const route of routes) {
            data[route.id] = {
                isOpen: route.isOpen
            }
        }
    }
    return data;
}

export async function getAllGens() {
    const gens = await prisma.RefugeeGen.findMany();
    let data = {};
    if (gens) {
        for (const gen of gens) {
            data[gen.id] = {
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
