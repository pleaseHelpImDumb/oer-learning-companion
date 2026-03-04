const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Badges
  const badges = [
    {
      name: "3 Day Streak",
      description: "Study 3 days in a row",
      category: "STREAK",
    },
    {
      name: "7 Day Streak",
      description: "Study 7 days in a row",
      category: "STREAK",
    },
    {
      name: "10 Sessions",
      description: "Complete 10 study sessions",
      category: "TOTAL_SESSIONS",
    },
    {
      name: "25 Sessions",
      description: "Complete 25 study sessions",
      category: "TOTAL_SESSIONS",
    },
    {
      name: "First Goal",
      description: "Complete your first study goal",
      category: "MILESTONE",
    },
  ];

  // Delete existing (optional - if you want clean slate)
  await prisma.badge.deleteMany({});

  // Create all badges in one transaction
  const badgeResult = await prisma.badge.createMany({
    data: badges,
  });
  console.log(`Created ${badgeResult.count} badges`);

  // Seed Hobby Tracks
  const tracks = [
    { name: "Sports", description: "Sports-inspired theme" },
    { name: "Gaming", description: "Gaming-inspired theme" },
    { name: "Art", description: "Art-inspired theme" },
    { name: "Pets", description: "Pet-inspired theme" },
    { name: "Space", description: "Space exploration theme" },
    { name: "Music", description: "Music-focused theme" },
  ];

  // Delete existing
  await prisma.hobbyTrack.deleteMany({});

  // Create all tracks in one transaction
  const trackResult = await prisma.hobbyTrack.createMany({
    data: tracks,
  });
  console.log(`Created ${trackResult.count} hobby tracks`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
