import { z } from "zod";

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
        ingredients: z.any(), //z.array(z.enum(["BAGEL", "LETTUCE", "EMPTY"])),
        userId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.bagel.create({
        data: {
          id: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
          name: "Bagel",
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
