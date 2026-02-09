
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    await prisma.$connect();

    console.log('Creating "patient_registration" table directly...');
    // Create the table to match the user's expectation (inferring columns from screenshot essentially, or generic)
    // Screenshot showed columns: patient_id, uhid, title, first_name, last_name, gender, age, blood_group

    try {
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS patient_registration (
                patient_id SERIAL PRIMARY KEY,
                uhid VARCHAR(50),
                title VARCHAR(20),
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                gender VARCHAR(20),
                age INTEGER,
                blood_group VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('✅ Table "patient_registration" created (or already exists).');

        console.log('Inserting demo data into "patient_registration"...');
        const count = await prisma.$executeRaw`
            INSERT INTO patient_registration (uhid, title, first_name, last_name, gender, age, blood_group)
            VALUES 
            ('UHID-DEMO-001', 'Mr.', 'Demo', 'Patient', 'Male', 30, 'O+'),
            ('UHID-DEMO-002', 'Ms.', 'Test', 'User', 'Female', 25, 'A+')
        `;
        console.log(`✅ inserted records into patient_registration.`);

    } catch (e) {
        console.error('Error executing raw SQL:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
