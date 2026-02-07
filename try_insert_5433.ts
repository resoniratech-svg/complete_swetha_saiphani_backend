
import { PrismaClient } from '@prisma/client';

async function main() {
    // Explicitly targeting port 5433
    const url = "postgresql://postgres:root@localhost:5433/swetha%20saiphani%20database?schema=public";
    console.log(`🔌 Attempting to connect to PORT 5433...`);

    const prisma = new PrismaClient({
        datasources: {
            db: { url: url }
        }
    });

    try {
        await prisma.$connect();
        console.log('✅ CONNECTED to Port 5433!');

        // Check if patient_registration exists here
        const checkTable = await prisma.$queryRaw`
            SELECT count(*) as count FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'patient_registration'
        `;
        console.log('Table check result:', checkTable);

        // Try to create if missing
        try {
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS patient_registration (
                    patient_id SERIAL PRIMARY KEY,
                    uhid VARCHAR(50),
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            console.log('Table ensured.');
        } catch (err) {
            console.log('Table creation warning (might already exist):', err.message.split('\n')[0]);
        }

        // Insert Data
        const timestamp = new Date().toISOString();
        console.log(`Inserting data into 5433...`);

        await prisma.$executeRaw`
            INSERT INTO patient_registration (uhid, first_name, last_name, created_at)
            VALUES 
            ('ID-5433-TEST', 'Port5433', 'User', ${timestamp}::timestamp)
        `;

        console.log('🎉 SUCCESS! Data inserted into PORT 5433.');
        console.log('Please check pgAdmin now. If you see "Port5433 User", then your pgAdmin is using port 5433.');

    } catch (e) {
        console.error('❌ FAILED to connect/write to Port 5433.');
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
