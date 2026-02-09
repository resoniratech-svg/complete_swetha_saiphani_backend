
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected successfully.');

        const userCount = await prisma.user.count();
        const patientCount = await prisma.patient.count();
        const appointmentCount = await prisma.appointment.count();

        console.log('--- Database Stats ---');
        console.log(`Users: ${userCount}`);
        console.log(`Patients: ${patientCount}`);
        console.log(`Appointments: ${appointmentCount}`);

        // List last 5 patients
        const lastPatients = await prisma.patient.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, firstName: true, phone: true, createdAt: true }
        });
        console.log('--- Last 5 Patients ---');
        console.table(lastPatients);

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
