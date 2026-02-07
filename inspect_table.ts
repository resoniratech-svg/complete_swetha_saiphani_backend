
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting...');
        await prisma.$connect();

        // Check if table exists
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'patient_registration'
    `;
        console.log('Table exists check:', tables);

        if (Array.isArray(tables) && tables.length > 0) {
            // Get columns
            const columns = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'patient_registration'
        `;
            console.log('Columns:', columns);
        } else {
            console.log('❌ Table "patient_registration" does not exist in this database.');
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
