import { PrismaClient, BetType } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Create Sport: Basketball
  const basketball = await prisma.sport.upsert({
    where: { slug: 'basketball' },
    update: {},
    create: {
      name: 'Basketball',
      slug: 'basketball',
      isActive: true,
    },
  });

  console.log('✓ Created sport: Basketball');

  // 2. Create League: NBA
  const nba = await prisma.league.upsert({
    where: { slug: 'nba' },
    update: {},
    create: {
      sportId: basketball.id,
      name: 'NBA',
      slug: 'nba',
      isActive: true,
    },
  });

  console.log('✓ Created league: NBA');

  // 3. Create Chat Rooms
  const chatRooms = [
    { name: 'NBA General', slug: 'nba-general' },
    { name: 'NBA Eastern Conference', slug: 'nba-eastern' },
    { name: 'NBA Western Conference', slug: 'nba-western' },
  ];

  for (const room of chatRooms) {
    await prisma.chatRoom.upsert({
      where: { slug: room.slug },
      update: {},
      create: {
        leagueId: nba.id,
        name: room.name,
        slug: room.slug,
        isActive: true,
      },
    });
  }

  console.log(`✓ Created ${chatRooms.length} chat rooms`);

  // 4. Create BetTypeConfig with multipliers
  const betTypeConfigs = [
    // Full Game - Basic
    { betType: 'MONEYLINE_HOME', baseMultiplier: 1.8, description: 'Home team wins' },
    { betType: 'MONEYLINE_AWAY', baseMultiplier: 1.8, description: 'Away team wins' },
    { betType: 'SPREAD_HOME', baseMultiplier: 1.5, description: 'Home team covers spread' },
    { betType: 'SPREAD_AWAY', baseMultiplier: 1.5, description: 'Away team covers spread' },
    { betType: 'OVER_TOTAL', baseMultiplier: 1.3, description: 'Total points over line' },
    { betType: 'UNDER_TOTAL', baseMultiplier: 1.3, description: 'Total points under line' },
    
    // Full Game - Team Totals
    { betType: 'TEAM_TOTAL_OVER_HOME', baseMultiplier: 1.4, description: 'Home team total over' },
    { betType: 'TEAM_TOTAL_UNDER_HOME', baseMultiplier: 1.4, description: 'Home team total under' },
    { betType: 'TEAM_TOTAL_OVER_AWAY', baseMultiplier: 1.4, description: 'Away team total over' },
    { betType: 'TEAM_TOTAL_UNDER_AWAY', baseMultiplier: 1.4, description: 'Away team total under' },
    
    // Quarter Betting
    { betType: 'QUARTER_WINNER_HOME', baseMultiplier: 2.0, description: 'Home team wins quarter' },
    { betType: 'QUARTER_WINNER_AWAY', baseMultiplier: 2.0, description: 'Away team wins quarter' },
    { betType: 'QUARTER_OVER', baseMultiplier: 1.6, description: 'Quarter total over' },
    { betType: 'QUARTER_UNDER', baseMultiplier: 1.6, description: 'Quarter total under' },
    { betType: 'TEAM_QUARTER_OVER_HOME', baseMultiplier: 1.7, description: 'Home team quarter over' },
    { betType: 'TEAM_QUARTER_UNDER_HOME', baseMultiplier: 1.7, description: 'Home team quarter under' },
    { betType: 'TEAM_QUARTER_OVER_AWAY', baseMultiplier: 1.7, description: 'Away team quarter over' },
    { betType: 'TEAM_QUARTER_UNDER_AWAY', baseMultiplier: 1.7, description: 'Away team quarter under' },
    
    // Half Betting
    { betType: 'FIRST_HALF_WINNER_HOME', baseMultiplier: 1.9, description: 'Home team wins 1st half' },
    { betType: 'FIRST_HALF_WINNER_AWAY', baseMultiplier: 1.9, description: 'Away team wins 1st half' },
    { betType: 'FIRST_HALF_OVER', baseMultiplier: 1.4, description: '1st half total over' },
    { betType: 'FIRST_HALF_UNDER', baseMultiplier: 1.4, description: '1st half total under' },
    { betType: 'SECOND_HALF_WINNER_HOME', baseMultiplier: 1.9, description: 'Home team wins 2nd half' },
    { betType: 'SECOND_HALF_WINNER_AWAY', baseMultiplier: 1.9, description: 'Away team wins 2nd half' },
    { betType: 'SECOND_HALF_OVER', baseMultiplier: 1.4, description: '2nd half total over' },
    { betType: 'SECOND_HALF_UNDER', baseMultiplier: 1.4, description: '2nd half total under' },
    
    // Special Bets
    { betType: 'OVERTIME_YES', baseMultiplier: 3.0, description: 'Game goes to overtime' },
    { betType: 'OVERTIME_NO', baseMultiplier: 1.2, description: 'No overtime' },
    { betType: 'HIGHEST_QUARTER', baseMultiplier: 4.0, description: 'Predict highest scoring quarter' },
    { betType: 'ALL_QUARTERS_SAME_WINNER', baseMultiplier: 5.0, description: 'Same team wins all quarters' },
  ];

  for (const config of betTypeConfigs) {
    await prisma.betTypeConfig.upsert({
      where: { betType: config.betType as BetType },
      update: {},
      create: {
        betType: config.betType as BetType,
        baseMultiplier: config.baseMultiplier,
        description: config.description,
        isActive: true,
      },
    });
  }

  console.log(`✓ Created ${betTypeConfigs.length} bet type configurations`);

  console.log('\n Database seeded successfully!');
  console.log('\nSummary:');
  console.log('- 1 Sport (Basketball)');
  console.log('- 1 League (NBA)');
  console.log('- 3 Chat Rooms');
  console.log('- 33 Bet Type Configurations');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
  });

