import { prisma } from "../server/db/client";

// boolean for if the student has already submitted this quiz
export async function courseSectionExists(classId) {
    let count = await prisma.CourseSection.count({
        where: {
             id: classId,
         }
    });

    return (count !== 0);
}

export async function courseSectionName(classId) {
    const courseSection = await prisma.CourseSection.findUnique({
        where: {
             id: classId,
         }
    });

    return courseSection.name;
}

export async function courseSectionDescription(classId) {
    const courseSection = await prisma.CourseSection.findUnique({
        where: {
             id: classId,
         }
    });

    return courseSection.description;
}

export async function getAllCourseSections(classId) {
    const list = await prisma.CourseSection.findMany({
        where: {
             id: classId,
         }
    });

    return list;
}