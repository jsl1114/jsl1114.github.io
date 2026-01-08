import prisma from "../server/lib/prisma.js";

async function main() {
  const messages = [
    {
      name: "Alice Wonderland",
      email: "alice@example.com",
      message: "Hello! I love your website. The design is fantastic!",
    },
    {
      name: "Bob Builder",
      email: "bob@construction.com",
      message: "Can you help me build a website like this? Reach out!",
    },
    {
      name: "Charlie Chaplin",
      email: "charlie@movies.com",
      message: "Just wanted to say hi. Keep up the good work.",
    },
    {
      name: "David Developer",
      email: "dave@code.org",
      message: "I found a small bug in your footer, but otherwise great job!",
    },
    {
      name: "Eve Explorer",
      email: "eve@internet.net",
      message: "Greetings from across the globe! Nice portfolio.",
    },
  ];

  console.log("Start seeding...");

  try {
    for (const msg of messages) {
      // Create message
      const createdMessage = await prisma.message.create({
        data: msg,
      });
      console.log(`Created message with id: ${createdMessage.id}`);
    }
  } catch (e) {
    console.error(
      "Error during seeding (likely connection issue or schema mismatch):",
      e,
    );
    throw e;
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
