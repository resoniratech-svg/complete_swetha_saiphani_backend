
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPatientData(email: string) {
    console.log(`--- Debugging Data for Email: ${email} ---`);

    // 1. Find all patients with this email
    const patients = await prisma.patient.findMany({
        where: { email: email },
        include: {
            user: true
        }
    });

    console.log(`Found ${patients.length} patient profile(s) for this email.`);

    if (patients.length === 0) {
        console.log("No patients found. Checking if records exist without email but with similar name?");
        return;
    }

    const patientIds = patients.map(p => p.id);
    console.log("Patient IDs:", patientIds);

    // 2. Check strict prescriptions for each ID
    for (const p of patients) {
        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: p.id }
        });
        const bills = await prisma.bill.findMany({
            where: { patientId: p.id }
        });
        const medicalRecords = await prisma.medicalRecord.findMany({
            where: { patientId: p.id }
        });

        console.log(`\nProfile: ${p.firstName} ${p.lastName} (ID: ${p.id})`);
        console.log(`   - Linked User ID: ${p.userId || 'None (Orphan)'}`);
        console.log(`   - Prescriptions: ${prescriptions.length}`);
        console.log(`   - Bills: ${bills.length}`);
        console.log(`   - Medical Records: ${medicalRecords.length}`);
    }

    // 3. Check "Smart Link" Query (what the endpoint does now)
    console.log(`\n--- Testing Smart Link Query ---`);
    const allPrescriptions = await prisma.prescription.findMany({
        where: { patientId: { in: patientIds } }
    });
    console.log(`Total Prescriptions found via Smart Link: ${allPrescriptions.length}`);
}

debugPatientData('abhi123@gmail.com')
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
