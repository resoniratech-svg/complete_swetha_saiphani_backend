
import { prisma } from './src/config/database';

async function main() {
    try {
        console.log('Fetching all patients...');
        const patients = await prisma.patient.findMany({ select: { id: true, firstName: true, userId: true, uhid: true } });
        console.log('Patients:', JSON.stringify(patients, null, 2));

        console.log('\nFetching all medical records...');
        const records = await prisma.medicalRecord.findMany({
            include: { patient: { select: { firstName: true } } }
        });
        console.log('Medical Records:', JSON.stringify(records, null, 2));

        if (patients.length > 0) {
            const samplePatient = patients[0];
            console.log(`\nChecking records specifically for patient ${samplePatient.firstName} (ID: ${samplePatient.id})...`);
            const patientRecords = await prisma.medicalRecord.findMany({
                where: { patientId: samplePatient.id }
            });
            console.log(`Found ${patientRecords.length} records for this patient.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
