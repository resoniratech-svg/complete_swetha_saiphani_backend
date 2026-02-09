
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    await prisma.$connect();

    const timestamp = new Date().toISOString();

    // 1. Handle "patients_registration" (Plural) - as requested now
    try {
        console.log('--- Processing "patients_registration" ---');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS patients_registration (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const result1 = await prisma.$executeRaw`
            INSERT INTO patients_registration (name, email, phone, created_at)
            VALUES 
            ('Demo Patient Plural 1', 'demo.plural.1@test.com', '1234567890', ${timestamp}::timestamp),
            ('Demo Patient Plural 2', 'demo.plural.2@test.com', '0987654321', ${timestamp}::timestamp)
        `;
        console.log(`✅ Inserted data into "patients_registration".`);
    } catch (e) {
        console.error('Error with patients_registration:', e);
    }

    // 2. Handle "patient_registration" (Singular) - as requested previously (just in case)
    try {
        console.log('--- Processing "patient_registration" ---');
        // This table should already exist from previous step
        const result2 = await prisma.$executeRaw`
            INSERT INTO patient_registration (uhid, first_name, last_name, gender, age, blood_group)
            VALUES 
            ('UHID-NEW-001', 'Fresh', 'Data', 'Male', 40, 'B+'),
            ('UHID-NEW-002', 'New', 'Entry', 'Female', 28, 'AB+')
        `;
        console.log(`✅ Inserted fresh data into "patient_registration".`);
    } catch (e) {
        // Table might not exist if previous step failed or was reverted, so ignore silent failure here if focusing on plural
        console.log('Note: Could not insert into patient_registration (maybe table missing?): ' + e.message.split('\n')[0]);
    }

    await prisma.$disconnect();
}

main();
