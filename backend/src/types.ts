import z from "zod";

export const createTaskInput = z.object({
    options: z.array(z.object({
        imageUrl: z.string()
    })).min(2),
    title: z.string().optional(),
    signature: z.string()
});

export const createSubmissionInput = z.object({
    taskId: z.string(),
    selection: z.string(),
});
export const signingBitArray = z.object({
    signature: z.object({
        type: z.string(),
        data: z.array(z.number())
    }),
    publicKey: z.string(),
});