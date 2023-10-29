import { prisma } from "../server/db/client";

export default function get_camp_stats() {
    let stats = {foodLevel: 10,
                 healthcareLevel: 5,
                 housingLevel: 5,
                 administrationLevel: 3};
    return stats;
    // let stats = await prisma.RefugeeCamp.findUnique({
    //     select: {
    //         foodLevel: true,
    //         housingLevel: true,
    //         administrationLevel: true,
    //     },
    //     where: {
    //         id: campId,
    //         quizId 
    //     }
    // });
    // return stats;
}