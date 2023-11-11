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
                refugueesPresent: camp.refugueesPresent
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
