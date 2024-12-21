import { PrismaClient } from "@prisma/client";

export const createPrismaClient = () => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "",
      },
    },
  });
  return prisma;
};
