import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
const yest = new Date();
yest.setHours(0, 0, 0, 0);
yest.setDate(yest.getDate() - 50);

const createRandomMessage = () => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    message: faker.food.description(),
    createdAt: yest,
  };
};

const messages = faker.helpers.multiple(createRandomMessage, {
  count: 50,
});

await prisma.message.createMany({
  data: messages,
  skipDuplicates: true,
});

// await prisma.message.deleteMany({
//   where: {
//     createdAt: { gte: yest },
//   },
// });
