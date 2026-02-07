
import { PrismaClient } from '@prisma/client';

async function main() {
    // Connect to 'postgres' db to list all databases
    const url = "postgresql://postgres:root@localhost:5432/postgres?schema=public";

    const prisma = new PrismaClient({
        datasources: { db: { url: url } }
    });

    console.log('🔍 INVENTORY OF PORT 5432 🔍');
    console.log('--------------------------------');

    try {
        await prisma.$connect();

        // List Databases
        const dbs: any[] = await prisma.$queryRaw`
            SELECT datname FROM pg_database 
            WHERE datistemplate = false;
        `;

        const dbNames = dbs.map(d => d.datname);
        console.log('📂 DATABASES FOUND:', dbNames);

        await prisma.$disconnect();

        // If strict target db exists, inspect it
        if (dbNames.includes('swetha saiphani database')) {
            console.log('\n--- Inspecting "swetha saiphani database" ---');
            const dbPrisma = new PrismaClient({
                datasources: {
                    db: { url: "postgresql://postgres:root@localhost:5432/swetha%20saiphani%20database?schema=public" }
                }
            });
            await dbPrisma.$connect();

            const tables: any[] = await dbPrisma.$queryRaw`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
             `;

            console.log('📋 TABLES IN "swetha saiphani database":');
            tables.forEach(t => console.log(`   - ${t.table_name}`));

            await dbPrisma.$disconnect();
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
