import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getBagels: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.bagel.findMany();
  }),

  putBagel: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        ingredients: z.array(z.enum(["BAGEL", "LETTUCE", "EMPTY"])),
        userId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.bagel.create({
        data: {
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          name: input.name,
          ingredients: input.ingredients,
          user: {
            connect: {
              id: input.userId,
            },
          },
        },
      });
    }),
});
