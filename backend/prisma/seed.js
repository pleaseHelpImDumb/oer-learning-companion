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
      iconUrl: `/assets/tracks/default/sports.png`,
    },
    {
      name: "7 Day Streak",
      description: "Study 7 days in a row",
      category: "STREAK",
      iconUrl: `/assets/tracks/default/sports.png`,
    },
    {
      name: "10 Sessions",
      description: "Complete 10 study sessions",
      category: "TOTAL_SESSIONS",
      iconUrl: `/assets/tracks/default/sports.png`,
    },
    {
      name: "25 Sessions",
      description: "Complete 25 study sessions",
      category: "TOTAL_SESSIONS",
      iconUrl: `/assets/tracks/default/sports.png`,
    },
    {
      name: "First Goal",
      description: "Complete your first study goal",
      category: "MILESTONE",
      iconUrl: `/assets/tracks/default/sports.png`,
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
      trackId: 1,
      name: "Sports",
      description: "Sports-inspired theme",
      iconUrl: `/assets/tracks/default/sports.png`,
    },
    {
      trackId: 2,
      name: "Gaming",
      description: "Gaming-inspired theme",
      iconUrl: `/assets/tracks/default/games.png`,
    },
    {
      trackId: 3,
      name: "Art",
      description: "Art-inspired theme",
      iconUrl: `/assets/tracks/default/art.png`,
    },
    {
      trackId: 4,
      name: "Pets",
      description: "Pet-inspired theme",
      iconUrl: `/assets/tracks/default/pets.png`,
    },
    {
      trackId: 5,
      name: "Space",
      description: "Space exploration theme",
      iconUrl: `/assets/tracks/default/space.png`,
    },
    {
      trackId: 6,
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
