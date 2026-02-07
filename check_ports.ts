
import { PrismaClient } from '@prisma/client';

async function checkPort(port: number) {
    const url = `postgresql://postgres:root@localhost:${port}/swetha%20saiphani%20database?schema=public`;
    console.log(`Checking port ${port}...`);

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });

    try {
        await prisma.$connect();
        console.log(`✅ Success connecting to port ${port}`);

        // Check for patient_registration table
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'patient_registration'
        `;
        console.log(`   Table 'patient_registration' found on port ${port}:`, tables);

        await prisma.$disconnect();
        return true;
    } catch (e) {
        console.log(`❌ Failed connecting to port ${port}: ${e.message.split('\n')[0]}`);
        return false;
    }
}

async function main() {
    await checkPort(5432);
    await checkPort(5433);
    await checkPort(5434);
}

main();
