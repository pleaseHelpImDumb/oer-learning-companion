import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Add Badges
  await prisma.badge.createMany({
    data: [
      {
        name: "3 Day Streak",
        description: "Study 3 days in a row",
        type: "STREAK",
        threshold: 3,
      },
      {
        name: "10 Sessions",
        description: "Complete 10 sessions",
        type: "TOTAL_SESSIONS",
        threshold: 10,
      },
    ],
    skipDuplicates: true,
  });

  // Add Tracks
  await prisma.hobbyTrack.createMany({
    data: [
      { name: "Gamer", description: "Gamified experience theme" },
      { name: "Athlete", description: "Sports-inspired theme" },
      { name: "Scholar", description: "Academic-focused theme" },
    ],
    skipDuplicates: true,
  });
}

main();
