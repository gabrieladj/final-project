import { prisma } from "../server/db/client";

export  async function get_all_camp_stats() {
    let stats = await prisma.RefugeeCamp.findMany({
        select: {
            id: true,
            foodLevel: true,
            housingLevel: true,
            administrationLevel: true,
            healthcareLevel: true
        },
    });
    return stats;
}

export  function get_camp_stats() {
    let stats = {foodLevel: 100,
                 healthcareLevel: 5,
                 housingLevel: 5,
                 administrationLevel: 3};
    return stats;
}