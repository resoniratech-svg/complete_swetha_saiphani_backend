
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const patients = await prisma.patient.findMany({
            include: {
                user: true
            }
        });

        console.log(`Found ${patients.length} patients in database:`);
        console.log(JSON.stringify(patients, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
