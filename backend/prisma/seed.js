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
    {
      name: "Sports",
      description: "Sports-inspired theme",
      iconUrl: `/assets/tracks/default/sports.png`,
    },
    {
      name: "Gaming",
      description: "Gaming-inspired theme",
      iconUrl: `/assets/tracks/default/games.png`,
    },
    {
      name: "Art",
      description: "Art-inspired theme",
      iconUrl: `/assets/tracks/default/art.png`,
    },
    {
      name: "Pets",
      description: "Pet-inspired theme",
      iconUrl: `/assets/tracks/default/pets.png`,
    },
    {
      name: "Space",
      description: "Space exploration theme",
      iconUrl: `/assets/tracks/default/space.png`,
    },
    {
      name: "Music",
      description: "Music-focused theme",
      iconUrl: `/assets/tracks/default/music.png`,
    },
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
