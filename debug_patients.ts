
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching patients...');
    const patients = await prisma.patient.findMany({
        select: {
            id: true,
            uhid: true,
            firstName: true,
            lastName: true
        }
    });

    console.log('--- PATIENTS LIST ---');
    if (patients.length === 0) {
        console.log('No patients found in database.');
    } else {
        console.table(patients);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
