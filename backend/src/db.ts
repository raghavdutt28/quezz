import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

export const getNextTask = async (workerId: number) => {
    const task = await prismaClient.task.findFirst({
        where: {
            submissions: {
                none: {
                    worker_id: workerId,
                }
            },
        },
        select: {
            amount: true,
            id: true,
            title: true,
            options: true
        }
    })
    return task
}