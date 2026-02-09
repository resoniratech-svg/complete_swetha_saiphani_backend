
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('⚠ DROPPING ALL TABLES in swetha_saiphani_database...');
    try {
        await prisma.$connect();

        // Disable constraints to allow dropping
        // This is safe for Postgres
        const tables: any[] = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

        if (tables.length === 0) {
            console.log('Database is already empty.');
            return;
        }

        console.log(`Found ${tables.length} tables. Dropping...`);

        // Generate DROP TABLE commands
        for (const t of tables) {
            // Use CASCADE to handle dependencies
            const query = `DROP TABLE IF EXISTS "${t.table_name}" CASCADE;`;
            console.log(`Executing: ${query}`);
            await prisma.$executeRawUnsafe(query);
        }

        console.log('✅ All tables dropped. Database is clean.');

    } catch (e) {
        console.error('Error dropping tables:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
