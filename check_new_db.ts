
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        console.log('Checking for tables...');
        // query raw sql to check for tables in public schema
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        console.log('Tables found:', tables);

        const userCount = await prisma.user.count();
        console.log(`Found ${userCount} users.`);

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
}

main();
